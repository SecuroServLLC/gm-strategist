import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { selectTerminalCharacter } from '../../shared/terminalCharacters.ts';
import { terminalState, terminalPage } from '../../shared/terminalViews.ts';

export default async function(req) {
  try {
    const body = await req.json();
    const operations = ['state', 'characters', 'claim', 'maps', 'inventory', 'log'];
    if (!operations.includes(body.operation) || typeof body.access_key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.access_key) || typeof body.device_code !== 'string' || !body.device_code || body.device_code.length > 40) return Response.json({ error: 'Åpne den private terminal-lenken fra GM.' }, { status: 400 });
    if (body.cursor != null && (typeof body.cursor !== 'string' || body.cursor.length > 2000)) return Response.json({ error: 'Ugyldig side.' }, { status: 400 });
    const base44 = createClientFromRequest(req);
    // A terminal uses the long, private capability issued by its GM, never its short display code as authorization.
    const entities = base44.asServiceRole.entities;
    const accessPage = await entities.TerminalAccess.filter({ access_key: body.access_key }, { limit: 1 });
    const access = accessPage.items[0];
    if (!access) return Response.json({ error: 'Terminal-lenken er ikke gyldig. Be GM dele en ny lenke.' }, { status: 403 });
    const devicePage = await entities.Device.filter({ id: access.device_id, device_id: body.device_code, device_type: 'terminal' }, { limit: 1 });
    const device = devicePage.items[0];
    if (!device) return Response.json({ error: 'Terminalen er ikke registrert.' }, { status: 404 });
    const state = await terminalState(entities, device);
    if (body.operation === 'state') return Response.json(state);
    if (!state.active) return Response.json({ error: 'Vent til GM legger terminalen til i spillet.' }, { status: 403 });
    if (body.operation === 'claim') {
      if (typeof body.character_id !== 'string' || !body.character_id || body.character_id.length > 80) return Response.json({ error: 'Velg en karakter først.' }, { status: 400 });
      await selectTerminalCharacter(entities, device, body.character_id);
      return Response.json({ ok: true });
    }
    if (body.operation !== 'characters' && !state.character) return Response.json({ error: 'Velg og bekreft en karakter først.' }, { status: 409 });
    return Response.json(await terminalPage(entities, device, body.operation, body.cursor));
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}