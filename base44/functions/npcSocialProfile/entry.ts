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
    const invLines = inventory.map((it) => `${it.name} x${it.quantity || 1}`).join(", ") || "(tomt inventar)";

    const prompt = `Du er en dungeon-designer for sosiale hindringer i et TRPG-planleggingsverktøy.

NPC:
${npc.label} (element=${npc.element_key}, tags=${(npc.tags || []).join(",")})

Kampanje-kontekst: tone=${ctx.tone || "ukjent"}, setting=${ctx.setting || "ukjent"}, premisse=${ctx.premise || "ukjent"}

Nærliggende rom:
${nearLines}

Gruppens inventar:
${invLines}

Prinsipper:
- Generer en personlighet for NPC-en (1-2 setninger), en SVAKHET (grådighet, gjeld, stolthet, frykt, lojalitet, last, hemmelighet, romance) med weakness_type, og en Trust Score 0-100 der HØYERE = vanskeligere å lure.
- disposition: NPC-ens grunnholdning til fremmede (hostile/wary/neutral/friendly).
- manipulations: 3-5 konkrete måter spillerne kan lure/manipulere NPC-en på — f.eks. forfalske dokument (forge_document), svindle i terningspill (gambling), utnytte gjeld (exploit_debt), avlede oppmerksomhet (distract), utpressing/blackmail, sjarmere (charm), bestikkelse (bribe), skremme (intimidation). Hver med: method, description, requirements (hva som trengs, source nearby_room/inventory/skill), difficulty (et DC-tall 5-25), risk_level (low/medium/high).
- failure_consequence: HVA som skjer hvis svindelen feiler — konkret og spill-relevant (f.eks. vakten slår alarm, krever dobbel bestikkelse for å holde tett, blir fiendtlig og henter forsterkninger, konfiskerer gjenstander).
- Bruk nærliggende rom og inventar der det er naturlig (f.eks. et vertshus = gambling, et dokument i kontor = forfalskning).
- hooks: 2-3 rollespill-kroker GM kan bruke.

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          npc_label: { type: "string" },
          personality: { type: "string" },
          weakness: { type: "string" },
          weakness_type: { type: "string", enum: ["greed", "debt", "pride", "fear", "loyalty", "vice", "secret", "romance"] },
          disposition: { type: "string", enum: ["hostile", "wary", "neutral", "friendly"] },
          trust_score: { type: "number" },
          manipulations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                approach: { type: "string", enum: ["forge_document", "gambling", "exploit_debt", "distract", "blackmail", "charm", "bribe", "intimidation"] },
                method: { type: "string" },
                description: { type: "string" },
                requirements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      what: { type: "string" },
                      source: { type: "string", enum: ["nearby_room", "inventory", "skill"] },
                      room_label: { type: "string" },
                      item_name: { type: "string" },
                      skill: { type: "string" },
                      detail: { type: "string" },
                    },
                    required: ["what", "source"],
                  },
                },
                difficulty: { type: "number" },
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
                failure_consequence: { type: "string" },
              },
              required: ["approach", "method", "difficulty", "risk_level", "failure_consequence"],
            },
          },
          hooks: { type: "array", items: { type: "string" } },
          notes: { type: "array", items: { type: "string" } },
        },
        required: ["personality", "weakness", "trust_score", "manipulations"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}