const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heroguess";
const JWT_SECRET = process.env.JWT_SECRET || "hero-guess-dev-secret";

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true, trim: true, maxlength: 24 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  banned: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

const User = mongoose.model("User", userSchema);

function signToken(user) {
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
    return res.status(401).json({ error: "Brak tokenu" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: "Uzytkownik nie istnieje" });
    }

    if (user.banned) {
      return res.status(403).json({ error: "Uzytkownik jest zbanowany" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Nieprawidlowy token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Wymagane konto admina" });
  }

  next();
}

async function ensureAdminAccount() {
  const email = "marcin.lizewski2@wp.pl";
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash("Martillos6", 10);

  await User.create({
    nickname: "MarcinYT",
    email,
    password: hashedPassword,
    role: "admin",
    points: 0,
    streak: 0,
    banned: false
  });
}

app.post("/register", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "nickname, email i password sa wymagane" });
    }

    const existingUser = await User.findOne({
      $or: [{ nickname }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({ error: "Uzytkownik o takim nicku lub emailu juz istnieje" });
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
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        points: user.points,
        streak: user.streak,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Blad rejestracji" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Nieprawidlowy email lub haslo" });
    }

    if (user.banned) {
      return res.status(403).json({ error: "Uzytkownik jest zbanowany" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Nieprawidlowy email lub haslo" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        points: user.points,
        streak: user.streak,
        role: user.role,
        banned: user.banned
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Blad logowania" });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  res.json({
    id: req.user._id,
    nickname: req.user.nickname,
    email: req.user.email,
    points: req.user.points,
    streak: req.user.streak,
    role: req.user.role,
    banned: req.user.banned,
    createdAt: req.user.createdAt
  });
});

app.post("/me/progress", authMiddleware, async (req, res) => {
  const points = Number(req.body.points);
  const streak = Number(req.body.streak);

  if (Number.isNaN(points) || Number.isNaN(streak)) {
    return res.status(400).json({ error: "points i streak sa wymagane" });
  }

  req.user.points = points;
  req.user.streak = streak;
  await req.user.save();

  res.json({
    ok: true,
    user: {
      id: req.user._id,
      nickname: req.user.nickname,
      email: req.user.email,
      points: req.user.points,
      streak: req.user.streak,
      role: req.user.role,
      banned: req.user.banned
    }
  });
});

app.get("/leaderboard", async (_req, res) => {
  const users = await User.find({ banned: false })
    .sort({ points: -1, streak: -1, createdAt: 1 })
    .limit(10)
    .select("nickname points streak");

  res.json(users);
});

app.get("/admin/users", authMiddleware, adminOnly, async (_req, res) => {
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select("nickname email points streak createdAt banned role");

  res.json(users);
});

app.post("/admin/points", authMiddleware, adminOnly, async (req, res) => {
  const userId = String(req.body.userId || "");
  const delta = Number(req.body.delta);

  if (!userId || Number.isNaN(delta)) {
    return res.status(400).json({ error: "userId i delta sa wymagane" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Nie znaleziono uzytkownika" });
  }

  user.points += delta;
  await user.save();

  res.json({ ok: true, user });
});

app.post("/admin/ban", authMiddleware, adminOnly, async (req, res) => {
  const userId = String(req.body.userId || "");
  const banned = req.body.banned !== undefined ? Boolean(req.body.banned) : true;

  if (!userId) {
    return res.status(400).json({ error: "userId jest wymagane" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "Nie znaleziono uzytkownika" });
  }

  user.banned = banned;
  await user.save();

  res.json({ ok: true, user });
});

app.use(express.static(path.join(__dirname, "..")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/admin") || req.path === "/login" || req.path === "/register" || req.path.startsWith("/me") || req.path === "/leaderboard") {
    return res.status(404).json({ error: "Nie znaleziono endpointu" });
  }

  return res.sendFile(path.join(__dirname, "..", "index.html"));
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  await ensureAdminAccount();

  app.listen(PORT, () => {
    console.log(`HeroGuess backend listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Backend start failed:", error);
  process.exit(1);
});
