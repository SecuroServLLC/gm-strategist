import React, { useRef, useState } from 'react';
import usePlayTable from '@/components/play/usePlayTable';
import PlaySessionHeader from '@/components/play/PlaySessionHeader';
import PlayTableTabs from '@/components/play/PlayTableTabs';
import PlayGameMaster from '@/components/play/PlayGameMaster';
import SceneSoundscape from '@/components/audio/SceneSoundscape';
import AiNarrator from '@/components/audio/AiNarrator';

export default function PlayTable({ campaignId }) {
  const table = usePlayTable(campaignId);
  const [narrationRequest, setNarrationRequest] = useState(null);
  const currentSession = useRef(table.sessionId);
  currentSession.current = table.sessionId;
  return <div className="h-full overflow-y-auto scrollbar-thin"><div className="max-w-6xl mx-auto px-4 py-8 sm:px-8 sm:py-10">
    <PlaySessionHeader table={table} />
    {table.sessionId && <SceneSoundscape key={`${campaignId}:${table.sessionId}`} campaignId={campaignId} sessionId={table.sessionId} />}
    {table.sessionId && <AiNarrator key={`narrator:${campaignId}:${table.sessionId}`} request={narrationRequest?.sessionId === table.sessionId ? narrationRequest : null} />}
    <PlayGameMaster key={`moves:${campaignId}:${table.sessionId}`} campaignId={campaignId} sessionId={table.sessionId} onRecorded={() => table.refreshEvents()} onNarration={(turn, operation) => {
      if (turn.session_id === currentSession.current) setNarrationRequest({ turnId: turn.id, sessionId: turn.session_id, part: operation === 'resolve' ? 'outcome' : 'narrative' });
    }}>
      <PlayTableTabs campaignId={campaignId} table={table} />
    </PlayGameMaster>
  </div></div>;
}