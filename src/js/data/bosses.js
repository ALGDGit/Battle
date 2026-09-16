/** Boss fights. After round N, each later encounter has `chance` to be the boss. */
export const ZONE_BOSSES = {
    native_forest: {
        opponentId: "wormmon",
        appearAfterLevel: 6,
        chance: 0.25,
        unlockZones: ["beach", "dragon_eye_lake", "drill_tunnel"],
        drops: [
            { kind: "equipment", key: "kaisersGoggles", chance: 0.1 },
        ],
    },
    beach: {
        opponentId: "coelamon",
        opponentIds: ["coelamon", "ikkakumon"],
        appearAfterLevel: 6,
        chance: 0.25,
        unlockZones: ["tropical_jungle"],
        drops: [
            { kind: "equipment", key: "hardScale", chance: 0.1, opponentId: "coelamon" },
            { kind: "equipment", key: "narwhalHorn", chance: 0.1, opponentId: "ikkakumon" },
            { kind: "meat", chance: 0.5 },
        ],
    },
    dragon_eye_lake: {
        opponentId: "megaseadramon",
        opponentIds: ["waruseadramon", "megaseadramon"],
        appearAfterLevel: 6,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "cursedHorn", chance: 0.1, opponentId: "waruseadramon" },
            { kind: "equipment", key: "mightyHorn", chance: 0.1, opponentId: "megaseadramon" },
            { kind: "meat", chance: 0.4 },
        ],
    },
    drill_tunnel: {
        opponentId: "meramon",
        appearAfterLevel: 6,
        chance: 0.25,
        unlockZones: ["mt_panorama", "gear_savanna"],
        drops: [
            { kind: "equipment", key: "blazingArmor", chance: 0.1 },
        ],
    },
    mt_panorama: {
        opponentId: "stiffilmon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "hedgehogShell", chance: 0.2 },
            { kind: "meat", chance: 0.4 },
        ],
    },
    gear_savanna: {
        opponentId: "leomon",
        opponentIds: ["leomon", "tailmon"],
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: ["geko_swamp", "misty_trees"],
        drops: [
            { kind: "equipment", key: "ancientRelic", chance: 0.1, opponentId: "leomon" },
            { kind: "equipment", key: "catGloves", chance: 0.1, opponentId: "tailmon" },
            { kind: "inventory", key: "potion", chance: 0.3 },
        ],
    },
    geko_swamp: {
        opponentId: "gekomon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [{ kind: "meat", chance: 0.45 }],
    },
    volume_villa: {
        opponentId: "digitamamon",
        appearAfterLevel: 8,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.35 },
            { kind: "meat", chance: 0.4 },
        ],
    },
    misty_trees: {
        opponentId: "jyureimon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: ["freezeland", "toy_town"],
        drops: [
            { kind: "inventory", key: "eternalApple", chance: 0.1 },
            { kind: "inventory", key: "happyMushroom", chance: 0.3 },
        ],
    },
    trash_mountain: {
        opponentId: "numemon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.35 },
        ],
    },
    toy_town: {
        opponentId: "warumonzaemon",
        opponentIds: ["warumonzaemon", "jumbogamemon"],
        appearAfterLevel: 8,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "despairClaw", chance: 0.1, opponentId: "warumonzaemon" },
            { kind: "equipment", key: "jumboCannon", chance: 0.1, opponentId: "jumbogamemon" },
            { kind: "inventory", key: "nightmareBurrito", chance: 1, opponentId: "warumonzaemon" },
            { kind: "inventory", key: "happyMushroom", chance: 0.4 },
        ],
    },
    factorial_town: {
        opponentId: "hiandromon",
        opponentIds: ["hiandromon", "grandlocomon", "gundramon"],
        appearAfterLevel: 8,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "cyberSword", chance: 0.1, opponentId: "hiandromon" },
            { kind: "inventory", key: "gearUp", chance: 0.1, opponentId: "grandlocomon" },
            { kind: "equipment", key: "arsenal", chance: 0.1, opponentId: "gundramon" },
            { kind: "inventory", key: "potion", chance: 0.4 },
        ],
    },
    mt_infinity: {
        opponentId: "mugendramon",
        appearAfterLevel: 10,
        chance: 0.2,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.45 },
            { kind: "meat", chance: 0.5 },
        ],
    },
    tropical_jungle: {
        opponentId: "centaurmon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: ["dino_region", "great_canyon"],
        drops: [
            { kind: "equipment", key: "ancientTablet", chance: 0.1 },
            { kind: "inventory", key: "happyMushroom", chance: 0.35 },
        ],
    },
    dino_region: {
        opponentId: "growmon",
        opponentIds: ["growmon", "mastertyranomon"],
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "growmonFang", chance: 0.2, opponentId: "growmon" },
            { kind: "meat", chance: 0.5 },
        ],
    },
    great_canyon: {
        opponentId: "orochimon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: ["freezeland"],
        drops: [
            { kind: "equipment", key: "infiniteHeads", chance: 0.1 },
            { kind: "meat", chance: 0.5 },
        ],
    },
    freezeland: {
        opponentId: "ancientmegatheriumon",
        opponentIds: ["ancientmegatheriumon", "blastmon"],
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: ["ice_sanctuary"],
        drops: [
            { kind: "equipment", key: "furCoat", chance: 0.1, opponentId: "ancientmegatheriumon" },
            { kind: "equipment", key: "infinityGauntlet", chance: 0.1, opponentId: "blastmon" },
            { kind: "inventory", key: "potion", chance: 0.35 },
        ],
    },
    ogremons_fortress: {
        opponentId: "ogremon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [{ kind: "meat", chance: 0.5 }],
    },
    ice_sanctuary: {
        opponentId: "angemon",
        appearAfterLevel: 8,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.4 },
        ],
    },
    beetle_land: {
        opponentId: "heraklekabuterimon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "equipment", key: "shellArmor", chance: 0.1 },
            { kind: "equipment", key: "carapaceArmor", chance: 0.25 },
        ],
    },
    greylords_mansion: {
        opponentId: "bakemon",
        appearAfterLevel: 7,
        chance: 0.25,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.4 },
        ],
    },
    cocytus: {
        opponentId: "bakemon",
        appearAfterLevel: 12,
        chance: 0.2,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.45 },
            { kind: "meat", chance: 0.5 },
        ],
    },
    kernel: {
        opponentId: "angemon",
        appearAfterLevel: 12,
        chance: 0.2,
        unlockZones: [],
        drops: [
            { kind: "inventory", key: "potion", chance: 0.45 },
            { kind: "meat", chance: 0.5 },
        ],
    },
};
/** Boss Digimon ids for a zone (supports multiple possible bosses). */
export function listZoneBossOpponentIds(boss) {
    if (!boss) {
        return [];
    }
    const multi = boss.opponentIds;
    if (Array.isArray(multi) && multi.length > 0) {
        return multi.map(String);
    }
    const single = boss.opponentId;
    return single ? [String(single)] : [];
}
/** Keep shared drops plus drops tagged for this opponent (or untagged). */
export function filterDropsForOpponent(drops, opponentId) {
    if (!drops?.length) {
        return [];
    }
    const id = opponentId ? String(opponentId) : "";
    return drops.filter((drop) => {
        const tagged = drop.opponentId;
        return !tagged || String(tagged) === id;
    });
}
