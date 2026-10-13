import React from 'react';
import { EyeOff } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { terrains, cellLabel } from '@/components/semi/terrain';
export default function SemiGrid({ map, selected, onSelect, preview, disabled }) {
  const byCell = {};
  (map.tokens || []).forEach(t => { (byCell[t.cell] ||= []).push(t); });
  return <div className="overflow-auto rounded-xl border border-border bg-background max-w-full">
    <div className="relative" style={{ minWidth: map.columns * 52 }}>
      {map.background_url && <Image src={map.background_url} alt={map.title} className="absolute inset-0 w-full h-full pointer-events-none" fittingType="fill" />}
      <div role="group" aria-label="Kartets ruter" className="relative grid" style={{ gridTemplateColumns: `repeat(${map.columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: map.columns * map.rows }, (_, i) => {
          const cell = map.cells?.[i] || {}, terrain = terrains[cell.terrain] || terrains.plain, Icon = terrain.icon;
          const hidden = preview && !cell.revealed, tokens = byCell[i] || [], active = selected.includes(i);
          return <button type="button" key={i} disabled={disabled} onClick={() => onSelect(i)} aria-pressed={active} aria-label={`Rute ${cellLabel(i,map.columns)}: ${hidden ? 'Ukjent område' : cell.title || terrain.label}${!hidden && tokens.length ? ', ' + tokens.map(t => t.name).join(', ') : ''}`}
            className={`relative aspect-square min-h-11 min-w-11 border border-border/70 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${hidden ? 'bg-background text-muted-foreground' : cell.terrain ? terrain.color : map.background_url ? 'bg-transparent text-foreground' : terrain.color} ${active ? 'ring-2 ring-inset ring-primary z-10' : 'hover:bg-primary/15'}`}>
            <span className="absolute top-1 left-1 text-[9px] font-mono opacity-70">{cellLabel(i,map.columns)}</span>
            {hidden ? <EyeOff className="w-4 h-4" /> : <><Icon className="w-5 h-5" strokeWidth={1.4} /><span className="text-[10px] max-w-full truncate px-1">{cell.title}</span>{tokens.length > 0 && <span className="absolute bottom-0.5 right-0.5 rounded-full bg-primary text-primary-foreground px-1.5 text-xs font-bold border border-background">{tokens.length === 1 ? tokens[0].name.slice(0,2).toUpperCase() : tokens.length}</span>}</>}
            {!preview && cell.revealed && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" title="Avdekket" />}
          </button>;
        })}
      </div>
    </div>
  </div>;
}