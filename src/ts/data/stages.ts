export const STAGE_ORDER = [
  "Baby I",
  "Baby II",
  "Child",
  "Adult",
  "Perfect",
  "Ultimate",
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

/** Rogue-lite run lives. */
export const MAX_LIVES = 3;

/** Care meters shared by Digimon runs (-10 .. 10). */
export const CARE_STAT_MIN = -10;
export const CARE_STAT_MAX = 10;

export function clampCareStat(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(CARE_STAT_MIN, Math.min(CARE_STAT_MAX, Math.round(value)));
}

export function getHappinessLabel(value: number): string {
  const v = clampCareStat(value);
  if (v >= 8) {
    return "Very Happy";
  }
  if (v >= 4) {
    return "Happy";
  }
  if (v >= 0) {
    return "Normal";
  }
  if (v >= -4) {
    return "Sad";
  }
  if (v >= -7) {
    return "Frustrated";
  }
  return "Angry";
}

export function getDisciplineLabel(value: number): string {
  const v = clampCareStat(value);
  if (v >= 8) {
    return "Very Disciplined";
  }
  if (v >= 4) {
    return "Disciplined";
  }
  if (v >= 0) {
    return "Neutral";
  }
  if (v >= -3) {
    return "Slacker";
  }
  if (v >= -7) {
    return "Undisciplined";
  }
  return "Delinquent";
}

export function getAlignmentLabel(value: number): string {
  const v = clampCareStat(value);
  if (v >= 8) {
    return "Virtuous";
  }
  if (v >= 4) {
    return "Good";
  }
  if (v >= 0) {
    return "Normal";
  }
  if (v >= -3) {
    return "Rogue";
  }
  if (v >= -7) {
    return "Evil";
  }
  return "Pure Evil";
}
