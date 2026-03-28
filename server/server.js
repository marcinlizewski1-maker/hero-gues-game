const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.mongodb+srv://marcinlizewski1_db_user:L3SgCxQXEvs5pyXn@heroguess.hmuwj1b.mongodb.net/?appName=HeroGuess;
const JWT_SECRET = process.env.JWT_SECRET || "hero-guess-dev-secret";
const ADMIN_EMAIL = "marcin.lizewski2@wp.pl";
const ADMIN_PASSWORD = "Martillos6";
const ADMIN_NICKNAME = "MarcinYT";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

app.use(cors());
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

function sanitizeUser(user) {
  return {
    id: user._id,
    nickname: user.nickname,
    email: user.email,
    points: user.points,
    streak: user.streak,
    banned: user.banned,
    role: user.role,
    createdAt: user.createdAt
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
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      existingAdmin.nickname = ADMIN_NICKNAME;
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
    role: "admin",
    points: 0,
    streak: 0,
    banned: false
  });

  console.log("Admin account created:", ADMIN_EMAIL);
}

app.post("/register", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "nickname, email i password sa wymagane." });
    }

    const existingUser = await User.findOne({
      $or: [{ nickname }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({ error: "Uzytkownik o takim nicku lub emailu juz istnieje." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nickname,
      email,
      password: hashedPassword,
      role: "user",
      points: 0,
      streak: 0,
      banned: false
    });

    return res.status(201).json({
      ok: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ error: "Blad rejestracji uzytkownika." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });

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
    return res.status(500).json({ error: "Blad logowania." });
  }
});

app.get("/leaderboard", authMiddleware, async (_req, res) => {
  try {
    const users = await User.find({ banned: false })
      .sort({ points: -1, streak: -1, createdAt: 1 })
      .limit(50)
      .select("nickname points streak");

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Nie udalo sie pobrac leaderboardu." });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  return res.json(sanitizeUser(req.user));
});

app.patch("/me/progress", authMiddleware, async (req, res) => {
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
    return res.status(500).json({ error: "Nie udalo sie zapisac progresu." });
  }
});

app.get("/admin/users", authMiddleware, adminOnly, async (_req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("nickname email points streak createdAt banned role");

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Nie udalo sie pobrac listy uzytkownikow." });
  }
});

app.patch("/user/:id/points", authMiddleware, adminOnly, async (req, res) => {
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
    return res.status(500).json({ error: "Nie udalo sie zmienic punktow uzytkownika." });
  }
});

app.patch("/user/:id/ban", authMiddleware, adminOnly, async (req, res) => {
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
    return res.status(500).json({ error: "Nie udalo sie zmienic statusu bana." });
  }
});

app.use(express.static(path.join(__dirname, "..")));

app.get("*", (req, res) => {
  const apiPrefixes = ["/register", "/login", "/leaderboard", "/me", "/admin", "/user/"];

  if (apiPrefixes.some(function (prefix) {
    return req.path === prefix || req.path.startsWith(prefix);
  })) {
    return res.status(404).json({ error: "Nie znaleziono endpointu API." });
  }

  return res.sendFile(path.join(__dirname, "..", "index.html"));
});

async function start() {
  await mongoose.connect(MONGODB_URI);

  const hostMatch = MONGODB_URI.match(/@([^/?]+)/);
  const atlasHost = hostMatch ? hostMatch[1] : "MongoDB Atlas";
  console.log("Connected to MongoDB Atlas:", atlasHost);

  await ensureAdminAccount();

  app.listen(PORT, () => {
    console.log("Hero Guess backend listening on http://localhost:" + PORT);
  });
}

start().catch(function (error) {
  console.error("Backend start failed:", error);
  process.exit(1);
});
