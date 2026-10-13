import React from 'react';
import { Check, UserRound } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

export default function CharacterChoiceCard({ character, selected, disabled, onSelect }) {
  return <button type="button" aria-pressed={selected} onClick={onSelect} disabled={disabled}
    className={cn('relative overflow-hidden rounded-xl border-2 bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/60')}>
    <div className="aspect-square bg-muted">
      {character.portrait_url ? <Image src={character.portrait_url} alt={character.name} className="h-full w-full" /> : <div className="flex h-full items-center justify-center"><UserRound className="h-14 w-14 text-muted-foreground" /></div>}
    </div>
    {selected && <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground"><Check className="h-5 w-5" /></span>}
    <div className="p-3"><h2 className="font-heading text-xl leading-tight break-words">{character.name}</h2><p className="mt-1 text-xs text-muted-foreground">{[character.race, character.archetype].filter(Boolean).join(' · ')}</p></div>
  </button>;
}