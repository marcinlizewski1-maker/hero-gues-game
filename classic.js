const MAX_ATTEMPTS = 6;

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createComparison(label, guessedValue, targetValue) {
  const isCorrect = normalizeValue(guessedValue) === normalizeValue(targetValue);

  return {
    label,
    guessedValue: guessedValue || "Unknown",
    targetValue: targetValue || "Unknown",
    isCorrect
  };
}

function pickRandomHero(heroes) {
  return heroes[Math.floor(Math.random() * heroes.length)];
}

function buildHeroLookup(heroes) {
  return new Map(heroes.map((hero) => [normalizeValue(hero.name), hero]));
}

export function createClassicGame(heroCollection) {
  const heroes = heroCollection?.heroes ?? [];
  const heroLookup = buildHeroLookup(heroes);

  const state = {
    targetHero: pickRandomHero(heroes),
    attempts: [],
    status: "playing",
    message: ""
  };

  function getState() {
    return {
      ...state,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - state.attempts.length),
      heroNames: heroes.map((hero) => hero.name)
    };
  }

  function submitGuess(rawGuess) {
    if (state.status !== "playing") {
      return getState();
    }

    const trimmedGuess = rawGuess.trim();
    const guessedHero = heroLookup.get(normalizeValue(trimmedGuess));

    if (!trimmedGuess) {
      state.message = "Wpisz nazwe bohatera, zanim zatwierdzisz probe.";
      return getState();
    }

    if (!guessedHero) {
      state.message = "Nie znaleziono takiego bohatera w przygotowanej bazie Marvel/DC.";
      return getState();
    }

    const comparisons = [
      createComparison("Uniwersum", guessedHero.universe, state.targetHero.universe),
      createComparison("Plec", guessedHero.gender, state.targetHero.gender),
      createComparison("Alignment", guessedHero.alignment, state.targetHero.alignment)
    ];

    state.attempts.unshift({
      guessName: guessedHero.name,
      comparisons
    });

    state.message = "";

    if (guessedHero.id === state.targetHero.id) {
      state.status = "won";
      return getState();
    }

    if (state.attempts.length >= MAX_ATTEMPTS) {
      state.status = "lost";
    }

    return getState();
  }

  function resetGame() {
    state.targetHero = pickRandomHero(heroes);
    state.attempts = [];
    state.status = "playing";
    state.message = "";

    return getState();
  }

  return {
    getState,
    submitGuess,
    resetGame
  };
}
