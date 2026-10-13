import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { genDeviceId } from '@/lib/deviceIds';

function useDevicePage(campaignId, group) {
  return useInfiniteQuery({
    queryKey: ['game-devices', campaignId, group], enabled: !!campaignId, initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Device.filter(group === 'pending' ? { device_type: 'terminal', status: 'pending' } : { campaign_id: campaignId, status: 'active' }, { sort: '-created_date', limit: 50, cursor: pageParam }),
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
}
export default function useGameDevices(campaignId) {
  const client = useQueryClient();
  const pending = useDevicePage(campaignId, 'pending');
  const active = useDevicePage(campaignId, 'active');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: ['game-devices', campaignId] }), client.invalidateQueries({ queryKey: ['joined-players', campaignId] })]);
  useEffect(() => {
    if (!campaignId) return;
    return base44.entities.Device.subscribe(() => client.invalidateQueries({ queryKey: ['game-devices', campaignId] }));
  }, [campaignId, client]);
  const run = async (operation, device) => {
    if (busy) return;
    const prompts = { disconnect: 'Koble terminalen fra spillet? Karakteren blir ledig; utstyr og progresjon beholdes.', reset: 'La spilleren velge karakter på nytt? Utstyr og progresjon beholdes.', remove: 'Slette denne enheten? Karakterer og utstyr beholdes.' };
    if (prompts[operation] && !window.confirm(prompts[operation])) return;
    setBusy(device.id); setError('');
    try {
      if (device.device_type === 'terminal') await base44.functions.invoke('manageTerminal', { operation, device_id: device.id, campaign_id: campaignId });
      else if (operation === 'remove') await base44.entities.Device.delete(device.id);
      await refresh();
    } catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(''); }
  };
  const create = async (form) => {
    if (busy || !campaignId) return false;
    setBusy('create'); setError('');
    try {
      await base44.entities.Device.create({ device_type: form.device_type, device_id: genDeviceId(form.device_type), label: form.label.trim() || (form.device_type === 'terminal' ? 'Terminal' : 'Enhet'), status: form.device_type === 'terminal' ? 'pending' : 'active', ...(form.device_type === 'terminal' ? {} : { campaign_id: campaignId }) });
      await refresh(); return true;
    } catch (failure) { setError(failure.response?.data?.error || failure.message); return false; }
    finally { setBusy(''); }
  };
  return { pending, active, busy, error, run, create };
}