import { KEYS } from "./keys";
import { readJSON, writeJSON } from "./safeStorage";

type BestScores = Record<string, number>; // deckId -> best percentage (0-100)

function isBestScores(value: unknown): value is BestScores {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100
    )
  );
}

function readScores(): BestScores {
  return readJSON("local", KEYS.bestScores, isBestScores, {});
}

export function getBestScore(deckId: string): number | null {
  const scores = readScores();
  return Object.hasOwn(scores, deckId) ? scores[deckId] : null;
}

/** Saves the score only if it beats the previous best. Returns true if it did. */
export function saveBestScore(deckId: string, percent: number): boolean {
  const rounded = Math.round(Math.min(100, Math.max(0, percent)));
  const scores = readScores();

  if (Object.hasOwn(scores, deckId) && scores[deckId] >= rounded) {
    return false;
  }

  return writeJSON("local", KEYS.bestScores, { ...scores, [deckId]: rounded });
}