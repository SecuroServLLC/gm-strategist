import React from "react";
import { Image } from "@/components/ui/image";
import { Heart } from "lucide-react";

const ATTRS = [
  ["kraft", "Kraft"],
  ["smidighet", "Smidighet"],
  ["utholdenhet", "Utholdenhet"],
  ["intelligens", "Intelligens"],
  ["visdom", "Visdom"],
  ["utstralning", "Utstråling"],
];

export default function NpcCard({ character }) {
  const c = character;
  const stats = c.stats || {};
  const abilities = c.abilities || [];
  return (
    <div className="a6-card">
      <div className="flex items-start justify-between gap-4 border-b border-stone-400/50 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-4xl leading-tight text-stone-900">{c.name}</h3>
          {c.archetype && (
            <span className="block text-sm uppercase tracking-[0.15em] text-stone-600 mt-1">{c.archetype}</span>
          )}
          {(c.race || c.role) && (
            <span className="block text-sm text-stone-500 mt-0.5">{[c.race, c.role].filter(Boolean).join(" · ")}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 border-2 border-red-500/60 rounded-xl px-4 py-2 bg-red-50">
          <Heart className="w-6 h-6 text-red-600" />
          <span className="font-heading text-3xl leading-none text-stone-900">{c.hp ?? "–"}</span>
        </div>
      </div>

      {c.portrait_url && (
        <div className="my-5 rounded-lg overflow-hidden h-56 w-full bg-stone-200 ring-1 ring-stone-300">
          <Image src={c.portrait_url} fittingType="fill" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-6 gap-2 my-4">
        {ATTRS.map(([k, label]) => (
          <div key={k} className="border border-stone-400/70 rounded-lg px-1 py-2 text-center bg-stone-50/60">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 leading-tight">{label}</div>
            <div className="font-heading text-2xl text-stone-900 mt-0.5">{stats[k] ?? "–"}</div>
          </div>
        ))}
      </div>

      {abilities.length > 0 && (
        <div className="mt-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-stone-400/50" />
            <h4 className="font-heading text-xl text-stone-800 uppercase tracking-widest">Evner</h4>
            <div className="h-px flex-1 bg-stone-400/50" />
          </div>
          <ul className="space-y-3">
            {abilities.map((a, i) => (
              <li key={i} className="flex gap-3 border border-stone-400/60 rounded-lg px-3 py-2 bg-white/50">
                <span className="font-heading text-lg text-stone-400 shrink-0 leading-none mt-0.5">{i + 1}</span>
                <span className="text-[13px] text-stone-800 leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}