export function getStageKey(stage) {
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
export function normalizeBattleType(character) {
    const raw = String(character?.element || character?.attribute || "")
        .trim()
        .toLowerCase();
    if (raw === "vaccine" || raw === "virus" || raw === "data") {
        return raw;
    }
    return "";
}
export function getTypeProjectileKey(element) {
    const normalized = (element || "").toLowerCase();
    if (normalized === "vaccine" || normalized === "virus" || normalized === "data") {
        return normalized;
    }
    return "vaccine";
}
export function getCharacterProjectile(character) {
    const sprite = character?.specialAttackSprite;
    if (sprite && String(sprite).trim()) {
        return String(sprite);
    }
    return null;
}
export function getElementProjectile(element, _stageKey) {
    const type = getTypeProjectileKey(element);
    return `data/ui/projectiles/type_${type}.png`;
}
export function getSpecialProjectilePath(src) {
    const trimmed = String(src || "").trim();
    if (!trimmed) {
        return trimmed;
    }
    if (/_special\.(png|svg)$/i.test(trimmed)) {
        return trimmed;
    }
    return trimmed.replace(/(\.(?:png|svg))$/i, "_special$1");
}
export function getSpecialProjectile(attacker, _attack) {
    const base = getCharacterProjectile(attacker) || getElementProjectile(attacker.element);
    return getSpecialProjectilePath(base);
}
export function getAttackProjectile(attacker, attack) {
    const base = getCharacterProjectile(attacker) || getElementProjectile(attacker.element);
    if (attack?.name === "special attack") {
        return getSpecialProjectilePath(base);
    }
    return base;
}
/** Vaccine > Virus > Data > Vaccine */
export function hasTypeAdvantage(attacker, defender) {
    const attackerType = normalizeBattleType(attacker);
    const defenderType = normalizeBattleType(defender);
    if (!attackerType || !defenderType) {
        return false;
    }
    const advantageMap = {
        vaccine: "virus",
        virus: "data",
        data: "vaccine",
    };
    return advantageMap[attackerType] === defenderType;
}
export function getCriticalChance(attacker, defender) {
    return hasTypeAdvantage(attacker, defender) ? 0.3 : 0.1;
}
