import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useSemiMaps from '@/components/semi/useSemiMaps';
export default function SemiMapForm({ campaignId, onCreated, onCancel }) {
  const [title, setTitle] = useState(''), [type, setType] = useState('tactical'), [columns, setColumns] = useState(12), [rows, setRows] = useState(8), [source, setSource] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const maps = useSemiMaps('MapItem', campaignId, ['title','sketch_url']);
  const options = maps.data?.pages.flatMap(p => p.items) || [];
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { const map = await base44.entities.SemiAnalogMap.create({ campaign_id: campaignId, title: title.trim(), map_type: type, columns: Number(columns), rows: Number(rows), background_url: options.find(m => m.id === source)?.sketch_url || '', cells: {}, tokens: [], dice_rolls: [] }); onCreated(map.id); }
    catch (e) { setError(e.message || 'Kartet kunne ikke lagres. Prøv igjen.'); } finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="rounded-2xl border bg-card p-6 max-w-2xl mx-auto space-y-5">
    <div><p className="text-xs uppercase tracking-widest text-primary">Et nytt spillebord</p><h2 className="text-3xl mt-2">Hvor går eventyret?</h2><p className="text-muted-foreground text-sm mt-2">Start tomt eller bruk et kart fra kampanjen. Klikk på rutene for å bygge scenen.</p></div>
    <label className="block text-sm">Kartnavn<Input autoFocus required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="mt-2" placeholder="F.eks. Den glemte dalen" /></label>
    <fieldset className="grid sm:grid-cols-2 gap-3"><legend className="text-sm mb-2">Karttype</legend>{[['tactical','Taktisk kart','Rom, kamper og presise brikkebevegelser'],['exploration','Utforskningskart','Reiser, terreng og oppdagelser']].map(([value,label,detail]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 ${type === value ? 'border-primary bg-primary/10' : 'border-border'}`}><input type="radio" name="map-type" value={value} checked={type === value} onChange={() => setType(value)} className="mr-2 accent-primary" /><strong>{label}</strong><span className="block text-xs text-muted-foreground mt-2">{detail}</span></label>)}</fieldset>
    <div className="grid grid-cols-2 gap-4"><label className="text-sm">Kolonner<Input required type="number" min="4" max="20" value={columns} onChange={e => setColumns(e.target.value)} /></label><label className="text-sm">Rader<Input required type="number" min="4" max="20" value={rows} onChange={e => setRows(e.target.value)} /></label></div>
    <label className="block text-sm">Bakgrunn fra eksisterende kart<select value={source} onChange={e => setSource(e.target.value)} className="w-full mt-2 p-2 border rounded bg-background"><option value="">Tomt rutenett</option>{options.map(m => <option key={m.id} value={m.id} disabled={!m.sketch_url}>{m.title}{!m.sketch_url ? ' (uten bilde)' : ''}</option>)}</select></label>
    {maps.isLoading && <p className="text-sm">Henter kart…</p>}{maps.isError && <p role="alert">Kunne ikke hente bakgrunner. <button type="button" onClick={() => maps.refetch()} className="underline">Prøv igjen</button></p>}
    {maps.hasNextPage && <Button type="button" variant="outline" disabled={maps.isFetchingNextPage} onClick={() => maps.fetchNextPage()}>Flere bakgrunner</Button>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="flex gap-3"><Button disabled={busy || !title.trim()}>{busy ? 'Oppretter…' : 'Opprett kart'}</Button><Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>Avbryt</Button></div>
  </form>;
}