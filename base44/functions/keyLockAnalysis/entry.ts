import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rooms = Array.isArray(body.rooms) ? body.rooms : [];
    if (rooms.length < 2) {
      return Response.json({ keyPlacements: [], skipWarnings: ["Plasser minst to rom for å analysere nøkkel-lås."], notes: [] });
    }

    const hasLock = rooms.some((r) => r.element_key === "locked_door" || (r.tags || []).includes("lock") || (r.tags || []).includes("barrier"));
    if (!hasLock) {
      return Response.json({
        keyPlacements: [],
        skipWarnings: [],
        notes: ["Ingen låste dører på brettet ennå. Dra inn et «Låst dør»-element for å få forslag til nøkkelgøyming."],
      });
    }

    const roomLines = rooms.map((r, i) =>
      `${i + 1}. id=${r.id} | ${r.label} | element=${r.element_key} | kategori=${r.category} | tags=${(r.tags || []).join(",")} | pos=${r.x},${r.y} stør=${r.w}x${r.h}`
    ).join("\n");

    const prompt = `Du er en dungeon-designer for en Metroidvania-nøkkel/lås-dungeon (inspirert av Metroid, Castlevania, Zelda).

Rom på brettet:
${roomLines}

Prinsipper:
- Noen veier er stengt med låste dører (element_key "locked_door" eller tags "lock"/"barrier").
- Spillerne må finne en nøkkel/gjenstand i ETT rom for å låse opp en dør i et ANNET rom — gjerne langt unna, slik at det blir god flyt og utforsking.
- Unngå at nøkkelen ligger i samme rom eller rett ved døren (for lett).
- Varsle (skipWarnings) hvis spillerne kan hoppe over hele puslespillet ved et uhell — f.eks. en snarvei/normal vei utenom den låste døren, eller hvis døren kan ignoreres.

Oppgave:
1. keyPlacements: for HVER låste dør, velg et annet rom (key_room_id) som bør skjule nøkkelen. Bruk eksakte id-er. Gi en kort "reason" på bokmål for hvorfor akkurat dette rommet gir god flyt.
2. skipWarnings: liste over konkrete risikoer for at spillerne kan skippe puslespillet (på bokmål). Tom liste hvis ingen.
3. notes: 0-3 korte tips på bokmål.

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          keyPlacements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                door_id: { type: "string" },
                door_label: { type: "string" },
                key_room_id: { type: "string" },
                key_room_label: { type: "string" },
                reason: { type: "string" },
              },
              required: ["door_id", "key_room_id", "reason"],
            },
          },
          skipWarnings: { type: "array", items: { type: "string" } },
          notes: { type: "array", items: { type: "string" } },
        },
        required: ["keyPlacements", "skipWarnings", "notes"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}