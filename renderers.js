function createFeatureCards(features) {
  return features
    .map(
      (feature) => `
        <article class="feature-card">
          <h3>Feature</h3>
          <p class="mode-meta">${feature}</p>
        </article>
      `
    )
    .join("");
}

function createStats(stats) {
  return stats
    .map(
      (stat) => `
        <article class="status-card">
          <h3>${stat.title}</h3>
          <p class="mode-meta">${stat.value}</p>
        </article>
      `
    )
    .join("");
}

function createComparisonChips(comparisons) {
  return comparisons
    .map(
      (comparison) => `
        <li class="comparison-chip ${comparison.isCorrect ? "is-correct" : "is-wrong"}">
          <span>${comparison.label}</span>
          <strong>${comparison.guessedValue}</strong>
          <em>${comparison.isCorrect ? "poprawne" : "bledne"}</em>
        </li>
      `
    )
    .join("");
}

function createAttemptRows(attempts) {
  return attempts
    .map(
      (attempt, index) => `
        <article class="attempt-card">
          <div class="attempt-card-header">
            <h3>${attempt.guessName}</h3>
            <span>Proba ${attempts.length - index}</span>
          </div>
          <ul class="comparison-list">
            ${createComparisonChips(attempt.comparisons)}
          </ul>
        </article>
      `
    )
    .join("");
}

export function renderMenu(menuElement, modes, activeModeId, onSelect) {
  menuElement.innerHTML = modes
    .map(
      (mode) => `
        <button
          class="mode-card ${activeModeId === mode.id ? "is-active" : ""}"
          type="button"
          data-mode-id="${mode.id}"
        >
          <span class="mode-card-title">${mode.label}</span>
          <span class="mode-card-copy">${mode.summary}</span>
        </button>
      `
    )
    .join("");

  menuElement.querySelectorAll("[data-mode-id]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.modeId));
  });
}

export function renderHome(container) {
  container.innerHTML = `
    <div class="placeholder-menu">
      <div>
        <div class="mode-badge">Main Menu</div>
        <h2 class="mode-title">Wybierz tryb gry z panelu po lewej.</h2>
        <p>
          Kazdy przycisk otwiera osobny widok w tym samym kontenerze. Struktura aplikacji
          jest modularna, wiec mozna bez problemu dodac routing, zapis stanu lub bardziej
          rozbudowane komponenty.
        </p>
      </div>
    </div>
  `;
}

export function renderMode(container, mode, onBack) {
  container.innerHTML = `
    <div class="content-grid">
      <div class="content-header">
        <div>
          <div class="mode-badge">${mode.badge}</div>
          <h2 class="mode-title">${mode.label}</h2>
        </div>
        <button class="action-button" type="button" id="modeBackButton">Back to menu</button>
      </div>

      <p class="mode-description">${mode.description}</p>

      <section class="status-strip">
        ${createStats(mode.stats)}
      </section>

      <section class="feature-grid">
        ${createFeatureCards(mode.features)}
      </section>
    </div>
  `;

  container.querySelector("#modeBackButton").addEventListener("click", onBack);
}

export function renderClassicGame(container, gameState, handlers) {
  const resultLabel =
    gameState.status === "won"
      ? "Wygrana"
      : gameState.status === "lost"
        ? "Przegrana"
        : "W toku";

  const resultCopy =
    gameState.status === "won"
      ? `Trafione. Ukrytym bohaterem byl ${gameState.targetHero.name}.`
      : gameState.status === "lost"
        ? `Koniec prob. Szukanym bohaterem byl ${gameState.targetHero.name}.`
        : "Porownuj uniwersum, plec i alignment po kazdej probie.";

  container.innerHTML = `
    <div class="content-grid">
      <div class="content-header">
        <div>
          <div class="mode-badge">Classic Mode</div>
          <h2 class="mode-title">Zgadnij bohatera</h2>
        </div>
        <button class="action-button" type="button" id="modeBackButton">Back to menu</button>
      </div>

      <section class="classic-panel">
        <div class="classic-status">
          <article class="status-card">
            <h3>Limit prob</h3>
            <p class="mode-meta">${gameState.remainingAttempts} / 6 pozostalo</p>
          </article>
          <article class="status-card">
            <h3>Wynik</h3>
            <p class="mode-meta">${resultLabel}</p>
          </article>
        </div>

        <p class="mode-description">${resultCopy}</p>

        <form class="guess-form" id="classicGuessForm">
          <label class="guess-label" for="heroGuess">Wpisz nazwe bohatera</label>
          <div class="guess-row">
            <input
              class="guess-input"
              id="heroGuess"
              name="heroGuess"
              list="heroSuggestions"
              placeholder="Np. Batman, Spider-Man, Wonder Woman"
              autocomplete="off"
              ${gameState.status !== "playing" ? "disabled" : ""}
            >
            <button class="action-button" type="submit" ${gameState.status !== "playing" ? "disabled" : ""}>
              Sprawdz
            </button>
          </div>
          <datalist id="heroSuggestions">
            ${gameState.heroNames.map((name) => `<option value="${name}"></option>`).join("")}
          </datalist>
        </form>

        ${gameState.message ? `<p class="form-message">${gameState.message}</p>` : ""}

        <div class="classic-actions">
          <button class="action-button" type="button" id="restartClassicButton">Nowa runda</button>
        </div>
      </section>

      <section class="attempts-panel">
        <div class="attempts-header">
          <h3>Historia prob</h3>
          <p class="mode-meta">${gameState.attempts.length ? "Najnowsza proba jest na gorze." : "Jeszcze nie ma zadnych prob."}</p>
        </div>
        <div class="attempts-list">
          ${gameState.attempts.length ? createAttemptRows(gameState.attempts) : '<div class="empty-attempts">Czekamy na pierwsza odpowiedz.</div>'}
        </div>
      </section>
    </div>
  `;

  container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);
  container.querySelector("#restartClassicButton").addEventListener("click", handlers.onRestart);

  const form = container.querySelector("#classicGuessForm");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const guess = String(formData.get("heroGuess") ?? "");
    handlers.onGuess(guess);
    form.reset();
  });
}
