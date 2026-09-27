import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const COLOR_HINT = {
  red: "kamp / elite / sjef (rød = fare)",
  green: "hvile / trygg (grønn = trygt)",
  amber: "kjøpmann / skatt (amber = belønning)",
  blue: "magi- eller vann-hendelse",
  purple: "overnaturlig / magisk hendelse",
  slate: "felle / lumsk (mørkt)",
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rooms = Array.isArray(body.rooms) ? body.rooms : [];
    if (rooms.length < 2) {
      return Response.json({ entrance_id: null, nodes: [], branches: [], notes: ["Plasser minst to rom for å bygge node-kart."] });
    }

    const roomLines = rooms.map((r, i) =>
      `${i + 1}. id=${r.id} | ${r.label} | element=${r.element_key} | farge=${r.color} (${COLOR_HINT[r.color] || "ukjent"}) | kategori=${r.category} | tags=${(r.tags || []).join(",")} | pos=${r.x},${r.y}`
    ).join("\n");

    const prompt = `Du er en dungeon-designer for et Roguelike node-kart (inspirert av Slay the Spire, Hades, Diablo).

Rom på brettet:
${roomLines}

Prinsipper:
- Rommene er noder i en TRE-strukturert graf med flervalg: fra én node kan det gå 2-3 valg videre (venstre/høyre/frem).
- Hver node får en node_type basert på fargekoden: rød=kamp/elite/sjef, grønn=hvile/trygg, amber=kjøpmann/skatt, blå=magi-hendelse, lilla=overnaturlig hendelse, slate=felle.
- "preview" er én kort setning på bokmål om hva som venter i noden (f.eks. "Tre goblin-vakter ved et brennende bål").
- "reward" kort hva spillerne kan få (gull, hvile, gjenstand, ingenting).
- Velg en entrance_id: det rommet som er naturlig start (ofte inngang, eller rommet lengst til venstre / lavest x).
- branches: valg-kanter fra en node til neste mulige noder. Bygg et sammenhengende tre fra entrance; en node kan ha 0-3 ut-kanter. Alle rom (unntatt eventuelle isolerte) bør være nåbare fra entrance.

Oppgave:
1. entrance_id: start-node.
2. nodes: én per rom — node_type, difficulty (en av: lett/normal/hard/dødelig), preview, reward.
3. branches: kanter {from, to} som beskriver valgmulighetene.

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          entrance_id: { type: "string" },
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                room_id: { type: "string" },
                room_label: { type: "string" },
                node_type: { type: "string", enum: ["combat", "elite", "boss", "rest", "merchant", "treasure", "event", "trap"] },
                difficulty: { type: "string", enum: ["lett", "normal", "hard", "dødelig"] },
                preview: { type: "string" },
                reward: { type: "string" },
              },
              required: ["room_id", "node_type", "preview", "reward"],
            },
          },
          branches: {
            type: "array",
            items: {
              type: "object",
              properties: { from: { type: "string" }, to: { type: "string" } },
              required: ["from", "to"],
            },
          },
          notes: { type: "array", items: { type: "string" } },
        },
        required: ["entrance_id", "nodes", "branches"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}