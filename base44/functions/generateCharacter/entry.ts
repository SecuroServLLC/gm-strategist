import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CHARACTER_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    archetype: { type: 'string' },
    race: { type: 'string' },
    role: { type: 'string', enum: ['protagonist', 'ally', 'antagonist', 'npc', 'contact', 'mentor'] },
    background: { type: 'string' },
    personality: { type: 'string' },
    stats: {
      type: 'object',
      properties: {
        kraft: { type: 'number' },
        smidighet: { type: 'number' },
        utholdenhet: { type: 'number' },
        intelligens: { type: 'number' },
        visdom: { type: 'number' },
        utstralning: { type: 'number' }
      }
    },
    abilities: { type: 'array', items: { type: 'string' } },
    appearance: { type: 'string' },
    hook: { type: 'string' },
    portrait_prompt: { type: 'string', description: 'Kort visuell prompt for portrettbilde' }
  },
  required: ['name', 'archetype', 'race', 'role', 'background', 'personality', 'stats', 'abilities', 'appearance', 'hook', 'portrait_prompt']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const prompt = (body.prompt || '').toString().slice(0, 1000);
    const setting = (body.setting || '').toString().slice(0, 800);
    const withPortrait = body.withPortrait !== false;

    if (!prompt) return Response.json({ error: 'Beskrivelse mangler' }, { status: 400 });

    const llmPrompt = `Du er en Game Master-assistent for et custom, fleksibelt TRPG-system der "alt er lov".
Generer en komplett, unik karakter basert på denne beskrivelsen: "${prompt}".
${setting ? `Kampanjens verden: ${setting}` : ''}

Krav:
- Gi karakteren et minneverdig navn, en kreativ custom arketype (ikke standard D&D-klasser), og en passende race.
- stats er seks attributter på skalaen 1-20 (kraft, smidighet, utholdenhet, intelligens, visdom, utstralning).
- abilities: 3-5 unike evner/ferdigheter med kort forklaring.
- background: 2-4 setninger med historie.
- personality: trekk som gjør karakteren levende.
- appearance: visuell beskrivelse for GM.
- hook: hvordan karakteren knytter seg til en kampanje.
- portrait_prompt: en kort, visuell prompt på engelsk for å generere et portrettmaleri (fantasy-stil, halvlysvinkel, malerisk).`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: CHARACTER_SCHEMA,
      model: 'gpt_5_6_luna'
    });

    let character = llm;

    if (withPortrait && character.portrait_prompt) {
      try {
        const img = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `Character portrait painting, fantasy art style, detailed, dramatic lighting: ${character.portrait_prompt}`
        });
        if (img && img.url) character.portrait_url = img.url;
      } catch (e) {
        // Portrett valgfritt – fortsett uten
      }
    }

    delete character.portrait_prompt;
    return Response.json({ character });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}