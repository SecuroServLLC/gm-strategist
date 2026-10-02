import { useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useAiGameMaster(campaignId, sessionId, onRecorded) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const request = useRef(null);
  const scope = { campaign_id: campaignId, session_id: sessionId };
  const key = ['ai-gm', campaignId, sessionId];
  const history = useInfiniteQuery({
    queryKey: [...key, 'history'], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.AiGmTurn.filter(scope, { sort: '-created_date', limit: 20, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const pending = useQuery({ queryKey: [...key, 'pending'], queryFn: async () => {
    const page = await base44.entities.AiGmTurn.filter({ ...scope, status: 'awaiting_roll' }, { sort: 'created_date', limit: 1 });
    return page.items[0] || null;
  } });
  const characters = useInfiniteQuery({
    queryKey: ['ai-gm-characters', campaignId], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Character.filter({ campaign_id: campaignId }, { sort: 'name', limit: 50, fields: ['name'], cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const invoke = async (operation, payload) => {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await base44.functions.invoke('advanceAiGame', { ...scope, operation, ...payload });
      if (response.data?.error) throw new Error(response.data.error);
      if (response.data?.event) onRecorded(response.data.event);
      await refresh(); request.current = null;
      return true;
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      await refresh();
      return false;
    } finally { lock.current = false; setBusy(false); }
  };
  const sendAction = (payload) => {
    const fingerprint = JSON.stringify(payload);
    if (!request.current || request.current.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    return invoke('action', { ...payload, request_id: request.current.id });
  };
  return { history, pending, characters, busy, error, sendAction, resolve: (payload) => invoke('resolve', payload), refresh };
}