// Manually curated X and TikTok posts for the aespa demo personas.
//
// source_url is exactly the link the team supplied. Everything else was checked on
// 2026-10-17 through each platform's official, unauthenticated oEmbed endpoint
// (publish.x.com/oembed, www.tiktok.com/oembed); TikTok short links were resolved by
// following TikTok's own redirect. Fields neither endpoint returns stay null:
// TikTok exposes no publish date, and neither exposes engagement metrics.
// Thumbnails stay null because TikTok's oEmbed thumbnail URLs are signed and expire.
//
// To replace these with API-ingested records later, keep this shape and swap the
// adapter in src/lib/curated.ts.

export type CuratedPlatform = "x" | "tiktok";

export type ContentCategory =
  | "official_announcement"
  | "cp_moment"
  | "cp_edit"
  | "fan_reaction"
  | "fan_discussion"
  | "fan_capture"
  | "fan_edit"
  | "fancam"
  | "brand_campaign";

export interface CuratedContent {
  id: string;
  platform: CuratedPlatform;
  /** Exactly as supplied. */
  source_url: string;
  /** Canonical post URL from the platform's oEmbed / redirect. */
  canonical_url: string;
  /** Post or video ID taken from the canonical URL. */
  platform_post_id: string;
  group_id: string;
  related_members: string[];
  related_pairings: string[];
  /** "<fan mode>:<pairing or member>", e.g. "cp:karina+winter", "solo:karina". */
  persona_tags: string[];
  content_categories: ContentCategory[];
  ingestion_method: "manual_curated";
  content_status: "verified_public" | "unavailable";
  /** Official account (aespa's own X account) vs fan-created. */
  source_type: "official" | "fan-created";
  published_at: string | null;
  creator_handle: string | null;
  title_or_caption: string | null;
  thumbnail_url: string | null;
  engagement_metrics: null;
  /** Editorial order within a persona (1 = first). Not an engagement ranking. */
  display_priority: number;
}

const CP = {
  group_id: "aespa",
  related_members: ["karina", "winter"],
  related_pairings: ["karina+winter"],
  persona_tags: ["cp:karina+winter"],
};
const SOLO = {
  group_id: "aespa",
  related_members: ["karina"],
  related_pairings: [],
  persona_tags: ["solo:karina"],
};
const base = {
  ingestion_method: "manual_curated",
  content_status: "verified_public",
  thumbnail_url: null,
  engagement_metrics: null,
} as const;

export const CURATED_CONTENT: CuratedContent[] = [
  // ── Persona A: CP fan · Karina × Winter (Winrina / Jiminjeong) ── X
  {
    ...base,
    ...CP,
    id: "cp-x-1",
    platform: "x",
    display_priority: 1,
    source_type: "fan-created",
    source_url: "https://x.com/jessmintea/status/2077742229947621804?s=46",
    canonical_url: "https://x.com/jessmintea/status/2077742229947621804",
    platform_post_id: "2077742229947621804",
    content_categories: ["cp_moment", "fan_reaction"],
    published_at: "2026-07-16",
    creator_handle: "jessmintea",
    title_or_caption:
      "bye at first i thought this was some random lesbian couple. IT’S FREAKING WINRINA????!,):£/):",
  },
  {
    ...base,
    ...CP,
    id: "cp-x-2",
    platform: "x",
    display_priority: 2,
    source_type: "fan-created",
    source_url: "https://x.com/xolovesbyul/status/2107910389241614837?s=46",
    canonical_url: "https://x.com/xolovesbyul/status/2107910389241614837",
    platform_post_id: "2107910389241614837",
    content_categories: ["fan_discussion"],
    published_at: "2026-10-07",
    creator_handle: "xolovesbyul",
    title_or_caption:
      "me acaba de salir una chica que le leyó las cartas al winrina y en resumen: se odian 🤠",
  },
  {
    ...base,
    ...CP,
    id: "cp-x-3",
    platform: "x",
    display_priority: 3,
    source_type: "fan-created",
    source_url: "https://x.com/wintercinna/status/2093366720337441062?s=46",
    canonical_url: "https://x.com/wintercinna/status/2093366720337441062",
    platform_post_id: "2093366720337441062",
    content_categories: ["cp_moment"],
    published_at: "2026-08-28",
    creator_handle: "wintercinna",
    title_or_caption: "vídeo mais importante das winrina",
  },
  {
    ...base,
    ...CP,
    id: "cp-x-4",
    platform: "x",
    display_priority: 4,
    source_type: "fan-created",
    source_url: "https://x.com/ujiminphoria/status/2063522003135688969?s=46",
    canonical_url: "https://x.com/ujiminphoria/status/2063522003135688969",
    platform_post_id: "2063522003135688969",
    content_categories: ["cp_moment", "fan_reaction"],
    published_at: "2026-06-07",
    creator_handle: "ujiminphoria",
    title_or_caption: "EXCUSE ME JIMINJEONG??!?",
  },
  {
    // aespa's own account; listed by the team under the CP persona, but it's an official group post.
    ...base,
    id: "cp-x-5",
    platform: "x",
    display_priority: 5,
    source_type: "official",
    group_id: "aespa",
    related_members: [],
    related_pairings: [],
    persona_tags: ["cp:karina+winter"],
    source_url: "https://x.com/aespa_official/status/2111299133193756772?s=46",
    canonical_url: "https://x.com/aespa_official/status/2111299133193756772",
    platform_post_id: "2111299133193756772",
    content_categories: ["official_announcement"],
    published_at: "2026-10-17",
    creator_handle: "aespa_official",
    title_or_caption: "One More Page, I Swear #2027SEASONSGREETINGS #aespa",
  },
  // ── Persona A ── TikTok
  {
    ...base,
    ...CP,
    id: "cp-tt-1",
    platform: "tiktok",
    display_priority: 6,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLS32Q4n/",
    canonical_url: "https://www.tiktok.com/@aespafusion/video/7695238992157084958",
    platform_post_id: "7695238992157084958",
    content_categories: ["cp_moment", "fancam"],
    published_at: null,
    creator_handle: "aespafusion",
    title_or_caption:
      "and something homosexual happened to me… #aespa #winrina #aespa_synk_complaexity #aespaworldtour #aespaconcert",
  },
  {
    ...base,
    ...CP,
    id: "cp-tt-2",
    platform: "tiktok",
    display_priority: 7,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLS3K6y5/",
    canonical_url: "https://www.tiktok.com/@winto022/video/7671288255588863252",
    platform_post_id: "7671288255588863252",
    content_categories: ["cp_edit"],
    published_at: null,
    creator_handle: "winto022",
    title_or_caption: "#jiminjeong #winrina #minjeong #yujimin #fyp",
  },
  {
    ...base,
    ...CP,
    id: "cp-tt-3",
    platform: "tiktok",
    display_priority: 8,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLSTrMEP/",
    canonical_url: "https://www.tiktok.com/@_bluustar/video/7672762750073916692",
    platform_post_id: "7672762750073916692",
    content_categories: ["cp_edit"],
    published_at: null,
    creator_handle: "_bluustar",
    title_or_caption: "🚬🚬🚬 #kater #winrina #jiminjeong #karina #winter",
  },
  {
    ...base,
    ...CP,
    id: "cp-tt-4",
    platform: "tiktok",
    display_priority: 9,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLS3THEW/",
    canonical_url: "https://www.tiktok.com/@minapenqueen/video/7697681681720921362",
    platform_post_id: "7697681681720921362",
    content_categories: ["cp_moment"],
    published_at: null,
    creator_handle: "minapenqueen",
    title_or_caption: "just winter's ears turning red again 😭😭 #winrina #jiminjeong #aespa #fyp",
  },
  {
    ...base,
    ...CP,
    id: "cp-tt-5",
    platform: "tiktok",
    display_priority: 10,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLSTFqHS/",
    canonical_url: "https://www.tiktok.com/@kemseem/video/7675361498788547847",
    platform_post_id: "7675361498788547847",
    content_categories: ["cp_edit"],
    published_at: null,
    creator_handle: "kemseem",
    title_or_caption: "#kater #jiminjeong #winrina #aespa #fyp",
  },

  // ── Persona B: Karina solo stan ── X
  {
    ...base,
    ...SOLO,
    id: "solo-x-1",
    platform: "x",
    display_priority: 1,
    source_type: "fan-created",
    source_url: "https://x.com/meteorite0411/status/2109739666056650936?s=46",
    canonical_url: "https://x.com/meteorite0411/status/2109739666056650936",
    platform_post_id: "2109739666056650936",
    content_categories: ["fan_capture"],
    published_at: "2026-10-12",
    creator_handle: "meteorite0411",
    title_or_caption: "261012 YVR #카리나 #Karina #에스파 #aespa",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-x-2",
    platform: "x",
    display_priority: 2,
    source_type: "fan-created",
    source_url: "https://x.com/mandubluu/status/2107689602949796319?s=46",
    canonical_url: "https://x.com/mandubluu/status/2107689602949796319",
    platform_post_id: "2107689602949796319",
    content_categories: ["fan_capture"],
    published_at: "2026-10-07",
    creator_handle: "mandubluu",
    title_or_caption: "261006 #카리나 #KARINA",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-x-3",
    platform: "x",
    display_priority: 3,
    source_type: "fan-created",
    source_url: "https://x.com/kyoongmoon/status/2111308525553242197?s=46",
    canonical_url: "https://x.com/kyoongmoon/status/2111308525553242197",
    platform_post_id: "2111308525553242197",
    content_categories: ["fan_capture"],
    published_at: "2026-10-17",
    creator_handle: "kyoongmoon",
    title_or_caption: "Karina gazes at you adorably #카리나 #Karina #カリナ #에스파 #aespa",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-x-4",
    platform: "x",
    display_priority: 4,
    source_type: "fan-created",
    source_url: "https://x.com/krnglobalunion/status/2110560913271230520?s=46",
    canonical_url: "https://x.com/KRNGlobalUnion/status/2110560913271230520",
    platform_post_id: "2110560913271230520",
    content_categories: ["brand_campaign"],
    published_at: "2026-10-15",
    creator_handle: "KRNGlobalUnion",
    title_or_caption:
      "261015 MLB Korea KARINA, THE NEW CURVE New curve drawn by Karina. A new silhouette that started on the curve of a baseball.",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-x-5",
    platform: "x",
    display_priority: 5,
    source_type: "fan-created",
    source_url: "https://x.com/icurina/status/2111085241658163499?s=46",
    canonical_url: "https://x.com/icurina/status/2111085241658163499",
    platform_post_id: "2111085241658163499",
    content_categories: ["fan_reaction"],
    published_at: "2026-10-16",
    creator_handle: "icurina",
    title_or_caption: "GIRL WHATEVERRR",
  },
  // ── Persona B ── TikTok
  {
    ...base,
    ...SOLO,
    id: "solo-tt-1",
    platform: "tiktok",
    display_priority: 6,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLS3TbnW/",
    canonical_url: "https://www.tiktok.com/@oooptes/video/7697262147629272336",
    platform_post_id: "7697262147629272336",
    content_categories: ["fan_edit"],
    published_at: null,
    creator_handle: "oooptes",
    title_or_caption: "แล้วเด็กผู้หญิงจะอยู่กันยังไงอะคะ #karina #aespa",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-tt-2",
    platform: "tiktok",
    display_priority: 7,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLSTMYee/",
    canonical_url: "https://www.tiktok.com/@pyupyuluv/video/7696826892841749781",
    platform_post_id: "7696826892841749781",
    content_categories: ["fan_edit"],
    published_at: null,
    creator_handle: "pyupyuluv",
    title_or_caption: "#aespa #karina",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-tt-3",
    platform: "tiktok",
    display_priority: 8,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLST6jW2/",
    canonical_url: "https://www.tiktok.com/@rxreflexrx/video/7695457583200537908",
    platform_post_id: "7695457583200537908",
    content_categories: ["fancam"],
    published_at: null,
    creator_handle: "rxreflexrx",
    title_or_caption:
      "Karina performing Next Level at KONKUK UNIVERSITY! #karinaaespa #aespaedit #kpop …",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-tt-4",
    platform: "tiktok",
    display_priority: 9,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLSTjDxa/",
    canonical_url: "https://www.tiktok.com/@kpop.lenses/video/7695292998443207956",
    platform_post_id: "7695292998443207956",
    content_categories: ["fancam"],
    published_at: null,
    creator_handle: "kpop.lenses",
    title_or_caption:
      "261009 카리나 ma ma ma mamba | Aespa in Seattle #Karina #카리나 #aespa #에스파",
  },
  {
    ...base,
    ...SOLO,
    id: "solo-tt-5",
    platform: "tiktok",
    display_priority: 10,
    source_type: "fan-created",
    source_url: "https://www.tiktok.com/t/ZPLSTYpbA/",
    canonical_url: "https://www.tiktok.com/@lovingwnter/video/7689107301738794254",
    platform_post_id: "7689107301738794254",
    content_categories: ["fancam"],
    published_at: null,
    creator_handle: "lovingwnter",
    title_or_caption:
      "this outfit has me in a chokehold oml #aespa #aespakarina #aespayujimin #kpop … karina yu jimin fancam",
  },
];
