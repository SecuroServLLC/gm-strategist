import React, { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { deviceLink } from '@/lib/deviceIds';

export default function DeviceAccessActions({ device }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const act = async (open) => {
    const target = open ? window.open('', '_blank') : null;
    if (target) target.opener = null;
    setBusy(true); setNotice('');
    try {
      const path = device.device_type === 'terminal' ? (await base44.functions.invoke('manageTerminal', { operation: 'link', device_id: device.id })).data.path : deviceLink(device.device_type, device.device_id);
      const url = new URL(path, window.location.origin).href;
      if (open) { if (target) target.location.href = url; else { await navigator.clipboard.writeText(url); setNotice('Lenken er kopiert; åpne den i nettleseren.'); } }
      else { await navigator.clipboard.writeText(url); setNotice('Lenke kopiert'); }
    } catch (error) { if (target) target.close(); setNotice(error.response?.data?.error || error.message); }
    finally { setBusy(false); }
  };
  return <div className="flex flex-wrap items-center gap-1">
    <Button variant="ghost" size="icon" disabled={busy} onClick={() => act(false)} aria-label="Kopier enhetslenke" title="Kopier lenke"><Copy /></Button>
    <Button variant="ghost" size="icon" disabled={busy} onClick={() => act(true)} aria-label="Åpne enhet" title="Åpne"><ExternalLink /></Button>
    {notice && <p role="status" className="w-full max-w-48 text-xs text-muted-foreground break-words">{notice}</p>}
  </div>;
}