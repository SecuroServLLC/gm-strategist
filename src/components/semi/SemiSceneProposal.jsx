import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { soundscapePresets } from '@/components/audio/soundscapePresets';
export default function SemiSceneProposal({ cell, mapType, label, onApprove }) {
  const [prompt, setPrompt] = useState(''), [proposal, setProposal] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const generate = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { const response = await base44.functions.invoke('generateSemiScene', { prompt, context: JSON.stringify({ mapType, area: label, title: cell.title, terrain: cell.terrain, weather: cell.weather, description: cell.description, gm_notes: cell.gm_notes }).slice(0,7000) }); if (response.data.error) throw new Error(response.data.error); setProposal(response.data); }
    catch (e) { setError(e.message || 'Kunne ikke lage et forslag. Prøv igjen.'); } finally { setBusy(false); }
  };
  return <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
    <h2 className="text-xl flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI-sceneverksted</h2>
    <p className="text-xs text-muted-foreground">Forbered narrativ, farer og lydbilde. Ingen handlinger eller terningutfall avgjøres automatisk. Krever nett.</p>
    <form onSubmit={generate} className="space-y-3"><label className="text-xs block">Hva finnes i området?<Textarea required maxLength={1200} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Noe farlig skjuler seg i tåken…" className="mt-1" /></label><Button type="submit" variant="secondary" disabled={busy || !prompt.trim()} className="w-full">{busy ? 'Skriver scenen…' : 'Foreslå scene og lyd'}</Button></form>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {proposal && <div className="space-y-3 border-t border-primary/30 pt-3"><p className="text-xs font-bold text-primary">UTKAST · IKKE TATT I BRUK</p>{[['title','Navn'],['terrain','Terreng'],['weather','Vær'],['description','Beskrivelse'],['narrative','Fortellertekst'],['gm_notes','Skjult informasjon'],['event','Hvis / så'],['dice_suggestion','Terningforslag']].map(([key,title]) => <div key={key}><h3 className="text-sm font-body font-semibold">{title}</h3><p className="text-sm whitespace-pre-wrap text-muted-foreground">{proposal[key]}</p></div>)}<p className="text-sm">Lyd: {soundscapePresets[proposal.soundscape]?.label}</p><div className="flex flex-wrap gap-2"><Button onClick={() => { onApprove(proposal); setProposal(null); }}>Godkjenn for området</Button><Button variant="ghost" onClick={() => setProposal(null)}>Forkast</Button></div></div>}
  </section>;
}