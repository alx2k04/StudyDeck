import type { Deck } from "../types";
import { recordStudyToday } from "../storage/streak";

export interface StudyView {
  element: HTMLElement;
  destroy: () => void; // call this when leaving the screen
}

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest("button, input, select, textarea, a") !== null
  );
}

export function renderStudyMode(deck: Deck, onExit: () => void): StudyView {
  const total = deck.cards.length;
  let index = 0;
  let flipped = false;

  const root = document.createElement("section");
  root.className = "study";

  // --- empty deck: show a message and stop ---
  if (total === 0) {
    root.innerHTML = `
      <div class="study-header">
        <button class="back-btn">← Back to decks</button>
      </div>
      <h2>${deck.title}</h2>
      <p class="empty">This deck has no cards yet.</p>
    `;
    root.querySelector(".back-btn")!.addEventListener("click", onExit);
    return { element: root, destroy: () => {} };
  }

  // --- structure ---
  root.innerHTML = `
    <div class="study-header">
      <button class="back-btn">← Back to decks</button>
      <p class="study-progress" aria-live="polite"></p>
    </div>

    <h2>${deck.title}</h2>

    <div class="flashcard">
      <div class="fc-question"></div>
      <hr class="fc-divider">
      <div class="fc-answer"></div>
    </div>

    <button class="show-answer"></button>

    <div class="study-nav">
      <button class="prev-btn">← Previous</button>
      <button class="next-btn">Next →</button>
    </div>

    <p class="study-hint">Space / Enter: flip · ← →: navigate · Esc: back</p>
  `;

  const backBtn = root.querySelector<HTMLButtonElement>(".back-btn")!;
  const progress = root.querySelector<HTMLElement>(".study-progress")!;
  const card = root.querySelector<HTMLElement>(".flashcard")!;
  const questionEl = root.querySelector<HTMLElement>(".fc-question")!;
  const divider = root.querySelector<HTMLElement>(".fc-divider")!;
  const answerEl = root.querySelector<HTMLElement>(".fc-answer")!;
  const flipBtn = root.querySelector<HTMLButtonElement>(".show-answer")!;
  const prevBtn = root.querySelector<HTMLButtonElement>(".prev-btn")!;
  const nextBtn = root.querySelector<HTMLButtonElement>(".next-btn")!;

  // --- behavior ---
  function update(): void {
    const current = deck.cards[index];

    questionEl.textContent = current.question;
    answerEl.textContent = current.answer;

    divider.hidden = !flipped;
    answerEl.hidden = !flipped;
    flipBtn.textContent = flipped ? "Hide Answer" : "Show Answer";

    progress.textContent = `Card ${index + 1} / ${total}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
  }

  function flip(): void {
    flipped = !flipped;
    if (flipped) recordStudyToday(); // revealing an answer counts as studying
    update();
  }

  function go(delta: -1 | 1): void {
    const next = index + delta;
    if (next < 0 || next >= total) return;
    index = next;
    flipped = false; // every new card starts on the question side
    update();
    flipBtn.focus();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        go(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        go(1);
        break;
      case " ":
      case "Enter":
        // If a button has focus, the browser already "clicks" it. Don't flip twice.
        if (isInteractive(event.target)) return;
        event.preventDefault();
        flip();
        break;
      case "Escape":
        onExit();
        break;
    }
  }

  backBtn.addEventListener("click", onExit);
  card.addEventListener("click", flip);
  flipBtn.addEventListener("click", flip);
  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  document.addEventListener("keydown", onKeyDown);

  update();
  queueMicrotask(() => flipBtn.focus()); // focus once it's in the DOM

  return {
    element: root,
    destroy: () => document.removeEventListener("keydown", onKeyDown),
  };
}