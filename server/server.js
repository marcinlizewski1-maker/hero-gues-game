require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = "mongodb+srv://marcinlizewski1_db_user:<db_password>@cluster0.syrgpjy.mongodb.net/?appName=Cluster0";
const JWT_SECRET = "a1b2c3d4e5f6g7h8i9j10k11";

const ADMIN_EMAIL = "marcin.lizewski2@wp.pl";
const ADMIN_PASSWORD = "Martillos6";
const ADMIN_NICKNAME = "MarcinYT";

// Middleware
app.use(cors());
app.use(express.json());

// Schema
const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// 🔐 JWT
function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// 🔒 Middleware auth
async function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokenu" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: "User nie istnieje" });
    if (req.user.banned) return res.status(403).json({ error: "Zbanowany" });
    next();
  } catch {
    res.status(401).json({ error: "Zły token" });
  }
}

// 👑 Admin middleware
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Tylko admin" });
  }
  next();
}

// 👤 Admin create
async function createAdmin() {
  const admin = await User.findOne({ email: ADMIN_EMAIL });

  if (!admin) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      nickname: ADMIN_NICKNAME,
      email: ADMIN_EMAIL,
      password: hash,
      role: "admin"
    });
    console.log("Admin created");
  }
}

// 🔑 REGISTER
app.post("/register", async (req, res) => {
  try {
    const { nickname, email, password } = req.body;

    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "Brak danych" });
    }

    const exists = await User.findOne({ $or: [{ email }, { nickname }] });
    if (exists) return res.status(400).json({ error: "User istnieje" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nickname,
      email,
      password: hash
    });

    res.json({ ok: true, user });
  } catch {
    res.status(500).json({ error: "Register error" });
  }
});

// 🔑 LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "Zły login" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Złe hasło" });

    res.json({
      token: createToken(user),
      user
    });
  } catch {
    res.status(500).json({ error: "Login error" });
  }
});

// 🏆 LEADERBOARD
app.get("/leaderboard", async (req, res) => {
  const users = await User.find({ banned: false })
    .sort({ points: -1 })
    .limit(50)
    .select("nickname points streak");

  res.json(users);
});

// 👤 ME
app.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// ➕ PUNKTY (admin)
app.patch("/user/:id/points", auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.points += req.body.delta;
  await user.save();
  res.json(user);
});

// 🔨 BAN
app.patch("/user/:id/ban", auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.banned = req.body.banned;
  await user.save();
  res.json(user);
});

// 🌍 FRONTEND
app.use(express.static(path.join(__dirname, "..")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// 🚀 START
async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");

  await createAdmin();

  app.listen(PORT, () => {
    console.log("Server działa na porcie " + PORT);
  });
}

start();