import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const npc = body.npc;
    if (!npc) return Response.json({ error: "npc required" }, { status: 400 });

    const nearby = Array.isArray(body.nearby_rooms) ? body.nearby_rooms : [];
    const inventory = Array.isArray(body.inventory) ? body.inventory : [];
    const ctx = body.context || {};

    const nearLines = nearby.map((r, i) =>
      `${i + 1}. ${r.label} | element=${r.element_key} | tags=${(r.tags || []).join(",")}`
    ).join("\n") || "(ingen nærliggende rom)";
    const invLines = inventory.map((it) => `${it.name} x${it.quantity || 1} (${it.category})`).join(", ") || "(tomt inventar)";

    const prompt = `Du er en dungeon-designer for et TRPG-planleggingsverktøy. Spillerne har valgt TRUSLER OG PSYKOLOGISK PRESS (intimidasjon / utpressing) mot en NPC. Generer en umiddelbar, strukturert rapport.

NPC:
${npc.label} (element=${npc.element_key}, tags=${(npc.tags || []).join(",")})

Kampanje-kontekst: tone=${ctx.tone || "ukjent"}, setting=${ctx.setting || "ukjent"}, premisse=${ctx.premise || "ukjent"}

Nærliggende rom:
${nearLines}

Gruppens inventar:
${invLines}

Rapporten skal ha TRE felt:

1. fear_threshold (NPC-ens frykt-terskel / motstandskraft mot trusler):
  - tier: en av timid (lettskremt, gir etter nesten med en gang), professional (profesjonell, krever reell trussel), devoted (lojal, vanskelig å knekke), psychopathic (psykopatisk lojal, trives med frykt/saadistisk, vanskeligst), fanatical (fanatisk, heller dør enn å gi etter).
  - label: kort norsk navn på terskelen.
  - description: 1-2 setninger om hvorfor akkurat denne NPC-en har denne terskelen (alder, trening, lojalitet, personlighet).
  - resistance: et tall 0-100 — HØYERE = vanskeligere å true til underkastelse.

2. escalation: 2-4 konkrete måter å bygge opp trussel-press på, fra mildt til brutalt. Hver med:
  - method: en av weapon_display (vis våpen), violence_threat (true om vold/skade), demonstrate_force (vis et eksempel — slå noen, knuse noe), blackmail (utpressing med hemmelighet), isolation (skille ham fra allierte/trygge rom).
  - description: hvordan dette gjøres konkret mot denne NPC-en.
  - requirement: hva som kreves (kilde: nearby_room/inventory/skill — konkret).
  - difficulty: et DC-tall 5-25 for å lykkes med trusselen.
  - risk_level: low/medium/high (hvor farlig/synlig dette er).

3. price_of_fear (konsekvensen av å true noen):
  - short_term: hva NPC-en gjør umiddelbart (f.eks. gir nøkkelen, slipper dere forbi, overleverer informasjon).
  - long_term: den langsiktige prisen (hater dere nå, vil prøve å ta hevn senere, slutter å samarbeide, tipser fiender).
  - snitches: tyster han til sjefen/sine allierte med en gang dere går? "ja"/"nei" + forklaring.

Vær konkret, mørkt og spill-relevant. Bruk nærliggende rom og inventar der det er naturlig (f.eks. et isolert rom = isolation enklere). Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          npc_label: { type: "string" },
          fear_threshold: {
            type: "object",
            properties: {
              tier: { type: "string", enum: ["timid", "professional", "devoted", "psychopathic", "fanatical"] },
              label: { type: "string" },
              description: { type: "string" },
              resistance: { type: "number" },
            },
            required: ["tier", "label", "resistance"],
          },
          escalation: {
            type: "array",
            items: {
              type: "object",
              properties: {
                method: { type: "string", enum: ["weapon_display", "violence_threat", "demonstrate_force", "blackmail", "isolation"] },
                description: { type: "string" },
                requirement: { type: "string" },
                difficulty: { type: "number" },
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["method", "description", "difficulty", "risk_level"],
            },
          },
          price_of_fear: {
            type: "object",
            properties: {
              short_term: { type: "string" },
              long_term: { type: "string" },
              snitches: { type: "string" },
            },
            required: ["short_term", "long_term"],
          },
          hooks: { type: "array", items: { type: "string" } },
        },
        required: ["fear_threshold", "escalation", "price_of_fear"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}