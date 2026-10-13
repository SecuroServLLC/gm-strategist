import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Swords, Minus } from "lucide-react";
import ToDoBadge from "@/components/ToDoBadge";

const RELATIONS = [
  { value: "friend", label: "Venn", Icon: Heart },
  { value: "neutral", label: "Nøytral", Icon: Minus },
  { value: "enemy", label: "Fiende", Icon: Swords },
];

const REL_STYLE = {
  friend: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
  neutral: "bg-slate-500/20 border-slate-500/50 text-slate-300",
  enemy: "bg-rose-500/20 border-rose-500/50 text-rose-400",
};

export default function RelationOverview({ campaignId }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const list = await base44.entities.Character.filter({ campaign_id: campaignId });
      setCharacters(list.filter((c) => c.role !== "protagonist"));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  const setRelation = async (c, relation) => {
    setUpdating(c.id);
    try {
      await base44.entities.Character.update(c.id, { relation });
      setCharacters((prev) => prev.map((ch) => ch.id === c.id ? { ...ch, relation } : ch));
    } catch (e) {
      alert("Kunne ikke oppdatere relasjon: " + e.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Laster relasjoner…</p>;

  const friends = characters.filter((c) => c.relation === "friend");
  const enemies = characters.filter((c) => c.relation === "enemy");
  const neutral = characters.filter((c) => !c.relation || c.relation === "neutral");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
        Gruppen behandles som én samlet enhet. Alle NPC-er kan bli venner eller fiender basert på valgene gruppen tar underveis.
        <ToDoBadge>Auto-sporing fra spill</ToDoBadge>
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <div className="font-heading text-2xl text-emerald-400">{friends.length}</div>
          <div className="text-xs text-muted-foreground">Venner</div>
        </div>
        <div className="rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-center">
          <div className="font-heading text-2xl text-slate-300">{neutral.length}</div>
          <div className="text-xs text-muted-foreground">Nøytrale</div>
        </div>
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-center">
          <div className="font-heading text-2xl text-rose-400">{enemies.length}</div>
          <div className="text-xs text-muted-foreground">Fiender</div>
        </div>
      </div>

      <div className="space-y-2">
        {characters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Ingen NPC-er ennå.</p>
        ) : (
          characters.map((c) => {
            const rel = c.relation || "neutral";
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.archetype} · {c.race}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {RELATIONS.map((r) => {
                    const Icon = r.Icon;
                    const active = rel === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => setRelation(c, r.value)}
                        disabled={updating === c.id}
                        title={r.label}
                        className={`p-1.5 rounded-md border transition-colors disabled:opacity-50 ${active ? REL_STYLE[r.value] : "border-border text-muted-foreground hover:text-foreground"}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}