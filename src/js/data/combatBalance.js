import { STAGE_ORDER } from "./stages.js";
import { getZoneDifficultyTier } from "./zones.js";
const COMBAT_STATS = ["hp", "attack", "defense", "speed", "intelligence"];
/**
 * Damage is always max(1, ATK − DEF). Player acts first.
 *
 * Clear target with no gear and no training:
 *   T1–T2 Child, T3–T5 Adult, T6–T8 Perfect.
 * Ultimate is a small bonus over Perfect, not a new difficulty band.
 *
 * Each evolution is +1 ATK/DEF. You hit a bit harder; you do not delete wilds.
 */
const STAGE_BASE = {
    "Baby I": { hp: 26, attack: 5, defense: 3, speed: 3, intelligence: 3 },
    "Baby II": { hp: 30, attack: 6, defense: 4, speed: 4, intelligence: 4 },
    Child: { hp: 34, attack: 7, defense: 5, speed: 5, intelligence: 5 },
    Adult: { hp: 42, attack: 8, defense: 6, speed: 6, intelligence: 6 },
    Perfect: { hp: 52, attack: 9, defense: 7, speed: 7, intelligence: 7 },
    Ultimate: { hp: 56, attack: 10, defense: 8, speed: 8, intelligence: 8 },
    "Armor-Hybrid": { hp: 42, attack: 8, defense: 6, speed: 6, intelligence: 6 },
};
/** Typical encyclopedia `power` by stage. Used only as a mild uniqueness multiplier. */
const STAGE_POWER = {
    "Baby I": 5,
    "Baby II": 8,
    Child: 12,
    Adult: 16,
    Perfect: 20,
    Ultimate: 24,
    "Armor-Hybrid": 16,
};
const ARCHETYPES = [
    { name: "balanced", hp: 0, attack: 0, defense: 0, speed: 0, intelligence: 0 },
    { name: "striker", hp: -2, attack: 1, defense: -1, speed: 1, intelligence: 0 },
    { name: "tank", hp: 3, attack: -1, defense: 1, speed: -1, intelligence: 0 },
    { name: "swift", hp: -1, attack: 0, defense: 0, speed: 1, intelligence: 1 },
    { name: "mystic", hp: 0, attack: -1, defense: 0, speed: 0, intelligence: 2 },
    { name: "bruiser", hp: 2, attack: 1, defense: 0, speed: -1, intelligence: -1 },
];
function hashId(id) {
    let hash = 2166136261;
    for (let i = 0; i < id.length; i += 1) {
        hash ^= id.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function resolveStage(stage) {
    if (stage && STAGE_BASE[stage]) {
        return stage;
    }
    if (STAGE_ORDER.includes(stage)) {
        return stage;
    }
    return "Child";
}
export function getStageBaseStats(stage) {
    const key = resolveStage(stage);
    return { ...(STAGE_BASE[key] || STAGE_BASE.Child) };
}
function clampStat(stat, value) {
    const rounded = Math.round(Number(value) || 0);
    if (stat === "hp") {
        return Math.max(1, rounded);
    }
    if (stat === "defense") {
        return Math.max(0, rounded);
    }
    return Math.max(1, rounded);
}
function attributeBias(attribute) {
    const key = String(attribute || "").toLowerCase();
    if (key === "vaccine") {
        return { defense: 1, hp: 1, attack: -1 };
    }
    if (key === "virus") {
        return { attack: 1, speed: 1, defense: -1 };
    }
    if (key === "data") {
        return { intelligence: 1, speed: 1, hp: -1 };
    }
    return {};
}
/**
 * Identity stats for a player Digimon.
 * Same id + stage always yields the same block.
 */
export function getCharacterCombatIdentity(character) {
    if (!character) {
        return { stage: "Baby I", archetype: "balanced", stats: { ...STAGE_BASE["Baby I"] } };
    }
    if (character.combatStats) {
        return {
            stage: resolveStage(character.stage),
            archetype: "override",
            stats: { ...character.combatStats },
        };
    }
    const stage = resolveStage(character.stage);
    const base = STAGE_BASE[stage] || STAGE_BASE.Child;
    const id = String(character.id || character.stage || "digimon");
    const archetype = ARCHETYPES[hashId(id) % ARCHETYPES.length];
    const expectedPower = STAGE_POWER[stage] || 12;
    const power = Number(character.power);
    const relative = Number.isFinite(power) && expectedPower > 0
        ? Math.max(0.95, Math.min(1.08, power / expectedPower))
        : 1;
    const bias = attributeBias(character.attribute || character.element);
    const raw = {
        hp: (base.hp + archetype.hp + (bias.hp || 0)) * relative,
        attack: (base.attack + archetype.attack + (bias.attack || 0)) * relative,
        defense: base.defense + archetype.defense + (bias.defense || 0),
        speed: base.speed + archetype.speed + (bias.speed || 0),
        intelligence: base.intelligence + archetype.intelligence + (bias.intelligence || 0),
    };
    return {
        stage,
        archetype: archetype.name,
        stats: {
            hp: clampStat("hp", raw.hp),
            attack: clampStat("attack", raw.attack),
            defense: clampStat("defense", raw.defense),
            speed: clampStat("speed", raw.speed),
            intelligence: clampStat("intelligence", raw.intelligence),
        },
    };
}
export function getCharacterBaseStats(character) {
    return getCharacterCombatIdentity(character).stats;
}
/**
 * Static wild table: zone tier × enemy stage. Floor does not matter.
 *
 * Expected clearer deals about 3 per hit, so typical wilds take 4–6 hits.
 * Crits and training shorten that; they should not delete the enemy in one hit.
 */
const WILD_BY_TIER = {
    1: {
        "Baby I": { hp: 10, attack: 3, defense: 4, speed: 3, intelligence: 3 },
        "Baby II": { hp: 11, attack: 4, defense: 4, speed: 4, intelligence: 4 },
        Child: { hp: 12, attack: 5, defense: 4, speed: 5, intelligence: 5 },
        Adult: { hp: 16, attack: 6, defense: 5, speed: 6, intelligence: 6 },
        Perfect: { hp: 19, attack: 7, defense: 5, speed: 6, intelligence: 6 },
        Ultimate: { hp: 20, attack: 7, defense: 5, speed: 6, intelligence: 6 },
    },
    2: {
        "Baby I": { hp: 11, attack: 4, defense: 4, speed: 3, intelligence: 3 },
        "Baby II": { hp: 12, attack: 4, defense: 4, speed: 4, intelligence: 4 },
        Child: { hp: 13, attack: 5, defense: 4, speed: 5, intelligence: 5 },
        Adult: { hp: 16, attack: 6, defense: 5, speed: 6, intelligence: 6 },
        Perfect: { hp: 19, attack: 7, defense: 5, speed: 6, intelligence: 6 },
        Ultimate: { hp: 20, attack: 7, defense: 5, speed: 6, intelligence: 6 },
    },
    3: {
        "Baby I": { hp: 12, attack: 4, defense: 5, speed: 4, intelligence: 4 },
        "Baby II": { hp: 13, attack: 5, defense: 5, speed: 4, intelligence: 4 },
        Child: { hp: 14, attack: 6, defense: 5, speed: 5, intelligence: 5 },
        Adult: { hp: 17, attack: 7, defense: 6, speed: 7, intelligence: 7 },
        Perfect: { hp: 20, attack: 8, defense: 6, speed: 7, intelligence: 7 },
        Ultimate: { hp: 21, attack: 8, defense: 6, speed: 7, intelligence: 7 },
    },
    4: {
        "Baby I": { hp: 12, attack: 5, defense: 5, speed: 4, intelligence: 4 },
        "Baby II": { hp: 13, attack: 5, defense: 5, speed: 5, intelligence: 5 },
        Child: { hp: 14, attack: 6, defense: 5, speed: 5, intelligence: 5 },
        Adult: { hp: 17, attack: 7, defense: 6, speed: 7, intelligence: 7 },
        Perfect: { hp: 20, attack: 8, defense: 6, speed: 7, intelligence: 7 },
        Ultimate: { hp: 21, attack: 8, defense: 6, speed: 7, intelligence: 7 },
    },
    5: {
        "Baby I": { hp: 13, attack: 5, defense: 5, speed: 4, intelligence: 4 },
        "Baby II": { hp: 14, attack: 6, defense: 5, speed: 5, intelligence: 5 },
        Child: { hp: 15, attack: 6, defense: 5, speed: 5, intelligence: 5 },
        Adult: { hp: 18, attack: 7, defense: 6, speed: 7, intelligence: 7 },
        Perfect: { hp: 21, attack: 8, defense: 6, speed: 7, intelligence: 7 },
        Ultimate: { hp: 22, attack: 8, defense: 6, speed: 7, intelligence: 7 },
    },
    6: {
        "Baby I": { hp: 14, attack: 5, defense: 6, speed: 5, intelligence: 5 },
        "Baby II": { hp: 15, attack: 6, defense: 6, speed: 5, intelligence: 5 },
        Child: { hp: 16, attack: 7, defense: 6, speed: 6, intelligence: 6 },
        Adult: { hp: 19, attack: 8, defense: 7, speed: 7, intelligence: 7 },
        Perfect: { hp: 22, attack: 9, defense: 7, speed: 8, intelligence: 8 },
        Ultimate: { hp: 23, attack: 9, defense: 7, speed: 8, intelligence: 8 },
    },
    7: {
        "Baby I": { hp: 14, attack: 5, defense: 6, speed: 5, intelligence: 5 },
        "Baby II": { hp: 15, attack: 6, defense: 6, speed: 5, intelligence: 5 },
        Child: { hp: 16, attack: 7, defense: 6, speed: 6, intelligence: 6 },
        Adult: { hp: 19, attack: 8, defense: 7, speed: 7, intelligence: 7 },
        Perfect: { hp: 22, attack: 9, defense: 7, speed: 8, intelligence: 8 },
        Ultimate: { hp: 23, attack: 9, defense: 7, speed: 8, intelligence: 8 },
    },
    8: {
        "Baby I": { hp: 12, attack: 6, defense: 6, speed: 5, intelligence: 5 },
        "Baby II": { hp: 13, attack: 6, defense: 6, speed: 6, intelligence: 6 },
        Child: { hp: 14, attack: 7, defense: 6, speed: 7, intelligence: 7 },
        Adult: { hp: 17, attack: 8, defense: 7, speed: 8, intelligence: 8 },
        Perfect: { hp: 20, attack: 9, defense: 7, speed: 8, intelligence: 8 },
        Ultimate: { hp: 21, attack: 9, defense: 7, speed: 8, intelligence: 8 },
    },
};
function wildStageKey(stage) {
    const resolved = resolveStage(stage);
    return resolved === "Armor-Hybrid" ? "Adult" : resolved;
}
const WILD_SPREAD_STATS = ["attack", "defense", "speed", "intelligence"];
/** Small ATK/DEF/SPD/INT mixes. All sum to 0, so the tier×stage total stays the same. */
const WILD_SPREADS = [
    [0, 0, 0, 0],
    [1, -1, 0, 0],
    [1, 0, -1, 0],
    [1, 0, 0, -1],
    [-1, 1, 0, 0],
    [0, 1, -1, 0],
    [0, 1, 0, -1],
    [-1, 0, 1, 0],
    [0, -1, 1, 0],
    [0, 0, 1, -1],
    [-1, 0, 0, 1],
    [0, -1, 0, 1],
    [0, 0, -1, 1],
    [1, 1, -1, -1],
    [1, -1, 1, -1],
    [1, -1, -1, 1],
    [-1, 1, 1, -1],
    [-1, 1, -1, 1],
    [-1, -1, 1, 1],
    [2, -1, -1, 0],
    [2, -1, 0, -1],
    [2, 0, -1, -1],
    [-1, 2, -1, 0],
    [0, 2, -1, -1],
    [-1, -1, 2, 0],
    [0, -1, 2, -1],
    [-1, -1, 0, 2],
    [-1, 0, -1, 2],
    [1, -2, 1, 0],
    [0, -2, 1, 1],
    [-2, 1, 1, 0],
    [1, 1, -2, 0],
];
/**
 * Keep HP and the ATK+DEF+SPD+INT total. Move a couple of points around
 * so two wilds of the same tier and stage still feel different.
 * No stat drops more than 2 below the group average, or rises more than 2 above.
 */
function varyWildCombatSpread(base, seed) {
    const spread = WILD_SPREADS[hashId(seed) % WILD_SPREADS.length];
    const pool = WILD_SPREAD_STATS.reduce((sum, stat) => sum + base[stat], 0);
    const average = Math.round(pool / WILD_SPREAD_STATS.length);
    const low = Math.max(1, average - 2);
    const high = average + 2;
    const floorOf = (stat) => stat === "defense" ? Math.max(0, average - 2) : low;
    const next = {
        hp: base.hp,
        attack: base.attack + spread[0],
        defense: base.defense + spread[1],
        speed: base.speed + spread[2],
        intelligence: base.intelligence + spread[3],
    };
    WILD_SPREAD_STATS.forEach((stat) => {
        next[stat] = Math.max(floorOf(stat), Math.min(high, next[stat]));
    });
    let total = WILD_SPREAD_STATS.reduce((sum, stat) => sum + next[stat], 0);
    let guard = 0;
    while (total !== pool && guard < 12) {
        guard += 1;
        const grow = total < pool;
        const order = [...WILD_SPREAD_STATS].sort((a, b) => grow ? next[a] - next[b] : next[b] - next[a]);
        const stat = order.find((key) => grow ? next[key] < high : next[key] > floorOf(key));
        if (!stat) {
            break;
        }
        if (grow) {
            next[stat] += 1;
            total += 1;
        }
        else {
            next[stat] -= 1;
            total -= 1;
        }
    }
    return next;
}
/**
 * Boss stats are per zone tier only. Boss stage and floor do not matter.
 * HP is 35% above a Perfect wild of the same tier. Attack is +1; other stats match Perfect.
 * Defense is not raised so a typical clearer still deals more than 1 per hit.
 */
export function getBossCombatStats(zoneId) {
    const tier = getZoneDifficultyTier(zoneId);
    const perfect = WILD_BY_TIER[tier]?.Perfect || WILD_BY_TIER[1].Perfect;
    return {
        hp: Math.round(perfect.hp * 1.35),
        attack: perfect.attack + 1,
        defense: perfect.defense,
        speed: perfect.speed,
        intelligence: perfect.intelligence,
    };
}
/** Exact wild-table row for a stage and difficulty tier (no per-Digimon spread). */
export function getTableCombatStats(stage, tier) {
    const safeTier = Math.max(1, Math.min(8, Math.floor(Number(tier) || 1)));
    const row = WILD_BY_TIER[safeTier]?.[wildStageKey(stage)] || WILD_BY_TIER[1].Child;
    return { ...row };
}
/** Static wild stats for this zone's tier and the enemy's evolution stage. */
export function getWildCombatStats(character, zoneId, identityOverride) {
    if (identityOverride) {
        return { ...identityOverride };
    }
    const tier = getZoneDifficultyTier(zoneId);
    const stage = wildStageKey(character?.stage);
    const row = WILD_BY_TIER[tier]?.[stage] || WILD_BY_TIER[1].Child;
    const seed = String(character?.id || character?.stage || stage);
    return varyWildCombatSpread(row, seed);
}
export function addCombatStatDelta(current, from, to) {
    return {
        hp: clampStat("hp", current.hp + (to.hp - from.hp)),
        attack: clampStat("attack", current.attack + (to.attack - from.attack)),
        defense: clampStat("defense", current.defense + (to.defense - from.defense)),
        speed: clampStat("speed", current.speed + (to.speed - from.speed)),
        intelligence: clampStat("intelligence", current.intelligence + (to.intelligence - from.intelligence)),
    };
}
