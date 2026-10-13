export const AUTOGAME_TEMPLATES = {
  small: {
    id: 'small',
    name: 'Lite Kongerike',
    description: 'Kompakt kongerike med 2-3 regioner. Perfekt for kortere kampanjer.',
    region_count: 3,
    city_count: 5,
    building_count: 10,
    character_count: 8,
    protagonist_count: 4,
    story_node_count: 8,
    item_count: 10,
    map_prompt: 'A compact fantasy kingdom map with a few regions, mountains, forests, and cities',
  },
  medium: {
    id: 'medium',
    name: 'Middels Verden',
    description: 'Balansert verden med 4 regioner og flere byer. Standard kampanjestørrelse.',
    region_count: 4,
    city_count: 7,
    building_count: 15,
    character_count: 10,
    protagonist_count: 4,
    story_node_count: 12,
    item_count: 15,
    map_prompt: 'A fantasy world map with 4 diverse regions, rivers, mountains, and cities',
  },
  vast: {
    id: 'vast',
    name: 'Vidstrakt Imperium',
    description: 'Stort imperium med 6+ regioner. For episke kampanjer med mange tråder.',
    region_count: 6,
    city_count: 12,
    building_count: 25,
    character_count: 15,
    protagonist_count: 6,
    story_node_count: 18,
    item_count: 20,
    map_prompt: 'A vast fantasy empire map with 6 regions, continents, mountain ranges, and many cities',
  },
  dungeon: {
    id: 'dungeon',
    name: 'Dungeon Crawl',
    description: 'Én region med mange bygninger og rom. For dungeon-fokuserte kampanjer.',
    region_count: 1,
    city_count: 1,
    building_count: 20,
    character_count: 6,
    protagonist_count: 4,
    story_node_count: 10,
    item_count: 12,
    map_prompt: 'A detailed dungeon map with multiple rooms, corridors, and chambers',
  },
};

export const mapLocationType = (level, poiType) => {
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