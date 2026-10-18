import { Link } from "@tanstack/react-router";
import { ExternalLink, Heart, Star } from "lucide-react";
import type { DemoDigest } from "@/data/demoDigests";
import { TikTokLogo, XLogo } from "./CuratedCard";

export function DemoDigestView({ digest }: { digest: DemoDigest }) {
  const ship = digest.badge === "For Your Ship";
  const Icon = ship ? Heart : Star;
  return (
    <article className="card-pop mt-8 max-w-3xl rounded-lg border border-foreground bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>BiasBrief · Your Weekly Recap</span>
        <span className="flex gap-2 normal-case tracking-normal">
          <span className="rounded-full bg-muted px-2.5 py-0.5">Curated Demo Digest</span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${ship ? "bg-buzz text-buzz-foreground" : "bg-verified text-verified-foreground"}`}
          >
            {digest.badge}
          </span>
        </span>
      </div>
      <h2 className="font-display mt-3 flex items-center gap-2 text-3xl font-bold">
        {digest.title} <Heart aria-hidden="true" className="size-6 shrink-0 text-primary" />
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{digest.subtitle}</p>
      <figure className="mt-5">
        <img
          src={digest.image}
          alt={digest.title}
          className="aspect-video w-full rounded-lg object-cover"
        />
        <figcaption className="mt-1 text-xs text-muted-foreground">{digest.imageCredit}</figcaption>
      </figure>

      <section className="mt-6 rounded-lg bg-muted p-5">
        <h3 className="font-display text-lg font-bold">This Week at a Glance</h3>
        {digest.glance.map((p) => (
          <p key={p} className="mt-2 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      {digest.sections.map((s, i) => (
        <section key={s.title} className="mt-8">
          <h3 className="font-display flex items-center gap-2 text-xl font-bold">
            <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
            {String(i + 1).padStart(2, "0")}. {s.title}
          </h3>
          {s.paragraphs.map((p) => (
            <p key={p} className="mt-3 leading-relaxed">
              {p}
            </p>
          ))}
          {s.curated && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <Link
                to="/digest"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-background"
              >
                <XLogo /> 5 X Posts
              </Link>
              <Link
                to="/digest"
                className="inline-flex items-center gap-1.5 rounded-full bg-stage px-3 py-1 text-stage-foreground"
              >
                <TikTokLogo /> 5 TikTok Videos
              </Link>
              <span className="rounded-full border border-border px-3 py-1">{s.curated.label}</span>
            </div>
          )}
          {s.note && <p className="mt-3 text-sm italic text-muted-foreground">{s.note}</p>}
          {s.source && (
            <p className="mt-3 text-sm text-muted-foreground">
              Source:{" "}
              {s.source.url ? (
                <a
                  href={s.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  {s.source.label}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : (
                s.source.label
              )}
            </p>
          )}
        </section>
      ))}

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="font-display text-lg font-bold">Your Weekly Watchlist</h3>
        <p className="mt-2 leading-relaxed">{digest.watchlist}</p>
      </section>
    </article>
  );
}
