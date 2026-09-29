import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const portraitPrompt = (body.portrait_prompt || '').toString().slice(0, 500);
    const name = (body.name || '').toString().slice(0, 80);
    const appearance = (body.appearance || '').toString().slice(0, 400);
    const race = (body.race || '').toString().slice(0, 80);
    const archetype = (body.archetype || '').toString().slice(0, 80);

    const visual = portraitPrompt || [name, race, archetype, appearance].filter(Boolean).join(', ').slice(0, 500);
    if (!visual) return Response.json({ error: 'Ingen beskrivelse for portrett' }, { status: 400 });

    const img = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: `Character portrait painting, fantasy art style, detailed, dramatic lighting, half-body, painterly: ${visual}`
    });

    return Response.json({ portrait_url: img && img.url ? img.url : null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}