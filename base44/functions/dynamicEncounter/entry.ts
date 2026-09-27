import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });
    const concept = (body?.concept || '').trim();

    const campaign = await base44.entities.Campaign.get(campaignId);

    const prompt = `Du er en innovativ med-Dungeon Master som designer kampsituasjoner der selve ROMMET er en trussel — ikke bare fiendene. Tenk dynamisk terreng: synkende templer, stigende lava, magiske krystaller som bytter hvem som gjør skade, rullende tannhjul, is som knekker under foten.

KAMPAJNE: ${campaign.title}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}
Terning: ${campaign.dice_config?.core_dice || '(ingen)'} | standard DC: ${campaign.dice_config?.difficulty_default || '(ingen)'}
Attributter: ${(campaign.attributes || []).map((a) => a.name).join(', ') || '(standard)'}
Ferdigheter: ${(campaign.skills || []).map((s) => s.name).join(', ') || '(standard)'}
KONSEPT (valgfritt): ${concept || '(oppgitt ikke — finn på en spennende dynamisk kampsituasjon som passer verdenen)'}

OPPGAVE – design en miljøbasert kamp:
- title: minneverdig navn på scenen.
- setup: 2-3 setninger som beskriver situasjonen og rommet.
- terrain: liste med dynamiske terreng-elementer, hvert med name og effect (konkret mekanisk regel, f.eks. "Lava: stiger 1 fot per runde; 2d6 brannskade ved start av runden til alle i laveste sone").
- escalation: hvordan rommet forverres over runder (1-2 setninger).
- special_mechanics: liste med spesielle mekaniske regler (f.eks. "Krystaller bytter hvem som gjør skade hver runde — angripere ruller 1d6 Odd/Even").
- enemies: liste med foreslåtte fiender/antall som passer.
- gm_tactics: liste med konkrete GM-taktikker for å kjøre scenen.
- twist: en uventet vri som kan endre kampen.
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          setup: { type: "string" },
          terrain: {
            type: "array",
            items: { type: "object", properties: { name: { type: "string" }, effect: { type: "string" } }, required: ["name", "effect"] },
          },
          escalation: { type: "string" },
          special_mechanics: { type: "array", items: { type: "string" } },
          enemies: { type: "array", items: { type: "string" } },
          gm_tactics: { type: "array", items: { type: "string" } },
          twist: { type: "string" },
        },
        required: ["title", "setup", "terrain", "escalation", "special_mechanics", "enemies", "gm_tactics", "twist"],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}