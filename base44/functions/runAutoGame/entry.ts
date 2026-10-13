import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { AUTOGAME_TEMPLATES, mapLocationType } from '../../shared/autogameTemplates.ts';

const text = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';

const LEVELS = ['world', 'region', 'city', 'location', 'building', 'floor', 'room'];
const LEVEL_ORDER = { world: 0, region: 1, city: 2, location: 3, building: 4, floor: 5, room: 6 };
const MAP_LEVELS = ['world', 'region', 'city', 'location', 'building'];

const CHAR_SCHEMA = {
  type: 'object',
  properties: {
    characters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string', enum: ['protagonist', 'ally', 'antagonist', 'npc', 'contact', 'mentor'] },
          archetype: { type: 'string' },
          race: { type: 'string' },
          background: { type: 'string' },
          personality: { type: 'string' },
          appearance: { type: 'string' },
          hook: { type: 'string' },
          secret_agenda: { type: 'string' },
          stats: { type: 'object', description: 'Attributter: kraft, smidighet, utholdenhet, intelligens, visdom, utstralning (1-20)' },
          hp: { type: 'number' },
          abilities: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'role'],
      },
    },
  },
  required: ['characters'],
};

const WORLD_SCHEMA = {
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

const STORY_SCHEMA = {
  type: 'object',
  properties: {
    premise: { type: 'string', description: 'Den røde tråden — hovedfortellingen' },
    hints: { type: 'array', items: { type: 'string' } },
    constraints: { type: 'array', items: { type: 'string' } },
    themes: { type: 'array', items: { type: 'string' } },
    tone: { type: 'string' },
    story_nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          node_type: { type: 'string', enum: ['scene', 'choice', 'dice_challenge', 'event', 'climax', 'ending'] },
          description: { type: 'string' },
          dice_suggestion: { type: 'string' },
          success_outcome: { type: 'string' },
          failure_outcome: { type: 'string' },
          parent_path: { type: 'string', description: 'Punktum-separert sti til forelder-story-node, tom for første' },
          hints: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'node_type'],
      },
    },
  },
  required: ['premise', 'story_nodes'],
};

const ITEM_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string', enum: ['weapon', 'armor', 'consumable', 'valuable', 'currency', 'misc'] },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          value: { type: 'number' },
          description: { type: 'string' },
        },
        required: ['name', 'category'],
      },
    },
  },
  required: ['items'],
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const campaignId = text(body.campaign_id, 80);
    const story = text(body.story, 10000);
    const templateId = text(body.template_id, 30) || 'medium';
    const editMessage = text(body.edit_message, 5000);
    const existingWorldId = text(body.world_id, 100);

    if (!campaignId) return Response.json({ error: 'Velg en kampanje først.' }, { status: 400 });
    if (!story && !editMessage) return Response.json({ error: 'Skriv inn en historie eller en redigeringsmelding.' }, { status: 400 });

    const campaign = await base44.entities.Campaign.get(campaignId);
    if (!campaign || campaign.trashed) return Response.json({ error: 'Kampanjen finnes ikke.' }, { status: 404 });
    if (user.role !== 'admin' && campaign.created_by_id !== user.id) return Response.json({ error: 'Bare kampanjens GM kan generere.' }, { status: 403 });

    const template = AUTOGAME_TEMPLATES[templateId] || AUTOGAME_TEMPLATES.medium;
    const isEdit = !!editMessage;
    const inputStory = isEdit ? editMessage : story;

    // Fetch existing context for edit mode
    let existingContext = '';
    if (isEdit) {
      const [charsR, nodesR, storiesR] = await Promise.allSettled([
        base44.entities.Character.filter({ campaign_id: campaignId }, { limit: 50, fields: ['name', 'role'] }),
        base44.entities.WorldNode.filter({ campaign_id: campaignId }, { limit: 50, fields: ['name', 'level'] }),
        base44.entities.StoryNode.filter({ campaign_id: campaignId }, { limit: 50, fields: ['title', 'node_type'] }),
      ]);
      const cl = charsR.status === 'fulfilled' ? charsR.value.items : [];
      const nl = nodesR.status === 'fulfilled' ? nodesR.value.items : [];
      const sl = storiesR.status === 'fulfilled' ? storiesR.value.items : [];
      existingContext = `\n\nEKSISTERENDE INNHOLD (ikke lag duplikater, bygg videre på dette):\nKarakterer: ${cl.map(c => c.name).join(', ')}\nSteder: ${nl.map(n => n.name).join(', ')}\nStory nodes: ${sl.map(s => s.title).join(', ')}`;
    }

    const steps = [];
    const result = { world_id: existingWorldId || null, title: '', summary: '', steps, characters: [], maps: [], story_nodes: [], items: [], red_thread: null };

    // ── STEP 1: CHARACTERS ──
    try {
      const charCount = isEdit ? '2-4' : `${template.character_count}`;
      const protCount = isEdit ? '0-1' : `${template.protagonist_count}`;
      const charResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Du er en karakterbygger for rollespill. ${isEdit ? 'Legg til nye karakterer basert på:' : 'Generer karakterer for denne historien:'}
${inputStory}${existingContext}
${campaign.setting ? `Setting: ${text(campaign.setting, 1000)}` : ''}
${campaign.premise ? `Rød tråd: ${text(campaign.premise, 1000)}` : ''}

Generer ${charCount} karakterer, hvor ${protCount} er protagonistene (spillerkarakterer). Resten er allierte, antagonister, NPCer, mentorer og kontakter.
For HVER karakter:
- name: minneverdig navn
- role: protagonist | ally | antagonist | npc | contact | mentor
- archetype: kreativ custom arketype (ikke standard D&D-klasser)
- race: fantasy-race
- background: 2-4 setninger
- personality: levende trekk
- appearance: visuell beskrivelse
- hook: hvordan knytte til kampanje
- secret_agenda: skjult motiv (kun for NPCer/antagonister, tomt for protagonist)
- stats: objekt med kraft, smidighet, utholdenhet, intelligens, visdom, utstralning (1-20)
- hp: livspoeng
- abilities: 3-5 evner med kort forklaring

Skriv ALL tekst på norsk bokmål.`,
        response_json_schema: CHAR_SCHEMA,
      });

      let createdChars = [];
      if (charResult.characters?.length) {
        const charRecords = charResult.characters.slice(0, 20).map(c => ({
          campaign_id: campaignId,
          name: text(c.name, 200),
          role: c.role || 'npc',
          archetype: text(c.archetype, 200),
          race: text(c.race, 100),
          background: text(c.background, 2000),
          personality: text(c.personality, 2000),
          appearance: text(c.appearance, 2000),
          hook: text(c.hook, 1000),
          secret_agenda: text(c.secret_agenda, 1000),
          stats: c.stats || {},
          hp: c.hp || null,
          abilities: (c.abilities || []).slice(0, 20).map(a => text(a, 200)),
        }));
        createdChars = await base44.entities.Character.bulkCreate(charRecords);
      }
      steps.push({ name: 'characters', label: 'Karakterer', count: createdChars.length, status: 'done' });
      result.characters = createdChars.map(c => ({ id: c.id, name: c.name, role: c.role, archetype: c.archetype }));
    } catch (e) {
      steps.push({ name: 'characters', label: 'Karakterer', count: 0, status: 'error', error: e.message });
    }

    // ── STEP 2: WORLD + MAPS ──
    const charContext = result.characters.map(c => `${c.name} (${c.role})`).join('; ');
    try {
      const worldResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Du er en verdensbygger for rollespill. ${isEdit ? 'Legg til nye steder basert på:' : 'Bygg en komplett verden basert på:'}
${inputStory}${existingContext}
${campaign.setting ? `Setting: ${text(campaign.setting, 1000)}` : ''}
Karakterer: ${charContext}

MAL: ${template.name} — ${template.region_count} regioner, ${template.city_count} byer, ${template.building_count} bygninger.

Bygg en hierarkisk struktur (Zelda Twilight Princess-modellen):
1. world — Én verdenskart-node (skala "1 rute = 100 km")
2. region — ${template.region_count} regioner (skala "1 rute = 5 km")
3. city — ${template.city_count} byer (skala "1 rute = 2 km")
4. location — spesifikke områder
5. building — bygninger med etasjer
6. floor — etasjer (for bygninger med etasjer, floor_number = etasjenummer)
7. room — rom (for bygninger, skala "1 rute = 1 m")

Når historien nevner steder ("hytten", "tårnet", "kirken", "slottet", "hulen"), får hvert sted et eget underkart. For bygninger med etasjer: ett floor-node per etasje, ett room-node per rom.

FELTER:
- level: world | region | city | location | building | floor | room
- name: stedsnavn
- description: beskrivelse av stedet
- parent_path: punktum-separert sti til forelderen (tom streng for world-noden)
- scale: målestokk for nivået
- poi_type: type sted (hytte, tårn, kirke, slott, hule, etc.)
- floor_number: etasjenummer for floor-noder (0=kjeller, 1=1.etasje, etc.)
- contents: hva som finnes her (NPCs, farer, skatter, hemmeligheter, landemerker)

Generer max 150 noder. World-noden kommer først. Skriv ALL tekst på norsk bokmål.`,
        response_json_schema: WORLD_SCHEMA,
      });

      const worldId = existingWorldId || crypto.randomUUID();
      const sorted = [...(worldResult.nodes || [])].slice(0, 150).sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99));
      const pathToId = {};
      const nodeRecords = [];
      for (const node of sorted) {
        const fullPath = node.parent_path ? `${node.parent_path}.${node.name}` : node.name;
        const parentId = node.parent_path ? (pathToId[node.parent_path] || null) : null;
        const record = await base44.entities.WorldNode.create({
          campaign_id: campaignId, world_id: worldId, parent_id: parentId,
          level: node.level, name: text(node.name, 200), description: text(node.description, 2000),
          scale: text(node.scale, 200), poi_type: text(node.poi_type, 100),
          floor_number: Number.isInteger(node.floor_number) ? node.floor_number : null,
          contents: text(node.contents, 2000), order: nodeRecords.length,
        });
        pathToId[fullPath] = record.id;
        nodeRecords.push(record);
      }
      steps.push({ name: 'world', label: 'Verden', count: nodeRecords.length, status: 'done' });

      // Create MapItem records for top-level nodes
      const mapItems = nodeRecords
        .filter(r => MAP_LEVELS.includes(r.level))
        .map(r => ({
          campaign_id: campaignId,
          title: text(r.name, 200),
          location_type: mapLocationType(r.level, r.poi_type),
          description: text(r.description, 2000),
          location_notes: text(r.contents, 2000),
          connections: `World: ${worldId}`,
        }));
      let createdMaps = [];
      if (mapItems.length) {
        createdMaps = await base44.entities.MapItem.bulkCreate(mapItems);
      }
      steps.push({ name: 'maps', label: 'Kart', count: createdMaps.length, status: 'done' });
      result.maps = createdMaps.map(m => ({ id: m.id, title: m.title, location_type: m.location_type }));
      result.world_id = worldId;
      if (!isEdit) {
        result.title = text(worldResult.title, 200);
        result.summary = text(worldResult.summary, 1000);
      }

      // Generate world map image
      if (createdMaps.length > 0 && !isEdit) {
        try {
          const regionNames = nodeRecords.filter(n => n.level === 'region').map(n => n.name).join(', ');
          const mapImage = await base44.asServiceRole.integrations.Core.GenerateImage({
            prompt: `A top-down fantasy world map of "${worldResult.title || 'the world'}" showing regions: ${regionNames}. ${template.map_prompt}. Hand-drawn parchment cartography style, no text labels, detailed terrain with mountains, forests, rivers, coastlines, and cities marked as small icons.`,
          });
          if (mapImage.url) {
            await base44.entities.MapItem.update(createdMaps[0].id, { sketch_url: mapImage.url });
          }
        } catch (e) { /* image generation is optional */ }
      }
    } catch (e) {
      steps.push({ name: 'world', label: 'Verden', count: 0, status: 'error', error: e.message });
      steps.push({ name: 'maps', label: 'Kart', count: 0, status: 'error', error: e.message });
    }

    // ── STEP 3: STORY FLOW + RED THREAD ──
    try {
      const storyResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Du er en historiebygger for rollespill. ${isEdit ? 'Legg til nye story nodes basert på:' : 'Bygg en story flow og rød tråd basert på:'}
${inputStory}${existingContext}
Karakterer: ${charContext}
${campaign.setting ? `Setting: ${text(campaign.setting, 1000)}` : ''}

${isEdit ? 'Legg til 3-6 nye story nodes som bygger videre på eksisterende historie.' : `Generer ${template.story_node_count} story nodes med forgreninger.`}

${isEdit ? '' : `Generer også:
- premise: den røde tråden — hovedfortellingen som binder alt sammen (2-4 setninger)
- hints: 3-5 hint GM bør så underveis
- constraints: 2-4 begrensninger — hva GM bør unngå/nekte
- themes: 2-4 temaer
- tone: stemning (mørk, episk, komisk, etc.)`}

Hver story node:
- title: scenenavn
- summary: kort oppsummering (1 setning)
- node_type: scene | choice | dice_challenge | event | climax | ending
- description: detaljert scenebeskrivelse for GM
- dice_suggestion: foreslått terningkast, f.eks. "Smidighet DC 14" eller "" hvis ingen terninger
- success_outcome: hva skjer ved suksess
- failure_outcome: hva skjer ved fiasko
- parent_path: punktum-separert sti til forelder-story-node (tom for første node)
- hints: hint som bør sås i denne scenen

Skriv ALL tekst på norsk bokmål.`,
        response_json_schema: STORY_SCHEMA,
      });

      // Create StoryNode records
      const storyPathToId = {};
      const createdStories = [];
      for (const sn of (storyResult.story_nodes || []).slice(0, 30)) {
        const parentId = sn.parent_path ? (storyPathToId[sn.parent_path] || null) : null;
        const record = await base44.entities.StoryNode.create({
          campaign_id: campaignId,
          parent_id: parentId,
          title: text(sn.title, 200),
          summary: text(sn.summary, 500),
          node_type: sn.node_type || 'scene',
          description: text(sn.description, 2000),
          dice_suggestion: text(sn.dice_suggestion, 200),
          success_outcome: text(sn.success_outcome, 2000),
          failure_outcome: text(sn.failure_outcome, 2000),
          hints: (sn.hints || []).slice(0, 10).map(h => text(h, 500)),
        });
        const fullPath = sn.parent_path ? `${sn.parent_path}.${sn.title}` : sn.title;
        storyPathToId[fullPath] = record.id;
        createdStories.push(record);
      }
      steps.push({ name: 'story', label: 'Story Flow', count: createdStories.length, status: 'done' });
      result.story_nodes = createdStories.map(s => ({ id: s.id, title: s.title, node_type: s.node_type }));

      // Update Campaign with Red Thread (only on initial generation)
      if (!isEdit && storyResult.premise) {
        await base44.entities.Campaign.update(campaignId, {
          premise: text(storyResult.premise, 5000),
          hints: (storyResult.hints || []).slice(0, 10).map(h => text(h, 500)),
          constraints: (storyResult.constraints || []).slice(0, 10).map(c => text(c, 500)),
          themes: (storyResult.themes || []).slice(0, 10).map(t => text(t, 200)),
          tone: text(storyResult.tone, 200),
        });
      }
      result.red_thread = {
        premise: storyResult.premise || campaign.premise || '',
        hints: storyResult.hints || campaign.hints || [],
        constraints: storyResult.constraints || campaign.constraints || [],
      };
    } catch (e) {
      steps.push({ name: 'story', label: 'Story Flow', count: 0, status: 'error', error: e.message });
    }

    // ── STEP 4: ITEMS ──
    try {
      const itemResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Du er en utstyrsbygger for rollespill. ${isEdit ? 'Legg til nye gjenstander basert på:' : 'Generer utstyr for disse karakterene:'}
${inputStory}
Karakterer: ${charContext}

Generer ${isEdit ? '3-6' : template.item_count} gjenstander: våpen, rustning, forbruksvarer, verdifulle gjenstander, mynter og diverse.
Hver gjenstand:
- name: navn
- category: weapon | armor | consumable | valuable | currency | misc
- quantity: antall (standard 1)
- unit: måleenhet (gull, sølv, stk, etc.)
- value: verdi per enhet i standardmynt
- description: kort beskrivelse

Skriv ALL tekst på norsk bokmål.`,
        response_json_schema: ITEM_SCHEMA,
      });

      let createdItems = [];
      if (itemResult.items?.length) {
        const itemRecords = itemResult.items.slice(0, 50).map(i => ({
          campaign_id: campaignId,
          name: text(i.name, 200),
          category: i.category || 'misc',
          quantity: i.quantity || 1,
          unit: text(i.unit, 50),
          value: i.value || 0,
          description: text(i.description, 2000),
        }));
        createdItems = await base44.entities.InventoryItem.bulkCreate(itemRecords);
      }
      steps.push({ name: 'items', label: 'Gjenstander', count: createdItems.length, status: 'done' });
      result.items = createdItems.map(i => ({ id: i.id, name: i.name, category: i.category, quantity: i.quantity }));
    } catch (e) {
      steps.push({ name: 'items', label: 'Gjenstander', count: 0, status: 'error', error: e.message });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}