import * as dom from "../dom.js";
import { EQUIPMENT_CONFIG, formatEquipmentEffect } from "../data/equipment.js";
import {
  INVENTORY_CONFIG,
  KEY_ITEMS_CONFIG,
  getInventoryItemCategories,
  type InventoryItemCategory,
} from "../data/inventory.js";
import { STAGE_ORDER } from "../data/stages.js";
import {
  ZONE_BOSSES,
  ZONE_CONFIG,
  ZONE_ENCOUNTERS,
  ZONE_EVENTS,
  EVENT_ROOT_NODE_ID,
  forEachZoneEventChoice,
  getZoneEventNode,
  listBossDialogueCharacterIds,
  listZoneBossOpponentIds,
  listZoneEncounterIds,
  type EventCondition,
  type ZoneEventChoice,
  type ZoneEventDefinition,
  type ZoneEventOutcome,
} from "../constants.js";
import { getSpecialProjectile } from "../combat/projectiles.js";
import {
  resolveUniqueEffect,
  uniqueBuffIcon,
  uniqueDebuffIcon,
} from "../combat/uniqueEffects.js";
import { getCharacterCombatIdentity } from "../data/combatBalance.js";
import { state, type Character } from "../state.js";

type DexUsageFilter = "all" | "unused" | "wild" | "event" | "boss" | "playable";
type DebugDexRoles = { boss: string[]; wild: string[]; event: string[]; playable: boolean };

const DEX_FILTERS: ReadonlyArray<{ id: DexUsageFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unused", label: "Unused" },
  { id: "wild", label: "Wild" },
  { id: "event", label: "Event" },
  { id: "boss", label: "Boss" },
  { id: "playable", label: "Playable" },
];

let dexUsageFilter: DexUsageFilter = "all";

const CLASSIC_SPECIAL_STATUS: Record<string, { label: string; icon: string }> = {
  asleep: { label: "Asleep", icon: "data/ui/status_asleep.png" },
  poisoned: { label: "Poisoned", icon: "data/ui/status_poisoned.png" },
  poison: { label: "Poisoned", icon: "data/ui/status_poisoned.png" },
  confused: { label: "Confused", icon: "data/ui/status_confused.png" },
  confuse: { label: "Confused", icon: "data/ui/status_confused.png" },
  demoralized: { label: "Demoralized", icon: "data/ui/status_demoralized.png" },
  silenced: { label: "Silenced", icon: "data/ui/status_silenced.png" },
  blinded: { label: "Blinded", icon: "data/ui/status_blinded.png" },
  inverted: { label: "Inverted", icon: "data/ui/status_inverted.png" },
  burned: { label: "Burned", icon: "data/ui/status_burned.png" },
  burn: { label: "Burned", icon: "data/ui/status_burned.png" },
  distracted: { label: "Distracted", icon: "data/ui/status_distracted.png" },
  weak: { label: "Weak", icon: "data/ui/status_weak.png" },
  exposed: { label: "Exposed", icon: "data/ui/status_exposed.png" },
  slow: { label: "Slow", icon: "data/ui/status_slow.png" },
  fortified: { label: "Fortified", icon: "data/ui/status_fortified.png" },
  protected: { label: "Protected", icon: "data/ui/status_protected.png" },
  swift: { label: "Swift", icon: "data/ui/status_swift.png" },
  focused: { label: "Focused", icon: "data/ui/status_focused.png" },
};

function resolveDexSpecialStatus(raw: string): { label: string; icon: string | null } {
  const unique = resolveUniqueEffect(raw);
  if (unique?.kind === "buff") {
    return { label: unique.label, icon: uniqueBuffIcon(unique.id) };
  }
  if (unique?.kind === "debuff") {
    return { label: unique.label, icon: uniqueDebuffIcon(unique.id) };
  }
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");
  const classic = CLASSIC_SPECIAL_STATUS[key] || CLASSIC_SPECIAL_STATUS[String(raw || "").trim().toLowerCase()];
  if (classic) {
    return classic;
  }
  const fallback = String(raw || "").trim();
  if (!fallback || fallback.toLowerCase() === "none") {
    return { label: "—", icon: null };
  }
  return { label: fallback.charAt(0).toUpperCase() + fallback.slice(1), icon: null };
}

function getDexSpecialInfo(character: Character): {
  name: string;
  projectile: string;
  statusLabel: string;
  statusIcon: string | null;
} {
  const fromField = String(character.specialStatus || "").trim();
  const specialAttack = (character.attacks || []).find(
    (attack) => String(attack?.name || "").toLowerCase() === "special attack"
  );
  const fromAttack = String(specialAttack?.status || "").trim();
  const rawStatus =
    fromField && fromField.toLowerCase() !== "none"
      ? fromField
      : fromAttack && fromAttack.toLowerCase() !== "none"
        ? fromAttack
        : "demoralized";
  const status = resolveDexSpecialStatus(rawStatus);
  return {
    name: String(character.specialAttackName || "Special Attack").trim() || "Special Attack",
    projectile: getSpecialProjectile(character),
    statusLabel: status.label,
    statusIcon: status.icon,
  };
}

function getDexTags(roles: DebugDexRoles): string[] {
  const tags: string[] = [];
  if (roles.playable) {
    tags.push("Playable");
  }
  if (roles.boss.length) {
    tags.push("Boss");
  }
  if (roles.wild.length) {
    tags.push("Wild");
  }
  if (roles.event.length) {
    tags.push("Event");
  }
  if (!tags.length) {
    tags.push("Unused");
  }
  return tags;
}

function matchesDexFilter(roles: DebugDexRoles, filter: DexUsageFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "unused") {
    return !roles.playable && !roles.boss.length && !roles.wild.length && !roles.event.length;
  }
  if (filter === "wild") {
    return roles.wild.length > 0;
  }
  if (filter === "event") {
    return roles.event.length > 0;
  }
  if (filter === "boss") {
    return roles.boss.length > 0;
  }
  return roles.playable;
}

export function renderDebugDex() {
  if (!dom.dexGrid) {
    return;
  }
  const usage = buildDebugDexUsageIndex();
  const stageRank = (stage: string | undefined) => {
    const index = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
    return index >= 0 ? index : 99;
  };
  const list = [...state.characters]
    .filter((char) => Boolean(char.spriteFramesPath))
    .sort((a, b) => {
      const stageDiff = stageRank(a.stage) - stageRank(b.stage);
      if (stageDiff !== 0) {
        return stageDiff;
      }
      return String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
    });

  const counts: Record<DexUsageFilter, number> = {
    all: list.length,
    unused: 0,
    wild: 0,
    event: 0,
    boss: 0,
    playable: 0,
  };
  list.forEach((character) => {
    const roles = usage.get(String(character.id || "")) || {
      boss: [],
      wild: [],
      event: [],
      playable: false,
    };
    if (matchesDexFilter(roles, "unused")) {
      counts.unused += 1;
    }
    if (matchesDexFilter(roles, "wild")) {
      counts.wild += 1;
    }
    if (matchesDexFilter(roles, "event")) {
      counts.event += 1;
    }
    if (matchesDexFilter(roles, "boss")) {
      counts.boss += 1;
    }
    if (matchesDexFilter(roles, "playable")) {
      counts.playable += 1;
    }
  });

  if (dom.dexFilters) {
    dom.dexFilters.innerHTML = "";
    DEX_FILTERS.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `dex-filter dex-filter-${entry.id}`;
      if (dexUsageFilter === entry.id) {
        button.classList.add("is-active");
      }
      button.textContent = `${entry.label} (${counts[entry.id]})`;
      button.addEventListener("click", () => {
        if (dexUsageFilter === entry.id) {
          return;
        }
        dexUsageFilter = entry.id;
        renderDebugDex();
      });
      dom.dexFilters.append(button);
    });
  }

  const visible = list.filter((character) => {
    const roles = usage.get(String(character.id || "")) || {
      boss: [],
      wild: [],
      event: [],
      playable: false,
    };
    return matchesDexFilter(roles, dexUsageFilter);
  });

  if (dom.dexSubtitle) {
    const filterLabel = DEX_FILTERS.find((entry) => entry.id === dexUsageFilter)?.label || "All";
    dom.dexSubtitle.textContent =
      dexUsageFilter === "all"
        ? `${visible.length} Digimon. Debug only.`
        : `${visible.length} ${filterLabel} · ${list.length} total. Debug only.`;
  }

  dom.dexGrid.innerHTML = "";
  visible.forEach((character) => {
    const number = list.indexOf(character) + 1;
    const numberLabel = String(number).padStart(3, "0");
    const id = String(character.id || "");
    const roles = usage.get(id) || { boss: [], wild: [], event: [], playable: false };
    const tags = getDexTags(roles);

    const card = document.createElement("div");
    card.className = "dex-entry";
    const special = getDexSpecialInfo(character);
    const tooltipParts = [
      `#${numberLabel} · ${character.name || character.id} · ${character.stage || "?"}`,
      `id: ${id || "—"}`,
      `Special: ${special.name} (${special.statusLabel})`,
      roles.playable ? "Playable: Botamon egg / current evolution line" : "",
      roles.boss.length ? `Boss: ${roles.boss.join(", ")}` : "",
      roles.wild.length ? `Wild: ${roles.wild.join(", ")}` : "",
      roles.event.length ? `Event: ${roles.event.join(", ")}` : "",
    ].filter(Boolean);
    card.title = tooltipParts.join("\n");

    const numberBadge = document.createElement("span");
    numberBadge.className = "dex-entry-number";
    numberBadge.textContent = `#${numberLabel}`;
    card.append(numberBadge);

    const frame = document.createElement("div");
    frame.className = "character-sprite-frame dex-sprite-frame";

    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${character.spriteFramesPath}/frame_00.png`;
    sprite.alt = character.name ? `${character.name} sprite` : "Sprite";
    sprite.dataset.basePath = `data/${character.spriteFramesPath}`;
    sprite.loading = "lazy";
    frame.append(sprite);

    const label = document.createElement("div");
    label.className = "dex-entry-label";
    const tagHtml = tags
      .map((tag) => `<em class="dex-tag dex-tag-${tag.toLowerCase()}">${tag}</em>`)
      .join("");
    label.innerHTML = `<strong><span class="dex-entry-index">${numberLabel}</span> ${
      character.name || character.id || "???"
    }</strong><span>${character.stage || "—"}</span><div class="dex-tags">${tagHtml}</div>`;

    const specialRow = document.createElement("div");
    specialRow.className = "dex-special";
    const specialName = document.createElement("span");
    specialName.className = "dex-special-name";
    if (special.projectile) {
      const proj = document.createElement("img");
      proj.className = "dex-special-proj";
      proj.src = special.projectile;
      proj.alt = "";
      proj.loading = "lazy";
      specialName.append(proj);
    }
    specialName.append(document.createTextNode(special.name));
    specialRow.append(specialName);
    const typeRow = document.createElement("div");
    typeRow.className = "dex-special-type";
    if (special.statusIcon) {
      const statusIcon = document.createElement("img");
      statusIcon.src = special.statusIcon;
      statusIcon.alt = "";
      statusIcon.loading = "lazy";
      typeRow.append(statusIcon);
    }
    const typeLabel = document.createElement("span");
    typeLabel.textContent = special.statusLabel;
    typeRow.append(typeLabel);
    specialRow.append(typeRow);

    card.append(frame, label, specialRow);
    dom.dexGrid.append(card);
  });
}

function pushUniqueZone(list: string[], zoneName: string) {
  if (!list.includes(zoneName)) {
    list.push(zoneName);
  }
}

/** Digimon obtainable now: Beta Egg (Botamon) and its evolution tree. */
export function getPlayableCharacterIds(): Set<string> {
  const byId = new Map(
    state.characters.map((character) => [String(character.id || ""), character] as const)
  );
  const playableQueue = ["botamon"];
  const seenPlayable = new Set<string>();
  while (playableQueue.length) {
    const id = String(playableQueue.pop() || "");
    if (!id || seenPlayable.has(id)) {
      continue;
    }
    seenPlayable.add(id);
    const character = byId.get(id);
    const next = Array.isArray(character?.evolvesTo) ? character.evolvesTo : [];
    next.forEach((evolvedId) => {
      playableQueue.push(String(evolvedId));
    });
  }
  return seenPlayable;
}

function buildDebugDexUsageIndex(): Map<string, DebugDexRoles> {
  const map = new Map<string, DebugDexRoles>();
  const ensure = (id: string): DebugDexRoles => {
    const key = String(id || "");
    if (!key) {
      return { boss: [], wild: [], event: [], playable: false };
    }
    let entry = map.get(key);
    if (!entry) {
      entry = { boss: [], wild: [], event: [], playable: false };
      map.set(key, entry);
    }
    return entry;
  };

  getPlayableCharacterIds().forEach((id) => {
    ensure(id).playable = true;
  });

  ZONE_CONFIG.forEach((zone) => {
    const zoneId = zone.id;
    const zoneName = zone.name;
    if (zoneId in ZONE_BOSSES) {
      const boss = ZONE_BOSSES[zoneId as keyof typeof ZONE_BOSSES];
      listZoneBossOpponentIds(boss).forEach((id) => {
        pushUniqueZone(ensure(id).boss, zoneName);
      });
    }
    listBossDialogueCharacterIds(zoneId).forEach((id) => {
      pushUniqueZone(ensure(id).boss, zoneName);
    });
    if (zoneId in ZONE_ENCOUNTERS) {
      const config = ZONE_ENCOUNTERS[zoneId as keyof typeof ZONE_ENCOUNTERS];
      listZoneEncounterIds(config).forEach((id) => {
        pushUniqueZone(ensure(id).wild, zoneName);
      });
    }
    (ZONE_EVENTS[zoneId] || []).forEach((eventDef) => {
      if (eventDef.speakerId) {
        pushUniqueZone(ensure(String(eventDef.speakerId)).event, zoneName);
      }
      Object.values(eventDef.nodes || {}).forEach((node) => {
        if (node?.speakerId) {
          pushUniqueZone(ensure(String(node.speakerId)).event, zoneName);
        }
      });
      forEachZoneEventChoice(eventDef, (choice) => {
        (choice.outcomes || []).forEach((outcome) => {
          if (outcome?.type === "fight" && outcome.opponentId) {
            pushUniqueZone(ensure(String(outcome.opponentId)).event, zoneName);
          }
          if (outcome?.type === "bossFight" && outcome.opponentId) {
            pushUniqueZone(ensure(String(outcome.opponentId)).boss, zoneName);
          }
        });
      });
    });
  });

  return map;
}

type DebugItemFilter =
  | "all"
  | "usable"
  | "heal"
  | "debuff"
  | "statDebuff"
  | "buff"
  | "statBuff"
  | "equipment"
  | "key";

const DEBUG_ITEM_FILTERS: ReadonlyArray<{ id: DebugItemFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "usable", label: "Usable" },
  { id: "heal", label: "Heal" },
  { id: "debuff", label: "Debuff" },
  { id: "statDebuff", label: "Stat Debuff" },
  { id: "buff", label: "Buff" },
  { id: "statBuff", label: "Stat Buff" },
  { id: "equipment", label: "Equipment" },
  { id: "key", label: "Key Items" },
];

let debugItemFilter: DebugItemFilter = "all";

type DebugItemCard = {
  kind: "usable" | "equipment" | "key";
  categories: InventoryItemCategory[];
  name: string;
  asset: string;
  alt: string;
  typeLabel: string;
  desc: string;
};

function matchesDebugItemFilter(card: DebugItemCard, filter: DebugItemFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "usable") {
    return card.kind === "usable";
  }
  if (filter === "equipment") {
    return card.kind === "equipment";
  }
  if (filter === "key") {
    return card.kind === "key";
  }
  return card.kind === "usable" && card.categories.includes(filter);
}

function listDebugItemCards(): DebugItemCard[] {
  const cards: DebugItemCard[] = [
    {
      kind: "usable",
      categories: ["other"],
      name: "Meat",
      asset: "data/ui/food_meat.png",
      alt: "Meat",
      typeLabel: "Usable Item",
      desc: "Meat: +1 Weight.",
    },
  ];
  INVENTORY_CONFIG.forEach((item) => {
    cards.push({
      kind: "usable",
      categories: getInventoryItemCategories(item),
      name: item.name,
      asset: item.asset,
      alt: item.alt,
      typeLabel: "Usable Item",
      desc: item.label || item.name,
    });
  });
  EQUIPMENT_CONFIG.forEach((item) => {
    const effect = formatEquipmentEffect(item);
    cards.push({
      kind: "equipment",
      categories: [],
      name: item.name,
      asset: item.asset,
      alt: item.alt,
      typeLabel: "Equipment",
      desc: effect,
    });
  });
  KEY_ITEMS_CONFIG.forEach((item) => {
    cards.push({
      kind: "key",
      categories: [],
      name: item.name,
      asset: item.asset,
      alt: item.alt,
      typeLabel: "Key Item",
      desc: item.label || item.name,
    });
  });
  return cards;
}

export function renderDebugItems() {
  if (!dom.itemsGrid) {
    return;
  }
  const all = listDebugItemCards();
  const visible = all.filter((card) => matchesDebugItemFilter(card, debugItemFilter));
  const counts: Record<DebugItemFilter, number> = {
    all: all.length,
    usable: all.filter((card) => card.kind === "usable").length,
    heal: all.filter((card) => card.kind === "usable" && card.categories.includes("heal")).length,
    debuff: all.filter((card) => card.kind === "usable" && card.categories.includes("debuff")).length,
    statDebuff: all.filter((card) => card.kind === "usable" && card.categories.includes("statDebuff")).length,
    buff: all.filter((card) => card.kind === "usable" && card.categories.includes("buff")).length,
    statBuff: all.filter((card) => card.kind === "usable" && card.categories.includes("statBuff")).length,
    equipment: all.filter((card) => card.kind === "equipment").length,
    key: all.filter((card) => card.kind === "key").length,
  };

  if (dom.itemsFilters) {
    dom.itemsFilters.innerHTML = "";
    DEBUG_ITEM_FILTERS.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `dex-filter dex-filter-${entry.id}`;
      if (debugItemFilter === entry.id) {
        button.classList.add("is-active");
      }
      button.textContent = `${entry.label} (${counts[entry.id]})`;
      button.addEventListener("click", () => {
        if (debugItemFilter === entry.id) {
          return;
        }
        debugItemFilter = entry.id;
        renderDebugItems();
      });
      dom.itemsFilters.append(button);
    });
  }

  if (dom.itemsSubtitle) {
    const filterLabel = DEBUG_ITEM_FILTERS.find((entry) => entry.id === debugItemFilter)?.label || "All";
    dom.itemsSubtitle.textContent =
      debugItemFilter === "all"
        ? `${visible.length} items. Debug only.`
        : `${visible.length} ${filterLabel} · ${all.length} total. Debug only.`;
  }

  dom.itemsGrid.innerHTML = "";
  visible.forEach((item) => {
    const card = document.createElement("div");
    card.className = "dex-entry debug-item-entry";
    card.title = item.desc;
    card.innerHTML = `
      <img class="debug-item-icon item-icon" src="${item.asset}" alt="${item.alt}" />
      <div class="dex-entry-label">
        <strong>${item.name}</strong>
        <span>${item.typeLabel}</span>
        <em class="debug-item-desc">${item.desc}</em>
      </div>
    `;
    dom.itemsGrid.append(card);
  });
}

let debugEventZoneFilter = "all";

type DebugEventEntry = {
  zoneId: string;
  zoneName: string;
  event: ZoneEventDefinition;
};

function listDebugEvents(): DebugEventEntry[] {
  const rows: DebugEventEntry[] = [];
  ZONE_CONFIG.forEach((zone) => {
    (ZONE_EVENTS[zone.id] || []).forEach((event) => {
      rows.push({ zoneId: zone.id, zoneName: zone.name, event });
    });
  });
  return rows;
}

function formatDebugCondition(condition: EventCondition | EventCondition[] | undefined): string {
  if (!condition) {
    return "";
  }
  if (Array.isArray(condition)) {
    return condition.map((entry) => formatDebugCondition(entry)).filter(Boolean).join(" AND ");
  }
  if ("all" in condition) {
    return `(${condition.all.map((entry) => formatDebugCondition(entry)).join(" AND ")})`;
  }
  if ("any" in condition) {
    return `(${condition.any.map((entry) => formatDebugCondition(entry)).join(" OR ")})`;
  }
  if ("not" in condition) {
    return `NOT ${formatDebugCondition(condition.not)}`;
  }
  const op = condition.op || "eq";
  const value = Array.isArray(condition.value) ? condition.value.join("/") : String(condition.value);
  return `${condition.stat} ${op} ${value}`;
}

function formatDebugOutcome(outcome: ZoneEventOutcome): string {
  switch (outcome.type) {
    case "message":
      return outcome.text;
    case "heal":
      return `Heal ${outcome.amount}`;
    case "healToPercent":
      return `Heal to ${outcome.percent}%`;
    case "damage":
      return `Damage ${outcome.amount}`;
    case "damagePercent":
      return `Damage ${outcome.percent}% HP${
        outcome.minHp != null ? ` (min ${outcome.minHp})` : ""
      }`;
    case "meat":
      return `Meat ${outcome.amount >= 0 ? "+" : ""}${outcome.amount}`;
    case "weight":
      return `Weight ${outcome.amount >= 0 ? "+" : ""}${outcome.amount}`;
    case "training":
      return `Training ${outcome.amount >= 0 ? "+" : ""}${outcome.amount}`;
    case "attributes": {
      const parts = (["hp", "attack", "defense", "speed", "intelligence"] as const)
        .map((stat) => {
          const value = Number(outcome[stat]) || 0;
          return value ? `${stat} ${value > 0 ? "+" : ""}${value}` : "";
        })
        .filter(Boolean);
      return parts.join(", ") || "Attributes";
    }
    case "care": {
      const parts = [
        outcome.discipline ? `Disc ${outcome.discipline > 0 ? "+" : ""}${outcome.discipline}` : "",
        outcome.happiness ? `Hap ${outcome.happiness > 0 ? "+" : ""}${outcome.happiness}` : "",
        outcome.alignment ? `Ali ${outcome.alignment > 0 ? "+" : ""}${outcome.alignment}` : "",
      ].filter(Boolean);
      return parts.join(", ") || "Care";
    }
    case "reputation":
      return `Reputation ${outcome.amount >= 0 ? "+" : ""}${outcome.amount}`;
    case "item":
      return `Item ${outcome.label || outcome.key}${outcome.chance != null ? ` (${Math.round(outcome.chance * 100)}%)` : ""}`;
    case "equipment":
      return `Equipment ${outcome.label || outcome.key}`;
    case "keyItem":
      return `Key item ${outcome.label || outcome.key}`;
    case "unlockZones":
      return `Unlock ${outcome.zoneIds.join(", ")}`;
    case "fight":
      return outcome.combatProfile
        ? `Fight ${outcome.opponentId} (${outcome.combatProfile.stage} T${outcome.combatProfile.tier})`
        : `Fight ${outcome.opponentId}`;
    case "bossFight":
      return `Boss fight${outcome.opponentId ? ` (${outcome.opponentId})` : ""}`;
    case "eventRepeat":
      return outcome.value ? "Repeatable this run" : "Once this run";
    case "banForever":
      return "Ban forever";
    case "endRun":
      return "End run";
    case "spendAnyItem":
      return "Spend any item";
    case "spendAnyFood":
      return "Spend meat or Weight item";
    case "spendHealItem":
      return "Spend heal item";
    case "spendStatBuffItem":
      return "Spend Stat Buff item";
    case "stealRandomInventoryItem":
      return "Steal random item";
    case "returnStolenItem":
      return "Return stolen item";
    case "statCheck":
      return `Check ${outcome.mode || "proc"} ${outcome.stat || "speed"}`;
    case "grantRandomItem":
      return `Random item (${outcome.keys.join(", ")})`;
    case "grantWeightedLoot":
      return "Weighted loot";
    case "queueEvent":
      return `Queue ${outcome.eventId}`;
    case "zoneBuff":
      return `${outcome.stat} buff`;
    case "zoneDebuff":
      return `${outcome.stat} debuff`;
    case "zoneDebuffRandom":
      return `${outcome.count || 2} random debuffs`;
    case "clearZoneDebuff":
      return `Clear ${outcome.stat} debuff`;
    default:
      return (outcome as { type?: string }).type || "effect";
  }
}

function collectEventFightIds(event: ZoneEventDefinition): string[] {
  const ids: string[] = [];
  forEachZoneEventChoice(event, (choice) => {
    (choice.outcomes || []).forEach((outcome) => {
      if (outcome.type === "fight" && outcome.opponentId && !ids.includes(outcome.opponentId)) {
        ids.push(outcome.opponentId);
      }
      if (outcome.type === "bossFight" && !ids.includes("boss")) {
        ids.push("boss");
      }
    });
  });
  return ids;
}

function countEventChoices(event: ZoneEventDefinition): number {
  let count = 0;
  forEachZoneEventChoice(event, () => {
    count += 1;
  });
  return count;
}

function appendDebugText(parent: HTMLElement, tag: string, className: string, text: string) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  parent.append(el);
}

export function renderDebugEvents() {
  if (!dom.eventsGrid) {
    return;
  }
  const all = listDebugEvents();
  const zoneCounts = new Map<string, number>();
  all.forEach((entry) => {
    zoneCounts.set(entry.zoneId, (zoneCounts.get(entry.zoneId) || 0) + 1);
  });
  const visible =
    debugEventZoneFilter === "all"
      ? all
      : all.filter((entry) => entry.zoneId === debugEventZoneFilter);

  if (dom.eventsFilters) {
    dom.eventsFilters.innerHTML = "";
    const filters: Array<{ id: string; label: string; count: number }> = [
      { id: "all", label: "All", count: all.length },
    ];
    ZONE_CONFIG.forEach((zone) => {
      const count = zoneCounts.get(zone.id) || 0;
      if (count > 0) {
        filters.push({ id: zone.id, label: zone.name, count });
      }
    });
    filters.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dex-filter";
      if (debugEventZoneFilter === entry.id) {
        button.classList.add("is-active");
      }
      button.textContent = `${entry.label} (${entry.count})`;
      button.addEventListener("click", () => {
        if (debugEventZoneFilter === entry.id) {
          return;
        }
        debugEventZoneFilter = entry.id;
        renderDebugEvents();
      });
      dom.eventsFilters.append(button);
    });
  }

  if (dom.eventsSubtitle) {
    const zoneLabel =
      debugEventZoneFilter === "all"
        ? "All zones"
        : ZONE_CONFIG.find((zone) => zone.id === debugEventZoneFilter)?.name || debugEventZoneFilter;
    dom.eventsSubtitle.textContent =
      debugEventZoneFilter === "all"
        ? `${visible.length} events. Click a card for the full tree. Debug only.`
        : `${visible.length} in ${zoneLabel} · ${all.length} total. Debug only.`;
  }

  const byId = new Map(state.characters.map((character) => [String(character.id || ""), character]));
  dom.eventsGrid.innerHTML = "";
  visible.forEach((entry, index) => {
    const event = entry.event;
    const speaker = byId.get(String(event.speakerId || ""));
    const fights = collectEventFightIds(event);
    const choiceCount = countEventChoices(event);
    const nodeCount = Object.keys(event.nodes || {}).length;
    const tags: string[] = [];
    if (event.repeatable === false) {
      tags.push("Once / run");
    } else {
      tags.push("Repeatable");
    }
    if (event.forceOnly) {
      tags.push("Force only");
    }
    if (fights.includes("boss")) {
      tags.push("Boss fight");
    } else if (fights.length) {
      tags.push("Fight");
    }
    if (event.weight && event.weight !== 1) {
      tags.push(`Weight ${event.weight}`);
    }

    const card = document.createElement("div");
    card.className = "dex-entry debug-event-entry";
    card.title = `${event.title || event.id}\n${entry.zoneName}\nid: ${event.id}`;

    const numberBadge = document.createElement("span");
    numberBadge.className = "dex-entry-number";
    numberBadge.textContent = `#${String(index + 1).padStart(3, "0")}`;
    card.append(numberBadge);

    const frame = document.createElement("div");
    frame.className = "character-sprite-frame dex-sprite-frame";
    if (speaker?.spriteFramesPath) {
      const sprite = document.createElement("img");
      sprite.className = "character-sprite";
      sprite.src = `data/${speaker.spriteFramesPath}/frame_00.png`;
      sprite.alt = speaker.name || event.speakerId;
      sprite.dataset.basePath = `data/${speaker.spriteFramesPath}`;
      sprite.loading = "lazy";
      frame.append(sprite);
    }
    card.append(frame);

    const label = document.createElement("div");
    label.className = "dex-entry-label";
    appendDebugText(label, "strong", "", event.title || event.id);
    appendDebugText(label, "span", "", `${entry.zoneName} · ${speaker?.name || event.speakerId}`);
    const tagRow = document.createElement("div");
    tagRow.className = "dex-tags";
    tags.forEach((tag) => {
      const em = document.createElement("em");
      em.className = `dex-tag${tag.includes("Boss") ? " dex-tag-boss" : tag.includes("Fight") ? " dex-tag-event" : ""}`;
      em.textContent = tag;
      tagRow.append(em);
    });
    label.append(tagRow);
    appendDebugText(
      label,
      "em",
      "debug-item-desc",
      `${event.id} · ${choiceCount} choice${choiceCount === 1 ? "" : "s"}${
        nodeCount ? ` · ${nodeCount} extra node${nodeCount === 1 ? "" : "s"}` : ""
      }`
    );
    appendDebugText(label, "em", "debug-item-desc debug-event-blurb", event.text);
    card.append(label);

    const details = document.createElement("div");
    details.className = "debug-event-details";
    const requireText = formatDebugCondition(event.require);
    const unlessText = formatDebugCondition(event.unless);
    if (requireText) {
      appendDebugText(details, "p", "debug-event-meta", `Require: ${requireText}`);
    }
    if (unlessText) {
      appendDebugText(details, "p", "debug-event-meta", `Unless: ${unlessText}`);
    }
    if (event.startOutcomes?.length) {
      appendDebugText(
        details,
        "p",
        "debug-event-meta",
        `On start: ${event.startOutcomes.map((outcome) => formatDebugOutcome(outcome)).join(" · ")}`
      );
    }
    if (event.requireConsumedEvents?.length) {
      appendDebugText(
        details,
        "p",
        "debug-event-meta",
        `Needs consumed: ${event.requireConsumedEvents.join(", ")}`
      );
    }
    const tree = document.createElement("div");
    tree.className = "debug-event-tree";
    const seen = new Set<string>();
    const walk = (nodeId: string, depth: number) => {
      if (seen.has(nodeId)) {
        return;
      }
      seen.add(nodeId);
      const node = getZoneEventNode(event, nodeId);
      const heading = document.createElement("p");
      heading.className = "debug-event-node";
      heading.textContent = `${nodeId === EVENT_ROOT_NODE_ID ? "Start" : nodeId}: ${node.text}`;
      tree.append(heading);
      (node.choices || []).forEach((choice: ZoneEventChoice) => {
        const line = document.createElement("p");
        line.className = "debug-event-choice";
        const outcomes = (choice.outcomes || []).map((outcome) => formatDebugOutcome(outcome)).join(" · ");
        const extras = [
          choice.next ? `→ ${choice.next}` : "",
          choice.repeatable === false ? "once" : "",
          choice.requireMeat ? `meat ${choice.requireMeat}` : "",
          choice.requireKeyItem ? `key ${choice.requireKeyItem}` : "",
          choice.requireAnyInventoryItem ? "needs item" : "",
          choice.requireAnyFood ? "needs food" : "",
          choice.requireAnyHealItem ? "needs heal" : "",
          choice.requireAnyStatBuffItem ? "needs Stat Buff" : "",
          formatDebugCondition(choice.require),
        ].filter(Boolean);
        line.textContent = `• ${choice.label}${extras.length ? ` [${extras.join("; ")}]` : ""}${
          outcomes ? ` — ${outcomes}` : ""
        }`;
        tree.append(line);
        if (choice.next) {
          walk(choice.next, depth + 1);
        }
      });
    };
    walk(EVENT_ROOT_NODE_ID, 0);
    details.append(tree);
    card.append(details);

    card.addEventListener("click", () => {
      card.classList.toggle("is-open");
    });
    dom.eventsGrid.append(card);
  });
}

type PlayableStatsSortKey =
  | "name"
  | "stage"
  | "attribute"
  | "archetype"
  | "hp"
  | "attack"
  | "defense"
  | "speed"
  | "intelligence"
  | "special";

const PLAYABLE_STATS_SORT_LABELS: ReadonlyArray<{ id: PlayableStatsSortKey; label: string }> = [
  { id: "name", label: "Name" },
  { id: "stage", label: "Stage" },
  { id: "attribute", label: "Attr" },
  { id: "archetype", label: "Arch" },
  { id: "hp", label: "HP" },
  { id: "attack", label: "ATK" },
  { id: "defense", label: "DEF" },
  { id: "speed", label: "SPD" },
  { id: "intelligence", label: "INT" },
  { id: "special", label: "Special" },
];

let playableStatsStageFilter = "all";
let playableStatsSortKey: PlayableStatsSortKey = "stage";
let playableStatsSortDir: 1 | -1 = 1;

function playableAttributeLabel(character: Character): string {
  return String(character.attribute || character.element || character.type || "—").trim() || "—";
}

function comparePlayableStats(
  a: Character,
  b: Character,
  key: PlayableStatsSortKey,
  dir: 1 | -1
): number {
  const identityA = getCharacterCombatIdentity(a);
  const identityB = getCharacterCombatIdentity(b);
  const stageRank = (stage: string) => {
    const index = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
    return index >= 0 ? index : 99;
  };
  let diff = 0;
  if (key === "name") {
    diff = String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
  } else if (key === "stage") {
    diff = stageRank(identityA.stage) - stageRank(identityB.stage);
    if (diff === 0) {
      diff = String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
    }
  } else if (key === "attribute") {
    diff = playableAttributeLabel(a).localeCompare(playableAttributeLabel(b));
  } else if (key === "archetype") {
    diff = identityA.archetype.localeCompare(identityB.archetype);
  } else if (key === "special") {
    diff = getDexSpecialInfo(a).name.localeCompare(getDexSpecialInfo(b).name);
  } else {
    diff = identityA.stats[key] - identityB.stats[key];
  }
  return diff * dir;
}

export function renderDebugPlayableStats() {
  if (!dom.statsGrid || !dom.statsFilters) {
    return;
  }
  const playableIds = getPlayableCharacterIds();
  const stageRank = (stage: string | undefined) => {
    const index = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
    return index >= 0 ? index : 99;
  };
  const list = [...state.characters]
    .filter((character) => playableIds.has(String(character.id || "")) && Boolean(character.spriteFramesPath))
    .sort((a, b) => {
      const stageDiff = stageRank(a.stage) - stageRank(b.stage);
      if (stageDiff !== 0) {
        return stageDiff;
      }
      return String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
    });

  const stageCounts = new Map<string, number>();
  STAGE_ORDER.forEach((stage) => stageCounts.set(stage, 0));
  list.forEach((character) => {
    const stage = String(character.stage || "");
    stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
  });

  const filters: Array<{ id: string; label: string; count: number }> = [
    { id: "all", label: "All", count: list.length },
  ];
  STAGE_ORDER.forEach((stage) => {
    const count = stageCounts.get(stage) || 0;
    if (count > 0) {
      filters.push({ id: stage, label: stage, count });
    }
  });

  if (!filters.some((entry) => entry.id === playableStatsStageFilter)) {
    playableStatsStageFilter = "all";
  }

  dom.statsFilters.innerHTML = "";
  filters.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dex-filter dex-filter-${entry.id.replace(/\s+/g, "").toLowerCase()}`;
    if (playableStatsStageFilter === entry.id) {
      button.classList.add("is-active");
    }
    button.textContent = `${entry.label} (${entry.count})`;
    button.addEventListener("click", () => {
      if (playableStatsStageFilter === entry.id) {
        return;
      }
      playableStatsStageFilter = entry.id;
      renderDebugPlayableStats();
    });
    dom.statsFilters.append(button);
  });

  const visible = list
    .filter((character) =>
      playableStatsStageFilter === "all" ? true : String(character.stage || "") === playableStatsStageFilter
    )
    .sort((a, b) => comparePlayableStats(a, b, playableStatsSortKey, playableStatsSortDir));

  if (dom.statsSubtitle) {
    const stageLabel =
      playableStatsStageFilter === "all" ? "Playable" : playableStatsStageFilter;
    dom.statsSubtitle.textContent = `${visible.length} ${stageLabel} · base combat stats, no training or gear. Debug only.`;
  }

  const table = document.createElement("table");
  table.className = "debug-stats-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const spriteHead = document.createElement("th");
  spriteHead.textContent = "";
  headRow.append(spriteHead);
  PLAYABLE_STATS_SORT_LABELS.forEach((entry) => {
    const th = document.createElement("th");
    th.scope = "col";
    const active = playableStatsSortKey === entry.id;
    th.className = active ? "is-sorted" : "";
    th.textContent = active ? `${entry.label} ${playableStatsSortDir === 1 ? "▲" : "▼"}` : entry.label;
    th.addEventListener("click", () => {
      if (playableStatsSortKey === entry.id) {
        playableStatsSortDir = playableStatsSortDir === 1 ? -1 : 1;
      } else {
        playableStatsSortKey = entry.id;
        playableStatsSortDir = entry.id === "name" || entry.id === "stage" ? 1 : -1;
      }
      renderDebugPlayableStats();
    });
    headRow.append(th);
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement("tbody");
  visible.forEach((character) => {
    const identity = getCharacterCombatIdentity(character);
    const special = getDexSpecialInfo(character);
    const row = document.createElement("tr");

    const spriteCell = document.createElement("td");
    spriteCell.className = "debug-stats-sprite";
    const frame = document.createElement("div");
    frame.className = "character-sprite-frame dex-sprite-frame debug-stats-sprite-frame";
    const sprite = document.createElement("img");
    sprite.className = "character-sprite";
    sprite.src = `data/${character.spriteFramesPath}/frame_00.png`;
    sprite.alt = character.name ? `${character.name} sprite` : "Sprite";
    sprite.dataset.basePath = `data/${character.spriteFramesPath}`;
    sprite.loading = "lazy";
    frame.append(sprite);
    spriteCell.append(frame);
    row.append(spriteCell);

    const appendText = (value: string, className?: string) => {
      const cell = document.createElement("td");
      if (className) {
        cell.className = className;
      }
      cell.textContent = value;
      row.append(cell);
    };
    const appendStat = (value: number) => {
      const cell = document.createElement("td");
      cell.className = "debug-stats-num";
      cell.textContent = String(value);
      row.append(cell);
    };

    appendText(String(character.name || character.id || "???"), "debug-stats-name");
    appendText(identity.stage);
    appendText(playableAttributeLabel(character));
    appendText(identity.archetype);
    appendStat(identity.stats.hp);
    appendStat(identity.stats.attack);
    appendStat(identity.stats.defense);
    appendStat(identity.stats.speed);
    appendStat(identity.stats.intelligence);

    const specialCell = document.createElement("td");
    specialCell.className = "debug-stats-special";
    const specialWrap = document.createElement("div");
    specialWrap.className = "dex-special";
    const specialName = document.createElement("span");
    specialName.className = "dex-special-name";
    if (special.projectile) {
      const proj = document.createElement("img");
      proj.className = "dex-special-proj";
      proj.src = special.projectile;
      proj.alt = "";
      proj.loading = "lazy";
      specialName.append(proj);
    }
    specialName.append(document.createTextNode(special.name));
    specialWrap.append(specialName);
    const typeRow = document.createElement("div");
    typeRow.className = "dex-special-type";
    if (special.statusIcon) {
      const statusIcon = document.createElement("img");
      statusIcon.src = special.statusIcon;
      statusIcon.alt = "";
      statusIcon.loading = "lazy";
      typeRow.append(statusIcon);
    }
    const typeLabel = document.createElement("span");
    typeLabel.textContent = special.statusLabel;
    typeRow.append(typeLabel);
    specialWrap.append(typeRow);
    specialCell.append(specialWrap);
    row.append(specialCell);

    tbody.append(row);
  });
  table.append(tbody);

  dom.statsGrid.innerHTML = "";
  dom.statsGrid.append(table);
}

