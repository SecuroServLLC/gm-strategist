import React from 'react';
import { Button } from '@/components/ui/button';
import useAiGameMaster from '@/hooks/useAiGameMaster';
import AiGmActionForm from '@/components/play/AiGmActionForm';
import AiGmTurnCard from '@/components/play/AiGmTurnCard';
import AiGmRollForm from '@/components/play/AiGmRollForm';

export default function AiGameMaster({ campaignId, sessionId, onRecorded }) {
  const gm = useAiGameMaster(campaignId, sessionId, onRecorded);
  if (gm.history.isLoading || gm.pending.isLoading || gm.characters.isLoading) return <p role="status" className="text-muted-foreground">Loading the Game Master…</p>;
  if (gm.history.isError || gm.pending.isError || gm.characters.isError) return <div role="alert" className="space-y-3"><p>Could not load the Game Master.</p><Button onClick={() => { gm.refresh(); gm.characters.refetch(); }}>Retry</Button></div>;
  const turns = gm.history.data.pages.flatMap((page) => page.items).slice().reverse();
  const characters = gm.characters.data.pages.flatMap((page) => page.items);
  return <section className="space-y-5 max-w-3xl">
    <header><h2 className="font-heading text-3xl">AI Game Master</h2><p className="text-sm text-muted-foreground mt-2">D&D 5e 2024 · You act. The Game Master asks for a roll when needed, then narrates the result. Your story and pending rolls are saved to this session.</p></header>
    <p className="text-xs text-muted-foreground">Narrative play and D20 tests. Track damage, health and equipment on the play board; this is not a complete automated combat engine.</p>
    {gm.history.hasNextPage && <Button variant="outline" disabled={gm.history.isFetchingNextPage || gm.busy} onClick={() => gm.history.fetchNextPage()}>Load Earlier Actions</Button>}
    {!turns.length && <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-5">Describe your first action, or ask the Game Master to describe the starting scene. The story follows your decisions.</p>}
    <div aria-live="polite" aria-busy={gm.busy} className="space-y-4">{turns.map((turn) => <AiGmTurnCard key={turn.id} turn={turn} />)}</div>
    {gm.error && <p role="alert" className="text-sm text-destructive">{gm.error}</p>}
    {gm.pending.data && <AiGmRollForm key={gm.pending.data.id} turn={gm.pending.data} busy={gm.busy} onResolve={gm.resolve} />}
    <AiGmActionForm characters={characters} hasMore={gm.characters.hasNextPage} loadMore={() => gm.characters.fetchNextPage()} busy={gm.busy} blocked={!!gm.pending.data} onSubmit={gm.sendAction} />
  </section>;
}