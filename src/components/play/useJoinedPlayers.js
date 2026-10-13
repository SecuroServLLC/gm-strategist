import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useJoinedPlayers(campaignId, enabled = true) {
  const client = useQueryClient();
  const players = useInfiniteQuery({
    queryKey: ['joined-players', campaignId], enabled: !!campaignId && enabled,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const { data } = await base44.functions.invoke('getJoinedPlayers', { campaign_id: campaignId, cursor: pageParam });
      return data;
    },
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
    refetchInterval: 15000,
  });
  useEffect(() => {
    if (!campaignId || !enabled) return;
    const subscriptions = ['Device', 'PartyMember', 'Character'].map((entity) => base44.entities[entity].subscribe((event) => {
      if (event.data?.campaign_id && event.data.campaign_id !== campaignId) return;
      client.invalidateQueries({ queryKey: ['joined-players', campaignId] });
    }));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [campaignId, enabled, client]);
  return players;
}