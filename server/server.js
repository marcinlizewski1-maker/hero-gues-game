const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const APP_BASE_URL =
  process.env.APP_BASE_URL || "https://hero-gues-game1.onrender.com";
const FRONTEND_URL = process.env.FRONTEND_URL || APP_BASE_URL;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://marcinlizewski1_db_user:L3SgCxQXEvs5pyXn@heroguess.hmuwj1b.mongodb.net/?appName=HeroGuess";
const JWT_SECRET = process.env.JWT_SECRET || "hero-guess-dev-secret";
const ADMIN_EMAIL = "marcin.lizewski2@wp.pl";
const ADMIN_PASSWORD = "Martillos6";
const ADMIN_NICKNAME = "MarcinYT";
const MONGOOSE_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 10000
};
const DB_RETRY_DELAY_MS = 15000;
let isDatabaseReady = false;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = new Set([APP_BASE_URL, FRONTEND_URL]);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true
  })
);
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
  console.log("MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  isDatabaseReady = false;
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("error", (error) => {
  isDatabaseReady = false;
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

    if (changed) {
      await existingAdmin.save();
    }

    console.log("Admin account ready:", ADMIN_EMAIL);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

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
    frontendUrl: FRONTEND_URL
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

    return res.json(users.map(sanitizeUser));
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

app.use(express.static(path.join(__dirname, "..")));

app.get("*", (req, res) => {
  const apiPrefixes = ["/register", "/login", "/leaderboard", "/me", "/admin", "/user/"];

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
    console.error("Initial MongoDB Atlas connection failed:", error.message);
    console.error("Most likely cause: Atlas Network Access does not allow Render to connect.");
    setTimeout(connectToDatabase, DB_RETRY_DELAY_MS);
  }
}

app.listen(PORT, () => {
  console.log("Hero Guess backend listening on " + APP_BASE_URL);
  connectToDatabase();
});
