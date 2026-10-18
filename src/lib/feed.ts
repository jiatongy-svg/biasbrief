// Personalized YouTube feed: query planning, matching, ranking and sectioning.
// Pure functions only — network and caching live in feed.server.ts.
import {
  getMember,
  pairingLabel,
  resolvePairing,
  type Artist,
  type DemoSupport,
  type Member,
  type Pairing,
} from "./artists";
import { INTERESTS, STAN_TYPES, type StanType } from "./data";

export const WINDOWS = [7, 14] as const;
export type FeedWindow = (typeof WINDOWS)[number];
export type SourceType = "official" | "fan-created" | "unknown";
export type Section = "official" | "bias" | "cp" | "buzz";
export type QueryCategory = "member" | "cp" | "buzz";

export interface FeedRequest {
  group: string;
  members: string[];
  cps: string[];
  stanType: StanType;
  interests: string[];
  days: FeedWindow;
}

export interface FeedQuery {
  category: QueryCategory;
  q: string;
  memberId?: string;
  pairingId?: string;
}

/** A video as discovered, before engagement stats are attached. */
export interface RawVideo {
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  thumbnail_url: string | null;
  matched_search_query: string | null;
}

export interface Stats {
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
}

export interface FeedVideo extends RawVideo, Stats {
  video_url: string;
  source_type: SourceType;
  /** "artist" = the group's own channel, "agency" = label channel whose title names the group. */
  official_kind: "artist" | "agency" | null;
  matched_group: string | null;
  matched_members: string[];
  matched_cp_pairing: string | null;
  section: Section;
  score: number;
  score_breakdown: { relevance: number; recency: number; engagement: number | null };
  reason: string;
}

export type FeedStatus = "ok" | "partial" | "unavailable" | "not_configured";

export interface FeedResponse {
  status: FeedStatus;
  group_id: string;
  days: FeedWindow;
  support: DemoSupport;
  sections: Record<Section, FeedVideo[]>;
  queries: FeedQuery[];
  notices: string[];
  /** ISO time of the newest successful YouTube fetch behind this feed. */
  updated_at: string | null;
  served_from_cache: boolean;
}

export const SECTION_LIMITS: Record<Section, number> = { official: 8, bias: 8, cp: 6, buzz: 8 };

export function normalizeRequest(input: unknown, artist: Artist): FeedRequest {
  const r = (input ?? {}) as Partial<Record<keyof FeedRequest, unknown>>;
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    group: artist.group_id,
    members: list(r.members)
      .filter((id) => getMember(artist, id))
      .slice(0, 4),
    cps: list(r.cps)
      .map((id) => resolvePairing(artist, id)?.id)
      .filter((id): id is string => !!id)
      .slice(0, 3),
    stanType: STAN_TYPES.includes(r.stanType as StanType) ? (r.stanType as StanType) : "Group stan",
    interests: list(r.interests).filter((id) => INTERESTS.some((i) => i.id === id)),
    days: r.days === 14 ? 14 : 7,
  };
}

/**
 * Search queries for a request. Kept small on purpose: each search.list call costs
 * 100 quota units (of 10,000/day by default), so terms are OR-ed with "|".
 * Groups without full demo support only get one group-level buzz search.
 */
export function buildQueries(artist: Artist, req: FeedRequest): FeedQuery[] {
  const g = artist.group_name;
  const interestTerms = INTERESTS.filter((i) => req.interests.includes(i.id)).flatMap(
    (i) => i.terms,
  );
  const buzzTerms = interestTerms.length
    ? interestTerms
    : ["fancam", "reaction", "edit", "dance cover"];
  const buzz: FeedQuery = { category: "buzz", q: `${g} ${buzzTerms.join("|")}` };
  if (artist.demo_support_status !== "full") return [buzz];

  const queries: FeedQuery[] = [];
  req.members.slice(0, 2).forEach((id, index) => {
    const member = getMember(artist, id)!;
    queries.push({
      category: "member",
      memberId: id,
      q: `${g} ${member.stage_name}|${artist.korean_name} ${member.korean_name}`,
    });
    if (index === 0 && req.stanType === "Solo stan") {
      queries.push({
        category: "member",
        memberId: id,
        q: `${g} ${member.stage_name} fancam|interview|edit|funny moments`,
      });
    }
  });
  req.cps.slice(0, 2).forEach((id, index) => {
    const p = resolvePairing(artist, id)!;
    const [a, b] = p.members.map((mid) => getMember(artist, mid)!) as [Member, Member];
    if (p.name)
      queries.push({
        category: "cp",
        pairingId: p.id,
        q: `${p.name}|${a.stage_name} ${b.stage_name} ${g}`,
      });
    if (!p.name || index === 0) {
      queries.push({
        category: "cp",
        pairingId: p.id,
        q: `${g} ${a.stage_name} ${b.stage_name}|${a.korean_name} ${b.korean_name} moments|edit|compilation|interaction`,
      });
    }
  });
  queries.push(buzz);
  return queries;
}

const LATIN = /^[\x20-\x7eÀ-ɏ]+$/;

/** Case-insensitive term match; Latin terms need word boundaries so "Han" doesn't match "Hanbok". */
export function mentions(text: string, term: string) {
  if (!term) return false;
  if (!LATIN.test(term)) return term.length >= 2 && text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(text);
}

const memberTerms = (artist: Artist, id: string) => {
  const member = getMember(artist, id)!;
  return [member.stage_name, member.korean_name, ...member.aliases];
};

// Signals that a non-official upload is fan-made. "fancam"/"직캠" is deliberately
// absent: broadcasters publish fancams too, so those stay "unknown".
const FAN_MARKERS =
  /\b(edit|fmv|fanmade|fan[- ]made|reaction|reacts?|reacting|dance cover|cover dance|compilation|moments|analysis|ship|ft\. ?fans?)\b|교차편집|리액션/i;

export function classify(artist: Artist, video: RawVideo, req: FeedRequest) {
  const isArtist = artist.official_youtube_channel_ids.some((c) => c.id === video.channel_id);
  const isAgency = artist.relevant_agency_channel_ids.some((c) => c.id === video.channel_id);
  const text = `${video.title}\n${video.description}`;
  const titleNamesGroup = artist.group_aliases.some((a) => mentions(video.title, a));
  const textNamesGroup =
    titleNamesGroup ||
    artist.group_aliases.some((a) => mentions(`${text}\n${video.channel_title}`, a));
  const named = (s: string) =>
    artist.members
      .filter((x) => memberTerms(artist, x.id).some((t) => mentions(s, t)))
      .map((x) => x.id);
  const inTitle = named(video.title);
  const inDescription = named(video.description);
  // A description tagging 3+ members is usually a hashtag roll call, not a sign the video is about them.
  const matched_members =
    inDescription.length >= 3 ? inTitle : [...new Set([...inTitle, ...inDescription])];
  // A pairing needs its CP name, or exactly those two members named in the title.
  const pairing = req.cps
    .map((id) => resolvePairing(artist, id)!)
    .find(
      (p) =>
        (p.name && mentions(text, p.name)) ||
        (inTitle.length === 2 && p.members.every((mid) => inTitle.includes(mid))),
    );

  // Agency uploads only count when the title itself names the group.
  if (isAgency && !titleNamesGroup) return null;
  // Search results must demonstrably be about this group (or name a recognized CP).
  if (!isArtist && !isAgency && !textNamesGroup && !(pairing?.name && mentions(text, pairing.name)))
    return null;

  const source_type: SourceType =
    isArtist || isAgency ? "official" : FAN_MARKERS.test(video.title) ? "fan-created" : "unknown";
  return {
    source_type,
    official_kind: isArtist ? ("artist" as const) : isAgency ? ("agency" as const) : null,
    matched_group: artist.group_id,
    matched_members,
    matched_cp_pairing: pairing?.id ?? null,
  };
}

const DAY = 86_400_000;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const perDay = (count: number | null, ageDays: number) => (count == null ? null : count / ageDays);

/**
 * Transparent prototype score (0–100). Engagement is views/comments/likes per day
 * since publishing, log-scaled so viral videos don't drown everything else. It is
 * not a measure of view growth (no history is collected) or global popularity.
 */
export function scoreVideo(
  v: Omit<FeedVideo, "score" | "score_breakdown" | "reason" | "section">,
  req: FeedRequest,
  now: number,
) {
  const ageDays = Math.max((now - Date.parse(v.published_at)) / DAY, 0.25);
  const recency = clamp(1 - ageDays / req.days);

  const views = perDay(v.view_count, ageDays);
  const comments = perDay(v.comment_count, ageDays);
  const likes = perDay(v.like_count, ageDays);
  const parts = [
    views == null ? null : { w: 0.6, s: clamp(Math.log10(1 + views) / 6) }, // ~1M views/day → 1
    comments == null ? null : { w: 0.25, s: clamp(Math.log10(1 + comments) / 4) }, // ~10k/day → 1
    likes == null ? null : { w: 0.15, s: clamp(Math.log10(1 + likes) / 5) }, // ~100k/day → 1
  ].filter((p): p is { w: number; s: number } => !!p);
  const engagement = parts.length
    ? parts.reduce((t, p) => t + p.w * p.s, 0) / parts.reduce((t, p) => t + p.w, 0)
    : null;

  const followsMember = v.matched_members.some((id) => req.members.includes(id));
  let relevance = v.matched_group ? 0.3 : 0;
  if (followsMember) relevance += 0.35;
  if (v.matched_cp_pairing) relevance += 0.4;
  if (req.stanType === "Group stan" && v.source_type === "official") relevance += 0.25;
  if (req.stanType === "Group stan" && !v.matched_members.length) relevance += 0.1;
  if (req.stanType === "Solo stan" && followsMember) relevance += 0.2;
  if (req.stanType === "CP fan" && v.matched_cp_pairing) relevance += 0.25;
  relevance = clamp(relevance);

  const score = Math.round(100 * (0.5 * relevance + 0.2 * recency + 0.3 * (engagement ?? 0)));
  return {
    score,
    score_breakdown: {
      relevance: round2(relevance),
      recency: round2(recency),
      engagement: engagement == null ? null : round2(engagement),
    },
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Which single section a video lands in; the stan type decides what wins ties. */
export function pickSection(
  v: Pick<FeedVideo, "source_type" | "matched_members" | "matched_cp_pairing">,
  req: FeedRequest,
): Section {
  const bias = v.matched_members.some((id) => req.members.includes(id));
  const cp = !!v.matched_cp_pairing && req.cps.length > 0;
  const official = v.source_type === "official";
  const order: Section[] =
    req.stanType === "Solo stan"
      ? ["bias", "cp", "official"]
      : req.stanType === "CP fan"
        ? ["cp", "bias", "official"]
        : ["official", "cp", "bias"];
  const hit: Record<Section, boolean> = { official, bias, cp, buzz: true };
  return order.find((s) => hit[s]) ?? "buzz";
}

function explain(artist: Artist, v: Omit<FeedVideo, "reason">, req: FeedRequest) {
  const names = (ids: string[]) =>
    ids.map((id) => getMember(artist, id)?.stage_name ?? id).join(" & ");
  const followed = v.matched_members.filter((id) => req.members.includes(id));
  const p: Pairing | undefined = v.matched_cp_pairing
    ? resolvePairing(artist, v.matched_cp_pairing)
    : undefined;
  const popular = (v.score_breakdown.engagement ?? 0) >= 0.5 ? "Popular recent" : "Recent";
  const kind = v.source_type === "fan-created" ? "fan video" : "video";
  switch (v.section) {
    case "official":
      return v.official_kind === "agency"
        ? `From agency channel ${v.channel_title}; the title names ${artist.group_name}.`
        : `New upload from ${artist.group_name}'s verified official channel.`;
    case "bias":
      return `Recommended because you follow ${names(followed)}.`;
    case "cp":
      return `${popular} ${kind} related to your selected pairing ${p ? pairingLabel(artist, p) : ""}.`.replace(
        " .",
        ".",
      );
    default:
      return `${popular} ${kind} about ${artist.group_name}.`;
  }
}

/** Dedupe, classify, score and section raw videos into the final feed. */
export function rankFeed(
  artist: Artist,
  req: FeedRequest,
  raw: RawVideo[],
  stats: Map<string, Stats>,
  now = Date.now(),
) {
  const sections: Record<Section, FeedVideo[]> = { official: [], bias: [], cp: [], buzz: [] };
  const seen = new Set<string>();
  const cutoff = now - req.days * DAY;
  for (const video of raw) {
    if (seen.has(video.video_id)) continue;
    const published = Date.parse(video.published_at);
    if (!Number.isFinite(published) || published < cutoff || published > now + DAY) continue;
    const match = classify(artist, video, req);
    if (!match) continue;
    seen.add(video.video_id);
    const s = stats.get(video.video_id) ?? {
      view_count: null,
      like_count: null,
      comment_count: null,
    };
    const base = {
      ...video,
      ...s,
      ...match,
      video_url: `https://www.youtube.com/watch?v=${video.video_id}`,
    };
    const section = pickSection(base, req);
    const scored = { ...base, ...scoreVideo(base, req, now), section };
    sections[section].push({ ...scored, reason: explain(artist, scored, req) });
  }
  for (const key of Object.keys(sections) as Section[]) {
    sections[key] = sections[key].sort((a, b) => b.score - a.score).slice(0, SECTION_LIMITS[key]);
  }
  return sections;
}
