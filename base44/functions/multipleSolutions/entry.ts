import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

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

    const nearLines = nearby.map((r, i) =>
      `${i + 1}. ${r.label} (id=${r.id}) | element=${r.element_key} | farge=${r.color} | tags=${(r.tags || []).join(",")} | pos=(${r.x},${r.y})`
    ).join("\n") || "(ingen nærliggende rom)";

    const invLines = inventory.map((it) => `${it.name} x${it.quantity || 1} (${it.category})`).join(", ") || "(tomt inventar)";

    const prompt = `Du er en dungeon-designer for et "Multiple Solution Engine" i et TRPG-planleggingsverktøy.

Hindring (obstacle):
${obstacle.label} (element=${obstacle.element_key}, tags=${(obstacle.tags || []).join(",")})

Nærliggende rom på brettet:
${nearLines}

Gruppens inventar:
${invLines}

Prinsipper:
- Generer MINST 3, gjerne 4, alternative veier forbi denne hindringen. Bruk ulike tilnærminger: brutal (kraft/sprengning), smart (kjemisk/fysisk, f.eks. smelte/brann), sneaky (tyveri/dirke/lure), creative (omvei/ventilasjonssjakt/svak vegg), og omrelevant magical (magi).
- Hver løsning: en kort tittel, metode (hvordan), og requirements — HVA som kreves og HVORFRA: source "nearby_room" (et konkret nærliggende rom, oppgi room_label), "inventory" (en gjenstand gruppen har, oppgi item_name), eller "skill" (en ferdighet, oppgi skill-navn + grovt DC-forslag i detail).
- feasibility: "ready" hvis alt krevert finnes i nærheten/inventaret nå, "partial" hvis noe mangler, "missing" hvis løsningen krever at GM plasserer ut ressurser først.
- consequence: en dynamisk konsekvens av å velge denne veien (f.eks. "Eksplosjonen bråker og tiltrekker monstre fra neste rom", "Dirking tar tid og øker risiko for oppdagelse"). Valgene skal ha noe å si for spillet.
- placements: for løsninger som er partial/missing, foreslå konkrete ressurser GM bør plassere i et nærliggende rom (room_label, item, reason) for å gjøre løsningen mulig.
- Legg vekt på å bruke elementene som FAKTISK ligger i nærheten (les tags/element_key) — f.eks. et rom med "fire"/"volcano" gjør brenne-løsningen enklere.
- I tillegg, inkluder en "violence"-blokk: VOLD / BRUTE FORCE som fullverdig kategori for å ødelegge/sprekke hindringen med rå kraft. Fyll ut:
  - environmental_tactics: hvordan nærliggende rom kan brukes (f.eks. brennbare tønner, rasfare, fallhøyde).
  - noise_level: silent/low/medium/high/extreme (hvor mye lyd sprengingen/smashingen lager).
  - blood: blodsøl (ofte "ingen" for en hindring, men f.eks. splintre/sprekker).
  - alerted_enemies: hvem som blir varslet og fra hvor.
  - remains: hva som skjer med hindringens rester etterpå.
  - loot: hva spillerne sitter igjen med (ofte tomt for en dør, men kanskje mekanisme-del eller ingenting).

Svar KUN som JSON.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          obstacle_label: { type: "string" },
          solutions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                approach: { type: "string", enum: ["brutal", "smart", "sneaky", "creative", "magical"] },
                title: { type: "string" },
                method: { type: "string" },
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
                feasibility: { type: "string", enum: ["ready", "partial", "missing"] },
                consequence: { type: "string" },
                description: { type: "string" },
              },
              required: ["approach", "title", "method", "requirements", "feasibility", "consequence"],
            },
          },
          placements: {
            type: "array",
            items: {
              type: "object",
              properties: { room_label: { type: "string" }, item: { type: "string" }, reason: { type: "string" } },
              required: ["item", "reason"],
            },
          },
          violence: {
            type: "object",
            properties: {
              environmental_tactics: {
                type: "array",
                items: {
                  type: "object",
                  properties: { tactic: { type: "string" }, room_label: { type: "string" }, detail: { type: "string" } },
                  required: ["tactic"],
                },
              },
              noise_level: { type: "string", enum: ["silent", "low", "medium", "high", "extreme"] },
              blood: { type: "string" },
              alerted_enemies: { type: "string" },
              remains: { type: "string" },
              loot: {
                type: "array",
                items: {
                  type: "object",
                  properties: { item: { type: "string" }, condition: { type: "string" }, note: { type: "string" } },
                  required: ["item"],
                },
              },
            },
          },
          notes: { type: "array", items: { type: "string" } },
        },
        required: ["solutions"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}