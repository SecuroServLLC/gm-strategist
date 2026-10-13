import React from "react";
import { Image } from "@/components/ui/image";
import { Heart, Sparkles } from "lucide-react";
import StatBlock from "@/components/sys/StatBlock";

export default function CharacterPanel({ character, partyMember, campaign }) {
  const hp = partyMember?.current_hp ?? character?.hp;
  const maxHp = partyMember?.max_hp ?? character?.hp;
  const pct = maxHp ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-accent/40 border border-border shrink-0">
          {character?.portrait_url ? (
            <Image src={character.portrait_url} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Ingen portrett</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-2xl truncate">{character?.name || partyMember?.name || "Ukjent"}</h2>
          <p className="text-sm text-muted-foreground">
            {character?.archetype}
            {character?.race ? ` · ${character.race}` : ""}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> Livspoeng</span>
              <span>{hp ?? "?"} / {maxHp ?? "?"}</span>
            </div>
            <div className="h-2 rounded-full bg-accent overflow-hidden">
              <div className="h-full bg-red-500/80" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {partyMember?.conditions?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tilstander</p>
          <div className="flex flex-wrap gap-2">
            {partyMember.conditions.map((c, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-accent/60 border border-border">
                {c.name}{c.rounds ? ` (${c.rounds})` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {partyMember?.resources?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ressurser</p>
          <div className="space-y-1">
            {partyMember.resources.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{r.name}</span>
                <span className="text-muted-foreground">{r.current ?? "?"} / {r.max ?? "?"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {character?.abilities?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Evner
          </p>
          <ul className="text-sm space-y-1">
            {character.abilities.map((a, i) => <li key={i} className="text-muted-foreground">· {a}</li>)}
          </ul>
        </div>
      )}

      {character?.background && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Bakgrunn</p>
          <p className="text-sm text-muted-foreground">{character.background}</p>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Attributter</p>
        <StatBlock character={character} campaign={campaign} />
      </div>
    </div>
  );
}