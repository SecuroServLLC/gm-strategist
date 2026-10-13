import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatBlock from '@/components/sys/StatBlock';

export default function CharacterChoiceDetails({ character, campaign, busy, error, onConfirm }) {
  return <aside className="min-h-0 flex flex-col rounded-xl border border-border bg-card p-4">
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin space-y-4">
      {character ? <>
        <div><p className="text-xs uppercase tracking-wider text-primary">Ditt valg</p><h2 className="font-heading text-3xl break-words">{character.name}</h2><p className="text-sm text-muted-foreground">{[character.race, character.archetype].filter(Boolean).join(' · ')}</p></div>
        {character.hp != null && <p className="text-sm">Livspoeng: {character.hp}</p>}
        {character.background && <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">{character.background}</p>}
        {character.abilities?.length > 0 && <div><h3 className="text-lg">Evner</h3><ul className="list-disc pl-4 text-sm space-y-1">{character.abilities.map((ability, index) => <li key={index}>{ability}</li>)}</ul></div>}
        <StatBlock character={character} campaign={campaign} />
      </> : <p className="text-sm text-muted-foreground">Trykk på et karakterkort for å se hvem du vil være.</p>}
    </div>
    <div className="shrink-0 pt-4 space-y-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="w-full min-h-11 whitespace-normal" disabled={!character || busy} onClick={onConfirm}>{busy ? <Loader2 className="animate-spin" /> : <Check />}{busy ? 'Bekrefter…' : 'Bekreft karakter'}</Button>
      <p className="text-xs text-muted-foreground">Ingen konto, spillernavn eller følgesvenn må opprettes.</p>
    </div>
  </aside>;
}