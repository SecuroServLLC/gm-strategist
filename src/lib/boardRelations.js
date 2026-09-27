// Semantisk farge-system for brettet: Grønn=Trygg/Miljø, Blå=Sosialt/NPC, Rød=Far/Kamp
export const SEMANTIC_COLORS = {
  green: { key: "green", label: "Trygg / Miljø", dot: "bg-emerald-500" },
  blue: { key: "blue", label: "Sosialt / NPC", dot: "bg-sky-500" },
  red: { key: "red", label: "Far / Kamp", dot: "bg-rose-500" },
};

// Tilordner semantisk farge basert på kategori (og element_key for dører/barrierer).
export function semanticColorFor(category, element_key) {
  const ek = (element_key || "");
  if (ek.includes("door") || ek.includes("gate") || ek.includes("bridge")) return "green"; // barrierer/miljø
  if (category === "enemy" || category === "hazard") return "red";
  if (category === "npc") return "blue";
  return "green"; // terrain, building, item
}

// To rektangler (i celle-koordinater) er "naboer" hvis de ligger inntil eller inntil gap celler fra hverandre.
export function areAdjacent(a, b, gap = 1) {
  if (!a || !b || a.id === b.id) return false;
  const ax1 = a.x, ay1 = a.y, ax2 = a.x + a.w, ay2 = a.y + a.h;
  const bx1 = b.x, by1 = b.y, bx2 = b.x + b.w, by2 = b.y + b.h;
  return (ax1 - gap) < bx2 && (ax2 + gap) > bx1 && (ay1 - gap) < by2 && (ay2 + gap) > by1;
}

const isDoor = (it) => /door|gate|port|bro|bridge/.test((it.element_key || "") + (it.label || ""));
const isKey = (it) => /key|krok|rune_stone|grapple/.test(it.element_key || "") || (it.tags || []).includes("key");
const isLock = (it) => isDoor(it) || /lock/.test(it.element_key || "");
const isNpc = (it) => it.category === "npc";
const isEnemy = (it) => it.category === "enemy";
const isHazard = (it) => it.category === "hazard";
const isItem = (it) => it.category === "item";
const isStructure = (it) => it.category === "terrain" || it.category === "building";

// Relasjon fra a til b (rettet). Første match vinner.
function relationBetween(a, b) {
  if (isKey(a) && isLock(b)) return { kind: "unlocks", label: "låser opp" };
  if (isNpc(a) && (isLock(b) || isStructure(b) || isItem(b))) return { kind: "guards", label: "vokter" };
  if ((isEnemy(a) || isHazard(a)) && isNpc(b)) return { kind: "threatens", label: "truer" };
  if (isHazard(a) && isStructure(b)) return { kind: "threatens", label: "truer" };
  if (isEnemy(a) && isStructure(b)) return { kind: "patrols", label: "patruljerer" };
  if (isItem(a) && isStructure(b)) return { kind: "contains", label: "gjemt i" };
  if (isStructure(a) && isStructure(b)) return { kind: "links", label: "koblet til" };
  return null;
}

export const RELATION_KINDS = {
  guards: { stroke: "#38bdf8", label: "Vokter" },
  unlocks: { stroke: "#34d399", label: "Låser opp" },
  threatens: { stroke: "#fb7185", label: "Truer" },
  patrols: { stroke: "#fbbf24", label: "Patruljerer" },
  contains: { stroke: "#a78bfa", label: "Gjemt i" },
  links: { stroke: "#94a3b8", label: "Koblet" },
};

// Beregner relasjoner mellom nabo-elementer på brettet.
export function computeRelations(items) {
  const rels = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (!areAdjacent(a, b, 1)) continue;
      const fwd = relationBetween(a, b);
      if (fwd) { rels.push({ from: a.id, to: b.id, ...fwd }); continue; }
      const bwd = relationBetween(b, a);
      if (bwd) { rels.push({ from: b.id, to: a.id, ...bwd }); }
    }
  }
  return rels;
}