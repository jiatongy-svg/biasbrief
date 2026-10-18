import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Chip } from "@/components/Shell";
import { loadPrefs, type Prefs } from "@/lib/data";
import { YouTubeFeed } from "@/components/YouTubeFeed";

export const Route = createFileRoute("/catch-up")({
  head: () => ({
    meta: [
      { title: "Catch-up Mode — BiasBrief" },
      {
        name: "description",
        content:
          "Been away? Catch up on the last 3, 7 or 14 days of your fandom in 1, 3 or 10 minutes.",
      },
      { property: "og:title", content: "Catch-up Mode — BiasBrief" },
      { property: "og:description", content: "Catch up on your fandom at your own pace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatchUp,
});

// Roughly how many videos per section fit in the reading time.
const PER_SECTION: Record<number, number> = { 1: 2, 3: 4, 10: 8 };

function CatchUp() {
  const [prefs, setPrefs] = useState<Prefs | null | undefined>(undefined);
  const [days, setDays] = useState(7);
  const [mins, setMins] = useState(3);
  useEffect(() => setPrefs(loadPrefs()), []);

  return (
    <Shell>
      <h1 className="font-display text-4xl font-bold">Catch-up mode</h1>
      <p className="mt-2 text-muted-foreground">
        Been away? We'll fit what matters into your time.
      </p>
      <div className="mt-6 space-y-4">
        <Row label="I missed">
          {[3, 7, 14].map((d) => (
            <Chip key={d} on={days === d} onClick={() => setDays(d)}>
              {d} days
            </Chip>
          ))}
        </Row>
        <Row label="I have">
          {[1, 3, 10].map((m) => (
            <Chip key={m} on={mins === m} onClick={() => setMins(m)}>
              {m} min
            </Chip>
          ))}
        </Row>
      </div>
      {prefs === null && (
        <p className="mt-6 text-sm">
          <Link to="/" className="text-primary underline">
            Set your profile
          </Link>{" "}
          to catch up on your fandom.
        </p>
      )}
      {/* The 7-day feed covers 3 and 7 days; filtering keeps one cached search per window. */}
      {prefs && (
        <YouTubeFeed
          prefs={prefs}
          days={days > 7 ? 14 : 7}
          maxAgeDays={days}
          filterCuratedByDate
          perSection={PER_SECTION[mins] ?? 4}
        />
      )}
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-sm font-semibold">{label}</span>
      {children}
    </div>
  );
}
