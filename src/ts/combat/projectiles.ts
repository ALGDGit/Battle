import type { Character } from "../state.js";

export type AttackActionLike = {
  name?: string;
  status?: string;
  selfStatus?: string;
  effect?: string;
  heal?: number | boolean | string;
  isCritical?: boolean;
};

export function getStageKey(stage: string | undefined): string {
  switch (stage) {
    case "Baby I":
      return "baby_i";
    case "Baby II":
      return "baby_ii";
    case "Child":
      return "child";
    case "Adult":
      return "adult";
    case "Perfect":
      return "perfect";
    case "Ultimate":
      return "ultimate";
    default:
      return "child";
  }
}

export function normalizeBattleType(
  character: Character | null | undefined
): "vaccine" | "virus" | "data" | "" {
  const raw = String(character?.element || character?.attribute || "")
    .trim()
    .toLowerCase();
  if (raw === "vaccine" || raw === "virus" || raw === "data") {
    return raw;
  }
  return "";
}

export function getTypeProjectileKey(element: string | undefined): "vaccine" | "virus" | "data" {
  const normalized = (element || "").toLowerCase();
  if (normalized === "vaccine" || normalized === "virus" || normalized === "data") {
    return normalized;
  }
  return "vaccine";
}

export function getCharacterProjectile(character: Character | null | undefined): string | null {
  const sprite = character?.specialAttackSprite;
  if (sprite && String(sprite).trim()) {
    return String(sprite);
  }
  return null;
}

export function getElementProjectile(element: string | undefined, _stageKey?: string): string {
  const type = getTypeProjectileKey(element);
  return `data/ui/projectiles/type_${type}.png`;
}

export function getSpecialProjectilePath(src: string): string {
  const trimmed = String(src || "").trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/_special\.(png|svg)$/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed.replace(/(\.(?:png|svg))$/i, "_special$1");
}

export function getSpecialProjectile(attacker: Character, _attack?: AttackActionLike): string {
  const base = getCharacterProjectile(attacker) || getElementProjectile(attacker.element);
  return getSpecialProjectilePath(base);
}

export function getAttackProjectile(attacker: Character, attack: AttackActionLike): string {
  const base = getCharacterProjectile(attacker) || getElementProjectile(attacker.element);
  if (attack?.name === "special attack") {
    return getSpecialProjectilePath(base);
  }
  return base;
}

/** Vaccine > Virus > Data > Vaccine */
export function hasTypeAdvantage(
  attacker: Character | null | undefined,
  defender: Character | null | undefined
): boolean {
  const attackerType = normalizeBattleType(attacker);
  const defenderType = normalizeBattleType(defender);
  if (!attackerType || !defenderType) {
    return false;
  }
  const advantageMap: Record<"vaccine" | "virus" | "data", "vaccine" | "virus" | "data"> = {
    vaccine: "virus",
    virus: "data",
    data: "vaccine",
  };
  return advantageMap[attackerType] === defenderType;
}

export function getCriticalChance(
  attacker: Character | null | undefined,
  defender: Character | null | undefined
): number {
  return hasTypeAdvantage(attacker, defender) ? 0.3 : 0.1;
}
