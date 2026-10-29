import type { LoadState } from "../types";

type Listener = (state: LoadState) => void;

let state: LoadState = { status: "loading" };
const listeners = new Set<Listener>();

export function getState(): LoadState {
  return state;
}

export function setState(next: LoadState): void {
  state = next;
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}