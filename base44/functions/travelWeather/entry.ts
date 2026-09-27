import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });
    const route = (body?.route || '').trim();

    const campaign = await base44.entities.Campaign.get(campaignId);

    const prompt = `Du er en atmosfærisk med-Dungeon Master som lager vær og reisehendelser med faktiske mekaniske konsekvenser. Været skal påvirke spillet, ikke bare være dekorasjon.

KAMPAJNE: ${campaign.title}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}
REISERUTE / REGION: ${route || '(oppgitt ikke — generer vær og hendelser for en typisk reise i denne verdenen)'}

OPPGAVE:
- weather: et værfenomen som påvirker mekanikken. Felt:
  - name (f.eks. "Snøstorm over Fjellpasset", "Vårflom"),
  - description (atmosfærisk, 1-2 setninger),
  - mechanical_effects: liste med konkrete mekaniske effekter (f.eks. "exhaustion ved mislykket Constitution save DC 12", "sikt redusert til 30 fot — disadvantage på angrep på avstand", "fotrente reisetid dobles"),
  - duration (hvor lenge det varer / reiseimpact, kort).
- road_conditions: 1-2 setninger om veier/forhold (flom stenger veier, ras, broer borte).
- encounters: 2-3 unike hendelser underveis, hver med title, description (1-2 setninger) og type ("combat" | "social" | "exploration" | "hazard"). Hendelsene skal føles spesifikke for denne reisen, ikke generiske tilfeldige møter.
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          weather: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              mechanical_effects: { type: "array", items: { type: "string" } },
              duration: { type: "string" },
            },
            required: ["name", "mechanical_effects"],
          },
          road_conditions: { type: "string" },
          encounters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { type: "string" },
              },
              required: ["title", "description", "type"],
            },
          },
        },
        required: ["weather", "encounters"],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}