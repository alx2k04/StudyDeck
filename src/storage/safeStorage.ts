export type StoreKind = "local" | "session";

function getStore(kind: StoreKind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // even *accessing* storage can throw in some browsers
  }
}

export function readJSON<T>(
  kind: StoreKind,
  key: string,
  validate: (value: unknown) => value is T,
  fallback: T
): T {
  try {
    const raw = getStore(kind)?.getItem(key);
    if (raw == null) return fallback; // missing key (null) or no storage (undefined)

    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback; // JSON.parse threw: corrupted data
  }
}

export function writeJSON(kind: StoreKind, key: string, value: unknown): boolean {
  try {
    const store = getStore(kind);
    if (!store) return false;
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; 
  }
}

export function removeKey(kind: StoreKind, key: string): void {
  try {
    getStore(kind)?.removeItem(key);
  } catch {
  }
}