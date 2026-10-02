import React, { createContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAiGameMaster from '@/hooks/useAiGameMaster';
import AiGmActionForm from '@/components/play/AiGmActionForm';
import AiGmTurnCard from '@/components/play/AiGmTurnCard';
import AiGmRollForm from '@/components/play/AiGmRollForm';

export const PlayGameMasterContext = createContext(null);

export default function PlayGameMaster({ campaignId, sessionId, onRecorded, onNarration, children }) {
  const gm = useAiGameMaster(campaignId, sessionId, onRecorded, onNarration);
  const loading = gm.history.isLoading || gm.pending.isLoading || gm.characters.isLoading;
  const failed = gm.history.isError || gm.pending.isError || gm.characters.isError;
  const latest = gm.pending.data || gm.history.data?.pages[0]?.items[0];
  const characters = gm.characters.data?.pages.flatMap((page) => page.items) || [];
  return <PlayGameMasterContext.Provider value={gm}>
    <section aria-label="Player moves" className="mb-6 space-y-4">
      {!sessionId ? <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-heading text-2xl">Enter Player Move</h2>
        <p className="mt-2 text-sm text-muted-foreground"><Link to="/sessions" className="text-primary underline">Create a session</Link> to enter player moves.</p>
      </div> : loading ? <p role="status" className="text-muted-foreground">Loading player moves…</p> : failed ? <div role="alert" className="space-y-3">
        <p>Could not load player moves.</p>
        <Button onClick={() => { gm.refresh(); gm.characters.refetch(); }}>Retry</Button>
      </div> : <>
        <AiGmActionForm characters={characters} hasMore={gm.characters.hasNextPage} loadMore={() => gm.characters.fetchNextPage()} busy={gm.busy} blocked={!!gm.pending.data} onSubmit={gm.sendAction} />
        {gm.error && <p role="alert" className="text-sm text-destructive">{gm.error}</p>}
        {latest && <div aria-live="polite" aria-busy={gm.busy} className="space-y-3">
          <h3 className="font-heading text-xl">Game Master Response</h3>
          <AiGmTurnCard turn={latest} />
        </div>}
        {gm.pending.data && <AiGmRollForm key={gm.pending.data.id} turn={gm.pending.data} busy={gm.busy} onResolve={gm.resolve} />}
      </>}
    </section>
    {children}
  </PlayGameMasterContext.Provider>;
}