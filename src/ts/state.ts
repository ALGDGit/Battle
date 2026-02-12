import {
  INVENTORY_CONFIG,
  type ActiveConsumableKey,
  type InventoryKey,
} from "./constants.js";

const INVENTORY_KEYS = INVENTORY_CONFIG.map((item) => item.key);

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
  inventory: Record<InventoryKey, number>;
  activeConsumable: ActiveConsumableKey | null;
  stats: {
    wins: number;
    battles: number;
  };
  battle: any;
  finalChallenge: boolean;
  debugEvo: boolean;
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
  inventory: Object.fromEntries(
    INVENTORY_KEYS.map((key) => [key, 0])
  ) as Record<InventoryKey, number>,
  activeConsumable: null,
  stats: {
    wins: 0,
    battles: 0,
  },
  battle: null,
  finalChallenge: false,
  debugEvo: false,
  trainingAutoSuccessCharges: 0,
  lastStandCharges: 0,
  evolutionMissBonus: 0,
};

export function resetRunState() {
  state.player = null;
  state.opponent = null;
  state.weight = 0;
  state.training = 0;
  INVENTORY_KEYS.forEach((key) => {
    state.inventory[key] = 0;
  });
  state.activeConsumable = null;
  state.finalChallenge = false;
  state.debugEvo = false;
  state.trainingAutoSuccessCharges = 0;
  state.lastStandCharges = 0;
  state.evolutionMissBonus = 0;
}
