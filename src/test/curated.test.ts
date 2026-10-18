import { describe, expect, it } from "vitest";
import { CURATED_CONTENT } from "@/data/curatedFandomContent";
import { getArtist } from "@/lib/artists";
import { curatedFeedItems, mergeSection } from "@/lib/curated";
import type { FeedRequest, FeedVideo } from "@/lib/feed";

const aespa = getArtist("aespa")!;
const req = (over: Partial<FeedRequest>): FeedRequest => ({
  group: "aespa",
  members: [],
  cps: [],
  stanType: "Group stan",
  interests: [],
  days: 7,
  ...over,
});
const CP_PERSONA = req({ stanType: "CP fan", cps: ["karina+winter"] });
const SOLO_PERSONA = req({ stanType: "Solo stan", members: ["karina"] });

const SUPPLIED = [
  "https://x.com/jessmintea/status/2077742229947621804?s=46",
  "https://x.com/xolovesbyul/status/2107910389241614837?s=46",
  "https://x.com/wintercinna/status/2093366720337441062?s=46",
  "https://x.com/ujiminphoria/status/2063522003135688969?s=46",
  "https://x.com/aespa_official/status/2111299133193756772?s=46",
  "https://www.tiktok.com/t/ZPLS32Q4n/",
  "https://www.tiktok.com/t/ZPLS3K6y5/",
  "https://www.tiktok.com/t/ZPLSTrMEP/",
  "https://www.tiktok.com/t/ZPLS3THEW/",
  "https://www.tiktok.com/t/ZPLSTFqHS/",
  "https://x.com/meteorite0411/status/2109739666056650936?s=46",
  "https://x.com/mandubluu/status/2107689602949796319?s=46",
  "https://x.com/kyoongmoon/status/2111308525553242197?s=46",
  "https://x.com/krnglobalunion/status/2110560913271230520?s=46",
  "https://x.com/icurina/status/2111085241658163499?s=46",
  "https://www.tiktok.com/t/ZPLS3TbnW/",
  "https://www.tiktok.com/t/ZPLSTMYee/",
  "https://www.tiktok.com/t/ZPLST6jW2/",
  "https://www.tiktok.com/t/ZPLSTjDxa/",
  "https://www.tiktok.com/t/ZPLSTYpbA/",
];

describe("Curated dataset", () => {
  it("stores exactly the 20 supplied URLs, unchanged", () => {
    expect(CURATED_CONTENT.map((c) => c.source_url)).toEqual(SUPPLIED);
  });

  it("never carries engagement metrics or unverified TikTok dates", () => {
    expect(
      CURATED_CONTENT.every(
        (c) => c.engagement_metrics === null && c.ingestion_method === "manual_curated",
      ),
    ).toBe(true);
    expect(
      CURATED_CONTENT.filter((c) => c.platform === "tiktok").every((c) => c.published_at === null),
    ).toBe(true);
  });

  it("uses post IDs that match the canonical URLs", () => {
    for (const c of CURATED_CONTENT)
      expect(c.canonical_url.endsWith(`/${c.platform_post_id}`)).toBe(true);
  });
});

describe("Persona matching", () => {
  it("gives the CP persona its 10 curated items: 9 in For Your Ship, aespa's official post in Official", () => {
    const items = curatedFeedItems(aespa, CP_PERSONA);
    expect(items.map((i) => i.id).sort()).toEqual(
      CURATED_CONTENT.filter((c) => c.id.startsWith("cp-"))
        .map((c) => c.id)
        .sort(),
    );
    expect(items.filter((i) => i.section === "cp")).toHaveLength(9);
    expect(items.find((i) => i.creator_handle === "aespa_official")?.section).toBe("official");
  });

  it("gives the Karina solo persona its 10 items in For Your Bias, plus the official post", () => {
    const items = curatedFeedItems(aespa, SOLO_PERSONA);
    const bias = items.filter((i) => i.section === "bias");
    expect(bias.map((i) => i.id).sort()).toEqual(
      CURATED_CONTENT.filter((c) => c.id.startsWith("solo-"))
        .map((c) => c.id)
        .sort(),
    );
    expect(bias.filter((i) => i.platform === "x")).toHaveLength(5);
    expect(bias.filter((i) => i.platform === "tiktok")).toHaveLength(5);
    expect(items.filter((i) => i.section !== "bias").map((i) => i.creator_handle)).toEqual([
      "aespa_official",
    ]);
  });

  it("changes between personas and shows nothing curated for other groups", () => {
    const cp = new Set(
      curatedFeedItems(aespa, CP_PERSONA)
        .filter((i) => i.section !== "official")
        .map((i) => i.id),
    );
    const solo = curatedFeedItems(aespa, SOLO_PERSONA).filter((i) => i.section !== "official");
    expect(solo.some((i) => cp.has(i.id))).toBe(false);
    expect(curatedFeedItems(getArtist("seventeen")!, req({ group: "seventeen" }))).toEqual([]);
  });

  it("labels CP picks as fan interpretation", () => {
    const ship = curatedFeedItems(aespa, CP_PERSONA).find((i) => i.section === "cp")!;
    expect(ship.reason).toContain("Fan interpretation");
  });
});

describe("Merged sections", () => {
  it("interleaves curated and YouTube entries without duplicates", () => {
    const curated = curatedFeedItems(aespa, SOLO_PERSONA)
      .filter((i) => i.section === "bias")
      .slice(0, 2);
    const video = { video_id: "abcdefghijk" } as FeedVideo;
    const merged = mergeSection(curated, [video]);
    expect(merged.map((e) => e.platform)).toEqual(["x", "youtube", "x"]);
    expect(new Set(merged.map((e) => e.key)).size).toBe(merged.length);
  });
});
