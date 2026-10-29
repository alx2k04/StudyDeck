import type { Deck, QuizSession } from "../types";
import { KEYS } from "./keys";
import { readJSON, removeKey, writeJSON } from "./safeStorage";

// The validator accepts null too, because our fallback ("no session") is null.
function isSavedSession(value: unknown): value is QuizSession | null {
  if (value === null) return true;
  if (typeof value !== "object") return false;

  const s = value as Record<string, unknown>;
  return (
    typeof s.deckId === "string" &&
    Array.isArray(s.answers) &&
    s.answers.every((a) => a === null || Number.isInteger(a)) &&
    typeof s.startedAt === "number" &&
    (s.questionEndsAt === null || typeof s.questionEndsAt === "number")
  );
}

export function loadQuizSession(): QuizSession | null {
  return readJSON<QuizSession | null>("session", KEYS.quizSession, isSavedSession, null);
}

export function saveQuizSession(session: QuizSession): void {
  writeJSON("session", KEYS.quizSession, session);
}

export function clearQuizSession(): void {
  removeKey("session", KEYS.quizSession);
}

export function matchesDeck(deck: Deck, session: QuizSession): boolean {
  return (
    session.deckId === deck.id &&
    session.answers.length <= deck.cards.length &&
    session.answers.every(
      (a, i) => a === null || (a >= 0 && a < deck.cards[i].options.length)
    )
  );
}