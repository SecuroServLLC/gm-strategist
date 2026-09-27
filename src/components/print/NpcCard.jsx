import React from "react";
import { Image } from "@/components/ui/image";
import { Heart } from "lucide-react";

const ATTRS = [
  ["kraft", "Kraft"],
  ["smidighet", "Smid."],
  ["utholdenhet", "Uthold."],
  ["intelligens", "Intell."],
  ["visdom", "Visdom"],
  ["utstralning", "Utstr."],
];

export default function NpcCard({ character }) {
  const c = character;
  const stats = c.stats || {};
  const abilities = (c.abilities || []).slice(0, 3);
  return (
    <div className="a6-card">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <h3 className="font-heading text-xl leading-tight truncate text-stone-900">{c.name}</h3>
          {c.archetype && <span className="text-[10px] uppercase tracking-wide text-stone-500">{c.archetype}</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0 border border-red-400/50 rounded-md px-2 py-0.5 bg-red-50">
          <Heart className="w-3.5 h-3.5 text-red-600" />
          <span className="font-heading text-lg leading-none text-stone-900">{c.hp ?? "–"}</span>
        </div>
      </div>

      {c.portrait_url && (
        <div className="my-2 rounded overflow-hidden h-24 w-full bg-stone-200">
          <Image src={c.portrait_url} fittingType="fill" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 my-2 text-center">
        {ATTRS.map(([k, label]) => (
          <div key={k} className="border border-stone-300 rounded px-1 py-0.5">
            <div className="text-[9px] uppercase text-stone-500">{label}</div>
            <div className="font-heading text-sm text-stone-800">{stats[k] ?? "–"}</div>
          </div>
        ))}
      </div>

      {abilities.length > 0 && (
        <ul className="text-[11px] text-stone-700 space-y-0.5 mt-1">
          {abilities.map((a, i) => <li key={i} className="leading-snug">• {a}</li>)}
        </ul>
      )}
    </div>
  );
}