import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const STYLE_DESC = {
  metroidvania: "Metroidvania (puslespill): lukkede område som åpnes av nøkler/evner. Bygg snarveier, nøkkelrom og låser som krever en gjenstand fra et annet rom. Rom bør kunne gjenbesøkes.",
  roguelike: "Roguelike (noder): noder med flere valg og forgreininger. Koble rom i et nodenett med flere mulige ruter; kort avstand mellom noder; uforutsigbarhet.",
  hubspoke: "Hub & Spoke (labyrint): én sentral hub som stråler ut til grener. Identifiser hub-rom og koble sidegrener tilbake til hub.",
  gauntlet: "Gauntlet (lineær): lineær trase med økende vanske mot en sjefskamp. Få/ingen snarveier, tydelig rekkefølge, boss på slutten.",
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const style = body.style;
    const rooms = Array.isArray(body.rooms) ? body.rooms : [];
    if (!STYLE_DESC[style]) return Response.json({ error: "Ukjent stil" }, { status: 400 });
    if (rooms.length < 2) {
      return Response.json({ connections: [], roles: [], suggestions: ["Plasser minst to rom for å analysere flyt."] });
    }

    const roomLines = rooms.map((r, i) =>
      `${i + 1}. id=${r.id} | ${r.label} | kategori=${r.category} | farge=${r.color} | tags=${(r.tags || []).join(",")} | pos=${r.x},${r.y} stør=${r.w}x${r.h}`
    ).join("\n");

    const prompt = `Du er en dungeon-designer for TRPG. Valgt stil: ${style} — ${STYLE_DESC[style]}

Rom på brettet:
${roomLines}

Foreslå:
1. connections: koblinger mellom rom (bruk eksakte id-er). kind er én av: normal, key (låst/nøkkel-port), shortcut (snarvei), boss (vei til sjefskamp).
2. roles: tildel rom roller der det passer — én av: hub, boss, key, shortcut, entrance, exit. Ikke alle rom trenger rolle.
3. suggestions: 2-5 korte GM-tips på bokmål for å balansere flyten (nøkler, snarveier, sjefskamp, pacing).

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          connections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                kind: { type: "string", enum: ["normal", "key", "shortcut", "boss"] },
              },
              required: ["from", "to", "kind"],
            },
          },
          roles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                room_id: { type: "string" },
                role: { type: "string", enum: ["hub", "boss", "key", "shortcut", "entrance", "exit"] },
              },
              required: ["room_id", "role"],
            },
          },
          suggestions: { type: "array", items: { type: "string" } },
        },
        required: ["connections", "roles", "suggestions"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}