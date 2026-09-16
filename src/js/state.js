import { EQUIPMENT_CONFIG, INVENTORY_CONFIG, KEY_ITEMS_CONFIG, MAX_LIVES, } from "./constants.js";
import { getCharacterBaseStats } from "./data/combatBalance.js";
const INVENTORY_KEYS = INVENTORY_CONFIG.map((item) => item.key);
const EQUIPMENT_KEYS = EQUIPMENT_CONFIG.map((item) => item.key);
const KEY_ITEM_KEYS = KEY_ITEMS_CONFIG.map((item) => item.key);
export const state = {
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
