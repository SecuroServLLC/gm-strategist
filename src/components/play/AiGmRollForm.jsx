import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dices, Loader2 } from "lucide-react";

export default function AiGmRollForm({ turn, busy, onResolve, aiDice = false }) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [modifier, setModifier] = useState(String(turn.modifier));
  const [target, setTarget] = useState(String(turn.target));
  const [mode, setMode] = useState(turn.roll_mode);
  const diceCount = mode === 'normal' ? 1 : 2;
  const required = Math.max(1, Number(target) - Number(modifier));
  const submit = (event) => {
    event.preventDefault();
    onResolve({ turn_id: turn.id, dice_source: aiDice ? 'ai' : 'physical', ...(aiDice ? {} : { rolls: [Number(first), ...(diceCount === 2 ? [Number(second)] : [])] }), modifier: Number(modifier), target: Number(target), roll_mode: mode });
  };
  return <form onSubmit={submit} className="space-y-4 rounded-xl border border-primary/40 bg-card p-4">
    <h3 className="font-heading text-2xl">{aiDice ? 'AI Dice' : 'Registrer fysiske terninger'}</h3>
    <p className="text-sm">{aiDice ? 'Appen kaster' : 'Kast'} {diceCount} tjuesidige {diceCount === 1 ? 'terning' : 'terninger'}{mode === 'advantage' ? ' og bruk høyeste resultat' : mode === 'disadvantage' ? ' og bruk laveste resultat' : ''}. {required <= 20 ? `Hovedutøveren trenger ${required} eller høyere med valgt bonus.` : 'Vanlig totalsum kan ikke nå målet med denne bonusen.'}</p>
    <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm">Samlet bonus<Input type="number" required min={-20} max={30} step={1} value={modifier} onChange={(event) => setModifier(event.target.value)} /></label>
      <label className="text-sm">{turn.test_type === 'attack' ? 'Målets rustningsklasse' : 'Vanskelighetsgrad'}<Input type="number" required min={1} max={40} step={1} value={target} onChange={(event) => setTarget(event.target.value)} /></label>
      <label className="text-sm">Kastemåte<select value={mode} onChange={(event) => setMode(event.target.value)} className="block w-full h-9 rounded-md border border-input bg-background px-2"><option value="normal">Normalt</option><option value="advantage">Fordel</option><option value="disadvantage">Ulempe</option></select></label>
      {!aiDice && <label className="text-sm">Første terning<Input required type="number" min={1} max={20} step={1} value={first} onChange={(event) => setFirst(event.target.value)} /></label>}
      {!aiDice && diceCount === 2 && <label className="text-sm">Andre terning<Input required type="number" min={1} max={20} step={1} value={second} onChange={(event) => setSecond(event.target.value)} /></label>}
    </fieldset>
    <p className="text-xs text-muted-foreground">Kontroller ferdighetsbonus, ekspertise og utstyr før kastet avgjøres. {turn.test_type === 'attack' ? 'Et naturlig 20 treffer kritisk; et naturlig 1 bommer.' : 'Naturlig 20 eller 1 gir ikke automatisk suksess eller nederlag på denne testen.'}</p>
    <Button type="submit" disabled={busy} className="min-h-11">{busy ? <Loader2 className="animate-spin" /> : <Dices />}{busy ? 'Avgjør…' : aiDice ? 'Kast og avgjør' : 'Registrer og avgjør'}</Button>
  </form>;
}