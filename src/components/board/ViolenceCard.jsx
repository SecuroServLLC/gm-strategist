import React from "react";
import { Swords, Flame, Volume2, Droplet, BellRing, Skull, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const NOISE = {
  silent: { label: "Stille", color: "text-emerald-400" },
  low: { label: "Lav lyd", color: "text-emerald-400" },
  medium: { label: "Hørbar", color: "text-amber-400" },
  high: { label: "Høy lyd", color: "text-orange-400" },
  extreme: { label: "Ekstrem", color: "text-rose-400" },
};

export default function ViolenceCard({ violence }) {
  if (!violence) return null;
  const tactics = violence.environmental_tactics || [];
  const loot = violence.loot || [];
  const noise = NOISE[violence.noise_level] || NOISE.medium;

  return (
    <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Swords className="w-4 h-4 text-rose-400" />
        <span className="text-sm font-medium text-rose-300">Vold / Brute Force</span>
        <span className={cn("ml-auto text-[10px] font-semibold flex items-center gap-1", noise.color)}>
          <Volume2 className="w-3 h-3" /> {noise.label}
        </span>
      </div>

      {tactics.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><Flame className="w-3 h-3" /> Miljøbasert kamp</div>
          <div className="space-y-1">
            {tactics.map((t, i) => (
              <div key={i} className="text-[11px] leading-snug">
                <span className="text-foreground">{t.tactic}</span>
                {t.room_label && <span className="text-muted-foreground"> — {t.room_label}</span>}
                {t.detail && <span className="block text-muted-foreground/80">{t.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1 mb-2">
        {violence.blood && (
          <div className="flex items-start gap-1.5 text-[11px] leading-snug">
            <Droplet className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400/80" />
            <span className="text-muted-foreground"><span className="text-rose-300/90">Blodsøl:</span> {violence.blood}</span>
          </div>
        )}
        {violence.alerted_enemies && (
          <div className="flex items-start gap-1.5 text-[11px] leading-snug">
            <BellRing className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span className="text-muted-foreground"><span className="text-amber-300/90">Varslede fiender:</span> {violence.alerted_enemies}</span>
          </div>
        )}
        {violence.remains && (
          <div className="flex items-start gap-1.5 text-[11px] leading-snug">
            <Skull className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span className="text-muted-foreground"><span className="text-slate-300/90">Lik / rester:</span> {violence.remains}</span>
          </div>
        )}
      </div>

      {loot.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><Coins className="w-3 h-3" /> Utbytte</div>
          <div className="space-y-1">
            {loot.map((l, i) => (
              <div key={i} className="text-[11px] leading-snug">
                <span className="text-amber-300 font-medium">{l.item}</span>
                {l.condition && <span className="text-muted-foreground"> ({l.condition})</span>}
                {l.note && <span className="block text-muted-foreground/80">{l.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}