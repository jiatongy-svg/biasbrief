import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, AtSign, Check, Instagram, LockKeyhole, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ConnectFlowPreview } from "@/components/ConnectFlowPreview";

export const Route = createFileRoute("/connections")({
  head: () => ({ meta: [
    { title: "Social Connections — BiasBrief" },
    { name: "description", content: "Review social account permissions for your personalized BiasBrief." },
    { property: "og:title", content: "Social Connections — BiasBrief" },
    { property: "og:description", content: "Review access for your X, Instagram and Threads accounts in BiasBrief." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Connections,
});

const platforms = [
  { id: "x", name: "X", heading: "X / Twitter", profile: "Your name, username and account ID.", posts: "Read posts you can access", detail: "Bring X updates into your fandom brief." },
  { id: "instagram", name: "Instagram", heading: "Instagram", profile: "Your username and basic account details.", posts: "Read your photos and videos", detail: "Bring posts from your connected Instagram account into your brief." },
  { id: "threads", name: "Threads", heading: "Threads", profile: "Your username and basic account details.", posts: "Read your Threads posts", detail: "Bring posts from your connected Threads account into your brief." },
];

function Connections() {
  return (
    <Shell>
      <section className="pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your accounts · Your choice</p>
        <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">Social connections</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">Choose what you share with BiasBrief. Review access before connecting your social account.</p>
      </section>

      <div className="grid items-stretch gap-5 lg:grid-cols-3">
      {platforms.map((platform) => (
      <section key={platform.id} aria-labelledby={`${platform.id}-heading`} className="connection-card flex flex-col rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-foreground font-display text-3xl text-background">{platform.id === "instagram" ? <Instagram className="size-7" /> : platform.id === "threads" ? <AtSign className="size-7" /> : "𝕏"}</span>
            <div><h2 id={`${platform.id}-heading`} className="font-display text-2xl font-bold">{platform.heading}</h2><p className="text-sm text-muted-foreground">Your personal account</p></div>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">Not connected</span>
        </div>

        <div className="my-6 border-y py-6">
          <h3 className="font-display text-lg font-bold">Planned access</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {[
              ["Read your profile", platform.profile],
              [platform.posts, platform.detail],
              ["Keep your connection active", "Renew access without asking you to reconnect every time."],
            ].map(([title, detail]) => (
              <li key={title} className="flex gap-3"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-semibold">{title}</p><p className="mt-0.5 text-muted-foreground">{detail}</p></div></li>
            ))}
          </ul>
          <p className="mt-5 flex items-start gap-3 text-sm text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-5 shrink-0" />No posting, liking, following or direct-message access requested.</p>
        </div>

        <div role="status" className="mb-5 flex flex-1 gap-3 border-l-2 border-border pl-3 text-sm">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div><p className="font-semibold">Connection setup pending</p><p className="mt-1 text-muted-foreground">{platform.name} authorization isn’t available yet. BiasBrief needs its {platform.name} connection configured and user sign-in enabled first. No account access has been granted.</p>{platform.id !== "x" && <p className="mt-2 text-muted-foreground">Available access will depend on your account and the permissions approved by {platform.name}.</p>}</div>
        </div>
        <Button disabled size="lg" className="w-full"><ArrowUpRight />Authorize with {platform.name}</Button>
        <ConnectFlowPreview name={platform.name} permissions={["Read your profile", platform.posts, "Keep your connection active"]} />
        <p className="mt-3 text-center text-xs text-muted-foreground">When available, you’ll approve access securely on {platform.name}. You won’t share your password with BiasBrief.</p>
      </section>
      ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost"><Link to="/"><ArrowLeft />Back to profile</Link></Button>
        <Button asChild variant="outline"><Link to="/digest">Continue without connecting<ArrowUpRight /></Link></Button>
      </div>
    </Shell>
  );
}