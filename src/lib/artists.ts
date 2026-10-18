// Supported-group knowledge base. Channel IDs were checked by hand against each
// channel page (name, handle and "official" description) on 2026-10-17.
// Never add a channel ID that hasn't been verified the same way: leave the list
// empty and it shows up in missingChannelConfig() instead.

export type GroupType = "girl" | "boy";
export type DemoSupport = "full" | "basic";

export interface Member {
  id: string;
  stage_name: string;
  korean_name: string;
  aliases: string[];
}

export interface Pairing {
  id: string;
  members: [string, string];
  /** Recognized fandom CP name, if one is widely used. */
  name?: string;
  /** Other fandom names for the same pairing (romanizations, Korean names). */
  aliases?: string[];
}

export interface Channel {
  id: string;
  name: string;
}

export interface Artist {
  group_id: string;
  group_name: string;
  korean_name: string;
  group_type: GroupType;
  agency: string;
  members: Member[];
  /** Aliases for the group itself, used to confirm a video is about this group. */
  group_aliases: string[];
  official_youtube_channel_ids: Channel[];
  /** Agency channels: uploads only count when the title names this group. */
  relevant_agency_channel_ids: Channel[];
  verified_source_urls: string[];
  demo_support_status: DemoSupport;
  pairings: Pairing[];
}

const SMTOWN: Channel = { id: "UCEf_Bc-KVd7onSeifS3py9g", name: "SMTOWN" };
const JYP: Channel = { id: "UCaO6TYtlC8U5ttz62hTrZgg", name: "JYP Entertainment" };
const HYBE: Channel = { id: "UC3IZKseVpdzPSBaWxBxundA", name: "HYBE LABELS" };

const m = (
  id: string,
  stage_name: string,
  korean_name: string,
  aliases: string[] = [],
): Member => ({ id, stage_name, korean_name, aliases });

export const ARTISTS: Artist[] = [
  {
    group_id: "aespa",
    group_name: "aespa",
    korean_name: "에스파",
    group_type: "girl",
    agency: "SM Entertainment",
    group_aliases: ["aespa", "에스파"],
    members: [
      m("karina", "Karina", "카리나", ["Yu Jimin", "유지민"]),
      m("giselle", "Giselle", "지젤", ["Uchinaga Aeri", "Aeri", "우치나가 에리"]),
      m("winter", "Winter", "윈터", ["Kim Minjeong", "Minjeong", "김민정"]),
      m("ningning", "Ningning", "닝닝", ["Ning Yizhuo", "Yizhuo", "宁艺卓"]),
    ],
    official_youtube_channel_ids: [{ id: "UC9GtSLeksfK4yuJ_g1lgQbg", name: "aespa" }],
    relevant_agency_channel_ids: [SMTOWN],
    verified_source_urls: ["https://www.youtube.com/@aespa", "https://www.youtube.com/@SMTOWN"],
    demo_support_status: "full",
    pairings: [
      {
        id: "karina+winter",
        members: ["karina", "winter"],
        name: "Winrina",
        aliases: ["Jiminjeong", "Jinminjeong", "지민정", "유지민 × 김민정"],
      },
      { id: "giselle+ningning", members: ["giselle", "ningning"] },
      { id: "karina+giselle", members: ["karina", "giselle"] },
      { id: "winter+ningning", members: ["winter", "ningning"] },
    ],
  },
  {
    group_id: "blackpink",
    group_name: "BLACKPINK",
    korean_name: "블랙핑크",
    group_type: "girl",
    agency: "YG Entertainment",
    group_aliases: ["BLACKPINK", "블랙핑크", "BLΛƆKPIИK"],
    members: [
      m("jisoo", "Jisoo", "지수", ["Kim Jisoo", "김지수"]),
      m("jennie", "Jennie", "제니", ["Kim Jennie", "김제니"]),
      m("rose", "Rosé", "로제", ["Rose", "ROSÉ", "Park Chaeyoung", "박채영"]),
      m("lisa", "Lisa", "리사", ["Lalisa", "LALISA", "Lalisa Manobal"]),
    ],
    official_youtube_channel_ids: [{ id: "UCOmHUn--16B90oW2L6FRR3A", name: "BLACKPINK" }],
    // YG's own channel isn't verified here yet: see missingChannelConfig().
    relevant_agency_channel_ids: [],
    verified_source_urls: ["https://www.youtube.com/@BLACKPINK"],
    demo_support_status: "basic",
    pairings: [
      { id: "jennie+jisoo", members: ["jennie", "jisoo"], name: "Jensoo" },
      { id: "rose+lisa", members: ["rose", "lisa"], name: "Chaelisa" },
    ],
  },
  {
    group_id: "stray-kids",
    group_name: "Stray Kids",
    korean_name: "스트레이 키즈",
    group_type: "boy",
    agency: "JYP Entertainment",
    group_aliases: ["Stray Kids", "스트레이 키즈", "스키즈", "SKZ"],
    members: [
      m("bang-chan", "Bang Chan", "방찬", ["Chan", "Christopher Bang"]),
      m("lee-know", "Lee Know", "리노", ["Lee Minho", "이민호"]),
      m("changbin", "Changbin", "창빈", ["Seo Changbin", "서창빈"]),
      m("hyunjin", "Hyunjin", "현진", ["Hwang Hyunjin", "황현진"]),
      m("han", "Han", "한", ["Han Jisung", "Jisung", "한지성"]),
      m("felix", "Felix", "필릭스", ["Lee Felix", "Lee Yongbok", "이용복"]),
      m("seungmin", "Seungmin", "승민", ["Kim Seungmin", "김승민"]),
      m("in", "I.N", "아이엔", ["Jeongin", "Yang Jeongin", "양정인"]),
    ],
    official_youtube_channel_ids: [{ id: "UC9rMiEjNaCSsebs31MRDCRA", name: "Stray Kids" }],
    relevant_agency_channel_ids: [JYP],
    verified_source_urls: [
      "https://www.youtube.com/@StrayKids",
      "https://www.youtube.com/@JYPEntertainment",
    ],
    demo_support_status: "basic",
    pairings: [
      { id: "hyunjin+felix", members: ["hyunjin", "felix"], name: "Hyunlix" },
      { id: "lee-know+han", members: ["lee-know", "han"], name: "Minsung" },
      { id: "bang-chan+felix", members: ["bang-chan", "felix"], name: "Chanlix" },
    ],
  },
  {
    group_id: "seventeen",
    group_name: "SEVENTEEN",
    korean_name: "세븐틴",
    group_type: "boy",
    agency: "PLEDIS Entertainment",
    group_aliases: ["SEVENTEEN", "세븐틴", "SVT"],
    members: [
      m("s-coups", "S.Coups", "에스쿱스", ["SCoups", "Choi Seungcheol", "최승철"]),
      m("jeonghan", "Jeonghan", "정한", ["Yoon Jeonghan", "윤정한"]),
      m("joshua", "Joshua", "조슈아", ["Hong Jisoo", "홍지수"]),
      m("jun", "Jun", "준", ["Wen Junhui", "문준휘"]),
      m("hoshi", "Hoshi", "호시", ["Kwon Soonyoung", "권순영"]),
      m("wonwoo", "Wonwoo", "원우", ["Jeon Wonwoo", "전원우"]),
      m("woozi", "Woozi", "우지", ["Lee Jihoon", "이지훈"]),
      m("dk", "DK", "도겸", ["Dokyeom", "Lee Seokmin", "이석민"]),
      m("mingyu", "Mingyu", "민규", ["Kim Mingyu", "김민규"]),
      m("the8", "The8", "디에잇", ["THE 8", "Minghao", "Xu Minghao"]),
      m("seungkwan", "Seungkwan", "승관", ["Boo Seungkwan", "부승관"]),
      m("vernon", "Vernon", "버논", ["Hansol", "Chwe Hansol", "최한솔"]),
      m("dino", "Dino", "디노", ["Lee Chan", "이찬"]),
    ],
    official_youtube_channel_ids: [{ id: "UCfkXDY7vwkcJ8ddFGz8KusA", name: "SEVENTEEN" }],
    relevant_agency_channel_ids: [HYBE],
    verified_source_urls: [
      "https://www.youtube.com/@pledis17",
      "https://www.youtube.com/@HYBELABELS",
    ],
    demo_support_status: "basic",
    pairings: [
      { id: "s-coups+jeonghan", members: ["s-coups", "jeonghan"], name: "Jeongcheol" },
      { id: "hoshi+woozi", members: ["hoshi", "woozi"], name: "Soonhoon" },
      { id: "wonwoo+mingyu", members: ["wonwoo", "mingyu"], name: "Meanie" },
      { id: "seungkwan+vernon", members: ["seungkwan", "vernon"], name: "Verkwan" },
    ],
  },
];

export const DEMO_GROUP_ID = "aespa";

export const getArtist = (id: string | undefined) => ARTISTS.find((a) => a.group_id === id);
export const getMember = (artist: Artist, id: string) => artist.members.find((x) => x.id === id);

/** Canonical id for any two members, so "a+b" and "b+a" are the same pairing. */
export function pairingId(a: string, b: string, artist: Artist) {
  const order = artist.members.map((x) => x.id);
  return [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join("+");
}

export function resolvePairing(artist: Artist, id: string): Pairing | undefined {
  const known = artist.pairings.find((p) => p.id === id);
  if (known) return known;
  const [a, b] = id.split("+");
  if (!a || !b || a === b || !getMember(artist, a) || !getMember(artist, b)) return undefined;
  return { id: pairingId(a, b, artist), members: [a, b] as [string, string] };
}

export function pairingLabel(artist: Artist, p: Pairing) {
  const names = p.members.map((id) => getMember(artist, id)?.stage_name ?? id).join(" × ");
  const label = [p.name, p.aliases?.[0]].filter(Boolean).join(" / ");
  return label ? `${label} (${names})` : names;
}

/** Groups whose channel config is incomplete, for reporting instead of guessing IDs. */
/** Every fandom name for a pairing, for matching titles and captions. */
export const pairingNames = (p: Pairing) =>
  [p.name, ...(p.aliases ?? [])].filter((n): n is string => !!n);

export function missingChannelConfig() {
  return ARTISTS.flatMap((a) => [
    ...(a.official_youtube_channel_ids.length
      ? []
      : [`${a.group_name}: no verified official channel`]),
    ...(a.relevant_agency_channel_ids.length
      ? []
      : [`${a.group_name}: no verified agency channel (${a.agency})`]),
  ]);
}

export const uploadsPlaylist = (channelId: string) => `UU${channelId.slice(2)}`;
