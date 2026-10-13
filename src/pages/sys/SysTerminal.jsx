import React from 'react';
import { useParams } from 'react-router-dom';
import TerminalScreen from '@/components/sys/TerminalScreen';

export default function SysTerminal() {
  const { deviceId } = useParams();
  return <TerminalScreen key={deviceId} deviceId={deviceId} />;
}


function Waiting({ code, label }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-foreground">
      <div className="flex items-center gap-2 mb-6 text-amber-400">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs uppercase tracking-[0.2em]">Venter på GM</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">Vis denne koden til GM for å bli sluppet inn:</p>
      <p className="font-mono text-7xl tracking-[0.25em] mb-6">{code}</p>
      {label && label !== "Terminal" && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-8">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Venter på godkjenning…
      </div>
    </div>
  );
}