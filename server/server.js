const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const APP_BASE_URL =
  process.env.APP_BASE_URL || "https://hero-gues-game1.onrender.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://hero-gues-game.vercel.app";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://marcinlizewski1_db_user:Test1234@cluster0.syrgpjy.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "hero-guess-dev-secret";
const ADMIN_EMAIL = "marcin.lizewski2@wp.pl";
const ADMIN_PASSWORD = "Martillos6";
const ADMIN_NICKNAME = "MarcinYT";
const MONGOOSE_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  family: 4,
  autoSelectFamily: false
};
const DB_RETRY_DELAY_MS = 15000;
const SUPERHERO_API_URL = "https://akabab.github.io/superhero-api/api/all.json";
const MULTIPLAYER_TURN_TIME_MS = 10000;
const MULTIPLAYER_STARTING_LIVES = 5;
const ROOM_CODE_LENGTH = 4;
let isDatabaseReady = false;
let lastDatabaseError = "";
let superheroCache = null;
let superheroCacheFetchedAt = null;
let superheroFetchPromise = null;
const multiplayerRooms = new Map();
const socketUserMap = new Map();

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const allowedOrigins = new Set([APP_BASE_URL, FRONTEND_URL]);
  const isTrustedPreview =
    /\.onrender\.com$/i.test(origin) ||
    /\.vercel\.app$/i.test(origin) ||
    /\.netlify\.app$/i.test(origin);

  return allowedOrigins.has(origin) || isTrustedPreview;
}

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true
  }
});

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true
  })
);
app.options("*", cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true, unique: true, trim: true, maxlength: 24 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    banned: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  {
    collection: "users"
  }
);

const User = mongoose.model("User", userSchema);

mongoose.connection.on("connected", () => {
  isDatabaseReady = true;
  lastDatabaseError = "";
  console.log("MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  isDatabaseReady = false;
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("error", (error) => {
  isDatabaseReady = false;
  lastDatabaseError = error.message || "MongoDB connection error";
  console.error("MongoDB connection error:", error.message);
});

function sanitizeUser(user) {
  return {
    id: String(user._id),
    nickname: user.nickname,
    email: user.email,
    points: user.points,
    streak: user.streak,
    banned: user.banned,
    role: user.role,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt
  };
}

function sanitizePublicUser(user) {
  return {
    id: String(user._id),
    nickname: user.nickname,
    points: user.points,
    streak: user.streak
  };
}

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireDatabase(_req, res, next) {
  if (!isDatabaseReady) {
    return res.status(503).json({
      error: "Baza danych jest chwilowo niedostepna. Sprobuj ponownie za chwile."
    });
  }

  return next();
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Brak tokenu JWT." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: "Uzytkownik nie istnieje." });
    }

    if (user.banned) {
      return res.status(403).json({ error: "Uzytkownik jest zbanowany." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Nieprawidlowy token JWT." });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Ta akcja wymaga konta admina." });
  }

  return next();
}

async function ensureAdminAccount() {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existingAdmin) {
    let changed = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      changed = true;
    }

    if (existingAdmin.nickname !== ADMIN_NICKNAME) {
      existingAdmin.nickname = ADMIN_NICKNAME;
      changed = true;
    }

    if (existingAdmin.banned) {
      existingAdmin.banned = false;
      changed = true;
    }

    existingAdmin.password = hashedPassword;
    changed = true;

    if (changed) {
      await existingAdmin.save();
    }

    console.log("Admin account ready:", ADMIN_EMAIL);
    return;
  }

  await User.create({
    nickname: ADMIN_NICKNAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    points: 0,
    streak: 0,
    createdAt: new Date(),
    banned: false,
    role: "admin"
  });

  console.log("Admin account created:", ADMIN_EMAIL);
}

app.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    database: isDatabaseReady ? "connected" : "disconnected",
    baseUrl: APP_BASE_URL,
    frontendUrl: FRONTEND_URL,
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || null,
    lastDatabaseError: lastDatabaseError || null,
    superheroesCached: Boolean(superheroCache),
    superheroesCacheFetchedAt: superheroCacheFetchedAt
  });
});

async function fetchAndCacheSuperheroes() {
  if (superheroCache) {
    return superheroCache;
  }

  if (superheroFetchPromise) {
    return superheroFetchPromise;
  }

  superheroFetchPromise = fetch(SUPERHERO_API_URL)
    .then(async function (response) {
      if (!response.ok) {
        throw new Error("Nie udalo sie pobrac danych bohaterow z zewnetrznego API.");
      }

      const payload = await response.json();
      superheroCache = payload;
      superheroCacheFetchedAt = new Date().toISOString();
      console.log("Superhero cache ready. Records:", Array.isArray(payload) ? payload.length : 0);
      return superheroCache;
    })
    .catch(function (error) {
      if (superheroCache) {
        console.warn("Superhero refresh failed, using existing cache:", error.message);
        return superheroCache;
      }

      throw error;
    })
    .finally(function () {
      superheroFetchPromise = null;
    });

  return superheroFetchPromise;
}

function preloadSuperheroes() {
  return fetchAndCacheSuperheroes()
    .then(function () {
      console.log("Superhero preload completed.");
    })
    .catch(function (error) {
      console.error("Superhero preload failed:", error.message);
    });
}

const POPULAR_HERO_NAMES = new Set([
  "Batman", "Superman", "Wonder Woman", "Flash", "Green Lantern", "Aquaman", "Cyborg", "Robin", "Nightwing", "Batgirl", "Catwoman", "Harley Quinn", "Joker", "Lex Luthor", "Supergirl", "Green Arrow", "Black Canary", "Martian Manhunter", "Shazam", "Constantine", "Raven", "Starfire", "Beast Boy", "Blue Beetle", "Hawkman", "Hawkgirl", "Zatanna", "Poison Ivy", "Bane", "Deathstroke", "Ra's Al Ghul", "Darkseid", "Doomsday", "Brainiac", "Penguin", "Riddler", "Two-Face", "Scarecrow", "Red Hood", "Red Robin", "Doctor Fate", "Black Adam", "Mera", "Booster Gold", "Static", "Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Wolverine", "Cyclops", "Jean Grey", "Storm", "Rogue", "Gambit", "Iceman", "Beast", "Nightcrawler", "Professor X", "Magneto", "Mystique", "Deadpool", "Punisher", "Daredevil", "Elektra", "Blade", "Ghost Rider", "Doctor Strange", "Scarlet Witch", "Vision", "Falcon", "Winter Soldier", "Black Panther", "Captain Marvel", "Ant-Man", "Wasp", "She-Hulk", "Moon Knight", "Nova", "Silver Surfer", "Thanos", "Loki", "Venom", "Carnage", "Green Goblin", "Doctor Octopus", "Kingpin", "Ultron", "Apocalypse", "Cable", "Domino", "Colossus", "Psylocke", "Kitty Pryde", "Emma Frost", "Luke Cage"
]);

function isAllowedPublisher(hero) {
  const publisher = normalizePublisher(hero.biography && hero.biography.publisher);
  return publisher === "Marvel Comics" || publisher === "DC Comics";
}

function isPopularHero(hero) {
  return POPULAR_HERO_NAMES.has(hero.name);
}

function toHeroRecord(hero) {
  return {
    id: hero.id,
    name: hero.name,
    slug: hero.slug,
    gender: hero.appearance?.gender ?? "Unknown",
    publisher: hero.biography?.publisher ?? "Unknown",
    universe: hero.biography?.publisher ?? "Unknown",
    fullName: hero.biography?.fullName || hero.name,
    alignment: hero.biography?.alignment ?? "unknown",
    intelligence: hero.powerstats?.intelligence ?? 0,
    strength: hero.powerstats?.strength ?? 0,
    speed: hero.powerstats?.speed ?? 0,
    durability: hero.powerstats?.durability ?? 0,
    power: hero.powerstats?.power ?? 0,
    combat: hero.powerstats?.combat ?? 0
  };
}

function buildHeroCollection(allHeroes) {
  const publisherHeroes = allHeroes.filter(isAllowedPublisher);
  const popularHeroes = publisherHeroes.filter(isPopularHero).slice(0, 150);

  if (popularHeroes.length < 100) {
    return publisherHeroes.slice(0, 150).map(toHeroRecord);
  }

  return popularHeroes.map(toHeroRecord);
}

function normalizePublisher(publisher) {
  return String(publisher || "").trim();
}

function buildMultiplayerHeroPool() {
  if (!Array.isArray(superheroCache)) {
    return [];
  }

  return superheroCache
    .filter(function (hero) {
      const publisher = normalizePublisher(hero.biography && hero.biography.publisher);
      return publisher === "Marvel Comics" || publisher === "DC Comics";
    })
    .filter(function (hero) {
      return hero && hero.name && hero.powerstats;
    })
    .slice(0, 180);
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateRoomCode() {
  let nextCode = randomCode();

  while (multiplayerRooms.has(nextCode)) {
    nextCode = randomCode();
  }

  return nextCode;
}

function getActiveRoomByUserId(userId) {
  for (const room of multiplayerRooms.values()) {
    if (
      room.status !== "finished" &&
      room.players.some(function (player) {
        return player.userId === userId;
      })
    ) {
      return room;
    }
  }

  return null;
}

function getRoomSummaryForUserId(userId) {
  const room = getActiveRoomByUserId(userId);

  if (!room) {
    return {
      activeRoomCode: null,
      activeRoomStatus: null
    };
  }

  return {
    activeRoomCode: room.code,
    activeRoomStatus: room.status
  };
}

function sanitizeRoomForClient(room, userId) {
  const me = room.players.find(function (player) {
    return player.userId === userId;
  }) || null;
  const opponent = room.players.find(function (player) {
    return player.userId !== userId;
  }) || null;

  return {
    code: room.code,
    status: room.status,
    players: room.players.map(function (player) {
      return {
        id: player.userId,
        nickname: player.nickname,
        score: player.score,
        lives: player.lives,
        connected: player.connected
      };
    }),
    me: me ? {
      id: me.userId,
      nickname: me.nickname,
      score: me.score,
      lives: me.lives
    } : null,
    opponent: opponent ? {
      id: opponent.userId,
      nickname: opponent.nickname,
      score: opponent.score,
      lives: opponent.lives,
      connected: opponent.connected
    } : null,
    hangman: room.wordState ? {
      maskedWord: room.wordState.maskedWord,
      guessedLetters: room.wordState.guessedLetters,
      usedLetters: room.wordState.guessedLetters,
      currentTurnUserId: room.wordState.currentTurnUserId,
      imageUrl: room.wordState.imageUrl,
      imageAlt: room.wordState.answerName,
      revealedWord: room.status === "finished" ? room.wordState.answerName : null
    } : null,
    result: room.result || null,
    waitingForOpponent: room.players.length < 2,
    timeLimitMs: MULTIPLAYER_TURN_TIME_MS,
    roundEndsAt: room.roundEndsAt || null,
    secondsLeft: room.roundEndsAt ? Math.max(0, Math.ceil((room.roundEndsAt - Date.now()) / 1000)) : 0
  };
}

function emitRoomState(room) {
  room.players.forEach(function (player) {
    if (player.socketId) {
      io.to(player.socketId).emit("multiplayer:state", sanitizeRoomForClient(room, player.userId));
    }
  });
}

function normalizeHangmanWord(word) {
  return String(word || "").toUpperCase();
}

function buildMaskedWord(answerName, guessedLetters) {
  const normalized = normalizeHangmanWord(answerName);

  return normalized.split("").map(function (character) {
    if (!/[A-Z0-9]/.test(character)) {
      return character;
    }

    return guessedLetters.includes(character) ? character : "_";
  }).join(" ");
}

function isWholeWordRevealed(answerName, guessedLetters) {
  return normalizeHangmanWord(answerName).split("").every(function (character) {
    if (!/[A-Z0-9]/.test(character)) {
      return true;
    }

    return guessedLetters.includes(character);
  });
}

function createHangmanState(hero, players) {
  const guessedLetters = [];

  return {
    heroId: String(hero.id),
    answerName: hero.name,
    imageUrl: hero.images && (hero.images.md || hero.images.sm || hero.images.lg) || "",
    guessedLetters: guessedLetters,
    maskedWord: buildMaskedWord(hero.name, guessedLetters),
    currentTurnUserId: players[0] ? players[0].userId : null
  };
}

function clearRoomTimers(room) {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }

  if (room.roundTicker) {
    clearInterval(room.roundTicker);
    room.roundTicker = null;
  }

  if (room.nextRoundTimer) {
    clearTimeout(room.nextRoundTimer);
    room.nextRoundTimer = null;
  }
}

function cleanupRoom(roomCode) {
  const room = multiplayerRooms.get(roomCode);

  if (!room) {
    return;
  }

  clearRoomTimers(room);
  multiplayerRooms.delete(roomCode);
}

function removePlayerFromRoomByAdmin(userId) {
  const room = getActiveRoomByUserId(userId);

  if (!room) {
    return {
      removed: false
    };
  }

  const player = room.players.find(function (entry) {
    return entry.userId === userId;
  });
  const opponent = room.players.find(function (entry) {
    return entry.userId !== userId;
  });

  if (player && player.socketId) {
    io.to(player.socketId).emit("multiplayer:kicked", {
      roomCode: room.code,
      message: "Administrator wyrzucil Cie z pokoju."
    });

    const liveSocket = io.sockets.sockets.get(player.socketId);
    if (liveSocket) {
      liveSocket.leave(room.code);
    }
  }

  room.players = room.players.filter(function (entry) {
    return entry.userId !== userId;
  });

  if (!room.players.length) {
    cleanupRoom(room.code);
    return {
      removed: true,
      roomCode: room.code,
      winnerId: null
    };
  }

  if (opponent) {
    finishRoom(room, "admin_kick", opponent.userId);
  } else {
    emitRoomState(room);
  }

  return {
    removed: true,
    roomCode: room.code,
    winnerId: opponent ? opponent.userId : null
  };
}

function finishRoom(room, reason, winnerId) {
  clearRoomTimers(room);
  room.status = "finished";
  room.result = {
    reason: reason,
    winnerId: winnerId || null
  };
  room.roundEndsAt = null;
  
  // Reset player ready states for potential rematch
  room.players.forEach(function (player) {
    player.playerReady = false;
  });
  
  emitRoomState(room);
  room.players.forEach(function (player) {
    if (player.socketId) {
      io.to(player.socketId).emit("multiplayer:finished", sanitizeRoomForClient(room, player.userId));
      io.to(player.socketId).emit("gameOver", {
        winner: winnerId || null,
        correctWord: room.wordState ? room.wordState.answerName : null
      });
    }
  });
  setTimeout(function () {
    cleanupRoom(room.code);
  }, 120000);
}

function emitTimerUpdate(room) {
  const secondsLeft = Math.max(0, Math.ceil((room.roundEndsAt - Date.now()) / 1000));

  io.to(room.code).emit("multiplayer:update-turn", {
    currentTurnUserId: room.wordState ? room.wordState.currentTurnUserId : null,
    secondsLeft: secondsLeft
  });
}

function scheduleTurnTimeout(room) {
  clearRoomTimers(room);
  room.status = "playing";
  room.roundEndsAt = Date.now() + MULTIPLAYER_TURN_TIME_MS;
  emitRoomState(room);

  emitTimerUpdate(room);

  room.roundTicker = setInterval(function () {
    emitTimerUpdate(room);
  }, 1000);

  room.roundTimer = setTimeout(function () {
    if (!room.wordState) {
      return;
    }

    const timedOutPlayer = room.players.find(function (player) {
      return player.userId === room.wordState.currentTurnUserId;
    });
    const nextPlayer = room.players.find(function (player) {
      return player.userId !== room.wordState.currentTurnUserId;
    });

    if (!timedOutPlayer || !nextPlayer) {
      return;
    }

    room.wordState.currentTurnUserId = nextPlayer.userId;
    room.roundEndsAt = null;
    io.to(room.code).emit("multiplayer:turn-result", {
      timeout: true,
      guessedLetter: null,
      correct: false,
      byUserId: timedOutPlayer.userId,
      nextTurnUserId: nextPlayer.userId,
      message: timedOutPlayer.nickname + " nie wykonal ruchu na czas."
    });
    scheduleTurnTimeout(room);
  }, MULTIPLAYER_TURN_TIME_MS);
}

async function startRoomIfReady(room) {
  if (room.status !== "waiting") {
    return;
  }

  if (room.players.length < 2) {
    emitRoomState(room);
    return;
  }

  const allConnected = room.players.every(function (player) {
    return Boolean(player.socketId) && player.connected;
  });

  if (!allConnected) {
    emitRoomState(room);
    return;
  }

  if (!superheroCache) {
    try {
      await fetchAndCacheSuperheroes();
    } catch (error) {
      room.status = "error";
      room.result = {
        reason: "superhero_load_failed",
        winnerId: null
      };
      emitRoomState(room);
      return;
    }
  }

  const pool = buildMultiplayerHeroPool();

  if (pool.length < 2) {
    room.status = "error";
    room.result = {
      reason: "not_enough_heroes",
      winnerId: null
    };
    emitRoomState(room);
    return;
  }

  const shuffled = pool.slice().sort(function () {
    return Math.random() - 0.5;
  });

  room.players.forEach(function (player) {
    player.score = 0;
    player.lives = MULTIPLAYER_STARTING_LIVES;
    player.answeredRound = false;
    player.ready = false;
    player.playerReady = false; // Reset for new READY system
  });
  room.wordState = createHangmanState(shuffled[0], room.players);
  room.status = "loading"; // Set status to loading - wait for players to be ready
  emitRoomState(room);
  // Wait for players to send player_ready before starting the game
}

function startGameIfAllReady(room) {
  console.log(`[SERVER] Checking if game can start for room ${room.code} - status: ${room.status}`);
  
  if (room.status !== "loading") {
    console.log(`[SERVER] Room ${room.code} not in loading state, cannot start game`);
    return;
  }

  const allReady = room.players.every(function (player) {
    return player.ready;
  });

  console.log(`[SERVER] Room ${room.code} all players ready: ${allReady} (${room.players.map(p => `${p.nickname}: ${p.ready}`).join(', ')})`);

  if (!allReady) {
    return;
  }

  // All players are ready, start the game
  console.log(`[SERVER] Starting game for room ${room.code}`);
  room.status = "playing";
  io.to(room.code).emit("multiplayer:start-game");
  scheduleTurnTimeout(room);
}

app.get("/superheroes", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

  if (superheroCache) {
    return res.json(superheroCache);
  }

  try {
    const data = await fetchAndCacheSuperheroes();
    return res.json(data);
  } catch (error) {
    console.error("Superhero proxy failed:", error);

    if (superheroCache) {
      return res.json(superheroCache);
    }

    return res.status(500).json({ error: "Nie udalo sie pobrac danych bohaterow." });
  }
});

app.get("/api/characters", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

  try {
    const allHeroes = await fetchAndCacheSuperheroes();
    const heroes = buildHeroCollection(allHeroes);
    const data = {
      fetchedAt: new Date().toISOString(),
      total: heroes.length,
      publishers: ["Marvel Comics", "DC Comics"],
      heroes
    };
    return res.json(data);
  } catch (error) {
    console.error("Characters API failed:", error);
    return res.status(500).json({ error: "Nie udalo sie pobrac danych bohaterow." });
  }
});

app.post("/multiplayer/create-room", requireDatabase, authMiddleware, async (req, res) => {
  const existingRoom = getActiveRoomByUserId(String(req.user._id));

  if (existingRoom) {
    return res.status(409).json({
      error: "Ten gracz jest juz w aktywnym pokoju.",
      room: sanitizeRoomForClient(existingRoom, String(req.user._id))
    });
  }

  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    status: "waiting",
    players: [
      {
        userId: String(req.user._id),
        nickname: req.user.nickname,
        socketId: null,
        connected: false,
        score: 0,
        lives: MULTIPLAYER_STARTING_LIVES,
        answeredRound: false
      }
    ],
    questions: [],
    currentQuestionIndex: -1,
    currentQuestion: null,
    wordState: null,
    roundEndsAt: null,
    roundTimer: null,
    nextRoundTimer: null,
    result: null,
    createdAt: Date.now()
  };

  multiplayerRooms.set(roomCode, room);

  return res.status(201).json({
    ok: true,
    roomCode: roomCode,
    room: sanitizeRoomForClient(room, String(req.user._id))
  });
});

app.post("/multiplayer/join-room", requireDatabase, authMiddleware, async (req, res) => {
  const roomCode = String(req.body.roomCode || "").trim().toUpperCase();

  if (!roomCode) {
    return res.status(400).json({ error: "Kod pokoju jest wymagany." });
  }

  const existingRoom = getActiveRoomByUserId(String(req.user._id));
  if (existingRoom && existingRoom.code !== roomCode) {
    return res.status(409).json({
      error: "Ten gracz jest juz w aktywnym pokoju.",
      room: sanitizeRoomForClient(existingRoom, String(req.user._id))
    });
  }

  const room = multiplayerRooms.get(roomCode);

  if (!room) {
    return res.status(404).json({ error: "Nie znaleziono pokoju o takim kodzie." });
  }

  if (room.status === "finished") {
    return res.status(410).json({ error: "Ten pokoj jest juz zakonczony." });
  }

  const existingPlayer = room.players.find(function (player) {
    return player.userId === String(req.user._id);
  });

  if (!existingPlayer && room.players.length >= 2) {
    return res.status(409).json({ error: "Pokoj jest juz pelny." });
  }

  if (!existingPlayer) {
    room.players.push({
      userId: String(req.user._id),
      nickname: req.user.nickname,
      socketId: null,
      connected: false,
      score: 0,
      lives: MULTIPLAYER_STARTING_LIVES,
      answeredRound: false,
      ready: false
    });
  }

  emitRoomState(room);
  startRoomIfReady(room);

  return res.json({
    ok: true,
    roomCode: roomCode,
    room: sanitizeRoomForClient(room, String(req.user._id))
  });
});

app.post("/register", requireDatabase, async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "nickname, email i password sa wymagane." });
    }

    const existingUser = await User.findOne({
      $or: [{ nickname: nickname }, { email: email }]
    });

    if (existingUser) {
      return res.status(409).json({ error: "Uzytkownik o takim nicku lub emailu juz istnieje." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nickname: nickname,
      email: email,
      password: hashedPassword,
      points: 0,
      streak: 0,
      createdAt: new Date(),
      banned: false,
      role: "user"
    });

    return res.status(201).json({
      ok: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Register failed:", error);
    return res.status(500).json({ error: "Blad rejestracji uzytkownika." });
  }
});

app.post("/login", requireDatabase, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: "Nieprawidlowy email lub haslo." });
    }

    if (user.banned) {
      return res.status(403).json({ error: "To konto jest zbanowane." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Nieprawidlowy email lub haslo." });
    }

    return res.json({
      ok: true,
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Blad logowania." });
  }
});

app.get("/leaderboard", requireDatabase, authMiddleware, async (_req, res) => {
  try {
    const users = await User.find({ banned: false })
      .sort({ points: -1, streak: -1, createdAt: 1 })
      .limit(50)
      .select("nickname points streak")
      .lean();

    return res.json(users.map(sanitizePublicUser));
  } catch (error) {
    console.error("Leaderboard failed:", error);
    return res.status(500).json({ error: "Nie udalo sie pobrac leaderboardu." });
  }
});

app.get("/me", requireDatabase, authMiddleware, async (req, res) => {
  return res.json(sanitizeUser(req.user));
});

app.patch("/me/progress", requireDatabase, authMiddleware, async (req, res) => {
  try {
    const points = Number(req.body.points);
    const streak = Number(req.body.streak);

    if (Number.isNaN(points) || Number.isNaN(streak)) {
      return res.status(400).json({ error: "points i streak musza byc liczbami." });
    }

    req.user.points = points;
    req.user.streak = streak;
    await req.user.save();

    return res.json({
      ok: true,
      user: sanitizeUser(req.user)
    });
  } catch (error) {
    console.error("Progress update failed:", error);
    return res.status(500).json({ error: "Nie udalo sie zapisac progresu." });
  }
});

app.get("/admin/users", requireDatabase, authMiddleware, adminOnly, async (_req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("nickname email points streak createdAt banned role")
      .lean();

    return res.json(users.map(function (user) {
      return Object.assign({}, sanitizeUser(user), getRoomSummaryForUserId(String(user._id)));
    }));
  } catch (error) {
    console.error("Admin users failed:", error);
    return res.status(500).json({ error: "Nie udalo sie pobrac listy uzytkownikow." });
  }
});

app.patch("/user/:id/points", requireDatabase, authMiddleware, adminOnly, async (req, res) => {
  try {
    const userId = String(req.params.id || "");
    const delta = Number(req.body.delta);

    if (!userId || Number.isNaN(delta)) {
      return res.status(400).json({ error: "Parametry id i delta sa wymagane." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Nie znaleziono uzytkownika." });
    }

    user.points += delta;
    await user.save();

    return res.json({
      ok: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Points update failed:", error);
    return res.status(500).json({ error: "Nie udalo sie zmienic punktow uzytkownika." });
  }
});

app.patch("/user/:id/ban", requireDatabase, authMiddleware, adminOnly, async (req, res) => {
  try {
    const userId = String(req.params.id || "");
    const banned = req.body.banned === undefined ? true : Boolean(req.body.banned);

    if (!userId) {
      return res.status(400).json({ error: "Parametr id jest wymagany." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Nie znaleziono uzytkownika." });
    }

    user.banned = banned;
    await user.save();

    return res.json({
      ok: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Ban update failed:", error);
    return res.status(500).json({ error: "Nie udalo sie zmienic statusu bana." });
  }
});

app.delete("/user/:id", requireDatabase, authMiddleware, adminOnly, async (req, res) => {
  try {
    const userId = String(req.params.id || "");

    if (!userId) {
      return res.status(400).json({ error: "Parametr id jest wymagany." });
    }

    if (String(req.user._id) === userId) {
      return res.status(400).json({ error: "Admin nie moze usunac swojego konta." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Nie znaleziono uzytkownika." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ error: "Nie mozna usunac konta admina." });
    }

    await User.deleteOne({ _id: user._id });

    return res.json({
      ok: true,
      deletedUserId: userId
    });
  } catch (error) {
    console.error("User delete failed:", error);
    return res.status(500).json({ error: "Nie udalo sie usunac uzytkownika." });
  }
});

app.post("/admin/kick-room/:id", requireDatabase, authMiddleware, adminOnly, async (req, res) => {
  try {
    const userId = String(req.params.id || "");

    if (!userId) {
      return res.status(400).json({ error: "Parametr id jest wymagany." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Nie znaleziono uzytkownika." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ error: "Nie mozna wyrzucic admina z pokoju." });
    }

    const result = removePlayerFromRoomByAdmin(String(user._id));

    if (!result.removed) {
      return res.status(404).json({ error: "Ten uzytkownik nie jest w aktywnym pokoju." });
    }

    return res.json({
      ok: true,
      kickedUserId: String(user._id),
      roomCode: result.roomCode,
      winnerId: result.winnerId
    });
  } catch (error) {
    console.error("Kick room failed:", error);
    return res.status(500).json({ error: "Nie udalo sie wyrzucic gracza z pokoju." });
  }
});

io.use(async function (socket, next) {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Brak tokenu JWT."));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return next(new Error("Uzytkownik nie istnieje."));
    }

    if (user.banned) {
      return next(new Error("Uzytkownik jest zbanowany."));
    }

    socket.data.user = {
      id: String(user._id),
      nickname: user.nickname,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(new Error("Nieprawidlowy token JWT."));
  }
});

io.on("connection", function (socket) {
  const userId = socket.data.user.id;
  socketUserMap.set(userId, socket.id);

  socket.on("multiplayer:join-room", function (payload) {
    const roomCode = String(payload && payload.roomCode || "").trim().toUpperCase();
    console.log(`[SERVER] User ${userId} attempting to join room ${roomCode}`);
    
    const room = multiplayerRooms.get(roomCode);

    if (!room) {
      console.log(`[SERVER] Room ${roomCode} not found`);
      socket.emit("multiplayer:error", { error: "Nie znaleziono pokoju o takim kodzie." });
      return;
    }

    const player = room.players.find(function (entry) {
      return entry.userId === userId;
    });

    if (!player) {
      console.log(`[SERVER] User ${userId} not in room ${roomCode} players: ${room.players.map(p => p.userId).join(', ')}`);
      socket.emit("multiplayer:error", { error: "Nie nalezysz do tego pokoju." });
      return;
    }

    console.log(`[SERVER] User ${userId} joining room ${roomCode} - room has ${room.players.length} players`);
    socket.join(room.code);
    player.socketId = socket.id;
    player.connected = true;
    emitRoomState(room);
    startRoomIfReady(room);
  });

  socket.on("multiplayer:ready", function (payload) {
    const roomCode = String(payload && payload.roomCode || "").trim().toUpperCase();
    const room = multiplayerRooms.get(roomCode);

    if (!room) {
      socket.emit("multiplayer:error", { error: "Nie znaleziono pokoju o takim kodzie." });
      return;
    }

    const player = room.players.find(function (entry) {
      return entry.userId === userId;
    });

    if (!player) {
      socket.emit("multiplayer:error", { error: "Nie nalezysz do tego pokoju." });
      return;
    }

    player.ready = true;
    emitRoomState(room);
    startGameIfAllReady(room);
  });

  socket.on("multiplayer:player-ready", function (payload) {
    const roomCode = String(payload && payload.roomCode || "").trim().toUpperCase();
    console.log(`[SERVER] User ${userId} sent player-ready for room ${roomCode}`);
    
    const room = multiplayerRooms.get(roomCode);

    if (!room) {
      console.log(`[SERVER] Room ${roomCode} not found for player-ready`);
      socket.emit("multiplayer:error", { error: "Nie znaleziono pokoju o takim kodzie." });
      return;
    }

    const player = room.players.find(function (entry) {
      return entry.userId === userId;
    });

    if (!player) {
      console.log(`[SERVER] User ${userId} not in room ${roomCode} for player-ready`);
      socket.emit("multiplayer:error", { error: "Nie nalezysz do tego pokoju." });
      return;
    }

    console.log(`[SERVER] Player ${player.nickname} (${userId}) sent player_ready for room ${roomCode}`);

    // Set player as ready for the new READY system
    player.playerReady = true;
    emitRoomState(room);

    // Check if both players are ready to start the game
    const allPlayersReady = room.players.every(function (p) {
      return p.playerReady;
    });

    console.log(`[SERVER] Room ${roomCode} ready status: ${allPlayersReady ? 'ALL READY' : 'WAITING'} (${room.players.map(p => `${p.nickname}: ${p.playerReady}`).join(', ')})`);

    if (allPlayersReady && room.status === "loading") {
      console.log(`[SERVER] Starting game for room ${roomCode}`);
      // Both players are ready, start the game
      io.to(room.code).emit("multiplayer:start-game");
      scheduleTurnTimeout(room);
    }
  });

  socket.on("multiplayer:guess-letter", function (payload) {
    const roomCode = String(payload && payload.roomCode || "").trim().toUpperCase();
    const letter = String(payload && payload.letter || "").trim().toUpperCase();
    const room = multiplayerRooms.get(roomCode);

    if (!room || room.status !== "playing" || !room.wordState) {
      socket.emit("multiplayer:error", { error: "Ten pojedynek nie jest aktywny." });
      return;
    }

    const player = room.players.find(function (entry) {
      return entry.userId === userId;
    });

    if (!player) {
      socket.emit("multiplayer:error", { error: "Nie nalezysz do tego pokoju." });
      return;
    }

    if (room.wordState.currentTurnUserId !== userId) {
      socket.emit("multiplayer:error", { error: "To nie jest Twoja tura." });
      return;
    }

    if (!/^[A-Z0-9]$/.test(letter)) {
      socket.emit("multiplayer:error", { error: "Podaj pojedyncza litere lub cyfre." });
      return;
    }

    if (room.wordState.guessedLetters.includes(letter)) {
      socket.emit("multiplayer:error", { error: "Ta litera zostala juz wykorzystana." });
      return;
    }

    const opponent = room.players.find(function (entry) {
      return entry.userId !== userId;
    });
    const normalizedWord = normalizeHangmanWord(room.wordState.answerName);
    const isCorrect = normalizedWord.includes(letter);

    clearRoomTimers(room);
    room.wordState.guessedLetters.push(letter);

    if (isCorrect) {
      player.score += 1;
    } else {
      player.lives = Math.max(0, (player.lives || 0) - 1);
    }

    room.wordState.maskedWord = buildMaskedWord(room.wordState.answerName, room.wordState.guessedLetters);

    io.to(room.code).emit("multiplayer:turn-result", {
      timeout: false,
      guessedLetter: letter,
      correct: isCorrect,
      byUserId: player.userId,
      nextTurnUserId: opponent ? opponent.userId : null,
      message: isCorrect
        ? player.nickname + " trafil litere " + letter + "."
        : player.nickname + " pomylil sie przy literze " + letter + "."
    });
    emitRoomState(room);

    if (isWholeWordRevealed(room.wordState.answerName, room.wordState.guessedLetters)) {
      player.score += 2;
      finishRoom(room, "word_guessed", player.userId);
      return;
    }

    if (player.lives <= 0) {
      finishRoom(room, "out_of_lives", opponent ? opponent.userId : null);
      return;
    }

    if (opponent) {
      room.wordState.currentTurnUserId = opponent.userId;
    }

    scheduleTurnTimeout(room);
  });

  socket.on("multiplayer:guess-full", function (payload) {
    const roomCode = String(payload && payload.roomCode || "").trim().toUpperCase();
    const guess = String(payload && payload.guess || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const room = multiplayerRooms.get(roomCode);

    if (!room || room.status !== "playing" || !room.wordState) {
      socket.emit("multiplayer:error", { error: "Ten pojedynek nie jest aktywny." });
      return;
    }

    const player = room.players.find(function (entry) {
      return entry.userId === userId;
    });

    if (!player) {
      socket.emit("multiplayer:error", { error: "Nie nalezysz do tego pokoju." });
      return;
    }

    if (room.wordState.currentTurnUserId !== userId) {
      socket.emit("multiplayer:error", { error: "To nie jest Twoja tura." });
      return;
    }

    if (!guess) {
      socket.emit("multiplayer:error", { error: "Podaj pelna odpowiedz." });
      return;
    }

    const opponent = room.players.find(function (entry) {
      return entry.userId !== userId;
    });
    const normalizedWord = normalizeHangmanWord(room.wordState.answerName);
    const isCorrect = normalizedWord === guess;

    clearRoomTimers(room);

    io.to(room.code).emit("multiplayer:guess-full-result", {
      correct: isCorrect,
      byUserId: player.userId,
      message: isCorrect
        ? player.nickname + " zgadl cala odpowiedz i wygrywa!"
        : player.nickname + " pomylil sie z pelna odpowiedzia i przegrywa."
    });

    if (isCorrect) {
      player.score += 5; // Bonus for full guess
      finishRoom(room, "full_guess_correct", player.userId);
    } else {
      finishRoom(room, "full_guess_wrong", opponent ? opponent.userId : null);
    }
  });

  socket.on("disconnect", function () {
    socketUserMap.delete(userId);

    for (const room of multiplayerRooms.values()) {
      const player = room.players.find(function (entry) {
        return entry.userId === userId;
      });

      if (!player) {
        continue;
      }

      player.connected = false;
      player.socketId = null;

      if (room.status === "waiting" || room.status === "playing") {
        const opponent = room.players.find(function (entry) {
          return entry.userId !== userId;
        });

        if (opponent) {
          finishRoom(room, "disconnect", opponent.userId);
        } else {
          emitRoomState(room);
        }
      }
    }
  });
});

app.use(express.static(path.join(__dirname, "..")));

app.use((error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (String(error.message || "").startsWith("CORS blocked")) {
    return res.status(403).json({ error: error.message });
  }

  console.error("Unhandled server error:", error);
  return res.status(500).json({ error: "Wewnetrzny blad serwera." });
});

app.get("*", (req, res) => {
  const apiPrefixes = ["/register", "/login", "/leaderboard", "/me", "/admin", "/user/", "/multiplayer"];

  if (
    apiPrefixes.some(function (prefix) {
      return req.path === prefix || req.path.startsWith(prefix);
    })
  ) {
    return res.status(404).json({ error: "Nie znaleziono endpointu API." });
  }

  return res.sendFile(path.join(__dirname, "..", "index.html"));
});

async function connectToDatabase() {
  const hostMatch = MONGODB_URI.match(/@([^/?]+)/);
  const atlasHost = hostMatch ? hostMatch[1] : "MongoDB Atlas";
  console.log("Connecting to MongoDB Atlas:", atlasHost);

  try {
    await mongoose.connect(MONGODB_URI, MONGOOSE_CONNECT_OPTIONS);
    console.log("Connected to MongoDB Atlas:", atlasHost);
    await ensureAdminAccount();
  } catch (error) {
    isDatabaseReady = false;
    lastDatabaseError = error.message || "Initial MongoDB Atlas connection failed";
    console.error("Initial MongoDB Atlas connection failed:", error.message);
    console.error("Most likely cause: Atlas Network Access does not allow Render to connect.");
    setTimeout(connectToDatabase, DB_RETRY_DELAY_MS);
  }
}

server.listen(PORT, () => {
  console.log("Hero Guess backend listening on " + APP_BASE_URL);
  preloadSuperheroes();
  connectToDatabase();
});
