import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { terrains } from '@/components/semi/terrain';
export default function SemiCellEditor({ cell, label, count, onChange, preview }) {
  if (preview) return <section className="rounded-xl border bg-card p-5 space-y-3"><p className="text-xs text-primary uppercase tracking-widest">Spillervisning · {label}</p><h2 className="text-2xl">{cell.revealed ? cell.title || 'Åpent område' : 'Ukjent område'}</h2>{cell.revealed && <><p className="text-sm text-muted-foreground">{terrains[cell.terrain]?.label} {cell.weather && `· ${cell.weather}`}</p><p className="whitespace-pre-wrap text-sm">{cell.description}</p><p className="whitespace-pre-wrap font-heading text-xl">{cell.narrative}</p></>}</section>;
  return <section className="rounded-xl border bg-card p-4 space-y-4">
    <div className="flex items-center justify-between gap-2"><div><p className="text-xs uppercase tracking-widest text-primary">Rute {label}</p><h2 className="text-2xl">Scenens detaljer</h2></div><Button size="icon" variant="outline" title={cell.revealed ? 'Skjul ruten' : 'Avdekk ruten'} aria-label={cell.revealed ? 'Skjul ruten' : 'Avdekk ruten'} onClick={() => onChange({ revealed: !cell.revealed })}>{cell.revealed ? <Eye /> : <EyeOff />}</Button></div>
    <p className="text-xs text-muted-foreground">{count > 1 ? 'Hvert felt du endrer oppdateres i alle fire rutene. Uendrede felt bevares.' : 'Spillere ser bare avdekkede ruters tittel, terreng, vær, beskrivelse og fortellertekst.'}</p>
    <label className="block text-xs">Navn<Input className="mt-1" maxLength={100} value={cell.title || ''} onChange={e => onChange({ title: e.target.value })} /></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs">Terreng<select value={cell.terrain || 'plain'} onChange={e => onChange({ terrain: e.target.value })} className="block w-full mt-1 p-2 rounded border bg-background">{Object.entries(terrains).map(([key,t]) => <option value={key} key={key}>{t.label}</option>)}</select></label><label className="text-xs">Vær<Input className="mt-1" maxLength={120} value={cell.weather || ''} onChange={e => onChange({ weather: e.target.value })} placeholder="Tåke, sol, regn…" /></label></div>
    {[['description','Synlig beskrivelse',2000],['narrative','Fortellertekst',2000],['gm_notes','Skjulte GM-notater',2000],['event','Hendelser · hvis / så (kun GM)',1500],['dice_suggestion','Forslag til kast (kun GM)',500]].map(([field,title,max]) => <label key={field} className="block text-xs">{title}<Textarea className="mt-1 min-h-20" value={cell[field] || ''} maxLength={max} onChange={e => onChange({ [field]: e.target.value })} /></label>)}
  </section>;
}