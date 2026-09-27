import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, AlertTriangle, Sparkles, Scale, Coins, Dices, ScrollText, Eye, Heart, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const WEAKNESS = {
  greed: { label: "Grådighet", color: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
  debt: { label: "Gjeld", color: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
  pride: { label: "Stolthet", color: "bg-purple-500/15 border-purple-500/40 text-purple-300" },
  fear: { label: "Frykt", color: "bg-slate-500/15 border-slate-500/40 text-slate-300" },
  loyalty: { label: "Lojalitet", color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" },
  vice: { label: "Last", color: "bg-rose-500/15 border-rose-500/40 text-rose-300" },
  secret: { label: "Hemmelighet", color: "bg-sky-500/15 border-sky-500/40 text-sky-300" },
  romance: { label: "Romantikk", color: "bg-rose-500/15 border-rose-500/40 text-rose-300" },
};
const DISPOSITION = {
  hostile: { label: "Fiendtlig", color: "text-rose-400" },
  wary: { label: "På vakt", color: "text-amber-400" },
  neutral: { label: "Nøytral", color: "text-slate-300" },
  friendly: { label: "Vennlig", color: "text-emerald-400" },
};
const APPROACH = {
  forge_document: { label: "Forfalsk dokument", icon: ScrollText },
  gambling: { label: "Terningspill", icon: Dices },
  exploit_debt: { label: "Utnytt gjeld", icon: BadgeDollarSign },
  distract: { label: "Avled oppmerksomhet", icon: Eye },
  blackmail: { label: "Utpressing", icon: Scale },
  charm: { label: "Sjarm", icon: Heart },
  bribe: { label: "Bestikkelse", icon: Coins },
  intimidation: { label: "Skremme", icon: Shield },
};
const RISK = {
  low: { label: "Lav risiko", color: "text-emerald-400" },
  medium: { label: "Middels risiko", color: "text-amber-400" },
  high: { label: "Høy risiko", color: "text-rose-400" },
};
const SOURCE_LABEL = { nearby_room: "Nærliggende rom", inventory: "Inventar", skill: "Ferdighet" };

export default function NpcSocialDialog({ open, onClose, npcLabel, data, loading }) {
  const personality = data?.personality;
  const weakness = data?.weakness;
  const wk = data?.weakness_type ? WEAKNESS[data.weakness_type] : null;
  const disp = data?.disposition ? DISPOSITION[data.disposition] : null;
  const trust = data?.trust_score ?? 0;
  const manipulations = data?.manipulations || [];
  const hooks = data?.hooks || [];
  const notes = data?.notes || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[82vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Sosial profil</DialogTitle>
          <DialogDescription>NPC: <span className="text-foreground font-medium">{npcLabel}</span> — personlighet, svakhet, tillit og svindelmetoder.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {personality && (
              <div className="rounded-lg border border-border bg-card/60 p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Personlighet</div>
                <div className="text-[12px] leading-snug text-foreground">{personality}</div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {wk && <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium", wk.color)}>Svakhet: {wk.label}{weakness ? ` — ${weakness}` : ""}</span>}
              {disp && <span className="text-[10px] px-2 py-0.5 rounded-md border border-border text-muted-foreground">Holdning: <span className={cn("font-medium", disp.color)}>{disp.label}</span></span>}
            </div>

            <div className="rounded-lg border border-border bg-card/60 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Trust Score</span>
                <span className={cn("text-xs font-semibold", trust >= 70 ? "text-rose-400" : trust >= 40 ? "text-amber-400" : "text-emerald-400")}>{trust}/100</span>
              </div>
              <Progress value={trust} className="h-2" />
              <div className="text-[10px] text-muted-foreground mt-1">Høyere = vanskeligere å lure.</div>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Svindel & manipulasjon</div>
            {manipulations.map((m, i) => {
              const ap = APPROACH[m.approach];
              const Ico = ap?.icon || Shield;
              const rk = RISK[m.risk_level] || RISK.medium;
              return (
                <div key={i} className="rounded-lg border border-border bg-card/60 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ico className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{ap?.label || m.approach}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">DC {m.difficulty}</span>
                    <span className={cn("text-[10px] font-semibold", rk.color)}>{rk.label}</span>
                  </div>
                  {m.method && <div className="text-[11px] text-foreground leading-snug">{m.method}</div>}
                  {m.description && <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{m.description}</div>}
                  {(m.requirements || []).length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {(m.requirements || []).map((r, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                          <span>
                            <span className="text-foreground">{r.what}</span>
                            <span className="text-muted-foreground"> — {SOURCE_LABEL[r.source] || r.source}</span>
                            {r.room_label && <span className="text-muted-foreground/80">: {r.room_label}</span>}
                            {r.item_name && <span className="text-muted-foreground/80">: {r.item_name}</span>}
                            {r.skill && <span className="text-muted-foreground/80">: {r.skill}{r.detail ? ` (${r.detail})` : ""}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.failure_consequence && (
                    <div className="flex items-start gap-1.5 mt-2 rounded-md bg-rose-500/10 border border-rose-500/30 p-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <span className="text-[11px] text-rose-200/90 leading-snug">Ved feil: {m.failure_consequence}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {hooks.length > 0 && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1">Rollespill-kroker</div>
                <div className="space-y-0.5">
                  {hooks.map((h, i) => (
                    <div key={i} className="flex gap-1.5 text-[11px] text-muted-foreground leading-snug">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/60" /> <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notes.map((n, i) => (
              <div key={i} className="text-[11px] text-muted-foreground leading-snug">• {n}</div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}