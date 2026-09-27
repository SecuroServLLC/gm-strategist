import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const MAP_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    location_type: { type: 'string', enum: ['city', 'dungeon', 'wilderness', 'tavern', 'temple', 'fortress', 'ruins', 'region', 'other'] },
    description: { type: 'string' },
    location_notes: { type: 'string' },
    landmarks: { type: 'array', items: { type: 'string' } },
    connections: { type: 'string' },
    sketch_prompt: { type: 'string', description: 'Kort engelsk prompt for referanseskisse' }
  },
  required: ['title', 'location_type', 'description', 'landmarks', 'sketch_prompt']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const prompt = (body.prompt || '').toString().slice(0, 800);
    const setting = (body.setting || '').toString().slice(0, 600);
    const withSketch = body.withSketch === true;

    if (!prompt) return Response.json({ error: 'Beskrivelse mangler' }, { status: 400 });

    const llmPrompt = `Du er en Game Master-assistent. Generer et komplett kart/lokasjonskonsept for en offline rollespillkampanje.
Beskrivelse: "${prompt}"
${setting ? `Verden: ${setting}` : ''}

Krav:
- title: et stemningsfullt navn på lokasjonen.
- description: 2-4 setninger som beskriver stedet.
- location_notes: praktiske GM-notater (farer, NPCer, hemmeligheter).
- landmarks: 4-7 landemerker/rom av interesse.
- connections: hvordan stedet knytter til omverdenen.
- sketch_prompt: kort engelsk prompt for en top-down kartskisse (fantasy kartstil).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: MAP_SCHEMA,
      model: 'gpt_6_luna'
    });

    if (withSketch && result.sketch_prompt) {
      try {
        const img = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `Top-down fantasy map illustration, hand-drawn cartography style, aged parchment texture: ${result.sketch_prompt}`
        });
        if (img && img.url) result.sketch_url = img.url;
      } catch (e) {
        // Skisse valgfritt
      }
    }
    delete result.sketch_prompt;
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}