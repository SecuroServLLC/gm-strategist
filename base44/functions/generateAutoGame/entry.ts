import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const LEVELS = ['world', 'region', 'city', 'location', 'building', 'floor', 'room'];
const LEVEL_ORDER = { world: 0, region: 1, city: 2, location: 3, building: 4, floor: 5, room: 6 };
const text = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: LEVELS },
          name: { type: 'string' },
          description: { type: 'string' },
          parent_path: { type: 'string', description: 'Punktum-separert sti til forelderen, tom for world' },
          scale: { type: 'string' },
          poi_type: { type: 'string' },
          floor_number: { type: 'integer' },
          contents: { type: 'string' },
        },
        required: ['level', 'name'],
      },
    },
  },
  required: ['title', 'summary', 'nodes'],
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const story = text(body.story, 10000).trim();
    const campaignId = text(body.campaign_id, 80);
    if (!campaignId) return Response.json({ error: 'Velg en kampanje først.' }, { status: 400 });
    if (!story || story.length < 20) return Response.json({ error: 'Skriv inn en mer komplett historie (minst 20 tegn).' }, { status: 400 });
    const campaign = await base44.entities.Campaign.get(campaignId);
    if (!campaign || campaign.trashed) return Response.json({ error: 'Kampanjen finnes ikke.' }, { status: 404 });
    if (user.role !== 'admin' && campaign.created_by_id !== user.id) return Response.json({ error: 'Bare kampanjens GM kan generere en verden.' }, { status: 403 });

    const decision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Du er en verdensbygger for rollespill. Les historien under og bygg en komplett hierarkisk kartstruktur inspirert av Zelda Twilight Princess-modellen med dype, nestede kartnivåer.

NIVÅER (størst til minst):
1. world — Verdenskart: største overkart, skala 50000×50000 km, ruter 100–500 km. Én per verden.
2. region — Provins/fylke: skala max 500×500 km, ruter 5–15 km.
3. city — By/kommune: skala max 200×200 km, ruter 2–5 km.
4. location — Bydistrikt/spesifikt område: skala max 20×20 km.
5. building — Bygning med etasjer: har Floor Selector, trapper/heis.
6. floor — Etasjekart: oversiktskart for én etasje, større målestokk.
7. room — Romkart: detaljert, 1 rute = 1 meter, kan skjule elementer.

POI-HÅNDTERING:
Når historien nevner steder («hytten», «tårnet», «kirken», «slottet», «hulen»), får hvert sted et eget underkart. For bygninger med etasjer:
- Ett floor-node per etasje (oversiktskart med større målestokk)
- Ett room-node per rom i hver etasje (detaljert, 1 rute = 1 meter)
- Eksempel: «Hytten» med 2 etasjer og 3 rom hver → 1 building + 2 floors + 6 rooms = 9 noder

PARENT_PATH:
Punktum-separert sti til forelderen. Tom streng for world-noden. Eksempel: «Mittverden.Nordland.Kongesby.Gamlebyen.Slottet» betyr at «Slottet» er en building under «Gamlebyen».

FELTER:
- scale: målestokk for nivået, f.eks. «1 rute = 100 km» for world, «1 rute = 5 km» for region, «1 rute = 1 m» for room
- poi_type: type sted (hytte, tårn, kirke, slott, hule, etc.)
- floor_number: etasjenummer for floor-noder (0 = kjeller, 1 = første etasje, 2 = andre etasje, etc.)
- contents: hva som finnes her (NPCs, farer, skatter, hemmeligheter, landemerker, møbler, dører, trapper)

Historie:
${story}

${campaign.setting ? `Setting: ${text(campaign.setting, 2000)}` : ''}
${campaign.premise ? `Rød tråd: ${text(campaign.premise, 2000)}` : ''}

Generer en komplett, dypt hierarkisk struktur. Skriv ALL tekst på norsk bokmål. Vær kreativ men tro mot historien. Legg til minst 3–5 POI-er med bygninger/rom der det er naturlig. Ikke generer mer enn 150 noder totalt. Sørg for at world-noden kommer først og alle andre noders parent_path peker oppover i hierarkiet.`,
      response_json_schema: SCHEMA,
    });

    if (!decision.nodes?.length) return Response.json({ error: 'AI-en kunne ikke generere en struktur. Prøv igjen med mer detaljert historie.' }, { status: 502 });
    if (!LEVELS.includes(decision.nodes[0]?.level)) return Response.json({ error: 'Ugyldig struktur fra AI-en.' }, { status: 502 });

    const worldId = crypto.randomUUID();
    const sorted = [...decision.nodes].slice(0, 150).sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99));
    const pathToId = {};
    const records = [];

    for (const node of sorted) {
      const fullPath = node.parent_path ? `${node.parent_path}.${node.name}` : node.name;
      const parentId = node.parent_path ? (pathToId[node.parent_path] || null) : null;
      const record = await base44.entities.WorldNode.create({
        campaign_id: campaignId, world_id: worldId, parent_id: parentId,
        level: node.level, name: text(node.name, 200), description: text(node.description, 2000),
        scale: text(node.scale, 200), poi_type: text(node.poi_type, 100),
        floor_number: Number.isInteger(node.floor_number) ? node.floor_number : null,
        contents: text(node.contents, 2000), order: records.length,
      });
      pathToId[fullPath] = record.id;
      records.push(record);
    }

    // Oppdater kart-databasen: lag MapItem for toppnivå-noder (world→building)
    const MAP_LEVELS = ['world', 'region', 'city', 'location', 'building'];
    const mapLocationType = (level, poiType) => {
      const p = (poiType || '').toLowerCase();
      if (p.includes('hule') || p.includes('cave') || p.includes('dungeon') || p.includes('mine')) return 'dungeon';
      if (p.includes('kirke') || p.includes('temple') || p.includes('church') || p.includes('kapell')) return 'temple';
      if (p.includes('slott') || p.includes('castle') || p.includes('tårn') || p.includes('tower') || p.includes('fort') || p.includes('borg')) return 'fortress';
      if (p.includes('tavern') || p.includes('vertshus') || p.includes('pub')) return 'tavern';
      if (p.includes('ruin')) return 'ruins';
      if (p.includes('skog') || p.includes('forest') || p.includes('mark') || p.includes('wilderness') || p.includes('ødemark')) return 'wilderness';
      if (level === 'world' || level === 'region') return 'region';
      if (level === 'city') return 'city';
      return 'other';
    };

    const mapItems = records
      .filter(r => MAP_LEVELS.includes(r.level))
      .map(r => ({
        campaign_id: campaignId,
        title: text(r.name, 200),
        location_type: mapLocationType(r.level, r.poi_type),
        description: text(r.description, 2000),
        location_notes: text(r.contents, 2000),
        connections: `World: ${worldId}`,
      }));

    let mapCount = 0;
    if (mapItems.length) {
      const created = await base44.entities.MapItem.bulkCreate(mapItems);
      mapCount = Array.isArray(created) ? created.length : 0;
    }

    return Response.json({
      world_id: worldId, title: text(decision.title, 200), summary: text(decision.summary, 1000),
      node_count: records.length, map_count: mapCount, root_id: records[0]?.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}