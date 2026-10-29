import { getCurrentStreak } from "../storage/streak";
import { loadTheme, saveTheme } from "../storage/theme";
import type { Theme } from "../types";

export interface Header {
  element: HTMLElement;
  refresh: () => void; // re-read the streak from storage
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme; // sets <html data-theme="...">
}

export function createHeader(): Header {
  let theme = loadTheme();

  const element = document.createElement("header");
  element.className = "app-header";
  element.innerHTML = `
    <h1>StudyDeck</h1>
    <div class="app-header-right">
      <span class="badge streak"></span>
      <button class="theme-btn"></button>
    </div>
  `;

  const streak = element.querySelector<HTMLElement>(".streak")!;
  const themeBtn = element.querySelector<HTMLButtonElement>(".theme-btn")!;

  function renderTheme(): void {
    applyTheme(theme);
    const next = theme === "dark" ? "light" : "dark";
    themeBtn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    themeBtn.setAttribute("aria-label", `Switch to ${next} theme`);
  }

  function refresh(): void {
    const days = getCurrentStreak();
    streak.textContent = days > 0 ? `🔥 ${days}-day streak` : "No streak yet: study today!";
  }

  themeBtn.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    saveTheme(theme);
    renderTheme();
  });

  renderTheme();
  refresh();
  return { element, refresh };
}