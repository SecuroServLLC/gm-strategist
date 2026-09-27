import React from "react";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const ROLE_COLORS = {
  protagonist: "border-amber-500/40 text-amber-300",
  ally: "border-emerald-500/40 text-emerald-300",
  antagonist: "border-rose-500/40 text-rose-300",
  npc: "border-slate-500/40 text-slate-300",
  contact: "border-sky-500/40 text-sky-300",
  mentor: "border-fuchsia-500/40 text-fuchsia-300",
};

const ROLE_LABELS = {
  protagonist: "Protagonist",
  ally: "Alliert",
  antagonist: "Antagonist",
  npc: "NPC",
  contact: "Kontakt",
  mentor: "Mentor",
};

const STAT_KEYS = ["kraft", "smidighet", "utholdenhet", "intelligens", "visdom", "utstralning"];

export default function CharacterCard({ character, onClick }) {
  const stats = character.stats || {};
  return (
    <button
      onClick={onClick}
      className="text-left glass-card rounded-2xl overflow-hidden hover:border-primary/40 transition-all group hover:-translate-y-0.5 w-full"
    >
      <div className="relative h-44 overflow-hidden bg-accent/30">
        {character.portrait_url ? (
          <Image src={character.portrait_url} fittingType="fill" className="w-full h-full transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="outline" className={`bg-background/70 backdrop-blur capitalize ${ROLE_COLORS[character.role] || ROLE_COLORS.npc}`}>
            {ROLE_LABELS[character.role] || character.role}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl leading-tight">{character.name}</h3>
        <p className="text-sm text-primary/90 capitalize mb-3">{character.archetype} · {character.race}</p>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {STAT_KEYS.map((k) => (
            <div key={k} className="text-center bg-accent/40 rounded-md py-1">
              <div className="font-heading text-base leading-none">{stats[k] ?? "–"}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">{k.slice(0, 3)}</div>
            </div>
          ))}
        </div>

        {character.hook && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 border-t border-border pt-2">
            {character.hook}
          </p>
        )}
      </div>
    </button>
  );
}