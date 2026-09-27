import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const PREP_SCHEMA = {
  type: 'object',
  properties: {
    last_recap: { type: 'string', description: 'Kort sammendrag av hva som har skjedd i kampanjen så langt' },
    open_threads: {
      type: 'array',
      items: { type: 'string' },
      description: 'Åpne tråder, hint og NPCs GM bør plukke opp i neste økt'
    },
    suggested_prep: { type: 'string', description: 'Konkrete notater GM bør ha klart til neste økt' }
  },
  required: ['last_recap', 'open_threads', 'suggested_prep']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const campaignId = (body.campaign_id || '').toString().slice(0, 100);
    if (!campaignId) return Response.json({ error: 'campaign_id required' }, { status: 400 });

    const campaign = await base44.entities.Campaign.get(campaignId).catch(() => null);
    const sessions = await base44.entities.Session.filter({ campaign_id: campaignId });
    sessions.sort((a, b) => (a.session_number || 0) - (b.session_number || 0));

    const playedSessions = sessions.filter((s) => s.recap || s.notes);
    const historyText = playedSessions.length
      ? playedSessions.map((s) =>
          `Økt ${s.session_number}:\nSammendrag: ${s.recap || '—'}\nNotater: ${(s.notes || '').slice(0, 800)}`
        ).join('\n\n---\n\n')
      : 'Ingen tidligere økter med notater ennå.';

    const lastPrep = playedSessions.length ? (playedSessions[playedSessions.length - 1].prep_notes || '') : '';

    const llmPrompt = `Du er en Game Master-assistent. Forbered neste økt basert på hva som har skjedd i kampanjen så langt.

Kampanjens røde tråd: ${campaign?.premise || 'Ikke angitt'}
${campaign?.hints ? `Hint som bør sås: ${campaign.hints.join(', ')}` : ''}
${campaign?.constraints ? `Begrensninger (unngå): ${campaign.constraints.join(', ')}` : ''}

Historikk fra spillte økter:
${historyText}

${lastPrep ? `GMs notater "til neste gang" fra forrige økt:\n${lastPrep}` : ''}

Lag:
1. last_recap: et kort sammendrag av hva som har skjedd så langt (til GMs referanse).
2. open_threads: en liste med åpne tråder, hint og NPCs som bør plukkes opp i neste økt.
3. suggested_prep: konkrete notater GM bør ha klart før neste økt (scener, utfordringer, ting å forberede).

Svar på norsk.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: PREP_SCHEMA
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}