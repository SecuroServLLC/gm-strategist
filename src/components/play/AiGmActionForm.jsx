import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import ActionActorPicker from '@/components/play/ActionActorPicker';

export default function AiGmActionForm({ players, hasMore, loadMore, busy, blocked, onSubmit }) {
  const [action, setAction] = useState('');
  const [selected, setSelected] = useState([]);
  const [lead, setLead] = useState('');
  const active = players.filter((player) => player.ready && selected.includes(player.device_id)).map((player) => player.device_id);
  const actor = active.includes(lead) ? lead : active[0] || '';
  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 10 ? [...current, id] : current);
    if (!lead) setLead(id);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!actor || !action.trim()) return;
    if (await onSubmit({ action: action.trim(), actor_device_id: actor, participant_device_ids: active })) setAction('');
  };
  return <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-4">
    <div><h2 className="font-heading text-2xl">Spillerhandlinger</h2><p className="mt-1 text-sm text-muted-foreground">GM styrer handlingene. Bare karakterer på terminaler som er lagt til i dette spillet kan velges.</p></div>
    <ActionActorPicker players={players} selected={active} lead={actor} onToggle={toggle} onLead={setLead} disabled={busy || blocked} />
    {hasMore && <Button type="button" variant="outline" onClick={loadMore} disabled={busy}>Vis flere terminaler</Button>}
    <label className="block text-sm">Hva gjør de valgte karakterene?
      <Textarea value={action} onChange={(event) => setAction(event.target.value)} maxLength={2000} disabled={busy || blocked} rows={3} className="mt-1" placeholder="Beskriv hvem som forsøker hva, og hvordan de andre eventuelt hjelper til." />
    </label>
    <Button disabled={busy || blocked || !action.trim() || !actor} type="submit" className="min-h-11">{busy ? <Loader2 className="animate-spin" /> : <Send />}{busy ? 'Spillelederen tenker…' : 'Send handling'}</Button>
    <p className="text-xs text-muted-foreground">{blocked ? 'Registrer det ventende terningkastet før neste handling.' : 'Én handling og én hovedutøver per innsending. Beskriv medhjelpernes rolle; send separate handlinger når flere trenger egne kast.'}</p>
  </form>;
}