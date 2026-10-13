import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function useTablePage(campaignId, entity, query, sort, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['play-table', campaignId, entity, query], enabled: !!campaignId && enabled, initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities[entity].filter({ campaign_id: campaignId, ...query }, { sort, limit: 50, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
}
export default function usePlayTable(campaignId) {
  const client = useQueryClient();
  const [selectedId, setSessionId] = useState('');
  const sessions = useTablePage(campaignId, 'Session', {}, '-session_number');
  const suggested = useQuery({ queryKey: ['play-table', campaignId, 'suggested-session'], queryFn: async () => {
    const playing = await base44.entities.Session.filter({ campaign_id: campaignId, status: 'playing' }, { sort: '-session_number', limit: 1 });
    if (playing.items[0]) return playing.items[0];
    return (await base44.entities.Session.filter({ campaign_id: campaignId }, { sort: '-session_number', limit: 1 })).items[0] || null;
  } });
  const sessionId = selectedId || suggested.data?.id || '';
  const events = useTablePage(campaignId, 'SessionEvent', { session_id: sessionId }, '-created_date', !!sessionId);
  const inventory = useTablePage(campaignId, 'InventoryItem', {}, 'name');
  const eventCount = useQuery({ queryKey: ['play-table', campaignId, 'event-count', sessionId], enabled: !!sessionId, queryFn: () => base44.entities.SessionEvent.count({ campaign_id: campaignId, session_id: sessionId }) });
  const itemCounts = useQuery({ queryKey: ['play-table', campaignId, 'item-counts'], queryFn: () => base44.entities.InventoryItem.aggregate({ query: { campaign_id: campaignId }, groupBy: 'carried_by' }) });
  const refreshEvents = () => Promise.all(['SessionEvent', 'event-count'].map((key) => client.invalidateQueries({ queryKey: ['play-table', campaignId, key] })));
  const refreshItems = () => Promise.all(['InventoryItem', 'item-counts'].map((key) => client.invalidateQueries({ queryKey: ['play-table', campaignId, key] })));
  useEffect(() => {
    const stops = [
      base44.entities.SessionEvent.subscribe((event) => { if (!event.data?.campaign_id || event.data.campaign_id === campaignId) refreshEvents(); }),
      base44.entities.InventoryItem.subscribe((event) => { if (!event.data?.campaign_id || event.data.campaign_id === campaignId) refreshItems(); }),
      base44.entities.Session.subscribe((event) => { if (!event.data?.campaign_id || event.data.campaign_id === campaignId) { client.invalidateQueries({ queryKey: ['play-table', campaignId, 'Session'] }); client.invalidateQueries({ queryKey: ['play-table', campaignId, 'suggested-session'] }); } }),
    ];
    return () => stops.forEach((stop) => stop());
  }, [campaignId, client]);
  const mutation = useMutation({ mutationFn: async (command) => {
    if (command.operation === 'move') return base44.entities.InventoryItem.update(command.id, { carried_by: command.carried_by });
    if (command.operation === 'delete') return base44.entities.SessionEvent.delete(command.id);
    return base44.entities.SessionEvent.create({ campaign_id: campaignId, session_id: command.sessionId, kind: command.kind, text: command.text });
  }, onSuccess: (_, command) => command.operation === 'move' ? refreshItems() : refreshEvents() });
  return { sessions, suggested, sessionId, setSessionId, events, inventory, eventCount, itemCounts, mutation, refreshEvents,
    addEvent: (event) => mutation.mutate({ operation: 'add', sessionId, ...event }),
    deleteEvent: (id) => mutation.mutate({ operation: 'delete', id }),
    moveItem: (id, carried_by) => mutation.mutate({ operation: 'move', id, carried_by }),
  };
}