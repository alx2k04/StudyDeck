import type { StreakData } from "../types";
import { daysBetween, toDateKey } from "../utils/dates";
import { KEYS } from "./keys";
import { readJSON, writeJSON } from "./safeStorage";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

// Accepts null too, because "no streak yet" is our fallback.
function isSavedStreak(value: unknown): value is StreakData | null {
  if (value === null) return true;
  if (typeof value !== "object") return false;

  const s = value as Record<string, unknown>;
  return (
    Number.isInteger(s.count) &&
    (s.count as number) >= 1 &&
    typeof s.lastDate === "string" &&
    DATE_KEY.test(s.lastDate)
  );
}

function readStreak(): StreakData | null {
  return readJSON<StreakData | null>("local", KEYS.streak, isSavedStreak, null);
}

/** The streak to DISPLAY. A streak is alive if you studied today or yesterday. */
export function getCurrentStreak(today: string = toDateKey()): number {
  const saved = readStreak();
  if (!saved) return 0;

  const gap = daysBetween(saved.lastDate, today);
  return gap === 0 || gap === 1 ? saved.count : 0;
}

/** Call when the user studies. Safe to call many times a day. Returns the new streak. */
export function recordStudyToday(today: string = toDateKey()): number {
  const saved = readStreak();

  if (saved) {
    const gap = daysBetween(saved.lastDate, today);
    if (gap === 0) return saved.count; // already counted today
    if (gap === 1) {
      const next: StreakData = { count: saved.count + 1, lastDate: today };
      writeJSON("local", KEYS.streak, next);
      return next.count;
    }
  }

  // No history, a gap of 2+ days, or a negative gap (clock moved back): start over
  const fresh: StreakData = { count: 1, lastDate: today };
  writeJSON("local", KEYS.streak, fresh);
  return 1;
}