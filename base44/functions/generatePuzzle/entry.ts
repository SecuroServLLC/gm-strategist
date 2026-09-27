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

    const [campaign, inventory, characters] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.InventoryItem.filter({ campaign_id: campaignId }),
      base44.entities.Character.filter({ campaign_id: campaignId }),
    ]);

    const items = inventory.filter((i) => i.category !== 'currency').map((i) => `${i.name}${i.quantity > 1 ? ' x' + i.quantity : ''}`);
    const party = characters.filter((c) => ['protagonist', 'ally', 'mentor'].includes(c.role));

    const prompt = `Du er en listig med-Dungeon Master som designer gåter med FLERE løsningsmetoder — basert på hva spillerne faktisk har i inventaret sitt og hvilke ferdigheter de er gode på. Gåten skal aldri ha bare én løsning.

KAMPAJNE: ${campaign.title}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}
Terning: ${campaign.dice_config?.core_dice || '(ingen)'} | standard DC: ${campaign.dice_config?.difficulty_default || '(ingen)'}
Attributter: ${(campaign.attributes || []).map((a) => a.name).join(', ') || '(standard)'}
Ferdigheter: ${(campaign.skills || []).map((s) => s.name + (s.attribute ? ' (' + s.attribute + ')' : '')).join(', ') || '(standard)'}

PARTIETS INVENTAR (ting de kan bruke):
${items.join(', ') || '(ingen registrert — inkluder løsninger som bruker generelle evner/ferdigheter)'}

PARTIETS STYRKER:
${party.map((c) => `- ${c.name}${c.archetype ? ' (' + c.archetype + ')' : ''}${c.abilities?.length ? ' — evner: ' + c.abilities.join(', ') : ''}`).join('\n') || '(ingen registrert)'}

KONTEKST (valgfritt): ${context || '(ingen — design en gåte som passer verdenen)'}

OPPGAVE – design en flernivå-gåte:
- title: gåtens navn.
- premise: 2-3 setninger som beskriver situasjonen/rommet.
- the_puzzle: konkret beskrivelse av gåten — hva som skal løses (mekanisme, inskripsjon, lås, etc.).
- solutions: 3-4 ulike løsningsmetoder, hver med:
  - method: kort navn på metoden,
  - uses: hva den bruker (en konkret inventar-gjenstand, en ferdighet, et attributt, eller en kreativ handling),
  - how: 1-2 setninger om hvordan det løser gåten + evt. terningkast (f.eks. "Intelligens DC 13").
- hint: et hint GM kan gi hvis spillerne sitter fast.
- failure_consequence: hva som skjer ved feil/forsøk (felle, tidspress, alarm).
- twist: en uventet vri som gjør løsningen minneverdig.
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          premise: { type: "string" },
          the_puzzle: { type: "string" },
          solutions: {
            type: "array",
            items: { type: "object", properties: { method: { type: "string" }, uses: { type: "string" }, how: { type: "string" } }, required: ["method", "uses", "how"] },
          },
          hint: { type: "string" },
          failure_consequence: { type: "string" },
          twist: { type: "string" },
        },
        required: ["title", "premise", "the_puzzle", "solutions", "hint", "failure_consequence", "twist"],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}