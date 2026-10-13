import React from 'react';
import { Loader2, Tablet } from 'lucide-react';

export default function TerminalWaiting({ code, needsLink = false }) {
  return <main className="h-dvh flex flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
    <Tablet className="h-10 w-10 text-primary" />
    <h1 className="font-heading text-3xl">{needsLink ? 'Åpne terminal-lenken fra GM' : 'Venter på GM'}</h1>
    <p className="font-mono text-5xl tracking-[0.2em]">{code}</p>
    <p className="max-w-md text-sm text-muted-foreground">{needsLink ? 'GM åpner Enheter og deler terminalens lenke. Åpne den én gang på dette nettbrettet; tilkoblingen huskes her.' : 'GM må legge denne terminalen til i spillet. Deretter kan du velge karakter direkte på skjermen.'}</p>
    {!needsLink && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Oppdateres automatisk</p>}
  </main>;
}