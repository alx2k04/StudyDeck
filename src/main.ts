import "./style.css";
import { ApiError, fetchDecks } from "./api/decks";
import { getState, setState, subscribe } from "./state/store";
import { clearLastDeck, loadLastDeck, saveLastDeck } from "./storage/lastDeck";
import { clearQuizSession, loadQuizSession, matchesDeck } from "./storage/quizSession";
import { renderDeckBrowser } from "./ui/deckBrowser";
import { createHeader } from "./ui/header";
import { renderQuiz } from "./ui/quiz";
import { renderStudyMode } from "./ui/studyMode";
import { renderError, renderLoading } from "./ui/views";
import type { Deck, LoadState, QuizSession } from "./types";

const app = document.getElementById("app");
if (!app) {
  throw new Error("Mount point #app not found in index.html");
}

// Persistent shell: header on top, swappable screen below
const header = createHeader();
const screen = document.createElement("main");
app.replaceChildren(header.element, screen);

let cleanup: (() => void) | null = null;

/** Swap the visible screen, running the previous screen's cleanup first. */
function show(element: HTMLElement, onLeave?: () => void): void {
  cleanup?.();
  cleanup = onLeave ?? null;
  screen.replaceChildren(element);
  header.refresh(); // the streak may have changed since the last screen
}

function showBrowser(decks: Deck[]): void {
  clearLastDeck(); // no deck is open anymore
  show(
    renderDeckBrowser(decks, {
      onStudy: (id) => showStudy(decks, id),
      onQuiz: (id) => showQuiz(decks, id),
    })
  );
}

function showStudy(decks: Deck[], deckId: string): void {
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) return;

  saveLastDeck(deck.id); // remember it, in case the page is reloaded
  const view = renderStudyMode(deck, () => showBrowser(decks));
  show(view.element, view.destroy);
}

function showQuiz(decks: Deck[], deckId: string, resume: QuizSession | null = null): void {
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) return;

  if (!resume) clearQuizSession();

  const view = renderQuiz(deck, resume, {
    onExit: () => showBrowser(decks),
    onRetry: () => showQuiz(decks, deckId),
  });
  show(view.element, view.destroy);
}

/** After a reload: put the user back where they were. Returns true if it did. */
function tryRestore(decks: Deck[]): boolean {
  // 1. An unfinished quiz (sessionStorage) takes priority
  const saved = loadQuizSession();
  if (saved) {
    const deck = decks.find((d) => d.id === saved.deckId);
    if (deck && matchesDeck(deck, saved)) {
      showQuiz(decks, deck.id, saved);
      return true;
    }
    clearQuizSession(); // stale or mismatched: discard
  }

  // 2. Otherwise, the deck that was open in Study Mode (localStorage)
  const lastId = loadLastDeck();
  if (lastId && decks.some((d) => d.id === lastId)) {
    showStudy(decks, lastId);
    return true;
  }

  return false;
}

let triedRestore = false; // only restore on first load, not after Retry

function render(state: LoadState): void {
  switch (state.status) {
    case "loading":
      show(renderLoading());
      break;
    case "error":
      show(renderError(state.message, loadDecks));
      break;
    case "success":
      if (!triedRestore) {
        triedRestore = true;
        if (tryRestore(state.decks)) break;
      }
      showBrowser(state.decks);
      break;
  }
}

async function loadDecks(): Promise<void> {
  setState({ status: "loading" });

  try {
    const decks = await fetchDecks();
    setState({ status: "success", decks });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.status === 0
          ? "Can't reach the server. Is it running?"
          : `Couldn't load decks (error ${err.status}). Please try again.`
        : "Something unexpected went wrong.";
    setState({ status: "error", message });
  }
}

subscribe(render);
render(getState());
loadDecks();