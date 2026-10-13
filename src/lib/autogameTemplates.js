export const AUTOGAME_TEMPLATES = {
  small: {
    id: 'small',
    name: 'Lite Kongerike',
    description: 'Kompakt kongerike med 2-3 regioner. Perfekt for kortere kampanjer.',
    icon: 'Castle',
    stats: { regioner: 3, byer: 5, bygninger: 10, karakterer: 8, story: 8, gjenstander: 10 },
  },
  medium: {
    id: 'medium',
    name: 'Middels Verden',
    description: 'Balansert verden med 4 regioner og flere byer. Standard kampanjestørrelse.',
    icon: 'Globe',
    stats: { regioner: 4, byer: 7, bygninger: 15, karakterer: 10, story: 12, gjenstander: 15 },
  },
  vast: {
    id: 'vast',
    name: 'Vidstrakt Imperium',
    description: 'Stort imperium med 6+ regioner. For episke kampanjer med mange tråder.',
    icon: 'Mountain',
    stats: { regioner: 6, byer: 12, bygninger: 25, karakterer: 15, story: 18, gjenstander: 20 },
  },
  dungeon: {
    id: 'dungeon',
    name: 'Dungeon Crawl',
    description: 'Én region med mange bygninger og rom. For dungeon-fokuserte kampanjer.',
    icon: 'DoorOpen',
    stats: { regioner: 1, byer: 1, bygninger: 20, karakterer: 6, story: 10, gjenstander: 12 },
  },
};