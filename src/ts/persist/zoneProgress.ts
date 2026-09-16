import { ZONE_CONFIG } from "../data/zones.js";
import { ZONE_BOSSES } from "../data/bosses.js";

const UNLOCKED_ZONES_KEY = "unlockedZonesV2";
const DEFEATED_ZONE_BOSSES_KEY = "defeatedZoneBossesV2";
const DEFEATED_BOSS_OPPONENTS_KEY = "defeatedBossOpponentsV2";
const SEEN_ZONE_CONTENT_KEY = "seenZoneContentV2";

function migrateZoneId(id: string): string {
  return id === "digi_heaven" ? "kernel" : id;
}

/** TEMP debug: unlock every zone on the map. Set to false before release. */
export const DEBUG_UNLOCK_ALL_ZONES = false;

export type SeenZoneContent = {
  encounters: string[];
  events: string[];
  bosses: string[];
};

export type SeenZoneContentMap = Record<string, SeenZoneContent>;

export function getDefaultUnlockedZoneIds(): string[] {
  return ZONE_CONFIG.filter((zone) => zone.unlockedByDefault).map((zone) => zone.id);
}

export function readUnlockedZoneIds(): string[] {
  if (DEBUG_UNLOCK_ALL_ZONES) {
    return ZONE_CONFIG.map((zone) => zone.id);
  }
  try {
    const raw = window.localStorage.getItem(UNLOCKED_ZONES_KEY);
    if (!raw) {
      return getDefaultUnlockedZoneIds();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return getDefaultUnlockedZoneIds();
    }
    const valid = new Set(ZONE_CONFIG.map((zone) => zone.id));
    const ids = parsed
      .map((id: unknown) => migrateZoneId(String(id)))
      .filter((id: string) => valid.has(id as any));
    const defaults = getDefaultUnlockedZoneIds();
    return [...new Set([...defaults, ...ids])];
  } catch (error) {
    console.error(error);
    return getDefaultUnlockedZoneIds();
  }
}

export function writeUnlockedZoneIds(ids: string[]) {
  const defaults = getDefaultUnlockedZoneIds();
  const valid = new Set(ZONE_CONFIG.map((zone) => zone.id));
  const deduped = [...new Set([...defaults, ...ids])].filter((id) => valid.has(id as any));
  window.localStorage.setItem(UNLOCKED_ZONES_KEY, JSON.stringify(deduped));
}

/** New History Mode run: only default zones (Native Forest). Boss/event unlocks start over. */
export function resetZoneProgressForNewGame() {
  writeUnlockedZoneIds(getDefaultUnlockedZoneIds());
  writeDefeatedZoneBossIds([]);
  writeDefeatedBossOpponentIds([]);
  writeSeenZoneContentMap({});
}

export function isZoneUnlocked(zoneId: string): boolean {
  return readUnlockedZoneIds().includes(zoneId);
}

/** Persist newly unlocked zones. Returns ids that were not already unlocked. */
export function unlockZoneIds(zoneIds: readonly string[] | string[]): string[] {
  if (!Array.isArray(zoneIds) || zoneIds.length === 0) {
    return [];
  }
  const current = readUnlockedZoneIds();
  const newly = zoneIds.filter((id) => !current.includes(id));
  if (newly.length === 0) {
    return [];
  }
  writeUnlockedZoneIds([...current, ...newly]);
  return newly;
}

export function readDefeatedZoneBossIds(): string[] {
  try {
    const raw = window.localStorage.getItem(DEFEATED_ZONE_BOSSES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const valid = new Set(ZONE_CONFIG.map((zone) => zone.id));
    return [...new Set(parsed.map((id) => migrateZoneId(String(id))).filter((id) => valid.has(id as any)))];
  } catch {
    return [];
  }
}

export function writeDefeatedZoneBossIds(ids: string[]) {
  const valid = new Set(ZONE_CONFIG.map((zone) => zone.id));
  const deduped = [...new Set(ids.map((id) => String(id)).filter((id) => valid.has(id as any)))];
  window.localStorage.setItem(DEFEATED_ZONE_BOSSES_KEY, JSON.stringify(deduped));
}

export function isZoneBossDefeated(zoneId: string | null | undefined): boolean {
  if (!zoneId) {
    return false;
  }
  if (!readDefeatedZoneBossIds().includes(zoneId)) {
    return false;
  }
  const boss = ZONE_BOSSES[zoneId as keyof typeof ZONE_BOSSES];
  const rewards = boss?.unlockZones || [];
  if (rewards.length === 0) {
    return true;
  }
  const unlocked = new Set(readUnlockedZoneIds());
  return rewards.every((id) => unlocked.has(id));
}

export function markZoneBossDefeated(zoneId: string | null | undefined) {
  if (!zoneId || isZoneBossDefeated(zoneId)) {
    return;
  }
  writeDefeatedZoneBossIds([...readDefeatedZoneBossIds(), zoneId]);
}

export function readDefeatedBossOpponentIds(): string[] {
  try {
    const raw = window.localStorage.getItem(DEFEATED_BOSS_OPPONENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return [...new Set(parsed.map((id) => String(id)).filter(Boolean))];
  } catch {
    return [];
  }
}

export function writeDefeatedBossOpponentIds(ids: string[]) {
  const deduped = [...new Set(ids.map((id) => String(id)).filter(Boolean))];
  window.localStorage.setItem(DEFEATED_BOSS_OPPONENTS_KEY, JSON.stringify(deduped));
}

export function isBossOpponentDefeated(opponentId: string | null | undefined): boolean {
  const id = String(opponentId || "");
  if (!id) {
    return false;
  }
  return readDefeatedBossOpponentIds().includes(id);
}

export function markBossOpponentDefeated(opponentId: string | null | undefined) {
  const id = String(opponentId || "");
  if (!id || isBossOpponentDefeated(id)) {
    return;
  }
  writeDefeatedBossOpponentIds([...readDefeatedBossOpponentIds(), id]);
}

export function emptySeenZoneContent(): SeenZoneContent {
  return { encounters: [], events: [], bosses: [] };
}

export function readSeenZoneContentMap(): SeenZoneContentMap {
  try {
    const raw = window.localStorage.getItem(SEEN_ZONE_CONTENT_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    const validZones = new Set(ZONE_CONFIG.map((zone) => zone.id));
    const result: SeenZoneContentMap = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([zoneId, value]) => {
      const migratedId = migrateZoneId(zoneId);
      if (!validZones.has(migratedId as any) || !value || typeof value !== "object") {
        return;
      }
      const entry = value as Partial<SeenZoneContent>;
      result[migratedId] = {
        encounters: Array.isArray(entry.encounters)
          ? entry.encounters.map((id) => String(id)).filter(Boolean)
          : [],
        events: Array.isArray(entry.events)
          ? entry.events.map((id) => String(id)).filter(Boolean)
          : [],
        bosses: Array.isArray(entry.bosses)
          ? entry.bosses.map((id) => String(id)).filter(Boolean)
          : [],
      };
    });
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
}

export function writeSeenZoneContentMap(map: SeenZoneContentMap) {
  window.localStorage.setItem(SEEN_ZONE_CONTENT_KEY, JSON.stringify(map));
}

const BG_CALENDAR_DAY_KEY = "zoneBgCalendarDayV1";

export function readBgCalendarDay(): number {
  try {
    const raw = window.localStorage.getItem(BG_CALENDAR_DAY_KEY);
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }
    return Math.floor(value);
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export function writeBgCalendarDay(day: number) {
  const value = Math.max(0, Math.floor(Number(day) || 0));
  window.localStorage.setItem(BG_CALENDAR_DAY_KEY, String(value));
}

/** Advance the scenery calendar when a zone outing ends. */
export function bumpBgCalendarDay(amount = 1) {
  const next = readBgCalendarDay() + Math.max(1, Math.floor(Number(amount) || 1));
  writeBgCalendarDay(next);
  return next;
}

export function getSeenZoneContent(zoneId: string): SeenZoneContent {
  return readSeenZoneContentMap()[zoneId] || emptySeenZoneContent();
}

export function markSeenZoneEntry(
  zoneId: string,
  kind: keyof SeenZoneContent,
  entryId: string
) {
  if (!zoneId || !entryId) {
    return;
  }
  const map = readSeenZoneContentMap();
  const current = map[zoneId] || emptySeenZoneContent();
  if (current[kind].includes(entryId)) {
    return;
  }
  map[zoneId] = {
    ...current,
    [kind]: [...current[kind], entryId],
  };
  writeSeenZoneContentMap(map);
}
