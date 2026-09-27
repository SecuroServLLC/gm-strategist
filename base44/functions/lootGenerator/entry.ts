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

    const [campaign, characters, partyMembers] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.Character.filter({ campaign_id: campaignId }),
      base44.entities.PartyMember.filter({ campaign_id: campaignId }),
    ]);

    const named = characters.filter((c) => ['protagonist', 'ally', 'mentor'].includes(c.role));
    const roster = [
      ...named.map((c) => `- ${c.name} (${c.archetype || c.role}${c.race ? ', ' + c.race : ''}${c.abilities?.length ? ' — evner: ' + c.abilities.join(', ') : ''})`),
      ...partyMembers.map((pm) => `- ${pm.name} (${pm.kind}${pm.token_type ? ', ' + pm.token_type : ''})`),
    ];

    const prompt = `Du er en kreativ med-Dungeon Master som lager magisk loot med sjel. Loot skal skape historier, ikke bare være statistiske oppgraderinger.

KAMPAJNE: ${campaign.title}
Tone: ${campaign.tone || '(ingen)'}
Verden: ${campaign.settings || '(ingen)'}
KONTEKST: ${context || '(ingen — generer passende belønninger)'}

PARTIETS SAMMENSETNING:
${roster.join('\n') || '(ingen registrert — lag generiske, allsidige gjenstander)'}

OPPGAVE: Lag 3 magiske gjenstander skreddersydd for partiet. Hver gjenstand SKAL ha:
- name: et minneverdig navn,
- type: type (våpen, ring, amulett, rustning, bok, etc.),
- description: kort atmosfærisk beskrivelse,
- benefit: den mekaniske fordelen,
- twist: en liten uventet vri som skaper historie (ikke bare +stat) — gjenstanden har en personlighet eller en bieffekt,
- curse: en liten forbannelse/ulempe som skaper historie (subtil, ikke ødeleggende for partiet).
Gjenstandene skal føles unike, passe til partiets sammensetning, og gi GM noe å leke med over tid. Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
                benefit: { type: "string" },
                twist: { type: "string" },
                curse: { type: "string" },
              },
              required: ["name", "benefit", "twist", "curse"],
            },
          },
        },
        required: ["items"],
      },
    });

    return Response.json({ items: result.items || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}