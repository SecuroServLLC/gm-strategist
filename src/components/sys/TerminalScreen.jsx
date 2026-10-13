import React from 'react';
import useTerminalSession from '@/components/sys/useTerminalSession';
import TerminalWaiting from '@/components/sys/TerminalWaiting';
import TerminalCharacterPicker from '@/components/sys/TerminalCharacterPicker';
import TerminalView from '@/components/sys/TerminalView';
import { Splash } from '@/components/sys/SysStates';
import { Button } from '@/components/ui/button';

export default function TerminalScreen({ deviceId }) {
  const terminal = useTerminalSession(deviceId);
  const { code, accessKey, state } = terminal;
  if (!accessKey) return <TerminalWaiting code={code} needsLink />;
  if (state.isPending) return <Splash />;
  if (!state.data) return <main className="h-dvh flex flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
    <h1 className="font-heading text-3xl">Kunne ikke åpne terminalen</h1><p role="alert" className="text-sm text-muted-foreground">{state.error?.response?.data?.error || 'Kontroller tilkoblingen, eller åpne terminal-lenken fra GM på nytt.'}</p><Button onClick={() => state.refetch()}>Prøv igjen</Button>
  </main>;
  if (!state.data.active) return <TerminalWaiting code={code} />;
  if (!state.data.character) return <TerminalCharacterPicker key={state.data.campaign.id} terminal={terminal} />;
  return <TerminalView key={`${state.data.campaign.id}:${state.data.member.id}`} terminal={terminal} />;
}