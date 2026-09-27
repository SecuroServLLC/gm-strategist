import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });
    const context = (body?.context || '').trim();

    const campaign = await base44.entities.Campaign.get(campaignId);

    const prompt = `Du er en rask, improviserende med-Dungeon Master. Spillerne har nettopp gått en helt annen vei enn planlagt, og GM trenger nød-NPC-er som kan slippes inn hvor som helst på sekundet.

KAMPAJNE: ${campaign.title}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}
HVOR SPILLERNE ER NÅ: ${context || '(oppgitt ikke — lag NPC-er som passer hvor som helst i denne verdenen)'}

OPPGAVE: Lag 3 distinkte nød-NPC-er. Hver skal være umiddelbart spillbar, levende og passe inn i verdenen. Hver NPC har:
- name: et minneverdig navn,
- race: art,
- role: yrke/profesjon (f.eks. vertshuseier, vandringsmunk, leiesoldat, kjøpmann, tjuv, prest),
- motivation: hva de vil akkurat nå (1 setning),
- secret: en hemmelighet som kan skape intrige,
- quirk: en merkelig/vanstelig vane eller et særpreget trekk,
- appearance: kort, fargerikt utseende (1 setning).
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          npcs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                race: { type: "string" },
                role: { type: "string" },
                motivation: { type: "string" },
                secret: { type: "string" },
                quirk: { type: "string" },
                appearance: { type: "string" },
              },
              required: ["name", "motivation", "secret", "quirk"],
            },
          },
        },
        required: ["npcs"],
      },
    });

    return Response.json({ npcs: result.npcs || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}