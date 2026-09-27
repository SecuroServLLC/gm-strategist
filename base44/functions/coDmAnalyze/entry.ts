import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });

    const [campaign, factions, sessions] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.Faction.filter({ campaign_id: campaignId }),
      base44.entities.Session.filter({ campaign_id: campaignId }),
    ]);

    const withRecap = sessions
      .filter((s) => s.recap && s.recap.trim())
      .sort((a, b) => (b.session_number || 0) - (a.session_number || 0));
    const latest = withRecap[0] || null;
    const recap = latest?.recap || "";

    const prompt = `Du er en hyper-kreativ og analytisk med-Dungeon Master. Din jobb er å utfordre mine ideer, se blindsoner i manuset mitt, og sørge for at verdenen min reagerer dynamisk på spillerne. Når jeg oppdaterer boardet med hva som skjedde sist, skal du automatisk oppdatere faksjonsstatusen, regne ut konsekvenser, og foreslå tre uventede komplikasjoner jeg kan kaste på spillerne neste gang.

KAMPAJNE:
Tittel: ${campaign.title}
Premiss (rød tråd): ${campaign.premise || "(ingen)"}
Verden: ${campaign.setting || "(ingen)"}
Tone: ${campaign.tone || "(ingen)"}
Hint GM bør så: ${(campaign.hints || []).join("; ") || "(ingen)"}
Begrensninger (nekt): ${(campaign.constraints || []).join("; ") || "(ingen)"}

FRAKSJONER NÅ:
${factions.map((f, i) => `${i + 1}. ${f.name} — status: ${f.status || "?"}; ${f.description || ""}; notater: ${f.notes || ""}`).join("\n") || "(ingen registrert)"}

HVA SOM SKJEDDE SIST (økt ${latest?.session_number || "?"}: ${latest?.title || ""}):
${recap || "(ingen oppsummering skrevet enda — be brukeren skrive inn hva som skjedde på Økter-siden)"}

OPPGAVE:
1. faction_updates: Oppdater faksjonsstatusen basert på hva som skjedde. Én oppføring per fraksjon som påvirkes. Bruk eksakte fraksjonsnavn. "status" er ny kort status, "note" er 1-2 setninger om hvorfor.
2. consequences: 2-4 konkrete konsekvenser av hendelsene (faktiske endringer i verdenen).
3. complications: 3 uventede komplikasjoner GM kan kaste på spillerne neste gang – spesifikke, handlingsrettede, ikke generiske.
Svar på norsk (bokmål).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          faction_updates: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, status: { type: "string" }, note: { type: "string" } },
              required: ["name", "status"],
            },
          },
          consequences: { type: "array", items: { type: "string" } },
          complications: { type: "array", items: { type: "string" } },
        },
        required: ["faction_updates", "consequences", "complications"],
      },
    });

    return Response.json({
      session_title: latest?.title || null,
      session_number: latest?.session_number || null,
      recap,
      faction_updates: result.faction_updates || [],
      consequences: result.consequences || [],
      complications: result.complications || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}