import { PawPrint, Skull, Users, Ghost, Bot, Bug, Bird, Swords, Flame, Crown, Shield, Sparkles, Wand2, Mountain, Heart, BookOpen, Handshake, User, Leaf, Pickaxe, Axe, Cookie, Rat } from "lucide-react";

export const TOKEN_GROUPS = {
  race: "Raser",
  creature: "Kreaturer",
  special: "Spesielle",
  generic: "Generisk",
};

export const TOKEN_TYPES = {
  human: { label: "Menneske", Icon: User, group: "race" },
  elf: { label: "Alv", Icon: Leaf, group: "race" },
  dwarf: { label: "Dverg", Icon: Pickaxe, group: "race" },
  halfling: { label: "Halving", Icon: Cookie, group: "race" },
  orc: { label: "Ork", Icon: Axe, group: "race" },
  goblin: { label: "Goblin", Icon: Rat, group: "race" },
  troll: { label: "Troll", Icon: Mountain, group: "race" },
  tiefling: { label: "Tiefling", Icon: Flame, group: "race" },
  animal: { label: "Dyr", Icon: PawPrint, group: "creature" },
  beast: { label: "Monster", Icon: Skull, group: "creature" },
  undead: { label: "Uded", Icon: Ghost, group: "creature" },
  construct: { label: "Maskin", Icon: Bot, group: "creature" },
  critter: { label: "Kryp", Icon: Bug, group: "creature" },
  flying: { label: "Flygende", Icon: Bird, group: "creature" },
  dragon: { label: "Drage", Icon: Flame, group: "creature" },
  witch: { label: "Heks", Icon: Wand2, group: "special" },
  mage: { label: "Magiker", Icon: Sparkles, group: "special" },
  king: { label: "Konge", Icon: Crown, group: "special" },
  knight: { label: "Ridder", Icon: Shield, group: "special" },
  merchant: { label: "Kjøpmann", Icon: Handshake, group: "special" },
  scholar: { label: "Skolar", Icon: BookOpen, group: "special" },
  healer: { label: "Helbreder", Icon: Heart, group: "special" },
  humanoid: { label: "Menneskelik", Icon: Users, group: "generic" },
  enemy: { label: "Fiende", Icon: Swords, group: "generic" },
};