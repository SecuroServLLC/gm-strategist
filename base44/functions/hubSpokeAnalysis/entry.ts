import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rooms = Array.isArray(body.rooms) ? body.rooms : [];
    if (rooms.length < 2) {
      return Response.json({ hub_id: null, zones: [], corridors: [], shortcuts: [], issues: [], notes: ["Plasser minst to rom for å bygge hub & spoke."] });
    }

    const roomLines = rooms.map((r, i) =>
      `${i + 1}. id=${r.id} | ${r.label} | element=${r.element_key} | farge=${r.color} | kategori=${r.category} | tags=${(r.tags || []).join(",")} | pos=(${r.x},${r.y}) størrelse=${r.w}x${r.h}`
    ).join("\n");

    const prompt = `Du er en dungeon-designer for Hub & Spoke / labyrint-stil (inspirert av Dark Souls, klassiske dungeoncrawlere).

Rom på brettet (pos = celle-koordinater, større x = lenger høyre, større y = lenger ned):
${roomLines}

Prinsipper:
- Velg ÉN sentral hub (hub_id): rommet som ligger mest sentralt / er naturlig samlingspunkt (ofte et stort rom nær midten, eller et inngang/vertshus-rom).
- Grupper de øvrige rommene i soner/fløyer (zones) ut fra romlig klynge-dannelse OG tema/farge. Hver sone får et navn og en rolle (f.eks. "Nord-fløy – fangehull", "Øst-fløy – katakombe").
- corridors: logiske gang-forbindelser som RESPEKTERER brettets koordinater — en gang skal lede til et rom som faktisk ligger i naboområdet (lignende x/y). Koble hub → hver sones inngang, og rom innad i en sone i en fornuftig rekkefølge. Ikke krom rom som ligger langt fra hverandre med mindre det er en bevisst lang gang.
- shortcuts: foreslå 1-3 HEMMELIGE snarveier — gjerne fra en blindvei/ytre rom tilbake til hub, eller en skjult gang mellom to soner — med en kort beskrivelse av hvordan den skjules (f.eks. "flyttbare hyllere bak bokhylle").
- issues: advarsler hvor brettets gang-rom (element_key 'corridor'/'passage'/'hallway' om finnes) peker mot et tomt område, hvor en sone mangler forbindelse til hub, hvor rom er isolert, eller hvor en utgang peker ut av brettet uten mål. severity "warning" for problemer, "note" for tips.

Oppgave:
1. hub_id + navn på huben (gjennom hub_label).
2. zones: name, role, room_ids, room_labels.
3. corridors: from, to, from_label, to_label, reason (hvorfor denne forbindelsen er logisk).
4. shortcuts: from, to, from_label, to_label, description.
5. issues: severity, text.
6. notes: korte tips.

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          hub_id: { type: "string" },
          hub_label: { type: "string" },
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                role: { type: "string" },
                room_ids: { type: "array", items: { type: "string" } },
                room_labels: { type: "array", items: { type: "string" } },
              },
              required: ["name", "room_ids"],
            },
          },
          corridors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                from_label: { type: "string" },
                to_label: { type: "string" },
                reason: { type: "string" },
              },
              required: ["from", "to"],
            },
          },
          shortcuts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                from_label: { type: "string" },
                to_label: { type: "string" },
                description: { type: "string" },
              },
              required: ["from", "to"],
            },
          },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: { severity: { type: "string", enum: ["warning", "note"] }, text: { type: "string" } },
              required: ["severity", "text"],
            },
          },
          notes: { type: "array", items: { type: "string" } },
        },
        required: ["hub_id", "zones", "corridors", "shortcuts", "issues"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}