// Server-only YouTube Data API access with a shared in-memory cache.
// Cache entries are keyed per channel / search query + window / video id, so every
// user following the same group, member or CP reuses the same results.
import { ARTISTS, uploadsPlaylist, type Artist } from "./artists";
import {
  buildQueries,
  rankFeed,
  type FeedQuery,
  type FeedRequest,
  type FeedResponse,
  type RawVideo,
  type Stats,
} from "./feed";

const API = "https://www.googleapis.com/youtube/v3";
const MIN = 60_000;
const TTL = { uploads: 15 * MIN, search: 60 * MIN, stats: 30 * MIN, images: 24 * 60 * MIN };

interface Entry<T> {
  value: T;
  fetchedAt: number;
}
const cache = new Map<string, Entry<unknown>>();
export const clearYouTubeCache = () => cache.clear();

type Failure = "quota" | "forbidden" | "unavailable";
class YouTubeError extends Error {
  constructor(readonly kind: Failure) {
    super(kind);
  }
}

const FAILURE_NOTICE: Record<Failure, string> = {
  quota: "YouTube's daily API quota is used up.",
  forbidden:
    "YouTube refused the request. Check that YouTube Data API v3 is enabled and the key allows it.",
  unavailable: "YouTube is temporarily unavailable.",
};

async function ytGet<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
  fetcher: typeof fetch,
): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(`${API}/${path}?${new URLSearchParams(params)}`, {
      headers: { "X-Goog-Api-Key": apiKey },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new YouTubeError("unavailable");
  }
  if (response.ok) return (await response.json()) as T;
  // Never log provider bodies or URLs: they can echo credentials. Only read the reason code.
  console.error("YouTube request failed", path, response.status);
  if (response.status === 403) {
    const reason = await response.json().then(
      (b: { error?: { errors?: { reason?: string }[] } }) => b.error?.errors?.[0]?.reason,
      () => undefined,
    );
    throw new YouTubeError(
      reason === "quotaExceeded" ||
        reason === "dailyLimitExceeded" ||
        reason === "rateLimitExceeded"
        ? "quota"
        : "forbidden",
    );
  }
  throw new YouTubeError("unavailable");
}

/** Fresh cache hit, else fetch; on failure fall back to a stale entry if one exists. */
async function cached<T>(
  key: string,
  ttl: number,
  now: number,
  load: () => Promise<T>,
): Promise<{ value: T; fetchedAt: number; stale: Failure | null }> {
  const hit = cache.get(key) as Entry<T> | undefined;
  if (hit && now - hit.fetchedAt < ttl) return { ...hit, stale: null };
  try {
    const value = await load();
    cache.set(key, { value, fetchedAt: now });
    return { value, fetchedAt: now, stale: null };
  } catch (error) {
    if (hit && error instanceof YouTubeError) return { ...hit, stale: error.kind };
    throw error;
  }
}

const VIDEO_ID = /^[\w-]{11}$/;
const thumb = (t?: Thumbnails) => t?.medium?.url ?? t?.high?.url ?? t?.default?.url ?? null;

type Thumbnails = Partial<Record<"default" | "medium" | "high", { url?: string }>>;

interface Snippet {
  title?: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnails?: Thumbnails;
}

async function fetchUploads(
  channel: { id: string; name: string },
  apiKey: string,
  fetcher: typeof fetch,
): Promise<RawVideo[]> {
  const data = await ytGet<{
    items?: {
      snippet?: Snippet;
      contentDetails?: { videoId?: string; videoPublishedAt?: string };
    }[];
  }>(
    "playlistItems",
    { part: "snippet,contentDetails", playlistId: uploadsPlaylist(channel.id), maxResults: "50" },
    apiKey,
    fetcher,
  );
  return (data.items ?? []).flatMap((item) => {
    const id = item.contentDetails?.videoId;
    const published = item.contentDetails?.videoPublishedAt;
    const title = item.snippet?.title;
    if (
      !id ||
      !VIDEO_ID.test(id) ||
      !published ||
      !title ||
      title === "Private video" ||
      title === "Deleted video"
    )
      return [];
    return [
      {
        video_id: id,
        title,
        description: item.snippet?.description ?? "",
        channel_id: channel.id,
        channel_title: channel.name,
        published_at: published,
        thumbnail_url: thumb(item.snippet?.thumbnails),
        matched_search_query: null,
      },
    ];
  });
}

async function fetchSearch(
  query: FeedQuery,
  days: number,
  now: number,
  apiKey: string,
  fetcher: typeof fetch,
): Promise<RawVideo[]> {
  // Round to the hour so the publishedAfter value is stable for the cache lifetime.
  const after = new Date(
    Math.floor((now - days * 86_400_000) / (60 * MIN)) * 60 * MIN,
  ).toISOString();
  const data = await ytGet<{ items?: { id?: { videoId?: string }; snippet?: Snippet }[] }>(
    "search",
    {
      part: "snippet",
      type: "video",
      q: query.q,
      publishedAfter: after,
      // Buzz looks for what's getting watched; member/CP searches want the best match.
      order: query.category === "buzz" ? "viewCount" : "relevance",
      maxResults: "25",
      safeSearch: "moderate",
    },
    apiKey,
    fetcher,
  );
  return (data.items ?? []).flatMap((item) => {
    const id = item.id?.videoId;
    const s = item.snippet;
    if (!id || !VIDEO_ID.test(id) || !s?.title || !s.channelId || !s.publishedAt) return [];
    return [
      {
        video_id: id,
        title: decode(s.title),
        description: decode(s.description ?? ""),
        channel_id: s.channelId,
        channel_title: decode(s.channelTitle ?? ""),
        published_at: s.publishedAt,
        thumbnail_url: thumb(s.thumbnails),
        matched_search_query: query.q,
      },
    ];
  });
}

// search.list returns HTML-escaped snippets.
const decode = (s: string) =>
  s.replace(
    /&(amp|lt|gt|quot|#39);/g,
    (_, e: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[e]!,
  );

const num = (v?: string) => (v == null || !/^\d+$/.test(v) ? null : Number(v));

/** Engagement stats, cached per video and fetched in batches of 50 (1 quota unit per batch). */
async function fetchStats(ids: string[], now: number, apiKey: string, fetcher: typeof fetch) {
  const out = new Map<string, Stats>();
  const missing: string[] = [];
  for (const id of ids) {
    const hit = cache.get(`stats|${id}`) as Entry<Stats> | undefined;
    if (hit && now - hit.fetchedAt < TTL.stats) out.set(id, hit.value);
    else missing.push(id);
  }
  let failure: Failure | null = null;
  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50);
    try {
      const data = await ytGet<{
        items?: {
          id?: string;
          statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
        }[];
      }>("videos", { part: "statistics", id: batch.join(","), maxResults: "50" }, apiKey, fetcher);
      for (const item of data.items ?? []) {
        if (!item.id) continue;
        const s = item.statistics ?? {};
        const stats = {
          view_count: num(s.viewCount),
          like_count: num(s.likeCount),
          comment_count: num(s.commentCount),
        };
        cache.set(`stats|${item.id}`, { value: stats, fetchedAt: now });
        out.set(item.id, stats);
      }
    } catch (error) {
      failure = error instanceof YouTubeError ? error.kind : "unavailable";
      // Stale stats beat no stats; never invent numbers.
      for (const id of batch) {
        const hit = cache.get(`stats|${id}`) as Entry<Stats> | undefined;
        if (hit) out.set(id, hit.value);
      }
    }
  }
  return { stats: out, failure };
}

export async function buildFeed(
  artist: Artist,
  req: FeedRequest,
  apiKey: string,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<FeedResponse> {
  const queries = buildQueries(artist, req);
  const channels = [...artist.official_youtube_channel_ids, ...artist.relevant_agency_channel_ids];
  const tasks = [
    ...channels.map((c) =>
      cached(`uploads|${c.id}`, TTL.uploads, now, () => fetchUploads(c, apiKey, fetcher)),
    ),
    ...queries.map((q) =>
      cached(`search|${req.days}|${q.q}|${q.category}`, TTL.search, now, () =>
        fetchSearch(q, req.days, now, apiKey, fetcher),
      ),
    ),
  ];
  // Channel uploads come first so a video also found by search keeps its official identity when deduped.
  const results = await Promise.allSettled(tasks);

  const failures = new Set<Failure>();
  const raw: RawVideo[] = [];
  let updatedAt = 0;
  let servedFromCache = false;
  let succeeded = 0;
  for (const r of results) {
    if (r.status === "rejected") {
      failures.add(r.reason instanceof YouTubeError ? r.reason.kind : "unavailable");
      continue;
    }
    succeeded++;
    raw.push(...r.value.value);
    updatedAt = Math.max(updatedAt, r.value.fetchedAt);
    if (r.value.fetchedAt < now) servedFromCache = true;
    if (r.value.stale) {
      failures.add(r.value.stale);
    }
  }
  const { stats, failure } = await fetchStats(
    [...new Set(raw.map((v) => v.video_id))],
    now,
    apiKey,
    fetcher,
  );
  if (failure) failures.add(failure);

  const notices: string[] = [];
  for (const f of failures) notices.push(FAILURE_NOTICE[f]);
  if (failures.size && succeeded)
    notices.push(
      "Showing the most recent results we could load; some may come from an earlier fetch.",
    );
  if (failure) notices.push("Some view and comment counts couldn't be refreshed.");
  if (!artist.official_youtube_channel_ids.length)
    notices.push(`No verified official YouTube channel is configured for ${artist.group_name}.`);

  return {
    status: !succeeded ? "unavailable" : failures.size ? "partial" : "ok",
    group_id: artist.group_id,
    days: req.days,
    support: artist.demo_support_status,
    sections: rankFeed(artist, req, raw, stats, now),
    queries,
    notices,
    updated_at: updatedAt ? new Date(updatedAt).toISOString() : null,
    served_from_cache: servedFromCache,
  };
}

/** Official channel avatars for the onboarding cards (1 quota unit, cached for a day). */
export async function fetchGroupImages(
  apiKey: string,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
) {
  const ids = ARTISTS.flatMap((a) => a.official_youtube_channel_ids.slice(0, 1).map((c) => c.id));
  const { value } = await cached("images", TTL.images, now, async () => {
    const data = await ytGet<{ items?: { id?: string; snippet?: Snippet }[] }>(
      "channels",
      { part: "snippet", id: ids.join(",") },
      apiKey,
      fetcher,
    );
    const byChannel = new Map(
      (data.items ?? []).map((i) => [
        i.id,
        i.snippet?.thumbnails?.high?.url ?? i.snippet?.thumbnails?.medium?.url ?? null,
      ]),
    );
    return Object.fromEntries(
      ARTISTS.map((a) => [
        a.group_id,
        byChannel.get(a.official_youtube_channel_ids[0]?.id) ?? null,
      ]),
    ) as Record<string, string | null>;
  });
  return value;
}
