import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Zap, ShieldHalf, TrendingUp, AlertTriangle, ScrollText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const TIER = {
  timid: { label: "Lettskremt", color: "text-emerald-400", bar: "bg-emerald-400" },
  professional: { label: "Profesjonell", color: "text-sky-400", bar: "bg-sky-400" },
  devoted: { label: "Lojal", color: "text-amber-400", bar: "bg-amber-400" },
  psychopathic: { label: "Psykopatisk", color: "text-rose-400", bar: "bg-rose-400" },
  fanatical: { label: "Fanatisk", color: "text-purple-400", bar: "bg-purple-400" },
};

const METHOD = {
  weapon_display: "Vis våpen",
  violence_threat: "Trusel om vold",
  demonstrate_force: "Vis et eksempel",
  blackmail: "Utpressing (hemmelighet)",
  isolation: "Isolasjon",
};

const RISK = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
};

export default function CoercionReportDialog({ open, onClose, npcLabel, data, loading }) {
  const escalation = data?.escalation || [];
  const ft = data?.fear_threshold || {};
  const tier = TIER[ft.tier] || TIER.professional;
  const pf = data?.price_of_fear || {};
  const hooks = data?.hooks || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[82vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Trusler & psykologisk press</DialogTitle>
          <DialogDescription>NPC: <span className="text-foreground font-medium">{npcLabel}</span> — intimidasjon og utpressing.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1. Fear Threshold */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldHalf className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">1 · Frykt-terskel</span>
                <span className={cn("ml-auto text-[10px] font-semibold", tier.color)}>{tier.label}</span>
              </div>
              <div className="mb-2">
                <div className="text-[10px] text-muted-foreground mb-1">Motstandskraft</div>
                <Progress value={ft.resistance ?? 0} className="h-1.5" />
              </div>
              {ft.description && <div className="text-[11px] text-muted-foreground leading-snug">{ft.description}</div>}
            </div>

            {/* 2. Escalation */}
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-rose-300">2 · Eskalering</span>
              </div>
              {escalation.length > 0 ? (
                <div className="space-y-2">
                  {escalation.map((e, i) => (
                    <div key={i} className="rounded-md bg-background/40 border border-border/60 p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 font-medium">{METHOD[e.method] || e.method}</span>
                        <span className={cn("text-[10px] font-semibold ml-auto", RISK[e.risk_level] || RISK.medium)}>{e.risk_level} · DC {e.difficulty}</span>
                      </div>
                      <div className="text-[11px] text-foreground leading-snug">{e.description}</div>
                      {e.requirement && <div className="text-[10px] text-muted-foreground/80 mt-0.5">Krever: {e.requirement}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground/80">Ingen eskalerings-metoder.</div>
              )}
            </div>

            {/* 3. Price of Fear */}
            <div className="rounded-lg border border-purple-500/40 bg-purple-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">3 · Prisen av frykt</span>
              </div>
              <div className="space-y-1.5">
                {pf.short_term && (
                  <div className="text-[11px] leading-snug">
                    <span className="text-emerald-300 font-medium">Kort sikt:</span> <span className="text-muted-foreground">{pf.short_term}</span>
                  </div>
                )}
                {pf.long_term && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug rounded-md bg-rose-500/10 border border-rose-500/30 p-1.5">
                    <ScrollText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span className="text-muted-foreground"><span className="text-rose-300/90">Lang sikt:</span> {pf.long_term}</span>
                  </div>
                )}
                {pf.snitches && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span className="text-muted-foreground"><span className="text-amber-300/90">Tyster:</span> {pf.snitches}</span>
                  </div>
                )}
              </div>
            </div>

            {hooks.length > 0 && (
              <div className="space-y-1">
                {hooks.map((h, i) => (
                  <div key={i} className="flex gap-1.5 text-[11px] text-muted-foreground leading-snug">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/60" /> {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}