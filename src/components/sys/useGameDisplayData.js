import { useEffect } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function useDisplayList(campaignId, entity, query, sort) {
  return useInfiniteQuery({
    queryKey: ['game-display', campaignId, entity], enabled: !!campaignId,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities[entity].filter({ campaign_id: campaignId, ...query }, { sort, limit: 50, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
}

export default function useGameDisplayData(campaignId) {
  const client = useQueryClient();
  const campaign = useQuery({
    queryKey: ['game-display', campaignId, 'Campaign'], enabled: !!campaignId,
    queryFn: () => base44.entities.Campaign.get(campaignId),
  });
  const maps = useDisplayList(campaignId, 'MapItem', {}, '-updated_date');
  const members = useDisplayList(campaignId, 'PartyMember', { status: { $ne: 'dead' }, character_id: { $exists: true, $nin: ['', null] } }, 'name');
  const events = useDisplayList(campaignId, 'SessionEvent', {}, '-created_date');
  const memberPages = members.data?.pages || [];
  const characterIds = memberPages.flatMap((page) => page.items.map((member) => member.character_id));
  const characters = useQuery({
    queryKey: ['game-display', campaignId, 'Character', characterIds], enabled: !!campaignId && characterIds.length > 0,
    queryFn: async () => (await Promise.all(memberPages.map((page) => base44.entities.Character.filter(
      { campaign_id: campaignId, id: { $in: page.items.map((member) => member.character_id) } },
      { limit: 50, fields: ['name', 'archetype', 'race', 'hp', 'portrait_url', 'stats'] },
    )))).flatMap((page) => page.items),
  });
  useEffect(() => {
    if (!campaignId) return;
    const subscriptions = ['Campaign', 'MapItem', 'PartyMember', 'Character', 'SessionEvent'].map((entity) =>
      base44.entities[entity].subscribe((event) => {
        if (entity === 'Campaign' ? event.id !== campaignId : event.data?.campaign_id && event.data.campaign_id !== campaignId) return;
        client.invalidateQueries({ queryKey: ['game-display', campaignId, entity] });
      }),
    );
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [campaignId, client]);
  return { campaign, maps, members, events, characters };
}