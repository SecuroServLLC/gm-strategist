import React from 'react';
import { Switch } from '@/components/ui/switch';

export default function AiDiceControl({ enabled, onChange, disabled }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3">
    <label htmlFor="ai-dice" className="cursor-pointer min-w-0"><span className="block text-sm font-medium">AI Dice</span><span className="block text-xs text-muted-foreground">{enabled ? 'Appen kaster tilfeldig når GM trykker «Kast og avgjør».' : 'Kast fysisk, og la GM registrere tallene.'}</span></label>
    <Switch id="ai-dice" checked={enabled} onCheckedChange={onChange} disabled={disabled} />
  </div>;
}