export const DEFAULT_ATTRIBUTES = [
  { name: "Kraft", key: "kraft", abbr: "KRA", description: "Fysisk råkraft – løfte, bryte og slå hardt i nærkamp." },
  { name: "Smidighet", key: "smidighet", abbr: "SMI", description: "Bevegelse, presisjon og raske reflekser." },
  { name: "Utholdenhet", key: "utholdenhet", abbr: "UTH", description: "Livskraft, tålmodighet og motstand mot skade og utmattelse." },
  { name: "Intelligens", key: "intelligens", abbr: "INT", description: "Hukommelse, logikk og evne til å løse problemer." },
  { name: "Visdom", key: "visdom", abbr: "VIS", description: "Oppmerksomhet, intuisjon og viljesstyrke." },
  { name: "Utstråling", key: "utstralning", abbr: "UTS", description: "Personlighet, overtalelsesevne og tilstedeværelse." },
];

export function resolveAttributes(campaign) {
  return campaign?.attributes?.length ? campaign.attributes : DEFAULT_ATTRIBUTES;
}

export function statValue(character, attr) {
  const s = character?.stats;
  if (!s) return null;
  if (attr.key && s[attr.key] != null) return s[attr.key];
  if (s[attr.name] != null) return s[attr.name];
  if (s[attr.abbr] != null) return s[attr.abbr];
  const key = Object.keys(s).find((k) => k.toLowerCase() === String(attr.name).toLowerCase());
  return key != null ? s[key] : null;
}