(function () {
  const gameModes = [
    {
      id: "classic",
      label: "Classic",
      badge: "Mode 01",
      summary: "Zgadywanie bohatera na podstawie cech.",
      description: "Classic to aktywny tryb gry oparty o losowanie postaci i porownywanie cech po kazdej probie.",
      stats: [
        { title: "Tempo", value: "Stabilne" },
        { title: "Poziom wejscia", value: "Latwy" },
        { title: "Rozbudowa", value: "Wysoka" }
      ],
      features: [
        "Losowanie jednego bohatera z bazy Marvel/DC",
        "Do 6 prob z informacja zwrotna po kazdej odpowiedzi",
        "Gotowe pod dalsza rozbudowe o kolejne wskazowki"
      ]
    },
    {
      id: "fight",
      label: "Fight",
      badge: "Mode 02",
      summary: "Tryb walki z miejscem na statystyki i akcje.",
      description: "Fight przygotowuje przestrzen na pasek zdrowia, wybor umiejetnosci oraz przebieg pojedynku.",
      stats: [
        { title: "Tempo", value: "Dynamiczne" },
        { title: "Ryzyko", value: "Srednie" },
        { title: "AI", value: "Gotowe pod integracje" }
      ],
      features: [
        "Sekcja pod mechanike ataku, obrony i cooldownow",
        "Latwo dodac animacje, pasek HP i log zdarzen",
        "Mozliwosc rozbudowy o przeciwnikow i bossow"
      ]
    },
    {
      id: "power",
      label: "Power",
      badge: "Mode 03",
      summary: "Panel mocy, ulepszen i efektow specjalnych.",
      description: "Power sprawdza sie jako ekran ulepszen i rozwoju postaci.",
      stats: [
        { title: "Energia", value: "98%" },
        { title: "Buffy", value: "3 aktywne" },
        { title: "Skalowanie", value: "Progresywne" }
      ],
      features: [
        "Miejsce na system levelowania i odblokowywania mocy",
        "Czytelny uklad pod karty umiejetnosci",
        "Dobry fundament pod profile postaci"
      ]
    },
    {
      id: "lore",
      label: "Lore",
      badge: "Mode 04",
      summary: "Sekcja fabuly, frakcji i historii swiata.",
      description: "Lore pozwala prezentowac historie swiata, wpisy dziennika i odblokowane informacje.",
      stats: [
        { title: "Archiwum", value: "12 wpisow" },
        { title: "Frakcje", value: "4 znane" },
        { title: "Sekrety", value: "2 odkryte" }
      ],
      features: [
        "Dobre miejsce na dialogi, logi i dokumenty",
        "Mozna dodac filtrowanie wpisow i rozdzialy",
        "Sprawdzi sie jako encyklopedia swiata"
      ]
    },
    {
      id: "daily",
      label: "Daily",
      badge: "Mode 05",
      summary: "Jedno wyzwanie dziennie z tym samym bohaterem dla wszystkich.",
      description: "Daily Challenge wybiera jednego bohatera na dany dzien i pozwala rozegrac tylko jedna pelna probe.",
      stats: [
        { title: "Reset", value: "Codziennie" },
        { title: "Podejscie", value: "1 na dzien" },
        { title: "Wspolny seed", value: "Tak" }
      ],
      features: [
        "Ten sam bohater dziennie dla wszystkich graczy",
        "Po zakonczeniu rundy wyzwanie blokuje sie do nastepnego dnia",
        "Wynik zapisuje sie w localStorage"
      ]
    }
  ];

  const SEO_CONFIG = {
    home: {
      title: "HeroGuess - Quiz o bohaterach Marvel i DC",
      description: "Nowoczesna gra webowa z trybami Classic, Fight, Power, Lore i Daily Challenge dla fanow Marvel i DC.",
      path: "/"
    },
    classic: {
      title: "Classic - zgadywanie bohatera | HeroGuess",
      description: "Tryb Classic w HeroGuess: zgaduj bohaterow Marvel i DC po cechach, porownaniach i wskazowkach.",
      path: "/?mode=classic"
    },
    fight: {
      title: "Fight - pojedynki bohaterow | HeroGuess",
      description: "Tryb Fight w HeroGuess: porownuj statystyki superbohaterow i wybieraj zwyciezce starcia.",
      path: "/?mode=fight"
    },
    power: {
      title: "Power - rozpoznaj bohatera po mocy | HeroGuess",
      description: "Tryb Power w HeroGuess: odgaduj bohatera Marvel lub DC po opisach mocy i odkrywanych wskazowkach.",
      path: "/?mode=power"
    },
    lore: {
      title: "Lore - zgadywanie po fabule | HeroGuess",
      description: "Tryb Lore w HeroGuess: odkrywaj fabularne wskazowki i odgaduj bohatera po historii i tle postaci.",
      path: "/?mode=lore"
    },
    daily: {
      title: "Daily Challenge - bohater dnia | HeroGuess",
      description: "Daily Challenge w HeroGuess: jeden wspolny bohater dnia, jedna runda i to samo wyzwanie dla wszystkich graczy.",
      path: "/?mode=daily"
    }
  };

  const popularHeroNames = new Set([
    "Batman", "Superman", "Wonder Woman", "Flash", "Green Lantern", "Aquaman", "Cyborg",
    "Robin", "Nightwing", "Batgirl", "Catwoman", "Harley Quinn", "Joker", "Lex Luthor",
    "Supergirl", "Green Arrow", "Black Canary", "Martian Manhunter", "Shazam", "Constantine",
    "Raven", "Starfire", "Beast Boy", "Blue Beetle", "Hawkman", "Hawkgirl", "Zatanna",
    "Poison Ivy", "Bane", "Deathstroke", "Darkseid", "Doomsday", "Brainiac", "Penguin",
    "Riddler", "Two-Face", "Scarecrow", "Red Hood", "Doctor Fate", "Black Adam", "Mera",
    "Booster Gold", "Static", "Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk",
    "Black Widow", "Hawkeye", "Wolverine", "Cyclops", "Jean Grey", "Storm", "Rogue",
    "Gambit", "Iceman", "Beast", "Nightcrawler", "Professor X", "Magneto", "Mystique",
    "Deadpool", "Punisher", "Daredevil", "Elektra", "Blade", "Ghost Rider", "Doctor Strange",
    "Scarlet Witch", "Vision", "Falcon", "Winter Soldier", "Black Panther", "Captain Marvel",
    "Ant-Man", "Wasp", "She-Hulk", "Moon Knight", "Nova", "Silver Surfer", "Thanos", "Loki",
    "Venom", "Carnage", "Green Goblin", "Doctor Octopus", "Kingpin", "Ultron", "Apocalypse",
    "Cable", "Domino", "Colossus", "Psylocke", "Kitty Pryde", "Emma Frost", "Luke Cage",
    "Iron Fist", "Jessica Jones", "Nick Fury", "War Machine", "Shang-Chi", "Ms Marvel",
    "Sentry", "Namor", "Black Bolt", "Thing", "Human Torch", "Invisible Woman",
    "Mr Fantastic", "Doctor Doom", "Galactus", "Rocket Raccoon", "Groot", "Star-Lord",
    "Gamora", "Drax the Destroyer", "Nebula", "Mantis", "Adam Warlock", "Quicksilver"
  ]);

  const HERO_POLISH_NAMES = {
    "Spider-Man": "Człowiek-Pająk",
    "Captain America": "Kapitan Ameryka",
    "Black Widow": "Czarna Wdowa",
    "Winter Soldier": "Zimowy Żołnierz",
    "Doctor Strange": "Doktor Strange",
    "Scarlet Witch": "Szkarłatna Wiedźma",
    "Black Panther": "Czarna Pantera",
    "Captain Marvel": "Kapitan Marvel",
    "Wasp": "Osa",
    "Silver Surfer": "Srebrny Surfer",
    "Green Goblin": "Zielony Goblin",
    "Human Torch": "Ludzka Pochodnia",
    "Invisible Woman": "Niewidzialna Kobieta",
    "Thing": "Rzecz",
    "Mr Fantastic": "Pan Fantastyczny",
    "Hawkeye": "Sokole Oko",
    "Wolverine": "Rosomak",
    "Cyclops": "Cyklop",
    "Beast": "Bestia",
    "Professor X": "Profesor X",
    "Iron Fist": "Żelazna Pięść",
    "Green Lantern": "Zielona Latarnia",
    "Green Arrow": "Zielona Strzała",
    "Black Canary": "Czarny Kanarek",
    "Catwoman": "Kobieta-Kot",
    "Martian Manhunter": "Marsjański Łowca",
    "Blue Beetle": "Błękitny Żuk",
    "Hawkgirl": "Kobieta-Jastrząb",
    "Doctor Fate": "Doktor Fate",
    "Power Girl": "Power Girl",
    "Power Ring": "Power Ring",
    "Black Adam": "Czarny Adam",
    "Black Bolt": "Black Bolt",
    "Ghost Rider": "Ghost Rider",
    "War Machine": "War Machine",
    "Moon Knight": "Moon Knight",
    "Doctor Octopus": "Doktor Octopus",
    "Fight": "Fight",
    "Flash": "Flash",
    "Batman": "Batman",
    "Superman": "Superman",
    "Wonder Woman": "Wonder Woman",
    "Aquaman": "Aquaman",
    "Cyborg": "Cyborg",
    "Robin": "Robin",
    "Nightwing": "Nightwing",
    "Batgirl": "Batgirl",
    "Harley Quinn": "Harley Quinn",
    "Joker": "Joker",
    "Lex Luthor": "Lex Luthor",
    "Supergirl": "Supergirl",
    "Shazam": "Shazam",
    "Constantine": "Constantine",
    "Raven": "Raven",
    "Starfire": "Starfire",
    "Beast Boy": "Beast Boy",
    "Hawkman": "Hawkman",
    "Zatanna": "Zatanna",
    "Poison Ivy": "Poison Ivy",
    "Bane": "Bane",
    "Deathstroke": "Deathstroke",
    "Darkseid": "Darkseid",
    "Doomsday": "Doomsday",
    "Brainiac": "Brainiac",
    "Penguin": "Pingwin",
    "Riddler": "Człowiek-Zagadka",
    "Two-Face": "Dwie Twarze",
    "Scarecrow": "Strach na Wróble",
    "Red Hood": "Red Hood",
    "Iron Man": "Iron Man",
    "Thor": "Thor",
    "Hulk": "Hulk",
    "Jean Grey": "Jean Grey",
    "Storm": "Storm",
    "Rogue": "Rogue",
    "Gambit": "Gambit",
    "Iceman": "Iceman",
    "Nightcrawler": "Nightcrawler",
    "Magneto": "Magneto",
    "Mystique": "Mystique",
    "Deadpool": "Deadpool",
    "Punisher": "Punisher",
    "Daredevil": "Daredevil",
    "Elektra": "Elektra",
    "Blade": "Blade",
    "Vision": "Vision",
    "Falcon": "Falcon",
    "Ant-Man": "Ant-Man",
    "She-Hulk": "She-Hulk",
    "Nova": "Nova",
    "Thanos": "Thanos",
    "Loki": "Loki",
    "Venom": "Venom",
    "Carnage": "Carnage",
    "Kingpin": "Kingpin",
    "Ultron": "Ultron",
    "Apocalypse": "Apocalypse",
    "Cable": "Cable",
    "Domino": "Domino",
    "Colossus": "Colossus",
    "Psylocke": "Psylocke",
    "Kitty Pryde": "Kitty Pryde",
    "Emma Frost": "Emma Frost",
    "Luke Cage": "Luke Cage",
    "Jessica Jones": "Jessica Jones",
    "Nick Fury": "Nick Fury",
    "Shang-Chi": "Shang-Chi",
    "Ms Marvel": "Ms. Marvel",
    "Sentry": "Sentry",
    "Namor": "Namor",
    "Doctor Doom": "Doktor Doom",
    "Galactus": "Galactus",
    "Rocket Raccoon": "Rocket",
    "Groot": "Groot",
    "Star-Lord": "Star-Lord",
    "Gamora": "Gamora",
    "Drax the Destroyer": "Drax Niszczyciel",
    "Nebula": "Nebula",
    "Mantis": "Mantis",
    "Adam Warlock": "Adam Warlock",
    "Quicksilver": "Quicksilver"
  };

  const HERO_POLISH_NAME_OVERRIDES = {
    "Spider-Man": "Spider-Man",
    "Iron Man": "Iron Man",
    "Batman": "Batman",
    "Superman": "Superman",
    "Wonder Woman": "Wonder Woman",
    "Flash": "Flash",
    "Thor": "Thor",
    "Hulk": "Hulk",
    "Deadpool": "Deadpool",
    "Daredevil": "Daredevil",
    "Punisher": "Punisher",
    "Blade": "Blade",
    "Falcon": "Falcon",
    "Moon Knight": "Moon Knight",
    "Ghost Rider": "Ghost Rider",
    "Star-Lord": "Star-Lord",
    "Rocket Raccoon": "Rocket",
    "Groot": "Groot",
    "Harley Quinn": "Harley Quinn",
    "Joker": "Joker",
    "Catwoman": "Catwoman",
    "Nightwing": "Nightwing",
    "Robin": "Robin",
    "Black Adam": "Black Adam",
    "Winter Soldier": "Zimowy Zolnierz",
    "Scarlet Witch": "Scarlet Witch",
    "Iron Fist": "Zelazna Piesc",
    "Green Arrow": "Green Arrow",
    "Martian Manhunter": "Marsjanski Lowca",
    "Blue Beetle": "Blekitny Zuk",
    "Hawkgirl": "Kobieta-Jastrzab",
    "Riddler": "Czlowiek-Zagadka",
    "Scarecrow": "Strach na Wroble"
  };

  const TEAM_POLISH_NAMES = {
    "Avengers": "Avengers",
    "Justice League": "Liga Sprawiedliwosci",
    "Guardians of the Galaxy": "Straznicy Galaktyki",
    "Fantastic Four": "Fantastyczna Czworka",
    "Suicide Squad": "Legion Samobojcow",
    "Teen Titans": "Mlodzi Tytani",
    "Green Lantern Corps": "Korpus Zielonych Latarni",
    "X-Men": "X-Men",
    "X-Force": "X-Force",
    "Defenders": "Defenders",
    "Inhumans": "Inhumans",
    "Thunderbolts": "Thunderbolts",
    "Sinister Six": "Sinister Six",
    "Bat Family": "Bat Family",
    "Independent": "Niezrzeszony"
  };

  function createStore(initialState) {
    let state = { ...initialState };
    const listeners = new Set();
    return {
      getState() {
        return state;
      },
      setState(patch) {
        state = { ...state, ...patch };
        listeners.forEach(function (listener) {
          listener(state);
        });
      },
      subscribe(listener) {
        listeners.add(listener);
        return function unsubscribe() {
          listeners.delete(listener);
        };
      }
    };
  }

  const SUPERHERO_API_URL = "https://akabab.github.io/superhero-api/api/all.json";
  const API_BASE_URL = window.HEROGUESS_API_URL || "https://hero-gues-game1.onrender.com";
  const ALLOWED_PUBLISHERS = new Set(["Marvel Comics", "DC Comics"]);
  const MAX_ATTEMPTS = 6;
  const MAX_HERO_COUNT = 150;
  const PROGRESSION_STORAGE_KEY = "marcina-progress-v1";
  const NICKNAME_STORAGE_KEY = "marcina-nickname";
  const AUTH_TOKEN_STORAGE_KEY = "marcina-auth-token-v1";
  const AUTH_VIEW_STORAGE_KEY = "marcina-auth-view-v1";
  let heroesCache = null;
  let classicGame = null;
  let fightGame = null;
  let powerGame = null;
  let loreGame = null;
  let dailyGame = null;
  let classicProgressRecorded = false;
  let powerProgressRecorded = false;
  let loreProgressRecorded = false;
  const SESSION_TOTAL_QUESTIONS = 10;
  const modeQuestionProgress = {
    classic: 1,
    fight: 1,
    power: 1,
    lore: 1,
    daily: 1
  };

  function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function trackEvent(name, params) {
    const safeParams = params || {};

    if (typeof gtag === "function") {
      gtag("event", name, {
        event_category: "game",
        ...safeParams
      });
    }

    console.log("Event sent:", name, safeParams);
  }

  function getFeedbackVariant(message, status) {
    if (status === "won" || (message && message.indexOf("✔️") === 0)) {
      return "success";
    }

    if (status === "lost" || (message && message.indexOf("❌") === 0)) {
      return "danger";
    }

    return "neutral";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getPolishHeroName(name) {
    return HERO_POLISH_NAME_OVERRIDES[name] || HERO_POLISH_NAMES[name] || name;
  }

  function getPolishTeamName(team) {
    return TEAM_POLISH_NAMES[team] || team;
  }

  function hashString(value) {
    let hash = 0;

    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }

    return hash;
  }

  function loadSavedProgress() {
    try {
      const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);

      if (!raw) {
        return {
          streak: 0,
          points: 0,
          history: [],
          dailyChallenge: null,
          dailyChallengeResult: null
        };
      }

      const parsed = JSON.parse(raw);

      return {
        streak: parsed.streak || 0,
        points: parsed.points || 0,
        history: Array.isArray(parsed.history) ? parsed.history : [],
        dailyChallenge: parsed.dailyChallenge || null,
        dailyChallengeResult: parsed.dailyChallengeResult || null
      };
    } catch (error) {
      return {
        streak: 0,
        points: 0,
        history: [],
        dailyChallenge: null,
        dailyChallengeResult: null
      };
    }
  }

  function loadNickname() {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) || "Guest";
  }

  function loadAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
  }

  function saveAuthToken(token) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }

  function loadAuthView() {
    return localStorage.getItem(AUTH_VIEW_STORAGE_KEY) || "login";
  }

  function saveAuthView(view) {
    localStorage.setItem(AUTH_VIEW_STORAGE_KEY, view);
  }

  function saveNickname(nickname) {
    localStorage.setItem(NICKNAME_STORAGE_KEY, nickname);
  }

  function saveProgress(progress) {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progress));
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDifficultyMultiplier(mode, difficulty) {
    if (mode === "classic") {
      return 1.2;
    }

    if (mode === "lore") {
      return 1.3;
    }

    return {
      easy: 1,
      medium: 1.5,
      hard: 2
    }[difficulty] || 1;
  }

  function calculateAwardedPoints(config) {
    if (!config.won) {
      return 0;
    }

    const base = 100;
    const attemptsBonus = Math.max(0, (config.maxAttempts - config.attemptsUsed) * 20);
    const multiplier = getDifficultyMultiplier(config.mode, config.difficulty);

    return Math.round((base + attemptsBonus) * multiplier);
  }

  function buildDailyChallenge(heroes, existingDailyChallenge) {
    const today = getTodayKey();

    if (existingDailyChallenge && existingDailyChallenge.date === today) {
      return existingDailyChallenge;
    }

    const seed = hashString(today + "-marcina-daily");
    const hero = heroes[seed % heroes.length];

    return {
      date: today,
      heroId: hero.id,
      heroName: hero.localizedName
    };
  }

  function createProgressionManager() {
    let progress = loadSavedProgress();

    function getState() {
      return progress;
    }

    function syncDailyChallenge(heroes) {
      progress = {
        ...progress,
        dailyChallenge: buildDailyChallenge(heroes, progress.dailyChallenge),
        dailyChallengeResult: progress.dailyChallengeResult && progress.dailyChallengeResult.date === getTodayKey()
          ? progress.dailyChallengeResult
          : null
      };
      saveProgress(progress);
      return progress;
    }

    function completeDailyChallenge(result) {
      progress = {
        ...progress,
        dailyChallengeResult: {
          date: getTodayKey(),
          won: result.won,
          attemptsUsed: result.attemptsUsed,
          heroName: result.heroName
        }
      };

      saveProgress(progress);
      return progress;
    }

    function recordGame(result) {
      const awardedPoints = calculateAwardedPoints(result);
      const updatedHistory = [
        {
          timestamp: new Date().toISOString(),
          mode: result.mode,
          difficulty: result.difficulty || "default",
          won: result.won,
          attemptsUsed: result.attemptsUsed,
          points: awardedPoints
        }
      ].concat(progress.history).slice(0, 25);

      progress = {
        ...progress,
        streak: result.won ? progress.streak + 1 : 0,
        points: progress.points + awardedPoints,
        history: updatedHistory
      };

      saveProgress(progress);
      return progress;
    }

    return {
      getState: getState,
      syncDailyChallenge: syncDailyChallenge,
      recordGame: recordGame,
      completeDailyChallenge: completeDailyChallenge
    };
  }

  function getAuthHeaders(token) {
    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    return headers;
  }

  async function requestJson(path, options) {
    const response = await fetch(API_BASE_URL + path, options || {});
    const rawText = await response.text();
    let data = null;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (_error) {
        data = null;
      }
    }

    if (!response.ok) {
      const message =
        (data && data.error) ||
        (rawText ? rawText.slice(0, 180) : "") ||
        ("HTTP " + response.status);

      throw new Error(message);
    }

    return data;
  }

  function warmUpBackend() {
    return requestJson("/health").catch(function (error) {
      console.warn("Backend warmup failed:", error.message);
      return null;
    });
  }

  async function fetchLeaderboard(token) {
    return requestJson("/leaderboard", {
      headers: getAuthHeaders(token)
    });
  }

  async function loginUser(payload) {
    return requestJson("/login", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  }

  async function registerUser(payload) {
    return requestJson("/register", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  }

  async function fetchCurrentUser(token) {
    return requestJson("/me", {
      headers: getAuthHeaders(token)
    });
  }

  async function syncUserProgress(token, progress) {
    return requestJson("/me/progress", {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        points: progress.points,
        streak: progress.streak
      })
    });
  }

  async function fetchAdminUsers(token) {
    return requestJson("/admin/users", {
      headers: getAuthHeaders(token)
    });
  }

  async function updateAdminPoints(token, userId, delta) {
    return requestJson("/user/" + userId + "/points", {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ delta: delta })
    });
  }

  async function updateAdminBan(token, userId, banned) {
    return requestJson("/user/" + userId + "/ban", {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ banned: banned })
    });
  }

  function containsAny(text, values) {
    return values.some(function (value) {
      return text.includes(value);
    });
  }

  function pickMainAbilityType(stats) {
    const abilityMap = {
      strength: stats.strength || 0,
      speed: stats.speed || 0,
      intelligence: stats.intelligence || 0,
      magic: stats.power || 0
    };

    return Object.keys(abilityMap).reduce(function (bestKey, key) {
      return abilityMap[key] > abilityMap[bestKey] ? key : bestKey;
    }, "strength");
  }

  function detectCharacterType(hero) {
    const race = normalizeValue(hero.appearance && hero.appearance.race);
    const aliases = (hero.biography && hero.biography.aliases) || [];
    const connections = hero.connections || {};
    const sourceText = [
      race,
      normalizeValue(hero.work && hero.work.occupation),
      normalizeValue(connections.groupAffiliation),
      normalizeValue(connections.relatives),
      normalizeValue((aliases || []).join(" "))
    ].join(" ");

    if (race.includes("mutant") || sourceText.includes("mutant")) {
      return "mutant";
    }

    if (
      race.includes("alien") ||
      race.includes("kryptonian") ||
      race.includes("martian") ||
      race.includes("tamaranean") ||
      race.includes("asgardian") ||
      race.includes("new god") ||
      race.includes("eternal") ||
      race.includes("xenomorph") ||
      race.includes("badoon")
    ) {
      return "alien";
    }

    if (
      sourceText.includes("cyborg") ||
      sourceText.includes("android") ||
      sourceText.includes("enhanced") ||
      sourceText.includes("experiment") ||
      sourceText.includes("super soldier") ||
      sourceText.includes("gamma") ||
      sourceText.includes("metahuman") ||
      sourceText.includes("inhuman")
    ) {
      return "enhanced";
    }

    return "human";
  }

  function detectCombatStyle(hero) {
    const stats = hero.powerstats || {};
    const power = stats.power || 0;
    const combat = stats.combat || 0;
    const strength = stats.strength || 0;
    const intelligence = stats.intelligence || 0;
    const speed = stats.speed || 0;
    const biography = hero.biography || {};
    const work = hero.work || {};
    const text = [
      normalizeValue(hero.name),
      normalizeValue(biography.fullName),
      normalizeValue((biography.aliases || []).join(" ")),
      normalizeValue(work.occupation)
    ].join(" ");

    if (
      text.includes("doctor strange") ||
      text.includes("zatanna") ||
      text.includes("constantine") ||
      text.includes("scarlet witch") ||
      text.includes("fate") ||
      text.includes("raven") ||
      text.includes("loki") ||
      text.includes("shazam") ||
      text.includes("adam warlock") ||
      power >= 90
    ) {
      return "magic";
    }

    if (
      text.includes("iron man") ||
      text.includes("batman") ||
      text.includes("cyborg") ||
      text.includes("war machine") ||
      text.includes("blue beetle") ||
      text.includes("rocket") ||
      intelligence >= 85
    ) {
      return "tech";
    }

    if (speed >= 75 || text.includes("green arrow") || text.includes("hawkeye") || text.includes("punisher")) {
      return "ranged";
    }

    if (combat >= 70 || strength >= 70) {
      return "melee";
    }

    return power >= 60 ? "magic" : "melee";
  }

  function detectPrimaryTeam(hero) {
    const canonicalName = getCanonicalHeroName(hero);
    const publisher = normalizeValue(hero.biography && hero.biography.publisher);
    const text = [
      normalizeValue(canonicalName),
      publisher,
      normalizeValue(hero.connections && hero.connections.groupAffiliation),
      normalizeValue(hero.biography && (hero.biography.aliases || []).join(" ")),
      normalizeValue(hero.connections && hero.connections.relatives)
    ].join(" ");

    const teamRules = [
      { team: "Justice League", tokens: ["justice league", "jla", "justice league of america"] },
      { team: "Bat Family", tokens: ["bat family", "batman family", "wayne family"] },
      { team: "Teen Titans", tokens: ["teen titans", "titans"] },
      { team: "Suicide Squad", tokens: ["suicide squad", "task force x"] },
      { team: "Green Lantern Corps", tokens: ["green lantern corps"] },
      { team: "Avengers", tokens: ["avengers", "new avengers", "mighty avengers", "west coast avengers"] },
      { team: "X-Men", tokens: ["x-men", "astonishing x-men", "uncanny x-men"] },
      { team: "X-Force", tokens: ["x-force"] },
      { team: "Fantastic Four", tokens: ["fantastic four"] },
      { team: "Guardians of the Galaxy", tokens: ["guardians of the galaxy"] },
      { team: "Defenders", tokens: ["defenders", "heroes for hire"] },
      { team: "Thunderbolts", tokens: ["thunderbolts"] },
      { team: "Inhumans", tokens: ["inhumans", "inhuman royal family"] },
      { team: "Sinister Six", tokens: ["sinister six"] }
    ];

    const matchedRule = teamRules.find(function (rule) {
      return containsAny(text, rule.tokens);
    });

    if (matchedRule) {
      return matchedRule.team;
    }

    const nameFallbacks = [
      { team: "Justice League", names: ["batman", "superman", "wonder woman", "flash", "aquaman", "cyborg", "martian manhunter", "green lantern"] },
      { team: "Bat Family", names: ["robin", "nightwing", "batgirl", "red hood", "red robin", "batwoman", "huntress", "catwoman"] },
      { team: "Teen Titans", names: ["raven", "starfire", "beast boy", "kid flash", "aqualad"] },
      { team: "Avengers", names: ["iron man", "captain america", "thor", "hulk", "black widow", "hawkeye", "vision", "falcon", "war machine", "scarlet witch", "ant-man", "wasp", "captain marvel", "she-hulk"] },
      { team: "X-Men", names: ["wolverine", "cyclops", "jean grey", "storm", "rogue", "gambit", "iceman", "beast", "nightcrawler", "professor x", "colossus", "psylocke", "kitty pryde", "emma frost", "archangel", "bishop", "x-23"] },
      { team: "X-Force", names: ["deadpool", "cable", "domino"] },
      { team: "Fantastic Four", names: ["thing", "human torch", "invisible woman", "mr fantastic"] },
      { team: "Guardians of the Galaxy", names: ["star-lord", "gamora", "rocket raccoon", "groot", "drax the destroyer", "mantis", "nebula", "adam warlock"] },
      { team: "Defenders", names: ["daredevil", "jessica jones", "iron fist", "luke cage", "doctor strange"] },
      { team: "Inhumans", names: ["black bolt", "medusa", "ms marvel"] },
      { team: "Suicide Squad", names: ["harley quinn", "deadshot", "captain boomerang"] },
      { team: "Sinister Six", names: ["doctor octopus", "green goblin", "venom", "carnage"] }
    ];

    const normalizedName = normalizeValue(canonicalName);
    const matchedFallback = nameFallbacks.find(function (rule) {
      return rule.names.includes(normalizedName);
    });

    return matchedFallback ? matchedFallback.team : "Independent";
  }

  function buildFormerTeams(hero, primaryTeam) {
    const text = normalizeValue(hero.connections && hero.connections.groupAffiliation);
    const formerTeams = [];
    const teamMappings = [
      { team: "Justice League", tokens: ["justice league", "jla", "justice league of america"] },
      { team: "Bat Family", tokens: ["bat family", "batman family"] },
      { team: "Teen Titans", tokens: ["teen titans", "titans"] },
      { team: "Suicide Squad", tokens: ["suicide squad", "task force x"] },
      { team: "Green Lantern Corps", tokens: ["green lantern corps"] },
      { team: "Avengers", tokens: ["avengers", "new avengers", "mighty avengers", "west coast avengers"] },
      { team: "X-Men", tokens: ["x-men", "astonishing x-men", "uncanny x-men"] },
      { team: "X-Force", tokens: ["x-force"] },
      { team: "Fantastic Four", tokens: ["fantastic four"] },
      { team: "Guardians of the Galaxy", tokens: ["guardians of the galaxy"] },
      { team: "Defenders", tokens: ["defenders", "heroes for hire"] },
      { team: "Thunderbolts", tokens: ["thunderbolts"] },
      { team: "Inhumans", tokens: ["inhumans", "inhuman royal family"] },
      { team: "Sinister Six", tokens: ["sinister six"] }
    ];

    teamMappings.forEach(function (rule) {
      if (rule.team !== primaryTeam && containsAny(text, rule.tokens)) {
        formerTeams.push(rule.team);
      }
    });

    return formerTeams;
  }

  function calculatePowerLevel(stats) {
    const total =
      (stats.intelligence || 0) +
      (stats.strength || 0) +
      (stats.speed || 0) +
      (stats.durability || 0) +
      (stats.power || 0) +
      (stats.combat || 0);

    return clamp(Math.round(total / 6), 0, 100);
  }

  function calculateIntelligenceLevel(stats) {
    return clamp(Math.round((stats.intelligence || 0) / 10), 0, 10);
  }

  function detectMobility(hero) {
    const speed = (hero.powerstats && hero.powerstats.speed) || 0;
    const text = [
      normalizeValue(hero.name),
      normalizeValue(hero.work && hero.work.occupation),
      normalizeValue(hero.biography && hero.biography.fullName),
      normalizeValue(hero.appearance && hero.appearance.race),
      normalizeValue(hero.connections && hero.connections.groupAffiliation)
    ].join(" ");

    if (
      text.includes("flight") ||
      text.includes("pilot") ||
      text.includes("lantern") ||
      text.includes("superman") ||
      text.includes("supergirl") ||
      text.includes("thor") ||
      text.includes("captain marvel") ||
      text.includes("falcon") ||
      text.includes("silver surfer") ||
      text.includes("martian") ||
      text.includes("hawk") ||
      text.includes("angel")
    ) {
      return speed >= 70 ? "hybrid" : "air";
    }

    if (speed >= 80) {
      return "hybrid";
    }

    return "ground";
  }

  function detectPowerSource(hero) {
    const race = normalizeValue(hero.appearance && hero.appearance.race);
    const text = [
      race,
      normalizeValue(hero.name),
      normalizeValue(hero.work && hero.work.occupation),
      normalizeValue(hero.biography && hero.biography.fullName),
      normalizeValue(hero.connections && hero.connections.groupAffiliation),
      normalizeValue(hero.connections && hero.connections.relatives),
      normalizeValue(hero.biography && (hero.biography.aliases || []).join(" "))
    ].join(" ");

    if (
      text.includes("magic") ||
      text.includes("sorcer") ||
      text.includes("witch") ||
      text.includes("fate") ||
      text.includes("shazam") ||
      text.includes("loki") ||
      text.includes("raven") ||
      text.includes("constantine") ||
      text.includes("zatanna")
    ) {
      return "magic";
    }

    if (
      text.includes("mutant") ||
      text.includes("x-gene") ||
      text.includes("metahuman")
    ) {
      return "mutation";
    }

    if (
      race.includes("alien") ||
      race.includes("kryptonian") ||
      race.includes("martian") ||
      race.includes("asgardian") ||
      race.includes("new god") ||
      race.includes("eternal") ||
      race.includes("tamaranean") ||
      race.includes("inhuman")
    ) {
      return "alien";
    }

    if (
      text.includes("armor") ||
      text.includes("technology") ||
      text.includes("inventor") ||
      text.includes("scientist") ||
      text.includes("engineer") ||
      text.includes("cyborg") ||
      text.includes("android") ||
      text.includes("iron man") ||
      text.includes("war machine") ||
      text.includes("blue beetle")
    ) {
      return "tech";
    }

    return "training";
  }

  function detectEra(hero) {
    const id = hero.id || 0;
    const text = [
      normalizeValue(hero.name),
      normalizeValue(hero.biography && hero.biography.fullName),
      normalizeValue(hero.work && hero.work.occupation)
    ].join(" ");

    if (
      id <= 120 ||
      text.includes("captain america") ||
      text.includes("superman") ||
      text.includes("batman") ||
      text.includes("wonder woman") ||
      text.includes("namor") ||
      text.includes("human torch")
    ) {
      return "old";
    }

    if (
      id >= 550 ||
      text.includes("x-23") ||
      text.includes("agent venom") ||
      text.includes("ms marvel") ||
      text.includes("kid flash") ||
      text.includes("red robin")
    ) {
      return "new";
    }

    return "modern";
  }

  function getCanonicalHeroName(hero) {
    const publisher = hero.biography && hero.biography.publisher ? hero.biography.publisher : "";

    // W bazie API wystepuja historyczne / zduplikowane nazwy.
    // Dla wspolczesnego i czytelnego UI rozdzielamy je na kanoniczne wpisy.
    if (hero.name === "Captain Marvel" && publisher === "DC Comics") {
      return "Shazam";
    }

    return hero.name;
  }

  function toHeroRecord(hero) {
    const stats = hero.powerstats || {};
    const primaryTeam = detectPrimaryTeam(hero);
    const canonicalName = getCanonicalHeroName(hero);

    return {
      id: hero.id,
      name: canonicalName,
      originalName: hero.name,
      localizedName: getPolishHeroName(canonicalName),
      fullName: hero.biography && hero.biography.fullName ? hero.biography.fullName : "",
      aliases: hero.biography && hero.biography.aliases ? hero.biography.aliases.slice(0, 4) : [],
      occupation: hero.work && hero.work.occupation ? hero.work.occupation : "",
      gender: hero.appearance && hero.appearance.gender ? hero.appearance.gender : "Unknown",
      universe: hero.biography && hero.biography.publisher ? hero.biography.publisher : "Unknown",
      alignment: hero.biography && hero.biography.alignment ? hero.biography.alignment : "unknown",
      characterType: detectCharacterType(hero),
      combatStyle: detectCombatStyle(hero),
      powerLevel: calculatePowerLevel(stats),
      intelligence: calculateIntelligenceLevel(stats),
      mobility: detectMobility(hero),
      powerSource: detectPowerSource(hero),
      era: detectEra(hero),
      mainAbilityType: pickMainAbilityType(stats),
      team: primaryTeam,
      localizedTeam: getPolishTeamName(primaryTeam),
      formerTeams: buildFormerTeams(hero, primaryTeam),
      stats: {
        strength: stats.strength || 0,
        speed: stats.speed || 0,
        intelligence: stats.intelligence || 0,
        durability: stats.durability || 0,
        combat: stats.combat || 0,
        power: stats.power || 0
      }
    };
  }

  async function loadSuperheroes() {
    if (heroesCache) {
      return heroesCache;
    }

    const response = await fetch(SUPERHERO_API_URL);
    if (!response.ok) {
      throw new Error("Nie udalo sie pobrac danych bohaterow.");
    }

    const allHeroes = await response.json();
    const filtered = allHeroes
      .filter(function (hero) {
        return ALLOWED_PUBLISHERS.has(hero.biography && hero.biography.publisher);
      })
      .filter(function (hero) {
        return popularHeroNames.has(hero.name);
      })
      .slice(0, MAX_HERO_COUNT)
      .map(toHeroRecord);

    heroesCache = {
      fetchedAt: new Date().toISOString(),
      total: filtered.length,
      heroes: filtered
    };

    console.log("Marvel/DC heroes loaded:", heroesCache);
    return heroesCache;
  }

  function createClassicGame(heroCollection) {
    const heroes = heroCollection.heroes;
    const lookup = new Map(heroes.map(function (hero) {
      return [normalizeValue(hero.name), hero];
    }));
    heroes.forEach(function (hero) {
      if (hero.originalName) {
        lookup.set(normalizeValue(hero.originalName), hero);
      }
      lookup.set(normalizeValue(hero.localizedName), hero);
    });
    const state = {
      targetHero: heroes[Math.floor(Math.random() * heroes.length)],
      attempts: [],
      status: "playing",
      message: ""
    };

    function getState() {
      const lastAttempt = state.attempts[0] || null;

      return {
        targetHero: state.targetHero,
        attempts: state.attempts.slice(),
        status: state.status,
        message: state.message,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - state.attempts.length),
        attemptsUsed: state.attempts.length,
        narrowingHint: lastAttempt ? lastAttempt.narrowingHint : "Pierwsza proba odsloni profil ukrytego bohatera.",
        heroNames: heroes.map(function (hero) {
          return hero.localizedName;
        })
      };
    }

    function compareExact(label, guessedValue, targetValue) {
      const isCorrect = normalizeValue(guessedValue) === normalizeValue(targetValue);

      return {
        label: label,
        guessedValue: guessedValue,
        status: isCorrect ? "correct" : "wrong",
        feedback: isCorrect ? "✔️ identyczne" : "❌ rozne"
      };
    }

    function comparePowerLevel(guessedValue, targetValue) {
      const delta = Math.abs(guessedValue - targetValue);
      let status = "wrong";
      let feedback = "❌ rozne";

      if (delta === 0) {
        status = "correct";
        feedback = "✔️ identyczne";
      } else if (delta <= 8) {
        status = "partial";
        feedback = "🟡 bardzo blisko";
      } else if (delta <= 15) {
        status = "partial";
        feedback = "🟡 podobny poziom";
      }

      return {
        label: "Power level",
        guessedValue: String(guessedValue),
        status: status,
        feedback: feedback
      };
    }

    function compareIntelligence(guessedValue, targetValue) {
      const delta = Math.abs(guessedValue - targetValue);
      let status = "wrong";
      let feedback = "❌ rozne";

      if (delta === 0) {
        status = "correct";
        feedback = "✔️ identyczne";
      } else if (delta === 1) {
        status = "partial";
        feedback = "🟡 podobne";
      }

      return {
        label: "Intelligence",
        guessedValue: String(guessedValue),
        status: status,
        feedback: feedback
      };
    }

    function compareTeam(guessedHero, targetHero) {
      const guessedTeam = guessedHero.team;
      const targetTeam = targetHero.team;
      const targetFormerTeams = targetHero.formerTeams || [];
      const guessedFormerTeams = guessedHero.formerTeams || [];

      if (normalizeValue(guessedTeam) === normalizeValue(targetTeam)) {
        return {
          label: "Team",
          guessedValue: guessedHero.localizedTeam,
          status: "correct",
          feedback: "✔️ identyczne"
        };
      }

      if (
        targetFormerTeams.some(function (team) {
          return normalizeValue(team) === normalizeValue(guessedTeam);
        }) ||
        guessedFormerTeams.some(function (team) {
          return normalizeValue(team) === normalizeValue(targetTeam);
        })
      ) {
        return {
          label: "Team",
          guessedValue: guessedHero.localizedTeam,
          status: "partial",
          feedback: "🟡 powiazana druzyna"
        };
      }

      return {
        label: "Team",
        guessedValue: guessedHero.localizedTeam,
        status: "wrong",
        feedback: "❌ rozne"
      };
    }

    function createNarrowingHint(comparisons) {
      const exact = comparisons.filter(function (comparison) {
        return comparison.status === "correct";
      }).map(function (comparison) {
        return comparison.label.toLowerCase();
      });

      const partial = comparisons.filter(function (comparison) {
        return comparison.status === "partial";
      }).map(function (comparison) {
        return comparison.label.toLowerCase();
      });

      if (exact.length && partial.length) {
        return "Zawaz juz na cechach: " + exact.join(", ") + ". Dodatkowo blisko sa: " + partial.join(", ") + ".";
      }

      if (exact.length) {
        return "Pewne dopasowania: " + exact.join(", ") + ". Skup sie na pozostalych cechach.";
      }

      if (partial.length) {
        return "Blisko trafienia przy: " + partial.join(", ") + ". Szukaj bohatera o podobnym profilu.";
      }

      return "Ta proba odrzuca sporo mozliwosci. Sprobuj bohatera z innym profilem.";
    }

    function submitGuess(rawGuess) {
      if (state.status !== "playing") {
        return getState();
      }

      const guessName = String(rawGuess || "").trim();
      const guessedHero = lookup.get(normalizeValue(guessName));

      if (!guessName) {
        state.message = "Wpisz nazwe bohatera.";
        return getState();
      }

      if (!guessedHero) {
        state.message = "Nie znaleziono takiego bohatera w bazie.";
        return getState();
      }

      const comparisons = [
        compareExact("Uniwersum", guessedHero.universe, state.targetHero.universe),
        compareTeam(guessedHero, state.targetHero),
        compareExact("Plec", guessedHero.gender, state.targetHero.gender),
        compareExact("Alignment", guessedHero.alignment, state.targetHero.alignment),
        compareExact("Character type", guessedHero.characterType, state.targetHero.characterType),
        compareExact("Combat style", guessedHero.combatStyle, state.targetHero.combatStyle),
        comparePowerLevel(guessedHero.powerLevel, state.targetHero.powerLevel),
        compareIntelligence(guessedHero.intelligence, state.targetHero.intelligence),
        compareExact("Mobility", guessedHero.mobility, state.targetHero.mobility),
        compareExact("Power source", guessedHero.powerSource, state.targetHero.powerSource),
        compareExact("Era", guessedHero.era, state.targetHero.era),
        compareExact("Main ability", guessedHero.mainAbilityType, state.targetHero.mainAbilityType)
      ];

      state.attempts.unshift({
        guessName: guessedHero.localizedName,
        displayName: guessedHero.localizedName,
        comparisons: comparisons,
        narrowingHint: createNarrowingHint(comparisons)
      });
      state.message = "";

      if (guessedHero.id === state.targetHero.id) {
        state.status = "won";
      } else if (state.attempts.length >= MAX_ATTEMPTS) {
        state.status = "lost";
      }

      return getState();
    }

    function resetGame() {
      state.targetHero = heroes[Math.floor(Math.random() * heroes.length)];
      state.attempts = [];
      state.status = "playing";
      state.message = "";
      return getState();
    }

    return { getState, submitGuess, resetGame };
  }

  function createFightGame(heroCollection) {
    const heroes = heroCollection.heroes;
    const state = {
      fighters: [],
      result: null,
      playerChoiceId: null,
      round: 1
    };

    function pickTwoUniqueHeroes() {
      const firstIndex = Math.floor(Math.random() * heroes.length);
      let secondIndex = Math.floor(Math.random() * heroes.length);

      while (secondIndex === firstIndex) {
        secondIndex = Math.floor(Math.random() * heroes.length);
      }

      return [heroes[firstIndex], heroes[secondIndex]];
    }

    function classifyArchetype(hero) {
      if (hero.combatStyle === "magic" || hero.powerSource === "magic") {
        return "magic";
      }

      if (hero.powerSource === "tech" || hero.combatStyle === "tech") {
        return "tech";
      }

      if (hero.stats.strength >= 80 && hero.stats.speed < 65) {
        return "brute";
      }

      if (hero.stats.speed >= 75) {
        return "speed";
      }

      if (hero.stats.intelligence >= 80) {
        return "intelligence";
      }

      return "balanced";
    }

    function createReason(attacker, defender) {
      const reasons = [];

      if (attacker.stats.strength > defender.stats.strength) {
        reasons.push("wyzsza sila");
      }

      if (attacker.stats.speed > defender.stats.speed) {
        reasons.push("lepsza szybkosc");
      }

      if (attacker.stats.intelligence > defender.stats.intelligence) {
        reasons.push("wyzsza inteligencja");
      }

      if (attacker.stats.durability > defender.stats.durability) {
        reasons.push("wieksza wytrzymalosc");
      }

      if (attacker.stats.combat > defender.stats.combat) {
        reasons.push("lepsze wyszkolenie bojowe");
      }

      return reasons.slice(0, 3);
    }

    function getMatchupBonus(attacker, defender) {
      const attackerType = classifyArchetype(attacker);
      const defenderType = classifyArchetype(defender);
      const bonuses = [];
      let score = 0;

      if (attackerType === "magic" && defenderType === "tech") {
        score += 12;
        bonuses.push("magia przewaza nad technologia");
      }

      if (attackerType === "speed" && defenderType === "brute") {
        score += 10;
        bonuses.push("szybkosc przewaza nad brutalna sila");
      }

      if (attackerType === "intelligence" && defenderType === "brute") {
        score += 9;
        bonuses.push("inteligencja neutralizuje brute force");
      }

      return {
        score: score,
        reasons: bonuses
      };
    }

    function calculateScore(hero, opponent) {
      const baseScore =
        hero.stats.strength * 0.3 +
        hero.stats.speed * 0.2 +
        hero.stats.intelligence * 0.2 +
        hero.stats.durability * 0.2 +
        hero.stats.combat * 0.1;

      const randomFactor = Math.round(Math.random() * 12);
      const matchupBonus = getMatchupBonus(hero, opponent);

      return {
        total: Number((baseScore + randomFactor + matchupBonus.score).toFixed(1)),
        randomFactor: randomFactor,
        matchupBonus: matchupBonus
      };
    }

    function startRound() {
      state.fighters = pickTwoUniqueHeroes();
      state.result = null;
      state.playerChoiceId = null;
    }

    function getState() {
      return {
        fighters: state.fighters.slice(),
        result: state.result,
        playerChoiceId: state.playerChoiceId,
        round: state.round
      };
    }

    function chooseWinner(heroId) {
      const fighterA = state.fighters[0];
      const fighterB = state.fighters[1];

      if (!fighterA || !fighterB || state.result) {
        return getState();
      }

      const scoreA = calculateScore(fighterA, fighterB);
      const scoreB = calculateScore(fighterB, fighterA);
      const winner = scoreA.total >= scoreB.total ? fighterA : fighterB;
      const loser = winner.id === fighterA.id ? fighterB : fighterA;
      const winnerScore = winner.id === fighterA.id ? scoreA : scoreB;
      const loserScore = winner.id === fighterA.id ? scoreB : scoreA;
      const playerPickedWinner = heroId === winner.id;

      state.playerChoiceId = heroId;
      state.result = {
        winner: winner,
        loser: loser,
        playerPickedWinner: playerPickedWinner,
        scores: [
          { heroId: fighterA.id, total: scoreA.total, randomFactor: scoreA.randomFactor, bonusReasons: scoreA.matchupBonus.reasons },
          { heroId: fighterB.id, total: scoreB.total, randomFactor: scoreB.randomFactor, bonusReasons: scoreB.matchupBonus.reasons }
        ],
        reasons: createReason(winner, loser).concat(winnerScore.matchupBonus.reasons).slice(0, 4),
        margin: Number((winnerScore.total - loserScore.total).toFixed(1))
      };

      return getState();
    }

    function resetRound() {
      state.round += 1;
      startRound();
      return getState();
    }

    startRound();

    return {
      getState: getState,
      chooseWinner: chooseWinner,
      resetRound: resetRound
    };
  }

  function createPowerGame(heroCollection) {
    const heroes = heroCollection.heroes;
    const difficultyConfig = {
      easy: { initialStats: 5, maxAttempts: 6, label: "Easy" },
      medium: { initialStats: 3, maxAttempts: 6, label: "Medium" },
      hard: { initialStats: 1, maxAttempts: 6, label: "Hard" }
    };
    const state = {
      targetHero: null,
      difficulty: "easy",
      revealedHints: 1,
      attempts: [],
      status: "playing",
      message: "",
      options: [],
      timerEnabled: false,
      timeLeft: 20,
      timerId: null
    };

    const lookup = new Map();
    heroes.forEach(function (hero) {
      lookup.set(normalizeValue(hero.name), hero);
      if (hero.originalName) {
        lookup.set(normalizeValue(hero.originalName), hero);
      }
      lookup.set(normalizeValue(hero.localizedName), hero);
    });

    function shuffle(values) {
      const copy = values.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }

    function buildPowerSummary(hero) {
      const parts = [];

      if (hero.powerSource === "magic") {
        parts.push("Korzysta z mocy o mistycznym lub magicznym pochodzeniu.");
      } else if (hero.powerSource === "tech") {
        parts.push("Opiera swoje mozliwosci na technologii i sprzecie.");
      } else if (hero.powerSource === "mutation") {
        parts.push("Jego moce wynikaja z mutacji lub szczegolnych genow.");
      } else if (hero.powerSource === "alien") {
        parts.push("Posiada zdolnosci wynikajace z pozaziemskiego pochodzenia.");
      } else {
        parts.push("Bazuje glownie na treningu, wyszkoleniu lub naturalnych umiejetnosciach.");
      }

      if (hero.mainAbilityType === "strength") {
        parts.push("Najbardziej wyroznia sie sila fizyczna.");
      } else if (hero.mainAbilityType === "speed") {
        parts.push("Jego znakiem rozpoznawczym jest szybkosc i dynamika.");
      } else if (hero.mainAbilityType === "intelligence") {
        parts.push("Najgrozniejsza jest jego inteligencja i planowanie.");
      } else {
        parts.push("Najbardziej wyroznia sie energia, moc specjalna lub zdolnosci nadprzyrodzone.");
      }

      return parts.join(" ");
    }

    function buildDetailedSummary(hero) {
      const parts = [];

      parts.push("Typ postaci: " + hero.characterType + ".");
      parts.push("Styl walki: " + hero.combatStyle + ".");

      if (hero.mobility === "air") {
        parts.push("Najlepiej czuje sie w walce z przewaga w powietrzu.");
      } else if (hero.mobility === "hybrid") {
        parts.push("Laczy mobilnosc naziemna z bardzo szybkim przemieszczaniem.");
      } else {
        parts.push("Najczesciej dominuje w walce naziemnej.");
      }

      if (hero.powerLevel >= 80) {
        parts.push("Nalezy do bardzo poteznych postaci.");
      } else if (hero.powerLevel >= 55) {
        parts.push("Jest wyraznie silniejszy od przecietnych bohaterow.");
      } else {
        parts.push("Jego sila wynika bardziej z profilu umiejetnosci niz czystej potegi.");
      }

      return parts.join(" ");
    }

    function buildThirdHint(hero) {
      const details = [];

      if (hero.localizedTeam && hero.localizedTeam !== "Niezrzeszony") {
        details.push("Druzyna: " + hero.localizedTeam + ".");
      }

      details.push("Glowne zrodlo przewagi: " + hero.mainAbilityType + ".");
      details.push("Era: " + hero.era + ".");

      return details.join(" ");
    }

    function buildHints(hero) {
      return [
        buildPowerSummary(hero),
        buildDetailedSummary(hero),
        buildThirdHint(hero)
      ];
    }

    function buildOptions(targetHero) {
      const pool = heroes.filter(function (hero) {
        return hero.id !== targetHero.id;
      });
      const distractors = shuffle(pool).slice(0, 3);

      return shuffle([targetHero].concat(distractors)).map(function (hero) {
        return {
          id: hero.id,
          label: hero.localizedName
        };
      });
    }

    function stopTimer() {
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    function startTimer() {
      stopTimer();

      if (!state.timerEnabled || state.status !== "playing") {
        return;
      }

      state.timerId = setInterval(function () {
        state.timeLeft -= 1;

        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          state.status = "lost";
          state.message = "Czas minal. Szukany bohater to " + state.targetHero.localizedName + ".";
          stopTimer();
          updateApp(store.getState());
        } else {
          updateApp(store.getState());
        }
      }, 1000);
    }

    function revealNextHint() {
      state.revealedHints = Math.min(3, state.revealedHints + 1);
    }

    function startRound(difficulty) {
      state.difficulty = difficulty || state.difficulty;
      state.targetHero = heroes[Math.floor(Math.random() * heroes.length)];
      state.revealedHints = state.difficulty === "easy" ? 2 : 1;
      state.attempts = [];
      state.status = "playing";
      state.message = "";
      state.options = buildOptions(state.targetHero);
      state.timeLeft = state.timerEnabled ? 20 : 0;
      startTimer();
    }

    function getVisibleHints() {
      return buildHints(state.targetHero).slice(0, state.revealedHints);
    }

    function getState() {
      return {
        difficulty: state.difficulty,
        difficultyLabel: difficultyConfig[state.difficulty].label,
        visibleHints: getVisibleHints(),
        attempts: state.attempts.slice(),
        remainingAttempts: Math.max(0, difficultyConfig[state.difficulty].maxAttempts - state.attempts.length),
        attemptsUsed: state.attempts.length,
        options: state.options.slice(),
        status: state.status,
        message: state.message,
        maxAttempts: difficultyConfig[state.difficulty].maxAttempts,
        timerEnabled: state.timerEnabled,
        timeLeft: state.timeLeft
      };
    }

    function setDifficulty(difficulty) {
      startRound(difficulty);
      return getState();
    }

    function submitGuess(rawGuess) {
      if (state.status !== "playing") {
        return getState();
      }

      const guessName = String(rawGuess || "").trim();
      const guessedHero = lookup.get(normalizeValue(guessName));

      if (!guessName) {
        state.message = "Wpisz nazwe bohatera.";
        return getState();
      }

      if (!guessedHero) {
        state.message = "Nie znaleziono takiego bohatera w bazie.";
        return getState();
      }

      state.attempts.unshift({
        guessName: guessedHero.localizedName,
        isCorrect: guessedHero.id === state.targetHero.id
      });

      if (guessedHero.id === state.targetHero.id) {
        state.status = "won";
        state.message = "✔️ Dobra odpowiedz.";
        stopTimer();
        return getState();
      }

      state.message = "❌ To nie ten bohater.";

      revealNextHint();

      if (state.attempts.length >= difficultyConfig[state.difficulty].maxAttempts) {
        state.status = "lost";
        state.message = "Koniec prob. Szukany bohater to " + state.targetHero.localizedName + ".";
        stopTimer();
      }

      return getState();
    }

    function chooseOption(heroId) {
      const hero = heroes.find(function (item) {
        return item.id === heroId;
      });

      if (!hero) {
        return getState();
      }

      return submitGuess(hero.localizedName);
    }

    function toggleTimer() {
      state.timerEnabled = !state.timerEnabled;
      state.timeLeft = state.timerEnabled ? 20 : 0;
      startTimer();
      return getState();
    }

    function resetRound() {
      startRound(state.difficulty);
      return getState();
    }

    startRound("easy");

    return {
      getState: getState,
      setDifficulty: setDifficulty,
      submitGuess: submitGuess,
      chooseOption: chooseOption,
      toggleTimer: toggleTimer,
      resetRound: resetRound,
      dispose: stopTimer
    };
  }

  function createLoreGame(heroCollection) {
    const heroes = heroCollection.heroes;
    const MAX_ATTEMPTS = 5;
    const state = {
      targetHero: null,
      hints: [],
      revealedHints: 1,
      attempts: [],
      status: "playing",
      message: ""
    };

    const lookup = new Map();
    heroes.forEach(function (hero) {
      lookup.set(normalizeValue(hero.name), hero);
      if (hero.originalName) {
        lookup.set(normalizeValue(hero.originalName), hero);
      }
      lookup.set(normalizeValue(hero.localizedName), hero);
    });

    function shuffle(values) {
      const copy = values.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }

    function buildLoreHints(hero) {
      const hints = [];

      hints.push("To postac z uniwersum " + hero.universe + ", zwykle kojarzona z " + hero.localizedTeam + ".");

      hints.push(
        "Jej profil to " + hero.characterType + ", a przewage daje jej glownie " +
        hero.mainAbilityType + " oraz styl walki typu " + hero.combatStyle + "."
      );

      if (hero.occupation) {
        hints.push("Poza kostiumem ta postac bywa opisywana jako: " + hero.occupation + ".");
      } else if (hero.fullName) {
        hints.push("Ta postac ma cywilna tozsamosc znana jako " + hero.fullName + ".");
      } else {
        hints.push("Fabularnie czesto laczona jest z era " + hero.era + " i zrodlem mocy typu " + hero.powerSource + ".");
      }

      if (hero.aliases && hero.aliases.length) {
        hints.push("Jedna z kojarzonych z nia nazw lub aliasow to: " + hero.aliases[0] + ".");
      } else if (hero.fullName) {
        hints.push("Pelne imie lub tozsamosc tej postaci to: " + hero.fullName + ".");
      } else {
        hints.push("To bohater o poziomie mocy " + hero.powerLevel + " i mobilnosci typu " + hero.mobility + ".");
      }

      return hints.slice(0, 4);
    }

    function startRound() {
      state.targetHero = heroes[Math.floor(Math.random() * heroes.length)];
      state.hints = buildLoreHints(state.targetHero);
      state.revealedHints = 1;
      state.attempts = [];
      state.status = "playing";
      state.message = "";
    }

    function getState() {
      return {
        visibleHints: state.hints.slice(0, state.revealedHints),
        attempts: state.attempts.slice(),
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - state.attempts.length),
        attemptsUsed: state.attempts.length,
        heroNames: heroes.map(function (hero) {
          return hero.localizedName;
        }),
        status: state.status,
        message: state.message,
        maxAttempts: MAX_ATTEMPTS
      };
    }

    function revealNextHint() {
      state.revealedHints = Math.min(state.hints.length, state.revealedHints + 1);
    }

    function submitGuess(rawGuess) {
      if (state.status !== "playing") {
        return getState();
      }

      const guessName = String(rawGuess || "").trim();
      const guessedHero = lookup.get(normalizeValue(guessName));

      if (!guessName) {
        state.message = "Wpisz nazwe bohatera.";
        return getState();
      }

      if (!guessedHero) {
        state.message = "Nie znaleziono takiego bohatera w bazie.";
        return getState();
      }

      state.attempts.unshift({
        guessName: guessedHero.localizedName,
        isCorrect: guessedHero.id === state.targetHero.id
      });

      if (guessedHero.id === state.targetHero.id) {
        state.status = "won";
        state.message = "✔️ Dobra odpowiedz. To " + state.targetHero.localizedName + ".";
        return getState();
      }

      revealNextHint();
      state.message = "❌ To nie ten bohater.";

      if (state.attempts.length >= MAX_ATTEMPTS) {
        state.status = "lost";
        state.message = "Koniec prob. Poprawna odpowiedz to " + state.targetHero.localizedName + ".";
      }

      return getState();
    }

    function resetRound() {
      startRound();
      return getState();
    }

    startRound();

    return {
      getState: getState,
      submitGuess: submitGuess,
      resetRound: resetRound
    };
  }

  function createDailyGame(heroCollection, progress) {
    const heroes = heroCollection.heroes;
    const dailyChallenge = progress && progress.dailyChallenge;
    const savedResult = progress && progress.dailyChallengeResult;
    const MAX_ATTEMPTS = 5;
    const state = {
      targetHero: null,
      hints: [],
      revealedHints: 1,
      attempts: [],
      status: "playing",
      message: "",
      locked: false
    };

    const lookup = new Map();
    heroes.forEach(function (hero) {
      lookup.set(normalizeValue(hero.name), hero);
      if (hero.originalName) {
        lookup.set(normalizeValue(hero.originalName), hero);
      }
      lookup.set(normalizeValue(hero.localizedName), hero);
    });

    function buildHints(hero) {
      return [
        "Dzisiejszy bohater pochodzi z uniwersum " + hero.universe + " i jest kojarzony z " + hero.localizedTeam + ".",
        "Jego profil to " + hero.characterType + ", a glowny styl walki to " + hero.combatStyle + ".",
        "Glowne zrodlo mocy: " + hero.powerSource + ", mobilnosc: " + hero.mobility + ".",
        hero.fullName ? "Pelna tozsamosc tej postaci to " + hero.fullName + "." : "Ta postac jest zwiazana z era " + hero.era + "."
      ];
    }

    function init() {
      const target = heroes.find(function (hero) {
        return dailyChallenge && hero.id === dailyChallenge.heroId;
      }) || heroes[0];

      state.targetHero = target;
      state.hints = buildHints(target);
      state.revealedHints = 1;
      state.attempts = [];
      state.status = "playing";
      state.message = "";
      state.locked = false;

      if (savedResult && savedResult.date === getTodayKey()) {
        state.status = savedResult.won ? "won" : "lost";
        state.message = savedResult.won
          ? "Dzisiejsze wyzwanie jest juz ukonczone. Bohater: " + savedResult.heroName + "."
          : "Dzisiejsze wyzwanie zostalo juz rozegrane. Bohater: " + savedResult.heroName + ".";
        state.revealedHints = state.hints.length;
        state.locked = true;
      }
    }

    function getState() {
      return {
        visibleHints: state.hints.slice(0, state.revealedHints),
        attempts: state.attempts.slice(),
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - state.attempts.length),
        attemptsUsed: state.attempts.length,
        status: state.status,
        message: state.message,
        maxAttempts: MAX_ATTEMPTS,
        heroNames: heroes.map(function (hero) {
          return hero.localizedName;
        }),
        locked: state.locked
      };
    }

    function submitGuess(rawGuess) {
      if (state.locked || state.status !== "playing") {
        return getState();
      }

      const guessName = String(rawGuess || "").trim();
      const guessedHero = lookup.get(normalizeValue(guessName));

      if (!guessName) {
        state.message = "Wpisz nazwe bohatera.";
        return getState();
      }

      if (!guessedHero) {
        state.message = "Nie znaleziono takiego bohatera w bazie.";
        return getState();
      }

      state.attempts.unshift({
        guessName: guessedHero.localizedName,
        isCorrect: guessedHero.id === state.targetHero.id
      });

      if (guessedHero.id === state.targetHero.id) {
        state.status = "won";
        state.message = "✔️ Daily Challenge ukonczony. Bohater to " + state.targetHero.localizedName + ".";
        state.locked = true;
        return getState();
      }

      state.revealedHints = Math.min(state.hints.length, state.revealedHints + 1);
      state.message = "❌ To nie ten bohater.";

      if (state.attempts.length >= MAX_ATTEMPTS) {
        state.status = "lost";
        state.message = "Koniec prob. Dzisiejszy bohater to " + state.targetHero.localizedName + ".";
        state.locked = true;
      }

      return getState();
    }

    init();

    return {
      getState: getState,
      submitGuess: submitGuess
    };
  }

  function createFeatureCards(features) {
    return features.map(function (feature) {
      return '<article class="feature-card"><h3>Feature</h3><p class="mode-meta">' + feature + "</p></article>";
    }).join("");
  }

  function createStats(stats) {
    return stats.map(function (stat) {
      return '<article class="status-card"><h3>' + stat.title + '</h3><p class="mode-meta">' + stat.value + "</p></article>";
    }).join("");
  }

  function renderMenu(menuElement, modes, activeModeId, onSelect) {
    menuElement.innerHTML = modes.map(function (mode) {
      return '<button class="mode-card ' + (activeModeId === mode.id ? "is-active" : "") + '" type="button" data-mode-id="' + mode.id + '"><span class="mode-card-title">' + mode.label + '</span><span class="mode-card-copy">' + mode.summary + "</span></button>";
    }).join("");

    menuElement.querySelectorAll("[data-mode-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        onSelect(button.dataset.modeId);
      });
    });
  }

  function renderLeaderboardBlock(leaderboard) {
    if (!leaderboard || !leaderboard.length) {
      return '<div class="leaderboard-panel"><div class="mode-badge">Leaderboard</div><h3>Top Players</h3><p class="mode-meta">Zaloguj sie, aby pobrac ranking z zabezpieczonego backendu.</p></div>';
    }

    return '<div class="leaderboard-panel"><div class="mode-badge">Leaderboard</div><h3>Top Players</h3><div class="leaderboard-list">' +
      leaderboard.map(function (entry, index) {
        return '<article class="leaderboard-row"><strong>#' + (index + 1) + '</strong><span>' + entry.nickname + '</span><span>' + entry.points + ' pkt</span><span>streak ' + entry.streak + '</span></article>';
      }).join("") +
      '</div></div>';
  }

  function renderGameMeta(meta) {
    return '<section class="game-meta-bar">' +
      '<article class="status-card"><h3>Streak</h3><p class="mode-meta">🔥 Streak: ' + meta.streak + '</p></article>' +
      '<article class="status-card"><h3>Progress</h3><p class="mode-meta">Question ' + meta.question + ' / ' + meta.totalQuestions + '</p></article>' +
    '</section>';
  }

  function renderFeedbackBanner(message, status) {
    if (!message) {
      return "";
    }

    const variant = getFeedbackVariant(message, status);

    return '<div class="feedback-banner feedback-' + variant + '">' +
      '<strong>' + (variant === "success" ? "Correct!" : variant === "danger" ? "Wrong!" : "Info") + '</strong>' +
      '<span>' + message + '</span>' +
    '</div>';
  }

  function renderInGameLeaderboard(leaderboard) {
    return '<section class="in-game-leaderboard">' + renderLeaderboardBlock(leaderboard) + '</section>';
  }

  function renderAuthSection(authState) {
    const user = authState.currentUser;
    const statusMessage = authState.message
      ? '<p class="auth-message ' + (authState.status === "error" ? "is-error" : "is-success") + '">' + authState.message + '</p>'
      : "";

    if (user) {
      return '<section class="auth-panel">' +
        '<div class="auth-panel-header"><div><div class="mode-badge">Konto</div><h3>Zalogowano jako ' + user.nickname + '</h3></div><p class="mode-meta">' + user.email + ' • ' + user.role + '</p></div>' +
        statusMessage +
        '<div class="auth-user-stats">' +
          '<article class="status-card"><h3>Punkty</h3><p class="mode-meta">' + user.points + '</p></article>' +
          '<article class="status-card"><h3>Streak</h3><p class="mode-meta">' + user.streak + '</p></article>' +
        '</div>' +
        '<div class="auth-actions-row">' +
          '<button class="action-button secondary-button" type="button" id="logoutButton">Wyloguj</button>' +
        '</div>' +
      '</section>';
    }

    const isRegister = authState.view === "register";

    return '<section class="auth-panel">' +
      '<div class="auth-panel-header"><div><div class="mode-badge">Konto</div><h3>' + (isRegister ? "Utworz konto" : "Zaloguj sie") + '</h3></div><p class="mode-meta">JWT trafia do localStorage, a progres zapisuje sie w MongoDB.</p></div>' +
      '<div class="auth-switch-row">' +
        '<button class="action-button ' + (!isRegister ? "" : "secondary-button") + '" type="button" data-auth-view="login">Logowanie</button>' +
        '<button class="action-button ' + (isRegister ? "" : "secondary-button") + '" type="button" data-auth-view="register">Rejestracja</button>' +
      '</div>' +
      statusMessage +
      '<form class="auth-form" id="' + (isRegister ? "registerForm" : "loginForm") + '">' +
        (isRegister ? '<label class="guess-label" for="registerNickname">Nickname</label><input class="guess-input" id="registerNickname" name="nickname" maxlength="24" placeholder="Twoj nick">' : "") +
        '<label class="guess-label" for="' + (isRegister ? "registerEmail" : "loginEmail") + '">Email</label>' +
        '<input class="guess-input" id="' + (isRegister ? "registerEmail" : "loginEmail") + '" name="email" type="email" placeholder="email@adres.pl">' +
        '<label class="guess-label" for="' + (isRegister ? "registerPassword" : "loginPassword") + '">Haslo</label>' +
        '<input class="guess-input" id="' + (isRegister ? "registerPassword" : "loginPassword") + '" name="password" type="password" placeholder="Haslo">' +
        '<button class="action-button" type="submit">' + (isRegister ? "Zarejestruj" : "Zaloguj") + '</button>' +
      '</form>' +
    '</section>';
  }

  function renderAdminSection(adminUsers) {
    if (!adminUsers || !adminUsers.length) {
      return '<section class="admin-panel"><div class="mode-badge">Admin</div><h3>Panel admina</h3><p class="mode-meta">Lista uzytkownikow pojawi sie po zaladowaniu danych.</p></section>';
    }

    return '<section class="admin-panel"><div class="admin-panel-head"><div><div class="mode-badge">Admin</div><h3>Panel admina</h3></div><button class="action-button secondary-button" type="button" id="refreshAdminUsersButton">Odswiez</button></div><div class="admin-users-list">' +
      adminUsers.map(function (user) {
        return '<article class="admin-user-row">' +
          '<div><strong>' + user.nickname + '</strong><p>' + user.email + ' • ' + user.role + (user.banned ? ' • zbanowany' : "") + '</p></div>' +
          '<div class="admin-user-stats"><span>' + user.points + ' pkt</span><span>streak ' + user.streak + '</span></div>' +
          '<div class="admin-user-actions">' +
            '<button class="action-button admin-small-button" type="button" data-admin-points="' + user._id + '" data-delta="50">+50</button>' +
            '<button class="action-button secondary-button admin-small-button" type="button" data-admin-points="' + user._id + '" data-delta="-50">-50</button>' +
            '<button class="action-button admin-ban-button" type="button" data-admin-ban="' + user._id + '" data-banned="' + (!user.banned) + '">' + (user.banned ? "Odbanuj" : "Ban") + '</button>' +
          '</div>' +
        '</article>';
      }).join("") +
    '</div></section>';
  }

  function renderAdminSectionEnhanced(adminUsers, selectedAdminUsers) {
    if (!adminUsers || !adminUsers.length) {
      return renderAdminSection(adminUsers);
    }

    const selectedIds = Array.isArray(selectedAdminUsers) ? selectedAdminUsers : [];
    const allSelected = adminUsers.length && adminUsers.every(function (user) {
      const userId = String(user.id || user._id);
      return selectedIds.indexOf(userId) !== -1;
    });

    return '<section class="admin-panel"><div class="admin-panel-head"><div><div class="mode-badge">Admin</div><h3>Panel admina</h3></div><button class="action-button secondary-button" type="button" id="refreshAdminUsersButton">Odswiez</button></div><section class="admin-bulk-panel"><label class="admin-select-all"><input type="checkbox" id="selectAllAdminUsers" ' + (allSelected ? "checked" : "") + '>Zaznacz wszystkich</label><p class="mode-meta">Zaznaczono: ' + selectedIds.length + ' graczy</p><div class="admin-bulk-actions"><button class="action-button admin-small-button" type="button" id="bulkAddPointsButton" ' + (!selectedIds.length ? "disabled" : "") + '>+50 wszystkim</button><button class="action-button secondary-button admin-small-button" type="button" id="bulkRemovePointsButton" ' + (!selectedIds.length ? "disabled" : "") + '>-50 wszystkim</button><button class="action-button admin-ban-button" type="button" id="bulkBanButton" ' + (!selectedIds.length ? "disabled" : "") + '>Ban zaznaczonych</button><button class="action-button secondary-button admin-small-button" type="button" id="bulkUnbanButton" ' + (!selectedIds.length ? "disabled" : "") + '>Odbanuj zaznaczonych</button></div></section><div class="admin-users-list">' +
      adminUsers.map(function (user) {
        const userId = String(user.id || user._id);
        return '<article class="admin-user-row"><div class="admin-user-main"><label class="admin-user-selector"><input type="checkbox" data-admin-select="' + userId + '" ' + (selectedIds.indexOf(userId) !== -1 ? "checked" : "") + '><span>Zaznacz</span></label><div><strong>' + user.nickname + '</strong><p>' + user.email + ' • ' + user.role + (user.banned ? ' • zbanowany' : "") + '</p></div></div><div class="admin-user-stats"><span>' + user.points + ' pkt</span><span>streak ' + user.streak + '</span></div><div class="admin-user-actions"><button class="action-button admin-small-button" type="button" data-admin-points="' + userId + '" data-delta="50">+50</button><button class="action-button secondary-button admin-small-button" type="button" data-admin-points="' + userId + '" data-delta="-50">-50</button><button class="action-button admin-ban-button" type="button" data-admin-ban="' + userId + '" data-banned="' + (!user.banned) + '">' + (user.banned ? "Odbanuj" : "Ban") + '</button></div></article>';
      }).join("") +
    '</div></section>';
  }

  function renderHome(container, leaderboard, authState, handlers) {
    container.innerHTML = '<div class="home-screen">' +
      '<section class="start-hero-card">' +
        '<div class="mode-badge">HeroGuess</div>' +
        '<h2 class="start-title">HeroGuess</h2>' +
        '<p class="start-copy">Guess superheroes from Marvel & DC in seconds</p>' +
        '<div class="start-actions">' +
          '<button class="action-button start-game-button" type="button" id="startGameButton">Start Game</button>' +
          '<button class="action-button secondary-button" type="button" id="leaderboardButton">Leaderboard</button>' +
        '</div>' +
        '<div class="home-mode-grid">' +
          '<button class="mode-card home-mode-card" type="button" data-home-mode="classic"><span class="mode-card-title">Classic</span><span class="mode-card-copy">Guess the hero with trait comparisons.</span></button>' +
          '<button class="mode-card home-mode-card" type="button" data-home-mode="fight"><span class="mode-card-title">Fight</span><span class="mode-card-copy">Choose the winner in superhero battles.</span></button>' +
          '<button class="mode-card home-mode-card" type="button" data-home-mode="power"><span class="mode-card-title">Clone Who Are Ya</span><span class="mode-card-copy">Recognize the hero from powers and clues.</span></button>' +
        '</div>' +
      '</section>' +
      renderAuthSection(authState) +
      (authState.currentUser && authState.currentUser.role === "admin" ? renderAdminSectionEnhanced(authState.adminUsers, authState.selectedAdminUsers) : "") +
      '<div id="homeLeaderboardAnchor">' + renderLeaderboardBlock(leaderboard) + '</div>' +
    '</div>';

    container.querySelector("#startGameButton").addEventListener("click", handlers.onStart);
    container.querySelector("#leaderboardButton").addEventListener("click", handlers.onLeaderboardOpen);
    container.querySelectorAll("[data-home-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onModeSelect(button.dataset.homeMode);
      });
    });

    container.querySelectorAll("[data-auth-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onAuthViewChange(button.dataset.authView);
      });
    });

    const loginForm = container.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handlers.onLogin({
          email: loginForm.email.value,
          password: loginForm.password.value
        });
      });
    }

    const registerForm = container.querySelector("#registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handlers.onRegister({
          nickname: registerForm.nickname.value,
          email: registerForm.email.value,
          password: registerForm.password.value
        });
      });
    }

    const logoutButton = container.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", handlers.onLogout);
    }

    const refreshAdminUsersButton = container.querySelector("#refreshAdminUsersButton");
    if (refreshAdminUsersButton) {
      refreshAdminUsersButton.addEventListener("click", handlers.onAdminRefresh);
    }

    container.querySelectorAll("[data-admin-points]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onAdminPoints(button.dataset.adminPoints, Number(button.dataset.delta));
      });
    });

    container.querySelectorAll("[data-admin-ban]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onAdminBan(button.dataset.adminBan, button.dataset.banned === "true");
      });
    });

    const selectAllAdminUsers = container.querySelector("#selectAllAdminUsers");
    if (selectAllAdminUsers) {
      selectAllAdminUsers.addEventListener("change", function () {
        handlers.onAdminSelectAll(selectAllAdminUsers.checked);
      });
    }

    container.querySelectorAll("[data-admin-select]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        handlers.onAdminToggleSelect(checkbox.dataset.adminSelect, checkbox.checked);
      });
    });

    const bulkAddPointsButton = container.querySelector("#bulkAddPointsButton");
    if (bulkAddPointsButton) {
      bulkAddPointsButton.addEventListener("click", function () {
        handlers.onAdminBulkPoints(50);
      });
    }

    const bulkRemovePointsButton = container.querySelector("#bulkRemovePointsButton");
    if (bulkRemovePointsButton) {
      bulkRemovePointsButton.addEventListener("click", function () {
        handlers.onAdminBulkPoints(-50);
      });
    }

    const bulkBanButton = container.querySelector("#bulkBanButton");
    if (bulkBanButton) {
      bulkBanButton.addEventListener("click", function () {
        handlers.onAdminBulkBan(true);
      });
    }

    const bulkUnbanButton = container.querySelector("#bulkUnbanButton");
    if (bulkUnbanButton) {
      bulkUnbanButton.addEventListener("click", function () {
        handlers.onAdminBulkBan(false);
      });
    }
  }

  function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");

    return gameModes.some(function (item) {
      return item.id === mode;
    }) ? mode : null;
  }

  function applySeo(modeId) {
    const key = modeId || "home";
    const config = SEO_CONFIG[key] || SEO_CONFIG.home;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const canonicalLink = document.querySelector("#canonicalLink");

    document.title = config.title;

    if (descriptionTag) {
      descriptionTag.setAttribute("content", config.description);
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", "https://hero-gues-game.vercel.app" + config.path);
    }
  }

  function syncRoute(modeId) {
    const config = SEO_CONFIG[modeId || "home"] || SEO_CONFIG.home;
    const nextUrl = config.path;
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, "", nextUrl);
    }

    applySeo(modeId);
  }

  function renderMode(container, mode, onBack) {
    container.innerHTML = '<div class="content-grid"><div class="content-header"><div><div class="mode-badge">' + mode.badge + '</div><h2 class="mode-title">' + mode.label + '</h2></div><button class="action-button" type="button" id="modeBackButton">Back to menu</button></div><p class="mode-description">' + mode.description + '</p><section class="status-strip">' + createStats(mode.stats) + '</section><section class="feature-grid">' + createFeatureCards(mode.features) + "</section></div>";
    container.querySelector("#modeBackButton").addEventListener("click", onBack);
  }

  function createFightStatRows(hero) {
    const statEntries = [
      ["Strength", hero.stats.strength],
      ["Speed", hero.stats.speed],
      ["Intelligence", hero.stats.intelligence],
      ["Durability", hero.stats.durability],
      ["Combat", hero.stats.combat]
    ];

    return statEntries.map(function (entry) {
      return '<li class="fight-stat"><span>' + entry[0] + '</span><strong>' + entry[1] + "</strong></li>";
    }).join("");
  }

  function createAttemptRows(attempts) {
    return attempts.map(function (attempt, index) {
      const comparisonList = attempt.comparisons.map(function (comparison) {
        return '<li class="comparison-chip ' + (comparison.status === "correct" ? "is-correct" : comparison.status === "partial" ? "is-partial" : "is-wrong") + '"><span>' + comparison.label + '</span><strong>' + comparison.guessedValue + '</strong><em>' + comparison.feedback + "</em></li>";
      }).join("");

      return '<article class="attempt-card"><div class="attempt-card-header"><h3>' + attempt.guessName + '</h3><span>Proba ' + (attempts.length - index) + '</span></div><p class="attempt-hint">' + attempt.narrowingHint + '</p><ul class="comparison-list">' + comparisonList + "</ul></article>";
    }).join("");
  }

  function renderClassicGame(container, gameState, handlers, meta) {
    const resultLabel = gameState.status === "won" ? "Wygrana" : gameState.status === "lost" ? "Przegrana" : "W toku";
    let resultCopy = gameState.status === "won"
      ? "Trafione. Ukrytym bohaterem byl " + gameState.targetHero.localizedName + "."
      : gameState.status === "lost"
        ? "Koniec prob. Szukanym bohaterem byl " + gameState.targetHero.localizedName + "."
        : "Porownuj pelny profil bohatera: uniwersum, team, plec, alignment, typ postaci, styl walki, power level, intelligence, mobility, zrodlo mocy, era i glowna umiejetnosc.";

    const options = gameState.heroNames.map(function (name) {
      return '<option value="' + name + '"></option>';
    }).join("");

    container.innerHTML = '<div class="content-grid">' + renderGameMeta(meta) + '<div class="content-header"><div><div class="mode-badge">Classic Mode</div><h2 class="mode-title">Zgadnij bohatera</h2></div><button class="action-button" type="button" id="modeBackButton">Back to menu</button></div>' + renderFeedbackBanner(gameState.message, gameState.status) + '<section class="classic-panel"><div class="classic-status"><article class="status-card"><h3>Limit prob</h3><p class="mode-meta">' + gameState.remainingAttempts + ' / 6 pozostalo</p></article><article class="status-card"><h3>Wynik</h3><p class="mode-meta">' + resultLabel + '</p></article></div><p class="mode-description">' + resultCopy + '</p><article class="status-card"><h3>Hint po ostatniej probie</h3><p class="mode-meta">' + gameState.narrowingHint + '</p></article><form class="guess-form" id="classicGuessForm"><label class="guess-label" for="heroGuess">Wpisz nazwe bohatera</label><div class="guess-row"><input class="guess-input" id="heroGuess" name="heroGuess" list="heroSuggestions" placeholder="Np. Batman, Spider-Man, Wonder Woman" autocomplete="off" ' + (gameState.status !== "playing" ? "disabled" : "") + '><button class="action-button" type="submit" ' + (gameState.status !== "playing" ? "disabled" : "") + '>Sprawdz</button></div><datalist id="heroSuggestions">' + options + '</datalist></form><div class="classic-actions"><button class="action-button" type="button" id="restartClassicButton">Nowa runda</button></div></section><section class="attempts-panel"><div class="attempts-header"><h3>Historia prob</h3><p class="mode-meta">' + (gameState.attempts.length ? "Najnowsza proba jest na gorze." : "Jeszcze nie ma zadnych prob.") + '</p></div><div class="attempts-list">' + (gameState.attempts.length ? createAttemptRows(gameState.attempts) : '<div class="empty-attempts">Czekamy na pierwsza odpowiedz.</div>') + '</div></section>' + renderInGameLeaderboard(meta.leaderboard) + '</div>';

    container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);
    container.querySelector("#restartClassicButton").addEventListener("click", handlers.onRestart);
    container.querySelector("#classicGuessForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = container.querySelector("#heroGuess");
      handlers.onGuess(input.value);
      input.value = "";
    });
  }

  function renderFightGame(container, gameState, handlers, meta) {
    const fighterCards = gameState.fighters.map(function (hero) {
      const isPicked = gameState.playerChoiceId === hero.id;
      const scoreEntry = gameState.result
        ? gameState.result.scores.find(function (score) {
            return score.heroId === hero.id;
          })
        : null;

      return '<article class="fighter-card ' + (isPicked ? "is-picked" : "") + '">' +
        '<div class="fighter-card-head">' +
        '<div><div class="mode-badge">Team ' + hero.localizedTeam + '</div><h3 class="fighter-name">' + hero.localizedName + '</h3></div>' +
        '<button class="action-button fight-select-button" type="button" data-fighter-id="' + hero.id + '" ' + (gameState.result ? "disabled" : "") + '>Wybieram</button>' +
        '</div>' +
        '<ul class="fight-stats">' + createFightStatRows(hero) + '</ul>' +
        '<p class="mode-meta">Power source: ' + hero.powerSource + ' | Mobility: ' + hero.mobility + '</p>' +
        (scoreEntry ? '<div class="fight-score"><span>Score</span><strong>' + scoreEntry.total + '</strong></div>' : "") +
        "</article>";
    }).join("");

    const resultBlock = gameState.result
      ? '<section class="fight-result is-visible">' +
          '<div class="fight-result-banner ' + (gameState.result.playerPickedWinner ? "is-win" : "is-loss") + '">' +
            '<span>Wynik walki</span>' +
            '<strong>' + gameState.result.winner.localizedName + " wygrywa" + '</strong>' +
          '</div>' +
          '<p class="mode-description">Twoj wybor byl ' + (gameState.result.playerPickedWinner ? "trafny." : "nietrafny.") + " Przewaga wyniosla " + gameState.result.margin + " pkt.</p>" +
          '<p class="fight-reason"><strong>Uzasadnienie:</strong> ' + gameState.result.reasons.join(", ") + ".</p>" +
          '<button class="action-button" type="button" id="nextFightButton">Nowa walka</button>' +
        "</section>"
      : '<section class="fight-result"><div class="fight-result-banner"><span>Wynik walki</span><strong>Czekamy na Twoj wybor</strong></div><p class="mode-description">Wybierz bohatera, ktory wedlug Ciebie wygra to starcie.</p></section>';

    container.innerHTML = '<div class="content-grid">' +
      renderGameMeta(meta) +
      '<div class="content-header">' +
        '<div><div class="mode-badge">Fight Mode</div><h2 class="mode-title">Pojedynek bohaterow</h2></div>' +
        '<button class="action-button" type="button" id="modeBackButton">Back to menu</button>' +
      '</div>' +
      '<section class="classic-panel">' +
        '<div class="classic-status">' +
          '<article class="status-card"><h3>Runda</h3><p class="mode-meta">' + gameState.round + '</p></article>' +
          '<article class="status-card"><h3>Zasada</h3><p class="mode-meta">Wybierz zwyciezce na podstawie statystyk i matchupow</p></article>' +
        '</div>' +
      '</section>' +
      '<section class="fight-grid">' + fighterCards + '</section>' +
      resultBlock +
      renderInGameLeaderboard(meta.leaderboard) +
    '</div>';

    container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);

    container.querySelectorAll("[data-fighter-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onChooseWinner(Number(button.dataset.fighterId));
      });
    });

    const nextFightButton = container.querySelector("#nextFightButton");
    if (nextFightButton) {
      nextFightButton.addEventListener("click", handlers.onNextRound);
    }
  }

  function createPowerHints(hints) {
    return hints.map(function (hint, index) {
      return '<article class="power-hint-card">' +
        '<div class="power-hint-head"><span>Wskazowka ' + (index + 1) + '</span></div>' +
        '<p>' + hint + '</p>' +
      '</article>';
    }).join("");
  }

  function createPowerAttempts(attempts) {
    return attempts.map(function (attempt, index) {
      return '<article class="attempt-card">' +
        '<div class="attempt-card-header">' +
          '<h3>' + attempt.guessName + '</h3>' +
          '<span>Proba ' + (attempts.length - index) + '</span>' +
        '</div>' +
        '<p class="attempt-hint">' + (attempt.isCorrect ? "✔️ Trafiony bohater." : "❌ Bledna odpowiedz.") + '</p>' +
      '</article>';
    }).join("");
  }

  function createLoreHints(hints) {
    return hints.map(function (hint, index) {
      return '<article class="lore-hint-card is-visible">' +
        '<div class="power-hint-head"><span>Hint ' + (index + 1) + '</span></div>' +
        '<p>' + hint + '</p>' +
      '</article>';
    }).join("");
  }

  function renderLoreGame(container, gameState, handlers, meta) {
    const resultCopy = gameState.status === "won"
      ? gameState.message
      : gameState.status === "lost"
        ? gameState.message
        : "Czytaj kolejne wskazowki fabularne i sproboj odgadnac bohatera.";

    const attemptsBlock = gameState.attempts.length
      ? gameState.attempts.map(function (attempt, index) {
          return '<article class="attempt-card"><div class="attempt-card-header"><h3>' + attempt.guessName + '</h3><span>Proba ' + (gameState.attempts.length - index) + '</span></div><p class="attempt-hint">' + (attempt.isCorrect ? "✔️ Trafiony bohater." : "❌ Bledna odpowiedz.") + '</p></article>';
        }).join("")
      : '<div class="empty-attempts">Pierwsza wskazowka juz czeka.</div>';

    container.innerHTML = '<div class="content-grid">' +
      renderGameMeta(meta) +
      '<div class="content-header">' +
        '<div><div class="mode-badge">Lore Mode</div><h2 class="mode-title">Zgadnij bohatera po fabule</h2></div>' +
        '<button class="action-button" type="button" id="modeBackButton">Back to menu</button>' +
      '</div>' +
      renderFeedbackBanner(gameState.message, gameState.status) +
      '<section class="classic-panel">' +
        '<div class="classic-status">' +
          '<article class="status-card"><h3>Pozostale proby</h3><p class="mode-meta">' + gameState.remainingAttempts + ' / ' + gameState.maxAttempts + '</p></article>' +
          '<article class="status-card"><h3>Wskazowki</h3><p class="mode-meta">' + gameState.visibleHints.length + ' odkryte</p></article>' +
        '</div>' +
        '<p class="mode-description">' + resultCopy + '</p>' +
        '<div class="power-hints-grid lore-hints-grid">' + createLoreHints(gameState.visibleHints) + '</div>' +
        '<form class="guess-form" id="loreGuessForm">' +
          '<label class="guess-label" for="loreHeroGuess">Kto to jest?</label>' +
          '<div class="guess-row">' +
            '<input class="guess-input" id="loreHeroGuess" name="loreHeroGuess" list="loreHeroSuggestions" placeholder="Wpisz nazwe bohatera" autocomplete="off" ' + (gameState.status !== "playing" ? "disabled" : "") + '>' +
            '<button class="action-button" type="submit" ' + (gameState.status !== "playing" ? "disabled" : "") + '>Zgaduj</button>' +
          '</div>' +
          '<datalist id="loreHeroSuggestions">' +
            gameState.heroNames.map(function (name) {
              return '<option value="' + name + '"></option>';
            }).join("") +
          '</datalist>' +
        '</form>' +
        (gameState.message && gameState.status === "playing" ? '<p class="form-message">' + gameState.message + '</p>' : "") +
        '<div class="classic-actions"><button class="action-button" type="button" id="restartLoreButton">Nowa runda</button></div>' +
      '</section>' +
      '<section class="attempts-panel">' +
        '<div class="attempts-header"><h3>Historia prob</h3><p class="mode-meta">Po kazdej blednej odpowiedzi odkrywa sie kolejny hint.</p></div>' +
        '<div class="attempts-list">' + attemptsBlock + '</div>' +
      '</section>' +
      renderInGameLeaderboard(meta.leaderboard) +
    '</div>';

    container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);
    container.querySelector("#restartLoreButton").addEventListener("click", handlers.onRestart);
    container.querySelector("#loreGuessForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = container.querySelector("#loreHeroGuess");
      handlers.onGuess(input.value);
      input.value = "";
    });
  }

  function renderDailyGame(container, gameState, handlers, meta) {
    const attemptsBlock = gameState.attempts.length
      ? gameState.attempts.map(function (attempt, index) {
          return '<article class="attempt-card"><div class="attempt-card-header"><h3>' + attempt.guessName + '</h3><span>Proba ' + (gameState.attempts.length - index) + '</span></div><p class="attempt-hint">' + (attempt.isCorrect ? "✔️ Trafiony bohater." : "❌ Bledna odpowiedz.") + '</p></article>';
        }).join("")
      : '<div class="empty-attempts">Masz tylko jedno podejscie dziennie do pelnej rundy.</div>';

    container.innerHTML = '<div class="content-grid">' +
      renderGameMeta(meta) +
      '<div class="content-header">' +
        '<div><div class="mode-badge">Daily Challenge</div><h2 class="mode-title">Wspolny bohater dnia</h2></div>' +
        '<button class="action-button" type="button" id="modeBackButton">Back to menu</button>' +
      '</div>' +
      renderFeedbackBanner(gameState.message, gameState.status) +
      '<section class="classic-panel">' +
        '<div class="classic-status">' +
          '<article class="status-card"><h3>Pozostale proby</h3><p class="mode-meta">' + gameState.remainingAttempts + ' / ' + gameState.maxAttempts + '</p></article>' +
          '<article class="status-card"><h3>Status</h3><p class="mode-meta">' + (gameState.locked ? "Rozegrano dzisiaj" : "Aktywne dzisiaj") + '</p></article>' +
        '</div>' +
        '<p class="mode-description">' + (gameState.message || "Ten sam bohater dnia dla wszystkich graczy.") + '</p>' +
        '<div class="power-hints-grid lore-hints-grid">' + createLoreHints(gameState.visibleHints) + '</div>' +
        '<form class="guess-form" id="dailyGuessForm">' +
          '<label class="guess-label" for="dailyHeroGuess">Kto jest bohaterem dnia?</label>' +
          '<div class="guess-row">' +
            '<input class="guess-input" id="dailyHeroGuess" name="dailyHeroGuess" list="dailyHeroSuggestions" placeholder="Wpisz nazwe bohatera" autocomplete="off" ' + (gameState.locked || gameState.status !== "playing" ? "disabled" : "") + '>' +
            '<button class="action-button" type="submit" ' + (gameState.locked || gameState.status !== "playing" ? "disabled" : "") + '>Zgaduj</button>' +
          '</div>' +
          '<datalist id="dailyHeroSuggestions">' +
            gameState.heroNames.map(function (name) {
              return '<option value="' + name + '"></option>';
            }).join("") +
          '</datalist>' +
        '</form>' +
      '</section>' +
      '<section class="attempts-panel">' +
        '<div class="attempts-header"><h3>Historia prob</h3><p class="mode-meta">Po kazdej blednej odpowiedzi odkrywa sie kolejny hint, ale po zakonczeniu rundy wyzwanie blokuje sie do jutra.</p></div>' +
        '<div class="attempts-list">' + attemptsBlock + '</div>' +
      '</section>' +
      renderInGameLeaderboard(meta.leaderboard) +
    '</div>';

    container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);
    container.querySelector("#dailyGuessForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = container.querySelector("#dailyHeroGuess");
      handlers.onGuess(input.value);
      input.value = "";
    });
  }

  function renderPowerGame(container, gameState, handlers, meta) {
    const resultCopy = gameState.status === "won"
      ? "Wygrana. Udalo sie odgadnac bohatera."
      : gameState.status === "lost"
        ? gameState.message
        : "Czytaj wskazowki i wybierz bohatera jak najszybciej.";

    const optionButtons = gameState.options.map(function (option) {
      return '<button class="action-button power-option-button" type="button" data-option-id="' + option.id + '" ' + (gameState.status !== "playing" ? "disabled" : "") + '>' + option.label + '</button>';
    }).join("");

    container.innerHTML = '<div class="content-grid">' +
      renderGameMeta(meta) +
      '<div class="content-header">' +
        '<div><div class="mode-badge">Power Mode</div><h2 class="mode-title">Rozpoznaj bohatera po statystykach</h2></div>' +
        '<button class="action-button" type="button" id="modeBackButton">Back to menu</button>' +
      '</div>' +
      renderFeedbackBanner(gameState.message, gameState.status) +
      '<section class="classic-panel">' +
        '<div class="classic-status">' +
          '<article class="status-card"><h3>Poziom</h3><p class="mode-meta">' + gameState.difficultyLabel + '</p></article>' +
          '<article class="status-card"><h3>Pozostale proby</h3><p class="mode-meta">' + gameState.remainingAttempts + ' / ' + gameState.maxAttempts + '</p></article>' +
        '</div>' +
        '<div class="difficulty-row">' +
          '<button class="action-button difficulty-button ' + (gameState.difficulty === "easy" ? "is-active" : "") + '" type="button" data-difficulty="easy">Easy</button>' +
          '<button class="action-button difficulty-button ' + (gameState.difficulty === "medium" ? "is-active" : "") + '" type="button" data-difficulty="medium">Medium</button>' +
          '<button class="action-button difficulty-button ' + (gameState.difficulty === "hard" ? "is-active" : "") + '" type="button" data-difficulty="hard">Hard</button>' +
          '<button class="action-button difficulty-button ' + (gameState.timerEnabled ? "is-active" : "") + '" type="button" id="togglePowerTimer">' + (gameState.timerEnabled ? "Timer ON" : "Timer OFF") + '</button>' +
        '</div>' +
        (gameState.timerEnabled ? '<article class="status-card timer-card"><h3>Timer</h3><p class="mode-meta">' + gameState.timeLeft + ' s</p></article>' : '') +
        '<p class="mode-description">' + resultCopy + '</p>' +
        '<div class="power-hints-grid">' + createPowerHints(gameState.visibleHints) + '</div>' +
        '<div class="power-options-grid">' + optionButtons + '</div>' +
        '<form class="guess-form" id="powerGuessForm">' +
          '<label class="guess-label" for="powerHeroGuess">Albo wpisz odpowiedz recznie</label>' +
          '<div class="guess-row">' +
            '<input class="guess-input" id="powerHeroGuess" name="powerHeroGuess" list="powerHeroSuggestions" placeholder="Wpisz nazwe bohatera" autocomplete="off" ' + (gameState.status !== "playing" ? "disabled" : "") + '>' +
            '<button class="action-button" type="submit" ' + (gameState.status !== "playing" ? "disabled" : "") + '>Zgaduj</button>' +
          '</div>' +
          '<datalist id="powerHeroSuggestions">' +
            gameState.options.map(function (option) {
              return '<option value="' + option.label + '"></option>';
            }).join("") +
          '</datalist>' +
        '</form>' +
        (gameState.message ? '<p class="form-message">' + gameState.message + '</p>' : "") +
        '<div class="classic-actions"><button class="action-button" type="button" id="restartPowerButton">Nowa runda</button></div>' +
      '</section>' +
      '<section class="attempts-panel">' +
        '<div class="attempts-header"><h3>Historia prob</h3><p class="mode-meta">' + (gameState.attempts.length ? "Po bledzie w Medium i Hard odkrywany jest kolejny stat." : "Jeszcze nie ma zadnych prob.") + '</p></div>' +
        '<div class="attempts-list">' + (gameState.attempts.length ? createPowerAttempts(gameState.attempts) : '<div class="empty-attempts">Statystyki czekaja na pierwsza probe.</div>') + '</div>' +
      '</section>' +
      renderInGameLeaderboard(meta.leaderboard) +
    '</div>';

    container.querySelector("#modeBackButton").addEventListener("click", handlers.onBack);
    container.querySelector("#restartPowerButton").addEventListener("click", handlers.onRestart);

    container.querySelectorAll("[data-difficulty]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onChangeDifficulty(button.dataset.difficulty);
      });
    });

    container.querySelectorAll("[data-option-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        handlers.onChooseOption(Number(button.dataset.optionId));
      });
    });

    container.querySelector("#togglePowerTimer").addEventListener("click", handlers.onToggleTimer);

    container.querySelector("#powerGuessForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const input = container.querySelector("#powerHeroGuess");
      handlers.onGuess(input.value);
      input.value = "";
    });
  }

  const store = createStore({
    activeView: "menu",
    activeModeId: null,
    heroCollection: null,
    dataStatus: "loading",
    progress: loadSavedProgress(),
    leaderboard: [],
    nickname: loadNickname(),
    authToken: loadAuthToken(),
    authView: loadAuthView(),
    authStatus: "idle",
    authMessage: "",
    currentUser: null,
    adminUsers: [],
    selectedAdminUsers: []
  });

  const menuView = document.querySelector("#menuView");
  const gameContainer = document.querySelector("#gameContainer");
  const homeButton = document.querySelector("#homeButton");
  const progressPanel = document.querySelector("#progressPanel");
  const nicknameInput = document.querySelector("#nicknameInput");
  const accountSummary = document.querySelector("#accountSummary");
  const progressionManager = createProgressionManager();

  function renderProgressPanel(progress) {
    const safeProgress = progress || loadSavedProgress();
    const dailyLabel = !safeProgress.dailyChallenge
      ? "Ladowanie..."
      : safeProgress.dailyChallengeResult && safeProgress.dailyChallengeResult.date === getTodayKey()
        ? "Rozegrane"
        : "Gotowe";

    progressPanel.innerHTML = [
      { label: "Streak", value: safeProgress.streak },
      { label: "Punkty", value: safeProgress.points },
      { label: "Historia", value: safeProgress.history.length },
      { label: "Daily", value: dailyLabel }
    ].map(function (item) {
      return '<article class="progress-card"><span>' + item.label + '</span><strong>' + item.value + '</strong></article>';
    }).join("");
  }

  function renderAccountSummary(user, message, status) {
    if (!accountSummary) {
      return;
    }

    if (!user && !message) {
      accountSummary.innerHTML = '<p class="account-summary-copy">Mozesz grac jako Guest albo zalogowac sie, aby zapisywac punkty i streak w bazie danych.</p>';
      return;
    }

    accountSummary.innerHTML = user
      ? '<div class="account-summary-card"><strong>' + user.nickname + '</strong><span>' + user.role + ' • ' + user.email + '</span></div>'
      : '<p class="account-summary-copy ' + (status === "error" ? "is-error" : "") + '">' + message + '</p>';
  }

  function syncProgressState(nextProgress) {
    store.setState({
      progress: nextProgress
    });
  }

  function mergeProgressWithUser(baseProgress, user) {
    return {
      streak: user && typeof user.streak === "number" ? user.streak : baseProgress.streak,
      points: user && typeof user.points === "number" ? user.points : baseProgress.points,
      history: Array.isArray(baseProgress.history) ? baseProgress.history : [],
      dailyChallenge: baseProgress.dailyChallenge || null,
      dailyChallengeResult: baseProgress.dailyChallengeResult || null
    };
  }

  async function syncCurrentUserProgress(nextProgress) {
    const state = store.getState();

    if (!state.authToken || !state.currentUser) {
      return;
    }

    try {
      const response = await syncUserProgress(state.authToken, nextProgress);
      const mergedProgress = mergeProgressWithUser(nextProgress, response.user);
      saveProgress(mergedProgress);
      store.setState({
        currentUser: response.user,
        progress: mergedProgress,
        nickname: response.user.nickname
      });
      refreshLeaderboard();
    } catch (error) {
      console.error("Progress sync failed:", error);
    }
  }

  async function refreshAdminUsers() {
    const state = store.getState();

    if (!state.authToken || !state.currentUser || state.currentUser.role !== "admin") {
      return;
    }

    try {
      const users = await fetchAdminUsers(state.authToken);
      const selectedLookup = new Set(store.getState().selectedAdminUsers || []);
      const nextSelected = users
        .map(function (user) {
          return String(user.id || user._id);
        })
        .filter(function (userId) {
          return selectedLookup.has(userId);
        });
      store.setState({ adminUsers: users, selectedAdminUsers: nextSelected });
    } catch (error) {
      store.setState({ authMessage: error.message, authStatus: "error" });
    }
  }

  function getGameMeta(modeId) {
    return {
      streak: store.getState().progress ? store.getState().progress.streak : 0,
      question: modeQuestionProgress[modeId] || 1,
      totalQuestions: SESSION_TOTAL_QUESTIONS,
      leaderboard: store.getState().leaderboard || []
    };
  }

  function refreshLeaderboard() {
    fetchLeaderboard(store.getState().authToken)
      .then(function (leaderboard) {
        store.setState({ leaderboard: leaderboard });
      })
      .catch(function () {
        store.setState({ leaderboard: [] });
      });
  }

  function finalizeProgress(result) {
    const awardedPoints = calculateAwardedPoints(result);
    const updatedProgress = progressionManager.recordGame(result);
    syncProgressState(updatedProgress);

    if (result.won) {
      trackEvent("win", {
        score: awardedPoints,
        mode: result.mode
      });
    } else {
      trackEvent("lose", {
        mode: result.mode
      });
    }

    syncCurrentUserProgress(updatedProgress);
    refreshLeaderboard();
  }

  function openMenu() {
    if (powerGame && powerGame.dispose) {
      powerGame.dispose();
    }

    syncRoute(null);
    store.setState({ activeView: "menu", activeModeId: null });
  }

  function handleStartGame() {
    trackEvent("start_game");
    modeQuestionProgress.classic = 1;
    openMode("classic", { skipTracking: true });
  }

  function handleLeaderboardOpen() {
    trackEvent("leaderboard_open");
    const anchor = document.querySelector("#homeLeaderboardAnchor");

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleAuthViewChange(view) {
    saveAuthView(view);
    store.setState({
      authView: view,
      authMessage: "",
      authStatus: "idle"
    });
  }

  async function handleRegister(credentials) {
    store.setState({ authStatus: "loading", authMessage: "" });

    try {
      await registerUser(credentials);
      saveAuthView("login");
      store.setState({
        authView: "login",
        authStatus: "success",
        authMessage: "Konto utworzone. Mozesz sie teraz zalogowac."
      });
    } catch (error) {
      store.setState({
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  async function handleLogin(credentials) {
    store.setState({ authStatus: "loading", authMessage: "" });

    try {
      const response = await loginUser(credentials);
      const nextProgress = mergeProgressWithUser(loadSavedProgress(), response.user);

      saveAuthToken(response.token);
      saveNickname(response.user.nickname);
      saveProgress(nextProgress);

      store.setState({
        authToken: response.token,
        currentUser: response.user,
        authStatus: "success",
        authMessage: "Zalogowano pomyslnie.",
        nickname: response.user.nickname,
        progress: nextProgress
      });

      if (response.user.role === "admin") {
        refreshAdminUsers();
      }

      refreshLeaderboard();
    } catch (error) {
      saveAuthToken("");
      store.setState({
        authToken: "",
        currentUser: null,
        adminUsers: [],
        selectedAdminUsers: [],
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  function handleLogout() {
    saveAuthToken("");
    store.setState({
      authToken: "",
      currentUser: null,
      adminUsers: [],
      selectedAdminUsers: [],
      authStatus: "success",
      authMessage: "Wylogowano.",
      nickname: loadNickname()
    });
  }

  async function handleAdminPoints(userId, delta) {
    const state = store.getState();

    if (!state.authToken) {
      return;
    }

    try {
      await updateAdminPoints(state.authToken, userId, delta);
      store.setState({
        authStatus: "success",
        authMessage: "Punkty uzytkownika zostaly zaktualizowane."
      });
      refreshAdminUsers();
      refreshLeaderboard();
    } catch (error) {
      store.setState({
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  function handleAdminToggleSelect(userId, checked) {
    const current = store.getState().selectedAdminUsers || [];
    const next = checked
      ? current.concat(userId).filter(function (value, index, array) {
          return array.indexOf(value) === index;
        })
      : current.filter(function (value) {
          return value !== userId;
        });

    store.setState({ selectedAdminUsers: next });
  }

  function handleAdminSelectAll(checked) {
    const users = store.getState().adminUsers || [];
    store.setState({
      selectedAdminUsers: checked
        ? users.map(function (user) {
            return String(user.id || user._id);
          })
        : []
    });
  }

  async function handleAdminBulkPoints(delta) {
    const state = store.getState();
    const selectedIds = state.selectedAdminUsers || [];

    if (!state.authToken || !selectedIds.length) {
      return;
    }

    try {
      await Promise.all(selectedIds.map(function (userId) {
        return updateAdminPoints(state.authToken, userId, delta);
      }));
      store.setState({
        authStatus: "success",
        authMessage: "Zaktualizowano punkty dla " + selectedIds.length + " graczy."
      });
      refreshAdminUsers();
      refreshLeaderboard();
    } catch (error) {
      store.setState({
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  async function handleAdminBan(userId, banned) {
    const state = store.getState();

    if (!state.authToken) {
      return;
    }

    try {
      await updateAdminBan(state.authToken, userId, banned);
      store.setState({
        authStatus: "success",
        authMessage: banned ? "Uzytkownik zostal zbanowany." : "Ban zostal zdjety."
      });
      refreshAdminUsers();
      refreshLeaderboard();
    } catch (error) {
      store.setState({
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  async function handleAdminBulkBan(banned) {
    const state = store.getState();
    const selectedIds = state.selectedAdminUsers || [];

    if (!state.authToken || !selectedIds.length) {
      return;
    }

    try {
      await Promise.all(selectedIds.map(function (userId) {
        return updateAdminBan(state.authToken, userId, banned);
      }));
      store.setState({
        authStatus: "success",
        authMessage: (banned ? "Zbanowano " : "Odbanowano ") + selectedIds.length + " graczy."
      });
      refreshAdminUsers();
      refreshLeaderboard();
    } catch (error) {
      store.setState({
        authStatus: "error",
        authMessage: error.message
      });
    }
  }

  function openMode(modeId, options) {
    const settings = options || {};

    if (!settings.keepProgressCounter) {
      modeQuestionProgress[modeId] = 1;
    }

    if (modeId === "classic") {
      const heroCollection = store.getState().heroCollection;
      if (heroCollection && heroCollection.heroes.length) {
        classicGame = createClassicGame(heroCollection);
        classicProgressRecorded = false;
      }
    }

    if (modeId === "fight") {
      const fightCollection = store.getState().heroCollection;
      if (fightCollection && fightCollection.heroes.length) {
        fightGame = createFightGame(fightCollection);
      }
    }

    if (modeId === "power") {
      if (powerGame && powerGame.dispose) {
        powerGame.dispose();
      }

      const powerCollection = store.getState().heroCollection;
      if (powerCollection && powerCollection.heroes.length) {
        powerGame = createPowerGame(powerCollection);
        powerProgressRecorded = false;
      }
    }

    if (modeId === "lore") {
      const loreCollection = store.getState().heroCollection;
      if (loreCollection && loreCollection.heroes.length) {
        loreGame = createLoreGame(loreCollection);
        loreProgressRecorded = false;
      }
    }

    if (modeId === "daily") {
      const dailyCollection = store.getState().heroCollection;
      const progress = store.getState().progress;
      if (dailyCollection && dailyCollection.heroes.length) {
        dailyGame = createDailyGame(dailyCollection, progress);
      }
    }

    if (!settings.skipTracking) {
      trackEvent("select_mode", { mode: modeId });
    }

    syncRoute(modeId);
    store.setState({ activeView: "mode", activeModeId: modeId });
  }

  function submitClassicGuess(guess) {
    if (!classicGame) {
      return;
    }
    const nextState = classicGame.submitGuess(guess);

    if (nextState.status === "won" && !classicProgressRecorded) {
      finalizeProgress({
        mode: "classic",
        won: true,
        attemptsUsed: nextState.attemptsUsed,
        maxAttempts: 6,
        difficulty: "standard"
      });
      classicProgressRecorded = true;
    } else if (nextState.status === "lost" && !classicProgressRecorded) {
      finalizeProgress({
        mode: "classic",
        won: false,
        attemptsUsed: 6,
        maxAttempts: 6,
        difficulty: "standard"
      });
      classicProgressRecorded = true;
    }

    updateApp(store.getState());
  }

  function restartClassicMode() {
    if (classicGame) {
      trackEvent("restart", { mode: "classic" });
      classicProgressRecorded = false;
      modeQuestionProgress.classic = Math.min(SESSION_TOTAL_QUESTIONS, modeQuestionProgress.classic + 1);
      classicGame.resetGame();
      updateApp(store.getState());
    }
  }

  function chooseFightWinner(heroId) {
    if (!fightGame) {
      return;
    }

    const nextState = fightGame.chooseWinner(heroId);

    if (nextState.result) {
      trackEvent(nextState.result.playerPickedWinner ? "win" : "lose", {
        mode: "fight",
        score: nextState.result.playerPickedWinner ? Math.round(nextState.result.margin * 10) : 0
      });
    }

    updateApp(store.getState());
  }

  function nextFightRound() {
    if (!fightGame) {
      return;
    }

    trackEvent("restart", { mode: "fight" });
    modeQuestionProgress.fight = Math.min(SESSION_TOTAL_QUESTIONS, modeQuestionProgress.fight + 1);
    fightGame.resetRound();
    updateApp(store.getState());
  }

  function submitPowerGuess(guess) {
    if (!powerGame) {
      return;
    }

    const nextState = powerGame.submitGuess(guess);

    if (nextState.status === "won" && !powerProgressRecorded) {
      finalizeProgress({
        mode: "power",
        won: true,
        attemptsUsed: nextState.attemptsUsed,
        maxAttempts: nextState.maxAttempts,
        difficulty: nextState.difficulty
      });
      powerProgressRecorded = true;
    } else if (nextState.status === "lost" && !powerProgressRecorded) {
      finalizeProgress({
        mode: "power",
        won: false,
        attemptsUsed: nextState.maxAttempts,
        maxAttempts: nextState.maxAttempts,
        difficulty: nextState.difficulty
      });
      powerProgressRecorded = true;
    }

    updateApp(store.getState());
  }

  function restartPowerRound() {
    if (!powerGame) {
      return;
    }

    trackEvent("restart", { mode: "power" });
    powerProgressRecorded = false;
    modeQuestionProgress.power = Math.min(SESSION_TOTAL_QUESTIONS, modeQuestionProgress.power + 1);
    powerGame.resetRound();
    updateApp(store.getState());
  }

  function changePowerDifficulty(difficulty) {
    if (!powerGame) {
      return;
    }

    powerProgressRecorded = false;
    modeQuestionProgress.power = 1;
    powerGame.setDifficulty(difficulty);
    updateApp(store.getState());
  }

  function choosePowerOption(heroId) {
    if (!powerGame) {
      return;
    }

    powerGame.chooseOption(heroId);
    updateApp(store.getState());
  }

  function togglePowerTimer() {
    if (!powerGame) {
      return;
    }

    powerGame.toggleTimer();
    updateApp(store.getState());
  }

  function submitLoreGuess(guess) {
    if (!loreGame) {
      return;
    }

    const nextState = loreGame.submitGuess(guess);

    if (nextState.status === "won" && !loreProgressRecorded) {
      finalizeProgress({
        mode: "lore",
        won: true,
        attemptsUsed: nextState.attemptsUsed,
        maxAttempts: nextState.maxAttempts,
        difficulty: "story"
      });
      loreProgressRecorded = true;
    } else if (nextState.status === "lost" && !loreProgressRecorded) {
      finalizeProgress({
        mode: "lore",
        won: false,
        attemptsUsed: nextState.maxAttempts,
        maxAttempts: nextState.maxAttempts,
        difficulty: "story"
      });
      loreProgressRecorded = true;
    }

    updateApp(store.getState());
  }

  function restartLoreRound() {
    if (!loreGame) {
      return;
    }

    trackEvent("restart", { mode: "lore" });
    loreProgressRecorded = false;
    modeQuestionProgress.lore = Math.min(SESSION_TOTAL_QUESTIONS, modeQuestionProgress.lore + 1);
    loreGame.resetRound();
    updateApp(store.getState());
  }

  function submitDailyGuess(guess) {
    if (!dailyGame) {
      return;
    }

    const nextState = dailyGame.submitGuess(guess);

    if (nextState.locked && nextState.status === "won") {
      trackEvent("win", {
        score: 0,
        mode: "daily"
      });
      const updatedProgress = progressionManager.completeDailyChallenge({
        won: true,
        attemptsUsed: nextState.attemptsUsed,
        heroName: store.getState().progress.dailyChallenge.heroName
      });
      syncProgressState(updatedProgress);
    } else if (nextState.locked && nextState.status === "lost") {
      trackEvent("lose", {
        mode: "daily"
      });
      const updatedProgress = progressionManager.completeDailyChallenge({
        won: false,
        attemptsUsed: nextState.maxAttempts,
        heroName: store.getState().progress.dailyChallenge.heroName
      });
      syncProgressState(updatedProgress);
    }

    updateApp(store.getState());
  }

  function updateApp(state) {
    renderProgressPanel(state.progress);
    renderMenu(menuView, gameModes, state.activeModeId, openMode);
    renderAccountSummary(state.currentUser, state.authMessage, state.authStatus);
    nicknameInput.value = state.currentUser ? state.currentUser.nickname : state.nickname;
    nicknameInput.disabled = Boolean(state.currentUser);

    if (state.activeView === "menu") {
      applySeo(null);
      homeButton.hidden = true;
      renderHome(gameContainer, state.leaderboard, {
        currentUser: state.currentUser,
        view: state.authView,
        status: state.authStatus,
        message: state.authMessage,
        adminUsers: state.adminUsers,
        selectedAdminUsers: state.selectedAdminUsers
      }, {
        onStart: handleStartGame,
        onLeaderboardOpen: handleLeaderboardOpen,
        onModeSelect: function (modeId) {
          openMode(modeId);
        },
        onAuthViewChange: handleAuthViewChange,
        onLogin: handleLogin,
        onRegister: handleRegister,
        onLogout: handleLogout,
        onAdminRefresh: refreshAdminUsers,
        onAdminPoints: handleAdminPoints,
        onAdminBan: handleAdminBan,
        onAdminToggleSelect: handleAdminToggleSelect,
        onAdminSelectAll: handleAdminSelectAll,
        onAdminBulkPoints: handleAdminBulkPoints,
        onAdminBulkBan: handleAdminBulkBan
      });
      return;
    }

    const selectedMode = gameModes.find(function (mode) {
      return mode.id === state.activeModeId;
    });

    if (!selectedMode) {
      openMenu();
      return;
    }

    applySeo(selectedMode.id);
    homeButton.hidden = false;

    if (selectedMode.id === "classic") {
      if (state.dataStatus === "loading") {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Loading</div><h2 class="mode-title">Pobieranie bohaterow...</h2><p>Classic uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p></div></div>';
        return;
      }

      if (state.dataStatus === "error" || !classicGame) {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Classic unavailable</div><h2 class="mode-title">Nie udalo sie przygotowac trybu.</h2><p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p></div></div>';
        return;
      }

      renderClassicGame(gameContainer, classicGame.getState(), {
        onBack: openMenu,
        onRestart: restartClassicMode,
        onGuess: submitClassicGuess
      }, getGameMeta("classic"));
      return;
    }

    if (selectedMode.id === "fight") {
      if (state.dataStatus === "loading") {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Loading</div><h2 class="mode-title">Pobieranie bohaterow...</h2><p>Fight uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p></div></div>';
        return;
      }

      if (state.dataStatus === "error" || !fightGame) {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Fight unavailable</div><h2 class="mode-title">Nie udalo sie przygotowac walki.</h2><p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p></div></div>';
        return;
      }

      renderFightGame(gameContainer, fightGame.getState(), {
        onBack: openMenu,
        onChooseWinner: chooseFightWinner,
        onNextRound: nextFightRound
      }, getGameMeta("fight"));
      return;
    }

    if (selectedMode.id === "power") {
      if (state.dataStatus === "loading") {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Loading</div><h2 class="mode-title">Pobieranie bohaterow...</h2><p>Power uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p></div></div>';
        return;
      }

      if (state.dataStatus === "error" || !powerGame) {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Power unavailable</div><h2 class="mode-title">Nie udalo sie przygotowac trybu Power.</h2><p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p></div></div>';
        return;
      }

      renderPowerGame(gameContainer, powerGame.getState(), {
        onBack: openMenu,
        onGuess: submitPowerGuess,
        onRestart: restartPowerRound,
        onChangeDifficulty: changePowerDifficulty,
        onChooseOption: choosePowerOption,
        onToggleTimer: togglePowerTimer
      }, getGameMeta("power"));
      return;
    }

    if (selectedMode.id === "lore") {
      if (state.dataStatus === "loading") {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Loading</div><h2 class="mode-title">Pobieranie bohaterow...</h2><p>Lore uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p></div></div>';
        return;
      }

      if (state.dataStatus === "error" || !loreGame) {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Lore unavailable</div><h2 class="mode-title">Nie udalo sie przygotowac trybu Lore.</h2><p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p></div></div>';
        return;
      }

      renderLoreGame(gameContainer, loreGame.getState(), {
        onBack: openMenu,
        onGuess: submitLoreGuess,
        onRestart: restartLoreRound
      }, getGameMeta("lore"));
      return;
    }

    if (selectedMode.id === "daily") {
      if (state.dataStatus === "loading") {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Loading</div><h2 class="mode-title">Pobieranie bohaterow...</h2><p>Daily Challenge uruchomi sie, gdy baza Marvel/DC bedzie gotowa.</p></div></div>';
        return;
      }

      if (state.dataStatus === "error" || !dailyGame) {
        gameContainer.innerHTML = '<div class="placeholder-menu"><div><div class="mode-badge">Daily unavailable</div><h2 class="mode-title">Nie udalo sie przygotowac Daily Challenge.</h2><p>Sprawdz polaczenie z API i sprobuj ponownie odswiezyc aplikacje.</p></div></div>';
        return;
      }

      renderDailyGame(gameContainer, dailyGame.getState(), {
        onBack: openMenu,
        onGuess: submitDailyGuess
      }, getGameMeta("daily"));
      return;
    }

    renderMode(gameContainer, selectedMode, openMenu);
  }

  homeButton.addEventListener("click", openMenu);
  nicknameInput.addEventListener("change", function () {
    if (store.getState().currentUser) {
      nicknameInput.value = store.getState().currentUser.nickname;
      return;
    }

    const safeNickname = String(nicknameInput.value || "").trim() || "Guest";
    saveNickname(safeNickname);
    store.setState({ nickname: safeNickname });
  });
  store.subscribe(updateApp);
  updateApp(store.getState());
  warmUpBackend();
  refreshLeaderboard();
  applySeo(getModeFromUrl());

  if (store.getState().authToken) {
    fetchCurrentUser(store.getState().authToken)
      .then(function (user) {
        const mergedProgress = mergeProgressWithUser(loadSavedProgress(), user);
        saveNickname(user.nickname);
        saveProgress(mergedProgress);
        store.setState({
          currentUser: user,
          nickname: user.nickname,
          progress: mergedProgress,
          authStatus: "success",
          authMessage: "Sesja zostala przywrocona."
        });

        if (user.role === "admin") {
          refreshAdminUsers();
        }
      })
      .catch(function () {
        saveAuthToken("");
        store.setState({
          authToken: "",
          currentUser: null,
          adminUsers: [],
          authStatus: "error",
          authMessage: "Sesja wygasla. Zaloguj sie ponownie."
        });
      });
  }

  loadSuperheroes()
    .then(function (heroCollection) {
      const syncedProgress = progressionManager.syncDailyChallenge(heroCollection.heroes);
      store.setState({
        heroCollection: heroCollection,
        dataStatus: "ready",
        progress: syncedProgress
      });

      const initialMode = getModeFromUrl();
      if (initialMode) {
        openMode(initialMode, { skipTracking: true });
      }
    })
    .catch(function (error) {
      console.error("Superhero data load failed:", error);
      store.setState({ dataStatus: "error" });
    });
}());
