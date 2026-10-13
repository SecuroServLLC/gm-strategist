import React, { useState } from 'react';
import { useCampaign } from '@/hooks/useCampaign';
import { Button } from '@/components/ui/button';
import { Plus, Tablet, Loader2 } from 'lucide-react';
import useGameDevices from '@/components/sys/useGameDevices';
import DeviceRow from '@/components/sys/DeviceRow';
import DeviceCreateSheet from '@/components/sys/DeviceCreateSheet';

export default function SysLanding() {
  const { campaign, loading } = useCampaign();
  const devices = useGameDevices(campaign?.id);
  const [createOpen, setCreateOpen] = useState(false);
  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!campaign) return <p className="p-8 text-muted-foreground">Velg en kampanje før du legger enheter til i spillet.</p>;
  const groups = [{ title: 'Venter på godkjenning', query: devices.pending, pending: true }, { title: 'Aktive enheter i denne kampanjen', query: devices.active, pending: false }];
  return <div className="h-full overflow-y-auto scrollbar-thin"><div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><Tablet className="h-4 w-4 text-primary" />System</p><h1 className="font-heading text-3xl">Enheter</h1><p className="mt-1 text-sm text-muted-foreground">{campaign.title} · GM slipper inn terminalene; spillerne velger karakter selv.</p></div><Button onClick={() => setCreateOpen(true)}><Plus />Ny enhet</Button></div>
    <p className="mb-6 text-sm text-muted-foreground">Kopier terminal-lenken og åpne den på nettbrettet én gang. Velg «Legg til i spillet», så vises karaktervalget automatisk. Terminalen viser deretter kart, karakter, utstyr og logg uten handlingsknapper.</p>
    {devices.error && <p role="alert" className="mb-4 text-sm text-destructive">{devices.error}</p>}
    {groups.map(({ title, query, pending }) => <section key={title} className="mb-7"><h2 className="mb-3 font-heading text-xl">{title}</h2>
      {query.isPending ? <p role="status">Laster enheter…</p> : query.isError ? <Button variant="outline" onClick={() => query.refetch()}>Prøv igjen</Button> : !query.data?.pages[0]?.items.length ? <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">{pending ? 'Ingen terminaler venter på godkjenning.' : 'Ingen aktive enheter i denne kampanjen.'}</p> : <div className="space-y-2">{query.data.pages.flatMap((page) => page.items).map((device) => <DeviceRow key={device.id} device={device} pending={pending} busy={!!devices.busy} onAction={devices.run} />)}</div>}
      {query.hasNextPage && <Button className="mt-3" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Vis flere enheter</Button>}
    </section>)}
    <DeviceCreateSheet open={createOpen} onOpenChange={setCreateOpen} onCreate={devices.create} busy={!!devices.busy} error={devices.error} />
  </div></div>;
}