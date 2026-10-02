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
      {/* TOPP: NAVN + HP */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-stone-500/50 pb-3">
        <div className="min-w-0">
          <h3 className="font-heading text-5xl leading-none text-stone-900">{c.name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-sm text-stone-600">
            {c.archetype && <span className="uppercase tracking-[0.12em] font-semibold">{c.archetype}</span>}
            {c.race && <span>· {c.race}</span>}
            {c.role && <span className="text-stone-500">· {c.role}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 border-2 border-red-500/60 rounded-xl px-4 py-2 bg-red-50">
          <Heart className="w-7 h-7 text-red-600" />
          <span className="font-heading text-4xl leading-none text-stone-900">{c.hp ?? "–"}</span>
        </div>
      </div>

      {/* MIDT: stats venstre (nedover), firkantet bilde høyre */}
      <div className="flex gap-6 mt-5">
        <div className="flex-1 min-w-0">
          <h4 className="font-heading text-lg uppercase tracking-widest text-stone-700 mb-2">Ferdigheter</h4>
          <ul className="space-y-1.5">
            {ATTRS.map(([k, label]) => (
              <li key={k} className="flex items-baseline justify-between border-b border-stone-400/50 pb-1">
                <span className="text-base font-bold text-stone-900 tracking-wide">{label}</span>
                <span className="font-heading text-2xl text-stone-800">{stats[k] ?? "–"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0">
          <div className="w-52 h-52 rounded-lg overflow-hidden bg-stone-200 ring-2 ring-stone-400">
            {c.portrait_url ? (
              <Image src={c.portrait_url} fittingType="fill" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">Ingen bilde</div>
            )}
          </div>
        </div>
      </div>

      {/* UNDER: alt annet */}
      {abilities.length > 0 && (
        <div className="mt-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-stone-400/50" />
            <h4 className="font-heading text-xl text-stone-800 uppercase tracking-widest">Evner</h4>
            <div className="h-px flex-1 bg-stone-400/50" />
          </div>
          <ul className="space-y-2">
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