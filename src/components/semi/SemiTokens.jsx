import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MapCharacterPicker from '@/components/maps/MapCharacterPicker';
import { cellLabel } from '@/components/semi/terrain';
export default function SemiTokens({ map, selectedToken, onSelect, onChange, cell, disabled }) {
  const [draft, setDraft] = useState({ name: '', character_id: '' });
  const tokens = map.tokens || [];
  const add = e => { e.preventDefault(); if (!draft.name.trim()) return; const token = { ...draft, name: draft.name.trim(), id: crypto.randomUUID(), cell }; onChange([...tokens, token]); onSelect(token.id); setDraft({ name: '', character_id: '' }); };
  const remove = token => { if (window.confirm(`Fjerne brikken ${token.name} fra kartet? Karakteren slettes ikke.`)) { onChange(tokens.filter(t => t.id !== token.id)); if (selectedToken === token.id) onSelect(''); } };
  return <section className="rounded-xl border bg-card p-4 space-y-3">
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl">Brikker</h2><Link className="text-xs text-primary underline" to="/characters">Lag karakterer</Link></div>
    <p className="text-xs text-muted-foreground">Velg en brikke, velg «Flytt brikke», og klikk på målruten. Flere brikker kan dele rute.</p>
    {tokens.length === 0 && <p className="text-sm text-muted-foreground">Ingen brikker på kartet ennå.</p>}
    <div className="max-h-48 overflow-auto space-y-1">{tokens.map(t => <div key={t.id} className="flex gap-1"><Button type="button" className="flex-1 min-w-0 justify-between" disabled={disabled} variant={selectedToken === t.id ? 'secondary' : 'ghost'} onClick={() => onSelect(t.id)} aria-pressed={selectedToken === t.id}><span className="truncate">{t.name}</span><span className="text-xs font-mono">{cellLabel(t.cell,map.columns)}</span></Button><Button type="button" variant="ghost" disabled={disabled} aria-label={`Fjern ${t.name}`} onClick={() => remove(t)}>×</Button></div>)}</div>
    <form onSubmit={add} className="border-t pt-3 space-y-3"><fieldset disabled={disabled} className="space-y-3"><MapCharacterPicker campaignId={map.campaign_id} marker={draft} onChange={data => setDraft(p => ({ ...p, ...data }))} /><label className="block text-xs">Navn på brikken<Input maxLength={80} required value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} className="mt-1" /></label><Button type="submit" variant="outline" className="w-full" disabled={tokens.length >= 50 || !draft.name.trim()}>Legg til i {cellLabel(cell,map.columns)}</Button></fieldset></form>
  </section>;
}