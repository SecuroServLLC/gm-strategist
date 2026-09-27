import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Swords, Flame, Volume2, Droplet, BellRing, Skull, ScrollText, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const NOISE = {
  silent: { label: "Stille", color: "text-emerald-400" },
  low: { label: "Lav lyd", color: "text-emerald-400" },
  medium: { label: "Hørbar", color: "text-amber-400" },
  high: { label: "Høy lyd", color: "text-orange-400" },
  extreme: { label: "Ekstrem", color: "text-rose-400" },
};

export default function ViolenceReportDialog({ open, onClose, targetLabel, data, loading }) {
  const terrain = data?.tactical_terrain || [];
  const loot = data?.loot || [];
  const noise = NOISE[data?.noise_level] || NOISE.medium;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[82vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Swords className="w-5 h-5 text-rose-400" /> Vold / Brute Force</DialogTitle>
          <DialogDescription>Mål: <span className="text-foreground font-medium">{targetLabel}</span> — umiddelbar konsekvens-rapport.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-rose-500/30 border-t-rose-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1. Tactical Terrain */}
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-rose-300">⚔️ Miljøet i kampen</span>
                <span className="text-[10px] text-muted-foreground">(Tactical Terrain)</span>
              </div>
              {terrain.length > 0 ? (
                <div className="space-y-1.5">
                  {terrain.map((t, i) => (
                    <div key={i} className="text-[11px] leading-snug">
                      <span className="text-foreground font-medium">{t.feature}</span>
                      {t.room_label && <span className="text-muted-foreground"> — {t.room_label}</span>}
                      {t.detail && <span className="block text-muted-foreground/80">{t.detail}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground/80">Ingen spesielle miljø-fordeler i dette rommet.</div>
              )}
            </div>

            {/* 2. Ripple Effects */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">🚨 Støy og konsekvenser</span>
                <span className="text-[10px] text-muted-foreground">(Ripple Effects)</span>
                <span className={cn("ml-auto text-[10px] font-semibold flex items-center gap-1", noise.color)}>
                  <Volume2 className="w-3 h-3" /> {noise.label}
                </span>
              </div>
              <div className="space-y-1.5">
                {data?.alerted_enemies && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <BellRing className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span className="text-muted-foreground"><span className="text-amber-300/90">Varslede:</span> {data.alerted_enemies}</span>
                  </div>
                )}
                {data?.blood && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <Droplet className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400/80" />
                    <span className="text-muted-foreground"><span className="text-rose-300/90">Blodsøl:</span> {data.blood}</span>
                  </div>
                )}
                {data?.remains && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <Skull className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span className="text-muted-foreground"><span className="text-slate-300/90">Lik / rester:</span> {data.remains}</span>
                  </div>
                )}
                {data?.aftermath && (
                  <div className="flex items-start gap-1.5 text-[11px] leading-snug rounded-md bg-rose-500/10 border border-rose-500/30 p-1.5">
                    <ScrollText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span className="text-muted-foreground"><span className="text-rose-300/90">Etterslep:</span> {data.aftermath}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Loot & Spoils */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">💰 Utbytte</span>
                <span className="text-[10px] text-muted-foreground">(Loot & Spoils)</span>
              </div>
              {loot.length > 0 ? (
                <div className="space-y-1.5">
                  {loot.map((l, i) => (
                    <div key={i} className="text-[11px] leading-snug">
                      <span className="text-amber-200 font-medium">{l.item}</span>
                      {l.condition && <span className="text-muted-foreground"> ({l.condition})</span>}
                      {l.category && <span className="text-muted-foreground/70 ml-1">· {l.category}</span>}
                      {l.note && <span className="block text-muted-foreground/80">{l.note}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground/80">Ingenting å plukke opp.</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}