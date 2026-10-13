import React from 'react';
import { cn } from '@/lib/utils';
import GameDisplayMap from '@/components/sys/GameDisplayMap';
import GameDisplayFeed from '@/components/sys/GameDisplayFeed';
import GameDisplayPlayers from '@/components/sys/GameDisplayPlayers';
import LogFeed from '@/components/sys/LogFeed';

export default function GameDisplayContent({ on, data }) {
  const hasInfo = on.log || on.players;
  const events = data.events.data?.pages.flatMap((page) => page.items) || [];
  const members = data.members.data?.pages.flatMap((page) => page.items) || [];
  return <main className={cn('min-h-0 flex-1 grid gap-4 p-3 md:p-4 overflow-y-auto md:overflow-hidden', on.map && hasInfo ? 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]' : 'grid-cols-1')}>
    {on.map && <div className="min-w-0 min-h-0 h-[65dvh] md:h-full [&>section]:h-full"><GameDisplayMap query={data.maps} /></div>}
    {hasInfo && <div className={cn('min-h-0 min-w-0 grid gap-4 h-[75dvh] md:h-full', on.log && on.players ? 'grid-rows-[minmax(0,3fr)_minmax(0,2fr)]' : 'grid-rows-1')}>
      {on.log && <GameDisplayFeed title="Hendelseslogg" query={data.events} moreLabel="Last inn eldre hendelser">
        <LogFeed events={events} />
      </GameDisplayFeed>}
      {on.players && <GameDisplayFeed title="Spillere" query={data.members} moreLabel="Last inn flere spillere">
        <GameDisplayPlayers members={members} characters={data.characters} campaign={data.campaign.data} />
      </GameDisplayFeed>}
    </div>}
    {!on.map && !hasInfo && <p className="self-center text-center text-sm text-muted-foreground">Slå på kart, spillere eller logg med knappene over.</p>}
  </main>;
}