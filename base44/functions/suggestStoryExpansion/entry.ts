import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const EXPANSION_SCHEMA = {
  type: 'object',
  properties: {
    narrative_note: { type: 'string', description: 'Kort refleksjon over hvor historien kan gå' },
    suggested_nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          node_type: { type: 'string', enum: ['scene', 'choice', 'dice_challenge', 'event', 'climax', 'ending'] },
          description: { type: 'string' },
          dice_suggestion: { type: 'string', description: 'F.eks. "Smidighet DC 14" eller "" hvis ingen terninger' },
          success_outcome: { type: 'string' },
          failure_outcome: { type: 'string' },
          branch_label: { type: 'string' },
          hints: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'summary', 'node_type', 'description']
      }
    }
  },
  required: ['narrative_note', 'suggested_nodes']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parentNode = body.parentNode || null;
    const campaign = body.campaign || null;
    const direction = (body.direction || '').toString().slice(0, 500);

    const llmPrompt = `Du er en Game Master-assistent for et custom TRPG-system. Foreslå 2-3 naturlige utvidelser av historien fra nåværende scene.

Kampanjens røde tråd: ${campaign?.premise || 'Ikke angitt'}
${campaign?.constraints ? `Begrensninger (unngå dette): ${campaign.constraints.join(', ')}` : ''}
${campaign?.hints ? `Hint som bør sås: ${campaign.hints.join(', ')}` : ''}

Nåværende scene:
${parentNode ? `Tittel: ${parentNode.title}\nOppsummering: ${parentNode.summary}\nBeskrivelse: ${parentNode.description || ''}` : 'Dette er startscenen (ingen forelder).'}

${direction ? `GMs ønskede retning: ${direction}` : ''}

Foreslå utvidelser som:
- Gir meningsfulle valg og forgreninger (ulike veier).
- Foreslår når terninger bør rulles og hvilke utfall som kreves (dice_suggestion, success_outcome, failure_outcome).
- Såer hint fra kampanjens røde tråd der det passer.
- Holder seg innenfor begrensningene.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: EXPANSION_SCHEMA,
      model: 'gpt_6_luna'
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}