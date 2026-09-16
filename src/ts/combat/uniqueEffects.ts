export const UNIQUE_BUFF_IDS = [
  "vampirism",
  "thorns",
  "reflector",
  "immune",
  "reckless",
  "positivepole",
] as const;
export const UNIQUE_DEBUFF_IDS = [
  "cursed",
  "marked",
  "drained",
  "bound",
  "negativepole",
  "deepwound",
  "infatuated",
] as const;

export type UniqueBuffId = (typeof UNIQUE_BUFF_IDS)[number];
export type UniqueDebuffId = (typeof UNIQUE_DEBUFF_IDS)[number];

export type UniqueMods = {
  buff: UniqueBuffId | null;
};

export type UniqueEffectResolution =
  | { kind: "buff"; id: UniqueBuffId; label: string }
  | { kind: "debuff"; id: UniqueDebuffId; label: string };

const BUFF_LABELS: Record<UniqueBuffId, string> = {
  vampirism: "Vampirism",
  thorns: "Thorns",
  reflector: "Reflector",
  immune: "Immune",
  reckless: "Reckless",
  positivepole: "Positive Pole",
};

const DEBUFF_LABELS: Record<UniqueDebuffId, string> = {
  cursed: "Cursed",
  marked: "Marked",
  drained: "Drained",
  bound: "Bound",
  negativepole: "Negative Pole",
  deepwound: "Deep Wound",
  infatuated: "Infatuated",
};

const BUFF_ALIASES: Record<string, UniqueBuffId> = {
  vampirism: "vampirism",
  vampire: "vampirism",
  vampirismo: "vampirism",
  thorns: "thorns",
  espinas: "thorns",
  reflector: "reflector",
  reflect: "reflector",
  reflecting: "reflector",
  reflejo: "reflector",
  immune: "immune",
  inmune: "immune",
  immunity: "immune",
  reckless: "reckless",
  temerario: "reckless",
  imprudente: "reckless",
  positivepole: "positivepole",
  "positive pole": "positivepole",
  "positive-pole": "positivepole",
  "polo positivo": "positivepole",
  "polo-positivo": "positivepole",
  polopositivo: "positivepole",
};

const DEBUFF_ALIASES: Record<string, UniqueDebuffId> = {
  cursed: "cursed",
  curse: "cursed",
  maldito: "cursed",
  maldicion: "cursed",
  marked: "marked",
  mark: "marked",
  marcado: "marked",
  drained: "drained",
  drain: "drained",
  drenado: "drained",
  bound: "bound",
  bind: "bound",
  atado: "bound",
  inmovilizado: "bound",
  negativepole: "negativepole",
  "negative pole": "negativepole",
  "negative-pole": "negativepole",
  "polo negativo": "negativepole",
  "polo-negativo": "negativepole",
  polonegativo: "negativepole",
  deepwound: "deepwound",
  "deep wound": "deepwound",
  "deep-wound": "deepwound",
  "herida profunda": "deepwound",
  "herida-profunda": "deepwound",
  heridaprofunda: "deepwound",
  infatuated: "infatuated",
  infatuate: "infatuated",
  enamored: "infatuated",
  enamorado: "infatuated",
  attracted: "infatuated",
};

export function createEmptyUniqueMods(): UniqueMods {
  return { buff: null };
}

export function resolveUniqueEffect(effect: string): UniqueEffectResolution | null {
  const normalized = String(effect || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const buff = BUFF_ALIASES[normalized];
  if (buff) {
    return { kind: "buff", id: buff, label: BUFF_LABELS[buff] };
  }
  const debuff = DEBUFF_ALIASES[normalized];
  if (debuff) {
    return { kind: "debuff", id: debuff, label: DEBUFF_LABELS[debuff] };
  }
  return null;
}

export function uniqueBuffLabel(id: UniqueBuffId): string {
  return BUFF_LABELS[id];
}

export function uniqueDebuffLabel(id: UniqueDebuffId): string {
  return DEBUFF_LABELS[id];
}

export function uniqueBuffIcon(id: UniqueBuffId): string {
  return `data/ui/buff_${id}.png`;
}

export function uniqueDebuffIcon(id: UniqueDebuffId): string {
  return `data/ui/debuff_${id}.png`;
}

export function uniqueEffectProjectileKey(effect: string | undefined): string | null {
  const resolved = resolveUniqueEffect(effect || "");
  return resolved ? resolved.id : null;
}
