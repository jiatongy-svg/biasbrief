import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import aespaImage from "@/assets/hero-aespa.jpg";
import blackpinkImage from "@/assets/hero-blackpink.jpg";
import strayKidsImage from "@/assets/hero-stray-kids.jpg";
import seventeenImage from "@/assets/hero-seventeen.jpg";

const HERO_SLIDES = [
  { src: aespaImage, name: "aespa", position: "50% 25%" },
  { src: blackpinkImage, name: "BLACKPINK", position: "50% 30%" },
  { src: strayKidsImage, name: "Stray Kids", position: "50% 40%" },
  { src: seventeenImage, name: "SEVENTEEN", position: "50% 30%" },
];
const SLIDE_MS = 5000;

function HeroSlides() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <>
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.name}
          src={slide.src}
          alt={i === active ? `${slide.name} group photo` : ""}
          aria-hidden={i !== active}
          loading={i === 0 ? "eager" : "lazy"}
          style={{ objectPosition: slide.position }}
          className={`hero-slide absolute inset-0 -z-20 h-full w-full object-cover ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-stage via-stage/70 to-stage/10"
      />
      <div
        className="absolute bottom-4 right-5 flex items-center gap-2 sm:right-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="mr-1 text-xs font-bold uppercase tracking-widest text-stage-foreground/90">
          {HERO_SLIDES[active]!.name}
        </span>
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.name}
            type="button"
            aria-label={`Show ${slide.name}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-secondary" : "w-2 bg-stage-foreground/60 hover:bg-stage-foreground"}`}
          />
        ))}
      </div>
    </>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="font-display flex items-center gap-2 text-2xl font-bold">
            <Sparkles aria-hidden="true" className="size-6 text-primary" />
            Bias<span className="-ml-2 text-primary">Brief</span>
          </Link>
          <nav aria-label="Main navigation" className="flex flex-wrap gap-1 text-sm">
            {(
              [
                ["/", "Profile"],
                ["/digest", "Today"],
                ["/catch-up", "Catch-up"],
                ["/connections", "Connections"],
              ] as const
            ).map(([to, l]) => (
              <Button key={to} asChild variant="ghost" size="sm" className="rounded-md">
                <Link
                  to={to}
                  activeProps={{
                    className:
                      "bg-foreground text-background hover:bg-foreground hover:text-background",
                  }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  activeOptions={{ exact: true }}
                >
                  {l}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>
      <div className="relative isolate h-[280px] overflow-hidden bg-stage text-stage-foreground sm:h-[300px]">
        <HeroSlides />
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-5 sm:px-8">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary">
            <Star className="size-4" aria-hidden="true" />
            For the fans. Always.
          </p>
          <p className="stage-title font-display font-bold">
            BiasBrief<span className="text-secondary">.</span>
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-widest">
            Your daily fandom fix
          </p>
        </div>
      </div>
      <div className="border-y border-foreground bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 text-xs font-bold uppercase tracking-widest sm:px-8">
          <span>K-pop · On repeat</span>
          <Star aria-hidden="true" className="size-4" />
          <span>Bias. Buzz. Brief.</span>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">{children}</main>
      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        BiasBrief <span className="text-primary">✦</span> Made for your fandom
      </footer>
    </div>
  );
}

export function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      aria-pressed={on}
      onClick={onClick}
      variant="outline"
      className={`h-10 rounded-md border px-4 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "border-border bg-card hover:border-primary hover:bg-accent"}`}
    >
      {children}
    </Button>
  );
}
