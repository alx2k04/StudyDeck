import type { Theme } from "../types";
import { KEYS } from "./keys";
import { readJSON, writeJSON } from "./safeStorage";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function loadTheme(): Theme {
  // First visit: respect the OS setting. After that: respect the user's choice.
  const systemDefault: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  return readJSON("local", KEYS.theme, isTheme, systemDefault);
}

export function saveTheme(theme: Theme): void {
  writeJSON("local", KEYS.theme, theme);
}