import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadoutBoard from '@/components/play/LoadoutBoard';
import SessionLog from '@/components/play/SessionLog';
import PlayMaps from '@/components/maps/PlayMaps';
import AiGameMaster from '@/components/play/AiGameMaster';
import { PlayGameMasterContext } from '@/components/play/PlayGameMaster';

export default function PlayTableTabs({ campaignId, table }) {
  const gm = useContext(PlayGameMasterContext);
  const members = gm.players.data?.pages.flatMap((page) => page.items.flatMap((player) => player.member ? [player.member] : [])) || [];
  const items = table.inventory.data?.pages.flatMap((page) => page.items) || [];
  const events = table.events.data?.pages.flatMap((page) => page.items) || [];
  return <Tabs defaultValue="maps">
    <TabsList className="mb-5 flex h-auto flex-wrap justify-start"><TabsTrigger value="maps">Maps</TabsTrigger><TabsTrigger value="loot">Equipment</TabsTrigger><TabsTrigger value="log">Log</TabsTrigger><TabsTrigger value="ai-gm">AI Game Master</TabsTrigger></TabsList>
    {table.mutation.isPending && <p role="status" className="mb-3 text-sm text-muted-foreground">Lagrer…</p>}
    {table.mutation.isError && <p role="alert" className="mb-3 text-sm text-destructive">Kunne ikke lagre: {table.mutation.error.message}</p>}
    <TabsContent value="maps"><PlayMaps key={campaignId} campaignId={campaignId} /></TabsContent>
    <TabsContent value="loot">
      {table.inventory.isPending ? <p role="status">Laster utstyr…</p> : table.inventory.isError ? <Button onClick={() => table.inventory.refetch()}>Prøv å laste utstyr igjen</Button> : <>
        {!items.length && <p className="mb-4 text-sm text-muted-foreground">Ingen utstyr er registrert ennå. <Link to="/group" className="text-primary underline">Åpne utstyrsadministrasjonen</Link>.</p>}
        <LoadoutBoard members={members} items={items} counts={table.itemCounts.data?.rows} onMoveItem={table.moveItem} />
        {table.inventory.hasNextPage && <Button className="mt-4" variant="outline" disabled={table.inventory.isFetchingNextPage} onClick={() => table.inventory.fetchNextPage()}>Vis flere gjenstander</Button>}
      </>}
    </TabsContent>
    <TabsContent value="log">
      {!table.sessionId ? <p>Velg en økt først.</p> : table.events.isPending ? <p role="status">Laster logg…</p> : table.events.isError ? <Button onClick={() => table.events.refetch()}>Prøv å laste loggen igjen</Button> : <>
        {table.events.hasNextPage && <Button className="mb-4" variant="outline" disabled={table.events.isFetchingNextPage} onClick={() => table.events.fetchNextPage()}>Vis eldre hendelser</Button>}
        <SessionLog events={events} onAdd={table.addEvent} onDelete={table.deleteEvent} />
      </>}
    </TabsContent>
    <TabsContent value="ai-gm">{table.sessionId ? <AiGameMaster /> : <p>Velg en økt først.</p>}</TabsContent>
  </Tabs>;
}