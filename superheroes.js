import { popularHeroNames } from "../config/popularHeroes.js";

const SUPERHERO_API_URL = "/api/characters";
const ALLOWED_PUBLISHERS = new Set(["Marvel Comics", "DC Comics"]);
const MIN_HERO_COUNT = 100;
const MAX_HERO_COUNT = 150;

let heroesCache = null;

export async function loadSuperheroes() {
  if (heroesCache) {
    return heroesCache;
  }

  const response = await fetch(SUPERHERO_API_URL);

  if (!response.ok) {
    throw new Error(`Nie udalo sie pobrac danych bohaterow: ${response.status}`);
  }

  const data = await response.json();
  heroesCache = data;

  console.log("Marvel/DC heroes loaded:", heroesCache);

  return heroesCache;
}

export function getLoadedSuperheroes() {
  return heroesCache;
}
