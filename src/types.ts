export interface Card {
  id: string;
  question: string;
  answer: string;
  options: string[];      // quiz choices (includes the answer)
  correctIndex: number;   // index of the right option
}

export interface Deck {
  id: string;
  title: string;
  category: string;
  cards: Card[];
}

export type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; decks: Deck[] };

export interface QuizSession {
  deckId: string;
  answers: (number | null)[]; // chosen option index per question; null = timed out
  startedAt: number;          // Date.now() when the quiz began
  questionEndsAt: number | null; // deadline of the current question; null between questions
}

export type Theme = "light" | "dark";

export interface StreakData {
  count: number;    // consecutive days studied
  lastDate: string; // local calendar day, "YYYY-MM-DD"
}