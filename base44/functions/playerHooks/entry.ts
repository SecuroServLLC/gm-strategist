import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });

    const [campaign, players, characters, sessions] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.Player.filter({ campaign_id: campaignId }),
      base44.entities.Character.filter({ campaign_id: campaignId }),
      base44.entities.Session.filter({ campaign_id: campaignId }),
    ]);

    const planned = sessions.filter((s) => s.status === 'planned').sort((a, b) => (a.session_number || 0) - (b.session_number || 0))[0] || null;
    const charById = (id) => characters.find((c) => c.id === id);

    let roster = players.map((p) => {
      const ch = p.character_id ? charById(p.character_id) : null;
      return {
        player: p.name, role: p.role || 'Spiller', character: ch?.name || null,
        background: ch?.background || '', hook: ch?.hook || '', secret_agenda: ch?.secret_agenda || '',
        personality: ch?.personality || '', archetype: ch?.archetype || '', race: ch?.race || '',
      };
    }).filter((r) => r.character || r.background || r.hook);

    if (roster.length === 0) {
      roster = characters.filter((c) => ['protagonist', 'ally', 'mentor'].includes(c.role)).map((c) => ({
        player: c.name, role: c.role, character: c.name,
        background: c.background || '', hook: c.hook || '', secret_agenda: c.secret_agenda || '',
        personality: c.personality || '', archetype: c.archetype || '', race: c.race || '',
      }));
    }

    const prompt = `Du er en kreativ med-Dungeon Master. Din jobb er å utfordre mine ideer og se blindsoner, slik at hver spiller føler at bakhistorien deres betyr noe.

KAMPAJNE: ${campaign.title}
Premiss (rød tråd): ${campaign.premise || '(ingen)'}
Verden: ${campaign.settings || '(ingen)'}
Tone: ${campaign.tone || '(ingen)'}

NESTE ØKT (planlagt): ${planned ? planned.title + (planned.mode ? ' | modus: ' + planned.mode : '') + (planned.prep_notes ? ' | prep: ' + planned.prep_notes : '') : '(ingen planlagt enda — tenk på den forestående scenen)'}

SPILLERNES ROSTER (bakhistorie):
${roster.map((r, i) => `${i + 1}. Spiller: ${r.player}${r.character ? ' — karakter: ' + r.character + (r.archetype ? ' (' + r.archetype + ')' : '') + (r.race ? ' ' + r.race : '') : ''}${r.background ? ' | bakhistorie: ' + r.background : ''}${r.hook ? ' | krok: ' + r.hook : ''}${r.secret_agenda ? ' | hemmelig: ' + r.secret_agenda : ''}${r.personality ? ' | personlighet: ' + r.personality : ''}`).join('\n') || '(ingen spillere med bakhistorie registrert — be brukeren legge til spillere på Spelarar-siden)'}

OPPGAVE: For hver spiller, lag 3 konkrete koblinger som lar elementer fra deres fortid/bakhistorie dukke opp i den kommende økten (dungeon/scene). Koblingene skal være spesifikke, handlingsrettede og gi GM noe konkret å sette opp — ikke generisk. Tenk: gjenkjente ansikter, gjeld som innhentes, gamle løfter, gjenstander, rivaler, familiebånd. Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                player: { type: "string" },
                character: { type: "string" },
                connections: { type: "array", items: { type: "string" } },
              },
              required: ["player", "connections"],
            },
          },
        },
        required: ["hooks"],
      },
    });

    return Response.json({ planned_session: planned?.title || null, hooks: result.hooks || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}