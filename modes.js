export const gameModes = [
  {
    id: "classic",
    label: "Classic",
    badge: "Mode 01",
    summary: "Podstawowy tryb z czystym interfejsem i szybkim startem.",
    description:
      "Classic to uniwersalny punkt wejscia. Ten widok moze w przyszlosci zawierac plansze, ekwipunek, wynik lub panel sterowania rozgrywka.",
    stats: [
      { title: "Tempo", value: "Stabilne" },
      { title: "Poziom wejscia", value: "Latwy" },
      { title: "Rozbudowa", value: "Wysoka" }
    ],
    features: [
      "Minimalny interfejs do szybkiego uruchamiania gry",
      "Idealny punkt startowy pod logike rund i punktacji",
      "Dobrze nadaje sie do testow prototypu"
    ]
  },
  {
    id: "fight",
    label: "Fight",
    badge: "Mode 02",
    summary: "Tryb walki z miejscem na statystyki przeciwnika i akcje gracza.",
    description:
      "Fight przygotowuje przestrzen na pasek zdrowia, wybor umiejetnosci oraz przebieg pojedynku. Struktura jest gotowa na podpiecie dynamicznej logiki JS.",
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
    summary: "Panel rozwoju mocy, umiejetnosci i aktywnych efektow.",
    description:
      "Power sprawdza sie jako ekran ulepszen. Mozesz tu w przyszlosci pokazac drzewko talentow, poziomy energii i aktywowane bonusy.",
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
    summary: "Sekcja fabuly, swiata gry i zapisanych odkryc.",
    description:
      "Lore pozwala prezentowac historie swiata, wpisy dziennika i odblokowane informacje. To osobny ekran, ale nadal spina sie z calym UI aplikacji.",
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
  }
];
