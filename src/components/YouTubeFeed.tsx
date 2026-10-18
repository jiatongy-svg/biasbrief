import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  ExternalLink,
  Heart,
  MessageCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Users,
  Youtube,
} from "lucide-react";
import type { ReactNode } from "react";
import { Chip } from "./Shell";
import { Skeleton } from "./ui/skeleton";
import { getArtist, getMember, pairingLabel, resolvePairing, type Artist } from "@/lib/artists";
import type { Prefs } from "@/lib/data";
import { WINDOWS, type FeedVideo, type FeedWindow, type Section } from "@/lib/feed";
import { feedQueryOptions } from "@/lib/youtube-query";

const SECTIONS: { id: Section; title: string; icon: ReactNode; blurb: string }[] = [
  {
    id: "official",
    title: "Official Updates",
    icon: <BadgeCheck className="text-verified-foreground" />,
    blurb: "Recent uploads from verified channels for your group.",
  },
  {
    id: "bias",
    title: "For Your Bias",
    icon: <Sparkles className="text-primary" />,
    blurb: "Videos that name the members you follow.",
  },
  {
    id: "cp",
    title: "CP Highlights",
    icon: <Heart className="text-primary" />,
    blurb:
      "Fan edits, compilations and public interactions for your pairings. These are fan interpretations, not statements about real relationships.",
  },
  {
    id: "buzz",
    title: "Fandom Buzz",
    icon: <Users className="text-buzz-foreground" />,
    blurb:
      "Fancams, edits, reactions and covers from across YouTube, ranked by relevance and recent engagement.",
  },
];

interface Props {
  prefs: Prefs;
  days: FeedWindow;
  onDaysChange?: (days: FeedWindow) => void;
  /** Only show videos published within this many days (≤ days). */
  maxAgeDays?: number;
  perSection?: number;
}

export function YouTubeFeed({
  prefs,
  days,
  onDaysChange,
  maxAgeDays = days,
  perSection = 8,
}: Props) {
  const artist = getArtist(prefs.group)!;
  const { data, isPending, isError, isFetching, refetch } = useQuery(feedQueryOptions(prefs, days));
  const cutoff = Date.now() - maxAgeDays * 86_400_000;
  const visible = (section: Section) =>
    (data?.sections[section] ?? [])
      .filter((v) => Date.parse(v.published_at) >= cutoff)
      .slice(0, perSection);
  const shown = SECTIONS.filter(
    (s) => (s.id !== "cp" || prefs.cps.length > 0) && (s.id !== "bias" || prefs.members.length > 0),
  );
  const total = shown.reduce((n, s) => n + visible(s.id).length, 0);

  return (
    <section aria-labelledby="youtube-heading" className="mt-8 border-y border-border py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="youtube-heading"
          className="font-display flex items-center gap-2 text-2xl font-bold"
        >
          <Youtube className="text-primary" />
          Your YouTube brief
        </h2>
        {onDaysChange && (
          <div className="flex flex-wrap gap-2">
            {WINDOWS.map((d) => (
              <Chip key={d} on={days === d} onClick={() => onDaysChange(d)}>
                Past {d} days
              </Chip>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {data?.updated_at && (
          <span>
            Last updated{" "}
            {new Date(data.updated_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {data.served_from_cache ? " · cached" : ""}
          </span>
        )}
        {data && artist.demo_support_status !== "full" && (
          <span>
            Basic support: official uploads + group buzz. Full personalization is available for
            aespa.
          </span>
        )}
        {data && (
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1 underline-offset-2 hover:underline disabled:opacity-50"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-3 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        )}
      </div>

      {isPending && <LoadingState />}
      {isError && (
        <p role="alert" className="mt-5 text-sm">
          We couldn't reach the feed service. Check your connection and try Refresh.
        </p>
      )}
      {data && data.notices.length > 0 && (
        <ul
          role="status"
          className="mt-5 space-y-1 rounded-lg border border-border bg-muted p-4 text-sm"
        >
          {data.notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {data && data.status !== "not_configured" && data.status !== "unavailable" && total === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          No matching videos were published in the last {maxAgeDays} days. Try a longer window.
        </p>
      )}

      {data &&
        total > 0 &&
        shown.map((s) => (
          <FeedSection key={s.id} {...s} artist={artist} prefs={prefs} videos={visible(s.id)} />
        ))}

      {data && data.queries.length > 0 && (
        <details className="mt-8 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold">How this feed was built</summary>
          <p className="mt-2">
            Videos are ranked from YouTube metadata only — title, description, publish date, views,
            comments and likes. We don't watch videos or read comments. The score mixes relevance to
            your picks (50%), recency (20%) and views/comments per day since publishing on a log
            scale (30%); it isn't a measure of global popularity.
          </p>
          <p className="mt-2 font-semibold">YouTube searches used ({data.days}-day window):</p>
          <ul className="mt-1 list-disc pl-5">
            {data.queries.map((q) => (
              <li key={q.q}>
                <span className="uppercase">{q.category}</span> · <code>{q.q}</code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function FeedSection({
  id,
  title,
  icon,
  blurb,
  videos,
  artist,
  prefs,
}: {
  id: Section;
  title: string;
  icon: ReactNode;
  blurb: string;
  videos: FeedVideo[];
  artist: Artist;
  prefs: Prefs;
}) {
  return (
    <div className="mt-8" aria-labelledby={`feed-${id}`}>
      <h3 id={`feed-${id}`} className="font-display flex items-center gap-2 text-xl font-bold">
        {icon}
        {title}
      </h3>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{blurb}</p>
      {videos.length ? (
        <ol className="grid gap-4 md:grid-cols-2">
          {videos.map((v) => (
            <VideoCard key={v.video_id} video={v} artist={artist} prefs={prefs} />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing here in this window yet.</p>
      )}
    </div>
  );
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const SOURCE_LABEL = {
  official: { text: "✓ Official", cls: "bg-verified text-verified-foreground" },
  "fan-created": { text: "💬 Fan content", cls: "bg-buzz text-buzz-foreground" },
  unknown: { text: "Unverified channel", cls: "bg-muted text-muted-foreground" },
} as const;

function VideoCard({ video, artist, prefs }: { video: FeedVideo; artist: Artist; prefs: Prefs }) {
  const label = SOURCE_LABEL[video.source_type];
  const pairing = video.matched_cp_pairing
    ? resolvePairing(artist, video.matched_cp_pairing)
    : undefined;
  const b = video.score_breakdown;
  return (
    <li className="card-pop flex flex-col overflow-hidden rounded-lg border border-foreground bg-card">
      <a
        href={video.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-video bg-stage"
        tabIndex={-1}
        aria-hidden="true"
      >
        {video.thumbnail_url && (
          <img
            src={video.thumbnail_url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        )}
      </a>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${label.cls}`}>
            {label.text}
          </span>
          <span className="font-semibold text-primary">{video.channel_title}</span>
          <time dateTime={video.published_at} className="text-muted-foreground">
            {new Date(video.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
        <h4 className="font-display text-lg font-bold leading-snug">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {video.title}
            <ExternalLink aria-hidden="true" className="ml-2 inline size-4" />
          </a>
        </h4>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye aria-hidden="true" className="size-3.5" />
            {video.view_count == null ? "Views n/a" : `${compact.format(video.view_count)} views`}
          </span>
          {video.comment_count != null && (
            <span className="inline-flex items-center gap-1">
              <MessageCircle aria-hidden="true" className="size-3.5" />
              {compact.format(video.comment_count)} comments
            </span>
          )}
        </div>
        {(video.matched_members.length > 0 || pairing) && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {video.matched_members.map((id) => (
              <span
                key={id}
                className={`rounded-sm border px-2 py-0.5 ${prefs.members.includes(id) ? "border-primary text-primary" : "border-border"}`}
              >
                {getMember(artist, id)?.stage_name}
              </span>
            ))}
            {pairing && (
              <span className="rounded-sm border border-primary px-2 py-0.5 text-primary">
                ♡ {pairingLabel(artist, pairing)}
              </span>
            )}
          </div>
        )}
        <p className="mt-3 text-sm">{video.reason}</p>
        <p
          className="mt-auto pt-3 text-[11px] text-muted-foreground"
          title="Relevance 50% · recency 20% · engagement per day 30%"
        >
          Match score {video.score} · relevance {b.relevance} · recency {b.recency} · engagement{" "}
          {b.engagement ?? "n/a"}
        </p>
      </div>
    </li>
  );
}

function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Loading your YouTube brief"
      className="mt-6 grid gap-4 md:grid-cols-2"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card">
          <Skeleton className="aspect-video w-full rounded-b-none" />
          <div className="space-y-2 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
