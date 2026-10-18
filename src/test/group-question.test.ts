import { describe, expect, it } from "vitest";
import {
  ARTISTS,
  DEMO_GROUP_ID,
  getArtist,
  missingChannelConfig,
  pairingId,
  resolvePairing,
} from "@/lib/artists";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/data";

describe("Group onboarding data", () => {
  it("offers four groups mixing girl and boy groups, with aespa as the full demo", () => {
    expect(ARTISTS.map((a) => a.group_name)).toEqual([
      "aespa",
      "BLACKPINK",
      "Stray Kids",
      "SEVENTEEN",
    ]);
    expect(ARTISTS.filter((a) => a.group_type === "girl")).toHaveLength(2);
    expect(ARTISTS.filter((a) => a.group_type === "boy")).toHaveLength(2);
    expect(ARTISTS.filter((a) => a.demo_support_status === "full").map((a) => a.group_id)).toEqual([
      DEMO_GROUP_ID,
    ]);
  });

  it("lists aespa's actual members", () => {
    expect(getArtist("aespa")?.members.map((m) => m.stage_name)).toEqual([
      "Karina",
      "Giselle",
      "Winter",
      "Ningning",
    ]);
  });

  it("stores only well-formed channel IDs and reports missing config instead of guessing", () => {
    for (const a of ARTISTS) {
      for (const c of [...a.official_youtube_channel_ids, ...a.relevant_agency_channel_ids])
        expect(c.id).toMatch(/^UC[\w-]{22}$/);
      expect(a.official_youtube_channel_ids.length).toBeGreaterThan(0);
    }
    expect(missingChannelConfig()).toContain(
      "BLACKPINK: no verified agency channel (YG Entertainment)",
    );
  });

  it("treats a pairing the same in either order", () => {
    const aespa = getArtist("aespa")!;
    expect(pairingId("winter", "karina", aespa)).toBe("karina+winter");
    expect(resolvePairing(aespa, "karina+winter")?.name).toBe("Winrina");
    expect(resolvePairing(aespa, "karina+karina")).toBeUndefined();
  });
});

describe("Saved preferences", () => {
  it("saves and loads the chosen group, members, CPs and interests", () => {
    localStorage.clear();
    const prefs: Prefs = {
      group: "aespa",
      members: ["winter"],
      cps: ["karina+winter"],
      stanType: "CP fan",
      interests: ["edits"],
    };
    savePrefs(prefs);
    expect(loadPrefs()).toEqual(prefs);
  });

  it("drops prefs saved by the old fictional pilot so onboarding starts fresh", () => {
    localStorage.setItem(
      "biasbrief-prefs",
      JSON.stringify({ group: "LUMIÈRE", members: ["Haneul"], cps: [], stanType: "Solo stan" }),
    );
    expect(loadPrefs()).toBeNull();
  });
});
