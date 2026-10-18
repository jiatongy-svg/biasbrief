// Two prewritten weekly digests for the live demo, stored verbatim as supplied by the team.
// Not AI-generated at runtime. Source links point to the referenced channels/searches.
import karinaImage from "@/assets/digest-karina.jpg";
import winrinaImage from "@/assets/digest-winrina.jpg";

export interface DigestSource {
  label: string;
  url?: string;
}
export interface DigestSection {
  title: string;
  paragraphs: string[];
  /** Small italic caveat under the section. */
  note?: string;
  source?: DigestSource;
  /** Shows the "5 X Posts / 5 TikTok Videos" chips. */
  curated?: { label: string };
}
export interface DemoDigest {
  id: "karina-solo" | "winrina-cp";
  badge: "For Your Bias" | "For Your Ship";
  title: string;
  subtitle: string;
  image: string;
  imageCredit: string;
  glance: string[];
  sections: DigestSection[];
  watchlist: string;
}

const VOGUE: DigestSource = {
  label: "Vogue — Never Have I Ever with aespa",
  url: "https://www.youtube.com/results?search_query=aespa+Never+Have+I+Ever+Vogue",
};

export const DEMO_DIGESTS: Record<DemoDigest["id"], DemoDigest> = {
  "karina-solo": {
    id: "karina-solo",
    badge: "For Your Bias",
    title: "Karina's Week in a Nutshell",
    subtitle: "October 11–17, 2026 · Solo Stan Edition · 3 min read",
    image: karinaImage,
    imageCredit: "aespa's Karina spotted hanging out with former SM Rookies trainee Hina | allkpop",
    glance: [
      "From hilarious behind-the-scenes stories to adorable fan edits and fresh group content, Karina had plenty of moments worth catching up on this week. Whether you love her powerful stage presence or her playful personality, here's what you might have missed.",
    ],
    sections: [
      {
        title: "Karina's Playful Side Takes Center Stage",
        paragraphs: [
          "aespa appeared on Vogue's Never Have I Ever, sharing funny memories from their trainee days, dorm life, and performances.",
          "One memorable moment involved the members talking about Karina's impressive ability to sleep, something the others jokingly envied. They also recalled how naturally they shared clothes while living together.",
          "Karina revealed a funny concert mishap, too: during a performance of Supernova, she accidentally mixed up lyrics from different versions.",
          "It's a fun reminder that behind her charismatic stage persona is someone who doesn't take herself too seriously.",
        ],
        source: VOGUE,
      },
      {
        title: "A Fresh Look at aespa's 2027 Season's Greetings",
        paragraphs: [
          "On October 16, aespa's official YouTube channel uploaded 2027 aespa SEASON'S GREETINGS BEHIND, giving fans a new look at the group's seasonal content.",
          "The soft styling and elegant group visuals offer something different from aespa's usual high-energy performance concepts.",
          "For Karina fans, this is a must-save official update, especially if you enjoy behind-the-scenes footage and new concept photos.",
        ],
        source: {
          label: "aespa Official YouTube · Approximately 217.6K views in the provided screenshot.",
          url: "https://www.youtube.com/@aespa",
        },
      },
      {
        title: "Fan Edits Worth Adding to Your Watchlist",
        paragraphs: [
          "This week's collected YouTube Shorts highlight different sides of Karina.",
          "Her adorable reactions: A Japanese fan clip focuses on Karina's softer expressions, with approximately 120K views shown in the prototype.",
          "Her infectious smile: Another fan edit features Karina's cheerful moments and has attracted approximately 515K views in the screenshot.",
          "A glimpse into her early days: A Korean-language short revisits a story about Karina's early part-time work, offering fans another piece of background material to explore.",
          "Together, these clips provide a mix of funny moments, memorable expressions, and older stories. Their full narratives have not been independently verified beyond the available titles and previews.",
        ],
      },
      {
        title: "Across X & TikTok: Karina Curated Highlights",
        paragraphs: [
          "We also collected five Karina-related X posts and five TikTok videos for this week's personalized collection.",
          "These selections offer more Karina-focused content beyond YouTube, with original links available for fans who want to explore further.",
        ],
        curated: { label: "Curated Collection" },
        note: "The posts were manually selected. Their exact content, engagement, and publication dates have not all been independently verified.",
      },
    ],
    watchlist:
      "Start with Vogue's interview, catch up on Karina's fan edits, check out the Season's Greetings behind-the-scenes video, and explore your curated X and TikTok highlights.",
  },
  "winrina-cp": {
    id: "winrina-cp",
    badge: "For Your Ship",
    title: "Winrina Weekly: Moments Worth Rewatching",
    subtitle: "October 11–17, 2026 · Jinminjeong / Winrina · 3 min read",
    image: winrinaImage,
    imageCredit: "yujiverse.exe (@yujiverse_exe) on X",
    glance: [
      "Winrina fans have a collection of moments to revisit this week — from playful stage interactions and funny compilations to aespa's latest group content.",
      "Here's your quick catch-up on the public moments and fan-created highlights surrounding Karina and Winter.",
    ],
    sections: [
      {
        title: "Playful Stage Interactions Steal the Spotlight",
        paragraphs: [
          "One of this week's collected YouTube Shorts features Karina and Winter interacting onstage. In the visible preview, the two face each other and exchange playful gestures.",
          "Another fan edit by aescorpi focuses on Karina teasing Winter, presenting their interactions in a lighthearted and humorous way.",
          "Whether you're catching up on old moments or discovering clips for the first time, these videos are a fun starting point for exploring their public interactions.",
        ],
        source: {
          label: "Curated YouTube fan edits · Approximately 14.7K and 3K views in the screenshots.",
        },
      },
      {
        title: "Why Fans Keep Revisiting Their Dynamic",
        paragraphs: [
          "Several other collected YouTube edits highlight the playful contrast between Karina and Winter.",
          "One video frames the pairing around the idea of being \"soulmates,\" while another focuses on Winter's reactions when she's around Karina.",
          "These fan-made compilations bring together public appearances and interactions into short, entertaining stories.",
          "They're a good example of how shipping communities reinterpret familiar clips and give older moments new attention.",
        ],
        note: "The themes above come from video titles and previews. Fan interpretations are not evidence of a private romantic relationship.",
      },
      {
        title: "More aespa Moments in Vogue's Never Have I Ever",
        paragraphs: [
          "aespa's Never Have I Ever interview with Vogue offered another opportunity to see the members' personalities beyond their stage performances.",
          "The group shared memories from their dorm days, including how they used to share clothes and navigate life together as trainees.",
          "They also joked about each other's habits, including Karina's talent for falling asleep.",
          "For Winrina fans, group interviews like this provide a more relaxed setting to observe the members' long-standing familiarity and interactions.",
        ],
        source: VOGUE,
      },
      {
        title: "New Official Content: aespa's Season's Greetings",
        paragraphs: [
          "On October 16, aespa released behind-the-scenes content for their 2027 Season's Greetings.",
          "The video features the group's seasonal styling and production visuals, making it another official update worth checking out if you follow both Karina and Winter.",
          "While the material features the group, specific Winrina interactions would need to be confirmed by reviewing the full video.",
        ],
        source: {
          label: "aespa Official YouTube — 2027 aespa SEASON'S GREETINGS BEHIND.",
          url: "https://www.youtube.com/@aespa",
        },
      },
      {
        title: "Your Winrina Picks Across X & TikTok",
        paragraphs: [
          "Beyond YouTube, we've curated five X posts and five TikTok videos specifically for Jinminjeong / Winrina fans.",
          "These posts expand your watchlist with pairing-focused material chosen for the prototype. Rather than treating them as verified platform-wide trends, we're presenting them as a curated selection of content to explore.",
        ],
        curated: { label: "Winrina Picks" },
        note: "Exact video narratives and engagement statistics require further source verification.",
      },
    ],
    watchlist:
      "Start with the stage interaction compilations, revisit the playful Winrina edits, catch up on Vogue's group interview, and explore your curated X and TikTok collection.",
  },
};
