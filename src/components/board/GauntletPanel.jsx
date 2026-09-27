import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Route, Swords, TrendingUp, Gauge, Heart, Zap, AlertTriangle, ChevronDown, ChevronRight, Flame, Skull, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CURVE_LABEL = {
  well_paced: { label: "Godt balansert", color: "text-emerald-400" },
  too_steep: { label: "For brå stigning", color: "text-rose-400" },
  too_flat: { label: "For flat", color: "text-amber-400" },
  uneven: { label: "Ujevn", color: "text-orange-400" },
};
const REACH_LABEL = {
  comfortable: { label: "Komfortabelt", color: "text-emerald-400" },
  balanced: { label: "Balansert", color: "text-emerald-300" },
  strained: { label: "Anstrengt", color: "text-amber-400" },
  depleted: { label: "Utmattet", color: "text-rose-400" },
};
const CHALLENGE_ICON = {
  combat: Swords, elite: Flame, boss: Skull, puzzle: Wand2, hazard: AlertTriangle, rest: Heart,
};
const diffColor = (d) => d <= 3 ? "text-emerald-400" : d <= 6 ? "text-amber-400" : d <= 8 ? "text-orange-400" : "text-rose-400";

export default function GauntletPanel({ gauntlet, loading, onAnalyze, roomCount }) {
  const [open, setOpen] = useState(true);
  const disabled = loading || roomCount < 2;
  const seq = gauntlet?.sequence || [];
  const curve = gauntlet?.difficulty_curve;
  const budget = gauntlet?.resource_budget;
  const warnings = gauntlet?.warnings || [];
  const adjustments = gauntlet?.adjustments || [];
  const hasContent = seq.length > 0 || !!curve || !!budget;

  return (
    <div className="flex items-start gap-3">
      <Button onClick={onAnalyze} disabled={disabled} size="sm" variant="outline" className="gap-2 border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
        <Route className="w-4 h-4" /> {loading ? "Analyserer…" : "Gauntlet-balanse"}
      </Button>
      {hasContent && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 max-w-sm">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-medium text-rose-300 mb-1.5">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Swords className="w-3.5 h-3.5" /> Gauntlet-analyse
          </button>
          {open && (
            <div className="space-y-2">
              {seq.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Løype ({seq.length} rom)</div>
                  <div className="space-y-1">
                    {seq.map((s) => {
                      const Ico = CHALLENGE_ICON[s.challenge_type] || Swords;
                      return (
                        <div key={s.room_id} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <span className={cn("shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center", s.challenge_type === "boss" ? "bg-rose-500 text-rose-50" : "bg-primary/80 text-primary-foreground")}>{s.order + 1}</span>
                          <Ico className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", diffColor(s.difficulty))} />
                          <div className="min-w-0">
                            <span className="text-foreground font-medium">{s.room_label || s.room_id}</span>
                            <span className={cn("ml-1 font-semibold", diffColor(s.difficulty))}>{s.difficulty}/10</span>
                            <span className="flex gap-2 text-muted-foreground/80 mt-0.5">
                              <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />−{s.hp_cost}</span>
                              <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" />−{s.mp_cost}</span>
                            </span>
                            {s.description && <div className="text-muted-foreground/80">{s.description}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {curve && (
                <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-300" />
                  <span><span className={cn("font-medium", (CURVE_LABEL[curve.rating] || {}).color)}>Vanske-kurve: {(CURVE_LABEL[curve.rating] || {}).label || curve.rating}</span>{curve.summary && <span className="text-muted-foreground"> — {curve.summary}</span>}</span>
                </div>
              )}
              {budget && (
                <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                  <Gauge className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-300" />
                  <span>
                    <span className="text-muted-foreground">Ressurs-bruk: </span>
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{budget.total_hp_cost}</span>
                    <span className="mx-1 text-muted-foreground">·</span>
                    <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" />{budget.total_mp_cost}</span>
                    <span className={cn("ml-1 font-medium", (REACH_LABEL[budget.reaches_boss] || {}).color)}>→ {(REACH_LABEL[budget.reaches_boss] || {}).label || budget.reaches_boss} ved boss</span>
                  </span>
                </div>
              )}
              {warnings.map((w, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-rose-300 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{w}</span>
                </div>
              ))}
              {adjustments.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Justeringer</div>
                  <div className="space-y-1">
                    {adjustments.map((a, i) => (
                      <div key={i} className="text-[11px] leading-snug">
                        <span className="text-amber-300 font-medium">{a.room_label || a.room_id}:</span> <span className="text-muted-foreground">{a.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}