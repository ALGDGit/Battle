import { INVENTORY_CONFIG, } from "./constants.js";
const INVENTORY_KEYS = INVENTORY_CONFIG.map((item) => item.key);
export const state = {
    mode: null,
    characters: [],
    player: null,
    opponent: null,
    randomBabies: [],
    weight: 0,
    training: 0,
    inventory: Object.fromEntries(INVENTORY_KEYS.map((key) => [key, 0])),
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
