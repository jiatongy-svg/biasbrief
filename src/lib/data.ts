import { getArtist, resolvePairing } from "./artists";

export const STAN_TYPES = ["Group stan", "Solo stan", "CP fan"] as const;
export type StanType = (typeof STAN_TYPES)[number];

// Each interest adds YouTube search terms for the Fandom Buzz section.
export const INTERESTS = [
  { id: "fancams", label: "Fancams", terms: ["fancam", "직캠"] },
  { id: "dance-covers", label: "Dance covers", terms: ["dance cover"] },
  { id: "reactions", label: "Reactions", terms: ["reaction"] },
  { id: "edits", label: "Fan edits", terms: ["edit", "fmv"] },
  { id: "funny", label: "Funny moments", terms: ["funny moments"] },
  { id: "analysis", label: "Performance analysis", terms: ["vocal analysis", "dance analysis"] },
] as const;

export interface Prefs {
  /** artists.ts group_id */
  group: string;
  /** member ids */
  members: string[];
  /** pairing ids ("karina+winter") */
  cps: string[];
  stanType: StanType;
  interests: string[];
}

const KEY = "biasbrief-prefs";

/** Returns saved prefs, or null if missing or saved by an older version (e.g. the fictional LUMIÈRE pilot). */
export const loadPrefs = (): Prefs | null => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<Prefs> | null;
    const artist = getArtist(p?.group);
    if (!p || !artist) return null;
    return {
      group: artist.group_id,
      members: (p.members ?? []).filter((id) => artist.members.some((x) => x.id === id)),
      cps: (p.cps ?? []).filter((id) => resolvePairing(artist, id)),
      stanType: STAN_TYPES.includes(p.stanType as StanType)
        ? (p.stanType as StanType)
        : "Group stan",
      interests: (p.interests ?? []).filter((id) => INTERESTS.some((i) => i.id === id)),
    };
  } catch {
    return null;
  }
};
export const savePrefs = (p: Prefs) => localStorage.setItem(KEY, JSON.stringify(p));
