import React from "react";
import { Image } from "@/components/ui/image";
import StatBlock from "@/components/sys/StatBlock";
import { Heart } from "lucide-react";

export default function PlayerStatCard({ character, partyMember, campaign }) {
  const hp = partyMember?.current_hp ?? character?.hp;
  const maxHp = partyMember?.max_hp ?? character?.hp;
  const pct = maxHp ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/40 border border-border shrink-0">
          {character?.portrait_url ? (
            <Image src={character.portrait_url} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-lg truncate">{character?.name || partyMember?.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {character?.archetype}
            {character?.race ? ` · ${character.race}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium flex items-center gap-1 justify-end">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            {hp ?? "?"}/{maxHp ?? "?"}
          </p>
          <div className="w-20 h-1.5 rounded-full bg-accent overflow-hidden mt-1">
            <div className="h-full bg-red-500/80" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="p-3">
        <StatBlock character={character} campaign={campaign} />
      </div>
    </div>
  );
}