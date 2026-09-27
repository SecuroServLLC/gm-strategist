import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const target = body.target;
    if (!target) return Response.json({ error: "target required" }, { status: 400 });

    const nearby = Array.isArray(body.nearby_rooms) ? body.nearby_rooms : [];
    const inventory = Array.isArray(body.inventory) ? body.inventory : [];
    const ctx = body.context || {};

    const nearLines = nearby.map((r, i) =>
      `${i + 1}. ${r.label} | element=${r.element_key} | tags=${(r.tags || []).join(",")}`
    ).join("\n") || "(ingen nærliggende rom)";
    const invLines = inventory.map((it) => `${it.name} x${it.quantity || 1} (${it.category})`).join(", ") || "(tomt inventar)";

    const kind = target.category === "enemy" ? "fiende" : target.category === "npc" ? "vakt/NPC" : "fysisk hindring";

    const prompt = `Du er en dungeon-designer for et TRPG-planleggingsverktøy. Spillerne har valgt VOLD / BRUTE FORCE mot en ${kind}. Generer en umiddelbar, strukturert konsekvens-rapport.

Mål:
${target.label} (element=${target.element_key}, kategori=${target.category}, tags=${(target.tags || []).join(",")})

Kampanje-kontekst: tone=${ctx.tone || "ukjent"}, setting=${ctx.setting || "ukjent"}, premisse=${ctx.premise || "ukjent"}

Nærliggende rom på brettet:
${nearLines}

Gruppens inventar:
${invLines}

Rapporten skal alltid ha disse TRE faste punktene:

1. TAKTISK MILJØ (tactical_terrain): 2-3 konkrete ting i rommet/nærommet spillerne kan bruke i slåsskampen (ustabile kasser, stup, hengende lykter, smale ganger, brennbare tønner, høydeforskjeller, feller). Bruk HELST nærliggende rom (referer room_label). Hver med: feature (navn) og detail (hvordan utnyttes i kampen).

2. STØY OG RIPPLE EFFECTS (støy og konsekvenser):
  - noise_level: silent/low/medium/high/extreme — hvor mye bråk slåsskampen/sprengningen lager.
  - blood: blodsøl — hvor synlig, hvor mye (for en hindring: splintre/rivninger i stedet).
  - alerted_enemies: blir naborommene varslet? HVEM og fra HVILKET rom (bruk room_label). "Ingen" hvis stille nok.
  - remains: hva skjer med likene/blodsporene etterpå — setter de igjen spor? Må de gjemmes? (for en hindring: røy/skader som avslører tvang).
  - aftermath: etterslep — får spillerne et etterslep eller en ettersøkt-plakat? Konsekvenser utover rommet: ettersøkt-plakat på spillerne, hevngjerrig fraksjon, mistenkelig vaktsjef.

3. UDBYTTE / LOOT: nøyaktig hva de sitter igjen med etter kampen — nøkler, skadd ELLER brukbar rustning/våpen, mynter og verdisaker fra lommene. Hver med: item (navn), category (weapon/armor/consumable/valuable/currency/key/misc), condition (usket/skadd/intakt/ødelagt) og note.

Vær konkret og spill-relevant. Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          target_label: { type: "string" },
          tactical_terrain: {
            type: "array",
            items: {
              type: "object",
              properties: { feature: { type: "string" }, room_label: { type: "string" }, detail: { type: "string" } },
              required: ["feature"],
            },
          },
          noise_level: { type: "string", enum: ["silent", "low", "medium", "high", "extreme"] },
          blood: { type: "string" },
          alerted_enemies: { type: "string" },
          remains: { type: "string" },
          aftermath: { type: "string" },
          loot: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                category: { type: "string", enum: ["weapon", "armor", "consumable", "valuable", "currency", "key", "misc"] },
                condition: { type: "string" },
                note: { type: "string" },
              },
              required: ["item", "category"],
            },
          },
        },
        required: ["tactical_terrain", "noise_level", "loot"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}