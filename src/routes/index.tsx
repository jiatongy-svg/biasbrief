import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Shell, Chip } from "@/components/Shell";
import {
  ARTISTS,
  DEMO_GROUP_ID,
  getArtist,
  pairingId,
  pairingLabel,
  resolvePairing,
  type Artist,
  type GroupType,
} from "@/lib/artists";
import { INTERESTS, STAN_TYPES, loadPrefs, savePrefs, type StanType } from "@/lib/data";
import { groupImagesQueryOptions } from "@/lib/youtube-query";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, Info } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiasBrief — Your K-pop Fandom Daily Digest" },
      {
        name: "description",
        content:
          "Pick your group, bias, CPs and stan style. Get a personalized daily K-pop digest in minutes.",
      },
      { property: "og:title", content: "BiasBrief — Your K-pop Fandom Daily Digest" },
      {
        property: "og:description",
        content: "Personalized idol updates and fan buzz in one 3-minute read.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

const FILTERS: { id: "all" | GroupType; label: string }[] = [
  { id: "all", label: "All Groups" },
  { id: "girl", label: "Girl Groups" },
  { id: "boy", label: "Boy Groups" },
];

function Index() {
  const nav = useNavigate();
  const [filter, setFilter] = useState<"all" | GroupType>("all");
  const [group, setGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [cps, setCps] = useState<string[]>([]);
  const [stanType, setStanType] = useState<StanType>("Group stan");
  const [interests, setInterests] = useState<string[]>([]);
  const [pairDraft, setPairDraft] = useState<string[]>([]);
  const { data: images = {} } = useQuery(groupImagesQueryOptions);

  useEffect(() => {
    const p = loadPrefs();
    if (p) {
      setGroup(p.group);
      setMembers(p.members);
      setCps(p.cps);
      setStanType(p.stanType);
      setInterests(p.interests);
    }
  }, []);

  const artist = getArtist(group ?? undefined);
  const pickGroup = (id: string) => {
    if (id === group) return;
    setGroup(id);
    setMembers([]);
    setCps([]);
    setPairDraft([]);
  };
  const addDraftPair = (id: string) => {
    if (!artist) return;
    const next = toggle(pairDraft, id);
    if (next.length === 2) {
      setCps((list) => [...new Set([...list, pairingId(next[0]!, next[1]!, artist)])]);
      setPairDraft([]);
    } else setPairDraft(next);
  };
  const cpNeeded = stanType === "CP fan" && !cps.length;

  return (
    <Shell>
      <section className="pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Live demo · aespa
        </p>
        <h1 className="font-display mt-2 text-5xl font-bold leading-[1.05] sm:text-6xl">
          Your fandom,
          <br />
          in three minutes.
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Tell us who you stan. We'll pull official updates and fan buzz into one brief — clearly
          labeled, always sourced.
        </p>
      </section>

      <div className="max-w-4xl space-y-10">
        <Block n="1" title="Which group are you interested in?">
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Chip key={f.id} on={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {ARTISTS.filter((a) => filter === "all" || a.group_type === filter).map((a) => (
              <GroupCard
                key={a.group_id}
                artist={a}
                image={images[a.group_id] ?? null}
                selected={group === a.group_id}
                onSelect={() => pickGroup(a.group_id)}
              />
            ))}
          </div>
          {artist && artist.demo_support_status !== "full" && (
            <p
              role="status"
              className="mt-4 flex gap-2 rounded-lg border border-border bg-muted p-4 text-sm"
            >
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              Full personalized demo currently available for aespa. Basic artist information and
              available YouTube updates are supported for other groups.
            </p>
          )}
        </Block>

        {artist && (
          <>
            <Block n="2" title={`Your bias(es) in ${artist.group_name}`}>
              <div className="flex flex-wrap gap-2">
                {artist.members.map((x) => (
                  <Chip
                    key={x.id}
                    on={members.includes(x.id)}
                    onClick={() => setMembers(toggle(members, x.id))}
                  >
                    {x.stage_name} <span className="text-xs opacity-70">{x.korean_name}</span>
                  </Chip>
                ))}
              </div>
            </Block>

            <Block n="3" title="How do you stan?">
              <div className="flex flex-wrap gap-2">
                {STAN_TYPES.map((s) => (
                  <Chip key={s} on={stanType === s} onClick={() => setStanType(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
              <p className="mb-2 mt-5 text-sm font-semibold">Other fandom interests</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Chip
                    key={i.id}
                    on={interests.includes(i.id)}
                    onClick={() => setInterests(toggle(interests, i.id))}
                  >
                    {i.label}
                  </Chip>
                ))}
              </div>
            </Block>

            <Block n="4" title={`CPs you follow${stanType === "CP fan" ? "" : " (optional)"}`}>
              <div className="flex flex-wrap gap-2">
                {artist.pairings.map((p) => (
                  <Chip
                    key={p.id}
                    on={cps.includes(p.id)}
                    onClick={() => setCps(toggle(cps, p.id))}
                  >
                    ♡ {pairingLabel(artist, p)}
                  </Chip>
                ))}
                {cps
                  .filter((id) => !artist.pairings.some((p) => p.id === id))
                  .map((id) => (
                    <Chip key={id} on onClick={() => setCps(toggle(cps, id))}>
                      ♡ {pairingLabel(artist, resolvePairing(artist, id)!)}
                    </Chip>
                  ))}
              </div>
              <p className="mb-2 mt-5 text-sm font-semibold">Or pair any two members</p>
              <div className="flex flex-wrap gap-2">
                {artist.members.map((x) => (
                  <Chip key={x.id} on={pairDraft.includes(x.id)} onClick={() => addDraftPair(x.id)}>
                    {x.stage_name}
                  </Chip>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                CPs are fan interpretations of public interactions — BiasBrief doesn't treat them as
                real relationships.
              </p>
            </Block>
          </>
        )}

        <div>
          <Button
            disabled={!artist || cpNeeded}
            onClick={() => {
              if (!artist) return;
              savePrefs({ group: artist.group_id, members, cps, stanType, interests });
              nav({ to: "/digest" });
            }}
            className="card-pop h-14 w-full rounded-lg border border-foreground font-display text-lg font-bold"
          >
            <span className="text-primary-foreground/70">5.</span> Save & get my brief{" "}
            <ArrowUpRight />
          </Button>
          {!artist && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Pick a group to continue.
            </p>
          )}
          {cpNeeded && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Pick at least one pairing for CP mode.
            </p>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sources: verified official YouTube channels + public YouTube search. Fan content is always
          labeled.
        </p>
      </div>
    </Shell>
  );
}

function GroupCard({
  artist,
  image,
  selected,
  onSelect,
}: {
  artist: Artist;
  image: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "card-pop border-foreground" : "border-border hover:border-primary"}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-stage text-stage-foreground">
        {image ? (
          <img
            src={image}
            alt={`${artist.group_name} official YouTube channel image`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="font-display flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-stage text-4xl font-bold"
          >
            {artist.group_name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {selected && (
          <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-foreground bg-secondary text-secondary-foreground">
            <Check aria-hidden="true" className="size-5" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="font-display text-xl font-bold leading-tight">{artist.group_name}</p>
          <p className="text-xs text-muted-foreground">{artist.korean_name}</p>
        </div>
        {artist.group_id === DEMO_GROUP_ID && (
          <span className="w-fit rounded-sm border border-foreground bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-secondary-foreground">
            FULL DEMO AVAILABLE
          </span>
        )}
        <span
          className={`mt-auto w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${artist.group_type === "girl" ? "bg-buzz text-buzz-foreground" : "bg-verified text-verified-foreground"}`}
        >
          {artist.group_type === "girl" ? "Girl Group" : "Boy Group"}
        </span>
        <span className="sr-only">{selected ? "Selected" : "Not selected"}</span>
      </div>
    </button>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display mb-3 text-xl font-bold">
        <span className="text-primary">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}
