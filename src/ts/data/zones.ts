/**
 * Map difficulty (1 = easiest). Drives zone button colors.
 * Unlisted side zones follow unlock progression.
 */
export type ZoneDifficultyTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Rogue-lite travel zones (expand later). */
export const ZONE_CONFIG = [
  {
    id: "native_forest",
    name: "Native Forest",
    asset: "data/ui/zone_native_forest.png",
    unlockedByDefault: true,
    difficultyTier: 1,
  },
  {
    id: "beach",
    name: "Coela Beach",
    asset: "data/ui/zone_beach.png",
    unlockedByDefault: false,
    difficultyTier: 2,
  },
  {
    id: "dragon_eye_lake",
    name: "Dragon Eye Lake",
    asset: "data/ui/zone_dragon_eye_lake.png",
    unlockedByDefault: false,
    difficultyTier: 3,
  },
  {
    id: "drill_tunnel",
    name: "Drill Tunnel",
    asset: "data/ui/zone_drill_tunnel.png",
    unlockedByDefault: false,
    difficultyTier: 2,
  },
  {
    id: "mt_panorama",
    name: "Mt. Panorama",
    asset: "data/ui/zone_mt_panorama.png",
    unlockedByDefault: false,
    difficultyTier: 3,
  },
  {
    id: "gear_savanna",
    name: "Gear Savanna",
    asset: "data/ui/zone_gear_savanna.png",
    unlockedByDefault: false,
    difficultyTier: 3,
  },
  {
    id: "geko_swamp",
    name: "Geko Swamp",
    asset: "data/ui/zone_geko_swamp.png",
    unlockedByDefault: false,
    difficultyTier: 4,
  },
  {
    id: "volume_villa",
    name: "Volume Villa",
    asset: "data/ui/zone_volume_villa.png",
    unlockedByDefault: false,
    difficultyTier: 6,
  },
  {
    id: "misty_trees",
    name: "Misty Trees",
    asset: "data/ui/zone_misty_trees.png",
    unlockedByDefault: false,
    difficultyTier: 4,
  },
  {
    id: "trash_mountain",
    name: "Trash Mountain",
    asset: "data/ui/zone_trash_mountain.png",
    unlockedByDefault: false,
    difficultyTier: 6,
  },
  {
    id: "toy_town",
    name: "Toy Town",
    asset: "data/ui/zone_toy_town.png",
    unlockedByDefault: false,
    difficultyTier: 5,
  },
  {
    id: "factorial_town",
    name: "Factorial Town",
    asset: "data/ui/zone_factorial_town.png",
    unlockedByDefault: false,
    difficultyTier: 5,
  },
  {
    id: "tropical_jungle",
    name: "Tropical Jungle",
    asset: "data/ui/zone_tropical_jungle.png",
    unlockedByDefault: false,
    difficultyTier: 3,
  },
  {
    id: "dino_region",
    name: "Dino Region",
    asset: "data/ui/zone_dino_region.png",
    unlockedByDefault: false,
    difficultyTier: 5,
  },
  {
    id: "great_canyon",
    name: "Great Canyon",
    asset: "data/ui/zone_great_canyon.png",
    unlockedByDefault: false,
    difficultyTier: 4,
  },
  {
    id: "freezeland",
    name: "Freezeland",
    asset: "data/ui/zone_freezeland.png",
    unlockedByDefault: false,
    difficultyTier: 4,
  },
  {
    id: "ogremons_fortress",
    name: "Ogremon's Fortress",
    asset: "data/ui/zone_ogremons_fortress.png",
    unlockedByDefault: false,
    difficultyTier: 6,
  },
  {
    id: "ice_sanctuary",
    name: "Ice Sanctuary",
    asset: "data/ui/zone_ice_sanctuary.png",
    unlockedByDefault: false,
    difficultyTier: 6,
  },
  {
    id: "beetle_land",
    name: "Beetle Land",
    asset: "data/ui/zone_beetle_land.png",
    unlockedByDefault: false,
    difficultyTier: 5,
  },
  {
    id: "greylords_mansion",
    name: "Greylord's Mansion",
    asset: "data/ui/zone_greylords_mansion.png",
    unlockedByDefault: false,
    difficultyTier: 6,
  },
  {
    id: "mt_infinity",
    name: "Mt. Infinity",
    asset: "data/ui/zone_mt_infinity.png",
    unlockedByDefault: false,
    difficultyTier: 7,
  },
  {
    id: "cocytus",
    name: "Cocytus",
    asset: "data/ui/zone_cocytus.png",
    unlockedByDefault: false,
    difficultyTier: 8,
  },
  {
    id: "kernel",
    name: "Kernel",
    asset: "data/ui/zone_kernel.png",
    unlockedByDefault: false,
    difficultyTier: 8,
  },
] as const;

export type ZoneConfigEntry = (typeof ZONE_CONFIG)[number];
export type ZoneId = ZoneConfigEntry["id"];

/** Not playable in the current beta. Shown as Unavailable on the map. */
export const BETA_UNAVAILABLE_ZONE_IDS = [
  "geko_swamp",
  "volume_villa",
  "trash_mountain",
  "ogremons_fortress",
  "ice_sanctuary",
  "greylords_mansion",
  "mt_infinity",
  "cocytus",
  "kernel",
] as const;

export function isZoneUnavailable(zoneId: string | null | undefined): boolean {
  return Boolean(zoneId && (BETA_UNAVAILABLE_ZONE_IDS as readonly string[]).includes(zoneId));
}

export function getZoneDifficultyTier(zoneId: string | null | undefined): ZoneDifficultyTier {
  const zone = ZONE_CONFIG.find((entry) => entry.id === zoneId);
  const tier = Number(zone?.difficultyTier) || 1;
  if (tier <= 1) return 1;
  if (tier >= 8) return 8;
  return tier as ZoneDifficultyTier;
}

/** Shared battle / event background filenames under data/ui/. */
export const ZONE_BACKGROUNDS: Record<ZoneId, string> = {
  native_forest: "bg_native_forest.png",
  beach: "bg_beach.png",
  dragon_eye_lake: "bg_dragon_eye_lake.png",
  drill_tunnel: "bg_drill_tunnel.png",
  mt_panorama: "bg_mt_panorama.png",
  gear_savanna: "bg_gear_savanna.png",
  geko_swamp: "bg_geko_swamp.png",
  volume_villa: "bg_volume_villa.png",
  misty_trees: "bg_misty_trees.png",
  trash_mountain: "bg_trash_mountain.png",
  toy_town: "bg_toy_town.png",
  factorial_town: "bg_factorial_town.png",
  tropical_jungle: "bg_tropical_jungle.png",
  dino_region: "bg_dino_region.png",
  great_canyon: "bg_great_canyon.png",
  freezeland: "bg_freezeland.png",
  ogremons_fortress: "bg_ogremons_fortress.png",
  ice_sanctuary: "bg_ice_sanctuary.png",
  beetle_land: "bg_beetle_land.png",
  greylords_mansion: "bg_greylords_mansion.png",
  mt_infinity: "bg_mt_infinity.png",
  cocytus: "bg_cocytus.png",
  kernel: "bg_kernel.png",
};

/** Zones that ignore the day/night cycle (always base background). */
export const INDOOR_ZONES = [
  "drill_tunnel",
  "ogremons_fortress",
  "ice_sanctuary",
  "greylords_mansion",
  "mt_infinity",
  "cocytus",
  "kernel",
] as const;

export type TimeOfDay = "day" | "afternoon" | "night" | "morning";

/** Day → Afternoon → Night → Morning, advancing every N battles/events. */
export const TIME_OF_DAY_ORDER: readonly TimeOfDay[] = [
  "day",
  "afternoon",
  "night",
  "morning",
] as const;

export const TIME_OF_DAY_ENCOUNTERS = 3;

/** Original background plus extra daily sets (`_s2` … `_s6`). */
export const ZONE_BG_SET_COUNT = 6;

export function getZoneDayCycleLength(): number {
  return TIME_OF_DAY_ENCOUNTERS * TIME_OF_DAY_ORDER.length;
}

/** Extra calendar days elapsed inside the current zone run (0 during the first cycle). */
export function getZoneRunDayOffset(zoneLevel: number): number {
  const level = Math.max(1, Math.floor(Number(zoneLevel) || 1));
  return Math.floor((level - 1) / getZoneDayCycleLength());
}

export function getZoneBackgroundSetIndex(calendarDay: number, zoneLevel = 1): number {
  const total = Math.max(0, Math.floor(Number(calendarDay) || 0) + getZoneRunDayOffset(zoneLevel));
  return total % ZONE_BG_SET_COUNT;
}

export function getZoneBackgroundBaseFile(zoneId: string, setIndex = 0): string | null {
  const base = (ZONE_BACKGROUNDS as Record<string, string>)[zoneId];
  if (!base) {
    return null;
  }
  const set = Math.max(0, Math.floor(Number(setIndex) || 0)) % ZONE_BG_SET_COUNT;
  if (set <= 0) {
    return base;
  }
  return base.replace(/\.png$/i, `_s${set + 1}.png`);
}

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  day: "Day",
  afternoon: "Afternoon",
  night: "Night",
  morning: "Morning",
};

export const TIME_OF_DAY_ICONS: Record<TimeOfDay, string> = {
  day: "data/ui/tod_day.png",
  afternoon: "data/ui/tod_afternoon.png",
  night: "data/ui/tod_night.png",
  morning: "data/ui/tod_morning.png",
};

export function getTimeOfDayForZoneLevel(zoneLevel: number): TimeOfDay {
  const level = Math.max(1, Math.floor(Number(zoneLevel) || 1));
  const index = Math.floor((level - 1) / TIME_OF_DAY_ENCOUNTERS) % TIME_OF_DAY_ORDER.length;
  return TIME_OF_DAY_ORDER[index];
}

export function isIndoorZone(zoneId: string | null | undefined): boolean {
  if (!zoneId) {
    return false;
  }
  return (INDOOR_ZONES as readonly string[]).includes(zoneId);
}

export function getZoneBackgroundFile(
  zoneId: string,
  zoneLevel = 1,
  calendarDay = 0
): string | null {
  const setIndex = getZoneBackgroundSetIndex(calendarDay, zoneLevel);
  const base = getZoneBackgroundBaseFile(zoneId, setIndex);
  if (!base) {
    return null;
  }
  if (isIndoorZone(zoneId)) {
    return base;
  }
  const tod = getTimeOfDayForZoneLevel(zoneLevel);
  if (tod === "day") {
    return base;
  }
  return base.replace(/\.png$/i, `_${tod}.png`);
}
