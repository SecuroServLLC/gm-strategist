import React, { useRef, useState } from 'react';
import { useSize } from '@/hooks/use-size';
import { Button } from '@/components/ui/button';
import MapSurface from '@/components/maps/MapSurface';
import MapInspector from '@/components/maps/MapInspector';
import { EMPTY_MAP_STATE, isVisible } from '@/lib/interactiveMap';

export default function GameDisplayMap({ query }) {
  const [selectedId, setSelectedId] = useState('');
  const [markerId, setMarkerId] = useState(null);
  const viewport = useRef(null);
  const size = useSize(viewport);
  const maps = query.data?.pages.flatMap((page) => page.items) || [];
  const map = maps.find((item) => item.id === selectedId) || maps[0];
  const state = { ...EMPTY_MAP_STATE, ...map?.interactive_state };
  const marker = state.markers.find((item) => item.id === markerId && isVisible(state, item));
  const width = size ? Math.max(0, Math.min(size.width, size.height * 4 / 3)) : 0;
  return <section aria-label="Kart" className="min-h-0 min-w-0 flex flex-col overflow-hidden rounded-xl border border-border bg-card/40">
    <div className="shrink-0 border-b border-border p-3 space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted-foreground block" htmlFor="display-map">Kart</label>
      {map && <select id="display-map" className="w-full min-w-0 rounded-md border border-input bg-background p-2 text-sm" value={map.id} onChange={(event) => { setSelectedId(event.target.value); setMarkerId(null); }}>
        {maps.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>}
      {query.hasNextPage && <Button size="sm" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Laster…' : 'Last inn flere kart'}</Button>}
      {query.isError && <p role="alert" className="text-sm text-destructive">Kunne ikke oppdatere kartet. <Button variant="outline" size="sm" onClick={() => query.refetch()}>Prøv igjen</Button></p>}
    </div>
    <div className="min-h-0 flex-1 p-2">
      <div ref={viewport} className="h-full w-full flex items-center justify-center overflow-hidden">
        {query.isPending ? <p role="status" className="text-sm text-muted-foreground">Laster kart…</p> : !map ? <p className="text-sm text-muted-foreground">Ingen kart tilgjengelig.</p> : <div className="max-w-full shrink-0" style={{ width }}>
          <MapSurface map={map} state={state} editable={false} selectedId={markerId} onSelect={(id) => { setSelectedId(map.id); setMarkerId(id); }} />
        </div>}
      </div>
    </div>
    {map && <p className="shrink-0 px-3 pb-3 text-xs text-muted-foreground">Kartet oppdateres når GM lagrer endringer. Trykk på synlige brikker og steder for detaljer.</p>}
    {marker && <div className="shrink-0 max-h-40 overflow-y-auto scrollbar-thin p-3 pt-0 [overflow-wrap:anywhere]">
      <MapInspector marker={marker} editable={false} onClose={() => setMarkerId(null)} />
    </div>}
  </section>;
}