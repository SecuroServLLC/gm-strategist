import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const PATHS = [
  { key: "smart", title: "DEN SMARTE", skills: ["Stealth", "Investigation", "Sleight of Hand"], desc: "sniking, dirking, omveier" },
  { key: "social", title: "DEN SOSIALE", skills: ["Deception", "Persuasion"], desc: "bløffing, svindel, bestikkelse" },
  { key: "psychological", title: "DEN PSYKOLOGISKE", skills: ["Intimidation", "Insight"], desc: "trusler, utpressing, avhør" },
  { key: "physical", title: "DEN FYSISKE / KJEMISKE", skills: ["Verktøy / Miljø"], desc: "sprenge, smelte, brenne med funn i nærheten" },
  { key: "brutal", title: "DEN BRUTALE", skills: ["Athletics", "Initiative"], desc: "frontalangrep" },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const obstacle = body.obstacle;
    if (!obstacle) return Response.json({ error: "obstacle required" }, { status: 400 });

    const nearby = Array.isArray(body.nearby_rooms) ? body.nearby_rooms : [];
    const inventory = Array.isArray(body.inventory) ? body.inventory : [];
    const ctx = body.context || {};

    const nearLines = nearby.map((r, i) =>
      `${i + 1}. ${r.label} | element=${r.element_key} | tags=${(r.tags || []).join(",")}`
    ).join("\n") || "(ingen nærliggende rom)";
    const invLines = inventory.map((it) => `${it.name} x${it.quantity || 1} (${it.category})`).join(", ") || "(tomt inventar)";

    const pathGuide = PATHS.map((p) => `- ${p.title} (key=${p.key}): ferdigheter ${p.skills.join(" / ")} — ${p.desc}`).join("\n");

    const prompt = `Du er en logikk-motor for problemlesning i et TRPG-planleggingsverktøy. Spillerne møter et hinder. Generer nøyaktig 5 faste handlingsveier basert på klassiske DnD-ferdigheter.

Hinder:
${obstacle.label} (element=${obstacle.element_key}, kategori=${obstacle.category}, tags=${(obstacle.tags || []).join(",")})

Kampanje-kontekst: tone=${ctx.tone || "ukjent"}, setting=${ctx.setting || "ukjent"}, premisse=${ctx.premise || "ukjent"}

Nærliggende rom:
${nearLines}

Gruppens inventar:
${invLines}

De 5 veiene (returner ALLE fem, i denne rekkefølgen):
${pathGuide}

For HVER vei, spesifiser nøyaktig:
- title: veiens navn (som over).
- skills: de aktuelle ferdighetene.
- method: HVORDAN denne veien gjennomføres konkret mot dette hindret (1-2 setninger).
- requirement: HVA som kreves — what (beskrivelse), source (nearby_room/inventory/skill), og konkret room_label / item_name / skill / detail. Bruk nærliggende rom og inventar der det er naturlig (f.eks. DEN FYSISKE bruker brennbart funn i nærheten, DEN SMARTE bruker en omvei via et nærliggende rom).
- difficulty: et DC-tall 5-25.
- success: utfallet ved suksess — konkret og spill-relevant.
- failure: utfallet ved fiasko — konkret konsekvens (f.eks. alarm, skade, mistanke).

Vær konkret og bruk det som FAKTISK ligger i nærheten. Svar KUN som JSON med paths-array på nøyaktig 5.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          obstacle_label: { type: "string" },
          paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string", enum: ["smart", "social", "psychological", "physical", "brutal"] },
                title: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                method: { type: "string" },
                requirement: {
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
                difficulty: { type: "number" },
                success: { type: "string" },
                failure: { type: "string" },
              },
              required: ["key", "title", "skills", "method", "difficulty", "success", "failure"],
            },
          },
        },
        required: ["paths"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}