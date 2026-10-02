import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (typeof body.turn_id !== 'string' || !body.turn_id || body.turn_id.length > 80 || !['narrative', 'outcome'].includes(body.part)) {
      return Response.json({ error: 'A saved turn and narration part are required.' }, { status: 400 });
    }
    const turn = await base44.entities.AiGmTurn.get(body.turn_id);
    if (!turn) return Response.json({ error: 'Turn not found.' }, { status: 404 });
    const campaign = await base44.entities.Campaign.get(turn.campaign_id);
    if (!campaign || campaign.trashed) return Response.json({ error: 'Campaign unavailable.' }, { status: 404 });
    if (user.role !== 'admin' && campaign.created_by_id !== user.id) return Response.json({ error: 'Only the campaign Game Master can generate narration.' }, { status: 403 });
    if (body.part === 'outcome' && (turn.status !== 'resolved' || turn.test_type === 'none')) {
      return Response.json({ error: 'Resolve the dice roll before narrating its outcome.' }, { status: 409 });
    }
    const field = body.part === 'outcome' ? 'outcome_audio_url' : 'narrative_audio_url';
    if (turn[field]) return Response.json({ url: turn[field], cached: true });
    const text = (body.part === 'outcome' ? turn.outcome : turn.narrative)?.trim();
    if (!text || text.length > 4000) return Response.json({ error: 'No valid narration is available for this turn.' }, { status: 400 });
    const recent = await base44.entities.AiGmTurn.count({
      narration_generated_by: user.id,
      narration_generated_at: { $gte: new Date(Date.now() - 3600000).toISOString() },
    });
    if (recent >= 40) return Response.json({ error: 'The hourly narrator limit has been reached. Try again later.' }, { status: 429 });
    const speech = await base44.asServiceRole.integrations.Core.GenerateSpeech({ text, voice: 'river' });
    if (!speech?.url) return Response.json({ error: 'The narrator could not generate audio. Please retry.' }, { status: 502 });
    await base44.entities.AiGmTurn.update(turn.id, {
      [field]: speech.url, narration_generated_at: new Date().toISOString(), narration_generated_by: user.id,
    });
    return Response.json({ url: speech.url, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}