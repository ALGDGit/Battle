const BANNED_EVENTS_KEY = "bannedEventsForeverV1";
const EVENT_WIN_COUNTERS_KEY = "eventWinCountersV1";
export function readBannedEventIds() {
    try {
        const raw = window.localStorage.getItem(BANNED_EVENTS_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return [...new Set(parsed.map((id) => String(id)).filter(Boolean))];
    }
    catch {
        return [];
    }
}
export function writeBannedEventIds(ids) {
    const deduped = [...new Set(ids.map((id) => String(id)).filter(Boolean))];
    window.localStorage.setItem(BANNED_EVENTS_KEY, JSON.stringify(deduped));
}
export function isEventBannedForever(eventId) {
    const id = String(eventId || "");
    if (!id) {
        return false;
    }
    return readBannedEventIds().includes(id);
}
export function banEventForever(eventId) {
    const id = String(eventId || "");
    if (!id || isEventBannedForever(id)) {
        return;
    }
    writeBannedEventIds([...readBannedEventIds(), id]);
}
/** Merge run-consumed ids with permanently banned events. */
export function getExcludedEventIds(runConsumed) {
    return [...new Set([...(runConsumed || []).map(String), ...readBannedEventIds()])];
}
function readEventWinCounterMap() {
    try {
        const raw = window.localStorage.getItem(EVENT_WIN_COUNTERS_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }
        const out = {};
        Object.entries(parsed).forEach(([key, value]) => {
            const id = String(key || "");
            const n = Number(value);
            if (id && Number.isFinite(n) && n > 0) {
                out[id] = Math.floor(n);
            }
        });
        return out;
    }
    catch {
        return {};
    }
}
export function readEventWinCount(eventId) {
    const id = String(eventId || "");
    if (!id) {
        return 0;
    }
    return Number(readEventWinCounterMap()[id]) || 0;
}
export function readAllEventWinCounts() {
    return readEventWinCounterMap();
}
/** Persist a win for this event id. Returns the new total. */
export function incrementEventWinCount(eventId) {
    const id = String(eventId || "");
    if (!id) {
        return 0;
    }
    const map = readEventWinCounterMap();
    const next = (Number(map[id]) || 0) + 1;
    map[id] = next;
    window.localStorage.setItem(EVENT_WIN_COUNTERS_KEY, JSON.stringify(map));
    return next;
}
