import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { loadPrefs, type Prefs } from "@/lib/data";
import { getArtist, getMember, pairingLabel, resolvePairing } from "@/lib/artists";
import { YouTubeFeed } from "@/components/YouTubeFeed";
import type { FeedWindow } from "@/lib/feed";

export const Route = createFileRoute("/digest")({
  head: () => ({
    meta: [
      { title: "Today's Brief — BiasBrief" },
      {
        name: "description",
        content:
          "Your personalized K-pop daily digest: official updates and fan buzz ranked for you.",
      },
      { property: "og:title", content: "Today's Brief — BiasBrief" },
      {
        property: "og:description",
        content: "Personalized idol updates and fan buzz, ranked for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Digest,
});

function Digest() {
  const [prefs, setPrefs] = useState<Prefs | null | undefined>(undefined);
  const [days, setDays] = useState<FeedWindow>(7);
  useEffect(() => setPrefs(loadPrefs()), []);
  const artist = getArtist(prefs?.group);

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">{new Date().toDateString()}</p>
      <h1 className="font-display mt-1 text-4xl font-bold">Today's brief</h1>
      {prefs === null && (
        <p className="mt-3 text-sm">
          Your brief is built from your picks.{" "}
          <Link to="/" className="text-primary underline">
            Set your profile
          </Link>{" "}
          to get started.
        </p>
      )}
      {prefs && artist && (
        <>
          <p className="mt-3 text-muted-foreground">
            {artist.group_name} · {prefs.stanType}
            {prefs.members.length
              ? ` · ${prefs.members.map((id) => getMember(artist, id)?.stage_name).join(", ")}`
              : ""}
            {prefs.cps.length
              ? ` · ♡ ${prefs.cps.map((id) => pairingLabel(artist, resolvePairing(artist, id)!)).join(", ")}`
              : ""}
            {" · "}
            <Link to="/" className="text-primary underline">
              Edit
            </Link>
          </p>
          <YouTubeFeed prefs={prefs} days={days} onDaysChange={setDays} />
        </>
      )}
    </Shell>
  );
}
