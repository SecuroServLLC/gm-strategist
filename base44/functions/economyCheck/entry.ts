import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    const activity = (body?.activity || '').trim();
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });
    if (!activity) return Response.json({ error: 'activity mangler' }, { status: 400 });

    const [campaign, inventory, factions] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.InventoryItem.filter({ campaign_id: campaignId }),
      base44.entities.Faction.filter({ campaign_id: campaignId }),
    ]);

    const currency = inventory.filter((i) => i.category === 'currency');
    const prompt = `Du er en grundig regnskapsfører og regelverks-sjekker for en TRPG-kampanje. Spillerne driver med økonomisk aktivitet og du skal vurdere vareflyt, skatter og profitt — og påpeke konsekvenser.

KAMPAJNE: ${campaign.title}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}
Terning/regler: ${campaign.dice_config?.core_dice || '(ingen)'} | standard vanske: ${campaign.dice_config?.difficulty_default || '(ingen)'}

PARTIETS GJELDende formue (valuta-gjenstander):
${currency.map((c) => `- ${c.name}: ${c.quantity} ${c.unit || ''} (verdi ${c.value || 0}/enhet)`).join('\n') || '(ingen registrert)'}

RELEVANTE FAKSJONER (som kan kreve skatt/kutt):
${factions.map((f) => `- ${f.name} (${f.status || '?'})`).join('\n') || '(ingen)'}

ØKONOMISK AKTIVITET (beskrevet av GM):
${activity}

OPPGAVE – vurder som regnskapsfører OG regelverks-sjekker:
- assessment: 2-3 setninger om hvorvidt dette er lønnsomt og bærekraftig.
- goods_flow: hvordan varer/penger faktisk beveger seg (1-2 setninger).
- costs: liste med oppstartskostnader og løpende kostnader (konkrete tall i mynt).
- income: liste med inntektsstrømmer (konkrete tall).
- taxes: liste med skatter, avgifter, kutt til fraksjoner/myndigheter (hvem og hvor mye).
- profit: estimert netto per tidsenhet (konkret tall + 1 setning).
- risks: liste med økonomiske og narrative risikoer (f.eks. smuglere hevner, adelsfamilie krevmer).
- rule_notes: liste med mekaniske ting GM må huske (f.eks. "Persuasion DC 12 for å prute", "roll Insight for å avsløre svindel").
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          assessment: { type: "string" },
          goods_flow: { type: "string" },
          costs: { type: "array", items: { type: "string" } },
          income: { type: "array", items: { type: "string" } },
          taxes: { type: "array", items: { type: "string" } },
          profit: { type: "string" },
          risks: { type: "array", items: { type: "string" } },
          rule_notes: { type: "array", items: { type: "string" } },
        },
        required: ["assessment", "goods_flow", "costs", "income", "taxes", "profit", "risks", "rule_notes"],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}