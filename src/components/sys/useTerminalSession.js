import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { normalizeDeviceId } from '@/lib/deviceIds';

export async function terminalRequest(code, accessKey, operation, extra = {}) {
  const { data } = await base44.functions.invoke('terminalSession', { device_code: code, access_key: accessKey, operation, ...extra });
  return data;
}

export function useTerminalPage(code, accessKey, operation, enabled, scope = '') {
  return useInfiniteQuery({
    queryKey: ['terminal', code, accessKey, operation, scope], enabled: !!accessKey && enabled,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => terminalRequest(code, accessKey, operation, { cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
    refetchInterval: 15000,
  });
}

export default function useTerminalSession(rawId) {
  const code = normalizeDeviceId(rawId);
  const client = useQueryClient();
  const [accessKey] = useState(() => {
    const fromLink = new URLSearchParams(window.location.hash.slice(1)).get('access');
    return fromLink || localStorage.getItem(`gm_terminal_access:${code}`) || '';
  });
  useEffect(() => {
    if (!accessKey) return;
    localStorage.setItem(`gm_terminal_access:${code}`, accessKey);
    localStorage.setItem('gm_terminal_code', code);
    if (window.location.hash.includes('access=')) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [code, accessKey]);
  const state = useQuery({
    queryKey: ['terminal', code, accessKey, 'state'], enabled: !!accessKey,
    queryFn: () => terminalRequest(code, accessKey, 'state'), refetchInterval: 8000, retry: false,
  });
  const campaignId = state.data?.campaign?.id;
  useEffect(() => {
    if (!accessKey) return;
    const subscriptions = ['Device', 'Character', 'PartyMember', 'Campaign', 'InventoryItem', 'MapItem', 'SessionEvent'].map((entity) => base44.entities[entity].subscribe((event) => {
      if (entity === 'Device') {
        if (event.id !== state.data?.device?.id && event.data?.device_id !== code) return;
      } else if (entity === 'Campaign' ? event.id !== campaignId : event.data?.campaign_id && event.data.campaign_id !== campaignId) return;
      const operations = { Device: ['state', 'characters'], Character: ['state', 'characters'], PartyMember: ['state'], Campaign: ['state'], InventoryItem: ['inventory'], MapItem: ['maps'], SessionEvent: ['log'] };
      operations[entity].forEach((operation) => client.invalidateQueries({ queryKey: ['terminal', code, accessKey, operation] }));
    }));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [code, accessKey, campaignId, state.data?.device?.id, client]);
  return { code, accessKey, state, refresh: () => client.invalidateQueries({ queryKey: ['terminal', code, accessKey] }) };
}