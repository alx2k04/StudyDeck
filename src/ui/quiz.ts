import type { Deck, QuizSession } from "../types";
import { saveBestScore } from "../storage/progress";
import { clearQuizSession, saveQuizSession } from "../storage/quizSession";
import { recordStudyToday } from "../storage/streak";
import { formatDuration } from "../utils/time";
import { pluralize } from "../utils/text";
import type { StudyView } from "./studyMode"; // same { element, destroy } shape

const QUESTION_SECONDS = 15;
const FEEDBACK_MS = 900;

export interface QuizActions {
  onExit: () => void;
  onRetry: () => void;
}

export function renderQuiz(
  deck: Deck,
  resume: QuizSession | null,
  actions: QuizActions
): StudyView {
  const total = deck.cards.length;
  const root = document.createElement("section");
  root.className = "quiz";

  // --- empty deck guard ---
  if (total === 0) {
    root.innerHTML = `
      <button class="back-btn">← Back to decks</button>
      <p class="empty">This deck has no cards, so there's nothing to quiz.</p>
    `;
    root.querySelector(".back-btn")!.addEventListener("click", actions.onExit);
    return { element: root, destroy: () => {} };
  }

  // --- state ---
  const session: QuizSession = resume ?? {
    deckId: deck.id,
    answers: [],
    startedAt: Date.now(),
    questionEndsAt: null,
  };

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let advanceId: ReturnType<typeof setTimeout> | undefined;
  let locked = false; // true while feedback is showing
  let finished = false;
  let optionButtons: HTMLButtonElement[] = [];

  // --- structure ---
  root.innerHTML = `
    <div class="quiz-header">
      <button class="quit-btn">Quit</button>
      <p class="quiz-progress"></p>
      <p class="quiz-timer"></p>
    </div>

    <div class="timer-bar">
      <div class="timer-fill"></div>
    </div>

    <h2 class="quiz-question"></h2>
    <div class="options"></div>
    <p class="quiz-feedback" aria-live="assertive"></p>
    <p class="study-hint">Press 1-4 to answer</p>
  `;

  const quitBtn = root.querySelector<HTMLButtonElement>(".quit-btn")!;
  const progress = root.querySelector<HTMLElement>(".quiz-progress")!;
  const timerText = root.querySelector<HTMLElement>(".quiz-timer")!;
  const fill = root.querySelector<HTMLElement>(".timer-fill")!;
  const questionEl = root.querySelector<HTMLElement>(".quiz-question")!;
  const optionsEl = root.querySelector<HTMLElement>(".options")!;
  const feedback = root.querySelector<HTMLElement>(".quiz-feedback")!;

  // --- timer ---
  function stopTimer(): void {
    clearInterval(intervalId);
    intervalId = undefined;
  }

  function tick(): void {
    const remaining = (session.questionEndsAt ?? 0) - Date.now();
    if (remaining <= 0) {
      submit(null); // time's up
      return;
    }
    timerText.textContent = `${Math.ceil(remaining / 1000)}s`;
    timerText.classList.toggle("urgent", remaining <= 5000);
    fill.style.width = `${(remaining / (QUESTION_SECONDS * 1000)) * 100}%`;
  }

  function startTimer(): void {
    stopTimer();
    if (session.questionEndsAt === null) {
      session.questionEndsAt = Date.now() + QUESTION_SECONDS * 1000;
      saveQuizSession(session);
    }
    tick();
    intervalId = setInterval(tick, 200);
  }

  // --- the flow: renderQuestion → submit → (feedback) → next → ... → finish ---
  function renderQuestion(): void {
    const i = session.answers.length;
    const card = deck.cards[i];
    locked = false;

    progress.textContent = `Question ${i + 1} / ${total}`;
    questionEl.textContent = card.question;

    optionsEl.innerHTML = card.options
      .map((option, n) => `<button class="option">${n + 1}. ${option}</button>`)
      .join("");

    // The buttons were just created, so attach their listeners now
    optionButtons = Array.from(optionsEl.querySelectorAll<HTMLButtonElement>(".option"));
    optionButtons.forEach((btn, n) => btn.addEventListener("click", () => submit(n)));

    startTimer();
  }

  function submit(choice: number | null): void {
    if (locked || finished) return; // ignore double-clicks, and a tick racing a click
    locked = true;
    stopTimer();

    session.answers.push(choice);
    session.questionEndsAt = null;
    saveQuizSession(session); // saved immediately, so a refresh keeps this answer

    const card = deck.cards[session.answers.length - 1];
    optionButtons.forEach((btn, n) => {
      btn.disabled = true;
      if (n === card.correctIndex) btn.classList.add("correct");
      else if (n === choice) btn.classList.add("wrong");
    });
    feedback.textContent =
      choice === null ? "Time's up!" : choice === card.correctIndex ? "Correct!" : "Incorrect";

    advanceId = setTimeout(next, FEEDBACK_MS);
  }

  function next(): void {
    feedback.textContent = "";
    if (session.answers.length >= total) {
      finish();
    } else {
      renderQuestion();
    }
  }

  function finish(): void {
    finished = true;
    stopTimer();
    clearQuizSession(); // the quiz is over; nothing to resume
    recordStudyToday(); // finishing a quiz counts as studying

    const correct = session.answers.filter((a, i) => a === deck.cards[i].correctIndex).length;
    const timedOut = session.answers.filter((a) => a === null).length;
    const percent = Math.round((correct / total) * 100);
    const elapsed = Date.now() - session.startedAt;
    const isNewBest = saveBestScore(deck.id, percent);

    showResults({ correct, timedOut, percent, elapsed, isNewBest });
  }

  // --- results modal ---
  function showResults(r: {
    correct: number;
    timedOut: number;
    percent: number;
    elapsed: number;
    isNewBest: boolean;
  }): void {
    const dialog = document.createElement("dialog");
    dialog.className = "results";
    dialog.setAttribute("aria-labelledby", "results-title");

    const timedOutText = r.timedOut > 0 ? ` (${r.timedOut} timed out)` : "";
    const newBestHtml = r.isNewBest ? `<p class="badge">🎉 New best score!</p>` : "";

    dialog.innerHTML = `
      <h2 id="results-title">Quiz complete</h2>
      <p class="results-score">${r.correct} / ${total}</p>
      <p>${r.percent}% correct</p>
      <p>${pluralize(total - r.correct, "incorrect answer")}${timedOutText}</p>
      <p>Total time: ${formatDuration(r.elapsed)}</p>
      ${newBestHtml}
      <div class="card-actions">
        <button class="retry-btn">Try again</button>
        <button class="back-btn">Back to decks</button>
      </div>
    `;

    dialog.querySelector(".retry-btn")!.addEventListener("click", actions.onRetry);
    dialog.querySelector(".back-btn")!.addEventListener("click", () => dialog.close());

    // Esc and "Back to decks" both close the dialog, so one handler covers both.
    dialog.addEventListener("close", actions.onExit);

    root.append(dialog);
    dialog.showModal();
  }

  // --- input ---
  function onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1 && n <= optionButtons.length) {
      submit(n - 1);
    }
  }

  quitBtn.addEventListener("click", () => {
    if (confirm("Quit this quiz? Your progress will be lost.")) {
      clearQuizSession();
      actions.onExit();
    }
  });
  document.addEventListener("keydown", onKeyDown);

  // Start after the caller has put `root` in the DOM (showModal needs a connected element).
  queueMicrotask(next);

  return {
    element: root,
    destroy: () => {
      stopTimer();
      clearTimeout(advanceId);
      document.removeEventListener("keydown", onKeyDown);
    },
  };
}