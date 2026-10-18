import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { getMember, pairingLabel, resolvePairing, type Artist } from "@/lib/artists";
import type { CuratedFeedItem } from "@/lib/curated";

export function XLogo({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
    </svg>
  );
}

export function TikTokLogo({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.3 6.2V8.7a7.6 7.6 0 0 0 4.4 1.4V6.8a4.4 4.4 0 0 1-4.4-4.4Z" />
    </svg>
  );
}

// ── X: official widgets.js, loaded once on demand ──
interface Twttr {
  widgets: {
    createTweet(
      id: string,
      el: HTMLElement,
      options?: Record<string, unknown>,
    ): Promise<HTMLElement | undefined>;
  };
}
declare global {
  interface Window {
    twttr?: Twttr & { ready?: (cb: (t: Twttr) => void) => void };
  }
}
let xLoader: Promise<Twttr> | null = null;
function loadX(): Promise<Twttr> {
  xLoader ??= new Promise<Twttr>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.onload = () =>
      window.twttr?.ready
        ? window.twttr.ready(resolve)
        : window.twttr
          ? resolve(window.twttr)
          : reject(new Error("no twttr"));
    s.onerror = () => {
      xLoader = null;
      reject(new Error("widgets.js failed"));
    };
    document.head.appendChild(s);
  });
  return xLoader;
}

function XEmbed({ item }: { item: CuratedFeedItem }) {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");
  useEffect(() => {
    const host = target.current;
    if (!host) return;
    // Fresh node per run: a late createTweet from a cancelled run can't add a duplicate here.
    const el = document.createElement("div");
    host.appendChild(el);
    let cancelled = false;
    setState("loading");
    // Show the fallback if X hasn't rendered after 20s, but still swap the embed in if it arrives later.
    const timer = setTimeout(
      () => !cancelled && setState((s) => (s === "ok" ? s : "failed")),
      20_000,
    );
    loadX()
      .then((t) =>
        t.widgets.createTweet(item.platform_post_id, el, {
          dnt: true,
          conversation: "none",
          align: "center",
        }),
      )
      .then((node) => !cancelled && setState(node ? "ok" : "failed"))
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
      clearTimeout(timer);
      el.remove();
    };
  }, [item.platform_post_id]);
  return (
    <div className="min-h-24">
      <div ref={target} className="[&_.twitter-tweet]:!my-0" />
      {state === "loading" && (
        <p className="py-6 text-center text-xs text-muted-foreground">Loading post from X…</p>
      )}
      {state === "failed" && <Fallback item={item} />}
    </div>
  );
}

function TikTokEmbed({ item }: { item: CuratedFeedItem }) {
  if (!/^\d{10,25}$/.test(item.platform_post_id)) return <Fallback item={item} />;
  return (
    <div className="mx-auto aspect-[9/16] w-full max-w-[325px] overflow-hidden rounded-md bg-stage">
      <iframe
        src={`https://www.tiktok.com/player/v1/${item.platform_post_id}?description=1&music_info=1&rel=0`}
        title={`TikTok video by @${item.creator_handle ?? "unknown"}`}
        loading="lazy"
        allow="encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full border-0"
      />
    </div>
  );
}

/** Shown when an embed can't render. Uses only verified metadata; never guesses the content. */
function Fallback({ item }: { item: CuratedFeedItem }) {
  const where = item.platform === "x" ? "X" : "TikTok";
  return (
    <div className="rounded-md border border-dashed border-border bg-muted p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold">
        {item.platform === "x" ? <XLogo /> : <TikTokLogo />}
        {item.creator_handle ? `@${item.creator_handle}` : `${where} post`}
      </p>
      <p className="mt-1 text-muted-foreground">
        The {where} preview couldn't load here. Open the original to view it.
      </p>
    </div>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  official_announcement: "Official",
  cp_moment: "CP moment",
  cp_edit: "CP edit",
  fan_reaction: "Fan reaction",
  fan_discussion: "Fan discussion",
  fan_capture: "Fan capture",
  fan_edit: "Fan edit",
  fancam: "Fancam",
  brand_campaign: "Campaign",
};

export function CuratedCard({
  item,
  artist,
  followed,
}: {
  item: CuratedFeedItem;
  artist: Artist;
  followed: string[];
}) {
  const isX = item.platform === "x";
  const pairing = item.matched_cp_pairing
    ? resolvePairing(artist, item.matched_cp_pairing)
    : undefined;
  return (
    <li className="card-pop flex flex-col overflow-hidden rounded-lg border border-foreground bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${isX ? "bg-foreground text-background" : "bg-stage text-stage-foreground"}`}
        >
          {isX ? <XLogo className="size-3" /> : <TikTokLogo className="size-3" />}
          Curated {isX ? "X" : "TikTok"}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-semibold ${item.source_type === "official" ? "bg-verified text-verified-foreground" : "bg-buzz text-buzz-foreground"}`}
        >
          {item.source_type === "official" ? "✓ Official account" : "💬 Fan content"}
        </span>
        {item.creator_handle && (
          <span className="font-semibold text-primary">@{item.creator_handle}</span>
        )}
        {item.published_at && (
          <time dateTime={item.published_at} className="text-muted-foreground">
            {new Date(`${item.published_at}T12:00:00Z`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </div>
      <div className="p-4">{isX ? <XEmbed item={item} /> : <TikTokEmbed item={item} />}</div>
      <div className="mt-auto px-5 pb-5">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {item.matched_members.map((id) => (
            <span
              key={id}
              className={`rounded-sm border px-2 py-0.5 ${followed.includes(id) ? "border-primary text-primary" : "border-border"}`}
            >
              {getMember(artist, id)?.stage_name}
            </span>
          ))}
          {pairing && (
            <span className="rounded-sm border border-primary px-2 py-0.5 text-primary">
              ♡ {pairingLabel(artist, pairing)}
            </span>
          )}
          {item.content_categories.map((c) => (
            <span key={c} className="rounded-sm bg-muted px-2 py-0.5 text-muted-foreground">
              {CATEGORY_LABEL[c] ?? c}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm">{item.reason}</p>
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
        >
          View original {isX ? "post on X" : "video on TikTok"}
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </li>
  );
}
