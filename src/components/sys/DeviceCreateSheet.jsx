import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { DEVICE_TYPES } from '@/components/sys/deviceTypes';

export default function DeviceCreateSheet({ open, onOpenChange, onCreate, busy, error }) {
  const [type, setType] = useState('terminal');
  const [label, setLabel] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (await onCreate({ device_type: type, label })) { setType('terminal'); setLabel(''); onOpenChange(false); }
  };
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="flex flex-col">
    <SheetHeader><SheetTitle>Ny enhet</SheetTitle><SheetDescription>GM legger terminalen til i spillet. Spilleren velger deretter en åpen karakter direkte på nettbrettet.</SheetDescription></SheetHeader>
    <form id="create-game-device" onSubmit={submit} className="mt-5 flex-1 space-y-4 overflow-y-auto">
      <label className="block text-sm">Type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 block min-h-11 w-full rounded-md border border-input bg-background px-3">{Object.entries(DEVICE_TYPES).map(([value, meta]) => <option key={value} value={value}>{meta.label} · {meta.description}</option>)}</select></label>
      <label className="block text-sm">Enhetsnavn (valgfritt)<Input className="mt-1" value={label} maxLength={80} onChange={(event) => setLabel(event.target.value)} placeholder={DEVICE_TYPES[type].label} /></label>
      <p className="text-xs text-muted-foreground">Ingen personnavn eller følgesvenn er nødvendig. Terminaler starter i ventelisten; andre enheter knyttes til den valgte kampanjen.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
    <SheetFooter className="mt-4"><Button variant="ghost" onClick={() => onOpenChange(false)}>Avbryt</Button><Button form="create-game-device" type="submit" disabled={busy}>{busy ? 'Oppretter…' : 'Opprett'}</Button></SheetFooter>
  </SheetContent></Sheet>;
}