import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Eye, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// A walkthrough of what connecting will look like. Nothing here talks to the platform:
// no redirect, no token, no data. Every step says so.
const STEPS = ["Approve on platform", "Back to BiasBrief", "Match to your fandom", "In your feed"];

export function ConnectFlowPreview({ name, permissions }: { name: string; permissions: string[] }) {
  const [step, setStep] = useState(0);
  return (
    <Dialog onOpenChange={(open) => open && setStep(0)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="mt-2 w-full">
          <Eye />
          Preview the flow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <p className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
          Prototype preview · no account connected
        </p>
        <DialogTitle className="font-display text-2xl">Connect {name}</DialogTitle>
        <DialogDescription>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </DialogDescription>
        <ol className="flex gap-1" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </ol>

        <div className="min-h-56 rounded-lg border border-border bg-card p-4 text-sm">
          {step === 0 && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <LockKeyhole className="size-4" />
                On {name}: “BiasBrief wants to access your account”
              </p>
              <ul className="mt-3 space-y-2">
                {permissions.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-muted-foreground">
                You'd sign in on {name} itself. BiasBrief never sees your password, and can't post,
                like, follow or DM.
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <p className="font-semibold">{name} sends you back to BiasBrief</p>
              <p className="mt-2 text-muted-foreground">
                BiasBrief would receive a revocable access token — not your password. You can
                disconnect anytime here or in your {name} settings.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-primary" />
                Matching posts to your fandom
              </p>
              <p className="mt-2 text-muted-foreground">
                Posts you can see on {name} would run through the same rules as YouTube: your group,
                members, pairings and fan mode. Shipping content only reaches fans who follow that
                pairing.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <p className="font-semibold">Where it shows up</p>
              <p className="mt-2 text-muted-foreground">
                Matched {name} posts would join For Your Bias, For Your Ship and Fandom Buzz,
                labeled “{name}” instead of today's “Curated”. Today's X and TikTok picks already
                use this same card and data format.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/digest">
                  See today's curated version
                  <ArrowRight />
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight />
            </Button>
          ) : (
            <p className="self-center text-xs text-muted-foreground">
              Preview complete · no account was connected.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
