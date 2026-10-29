export function renderLoading(): HTMLElement {
  const wrapper = document.createElement("section");
  wrapper.setAttribute("role", "status");
  wrapper.setAttribute("aria-live", "polite");
  wrapper.setAttribute("aria-label", "Loading decks");

  wrapper.innerHTML = `
    <div class="grid">
      ${'<div class="card skeleton"></div>'.repeat(6)}
    </div>
  `;

  return wrapper;
}

export function renderError(message: string, onRetry: () => void): HTMLElement {
  const wrapper = document.createElement("section");
  wrapper.className = "error-box";
  wrapper.setAttribute("role", "alert");

  wrapper.innerHTML = `
    <p>${message}</p>
    <button>Retry</button>
  `;

  wrapper.querySelector("button")!.addEventListener("click", onRetry);
  return wrapper;
}