import type { Deck } from "../types";

export const ALL = "all";

export interface DeckFilters {
  query: string;
  category: string; // a category name, or ALL
}

export function filterDecks(decks: Deck[], filters: DeckFilters): Deck[] {
  const query = filters.query.trim().toLowerCase();

  return decks.filter(
    (deck) =>
      (filters.category === ALL || deck.category === filters.category) &&
      deck.title.toLowerCase().includes(query)
  );
}

export function getCategories(decks: Deck[]): string[] {
  return [...new Set(decks.map((deck) => deck.category))].sort();
}