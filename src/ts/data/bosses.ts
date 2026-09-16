import type { EquipmentKey } from "./equipment.js";

/** Post-fight loot (`equipment` unlocks gear; `inventory` for bag items; `keyItem` for story items; `meat` for meat pile). */
export type EnemyDrop =
  | { kind: "equipment"; key: EquipmentKey; chance: number; opponentId?: string }
  | { kind: "inventory"; key: string; chance: number; amount?: number; opponentId?: string }
  | { kind: "keyItem"; key: string; chance: number; amount?: number; opponentId?: string }
  | { kind: "meat"; chance: number; amount?: number; opponentId?: string };

/** Boss fights. After round N, each later encounter has `chance` to be the boss. */
export const ZONE_BOSSES = {
  native_forest: {
    opponentId: "wormmon",
    appearAfterLevel: 6,
    chance: 0.25,
    unlockZones: ["beach", "dragon_eye_lake", "drill_tunnel"] as const,
    drops: [
      { kind: "equipment", key: "kaisersGoggles", chance: 0.1 },
    ] as const satisfies readonly EnemyDrop[],
  },
  beach: {
    opponentId: "coelamon",
    opponentIds: ["coelamon", "ikkakumon"] as const,
    appearAfterLevel: 6,
    chance: 0.25,
    unlockZones: ["tropical_jungle"] as const,
    drops: [
      { kind: "equipment", key: "hardScale", chance: 0.1, opponentId: "coelamon" },
      { kind: "equipment", key: "narwhalHorn", chance: 0.1, opponentId: "ikkakumon" },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
  dragon_eye_lake: {
    opponentId: "megaseadramon",
    opponentIds: ["waruseadramon", "megaseadramon"] as const,
    appearAfterLevel: 6,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "cursedHorn", chance: 0.1, opponentId: "waruseadramon" },
      { kind: "equipment", key: "mightyHorn", chance: 0.1, opponentId: "megaseadramon" },
      { kind: "meat", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  drill_tunnel: {
    opponentId: "meramon",
    appearAfterLevel: 6,
    chance: 0.25,
    unlockZones: ["mt_panorama", "gear_savanna"] as const,
    drops: [
      { kind: "equipment", key: "blazingArmor", chance: 0.1 },
    ] as const satisfies readonly EnemyDrop[],
  },
  mt_panorama: {
    opponentId: "stiffilmon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "hedgehogShell", chance: 0.2 },
      { kind: "meat", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  gear_savanna: {
    opponentId: "leomon",
    opponentIds: ["leomon", "tailmon"] as const,
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: ["geko_swamp", "misty_trees"] as const,
    drops: [
      { kind: "equipment", key: "ancientRelic", chance: 0.1, opponentId: "leomon" },
      { kind: "equipment", key: "catGloves", chance: 0.1, opponentId: "tailmon" },
      { kind: "inventory", key: "potion", chance: 0.3 },
    ] as const satisfies readonly EnemyDrop[],
  },
  geko_swamp: {
    opponentId: "gekomon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [{ kind: "meat", chance: 0.45 }] as const satisfies readonly EnemyDrop[],
  },
  volume_villa: {
    opponentId: "digitamamon",
    appearAfterLevel: 8,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.35 },
      { kind: "meat", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  misty_trees: {
    opponentId: "jyureimon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: ["freezeland", "toy_town"] as const,
    drops: [
      { kind: "inventory", key: "eternalApple", chance: 0.1 },
      { kind: "inventory", key: "happyMushroom", chance: 0.3 },
    ] as const satisfies readonly EnemyDrop[],
  },
  trash_mountain: {
    opponentId: "numemon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.35 },
    ] as const satisfies readonly EnemyDrop[],
  },
  toy_town: {
    opponentId: "warumonzaemon",
    opponentIds: ["warumonzaemon", "jumbogamemon"] as const,
    appearAfterLevel: 8,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "despairClaw", chance: 0.1, opponentId: "warumonzaemon" },
      { kind: "equipment", key: "jumboCannon", chance: 0.1, opponentId: "jumbogamemon" },
      { kind: "inventory", key: "nightmareBurrito", chance: 1, opponentId: "warumonzaemon" },
      { kind: "inventory", key: "happyMushroom", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  factorial_town: {
    opponentId: "hiandromon",
    opponentIds: ["hiandromon", "grandlocomon", "gundramon"] as const,
    appearAfterLevel: 8,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "cyberSword", chance: 0.1, opponentId: "hiandromon" },
      { kind: "inventory", key: "gearUp", chance: 0.1, opponentId: "grandlocomon" },
      { kind: "equipment", key: "arsenal", chance: 0.1, opponentId: "gundramon" },
      { kind: "inventory", key: "potion", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  mt_infinity: {
    opponentId: "mugendramon",
    appearAfterLevel: 10,
    chance: 0.2,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.45 },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
  tropical_jungle: {
    opponentId: "centaurmon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: ["dino_region", "great_canyon"] as const,
    drops: [
      { kind: "equipment", key: "ancientTablet", chance: 0.1 },
      { kind: "inventory", key: "happyMushroom", chance: 0.35 },
    ] as const satisfies readonly EnemyDrop[],
  },
  dino_region: {
    opponentId: "growmon",
    opponentIds: ["growmon", "mastertyranomon"] as const,
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "growmonFang", chance: 0.2, opponentId: "growmon" },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
  great_canyon: {
    opponentId: "orochimon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: ["freezeland"] as const,
    drops: [
      { kind: "equipment", key: "infiniteHeads", chance: 0.1 },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
  freezeland: {
    opponentId: "ancientmegatheriumon",
    opponentIds: ["ancientmegatheriumon", "blastmon"] as const,
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: ["ice_sanctuary"] as const,
    drops: [
      { kind: "equipment", key: "furCoat", chance: 0.1, opponentId: "ancientmegatheriumon" },
      { kind: "equipment", key: "infinityGauntlet", chance: 0.1, opponentId: "blastmon" },
      { kind: "inventory", key: "potion", chance: 0.35 },
    ] as const satisfies readonly EnemyDrop[],
  },
  ogremons_fortress: {
    opponentId: "ogremon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [{ kind: "meat", chance: 0.5 }] as const satisfies readonly EnemyDrop[],
  },
  ice_sanctuary: {
    opponentId: "angemon",
    appearAfterLevel: 8,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  beetle_land: {
    opponentId: "heraklekabuterimon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "equipment", key: "shellArmor", chance: 0.1 },
      { kind: "equipment", key: "carapaceArmor", chance: 0.25 },
    ] as const satisfies readonly EnemyDrop[],
  },
  greylords_mansion: {
    opponentId: "bakemon",
    appearAfterLevel: 7,
    chance: 0.25,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.4 },
    ] as const satisfies readonly EnemyDrop[],
  },
  cocytus: {
    opponentId: "bakemon",
    appearAfterLevel: 12,
    chance: 0.2,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.45 },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
  kernel: {
    opponentId: "angemon",
    appearAfterLevel: 12,
    chance: 0.2,
    unlockZones: [] as const,
    drops: [
      { kind: "inventory", key: "potion", chance: 0.45 },
      { kind: "meat", chance: 0.5 },
    ] as const satisfies readonly EnemyDrop[],
  },
} as const;

export type ZoneBossConfig = (typeof ZONE_BOSSES)[keyof typeof ZONE_BOSSES];

/** Boss Digimon ids for a zone (supports multiple possible bosses). */
export function listZoneBossOpponentIds(boss: ZoneBossConfig | null | undefined): string[] {
  if (!boss) {
    return [];
  }
  const multi = (boss as { opponentIds?: readonly string[] }).opponentIds;
  if (Array.isArray(multi) && multi.length > 0) {
    return multi.map(String);
  }
  const single = (boss as { opponentId?: string }).opponentId;
  return single ? [String(single)] : [];
}

/** Keep shared drops plus drops tagged for this opponent (or untagged). */
export function filterDropsForOpponent(
  drops: ReadonlyArray<EnemyDrop> | null | undefined,
  opponentId: string | null | undefined
): EnemyDrop[] {
  if (!drops?.length) {
    return [];
  }
  const id = opponentId ? String(opponentId) : "";
  return drops.filter((drop) => {
    const tagged = (drop as { opponentId?: string }).opponentId;
    return !tagged || String(tagged) === id;
  });
}
