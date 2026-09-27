import React from "react";
import { Siren, Eye, VenetianMask, Flame, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATES = {
  silent: { label: "Silent & Sneaky", icon: Eye, color: "text-emerald-400", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  con: { label: "The Big Con", icon: VenetianMask, color: "text-sky-400", chip: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  aggressive: { label: "Aggressive", icon: Flame, color: "text-rose-400", chip: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

export default function EscalationPanel({ escalation, checkFailed, loading, onSetInitial, onFailCheck, onPlanB }) {
  const st = escalation?.state || "silent";
  const meta = STATES[st];
  const StateIcon = meta.icon;
  const isAggressive = st === "aggressive";

  return (
    <div className="rounded-lg border border-border bg-card/50 p-2.5 mb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Siren className={cn("w-4 h-4", meta.color)} />
        <span className="text-xs font-medium">Heist-eskalering</span>
        <span className={cn("ml-auto text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1", meta.chip)}>
          <StateIcon className="w-3 h-3" /> {meta.label}
        </span>
      </div>

      {isAggressive ? (
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-[11px] text-rose-200/90 rounded-md bg-rose-500/10 border border-rose-500/30 p-1.5">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
            <span>Alarm utløst — kan ikke gå tilbake til Silent & Sneaky.</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {escalation?.guard_count > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">+{escalation.guard_count} vakter</span>
            )}
            {escalation?.difficulty_mod > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">DC +{escalation.difficulty_mod}</span>
            )}
            {escalation?.sneaky_closed && (
              <span className="px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/30 text-slate-300">Snikende løs. stengt</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted-foreground">Start-tilstand</div>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(STATES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => onSetInitial(k)}
                className={cn("text-[10px] px-1 py-1 rounded-md border transition-colors", st === k ? v.chip : "border-border text-muted-foreground hover:text-foreground")}
              >
                {v.label.split(" ")[0]}
              </button>
            ))}
          </div>
          <Button onClick={onFailCheck} size="sm" variant="outline" className="w-full h-7 text-[11px] gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5" /> {checkFailed ? "Sjekk registrert feilet" : "Sjekk feilet"}
          </Button>
          <Button onClick={onPlanB} disabled={!checkFailed || loading} size="sm" variant="outline" className="w-full h-7 text-[11px] gap-1.5 border-rose-500/50 text-rose-300 hover:bg-rose-500/15 disabled:opacity-40">
            <Siren className="w-3.5 h-3.5" /> {loading ? "Utløser…" : "Plan B — utløs alarm"}
          </Button>
          {!checkFailed && <div className="text-[10px] text-muted-foreground/70 leading-snug">Merk en feilet sjekk først for å få Plan B.</div>}
        </div>
      )}
    </div>
  );
}