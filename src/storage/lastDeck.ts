import { KEYS } from "./keys";
import { readJSON, removeKey, writeJSON } from "./safeStorage";

function isDeckId(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function loadLastDeck(): string | null {
  return readJSON<string | null>("local", KEYS.lastDeck, isDeckId, null);
}

export function saveLastDeck(deckId: string): void {
  writeJSON("local", KEYS.lastDeck, deckId);
}

export function clearLastDeck(): void {
  removeKey("local", KEYS.lastDeck);
}