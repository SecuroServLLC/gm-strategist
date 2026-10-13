import React, { useState } from 'react';
import { Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTerminalPage } from '@/components/sys/useTerminalSession';
import GameDisplayMap from '@/components/sys/GameDisplayMap';
import GameDisplayFeed from '@/components/sys/GameDisplayFeed';
import CharacterPanel from '@/components/sys/CharacterPanel';
import TerminalInventory from '@/components/sys/TerminalInventory';
import LogFeed from '@/components/sys/LogFeed';

const TABS = [{ id: 'character', label: 'Karakter' }, { id: 'inventory', label: 'Utstyr' }, { id: 'log', label: 'Logg' }];
export default function TerminalView({ terminal }) {
  const { code, accessKey, state } = terminal;
  const { campaign, member, character } = state.data;
  const [tab, setTab] = useState('character');
  const scope = `${campaign.id}:${member.id}`;
  const maps = useTerminalPage(code, accessKey, 'maps', true, scope);
  const inventory = useTerminalPage(code, accessKey, 'inventory', tab === 'inventory', scope);
  const log = useTerminalPage(code, accessKey, 'log', tab === 'log', scope);
  return <div className="h-dvh min-h-0 flex flex-col overflow-hidden bg-background text-foreground">
    <header className="shrink-0 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
      <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{campaign.title}</p><h1 className="font-heading text-2xl truncate">{character.name}</h1></div>
      <div className="shrink-0 text-right"><p className="flex items-center justify-end gap-1 text-xs text-primary"><Tablet className="h-4 w-4" />{code}</p><p className="text-xs text-muted-foreground">GM styrer handlingene</p></div>
    </header>
    {state.isError && <p role="alert" className="px-4 py-2 text-sm text-destructive">Oppdatering feilet. Viser siste lagrede tilstand. <Button size="sm" variant="outline" onClick={() => state.refetch()}>Prøv igjen</Button></p>}
    <main className="min-h-0 flex-1 grid gap-3 overflow-y-auto p-3 md:grid-cols-[minmax(0,1.5fr)_minmax(270px,1fr)] md:overflow-hidden">
      <div className="min-h-0 min-w-0 h-[65dvh] md:h-full [&>section]:h-full"><GameDisplayMap query={maps} /></div>
      <section aria-label="Spillerinformasjon" className="min-h-0 min-w-0 flex flex-col h-[65dvh] md:h-full overflow-hidden rounded-xl border border-border bg-card/40">
        <nav aria-label="Spillerinformasjon" className="shrink-0 grid grid-cols-3 border-b border-border">{TABS.map((item) => <button type="button" key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={cn('min-h-11 px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring', tab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>{item.label}</button>)}</nav>
        {tab === 'character' ? <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4"><CharacterPanel character={character} partyMember={member} campaign={campaign} /></div> : <div className="min-h-0 flex-1 [&>section]:h-full">
          <GameDisplayFeed title={tab === 'inventory' ? 'Ditt utstyr og felleslager' : 'Hendelseslogg'} query={tab === 'inventory' ? inventory : log} moreLabel="Vis flere">
            {tab === 'inventory' ? <TerminalInventory items={inventory.data?.pages.flatMap((page) => page.items) || []} memberId={member.id} /> : <LogFeed events={log.data?.pages.flatMap((page) => page.items) || []} />}
          </GameDisplayFeed>
        </div>}
      </section>
    </main>
  </div>;
}