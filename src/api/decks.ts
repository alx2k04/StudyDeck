import type { Card, Deck } from "../types";

const API_URL = "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// --- never trust the network: validate the shape (same idea as Step 4) ---
function isCard(v: unknown): v is Card {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.question === "string" &&
    typeof c.answer === "string" &&
    Array.isArray(c.options) &&
    c.options.every((o) => typeof o === "string") &&
    Number.isInteger(c.correctIndex) &&
    (c.correctIndex as number) >= 0 &&
    (c.correctIndex as number) < c.options.length
  );
}

function isDeck(v: unknown): v is Deck {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    typeof d.title === "string" &&
    typeof d.category === "string" &&
    Array.isArray(d.cards) &&
    d.cards.every(isCard)
  );
}

export async function fetchDecks(): Promise<Deck[]> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/decks`);
  } catch {
    // fetch only rejects on network failure (server down, offline, CORS)
    throw new ApiError("Network error", 0);
  }

  // fetch does NOT reject on 404/500, so check this yourself
  if (!response.ok) {
    throw new ApiError(response.statusText || "Request failed", response.status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Response was not valid JSON", 502);
  }

  if (!Array.isArray(data) || !data.every(isDeck)) {
    throw new ApiError("Unexpected data shape", 502);
  }
  return data;
}