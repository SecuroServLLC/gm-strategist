import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CharacterChoiceCard from '@/components/sys/CharacterChoiceCard';
import CharacterChoiceDetails from '@/components/sys/CharacterChoiceDetails';
import { terminalRequest, useTerminalPage } from '@/components/sys/useTerminalSession';

export default function TerminalCharacterPicker({ terminal }) {
  const { code, accessKey, state, refresh } = terminal;
  const characters = useTerminalPage(code, accessKey, 'characters', state.data?.active, state.data?.campaign?.id);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const items = characters.data?.pages.flatMap((page) => page.items) || [];
  const selected = items.find((item) => item.id === selectedId);
  const confirm = async () => {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try { await terminalRequest(code, accessKey, 'claim', { character_id: selected.id }); await refresh(); }
    catch (failure) { setError(failure.response?.data?.error || failure.message); await characters.refetch(); }
    finally { setBusy(false); }
  };
  return <div className="h-dvh flex flex-col overflow-hidden bg-background text-foreground">
    <header className="shrink-0 border-b border-border bg-card px-5 py-3"><p className="text-xs text-muted-foreground">{state.data?.campaign?.title} · Terminal {code}</p><h1 className="font-heading text-3xl">Velg hvem du vil være</h1></header>
    <main className="min-h-0 flex-1 grid gap-4 overflow-y-auto p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)] md:overflow-hidden">
      <section aria-label="Ledige karakterer" className="min-h-0 overflow-y-auto scrollbar-thin">
        {characters.isPending ? <p role="status">Laster karakterer…</p> : characters.isError ? <div role="alert"><p>Kunne ikke laste karakterene.</p><Button variant="outline" onClick={() => characters.refetch()}>Prøv igjen</Button></div> : !items.length ? <p className="p-4 text-muted-foreground">Ingen åpne karakterer akkurat nå. GM kan åpne dem under Characters; de vises her automatisk.</p> : <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{items.map((character) => <CharacterChoiceCard key={character.id} character={character} selected={selectedId === character.id} disabled={busy} onSelect={() => { setSelectedId(character.id); setError(''); }} />)}</div>}
        {characters.hasNextPage && <Button className="mt-3 w-full min-h-11" variant="outline" disabled={characters.isFetchingNextPage} onClick={() => characters.fetchNextPage()}>{characters.isFetchingNextPage ? 'Laster…' : 'Vis flere karakterer'}</Button>}
      </section>
      <CharacterChoiceDetails character={selected} campaign={state.data?.campaign} busy={busy} error={error} onConfirm={confirm} />
    </main>
  </div>;
}