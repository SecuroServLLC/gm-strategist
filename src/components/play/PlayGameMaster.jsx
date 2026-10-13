import React, { createContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAiGameMaster from '@/hooks/useAiGameMaster';
import AiGmActionForm from '@/components/play/AiGmActionForm';
import AiGmTurnCard from '@/components/play/AiGmTurnCard';
import AiGmRollForm from '@/components/play/AiGmRollForm';
import AiDiceControl from '@/components/play/AiDiceControl';
import JoinedPlayerStatus from '@/components/play/JoinedPlayerStatus';

export const PlayGameMasterContext = createContext(null);

export default function PlayGameMaster({ campaignId, sessionId, onRecorded, onNarration, children }) {
  const gm = useAiGameMaster(campaignId, sessionId, onRecorded, onNarration);
  const diceKey = `gm_ai_dice:${campaignId}:${sessionId}`;
  const [aiDice, setAiDice] = useState(() => localStorage.getItem(diceKey) === 'true');
  const loading = gm.history.isLoading || gm.pending.isLoading || gm.players.isLoading;
  const failed = gm.history.isError || gm.pending.isError || gm.players.isError;
  const latest = gm.pending.data || gm.history.data?.pages[0]?.items[0];
  const characters = gm.players.data?.pages.flatMap((page) => page.items) || [];
  return <PlayGameMasterContext.Provider value={gm}>
    <section aria-label="Player moves" className="mb-6 space-y-4">
      {!sessionId ? <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-heading text-2xl">Enter Player Move</h2>
        <p className="mt-2 text-sm text-muted-foreground"><Link to="/sessions" className="text-primary underline">Create a session</Link> to enter player moves.</p>
      </div> : loading ? <p role="status" className="text-muted-foreground">Loading player moves…</p> : failed ? <div role="alert" className="space-y-3">
        <p>Could not load player moves.</p>
        <Button onClick={() => { gm.refresh(); gm.players.refetch(); }}>Retry</Button>
      </div> : <>
        <AiGmActionForm characters={characters} hasMore={gm.players.hasNextPage} loadMore={() => gm.players.fetchNextPage()} busy={gm.busy} blocked={!!gm.pending.data} onSubmit={gm.sendAction} />
        {gm.error && <p role="alert" className="text-sm text-destructive">{gm.error}</p>}
        {latest && <div aria-live="polite" aria-busy={gm.busy} className="space-y-3">
          <h3 className="font-heading text-xl">Game Master Response</h3>
          <AiGmTurnCard turn={latest} />
        </div>}
        {gm.pending.data && <AiGmRollForm key={gm.pending.data.id} turn={gm.pending.data} busy={gm.busy} onResolve={gm.resolve} aiDice={aiDice} />}
        <JoinedPlayerStatus players={players} onUpdated={() => gm.players.refetch()} />
      </>}
    </section>
    {children}
  </PlayGameMasterContext.Provider>;
}