import { beforeEach, describe, expect, it, vi } from "vitest";
import { getArtist } from "@/lib/artists";
import { buildQueries, rankFeed, type FeedRequest, type RawVideo } from "@/lib/feed";
import { buildFeed, clearYouTubeCache } from "@/lib/youtube.server";

const aespa = getArtist("aespa")!;
const NOW = Date.parse("2026-10-17T12:00:00Z");
const req = (over: Partial<FeedRequest> = {}): FeedRequest => ({
  group: "aespa",
  members: [],
  cps: [],
  stanType: "Group stan",
  interests: [],
  days: 7,
  ...over,
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const upload = (id: string, title: string, daysAgo = 1) => ({
  snippet: { title, description: "" },
  contentDetails: {
    videoId: id,
    videoPublishedAt: new Date(NOW - daysAgo * 86_400_000).toISOString(),
  },
});
const hit = (id: string, title: string, channelId = "UCfanchannel0000000000000", daysAgo = 2) => ({
  id: { videoId: id },
  snippet: {
    title,
    description: "",
    channelId,
    channelTitle: "Some fan",
    publishedAt: new Date(NOW - daysAgo * 86_400_000).toISOString(),
  },
});

function fakeYouTube(
  opts: { search?: unknown[]; stats?: Record<string, [number, number]>; fail?: Response } = {},
) {
  return vi.fn<typeof fetch>().mockImplementation(async (input) => {
    if (opts.fail) return opts.fail.clone();
    const url = new URL(String(input));
    if (url.pathname.endsWith("/playlistItems")) {
      return url.searchParams.get("playlistId") === "UU9GtSLeksfK4yuJ_g1lgQbg"
        ? json({
            items: [
              upload("aaaaaaaaaaa", "aespa 'Dirty Work' MV"),
              upload("oooooooooo1", "aespa from last month", 30),
            ],
          })
        : json({
            items: [
              upload("bbbbbbbbbbb", "NCT 127 Showcase"),
              upload("ccccccccccc", "aespa X SMTOWN LIVE teaser"),
            ],
          });
    }
    if (url.pathname.endsWith("/search")) return json({ items: opts.search ?? [] });
    const ids = url.searchParams.get("id")!.split(",");
    return json({
      items: ids.map((id) => ({
        id,
        statistics: opts.stats?.[id]
          ? { viewCount: String(opts.stats[id][0]), commentCount: String(opts.stats[id][1]) }
          : {},
      })),
    });
  });
}

beforeEach(() => clearYouTubeCache());

describe("Official channel tracking", () => {
  it("reads the group's verified uploads playlist and only agency uploads that name the group", async () => {
    const fetcher = fakeYouTube();
    const feed = await buildFeed(aespa, req(), "test-credential", fetcher, NOW);
    const playlists = fetcher.mock.calls
      .map(([u]) => new URL(String(u)).searchParams.get("playlistId"))
      .filter(Boolean);
    expect(playlists).toEqual(["UU9GtSLeksfK4yuJ_g1lgQbg", "UUEf_Bc-KVd7onSeifS3py9g"]);
    expect(fetcher.mock.calls.every(([u]) => !new URL(String(u)).searchParams.has("key"))).toBe(
      true,
    );
    expect(feed.sections.official.map((v) => v.video_id).sort()).toEqual([
      "aaaaaaaaaaa",
      "ccccccccccc",
    ]);
    expect(feed.status).toBe("ok");
  });

  it("caches per channel and query so a second request makes no API calls", async () => {
    const fetcher = fakeYouTube();
    await buildFeed(aespa, req(), "k", fetcher, NOW);
    const calls = fetcher.mock.calls.length;
    await buildFeed(aespa, req(), "k", fetcher, NOW + 60_000);
    expect(fetcher.mock.calls.length).toBe(calls);
  });
});

describe("Personalized searches", () => {
  it("adds member searches when a member is selected", () => {
    expect(buildQueries(aespa, req()).map((q) => q.category)).toEqual(["buzz"]);
    const qs = buildQueries(aespa, req({ members: ["winter"], stanType: "Solo stan" }));
    expect(qs.filter((q) => q.category === "member").map((q) => q.q)).toEqual([
      "aespa Winter|에스파 윈터",
      "aespa Winter fancam|interview|edit|funny moments",
    ]);
  });

  it("builds pairing searches from the CP name and both members", () => {
    const qs = buildQueries(aespa, req({ cps: ["karina+winter"], stanType: "CP fan" })).filter(
      (q) => q.category === "cp",
    );
    expect(qs.map((q) => q.q)).toEqual([
      "Winrina|Jiminjeong|Karina Winter aespa",
      "aespa Karina Winter|카리나 윈터 moments|edit|compilation|interaction",
    ]);
  });

  it("limits non-demo groups to one group-level search", () => {
    expect(
      buildQueries(getArtist("seventeen")!, req({ group: "seventeen", members: ["hoshi"] })),
    ).toHaveLength(1);
  });
});

describe("Ranking and sections", () => {
  const raw = (id: string, title: string, channel = "UCfanchannel0000000000000"): RawVideo => ({
    video_id: id,
    title,
    description: "",
    channel_id: channel,
    channel_title: "fan",
    published_at: new Date(NOW - 2 * 86_400_000).toISOString(),
    thumbnail_url: null,
    matched_search_query: "q",
  });

  it("routes videos to one section each and labels fan content", () => {
    const r = req({ members: ["winter"], cps: ["karina+winter"], stanType: "CP fan" });
    const sections = rankFeed(
      aespa,
      r,
      [
        raw("v1aaaaaaaaa", "Winrina moments edit"),
        raw("v1aaaaaaaaa", "dup"),
        raw("v2aaaaaaaaa", "aespa Winter fancam"),
        raw("v3aaaaaaaaa", "random vlog"),
      ],
      new Map(),
      NOW,
    );
    expect(sections.cp.map((v) => v.video_id)).toEqual(["v1aaaaaaaaa"]);
    expect(sections.cp[0]!.source_type).toBe("fan-created");
    expect(sections.bias.map((v) => v.video_id)).toEqual(["v2aaaaaaaaa"]);
    expect(sections.bias[0]!.reason).toBe("Recommended because you follow Winter.");
    expect(Object.values(sections).flat()).toHaveLength(2); // dup and unrelated video dropped
  });

  it("ignores member hashtag roll calls for CP and bias matching", () => {
    const r = req({ members: ["winter"], cps: ["karina+winter"], stanType: "CP fan" });
    const rollCall = {
      ...raw("roll0000000", "aespa funny moments"),
      description: "#karina #giselle #winter #ningning",
    };
    const v = Object.values(rankFeed(aespa, r, [rollCall], new Map(), NOW)).flat()[0]!;
    expect(v.matched_cp_pairing).toBeNull();
    expect(v.matched_members).toEqual([]);
    expect(v.section).toBe("buzz");
  });

  it("does not rank by raw view count alone", () => {
    const r = req({ members: ["winter"], stanType: "Solo stan" });
    const stats = new Map([
      ["big00000000", { view_count: 50_000_000, like_count: null, comment_count: null }],
      ["bias0000000", { view_count: 200_000, like_count: null, comment_count: 3_000 }],
    ]);
    const s = rankFeed(
      aespa,
      r,
      [raw("big00000000", "aespa reaction compilation"), raw("bias0000000", "aespa Winter fancam")],
      stats,
      NOW,
    );
    const all = Object.values(s)
      .flat()
      .sort((a, b) => b.score - a.score);
    expect(all[0]!.video_id).toBe("bias0000000");
  });

  it("matches Latin names on word boundaries", () => {
    const skz = getArtist("stray-kids")!;
    const s = rankFeed(
      skz,
      req({ group: "stray-kids", members: ["han"] }),
      [raw("hanbok00000", "Stray Kids Hanbok photoshoot")],
      new Map(),
      NOW,
    );
    expect(Object.values(s).flat()[0]!.matched_members).toEqual([]);
  });
});

describe("API failures", () => {
  it("returns no videos and a quota notice instead of inventing content", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = fakeYouTube({
      fail: json(
        { error: { errors: [{ reason: "quotaExceeded" }], message: "provider-internal-detail" } },
        403,
      ),
    });
    const feed = await buildFeed(aespa, req(), "k", fetcher, NOW);
    expect(feed.status).toBe("unavailable");
    expect(Object.values(feed.sections).flat()).toEqual([]);
    expect(feed.notices.join(" ")).toContain("quota");
    expect(JSON.stringify(feed)).not.toContain("provider-internal-detail");
    log.mockRestore();
  });

  it("falls back to previously cached results when the quota runs out", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await buildFeed(
      aespa,
      req(),
      "k",
      fakeYouTube({ search: [hit("ddddddddddd", "aespa fancam compilation")] }),
      NOW,
    );
    const later = NOW + 2 * 3_600_000;
    const feed = await buildFeed(
      aespa,
      req(),
      "k",
      fakeYouTube({ fail: json({ error: { errors: [{ reason: "quotaExceeded" }] } }, 403) }),
      later,
    );
    expect(feed.status).toBe("partial");
    expect(feed.served_from_cache).toBe(true);
    expect(feed.updated_at).toBe(new Date(NOW).toISOString());
    expect(Object.values(feed.sections).flat().length).toBeGreaterThan(0);
    log.mockRestore();
  });
});
