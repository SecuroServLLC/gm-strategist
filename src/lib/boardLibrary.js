export const COLOR_CLASSES = {
  green: { chip: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300", dot: "bg-emerald-500", ring: "ring-emerald-500/60" },
  red: { chip: "bg-rose-500/15 border-rose-500/40 text-rose-300", dot: "bg-rose-500", ring: "ring-rose-500/60" },
  blue: { chip: "bg-sky-500/15 border-sky-500/40 text-sky-300", dot: "bg-sky-500", ring: "ring-sky-500/60" },
  amber: { chip: "bg-amber-500/15 border-amber-500/40 text-amber-300", dot: "bg-amber-500", ring: "ring-amber-500/60" },
  purple: { chip: "bg-purple-500/15 border-purple-500/40 text-purple-300", dot: "bg-purple-500", ring: "ring-purple-500/60" },
  slate: { chip: "bg-slate-500/15 border-slate-500/40 text-slate-300", dot: "bg-slate-500", ring: "ring-slate-500/60" },
};

export const COLOR_LEGEND = {
  green: "Trygg / Miljø",
  blue: "Sosialt / NPC",
  red: "Far / Kamp",
};

export const CATEGORY_LABELS = {
  terrain: "Landskap / miljø",
  enemy: "Fiender",
  npc: "NPC-er",
  building: "Bygninger",
  hazard: "Farer / feller",
  item: "Nøkler / gjenstander",
};

export const BOARD_ELEMENTS = [
  // Landskap / miljø
  { key: "dark_cave", label: "Mørk hule", category: "terrain", color: "slate", icon: "Mountain", tags: ["underground", "dark"] },
  { key: "forest", label: "Skog", category: "terrain", color: "green", icon: "TreePine", tags: ["nature", "forest"] },
  { key: "beach", label: "Sandstrand", category: "terrain", color: "blue", icon: "Sun", tags: ["coast", "bright", "surface"] },
  { key: "swamp", label: "Sump", category: "terrain", color: "green", icon: "Droplet", tags: ["wet", "nature"] },
  { key: "snow_mtn", label: "Snødekt fjell", category: "terrain", color: "blue", icon: "Snowflake", tags: ["cold", "mountain"] },
  { key: "volcano", label: "Vulkan / lava", category: "terrain", color: "red", icon: "Flame", tags: ["fire", "hot", "mountain"] },
  { key: "river", label: "Elv", category: "terrain", color: "blue", icon: "Waves", tags: ["water", "nature"] },
  { key: "lake", label: "Innsjø", category: "terrain", color: "blue", icon: "Waves", tags: ["water", "nature"] },
  { key: "desert", label: "Ørken", category: "terrain", color: "amber", icon: "Sun", tags: ["hot", "bright", "surface"] },
  { key: "meadow", label: "Eng", category: "terrain", color: "green", icon: "Trees", tags: ["nature", "bright"] },
  { key: "cliffs", label: "Klipper", category: "terrain", color: "slate", icon: "Mountain", tags: ["mountain"] },
  { key: "graveyard", label: "Kirkegård", category: "terrain", color: "slate", icon: "Cross", tags: ["underground", "dark"] },
  { key: "ruins", label: "Ruiner", category: "terrain", color: "slate", icon: "Landmark", tags: ["underground", "dark"] },
  // Fiender
  { key: "goblin", label: "Goblin", category: "enemy", color: "red", icon: "Bug", tags: ["underground", "creature"] },
  { key: "orc", label: "Ork", category: "enemy", color: "red", icon: "Swords", tags: ["creature"] },
  { key: "bat", label: "Flaggermus", category: "enemy", color: "red", icon: "Bird", tags: ["underground", "flying", "dark"] },
  { key: "dragon", label: "Drage", category: "enemy", color: "red", icon: "Flame", tags: ["creature", "fire"] },
  { key: "skeleton", label: "Skelett", category: "enemy", color: "red", icon: "Bone", tags: ["undead", "underground", "dark"] },
  { key: "zombie", label: "Zombi", category: "enemy", color: "red", icon: "Skull", tags: ["undead", "dark"] },
  { key: "spider", label: "Edderkopp", category: "enemy", color: "red", icon: "Bug", tags: ["underground", "creature"] },
  { key: "troll", label: "Troll", category: "enemy", color: "red", icon: "Footprints", tags: ["creature", "forest"] },
  { key: "bandit", label: "Banditt", category: "enemy", color: "red", icon: "Sword", tags: ["humanoid"] },
  { key: "wolf", label: "Varulv", category: "enemy", color: "red", icon: "Footprints", tags: ["creature", "forest"] },
  { key: "witch", label: "Heks", category: "enemy", color: "purple", icon: "Sparkles", tags: ["magic", "humanoid"] },
  { key: "slime", label: "Slime", category: "enemy", color: "green", icon: "Droplet", tags: ["underground", "creature"] },
  { key: "rat", label: "Rotte", category: "enemy", color: "red", icon: "Rat", tags: ["underground", "creature"] },
  // NPC-er
  { key: "innkeeper", label: "Vertshuseier", category: "npc", color: "amber", icon: "Store", tags: ["humanoid", "tavern", "bright"] },
  { key: "monk", label: "Vandremunk", category: "npc", color: "amber", icon: "User", tags: ["humanoid"] },
  { key: "merchant", label: "Kjøpmann", category: "npc", color: "amber", icon: "Coins", tags: ["humanoid", "bright"] },
  { key: "priest", label: "Prest", category: "npc", color: "blue", icon: "Church", tags: ["magic", "humanoid"] },
  { key: "mercenary", label: "Leiesoldat", category: "npc", color: "amber", icon: "Shield", tags: ["humanoid"] },
  { key: "thief", label: "Tjuv", category: "npc", color: "amber", icon: "Footprints", tags: ["humanoid", "underground"] },
  { key: "sage", label: "Vis gammel", category: "npc", color: "blue", icon: "Eye", tags: ["magic", "humanoid"] },
  { key: "guest", label: "Gjest", category: "npc", color: "amber", icon: "User", tags: ["humanoid", "tavern", "bright"] },
  { key: "child", label: "Barn", category: "npc", color: "amber", icon: "User", tags: ["humanoid", "bright"] },
  { key: "guard", label: "Vakt", category: "npc", color: "amber", icon: "Shield", tags: ["humanoid"] },
  // Bygninger
  { key: "tavern", label: "Vertshus", category: "building", color: "amber", icon: "Store", tags: ["tavern", "bright", "surface"] },
  { key: "temple", label: "Tempel", category: "building", color: "blue", icon: "Church", tags: ["magic", "bright"] },
  { key: "tower", label: "Tårn", category: "building", color: "blue", icon: "Castle", tags: ["magic"] },
  { key: "fortress_ruin", label: "Borgruin", category: "building", color: "slate", icon: "Castle", tags: ["underground", "dark"] },
  { key: "cottage", label: "Hytte", category: "building", color: "amber", icon: "Home", tags: ["nature", "surface"] },
  { key: "market", label: "Markedsplass", category: "building", color: "amber", icon: "Store", tags: ["bright", "surface"] },
  { key: "palace", label: "Palass", category: "building", color: "amber", icon: "Crown", tags: ["bright", "surface"] },
  { key: "crypt", label: "Krypt", category: "building", color: "slate", icon: "Cross", tags: ["underground", "dark"] },
  { key: "smithy", label: "Smie", category: "building", color: "amber", icon: "Flame", tags: ["bright", "fire"] },
  { key: "bridge_b", label: "Bro", category: "building", color: "slate", icon: "Landmark", tags: ["mountain"] },
  // Farer / feller
  { key: "pit", label: "Fallgrop", category: "hazard", color: "red", icon: "AlertTriangle", tags: ["trap", "underground"] },
  { key: "arrow_trap", label: "Pilfelle", category: "hazard", color: "red", icon: "AlertTriangle", tags: ["trap"] },
  { key: "poison_cloud", label: "Giftsky", category: "hazard", color: "red", icon: "Cloud", tags: ["trap", "underground"] },
  { key: "lava_haz", label: "Lava", category: "hazard", color: "red", icon: "Flame", tags: ["fire", "hot"] },
  { key: "flood", label: "Flom", category: "hazard", color: "blue", icon: "Waves", tags: ["water"] },
  { key: "rockslide", label: "Ras", category: "hazard", color: "slate", icon: "Mountain", tags: ["mountain"] },
  { key: "rune_trap", label: "Magisk rune", category: "hazard", color: "purple", icon: "Sparkles", tags: ["magic", "trap"] },
  { key: "spike_pit", label: "Spikergrøft", category: "hazard", color: "red", icon: "AlertTriangle", tags: ["trap"] },
  { key: "blocked_road", label: "Stengt vei", category: "hazard", color: "slate", icon: "MapPin", tags: ["mountain"] },
  { key: "curse", label: "Forbannelse", category: "hazard", color: "purple", icon: "Eye", tags: ["magic", "trap", "dark"] },
  { key: "locked_door", label: "Låst dør", category: "hazard", color: "amber", icon: "Lock", tags: ["lock", "key", "barrier"] },
  // Nøkler / gjenstander
  { key: "magic_key", label: "Magisk nøkkel", category: "item", color: "amber", icon: "KeyRound", tags: ["key", "item"] },
  { key: "grapple", label: "Krok", category: "item", color: "amber", icon: "Anchor", tags: ["key", "item"] },
  { key: "rune_stone", label: "Rune-stein", category: "item", color: "purple", icon: "Gem", tags: ["key", "magic", "item"] },
];

// To elementer "passer sammen" hvis de deler minst én tag ELLER har samme farge.
export function isCompatible(a, b) {
  if (!a || !b) return false;
  if (a.color && b.color && a.color === b.color) return true;
  const at = a.tags || [], bt = b.tags || [];
  return at.some((t) => bt.includes(t));
}

export const DUNGEON_STYLES = [
  { key: "metroidvania", label: "Metroidvania", subtitle: "Puslespill", icon: "KeyRound", description: "Lukkede område som åpnes med nøkler og evner. Legg vekt på nøkkelrom, snarveier og tilbakegang.", preferredColors: ["blue", "purple"] },
  { key: "roguelike", label: "Roguelike", subtitle: "Noder", icon: "Network", description: "Noder med flere valg og forgreininger. Varierte rom, kort vei mellom noder, uforutsigbarhet.", preferredColors: ["red", "green"] },
  { key: "hubspoke", label: "Hub & Spoke", subtitle: "Labyrint", icon: "Share2", description: "Sentral hub som stråler ut til grener. Hub-rom i midten, sidegrener labyrintiske.", preferredColors: ["amber", "slate"] },
  { key: "gauntlet", label: "Gauntlet", subtitle: "Lineær", icon: "Route", description: "Lineær trase med økende vanske mot en sjefskamp. Få snarveier, tydelig progresjon.", preferredColors: ["red", "amber"] },
];

export const ROLE_BADGES = {
  hub: { ring: "ring-2 ring-primary", label: "Hub", badge: "bg-primary/85 text-primary-foreground" },
  boss: { ring: "ring-2 ring-rose-500", label: "Sjef", badge: "bg-rose-500/85 text-rose-50" },
  key: { ring: "ring-2 ring-amber-400", label: "Nøkkel", badge: "bg-amber-400/85 text-amber-950" },
  shortcut: { ring: "ring-2 ring-sky-400", label: "Snarvei", badge: "bg-sky-400/85 text-sky-950" },
  entrance: { ring: "ring-2 ring-emerald-400", label: "Inngang", badge: "bg-emerald-400/85 text-emerald-950" },
  exit: { ring: "ring-2 ring-purple-400", label: "Utgang", badge: "bg-purple-400/85 text-purple-950" },
  lock: { ring: "ring-2 ring-amber-500", label: "Låst", badge: "bg-amber-500/85 text-amber-50" },
  alarm: { ring: "ring-2 ring-rose-500 animate-pulse", label: "Alarm", badge: "bg-rose-500/90 text-rose-50" },
};

export const LINK_KINDS = {
  normal: { stroke: "#94a3b8", dash: "", width: 2 },
  key: { stroke: "#fbbf24", dash: "6 4", width: 2.5 },
  shortcut: { stroke: "#38bdf8", dash: "2 4", width: 2 },
  boss: { stroke: "#f43f5e", dash: "", width: 3.5 },
};

export const NODE_TYPES = {
  combat: { label: "Kamp", color: "red" },
  elite: { label: "Elitekamp", color: "red" },
  boss: { label: "Sjefskamp", color: "red" },
  rest: { label: "Hvile", color: "green" },
  merchant: { label: "Kjøpmann", color: "amber" },
  treasure: { label: "Skatt", color: "amber" },
  event: { label: "Hendelse", color: "purple" },
  trap: { label: "Felle", color: "slate" },
};