import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const campaignId = body?.campaign_id;
    if (!campaignId) return Response.json({ error: 'campaign_id mangler' }, { status: 400 });

    const [campaign, factions, characters, sessions] = await Promise.all([
      base44.entities.Campaign.get(campaignId),
      base44.entities.Faction.filter({ campaign_id: campaignId }),
      base44.entities.Character.filter({ campaign_id: campaignId }),
      base44.entities.Session.filter({ campaign_id: campaignId }),
    ]);

    const withRecap = sessions
      .filter((s) => s.recap && s.recap.trim())
      .sort((a, b) => (b.session_number || 0) - (a.session_number || 0));
    const latest = withRecap[0] || null;
    const recap = latest?.recap || "";
    const inputEvent = (body?.event || "").trim();
    const happening = inputEvent || recap;

    const prompt = `Du er en hyper-kreativ og analytisk med-Dungeon Master. Din jobb er å utfordre mine ideer, se blindsoner i manuset mitt, og sørge for at verdenen min reagerer dynamisk på spillerne. Verdenen skal føles LEVENDE – den beveger seg rundt spillerne selv når de ikke er til stede.

KAMPAJNE:
Tittel: ${campaign.title}
Premiss (rød tråd): ${campaign.premise || "(ingen)"}
Verden: ${campaign.settings || "(ingen)"}
Tone: ${campaign.tone || "(ingen)"}
Hint GM bør så: ${(campaign.hints || []).join("; ") || "(ingen)"}
Begrensninger (nekt): ${(campaign.constraints || []).join("; ") || "(ingen)"}

FAKSJONER & MAKT (nåværende tilstand):
${factions.map((f, i) => `${i + 1}. ${f.name} — status: ${f.status || "?"} | makt: ${typeof f.power === "number" ? f.power : "?"}/100 | skjult agenda: ${f.agenda || "(ingen)"} | gjør: ${(f.activities || []).join("; ") || "(ingenting}"}` + ` | notater: ${f.notes || ""}`).join("\n") || "(ingen registrert)"}

VIKTIGE NPC-ER (rollebesetning):
${characters.map((c) => `- ${c.name} (${c.role || "npc"}${c.archetype ? ", " + c.archetype : ""})${c.secret_agenda ? " — skjult agenda: " + c.secret_agenda : ""}`).join("\n") || "(ingen registrert)"}

HVA SOM SKJEDDE SIST (økt ${latest?.session_number || "?"}: ${latest?.title || ""}):
${happening || "(INGENTING SKREVET INN — be brukeren skrive hva spillerne gjorde, eller skrive oppsummering på Økter-siden)"}

OPPGAVE – la verdenen reagere og leve:
1. faction_updates: Oppdater fraksjonene basert på hva spillerne oppnådde eller ødela. Én oppføring per fraksjon som PÅVIRKES. Bruk eksakte fraksjonsnavn. Felt:
   - status: ny kort status,
   - power: ny maktverdi 0-100 (heltall),
   - power_delta: endring fra forrige (kan være negativ),
   - activity: ÉN konkret bakgrunnshandling fraksjonen nå gjør (uavhengig av spillerne),
   - agenda_note: hvordan fraksjonens skjulte agenda rykker frem eller endres (1-2 setninger).
2. ripple: Konsekvenser i fire kategorier, hver en liste med 1-3 konkrete punkter:
   - political: politisk stabilitet (allianser, maktskifter, tillit),
   - economic: økonomi (handel, priser, fattigdom, smugling),
   - revenge: hevnaksjoner (fra dem spillerne tråkket på),
   - long_term: langsiktige konsekvenser som modner over flere økter.
3. npc_agendas: For 1-3 viktige NPC-er, oppdater deres skjulte agenda som utvikler seg uavhengig av spillerne. Bruk eksakte NPC-navn. Felt:
   - name, agenda (ny/oppdatert skjult mål), note (hvorfor den endret seg, 1 setning).
4. complications: 3 uventede komplikasjoner GM kan kaste på spillerne NESTE gang – spesifikke, handlingsrettede, ikke generiske.
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
              properties: {
                name: { type: "string" },
                status: { type: "string" },
                power: { type: "number" },
                power_delta: { type: "number" },
                activity: { type: "string" },
                agenda_note: { type: "string" },
              },
              required: ["name", "status"],
            },
          },
          ripple: {
            type: "object",
            properties: {
              political: { type: "array", items: { type: "string" } },
              economic: { type: "array", items: { type: "string" } },
              revenge: { type: "array", items: { type: "string" } },
              long_term: { type: "array", items: { type: "string" } },
            },
          },
          npc_agendas: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, agenda: { type: "string" }, note: { type: "string" } },
              required: ["name", "agenda"],
            },
          },
          complications: { type: "array", items: { type: "string" } },
        },
        required: ["faction_updates", "ripple", "npc_agendas", "complications"],
      },
    });

    return Response.json({
      session_title: latest?.title || null,
      session_number: latest?.session_number || null,
      happening,
      faction_updates: result.faction_updates || [],
      ripple: result.ripple || { political: [], economic: [], revenge: [], long_term: [] },
      npc_agendas: result.npc_agendas || [],
      complications: result.complications || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}