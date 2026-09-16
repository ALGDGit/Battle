import {
  getZoneDifficultyTier,
  type ZoneDifficultyTier,
} from "./zones.js";
import type { EnemyDrop } from "./bosses.js";
import {
  getCharacterBaseStats,
  type CombatStatBlock,
} from "./combatBalance.js";

export {
  addCombatStatDelta,
  getBossCombatStats,
  getCharacterBaseStats,
  getStageBaseStats,
  getTableCombatStats,
  getWildCombatStats,
  type CombatStatBlock,
} from "./combatBalance.js";

/** Stages that can appear in zone wild-encounter tables. */
export const ENCOUNTER_STAGES = [
  "Baby I",
  "Baby II",
  "Child",
  "Adult",
  "Perfect",
  "Ultimate",
] as const;
export type EncounterStage = (typeof ENCOUNTER_STAGES)[number];

/**
 * Wild encounter stage odds by zone difficulty tier.
 * Early tiers favor Baby/Child; late tiers favor Adult/Perfect/Ultimate.
 * Empty stage pools are skipped at roll time (weights kept “just in case”).
 */
export const TIER_STAGE_WEIGHTS: Record<
  ZoneDifficultyTier,
  Partial<Record<EncounterStage, number>>
> = {
  // Tier 1: Baby I 40, Baby II 30, Child 15, Adult 10, Perfect 5
  1: {
    "Baby I": 40,
    "Baby II": 30,
    Child: 15,
    Adult: 10,
    Perfect: 5,
    Ultimate: 0,
  },
  2: {
    "Baby I": 20,
    "Baby II": 20,
    Child: 35,
    Adult: 20,
    Perfect: 5,
    Ultimate: 0,
  },
  3: {
    "Baby I": 10,
    "Baby II": 10,
    Child: 20,
    Adult: 40,
    Perfect: 10,
    Ultimate: 0,
  },
  4: {
    "Baby I": 5,
    "Baby II": 5,
    Child: 10,
    Adult: 50,
    Perfect: 20,
    Ultimate: 10,
  },
  5: {
    "Baby I": 5,
    "Baby II": 5,
    Child: 10,
    Adult: 40,
    Perfect: 30,
    Ultimate: 10,
  },
  6: {
    "Baby I": 5,
    "Baby II": 5,
    Child: 5,
    Adult: 30,
    Perfect: 40,
    Ultimate: 15,
  },
  7: {
    "Baby I": 5,
    "Baby II": 5,
    Child: 5,
    Adult: 20,
    Perfect: 40,
    Ultimate: 25,
  },
  8: {
    "Baby I": 1,
    "Baby II": 1,
    Child: 1,
    Adult: 1,
    Perfect: 1,
    Ultimate: 1,
  },
};

/** Stage weights for wild encounters in a zone (from difficulty tier). */
export function getZoneEncounterStageWeights(
  zoneId: string | null | undefined
): Partial<Record<EncounterStage, number>> {
  return TIER_STAGE_WEIGHTS[getZoneDifficultyTier(zoneId)];
}

/**
 * Pool entry: bare id (weight 1) or object for rarity / individual combat stats.
 * Example: `["nyokimon", { id: "pupumon", weight: 3, stats: { hp: 3, attack: 1, defense: 1, speed: 2, intelligence: 1 } }]`
 */
export type WeightedEncounterId =
  | string
  | {
      readonly id: string;
      readonly weight?: number;
      /** Optional per-Digimon combat stats for this zone entry. */
      readonly stats?: CombatStatBlock;
    };

export function getEncounterEntryId(entry: WeightedEncounterId): string {
  return typeof entry === "string" ? entry : String(entry.id || "");
}

export function getEncounterEntryWeight(entry: WeightedEncounterId): number {
  if (typeof entry === "string") {
    return 1;
  }
  const weight = Number(entry.weight);
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

export function getEncounterEntryStats(entry: WeightedEncounterId): CombatStatBlock | null {
  if (typeof entry === "string" || !entry.stats) {
    return null;
  }
  const stats = entry.stats;
  return {
    hp: Number(stats.hp) || 1,
    attack: Number(stats.attack) || 0,
    defense: Number(stats.defense) || 0,
    speed: Number(stats.speed) || 0,
    intelligence: Number(stats.intelligence) || 0,
  };
}

/** Identity combat stats for a Digimon (no zone scaling). */
export function getCharacterCombatStats(
  character: Parameters<typeof getCharacterBaseStats>[0]
): CombatStatBlock {
  return getCharacterBaseStats(character);
}

/** Relative stage mix for a zone. Only stages with weight > 0 and a non-empty pool can roll. */
export type ZoneStageWeights = Partial<Record<EncounterStage, number>>;

export function pickWeightedIndex(weights: readonly number[]): number {
  const total = weights.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (total <= 0) {
    return -1;
  }
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    roll -= Math.max(0, Number(weights[i]) || 0);
    if (roll < 0) {
      return i;
    }
  }
  return weights.length - 1;
}

export function pickWeightedEncounterId(
  entries: readonly WeightedEncounterId[] | undefined
): string | null {
  if (!entries?.length) {
    return null;
  }
  const index = pickWeightedIndex(entries.map((entry) => getEncounterEntryWeight(entry)));
  if (index < 0) {
    return null;
  }
  const id = getEncounterEntryId(entries[index]);
  return id || null;
}

const ENCOUNTER_POOL_KEYS = {
  "Baby I": "babyI",
  "Baby II": "babyIi",
  Child: "child",
  Adult: "adult",
  Perfect: "perfect",
  Ultimate: "ultimate",
} as const satisfies Record<EncounterStage, string>;

export function getZoneStagePool(
  config: {
    babyI?: readonly WeightedEncounterId[];
    babyIi?: readonly WeightedEncounterId[];
    child?: readonly WeightedEncounterId[];
    adult?: readonly WeightedEncounterId[];
    perfect?: readonly WeightedEncounterId[];
    ultimate?: readonly WeightedEncounterId[];
  },
  stage: EncounterStage
): readonly WeightedEncounterId[] {
  const key = ENCOUNTER_POOL_KEYS[stage];
  const pool = (config as Record<string, readonly WeightedEncounterId[] | undefined>)[key];
  return pool || [];
}

export function findZoneEncounterEntry(
  config: {
    babyI?: readonly WeightedEncounterId[];
    babyIi?: readonly WeightedEncounterId[];
    child?: readonly WeightedEncounterId[];
    adult?: readonly WeightedEncounterId[];
    perfect?: readonly WeightedEncounterId[];
    ultimate?: readonly WeightedEncounterId[];
  },
  encounterId: string
): WeightedEncounterId | null {
  for (const stage of ENCOUNTER_STAGES) {
    const entry = getZoneStagePool(config, stage).find(
      (item) => getEncounterEntryId(item) === encounterId
    );
    if (entry) {
      return entry;
    }
  }
  return null;
}

export function listZoneEncounterIds(config: {
  babyI?: readonly WeightedEncounterId[];
  babyIi?: readonly WeightedEncounterId[];
  child?: readonly WeightedEncounterId[];
  adult?: readonly WeightedEncounterId[];
  perfect?: readonly WeightedEncounterId[];
  ultimate?: readonly WeightedEncounterId[];
}): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const stage of ENCOUNTER_STAGES) {
    for (const entry of getZoneStagePool(config, stage)) {
      const id = getEncounterEntryId(entry);
      if (!id || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function resolveEncounterStageForId(
  config: {
    babyI?: readonly WeightedEncounterId[];
    babyIi?: readonly WeightedEncounterId[];
    child?: readonly WeightedEncounterId[];
    adult?: readonly WeightedEncounterId[];
    perfect?: readonly WeightedEncounterId[];
    ultimate?: readonly WeightedEncounterId[];
  },
  encounterId: string
): EncounterStage | null {
  for (const stage of ENCOUNTER_STAGES) {
    const hit = getZoneStagePool(config, stage).some(
      (entry) => getEncounterEntryId(entry) === encounterId
    );
    if (hit) {
      return stage;
    }
  }
  return null;
}

/** Per-zone encounter pools (weights + Digimon lists). Combat stats are per Digimon. */
export const ZONE_ENCOUNTERS = {
  native_forest: {
    stageWeights: {
      "Baby I": 22,
      "Baby II": 32,
      Child: 32,
      Adult: 14,
    },
    babyI: ["nyokimon", "pupumon", "pyonmon"],
    babyIi: ["koromon", "minomon", "puroromon", "pyocomon", "tanemon", "xiaomon"],
    child: ["alraumon", "angoramon", "dokunemon", "funbeemon", "mushmon"],
    adult: ["redvegimon", "sunflowmon", "symbareangoramon"],
    perfect: [] as string[],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  beach: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["fufumon", "puyomon"],
    babyIi: ["pukamon"],
    child: ["gasamon", "ganimon", "gomamon", "sangomon", "shakomon"],
    adult: ["ebidramon", "gesomon", "hookmon", "morishellmon", "octmon", "rukamon", "teslajellymon"],
    perfect: ["anomalocarimon", "gusokumon", "hangyomon", "marinbullmon", "marinchimairamon", "marindevimon", "mermaimon", "thetismon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  dragon_eye_lake: {
    stageWeights: {
      "Baby I": 13,
      Child: 38,
      Adult: 31,
      Perfect: 18,
    },
    babyI: ["pitchmon"],
    babyIi: [] as string[],
    child: ["fujamon", "swimmon"],
    adult: ["deckerdramon", "gawappamon", "tobiumon"],
    perfect: ["huankunmon", "piranimon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  drill_tunnel: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["mokumon", "sunamon"],
    babyIi: ["goromon", "petimeramon", "sunmon", "wanyamon"],
    child: ["coronamon", "gotsumon", "vorvomon"],
    adult: ["firamon", "flarelizamon", "golemon", "lavorvomon", "nisedrimogemon"],
    perfect: ["darumamon", "flaremon", "lavogaritamon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  mt_panorama: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["dodomon", "tsubumon"],
    babyIi: ["chicchimon", "meicoobaby", "poromon", "torikaraballmon"],
    child: ["elecmon_violet", "gizamon", "gottsumon", "hyokomon", "labramon", "pteromon"],
    adult: ["coredramon_blue", "dorulumon", "filmon", "galemon", "hakubamon", "tortamon", "xiquemon"],
    perfect: ["grandgalemon", "yatagaramon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  gear_savanna: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["ketomon", "relemon", "zerimon"],
    babyIi: ["dorimon", "pokomon"],
    child: ["armadimon", "bearmon", "hanimon", "herissmon", "pulsemon", "takinmon"],
    adult: ["coredramon_green", "dinohumon", "gryzmon", "kiwimon", "mikemon", "peckmon", "shimaunimon"],
    perfect: ["pandamon", "panjyamon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  geko_swamp: {
    stageWeights: {
      Child: 55,
      Adult: 45,
    },
    babyI: [] as string[],
    babyIi: [] as string[],
    child: ["otamamon", "otamamon_red"],
    adult: ["gekomon"],
    perfect: [] as string[],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  volume_villa: {
    stageWeights: {
      "Baby I": 100,
    },
    babyI: ["dokimon"],
    babyIi: [] as string[],
    child: [] as string[],
    adult: [] as string[],
    perfect: [] as string[],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  misty_trees: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["punimon"],
    babyIi: ["chocomon", "tsunomon"],
    child: ["psychemon", "tinkermon", "wankomon"],
    adult: ["akatorimon", "fugamon"],
    perfect: ["entmon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  trash_mountain: {
    stageWeights: {
      "Baby II": 22,
      Child: 33,
      Adult: 28,
      Perfect: 17,
    },
    babyI: [] as string[],
    babyIi: ["monimon"],
    child: ["junkmon", "zenimon"],
    adult: ["cyclomon", "damemon", "diginorimon", "geremon", "gokimon", "raremon", "scumon"],
    perfect: ["gerbemon", "rebellimon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  toy_town: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["zurumon"],
    babyIi: ["gummymon", "pagumon"],
    child: ["clearagumon", "ekakimon", "gazimon", "toyagumon", "toyagumon_black"],
    adult: ["dogmon", "kougamon", "lianpumon", "manekimon", "omekamon", "tankmon", "targetmon", "tobucatmon"],
    perfect: ["extyranomon", "knightmon", "shootmon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  factorial_town: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["bombmon", "bommon", "choromon"],
    babyIi: ["bibimon", "caprimon", "kozenimon", "pusurimon"],
    child: ["jazamon", "kokuwamon", "solarmon"],
    adult: ["clockmon", "guardromon", "jazardmon", "mechanorimon", "platinumscumon", "revolmon", "tialudomon", "thunderballmon"],
    perfect: ["bigmamemon", "catchmamemon", "grappleomon", "jazarichmon", "locomon", "megalogrowmon", "megalogrowmon_orange", "metalgreymon_virus", "metaltyranomon", "rizegreymon", "tekkamon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  mt_infinity: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["algomon_babyi", "kuramon"],
    babyIi: ["algomon_babyii", "arkadimon_baby", "tsumemon"],
    child: ["algomon_child", "arkadimon_child", "keramon"],
    adult: ["algomon_adult", "deltamon"],
    perfect: ["asuramon", "chimairamon", "darksuperstarmon", "gigadramon", "nanomon", "neodevimon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  tropical_jungle: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["leafmon", "pipimon", "popomon"],
    babyIi: ["budmon"],
    child: ["floramon", "kakamon", "lalamon", "morphomon", "phascomon", "tsukaimon"],
    adult: ["baboongamon", "chamblemon", "flymon", "hanumon", "junglemojyamon", "woodmon", "zassoumon"],
    perfect: ["lilamon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  dino_region: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["chicomon", "jyarimon", "petitmon"],
    babyIi: ["babydmon", "chibimon", "gigimon", "kyokyomon"],
    child: ["dorumon", "dracomon", "gaomon", "gaossmon", "guilmon", "gumdramon", "hackmon", "monodramon"],
    adult: ["arresterdramon", "blackgrowmon", "darklizamon", "darktyranomon", "dorugamon", "greymon_2010", "growmon_orange", "parasaurmon", "raptordramon", "redv_dramon", "strikedramon", "tuskmon", "tyranomon", "v_dramon_black"],
    perfect: ["aerov_dramon", "insekimon", "mametyramon", "triceramon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  great_canyon: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["cocomon"],
    babyIi: ["mococomon"],
    child: ["lopmon", "muchomon", "ryudamon", "sunarizamon"],
    adult: ["ginryumon", "monochromon", "kinkakumon", "saberdramon", "sandyanmamon", "tsuchidarumon"],
    perfect: ["gogmamon", "jyagamon", "scorpiomon", "vermillimon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  freezeland: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["yukimibotamon", "yuramon", "pafumon"],
    babyIi: ["hiyarimon", "moonmon"],
    child: ["blucomon", "spadamon", "yukiagumon"],
    adult: ["gururumon", "hyougamon", "icedevimon", "icemon", "mojyamon", "sorcerymon"],
    perfect: ["cryspaledramon", "bluemeramon", "mammon", "sekkamon", "skullbaluchimon", "weregarurumon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  ogremons_fortress: {
    stageWeights: {
      "Baby II": 22,
      Child: 33,
      Adult: 28,
      Perfect: 17,
    },
    babyI: [] as string[],
    babyIi: ["kakkinmon"],
    child: ["commandramon", "ludomon"],
    adult: ["blackgalgomon", "ginkakumon", "hi_commandramon", "minotaurmon", "musyamon", "troopmon"],
    perfect: ["cargodramon", "xingtianmon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  ice_sanctuary: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["poyomon", "pururumon", "pusumon", "puttimon"],
    babyIi: ["cupimon", "nyaromon", "tokomon", "upamon"],
    child: ["gammamon", "lunamon"],
    adult: ["pidmon", "kyubimon_silver", "lekismon", "paledramon"],
    perfect: ["crescemon", "holyangemon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  beetle_land: {
    stageWeights: {
      "Baby II": 22,
      Child: 33,
      Adult: 28,
      Perfect: 17,
    },
    babyI: [] as string[],
    babyIi: ["mochimon"],
    child: ["kokabuterimon", "tentomon"],
    adult: ["kabuterimon", "karatsukinumemon", "kuwagamon", "waspmon", "yanmamon"],
    perfect: ["atlurkabuterimon_blue", "atlurkabuterimon_red", "okuwamon"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  greylords_mansion: {
    stageWeights: {
      "Baby I": 10,
      "Baby II": 20,
      Child: 30,
      Adult: 25,
      Perfect: 15,
    },
    babyI: ["cotsucomon", "kiimon", "paomon", "tomorimon"],
    babyIi: ["onibimon", "yaamon"],
    child: ["agumon_black", "bakumon", "blackguilmon", "candmon", "dracumon", "gabumon_black", "ghostmon", "loogamon", "petitmamon"],
    adult: ["bakemon", "blackgaogamon", "blacktailmon", "devidramon", "dobermon", "dokugumon", "garurumon_black", "kokeshimon", "loogarmon", "mimicmon", "porcupamon", "soulmon", "witchmon"],
    perfect: ["archnemon", "astamon", "cyberdramon", "deathmeramon", "phantomon", "karakurumon", "mephismon", "metalphantomon", "mummymon", "oboromon", "pumpmon", "weregarurumon_black"],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  cocytus: {
    stageWeights: {
    },
    babyI: [] as string[],
    babyIi: [] as string[],
    child: [] as string[],
    adult: [] as string[],
    perfect: [] as string[],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
  kernel: {
    stageWeights: {
    },
    babyI: [] as string[],
    babyIi: [] as string[],
    child: [] as string[],
    adult: [] as string[],
    perfect: [] as string[],
    enemyDrops: {} as const satisfies Record<string, readonly EnemyDrop[]>,
  },
} as const;

export type ZoneEncounterConfig = (typeof ZONE_ENCOUNTERS)[keyof typeof ZONE_ENCOUNTERS];

/** Keys in the 6th wild-drop slot. Always an array so more items can be appended. */
export type WildSpecialDropPool = readonly string[];

function toWildSpecialDropPool(
  value: string | WildSpecialDropPool | null | undefined
): string[] {
  if (!value) {
    return [];
  }
  const list = typeof value === "string" ? [value] : [...value];
  return [...new Set(list.filter(Boolean))];
}

/**
 * Extra 6th-slot keys for a specific wild. Append to the array.
 * native_forest: { wormmon: ["unicornHorn"] },
 */
export const WILD_SPECIAL_DROPS: Partial<
  Record<string, Readonly<Record<string, WildSpecialDropPool>>>
> = {};

/**
 * 6th wild-drop slot for every wild in the zone.
 * Always an array: `["lollipop", "baseballBat"]`.
 */
export const WILD_ZONE_SPECIAL_DROPS: Partial<Record<string, WildSpecialDropPool>> = {
  native_forest: ["meat", "happyMushroom"],
  beach: ["digisardine", "sardineSkewer"],
  dragon_eye_lake: ["digiseabass", "whitePearl"],
  drill_tunnel: ["burntMeat", "charredMeat"],
  mt_panorama: ["digichampignon", "millennialEggs"],
  gear_savanna: ["sirloin", "greenLeaves"],
  misty_trees: ["mistFruit", "forbiddenFruit"],
  trash_mountain: ["mcWhopper"],
  toy_town: ["lollipop", "baseballBat", "candies"],
  factorial_town: ["boltSandwich", "metalApple"],
  tropical_jungle: ["mixedBerries", "rainbowFruit"],
  dino_region: ["dinofillete", "prehistoricFruit"],
  great_canyon: ["friedCactus", "peyote"],
  freezeland: ["iceCream", "fressiSuis"],
  beetle_land: ["smokedLarva", "wormStew"],
};

export function getWildSpecialDropKeys(
  zoneId: string | null | undefined,
  encounterId: string | null | undefined
): string[] {
  const zoneKeys = toWildSpecialDropPool(zoneId ? WILD_ZONE_SPECIAL_DROPS[zoneId] : null);
  const encounterKeys = toWildSpecialDropPool(
    zoneId && encounterId ? WILD_SPECIAL_DROPS[zoneId]?.[encounterId] : null
  );
  return toWildSpecialDropPool([...zoneKeys, ...encounterKeys]);
}
