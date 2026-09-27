import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rooms = Array.isArray(body.rooms) ? body.rooms : [];
    if (rooms.length < 2) {
      return Response.json({ sequence: [], boss_id: null, difficulty_curve: { rating: "uneven", summary: "Plasser minst to rom for å bygge løypen." }, resource_budget: { total_hp_cost: 0, total_mp_cost: 0, reaches_boss: "depleted", summary: "" }, warnings: [], adjustments: [] });
    }

    const roomLines = rooms.map((r, i) =>
      `${i + 1}. id=${r.id} | ${r.label} | element=${r.element_key} | farge=${r.color} | kategori=${r.category} | tags=${(r.tags || []).join(",")} | pos=(${r.x},${r.y})`
    ).join("\n");

    const prompt = `Du er en dungeon-designer for Gauntlet / lineær boss-rush-stil (inspirert av Final Fantasy-dungeons, klassiske arkadespill).

Rom på brettet:
${roomLines}

Prinsipper:
- Rommene skal ordnes i en LINEÆR løype med ØKENDE vanskelighetsgrad — hvert rom krever at spillerne løser en kamp eller utfordring før døra til neste rom åpnes.
- Bestem en fornuftig rekkefølge (sequence) basert på posisjon og element-type: start nær inngang, slutt ved et sjef/boss-rom (rød fiende, drage, store etc.). order starter på 0.
- Hvert rom får challenge_type (combat/puzzle/hazard/elite/rest/boss) og en difficulty 1-10 som stiger jevnt mot bossen.
- Estimer hp_cost og mp_cost (heletall, grovt) per rom — hva spillerne mistar av helse og magi for å komme gjennom. Bossen koster mest.
- Sjekk vanske-kurven: stiger den jevnt, er den for brå, for flat, eller ujevn? Gi en rating.
- Beregn resource_budget: total hp_cost + mp_cost, og vurder reaches_boss — om spillerne (med typisk 30 HP / 20 MP budsjett) når frem til bossen med komfortabel, balansert, anstrengt eller tomt ressurser. Målet er å PRESSE spillerne til det ytterste, men ikke umulig.
- warnings: konkrete problemer (brå økning, to like vansker på rad, ingen hvile, boss for dyr, etc.).
- adjustments: per-rom forslag til justering for å balansere løypen (f.eks. "senk difficulty fra 8 til 6", "legg inn en kort hvile før bossen").

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                room_id: { type: "string" },
                room_label: { type: "string" },
                order: { type: "number" },
                difficulty: { type: "number" },
                challenge_type: { type: "string", enum: ["combat", "puzzle", "hazard", "elite", "rest", "boss"] },
                hp_cost: { type: "number" },
                mp_cost: { type: "number" },
                description: { type: "string" },
              },
              required: ["room_id", "order", "difficulty", "challenge_type", "hp_cost", "mp_cost"],
            },
          },
          boss_id: { type: "string" },
          boss_label: { type: "string" },
          difficulty_curve: {
            type: "object",
            properties: {
              rating: { type: "string", enum: ["well_paced", "too_steep", "too_flat", "uneven"] },
              summary: { type: "string" },
            },
            required: ["rating", "summary"],
          },
          resource_budget: {
            type: "object",
            properties: {
              total_hp_cost: { type: "number" },
              total_mp_cost: { type: "number" },
              reaches_boss: { type: "string", enum: ["comfortable", "balanced", "strained", "depleted"] },
              summary: { type: "string" },
            },
            required: ["total_hp_cost", "total_mp_cost", "reaches_boss"],
          },
          warnings: { type: "array", items: { type: "string" } },
          adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: { room_id: { type: "string" }, room_label: { type: "string" }, suggestion: { type: "string" } },
              required: ["room_id", "suggestion"],
            },
          },
        },
        required: ["sequence", "boss_id", "difficulty_curve", "resource_budget"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}