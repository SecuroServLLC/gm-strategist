import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const zone = body.zone;
    if (!zone) return Response.json({ error: "zone required" }, { status: 400 });

    // ENVEIS-REGEL: hvis sonen allerede er aggressive, kan den ikke gå tilbake.
    if (zone.escalation && zone.escalation.state === "aggressive") {
      return Response.json({
        state: "aggressive",
        alarm: true,
        guards: [],
        difficulty_mod: zone.escalation.difficulty_mod || 0,
        closed_approaches: ["smart", "social"],
        narrative: "Sonen er allerede i Aggressive — vaktstyrken er varslet og kan ikke tilbakestilles.",
        locked: true,
      });
    }

    const nearby = Array.isArray(body.nearby_rooms) ? body.nearby_rooms : [];
    const bounds = body.board_bounds || { cols: 60, rows: 40 };
    const ctx = body.context || {};

    const nearLines = nearby.map((r, i) =>
      `${i + 1}. ${r.label} | element=${r.element_key} | tags=${(r.tags || []).join(",")}`
    ).join("\n") || "(ingen nærliggende rom)";

    const prompt = `Du er en heist-eskaleringsmotor for et TRPG-planleggingsverktøy. Alarmen har akkurat gått i en sone. Beregn de automatiske konsekvensene.

Sone:
${zone.label} (element=${zone.element_key}, kategori=${zone.category}, tags=${(zone.tags || []).join(",")})
Posisjon: celle (${zone.x},${zone.y}), størrelse ${zone.w}x${zone.h}
Brettstørrelse: ${bounds.cols}x${bounds.rows} celler (x: 0..${bounds.cols - 1}, y: 0..${bounds.rows - 1})

Kampanje-kontekst: tone=${ctx.tone || "ukjent"}, setting=${ctx.setting || "ukjent"}

Nærliggende rom:
${nearLines}

Regler:
- ENVEIS: når alarmen først går, kan sonen ALDRI gå tilbake til 'Silent & Sneaky'. Vaktstyrken er varslet.
- Spawn 2-4 ekstra vakter som reagerer på alarmen. Hver vakt: label (f.eks. "Alarmvakt", "Patrulje", "Forsterkning"), element_key ("guard" eller "mercenary"), x/y (hele celle-koordinater INNENFOR brettet, plassert VED siden av sonen — ikke overlappende sonen selv), og reason (hvor de kommer fra / hvorfor).
- difficulty_mod: et tall 2-6 som legges på alle DC-sjekker i sonen nå (vaktene er i beredskap).
- closed_approaches: ALLTID ["smart","social"] — sniking (Stealth/Sleight of Hand) og bløffing/svindel (Deception/Persuasion) er nå stengt permanent. Bare fysisk/brutal forbli.
- narrative: 1-2 setninger som beskriver alarmen og kaoset som utløses.

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          state: { type: "string", enum: ["aggressive"] },
          alarm: { type: "boolean" },
          guards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                element_key: { type: "string" },
                x: { type: "number" },
                y: { type: "number" },
                reason: { type: "string" },
              },
              required: ["label", "element_key", "x", "y"],
            },
          },
          difficulty_mod: { type: "number" },
          closed_approaches: { type: "array", items: { type: "string" } },
          narrative: { type: "string" },
        },
        required: ["state", "alarm", "guards", "difficulty_mod", "closed_approaches", "narrative"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}