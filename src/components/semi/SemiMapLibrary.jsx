import React, { useState } from 'react';
import { Map, Plus, ArrowUpRight, Compass, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSemiMaps from '@/components/semi/useSemiMaps';
import SemiMapForm from '@/components/semi/SemiMapForm';
export default function SemiMapLibrary({ campaignId, onOpen }) {
  const [creating, setCreating] = useState(false);
  const query = useSemiMaps('SemiAnalogMap', campaignId, ['title','map_type','columns','rows']);
  if (creating) return <SemiMapForm campaignId={campaignId} onCancel={() => setCreating(false)} onCreated={id => { query.refetch(); onOpen(id); }} />;
  const maps = query.data?.pages.flatMap(p => p.items) || [];
  return <div className="space-y-6">
    <section className="rounded-2xl border border-primary/25 bg-card p-6 sm:p-10 flex flex-col sm:flex-row gap-6 justify-between sm:items-center"><div className="max-w-xl"><p className="uppercase tracking-[0.2em] text-xs text-primary">Digitale verktøy. Ekte bordspill.</p><h2 className="text-4xl sm:text-5xl mt-3">Bygg stedet.<br />La spillerne velge veien.</h2><p className="text-muted-foreground mt-4 leading-relaxed">Forbered terreng, vær og hemmeligheter rute for rute. Flytt brikkene, kast terningene og la lyden sette scenen.</p></div><Button size="lg" onClick={() => setCreating(true)}><Plus />Nytt kart</Button></section>
    <div className="flex items-center gap-2"><Map className="w-4 h-4 text-primary" /><h2 className="text-2xl">Kampanjens spillebord</h2></div>
    {query.isLoading && <p role="status" className="text-muted-foreground">Henter kart…</p>}
    {query.isError && <div role="alert">Kunne ikke hente kartene. <Button variant="outline" onClick={() => query.refetch()}>Prøv igjen</Button></div>}
    {!query.isLoading && !query.isError && maps.length === 0 && <div className="rounded-xl border border-dashed p-10 text-center"><Compass className="w-9 h-9 mx-auto text-muted-foreground mb-3" /><h3 className="text-2xl">Et ubeskrevet eventyr</h3><p className="text-sm text-muted-foreground mt-2">Opprett et taktisk kart eller et utforskningskart for å starte.</p></div>}
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{maps.map(m => { const Icon = m.map_type === 'tactical' ? Swords : Compass; return <button key={m.id} onClick={() => onOpen(m.id)} className="text-left rounded-xl border bg-card hover:border-primary/60 transition-colors p-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex justify-between text-primary"><Icon className="w-6 h-6" /><ArrowUpRight className="w-4 h-4" /></div><h3 className="text-2xl mt-6 break-words">{m.title}</h3><p className="text-xs text-muted-foreground mt-2">{m.map_type === 'tactical' ? 'Taktisk' : 'Utforskning'} · {m.columns} × {m.rows} ruter</p></button>; })}</div>
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Last flere kart</Button>}
  </div>;
}