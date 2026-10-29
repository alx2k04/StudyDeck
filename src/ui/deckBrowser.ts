import type { Deck } from "../types";
import { getBestScore } from "../storage/progress";
import { debounce } from "../utils/debounce";
import { ALL, filterDecks, getCategories, type DeckFilters } from "../utils/filters";
import { pluralize } from "../utils/text";

export interface DeckActions {
  onStudy: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
}

function deckCardHtml(deck: Deck): string {
  const best = getBestScore(deck.id);

  return `
    <article class="card deck-card">
      <h3>${deck.title}</h3>
      <span class="badge">${deck.category}</span>
      <p>${pluralize(deck.cards.length, "card")}</p>
      <p>${best === null ? "Best score: -" : `Best score: ${best}%`}</p>
      <div class="card-actions">
        <button data-action="study" data-id="${deck.id}">Study</button>
        <button data-action="quiz" data-id="${deck.id}">Quiz</button>
      </div>
    </article>
  `;
}

export function renderDeckBrowser(decks: Deck[], actions: DeckActions): HTMLElement {
  const filters: DeckFilters = { query: "", category: ALL };

  const categoryOptions = getCategories(decks)
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  const root = document.createElement("section");
  root.innerHTML = `
    <div class="toolbar">
      <input type="search" placeholder="Search decks..." aria-label="Search decks by title">
      <select aria-label="Filter by category">
        <option value="${ALL}">All categories</option>
        ${categoryOptions}
      </select>
    </div>
    <p class="result-count" aria-live="polite"></p>
    <div class="grid"></div>
  `;

  const search = root.querySelector<HTMLInputElement>("input")!;
  const select = root.querySelector<HTMLSelectElement>("select")!;
  const status = root.querySelector<HTMLElement>(".result-count")!;
  const grid = root.querySelector<HTMLElement>(".grid")!;

  function updateGrid(): void {
    const visible = filterDecks(decks, filters);
    status.textContent = `Showing ${pluralize(visible.length, "deck")}`;

    if (visible.length === 0) {
      grid.innerHTML = `<p class="empty">No decks match your search.</p>`;
      return;
    }

    grid.innerHTML = visible.map(deckCardHtml).join("");
  }

  // One click listener on the grid handles every Study/Quiz button (event delegation).
  // The cards get rebuilt on every search, so we can't attach listeners to them one by one.
  grid.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;

    const id = button.dataset.id!;
    if (button.dataset.action === "study") actions.onStudy(id);
    else actions.onQuiz(id);
  });

  search.addEventListener(
    "input",
    debounce(() => {
      filters.query = search.value;
      updateGrid();
    }, 250)
  );

  select.addEventListener("change", () => {
    filters.category = select.value;
    updateGrid();
  });

  updateGrid(); // initial draw
  return root;
}