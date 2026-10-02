import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function MapCharacterPicker({ campaignId, marker, onChange }) {
  const query = useInfiniteQuery({
    queryKey: ['map-character-picker', campaignId], enabled: !!campaignId,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Character.filter({ campaign_id: campaignId }, { sort: 'name', limit: 50, fields: ['name'], cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const characters = query.data?.pages.flatMap((page) => page.items) || [];
  return <div className="space-y-2">
    <label className="text-sm block">Character (optional)
      <select className="mt-1 block w-full rounded-md border border-input bg-background p-2" value={marker.character_id || ''} disabled={query.isLoading}
        onChange={(e) => { const character = characters.find((c) => c.id === e.target.value); onChange({ character_id: e.target.value, ...(character ? { name: character.name } : {}) }); }}>
        <option value="">{query.isLoading ? 'Loading characters…' : 'Custom token'}</option>
        {marker.character_id && !characters.some((c) => c.id === marker.character_id) && <option value={marker.character_id}>{marker.name}</option>}
        {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
    {query.isError && <p role="alert" className="text-sm text-destructive">Could not load characters. <button type="button" className="underline" onClick={() => query.refetch()}>Retry</button></p>}
    {query.hasNextPage && <Button type="button" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load More Characters</Button>}
  </div>;
}