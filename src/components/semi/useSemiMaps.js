import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useSemiMaps(entity, campaignId, fields) {
  return useInfiniteQuery({
    queryKey: ['semi-list', entity, campaignId], enabled: !!campaignId, initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities[entity].filter({ campaign_id: campaignId }, { sort: '-created_date', limit: 50, fields, cursor: pageParam }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
}