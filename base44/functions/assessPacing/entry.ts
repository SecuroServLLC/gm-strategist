import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    const keywords = (body?.keywords || '').trim();
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });
    if (!keywords) return Response.json({ error: 'keywords mangler' }, { status: 400 });

    const [campaign, sessions] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.Session.filter({ campaign_id: campaignId }),
    ]);

    const withRecap = sessions.filter((s) => s.recap && s.recap.trim()).sort((a, b) => (b.session_number || 0) - (a.session_number || 0));
    const latest = withRecap[0] || null;
    const planned = sessions.filter((s) => s.status === 'planned').sort((a, b) => (a.session_number || 0) - (b.session_number || 0))[0] || null;

    const prompt = `Du er en med-Dungeon Master med svart belte i pacing. Du leser hvordan en økt føltes og foreslår nøyaktig hvor neste økt trenger pustepause versus action.

KAMPAJNE: ${campaign.title}
Tone: ${campaign.tone || '(ingen)'}

FORRIGE ØKT oppsummering: ${latest?.recap || '(ingen oppsummering)'}

STIKKORD OM HVORDAN FORRIGE ØKT GIKK:
${keywords}

NESTE ØKT (planlagt): ${planned ? planned.title + (planned.mode ? ' | modus: ' + planned.mode : '') + (planned.prep_notes ? ' | prep: ' + planned.prep_notes : '') : '(ingen planlagt enda)'}

OPPGAVE:
- assessment: 2-3 setninger om hvordan tempoet føltes og hvorfor (for høyt, for lavt, eller balansert).
- tempo: "too_high" | "too_low" | "balanced".
- next_balance.calm: 2-3 konkrete steder i neste økt som bør være rolige / sosiale encounters (pustepause) — spesifikt, ikke generisk.
- next_balance.action: 2-3 konkrete steder som bør være action / bevegelse / spenning.
- suggestion: 1-2 setninger om hvordan GM bør justere neste økt for å lande perfekt.
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          assessment: { type: "string" },
          tempo: { type: "string", enum: ["too_high", "too_low", "balanced"] },
          next_balance: {
            type: "object",
            properties: {
              calm: { type: "array", items: { type: "string" } },
              action: { type: "array", items: { type: "string" } },
            },
          },
          suggestion: { type: "string" },
        },
        required: ["assessment", "tempo", "next_balance", "suggestion"],
      },
    });

    return Response.json({
      assessment: result.assessment || '',
      tempo: result.tempo || 'balanced',
      next_balance: result.next_balance || { calm: [], action: [] },
      suggestion: result.suggestion || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}