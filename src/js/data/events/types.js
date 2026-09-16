import { pickWeightedIndex } from "../encounters.js";
/**
 * Fill per zone as you design them. Empty object = global defaults, no opening event.
 */
export const ZONE_RUN_RULES = {
    mt_infinity: { startEvent: "mi_beta_closed" },
    ogremons_fortress: { startEvent: "of_beta_closed" },
    ice_sanctuary: { startEvent: "is_beta_closed" },
    greylords_mansion: { startEvent: "gm_beta_closed" },
};
export function getZoneRunRules(zoneId) {
    if (!zoneId) {
        return {};
    }
    return ZONE_RUN_RULES[zoneId] || {};
}
export const EVENT_CHANCE_STEP = 0.05;
export const EVENT_CHANCE_MAX = 0.3;
function readEventStatValue(snapshot, statPath) {
    const path = String(statPath || "").trim();
    if (!path) {
        return null;
    }
    if (path.startsWith("inventory.")) {
        const key = path.slice("inventory.".length);
        return Number(snapshot.inventory[key]) || 0;
    }
    if (path.startsWith("equipment.")) {
        const key = path.slice("equipment.".length);
        return Number(snapshot.equipment[key]) || 0;
    }
    if (path.startsWith("keyItems.")) {
        const key = path.slice("keyItems.".length);
        return Number(snapshot.keyItems[key]) || 0;
    }
    if (path.startsWith("consumed.")) {
        const key = path.slice("consumed.".length);
        return Number(snapshot.consumedEvents[key]) || 0;
    }
    if (path.startsWith("banned.")) {
        const key = path.slice("banned.".length);
        return Number(snapshot.bannedEvents[key]) || 0;
    }
    if (path.startsWith("eventWins.")) {
        const key = path.slice("eventWins.".length);
        return Number(snapshot.eventWins[key]) || 0;
    }
    if (path.startsWith("bossDefeated.")) {
        const key = path.slice("bossDefeated.".length);
        return Number(snapshot.defeatedBossOpponents[key]) || 0;
    }
    if (path.startsWith("unlocked.")) {
        const key = path.slice("unlocked.".length);
        return Number(snapshot.unlockedZones[key]) || 0;
    }
    const direct = snapshot[path];
    if (typeof direct === "number" || typeof direct === "string" || typeof direct === "boolean") {
        return direct;
    }
    if (direct == null) {
        return null;
    }
    return String(direct);
}
function compareEventStat(left, op, right) {
    if (op === "in" || op === "notIn") {
        const list = Array.isArray(right) ? right : [right];
        const hit = list.some((entry) => entry === left || String(entry) === String(left));
        return op === "in" ? hit : !hit;
    }
    if (left == null) {
        return false;
    }
    const cmp = op || "eq";
    if (typeof left === "number" && typeof right === "number") {
        switch (cmp) {
            case "eq":
                return left === right;
            case "neq":
                return left !== right;
            case "lt":
                return left < right;
            case "lte":
                return left <= right;
            case "gt":
                return left > right;
            case "gte":
                return left >= right;
            default:
                return false;
        }
    }
    const leftText = String(left);
    const rightText = String(right);
    switch (cmp) {
        case "eq":
            return leftText === rightText;
        case "neq":
            return leftText !== rightText;
        case "lt":
            return leftText < rightText;
        case "lte":
            return leftText <= rightText;
        case "gt":
            return leftText > rightText;
        case "gte":
            return leftText >= rightText;
        default:
            return false;
    }
}
export function evaluateEventCondition(condition, snapshot) {
    if (!condition) {
        return true;
    }
    if (Array.isArray(condition)) {
        return condition.every((entry) => evaluateEventCondition(entry, snapshot));
    }
    if ("all" in condition) {
        return (condition.all || []).every((entry) => evaluateEventCondition(entry, snapshot));
    }
    if ("any" in condition) {
        const list = condition.any || [];
        return list.length === 0 ? true : list.some((entry) => evaluateEventCondition(entry, snapshot));
    }
    if ("not" in condition) {
        return !evaluateEventCondition(condition.not, snapshot);
    }
    const value = readEventStatValue(snapshot, condition.stat);
    return compareEventStat(value, condition.op || "eq", condition.value);
}
export function eventPassesRequirements(gate, snapshot) {
    if (!gate) {
        return true;
    }
    if (!evaluateEventCondition(gate.require, snapshot)) {
        return false;
    }
    if (gate.unless && evaluateEventCondition(gate.unless, snapshot)) {
        return false;
    }
    const requiredAll = gate.requireConsumedEvents || [];
    if (requiredAll.length > 0) {
        const ok = requiredAll.every((id) => (Number(snapshot.consumedEvents[String(id)]) || 0) > 0);
        if (!ok) {
            return false;
        }
    }
    const requiredAny = gate.requireAnyConsumedEvents || [];
    if (requiredAny.length > 0) {
        const ok = requiredAny.some((id) => (Number(snapshot.consumedEvents[String(id)]) || 0) > 0);
        if (!ok) {
            return false;
        }
    }
    return true;
}
/** Replace `{field}` / `{inventory.potion}` tokens from the current snapshot. */
export function interpolateEventText(template, snapshot) {
    return String(template || "").replace(/\{([a-zA-Z0-9_.]+)\}/g, (_match, key) => {
        const value = readEventStatValue(snapshot, key);
        return value == null ? "" : String(value);
    });
}
/**
 * Pick the first variant whose `when`/`unless` pass; else `fallback`.
 * Always runs placeholder interpolation.
 */
export function resolveConditionalText(fallback, variants, snapshot) {
    for (const variant of variants || []) {
        if (!variant || typeof variant.text !== "string") {
            continue;
        }
        if (eventPassesRequirements(variant, snapshot)) {
            return interpolateEventText(variant.text, snapshot);
        }
    }
    return interpolateEventText(fallback || "", snapshot);
}
export const EVENT_ROOT_NODE_ID = "start";
export function getZoneEventNode(eventDef, nodeId = EVENT_ROOT_NODE_ID) {
    if (!nodeId || nodeId === EVENT_ROOT_NODE_ID) {
        return {
            speakerId: eventDef.speakerId,
            text: eventDef.text,
            textVariants: eventDef.textVariants,
            choices: eventDef.choices || [],
        };
    }
    const node = eventDef.nodes?.[nodeId];
    if (!node) {
        return {
            speakerId: eventDef.speakerId,
            text: eventDef.text,
            textVariants: eventDef.textVariants,
            choices: eventDef.choices || [],
        };
    }
    return {
        speakerId: node.speakerId || eventDef.speakerId,
        text: node.text,
        textVariants: node.textVariants,
        choices: node.choices || [],
        enterOutcomes: node.enterOutcomes,
        require: node.require,
        unless: node.unless,
        requireConsumedEvents: node.requireConsumedEvents,
        requireAnyConsumedEvents: node.requireAnyConsumedEvents,
    };
}
/** Walk every choice in the event tree (root + nodes). */
export function forEachZoneEventChoice(eventDef, visit) {
    const seen = new Set();
    const walk = (nodeId) => {
        if (seen.has(nodeId)) {
            return;
        }
        seen.add(nodeId);
        const node = getZoneEventNode(eventDef, nodeId);
        (node.choices || []).forEach((choice) => {
            visit(choice, nodeId);
            if (choice.next) {
                walk(choice.next);
            }
        });
    };
    walk(EVENT_ROOT_NODE_ID);
}
export function filterEligibleZoneEvents(events, snapshot, options) {
    const excluded = options?.excludeIds
        ? options.excludeIds instanceof Set
            ? options.excludeIds
            : new Set(options.excludeIds)
        : null;
    return (events || []).filter((event) => {
        if (excluded?.has(event.id)) {
            return false;
        }
        if (event.forceOnly) {
            return false;
        }
        return eventPassesRequirements(event, snapshot);
    });
}
export function pickWeightedZoneEvent(events, snapshot, options) {
    const eligible = filterEligibleZoneEvents(events, snapshot, options);
    if (eligible.length === 0) {
        return null;
    }
    const index = pickWeightedIndex(eligible.map((event) => Number(event.weight) || 1));
    return index >= 0 ? eligible[index] : eligible[0];
}
