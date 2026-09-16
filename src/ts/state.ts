import {
  EQUIPMENT_CONFIG,
  INVENTORY_CONFIG,
  KEY_ITEMS_CONFIG,
  MAX_LIVES,
  type ActiveConsumableKey,
  type EquipmentKey,
} from "./constants.js";
import { getCharacterBaseStats } from "./data/combatBalance.js";

const INVENTORY_KEYS = INVENTORY_CONFIG.map((item) => item.key);
const EQUIPMENT_KEYS = EQUIPMENT_CONFIG.map((item) => item.key);
const KEY_ITEM_KEYS = KEY_ITEMS_CONFIG.map((item) => item.key);

export type Character = {
  id?: string | number;
  name?: string;
  stage?: string;
  hp?: number;
  element?: string;
  attribute?: string;
  type?: string;
  power?: number;
  description?: string;
  spriteFramesPath?: string;
  specialAttackName?: string;
  specialAttackSprite?: string;
  specialStatus?: string;
  evolvesTo?: string[];
  attacks?: Array<{
    name?: string;
    power?: number;
    hit?: number;
    status?: string;
  }>;
  [key: string]: unknown;
};

export type GameState = {
  mode: "history" | "arena" | null;
  characters: Character[];
  player: Character | null;
  opponent: Character | null;
  randomBabies: Character[];
  weight: number;
  training: number;
  /**
   * Successful home trains since last return from a zone (0–4).
   * Adds +1 Attack/Defense/Speed/Intelligence each; clears when you return home.
   */
  homeTrainBoost: number;
  battlesForEvolution: number;
  discipline: number;
  happiness: number;
  alignment: number;
  /** Internal run score. Not shown in care/status UI. */
  reputation: number;
  lives: number;
  meat: number;
  attributes: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
  };
  inventory: Record<string, number>;
  equipment: Record<string, number>;
  keyItems: Record<string, number>;
  equipped: EquipmentKey | null;
  activeConsumable: ActiveConsumableKey | null;
  /** Gear Up! active for the current zone run. */
  gearUpActive: boolean;
  /** Gear Up! used at Home; applies when the next zone run starts. */
  gearUpPending: boolean;
  /** Single-stat battle buffs lasting the current zone run. */
  zoneRunBuffs: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
    intelligence: boolean;
  };
  /** Zone buffs used at Home; applied when the next zone run starts. */
  zoneRunBuffsPending: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
    intelligence: boolean;
  };
  /** Opponent combat effects queued until the next live battle (e.g. Unicorn Horn). */
  pendingOpponentCombatEffects: string[];
  /** Player unique buffs queued until the next live battle. */
  pendingPlayerCombatEffects: string[];
  /** Single-stat battle debuffs lasting the current zone run. */
  zoneRunDebuffs: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
    intelligence: boolean;
  };
  stats: {
    wins: number;
    battles: number;
  };
  battle: any;
  finalChallenge: boolean;
  debugEvo: boolean;
  currentZone: string | null;
  zoneLevel: number;
  zoneRunHp: number | null;
  zoneEventChance: number;
  /**
   * Event ids that already resolved as non-repeatable this run.
   * They will not be offered again until the run resets.
   */
  consumedEventIds: string[];
  /** Last random/story zone event this run; skipped on the next event roll. */
  lastRolledZoneEventId: string | null;
  activeEvent: {
    id: string;
    resolved: boolean;
    /** Current dialogue node (`"start"` = root text/choices). */
    nodeId?: string;
    /** After an event fight, resume this dialogue node if set. */
    resumeNodeId?: string;
    /**
     * Whether this ending should leave the event available again this run.
     * Set from choice/outcome when the event finishes.
     */
    endingRepeatable?: boolean;
    /** Inventory key stolen by the current event (e.g. Koemon), if any. */
    stolenItemKey?: string;
    /** Display name for the stolen item. */
    stolenItemLabel?: string;
    /** Dialogue node ids that already ran `enterOutcomes`. */
    appliedEnterNodes?: string[];
  } | null;
  eventBattleOverride: {
    opponentId: string;
    stats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      intelligence: number;
    };
    rewardOnWin?: { key: string; amount?: number; label?: string };
    banForeverOnWin?: boolean;
    reputationOnWin?: number;
    incrementEventWinsOnWin?: boolean;
    dropsOnWin?: ReadonlyArray<{
      kind: string;
      key?: string;
      chance: number;
      amount?: number;
    }>;
    opponentStartBuffs?: true | ReadonlyArray<"fortified" | "protected" | "swift" | "focused">;
    /** Player starts the fight with listed debuffs (e.g. slow). */
    playerStartDebuffs?: ReadonlyArray<"slow" | "weak" | "exposed" | "distracted" | "demoralized">;
  } | null;
  zoneBossFight: {
    opponentId: string;
    stats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      intelligence: number;
    };
    unlockZones: string[];
    drops?: ReadonlyArray<{
      kind: string;
      key?: string;
      chance: number;
      amount?: number;
    }>;
  } | null;
  zoneBossFoughtThisRun: boolean;
  zoneBossVictory: boolean;
  trainingAutoSuccessCharges: number;
  lastStandCharges: number;
  evolutionMissBonus: number;
};

export const state: GameState = {
  mode: null,
  characters: [],
  player: null,
  opponent: null,
  randomBabies: [],
  weight: 0,
  training: 0,
  homeTrainBoost: 0,
  battlesForEvolution: 0,
  discipline: 0,
  happiness: 0,
  alignment: 0,
  reputation: 0,
  lives: MAX_LIVES,
  meat: 5,
  attributes: {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
  },
  inventory: Object.fromEntries(INVENTORY_KEYS.map((key) => [key, 0])),
  equipment: Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, 0])),
  keyItems: Object.fromEntries(KEY_ITEM_KEYS.map((key) => [key, 0])),
  equipped: null,
  activeConsumable: null,
  gearUpActive: false,
  gearUpPending: false,
  zoneRunBuffs: {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  },
  zoneRunBuffsPending: {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  },
  pendingOpponentCombatEffects: [],
  pendingPlayerCombatEffects: [],
  zoneRunDebuffs: {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  },
  stats: {
    wins: 0,
    battles: 0,
  },
  battle: null,
  finalChallenge: false,
  debugEvo: false,
  currentZone: null,
  zoneLevel: 0,
  zoneRunHp: null,
  zoneEventChance: 0,
  consumedEventIds: [],
  lastRolledZoneEventId: null,
  activeEvent: null,
  eventBattleOverride: null,
  zoneBossFight: null,
  zoneBossFoughtThisRun: false,
  zoneBossVictory: false,
  trainingAutoSuccessCharges: 0,
  lastStandCharges: 0,
  evolutionMissBonus: 0,
};

export function resetRunState() {
  state.player = null;
  state.opponent = null;
  state.weight = 0;
  state.training = 0;
  state.homeTrainBoost = 0;
  state.battlesForEvolution = 0;
  state.discipline = 0;
  state.happiness = 0;
  state.alignment = 0;
  state.reputation = 0;
  state.lives = MAX_LIVES;
  state.meat = 5;
  state.attributes = {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
  };
  INVENTORY_KEYS.forEach((key) => {
    state.inventory[key] = 0;
  });
  EQUIPMENT_KEYS.forEach((key) => {
    state.equipment[key] = 0;
  });
  KEY_ITEM_KEYS.forEach((key) => {
    state.keyItems[key] = 0;
  });
  // Clear any ad-hoc key item keys granted during the previous run.
  Object.keys(state.keyItems).forEach((key) => {
    state.keyItems[key] = 0;
  });
  // Starter unlock for now so Equipment menu is usable.
  state.equipment.woodenSword = 1;
  state.equipped = null;
  state.activeConsumable = null;
  state.gearUpActive = false;
  state.gearUpPending = false;
  state.zoneRunBuffs = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  state.zoneRunBuffsPending = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  state.pendingOpponentCombatEffects = [];
  state.pendingPlayerCombatEffects = [];
  state.zoneRunDebuffs = {
    attack: false,
    defense: false,
    speed: false,
    intelligence: false,
  };
  state.finalChallenge = false;
  state.debugEvo = false;
  state.currentZone = null;
  state.zoneLevel = 0;
  state.zoneRunHp = null;
  state.zoneEventChance = 0;
  state.consumedEventIds = [];
  state.lastRolledZoneEventId = null;
  state.activeEvent = null;
  state.eventBattleOverride = null;
  state.zoneBossFight = null;
  state.zoneBossFoughtThisRun = false;
  state.zoneBossVictory = false;
  state.trainingAutoSuccessCharges = 0;
  state.lastStandCharges = 0;
  state.evolutionMissBonus = 0;
}

/** Baseline stats for the hatched Digimon (Baby I starter). */
export function applyStarterAttributes() {
  state.weight = 1;
  state.lives = MAX_LIVES;
  state.meat = 5;
  state.homeTrainBoost = 0;
  state.attributes = getCharacterBaseStats(state.player);
}
