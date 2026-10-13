import React from 'react';
import { Monitor, Map as MapIcon, ScrollText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODULES = [
  { id: 'players', label: 'Spillere', icon: Users },
  { id: 'map', label: 'Kart', icon: MapIcon },
  { id: 'log', label: 'Logg', icon: ScrollText },
];

export default function GameDisplayHeader({ title, on, setOn }) {
  return <div className="shrink-0">
    <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{title}</p>
        <h1 className="font-heading text-lg">Spilledisplay</h1>
      </div>
      <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary shrink-0 flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> Display</span>
    </header>
    <div className="px-4 py-2 border-b border-border bg-card/40 flex gap-2 overflow-x-auto scrollbar-thin">
      {MODULES.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={on[id]}
        onClick={() => setOn((current) => ({ ...current, [id]: !current[id] }))}
        className={cn('min-h-11 px-3 rounded-full text-xs border flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', on[id] ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground')}>
        <Icon className="w-3.5 h-3.5" /> {label} {on[id] ? 'på' : 'av'}
      </button>)}
    </div>
  </div>;
}