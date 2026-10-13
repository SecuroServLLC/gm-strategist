import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PlayCard from '@/components/play/PlayCard';

export default function JoinedPlayerStatus({ players, onUpdated }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const members = players.flatMap((player) => player.member ? [player.member] : []);
  const update = async (id, patch) => {
    setSaving(true); setError('');
    try { await base44.entities.PartyMember.update(id, patch); await onUpdated(); }
    catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  if (!members.length) return null;
  return <details className="rounded-xl border border-border bg-card p-4">
    <summary className="cursor-pointer min-h-8 text-sm font-medium">Spillernes livspoeng, tilstander og ressurser</summary>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {saving && <p role="status" className="mt-3 text-sm text-muted-foreground">Lagrer…</p>}
    <fieldset disabled={saving} className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{members.map((member) => <PlayCard key={member.id} member={member} onUpdate={update} />)}</fieldset>
  </details>;
}