import { popularHeroNames } from "../config/popularHeroes.js";

const SUPERHERO_API_URL = "https://akabab.github.io/superhero-api/api/all.json";
const ALLOWED_PUBLISHERS = new Set(["Marvel Comics", "DC Comics"]);
const MIN_HERO_COUNT = 100;
const MAX_HERO_COUNT = 150;

let heroesCache = null;

function isAllowedPublisher(hero) {
  return ALLOWED_PUBLISHERS.has(hero.biography?.publisher);
}

function isPopularHero(hero) {
  return popularHeroNames.has(hero.name);
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
  const popularHeroes = publisherHeroes.filter(isPopularHero).slice(0, MAX_HERO_COUNT);

  if (popularHeroes.length < MIN_HERO_COUNT) {
    return publisherHeroes.slice(0, MAX_HERO_COUNT).map(toHeroRecord);
  }

  return popularHeroes.map(toHeroRecord);
}

export async function loadSuperheroes() {
  if (heroesCache) {
    return heroesCache;
  }

  const response = await fetch(SUPERHERO_API_URL);

  if (!response.ok) {
    throw new Error(`Nie udalo sie pobrac danych bohaterow: ${response.status}`);
  }

  const allHeroes = await response.json();
  const heroes = buildHeroCollection(allHeroes);

  heroesCache = {
    fetchedAt: new Date().toISOString(),
    total: heroes.length,
    publishers: ["Marvel Comics", "DC Comics"],
    heroes
  };

  console.log("Marvel/DC heroes loaded:", heroesCache);

  return heroesCache;
}

export function getLoadedSuperheroes() {
  return heroesCache;
}
