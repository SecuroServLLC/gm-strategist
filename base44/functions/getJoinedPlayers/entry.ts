import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { joinedPlayersPage } from '../../shared/joinedPlayers.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Logg inn som GM.' }, { status: 401 });
    const body = await req.json();
    if (typeof body.campaign_id !== 'string' || !body.campaign_id || body.campaign_id.length > 80 || (body.cursor != null && (typeof body.cursor !== 'string' || body.cursor.length > 2000))) return Response.json({ error: 'Velg en gyldig kampanje.' }, { status: 400 });
    const campaign = await base44.entities.Campaign.get(body.campaign_id);
    if (!campaign || campaign.trashed) return Response.json({ error: 'Kampanjen finnes ikke.' }, { status: 404 });
    if (user.role !== 'admin' && campaign.created_by_id !== user.id) return Response.json({ error: 'Bare GM kan styre spillerne.' }, { status: 403 });
    return Response.json(await joinedPlayersPage(base44, campaign.id, { cursor: body.cursor }));
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}