import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { releaseTerminalCharacter } from '../../shared/terminalCharacters.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Logg inn som GM.' }, { status: 401 });
    const body = await req.json();
    if (!['link', 'admit', 'disconnect', 'reset', 'remove'].includes(body.operation) || typeof body.device_id !== 'string' || !body.device_id || body.device_id.length > 80) return Response.json({ error: 'Ugyldig terminalhandling.' }, { status: 400 });
    const entities = base44.entities;
    const device = await entities.Device.get(body.device_id);
    if (!device || device.device_type !== 'terminal') return Response.json({ error: 'Terminalen finnes ikke.' }, { status: 404 });
    if (user.role !== 'admin' && device.created_by_id !== user.id) return Response.json({ error: 'Bare terminalens GM kan endre tilkoblingen.' }, { status: 403 });
    if (body.operation === 'link') {
      const page = await entities.TerminalAccess.filter({ device_id: device.id }, { limit: 1 });
      const access = page.items[0] || await entities.TerminalAccess.create({ device_id: device.id, access_key: crypto.randomUUID() });
      return Response.json({ path: `/sys/terminal/${encodeURIComponent(device.device_id)}#access=${access.access_key}` });
    }
    if (body.operation === 'admit') {
      if (typeof body.campaign_id !== 'string' || !body.campaign_id || body.campaign_id.length > 80) return Response.json({ error: 'Velg en kampanje.' }, { status: 400 });
      const campaign = await entities.Campaign.get(body.campaign_id);
      if (!campaign || campaign.trashed) return Response.json({ error: 'Kampanjen finnes ikke.' }, { status: 404 });
      if (user.role !== 'admin' && campaign.created_by_id !== user.id) return Response.json({ error: 'Bare kampanjens GM kan slippe inn terminaler.' }, { status: 403 });
      if (device.status === 'active' && device.campaign_id === campaign.id) return Response.json({ ok: true });
      await entities.Device.update(device.id, { status: 'pending' });
      await releaseTerminalCharacter(entities, device);
      await entities.Device.update(device.id, { status: 'active', campaign_id: campaign.id });
      return Response.json({ ok: true });
    }
    await entities.Device.update(device.id, { status: 'pending' });
    await releaseTerminalCharacter(entities, device);
    if (body.operation === 'remove') {
      await entities.TerminalAccess.deleteMany({ device_id: device.id });
      await entities.Device.delete(device.id);
    } else await entities.Device.update(device.id, body.operation === 'reset' ? { status: device.status } : { campaign_id: '' });
    return Response.json({ ok: true });
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}