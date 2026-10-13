import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
function rollDie(sides) { const data = new Uint32Array(1); const limit = Math.floor(4294967296 / sides) * sides; do { crypto.getRandomValues(data); } while (data[0] >= limit); return data[0] % sides + 1; }
export default function SemiDice({ rolls, onRoll, actor, cell, label, disabled }) {
  const [sides, setSides] = useState(20), [count, setCount] = useState(1), [modifier, setModifier] = useState(0), [action, setAction] = useState('');
  const valid = Number.isInteger(count) && count >= 1 && count <= 10 && Number.isInteger(modifier) && Math.abs(modifier) <= 100;
  const roll = () => { const values = Array.from({ length: count }, () => rollDie(sides)); onRoll({ id: crypto.randomUUID(), at: new Date().toISOString(), sides, values, modifier, total: values.reduce((a,b) => a+b, 0)+modifier, actor: actor || 'GM', action, cell }); };
  return <section className="rounded-xl border bg-card p-4 space-y-3">
    <h2 className="text-xl flex items-center gap-2"><Dices className="w-5 h-5 text-primary" />Terningbord</h2>
    <p className="text-xs text-muted-foreground">{actor || 'GM'} · Rute {label} · Kast lagres sammen med kartet.</p>
    <div className="grid grid-cols-3 gap-2"><label className="text-xs">Terning<select value={sides} onChange={e => setSides(Number(e.target.value))} className="w-full mt-1 p-2 rounded border bg-background">{[4,6,8,10,12,20,100].map(n => <option key={n} value={n}>d{n}</option>)}</select></label><label className="text-xs">Antall<Input className="mt-1" type="number" min="1" max="10" value={count} onChange={e => setCount(e.target.value === '' ? '' : Number(e.target.value))} /></label><label className="text-xs">Bonus<Input className="mt-1" type="number" min="-100" max="100" value={modifier} onChange={e => setModifier(e.target.value === '' ? '' : Number(e.target.value))} /></label></div>
    <label className="block text-xs">Handling<Input className="mt-1" value={action} maxLength={200} placeholder="F.eks. undersøker døren" onChange={e => setAction(e.target.value)} /></label>
    <Button className="w-full" disabled={!valid || disabled} onClick={roll}>Kast {count || 1}d{sides}</Button>
    <div aria-live="polite">{rolls.slice(0,3).map((r, i) => <div key={r.id} className="flex justify-between gap-3 border-t py-2"><div className="min-w-0"><p className="text-xs truncate">{r.actor} · {r.action || 'Fritt kast'}</p><p className="text-xs text-muted-foreground">{r.values.join(' + ')} {r.modifier < 0 ? '−' : '+'} {Math.abs(r.modifier)}</p></div><strong className={i === 0 ? 'text-3xl text-primary tabular-nums' : 'text-xl tabular-nums'}>{r.total}</strong></div>)}</div>
  </section>;
}