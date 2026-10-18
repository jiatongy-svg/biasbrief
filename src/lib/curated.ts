// Curated X / TikTok adapter plus the shared, platform-neutral feed entry.
// A future X or TikTok API adapter only needs to return CuratedContent-shaped
// records (or its own FeedEntry variant); the feed UI and ranking stay the same.
import {
  CURATED_CONTENT,
  type CuratedContent,
  type CuratedPlatform,
} from "@/data/curatedFandomContent";
import { getMember, pairingLabel, resolvePairing, type Artist } from "./artists";
import { pickSection, type FeedRequest, type FeedVideo, type Section } from "./feed";

export type Platform = "youtube" | CuratedPlatform;
export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
};

export interface CuratedFeedItem extends CuratedContent {
  section: Section;
  /** 0–1 match to the user's picks; decides order together with display_priority. */
  relevance: number;
  matched_members: string[];
  matched_cp_pairing: string | null;
  reason: string;
}

export type FeedEntry =
  | { kind: "youtube"; key: string; platform: "youtube"; video: FeedVideo }
  | { kind: "curated"; key: string; platform: CuratedPlatform; item: CuratedFeedItem };

/** Does a persona tag ("cp:karina+winter", "solo:karina") match the user's fan mode and picks? */
function personaMatches(tag: string, req: FeedRequest) {
  const [mode, target] = tag.split(":");
  if (!target) return false;
  if (mode === "cp") return req.stanType === "CP fan" && req.cps.includes(target);
  if (mode === "solo") return req.stanType === "Solo stan" && req.members.includes(target);
  return false;
}

export function curatedFeedItems(
  artist: Artist,
  req: FeedRequest,
  data: CuratedContent[] = CURATED_CONTENT,
): CuratedFeedItem[] {
  const out: CuratedFeedItem[] = [];
  for (const item of data) {
    if (item.group_id !== artist.group_id || item.content_status !== "verified_public") continue;
    const official = item.source_type === "official";
    const pairing = item.related_pairings.find((id) => req.cps.includes(id)) ?? null;
    const members = item.related_members.filter((id) => req.members.includes(id));
    const persona = item.persona_tags.some((t) => personaMatches(t, req));
    // Only show curated items that match this user's picks; official group posts are relevant to every fan of the group.
    if (!official && !pairing && !members.length && !persona) continue;
    // Shipping content is only for fans who follow that pairing, not everyone who likes one of its members.
    if (!official && item.related_pairings.length && !pairing) continue;

    const relevance = Math.min(
      1,
      (official ? 0.3 : 0) +
        (pairing ? 0.4 : 0) +
        (members.length ? 0.35 : 0) +
        (persona ? 0.25 : 0),
    );
    const matched_members = pairing ? item.related_members : members;
    const section = pickSection(
      { source_type: item.source_type, matched_members, matched_cp_pairing: pairing },
      req,
    );
    out.push({
      ...item,
      section,
      relevance,
      matched_members,
      matched_cp_pairing: pairing,
      reason: explain(artist, item, section, pairing, members),
    });
  }
  return out.sort((a, b) => b.relevance - a.relevance || a.display_priority - b.display_priority);
}

function explain(
  artist: Artist,
  item: CuratedContent,
  section: Section,
  pairing: string | null,
  members: string[],
) {
  const where = item.platform === "x" ? "X" : "TikTok";
  if (section === "official") return `Post from ${artist.group_name}'s official ${where} account.`;
  if (section === "cp" && pairing) {
    const p = resolvePairing(artist, pairing);
    return `Curated ${where} pick for your ship ${p ? pairingLabel(artist, p) : ""}. Fan interpretation of public moments.`;
  }
  if (section === "bias")
    return `Curated ${where} pick because you follow ${members.map((id) => getMember(artist, id)?.stage_name ?? id).join(" & ")}.`;
  return `Curated ${where} fan content about ${artist.group_name}.`;
}

/**
 * One section's entries: curated picks and live YouTube videos interleaved (curated first),
 * so both sources show up near the top instead of one burying the other.
 */
export function mergeSection(curated: CuratedFeedItem[], videos: FeedVideo[]): FeedEntry[] {
  const a: FeedEntry[] = curated.map((item) => ({
    kind: "curated",
    key: `${item.platform}:${item.id}`,
    platform: item.platform,
    item,
  }));
  const b: FeedEntry[] = videos.map((video) => ({
    kind: "youtube",
    key: `youtube:${video.video_id}`,
    platform: "youtube",
    video,
  }));
  const out: FeedEntry[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]!);
    if (b[i]) out.push(b[i]!);
  }
  return out;
}
