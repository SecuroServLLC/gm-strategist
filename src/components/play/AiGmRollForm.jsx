import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dices, Loader2 } from "lucide-react";

export default function AiGmRollForm({ turn, busy, onResolve }) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [modifier, setModifier] = useState(String(turn.modifier));
  const [target, setTarget] = useState(String(turn.target));
  const [mode, setMode] = useState(turn.roll_mode);
  const diceCount = mode === 'normal' ? 1 : 2;
  const required = Math.max(1, Number(target) - Number(modifier));
  return <form onSubmit={(e) => { e.preventDefault(); onResolve({ turn_id: turn.id, rolls: [Number(first), ...(diceCount === 2 ? [Number(second)] : [])], modifier: Number(modifier), target: Number(target), roll_mode: mode }); }} className="space-y-4 rounded-xl border border-primary/40 bg-card p-4">
    <h3 className="font-heading text-2xl">Roll your dice</h3>
    <p className="text-sm">Roll {diceCount}d20{mode === 'advantage' ? ' and use the higher result' : mode === 'disadvantage' ? ' and use the lower result' : ''}. {required <= 20 ? `You need ${required} or higher with the current modifier.` : 'Your current modifier cannot meet the target with a normal total.'}{turn.test_type === 'attack' ? ' A natural 20 hits; a natural 1 misses.' : ' A natural 20 or 1 does not automatically succeed or fail.'}</p>
    <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm">Total modifier<Input type="number" required min={-20} max={30} step={1} value={modifier} onChange={(e) => setModifier(e.target.value)} /></label>
      <label className="text-sm">{turn.test_type === 'attack' ? 'Target Armor Class' : 'Difficulty Class'}<Input type="number" required min={1} max={40} step={1} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
      <label className="text-sm">Roll mode<select value={mode} onChange={(e) => setMode(e.target.value)} className="block w-full h-9 rounded-md border border-input bg-background px-2"><option value="normal">Normal</option><option value="advantage">Advantage</option><option value="disadvantage">Disadvantage</option></select></label>
      <label className="text-sm">First d20 result<Input required type="number" min={1} max={20} step={1} value={first} onChange={(e) => setFirst(e.target.value)} /></label>
      {diceCount === 2 && <label className="text-sm">Second d20 result<Input required type="number" min={1} max={20} step={1} value={second} onChange={(e) => setSecond(e.target.value)} /></label>}
    </fieldset>
    <p className="text-xs text-muted-foreground">The suggested modifier uses the selected character’s ability score only. Confirm proficiency, expertise and other bonuses from your character sheet. The GM can correct the target and roll mode.</p>
    <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Dices />}{busy ? 'Resolving…' : 'Resolve Roll'}</Button>
  </form>;
}