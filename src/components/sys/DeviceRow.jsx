import React from 'react';
import { Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DeviceAccessActions from '@/components/sys/DeviceAccessActions';
import { DEVICE_TYPES } from '@/components/sys/deviceTypes';

export default function DeviceRow({ device, pending, busy, onAction }) {
  const meta = DEVICE_TYPES[device.device_type] || DEVICE_TYPES.terminal;
  const Icon = meta.icon;
  return <article className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/40 p-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent"><Icon className="h-5 w-5 text-primary" /></div>
    <div className="min-w-0 flex-1"><h3 className="font-heading text-xl break-words">{device.label || meta.label}</h3><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{meta.label}</Badge><span className="font-mono text-sm tracking-widest">{device.device_id}</span></div>
      {device.device_type === 'terminal' && !pending && <p className="mt-1 text-xs text-muted-foreground">{device.party_member_id ? 'Karakter valgt · passiv spillerskjerm' : 'Spilleren velger karakter på terminalen'}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-1">
      {pending && <Button size="sm" className="min-h-11" disabled={busy} onClick={() => onAction('admit', device)}><LogIn />Legg til i spillet</Button>}
      {!pending && device.device_type === 'terminal' && <>
        {device.party_member_id && <Button variant="outline" size="sm" disabled={busy} onClick={() => onAction('reset', device)}>Velg karakter på nytt</Button>}
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => onAction('disconnect', device)}>Koble fra</Button>
      </>}
      <DeviceAccessActions device={device} />
      <Button variant="ghost" size="icon" disabled={busy} onClick={() => onAction('remove', device)} aria-label="Slett enhet" title="Slett enhet"><Trash2 className="text-destructive" /></Button>
    </div>
  </article>;
}