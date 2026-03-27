const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, "data");
const scoresFile = path.join(dataDir, "scores.json");

app.use(cors());
app.use(express.json());

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(scoresFile)) {
    fs.writeFileSync(scoresFile, "[]", "utf8");
  }
}

function readScores() {
  ensureStorage();
  try {
    return JSON.parse(fs.readFileSync(scoresFile, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeScores(scores) {
  ensureStorage();
  fs.writeFileSync(scoresFile, JSON.stringify(scores, null, 2), "utf8");
}

app.post("/score", (req, res) => {
  const nickname = String(req.body.nickname || "").trim();
  const points = Number(req.body.points);
  const streak = Number(req.body.streak);

  if (!nickname || Number.isNaN(points) || Number.isNaN(streak)) {
    return res.status(400).json({ error: "nickname, points i streak sa wymagane" });
  }

  const scores = readScores();
  const entry = {
    nickname: nickname.slice(0, 24),
    points,
    streak,
    createdAt: new Date().toISOString()
  };

  scores.push(entry);
  scores.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  writeScores(scores.slice(0, 100));

  return res.status(201).json({ ok: true, entry });
});

app.get("/leaderboard", (_req, res) => {
  const top = readScores().slice(0, 10);
  res.json(top);
});

app.listen(PORT, () => {
  ensureStorage();
  console.log(`Leaderboard server listening on http://localhost:${PORT}`);
});
