import React from "react";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, ShieldOff, Copy } from "lucide-react";

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

function ClaimBadge({ character }) {
  if (character.role === "antagonist") {
    return <Badge variant="outline" className="bg-background/70 backdrop-blur border-rose-500/40 text-rose-300">Ikke claimbar</Badge>;
  }
  const s = character.claim_status;
  if (s === "open") return <Badge variant="outline" className="bg-background/70 backdrop-blur border-emerald-500/40 text-emerald-300">Ledig for claim</Badge>;
  if (s === "claimed") return <Badge variant="outline" className="bg-background/70 backdrop-blur border-amber-500/40 text-amber-300">Claimet</Badge>;
  return <Badge variant="outline" className="bg-background/70 backdrop-blur border-slate-500/40 text-slate-300">Ikke godkjent</Badge>;
}

export default function CharacterCard({ character, onClick, onToggleApprove, approving, onDuplicate }) {
  const stats = character.stats || {};
  const isAntagonist = character.role === "antagonist";
  const claimed = character.claim_status === "claimed";
  const open = character.claim_status === "open";

  return (
    <div
      onClick={onClick}
      className="text-left glass-card rounded-2xl overflow-hidden hover:border-primary/40 transition-all group hover:-translate-y-0.5 w-full h-full flex flex-col cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden bg-accent/30 shrink-0">
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
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          <ClaimBadge character={character} />
          {character.relation && character.relation !== "neutral" && character.role !== "protagonist" && (
            <Badge variant="outline" className={`bg-background/70 backdrop-blur ${character.relation === "friend" ? "border-emerald-500/40 text-emerald-300" : "border-rose-500/40 text-rose-300"}`}>
              {character.relation === "friend" ? "Venn" : "Fiende"}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
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

        <p className="text-xs text-muted-foreground italic line-clamp-2 border-t border-border pt-2 mt-auto">
          {character.hook || "Ingen hook ennå."}
        </p>

        <div className="mt-3 flex gap-2">
          {!isAntagonist && !claimed && onToggleApprove && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleApprove(character); }}
              disabled={approving}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 ${open ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10" : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"}`}
            >
              {open ? <><ShieldOff className="w-3.5 h-3.5" /> Trekk tilbake</> : <><ShieldCheck className="w-3.5 h-3.5" /> Godkjenn</>}
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(character); }}
              className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Dupliser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}