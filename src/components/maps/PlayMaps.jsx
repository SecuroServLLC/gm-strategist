import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import PlayMapEditor from "@/components/maps/PlayMapEditor";

export default function PlayMaps({ campaignId }) {
  const [selectedId, setSelectedId] = useState('');
  const dirty = useRef(false);
  const client = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ['play-maps', campaignId], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.MapItem.filter({ campaign_id: campaignId }, { sort: '-updated_date', limit: 50, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  if (query.isLoading) return <p role="status" className="text-muted-foreground">Loading maps…</p>;
  if (query.isError) return <p role="alert">Could not load maps. <Button variant="outline" onClick={() => query.refetch()}>Retry</Button></p>;
  const maps = query.data?.pages.flatMap((page) => page.items) || [];
  const selected = maps.find((map) => map.id === selectedId) || maps[0];
  if (!selected) return <p className="text-muted-foreground">No maps yet. <Link className="text-primary underline" to="/maps/new">Create a map</Link> to place characters and locations.</p>;
  return <div className="space-y-4">
    <label className="block text-sm">Map
      <select className="block mt-1 w-full rounded-md border border-input bg-background p-3" value={selected.id} onChange={(e) => {
        if (dirty.current && !window.confirm('Discard unsaved map changes and switch maps?')) return;
        dirty.current = false; setSelectedId(e.target.value);
      }}>{maps.map((map) => <option key={map.id} value={map.id}>{map.title}</option>)}</select>
    </label>
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load More Maps</Button>}
    <PlayMapEditor key={selected.id} map={selected} onDirty={(value) => { dirty.current = value; }} onSaved={() => { setSelectedId(selected.id); client.invalidateQueries({ queryKey: ['play-maps', campaignId] }); }} />
  </div>;
}