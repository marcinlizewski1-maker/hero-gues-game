import { gameModes } from "./config/modes.js";
import { createClassicGame } from "./games/classic.js";
import { loadSuperheroes } from "./data/superheroes.js";
import { createStore } from "./state/store.js";
import { renderClassicGame, renderHome, renderMenu, renderMode } from "./ui/renderers.js";

const store = createStore({
  activeView: "menu",
  activeModeId: null,
  heroCollection: null,
  loading: true,
  characters: []
});

const menuView = document.querySelector("#menuView");
const gameContainer = document.querySelector("#gameContainer");
const homeButton = document.querySelector("#homeButton");
let classicGame = null;

function openMenu() {
  store.setState({
    activeView: "menu",
    activeModeId: null
  });
}

function openMode(modeId) {
  if (modeId === "classic") {
    const { heroCollection } = store.getState();

    if (heroCollection?.heroes?.length) {
      classicGame = createClassicGame(heroCollection);
    }
  }

  store.setState({
    activeView: "mode",
    activeModeId: modeId
  });
}

function restartClassicMode() {
  if (!classicGame) {
    const { heroCollection } = store.getState();

    if (!heroCollection?.heroes?.length) {
      return;
    }

    classicGame = createClassicGame(heroCollection);
  } else {
    classicGame.resetGame();
  }

  updateApp(store.getState());
}

function submitClassicGuess(guess) {
  if (!classicGame) {
    return;
  }

  classicGame.submitGuess(guess);
  updateApp(store.getState());
}

function updateApp(state) {
  renderMenu(menuView, gameModes, state.activeModeId, openMode);

  if (state.activeView === "menu") {
    homeButton.hidden = true;
    renderHome(gameContainer);
    return;
  }

  const selectedMode = gameModes.find((mode) => mode.id === state.activeModeId);

  if (!selectedMode) {
    openMenu();
    return;
  }

  homeButton.hidden = false;

  if (selectedMode.id === "classic") {
    if (state.dataStatus === "loading") {
      gameContainer.innerHTML = `
        <div class="placeholder-menu">
          <div>
            <div class="mode-badge">Loading</div>
            <h2 class="mode-title">Pobieranie bohaterow...</h2>
            <p>Classic uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p>
          </div>
        </div>
      `;
      return;
    }

    if (state.dataStatus === "error" || !classicGame) {
      gameContainer.innerHTML = `
        <div class="placeholder-menu">
          <div>
            <div class="mode-badge">Classic unavailable</div>
            <h2 class="mode-title">Nie udalo sie przygotowac trybu.</h2>
            <p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p>
          </div>
        </div>
      `;
      return;
    }

    renderClassicGame(gameContainer, classicGame.getState(), {
      onBack: openMenu,
      onRestart: restartClassicMode,
      onGuess: submitClassicGuess
    });
    return;
  }

  renderMode(gameContainer, selectedMode, openMenu);
}

homeButton.addEventListener("click", openMenu);
store.subscribe(updateApp);
updateApp(store.getState());

async function loadCharacters() {
  try {
    const response = await Promise.race([
      loadSuperheroes(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]);
    store.setState({
      heroCollection: response,
      characters: response.heroes || [],
      loading: false
    });
  } catch (error) {
    console.error("Characters load failed:", error);
    store.setState({
      loading: false
    });
  }
}

loadCharacters();
