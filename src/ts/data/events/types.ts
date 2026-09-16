import type { ZoneId, TimeOfDay } from "../zones.js";
import { pickWeightedIndex } from "../encounters.js";

/**
 * Per-zone run rules (optional). Each zone can diverge: opening event, event ramp, etc.
 * Omit a zone (or leave `{}`) to use global defaults.
 */
export type ZoneRunRules = {
  /**
   * On zone entry, play this event before any wild fight.
   * - `true`: random event from the zone's event list
   * - `string`: specific event id from that list
   */
  startEvent?: true | string;
  /** Initial event chance after entry (default 0). Ignored for the forced start event itself. */
  eventChanceStart?: number;
  /** Added to event chance after each cleared encounter/event (default EVENT_CHANCE_STEP). */
  eventChanceStep?: number;
  /** Cap for event chance (default EVENT_CHANCE_MAX). */
  eventChanceMax?: number;
};

/**
 * Fill per zone as you design them. Empty object = global defaults, no opening event.
 */
export const ZONE_RUN_RULES: Partial<Record<ZoneId, ZoneRunRules>> = {
  mt_infinity: { startEvent: "mi_beta_closed" },
  ogremons_fortress: { startEvent: "of_beta_closed" },
  ice_sanctuary: { startEvent: "is_beta_closed" },
  greylords_mansion: { startEvent: "gm_beta_closed" },
};

export function getZoneRunRules(zoneId: string | null | undefined): ZoneRunRules {
  if (!zoneId) {
    return {};
  }
  return ZONE_RUN_RULES[zoneId as ZoneId] || {};
}

export const EVENT_CHANCE_STEP = 0.05;
export const EVENT_CHANCE_MAX = 0.3;

export type ZoneEventOutcome =
  | { type: "message"; text: string }
  | { type: "heal"; amount: number }
  | {
      /** Set current HP to at least this percent of max HP (does not exceed max). */
      type: "healToPercent";
      percent: number;
    }
  | { type: "damage"; amount: number }
  | {
      /** Lose a percent of max HP (rounded up, at least 1 if percent > 0). */
      type: "damagePercent";
      percent: number;
      /** Floor HP after damage (default 0 = can KO). Use 1 to never kill. */
      minHp?: number;
    }
  | { type: "meat"; amount: number }
  | { type: "weight"; amount: number }
  | { type: "training"; amount: number }
  | {
      /** Permanent combat attribute gains (persists for the Digimon). */
      type: "attributes";
      hp?: number;
      attack?: number;
      defense?: number;
      speed?: number;
      intelligence?: number;
    }
  | {
      type: "care";
      discipline?: number;
      happiness?: number;
      alignment?: number;
    }
  | {
      type: "reputation";
      amount: number;
    }
  | {
      type: "item";
      key: string;
      amount?: number;
      label?: string;
      /** If set, only grants when a 0–1 roll succeeds. */
      chance?: number;
    }
  | {
      /** Unlock equipment (no-op if already owned). */
      type: "equipment";
      key: string;
      label?: string;
    }
  | {
      /** Grant or spend a key item (`amount` negative to consume). */
      type: "keyItem";
      key: string;
      amount?: number;
      label?: string;
    }
  | {
      type: "unlockZones";
      zoneIds: string[];
    }
  | {
      type: "fight";
      opponentId: string;
      /** Literal combat stats. Ignored when `combatProfile` is set. */
      stats?: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        intelligence: number;
      };
      /** Use the wild table row for this stage × tier (event fights can ignore the current zone). */
      combatProfile?: {
        stage: "Baby I" | "Baby II" | "Child" | "Adult" | "Perfect" | "Ultimate";
        tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
      };
      rewardOnWin?: { key: string; amount?: number; label?: string };
      /** If true, winning this fight permanently removes the event from future runs. */
      banForeverOnWin?: boolean;
      /** Reputation gained if the player wins. */
      reputationOnWin?: number;
      /**
       * On win, increment a persistent win counter for this event id
       * (queryable as `eventWins.<eventId>`).
       */
      incrementEventWinsOnWin?: boolean;
      /** Optional post-win drop rolls (equipment/inventory/keyItem/meat). */
      dropsOnWin?: ReadonlyArray<{
        kind: "equipment" | "inventory" | "keyItem" | "meat";
        key?: string;
        chance: number;
        amount?: number;
      }>;
      /** Opponent starts the fight with all four buffs (or listed ones). */
      opponentStartBuffs?: true | ReadonlyArray<"fortified" | "protected" | "swift" | "focused">;
      /** Player starts the fight with listed debuffs. */
      /** Player starts the fight with listed debuffs or statuses. */
      playerStartDebuffs?: ReadonlyArray<"slow" | "weak" | "exposed" | "distracted" | "demoralized">;
    }
  | {
      /** Apply a zone-run battle buff (lasts until the run ends). */
      type: "zoneBuff";
      stat: "attack" | "defense" | "speed" | "intelligence";
    }
  | {
      /** Apply a zone-run battle debuff (lasts until the run ends). */
      type: "zoneDebuff";
      stat: "attack" | "defense" | "speed" | "intelligence";
    }
  | {
      /** Apply `count` random distinct zone-run debuffs (until the run ends). */
      type: "zoneDebuffRandom";
      count?: number;
    }
  | {
      /** Clear a zone-run battle debuff. */
      type: "clearZoneDebuff";
      stat: "attack" | "defense" | "speed" | "intelligence";
    }
  | {
      /** Start the zone boss battle (unlocks/drops only on win). */
      type: "bossFight";
      /** Optional override (e.g. transformed MadLeomon). */
      opponentId?: string;
    }
  | {
      /**
       * When this ending resolves, whether the event may appear again this run.
       * Overrides choice/event `repeatable`.
       */
      type: "eventRepeat";
      value: boolean;
    }
  | {
      /** Permanently ban this event across future runs (local save). */
      type: "banForever";
      /** If omitted, bans the currently active event. */
      eventId?: string;
    }
  | {
      /** Soft-end the current zone run and return to the hub (after Continue). */
      type: "endRun";
    }
  | {
      /** Spend 1 of any owned feed/inventory item (first with quantity > 0). */
      type: "spendAnyItem";
    }
  | {
      /** Spend 1 meat if owned, otherwise 1 Weight food item. */
      type: "spendAnyFood";
    }
  | {
      /** Spend 1 owned HP recovery item (Potion / Small / Medium / Large Heal). */
      type: "spendHealItem";
    }
  | {
      /** Spend 1 owned Stat Buff item (zone ATK/DEF/SPD/INT buff, or Gear Up). */
      type: "spendStatBuffItem";
    }
  | {
      /**
       * Steal 1 random owned inventory/feed item into the active event.
       * No-op (and no stolen flag) if the bag is empty.
       */
      type: "stealRandomInventoryItem";
    }
  | {
      /** Return the item stolen into the active event (if any). */
      type: "returnStolenItem";
    }
  | {
      /**
       * Roll a success check.
       * - `proc` (default): chance = (10 + combat stat) / 100
       * - `critical`: same formula as battle crits (10%, or 30% with type advantage)
       */
      type: "statCheck";
      mode?: "proc" | "critical";
      /** Used when mode is `proc` (default speed). */
      stat?: "speed" | "attack" | "defense" | "intelligence";
      /** Optional foe id for type-advantage crits (`mode: "critical"`). */
      opponentId?: string;
    }
  | {
      /** Grant 1 random inventory item from `keys` (owned pool entry). */
      type: "grantRandomItem";
      keys: readonly string[];
    }
  | {
      /**
       * Weighted loot roll.
       * `kind: "none"` = empty dig / no reward.
       */
      type: "grantWeightedLoot";
      entries: ReadonlyArray<{
        weight: number;
        kind: "inventory" | "keyItem" | "none";
        key?: string;
        amount?: number;
        label?: string;
      }>;
    }
  | {
      /** Queue another zone event to start on the next Continue (same zone). */
      type: "queueEvent";
      eventId: string;
    };

/**
 * Runtime snapshot used to evaluate event/choice conditions.
 * Built from the current run in game.ts.
 */
export type EventStatSnapshot = {
  discipline: number;
  happiness: number;
  alignment: number;
  reputation: number;
  meat: number;
  weight: number;
  training: number;
  lives: number;
  zoneLevel: number;
  battlesForEvolution: number;
  wins: number;
  battles: number;
  hp: number;
  /** Current adventure HP as percent of max (0–100). */
  hpPercent: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  /** Current Digimon stage name, e.g. "Child". */
  stage: string | null;
  /** Index in STAGE_ORDER, or -1. */
  stageIndex: number;
  element: string | null;
  attribute: string | null;
  playerId: string | null;
  inventory: Record<string, number>;
  equipment: Record<string, number>;
  keyItems: Record<string, number>;
  timeOfDay: TimeOfDay | null;
  /** 1 if the active event is holding a stolen inventory item. */
  hasStolenItem: number;
  /** Display name of the stolen item (for `{stolenItem}` text). */
  stolenItem: string;
  /**
   * Events permanently banned after a conclusive ending (`1` = banned).
   * Query with `banned.<eventId>`.
   */
  bannedEvents: Record<string, number>;
  /**
   * Events already finished as non-repeatable this run (`1` = consumed).
   * Query with `consumed.<eventId>` in conditions.
   */
  consumedEvents: Record<string, number>;
  /**
   * Persistent wins against sparring event opponents.
   * Query with `eventWins.<eventId>`.
   */
  eventWins: Record<string, number>;
  /**
   * Zone bosses already beaten by opponent id (`1` = defeated).
   * Query with `bossDefeated.<opponentId>` in conditions.
   */
  defeatedBossOpponents: Record<string, number>;
  /**
   * Map zones currently unlocked (`1` = unlocked).
   * Query with `unlocked.<zoneId>`.
   */
  unlockedZones: Record<string, number>;
  /** How many of Wizarmon's seven hell-ritual ingredients are owned (0–7). */
  demonLordIngredients: number;
  /** Owned ritual ingredient names, comma-separated. */
  demonLordIngredientNames: string;
};

export type EventCompareOp = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in" | "notIn";

/**
 * Condition DSL for events/choices.
 *
 * `stat` can be a snapshot field (`alignment`, `stageIndex`, `hp`…)
 * or a dotted path:
 * - `inventory.potion`
 * - `equipment.carapaceArmor`
 * - `keyItems.mansionKey`
 * - `consumed.nf_banker_agumon` (1 if that event was resolved and won't appear again)
 * - `banned.ft_giromon_rampage` (1 if that event was banned forever)
 * - `bossDefeated.warumonzaemon` (1 if that boss opponent was beaten)
 * - `unlocked.toy_town` (1 if that zone is unlocked)
 *
 * Examples:
 *   { stat: "alignment", op: "lte", value: -1 }
 *   { stat: "stageIndex", op: "gte", value: 3 } // Adult+
 *   { stat: "stage", op: "in", value: ["Adult", "Perfect"] }
 *   { stat: "consumed.nf_banker_agumon", op: "eq", value: 1 }
 *   { all: [{ stat: "reputation", op: "gte", value: 1 }, { stat: "meat", op: "gte", value: 2 }] }
 *   { any: [{ stat: "happiness", op: "gte", value: 3 }, { stat: "discipline", op: "gte", value: 3 }] }
 *   { not: { stat: "inventory.potion", op: "gte", value: 1 } }
 */
export type EventCondition =
  | {
      stat: string;
      op?: EventCompareOp;
      value: number | string | boolean | readonly (string | number | boolean)[];
    }
  | { all: readonly EventCondition[] }
  | { any: readonly EventCondition[] }
  | { not: EventCondition };

function readEventStatValue(
  snapshot: EventStatSnapshot,
  statPath: string
): number | string | boolean | null {
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
  const direct = (snapshot as Record<string, unknown>)[path];
  if (typeof direct === "number" || typeof direct === "string" || typeof direct === "boolean") {
    return direct;
  }
  if (direct == null) {
    return null;
  }
  return String(direct);
}

function compareEventStat(
  left: number | string | boolean | null,
  op: EventCompareOp,
  right: number | string | boolean | readonly (string | number | boolean)[]
): boolean {
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

export function evaluateEventCondition(
  condition: EventCondition | EventCondition[] | undefined,
  snapshot: EventStatSnapshot
): boolean {
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

export function eventPassesRequirements(
  gate: {
    require?: EventCondition | EventCondition[];
    unless?: EventCondition | EventCondition[];
    /**
     * All of these event ids must already be consumed this run
     * (finished with a non-repeatable ending).
     */
    requireConsumedEvents?: readonly string[];
    /** At least one of these event ids must already be consumed this run. */
    requireAnyConsumedEvents?: readonly string[];
  } | null | undefined,
  snapshot: EventStatSnapshot
): boolean {
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

/**
 * Conditional copy for event text / choice labels.
 * First matching variant wins; otherwise the base string is used.
 * Strings may include `{stat}` placeholders, e.g. `"Alignment {alignment}, stage {stage}"`.
 */
export type EventConditionalText = {
  when?: EventCondition | EventCondition[];
  unless?: EventCondition | EventCondition[];
  text: string;
};

/** Replace `{field}` / `{inventory.potion}` tokens from the current snapshot. */
export function interpolateEventText(
  template: string,
  snapshot: EventStatSnapshot
): string {
  return String(template || "").replace(/\{([a-zA-Z0-9_.]+)\}/g, (_match, key: string) => {
    const value = readEventStatValue(snapshot, key);
    return value == null ? "" : String(value);
  });
}

/**
 * Pick the first variant whose `when`/`unless` pass; else `fallback`.
 * Always runs placeholder interpolation.
 */
export function resolveConditionalText(
  fallback: string,
  variants: readonly EventConditionalText[] | undefined,
  snapshot: EventStatSnapshot
): string {
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

/** One dialogue step inside an event (root uses the event's text/choices). */
export type ZoneEventDialogueNode = {
  /** Optional speaker override for this step. */
  speakerId?: string;
  text: string;
  /** Alternate lines shown when `when`/`unless` match (first hit wins). */
  textVariants?: EventConditionalText[];
  choices: ZoneEventChoice[];
  /** Applied once when this node is shown (e.g. return a stolen item). */
  enterOutcomes?: ZoneEventOutcome[];
  /** Optional gate for entering this node (e.g. via `next`). */
  require?: EventCondition | EventCondition[];
  unless?: EventCondition | EventCondition[];
  requireConsumedEvents?: readonly string[];
  requireAnyConsumedEvents?: readonly string[];
};

export type ZoneEventChoice = {
  label: string;
  /** Alternate labels by current stats (first matching variant wins). */
  labelVariants?: EventConditionalText[];
  /** Legacy meat check; also expressible as require `{ stat: "meat", op: "gte", value: n }`. */
  requireMeat?: number;
  /** Legacy key-item check; also expressible as require `{ stat: "keyItems.<key>", op: "gte", value: 1 }`. */
  requireKeyItem?: string;
  /** Need at least one countable inventory/feed item. */
  requireAnyInventoryItem?: boolean;
  /** Need meat or at least one Weight food item. */
  requireAnyFood?: boolean;
  /** Need at least one HP recovery item (Potion or Heal). */
  requireAnyHealItem?: boolean;
  /** Need at least one Stat Buff item. */
  requireAnyStatBuffItem?: boolean;
  /** Must pass for the choice to be available. */
  require?: EventCondition | EventCondition[];
  /** If this passes, the choice is blocked. */
  unless?: EventCondition | EventCondition[];
  requireConsumedEvents?: readonly string[];
  requireAnyConsumedEvents?: readonly string[];
  /**
   * When requirements fail:
   * - `hide` (default): choice not shown
   * - `disable`: shown greyed-out with optional hint
   */
  whenFail?: "hide" | "disable";
  /** Tooltip / title when disabled by requirements. */
  disabledHint?: string;
  /**
   * If this choice ends the event: can it appear again this run?
   * Overrides the event-level `repeatable`. Outcome `eventRepeat` overrides this.
   */
  repeatable?: boolean;
  /** Optional override for speaker reaction animation. */
  mood?: "idle" | "happy" | "angry";
  outcomes?: ZoneEventOutcome[];
  /**
   * Continue the event at another dialogue node instead of ending.
   * Root node id is `"start"`; other ids live under `nodes`.
   */
  next?: string;
};

export type ZoneEventDefinition = {
  id: string;
  speakerId: string;
  title?: string;
  text: string;
  /** Alternate root lines by current stats (first matching variant wins). */
  textVariants?: EventConditionalText[];
  choices: ZoneEventChoice[];
  /**
   * Extra dialogue steps keyed by id.
   * Choices can jump here with `next: "nodeId"`.
   */
  nodes?: Record<string, ZoneEventDialogueNode>;
  /** Applied once when the event first opens (root). */
  startOutcomes?: ZoneEventOutcome[];
  /** Event only enters the random pool if this passes. */
  require?: EventCondition | EventCondition[];
  unless?: EventCondition | EventCondition[];
  /**
   * Only appear after these events were finished as non-repeatable this run.
   * Same meaning as requiring `consumed.<id> == 1` for each.
   */
  requireConsumedEvents?: readonly string[];
  /** Appear if at least one of these events was already consumed this run. */
  requireAnyConsumedEvents?: readonly string[];
  /** Relative weight among eligible events (default 1). */
  weight?: number;
  /**
   * If true, this event never enters the random encounter pool.
   * It can only start via `{ type: "queueEvent", eventId }`.
   */
  forceOnly?: boolean;
  /**
   * Default for this event when an ending does not set `repeatable` / `eventRepeat`.
   * `true` (default): may appear again this run.
   * `false`: after any completed ending, blocked for the rest of the run.
   */
  repeatable?: boolean;
};

export const EVENT_ROOT_NODE_ID = "start";

export function getZoneEventNode(
  eventDef: ZoneEventDefinition,
  nodeId: string = EVENT_ROOT_NODE_ID
): ZoneEventDialogueNode {
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
export function forEachZoneEventChoice(
  eventDef: ZoneEventDefinition,
  visit: (choice: ZoneEventChoice, nodeId: string) => void
) {
  const seen = new Set<string>();
  const walk = (nodeId: string) => {
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

export function filterEligibleZoneEvents(
  events: readonly ZoneEventDefinition[],
  snapshot: EventStatSnapshot,
  options?: { excludeIds?: ReadonlySet<string> | readonly string[] }
): ZoneEventDefinition[] {
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

export function pickWeightedZoneEvent(
  events: readonly ZoneEventDefinition[],
  snapshot: EventStatSnapshot,
  options?: { excludeIds?: ReadonlySet<string> | readonly string[] }
): ZoneEventDefinition | null {
  const eligible = filterEligibleZoneEvents(events, snapshot, options);
  if (eligible.length === 0) {
    return null;
  }
  const index = pickWeightedIndex(eligible.map((event) => Number(event.weight) || 1));
  return index >= 0 ? eligible[index] : eligible[0];
}
