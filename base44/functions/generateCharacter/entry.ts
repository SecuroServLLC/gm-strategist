import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

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
    portrait_prompt: { type: 'string', description: 'Kort visuell prompt for portrettbilde (engelsk)' }
  },
  required: ['name', 'archetype', 'race', 'role', 'background', 'personality', 'stats', 'abilities', 'appearance', 'hook', 'portrait_prompt']
};

const TONE_DESC = {
  'nøytral': 'nøytral og balansert',
  'mørk': 'mørk og dyster',
  'episk': 'episk og heltemodig',
  'komisk': 'komisk og lun',
  'tragisk': 'tragisk og melankolsk'
};

const POWER_RANGE = {
  'lav': '6-10',
  'standard': '8-14',
  'helt': '12-16',
  'legendarisk': '15-20'
};

function clampCount(n) {
  const v = parseInt(n);
  if (isNaN(v) || v < 1) return 3;
  return Math.min(20, v);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const prompt = (body.prompt || '').toString().slice(0, 1000);
    const setting = (body.setting || '').toString().slice(0, 800);
    const requested = clampCount(body.count);
    const target = requested + 2;
    const tone = TONE_DESC[body.tone] || TONE_DESC['nøytral'];
    const powerRange = POWER_RANGE[body.powerLevel] || POWER_RANGE['standard'];
    const roles = Array.isArray(body.roles) ? body.roles.filter(Boolean) : [];
    const raceHint = (body.raceHint || '').toString().slice(0, 200);
    const archetypeHint = (body.archetypeHint || '').toString().slice(0, 200);

    if (!prompt) return Response.json({ error: 'Beskrivelse mangler' }, { status: 400 });

    const rolesLine = roles.length
      ? `Rollene karakterene kan fylle (varier mellom dem): ${roles.join(', ')}.`
      : 'Velg roller fritt blant protagonist, alliert, antagonist, npc, kontakt, mentor.';

    const llmPrompt = `Du er en Game Master-assistent for et custom, fleksibelt TRPG-system der "alt er lov".
GMen ber om minst ${requested} karakterer basert på denne beskrivelsen: "${prompt}".
Generer minst ${requested}, gjerne opptil ${target} (totalt), så GMen har flere å velge mellom.
${setting ? `Kampanjens verden: ${setting}` : 'Ingen fastsatt verden – skap fritt.'}

Stemning: ${tone}.
Kraftnivå: attributter (kraft, smidighet, utholdenhet, intelligens, visdom, utstralning) skal ligge i området ${powerRange} (skala 1-20).
${rolesLine}
${raceHint ? `Race-hint: ${raceHint}.` : 'Race velges fritt og variert.'}
${archetypeHint ? `Arketype-hint: ${archetypeHint}.` : 'Bruk kreative custom arketyper, ikke standard D&D-klasser.'}

Krav til HVER karakter:
- Et minneverdig navn, en kreativ custom arketype, og en passende race.
- stats: seks attributter i området ${powerRange}.
- abilities: 3-5 unike evner med kort forklaring (format "Navn: forklaring").
- background: 2-4 setninger.
- personality: trekk som gjør karakteren levende.
- appearance: visuell beskrivelse for GM.
- hook: hvordan karakteren kan knyttes til en kampanje.
- portrait_prompt: en kort visuell prompt på ENGELSK for et portrettmaleri (fantasy-stil, halvlysvinkel, malerisk).

Gjør karakterene forskjellige fra hverandre i personlighet, rolle og tilnærming. Returner som en array.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          characters: { type: 'array', items: CHARACTER_SCHEMA }
        },
        required: ['characters']
      },
      model: 'gpt_6_luna'
    });

    const characters = Array.isArray(llm.characters) ? llm.characters : [];

    return Response.json({ characters, character: characters[0] || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}