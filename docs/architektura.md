# LightCaves - Architekturní dokument

**Verze:** 1.0
**Datum:** 2025-11-12
**Určeno pro:** Vývojáře (1 člověk, full-stack)

---

## 1. Přehled

**Co se staví:**
Offline-first webová aplikace - ASCII puzzle hra, kde hráč manipuluje světelné paprsky pomocí zrcadel. Celá logika běží v browseru, žádný server není potřeba.

**Tech charakteristika:**
- HTML5 Canvas pro vykreslení ASCII grafiky
- Vanilla JavaScript (žádné frameworky - jednoduchý state management, žádné dependencies)
- localStorage pro persistenci postupu
- Service Worker pro offline funkčnost
- Statické HTML = lze hostovat kdekoliv (GitHub Pages, Netlify)

**Cíl:**
Produkční aplikace za 4 měsíce, která se chová jako nativní app (instant load, offline, žádná latence). Jednoduchý build process - minifikace + bundle. Jeden vývojář zvládne celý stack.

---

## 2. Tech Stack

| Vrstva | Technologie | Odůvodnění |
|--------|-------------|------------|
| **Jazyk** | Vanilla JavaScript (ES6+) | Žádné dependencies, rychlý start, simple debugging |
| **Rendering** | HTML5 Canvas | ASCII art, pixel-perfect kontrola, 60 FPS bez optimalizace |
| **Build** | Vite (nebo Rollup) | Hot reload během vývoje, minifikace + bundle do jednoho souboru |
| **Storage** | localStorage | Offline, sync API (jednoduché), 5-10MB je dost |
| **Offline** | Service Worker | Cache static assets, funguje bez netu |
| **i18n** | JSON soubory | Klíč-hodnota, lazy load podle jazyka |
| **Hosting** | Static hosting (GitHub Pages) | Zero config, free, CDN included |
| **Testing** | Jest (unit), manuální QA | Kritické: reflexní tabulka + physics |

**Žádné frameworky:**
React/Vue by přidaly 50-200kb overhead a complexity. Hra má jednoduchý state (jeden objekt), Canvas rendering je již abstrakce. Vanilla JS = rychlejší load, snazší debug.

---

## 3. Architektura - Struktura kódu

```
/LightCaves
├── /src
│   ├── /game
│   │   ├── game.js              # Hlavní orchestrátor (game loop, state management)
│   │   ├── renderer.js          # Canvas rendering (ASCII znaky, osvětlení, UI)
│   │   ├── physics.js           # CORE: paprsek propagace + reflexní logika
│   │   ├── level-parser.js      # TXT → internal JSON format
│   │   └── level-validator.js   # Validace levelů (solvability check)
│   ├── /ui
│   │   ├── ui.js                # Menu, buttony, event handlers
│   │   ├── palette.js           # Paleta zrcadel (výběr + umístění)
│   │   └── victory-screen.js    # Obrazovka vítězství + statistiky
│   ├── /data
│   │   ├── levels/              # 20 levelů v TXT formátu
│   │   ├── levels-compiled.js   # Pre-parsed levely (build time conversion)
│   │   └── strings/
│   │       ├── cs.json          # České stringy
│   │       ├── en.json          # Anglické stringy
│   │       └── ...              # ES, DE, FR
│   ├── /utils
│   │   ├── storage.js           # localStorage wrapper + migrations
│   │   ├── constants.js         # Reflexní tabulka, symboly, barvy
│   │   └── input-handler.js     # Klávesnice + myš events
│   ├── index.html               # Entry point
│   ├── main.js                  # Init app, load první level
│   └── styles.css               # Minimální CSS (layout, fonts)
├── /public
│   └── service-worker.js        # Offline cache logic
├── /tests
│   ├── physics.test.js          # Unit testy pro reflexní tabulku
│   └── integration.test.js      # End-to-end scénáře
├── vite.config.js               # Build konfigurace
└── package.json
```

### Popis klíčových souborů:

**game.js** (150-200 řádků)
Hlavní smyčka: inicializuje state, volá physics při změně, spouští renderer, detekuje výhru. Obsahuje `gameState` objekt (viz sekce 7). Metody: `init()`, `placeМirror(x, y, type)`, `removeMirror(x, y)`, `checkVictory()`, `reset()`.

**physics.js** (200-300 řádků)
CORE logika. Funkce `propagateBeam(startX, startY, direction)` - vrací pole osvětlených buněk. Používá reflexní tabulku z `constants.js`. Funkce `calculateIllumination()` - přidává 50% osvětlení k sousedním řádkům/sloupcům. Immutable - nebere state, jen data.

**renderer.js** (150-200 řádků)
Canvas API. Funkce `drawGrid(gameState)` - vykreslí vrstvu po vrstvě (pozadí, zdi, paprsky, zrcadla). Používá monospace font (Courier New). Optimalizace: dirty rectangles (překreslí jen změněné oblasti). 60 FPS = requestAnimationFrame.

**level-parser.js** (100-150 řádků)
Čte TXT soubor → vrací JSON: `{ width, height, cells: [], lamps: [], targets: [], metadata }`. Validuje formát (kontroluje symboly, SIZE metadata). Volá se při buildu → výstup do `levels-compiled.js` (rychlejší load).

**storage.js** (50-100 řádků)
Wrapper pro localStorage. Metody: `saveProgress(levelId, stats)`, `loadProgress()`, `getSetting(key)`. Includes error handling (quota exceeded). Verze storage schema (migrations pokud změníme formát).

**constants.js** (50 řádků)
Reflexní tabulka jako lookup object:
```js
REFLECTION_TABLE = {
  '/': { 'RIGHT': 'UP', 'LEFT': 'DOWN', 'DOWN': 'RIGHT', 'UP': 'LEFT' },
  '\\': { 'RIGHT': 'DOWN', 'LEFT': 'UP', 'DOWN': 'LEFT', 'UP': 'RIGHT' }
}
```
Symboly: `WALL = '█'`, `EMPTY = '.'`, atd. Barvy: `BEAM_COLOR = '#FFFF00'`, `FOG_COLOR = '#333333'`.

**ui.js** (100-150 řádků)
Event listenery pro tlačítka (Undo, Reset, Menu). Zobrazuje statistiky (pohyby, čas). Prepíná mezi obrazovkami (menu, hra, nastavení). Binding: `onClick` → volá `game.placeМirror()`.

---

## 4. Data Flow

```
1. Hráč klikne na Canvas
   ↓
2. input-handler.js zachytí event → převede pixel coords na grid coords (x, y)
   ↓
3. game.js: placeМirror(x, y, selectedType)
   ↓
4. Aktualizuje gameState.mirrors (přidá nové zrcadlo)
   ↓
5. physics.js: calculateBeamPath(gameState) → vrací nový beamPath + illuminated cells
   ↓
6. gameState.beamPath aktualizován
   ↓
7. renderer.js: drawGrid(gameState) → překreslí Canvas
   ↓
8. game.js: checkVictory() → kontroluje všechny targety
   ↓
9a. Pokud VYHRÁNO: zobrazí victory screen, volá storage.saveProgress()
9b. Pokud NE: čeká na další input
```

**Undo/Redo flow:**
Každá akce (umístění/odebrání zrcadla) se pushne do `history[]` (stack). Undo = pop + restore previous state. Redo = redo stack. Limit 20 kroků (paměťová optimalizace).

**Level switch:**
`game.loadLevel(id)` → level-parser vrací data → reset gameState → storage načte best stats → renderer vykreslí initial state.

---

## 5. Key Design Decisions

### 5.1 Proč Vanilla JS místo Reactu?

**Rozhodnutí:** Žádný framework.

**Odůvodnění:**
- State je jednoduchý (jeden objekt `gameState`) - React by byl overkill
- Canvas rendering nepoužívá virtuální DOM - React nemá výhodu
- Bundle size: 0 KB (React = 42 KB minified)
- Rychlejší load: kritické pro offline-first app
- Debugging: méně vrstev abstrakcí
- Jeden vývojář = žádná potřeba team conventions

**Trade-off:** Ruční state management (ale máme jen 5-10 akcí, trivial).

### 5.2 Proč Canvas místo DOM?

**Rozhodnutí:** HTML5 Canvas pro ASCII grid.

**Odůvodnění:**
- ASCII art: potřebujeme pixel-perfect kontrolu nad monospace fontem
- Performance: 100x100 grid = 10k DOM elementů (slow), Canvas = jeden element
- 60 FPS bez optimalizace: Canvas je nativně fast pro statický content
- Animace paprsku: smooth scrolling efekt (100% → 50% fade)

**Trade-off:** Accessibility složitější (musíme manuálně generovat ARIA labels), ale Canvas má API pro screen readery.

### 5.3 Proč localStorage místo serveru?

**Rozhodnutí:** localStorage, žádný backend.

**Odůvodnění:**
- Offline-first: hra musí fungovat bez internetu (core requirement)
- Privacy: žádná data neopouštějí device
- Jednoduchost: žádný server = žádný maintenance, žádné náklady
- Latence: instant save/load (žádný network round-trip)

**Trade-off:** Žádný cross-device sync (ale můžeme přidat export/import JSON později). 5 MB limit je dost (20 levelů + stats = < 100 KB).

### 5.4 Proč TXT levely → compile-time konverze?

**Rozhodnutí:** Levely v TXT (human-readable), build script je parsuje → JSON.

**Odůvodnění:**
- Editace: můžeš vytvořit level v Notepad++ (žádný special editor)
- Version control: TXT soubory jsou git-friendly (diff, merge)
- Performance: runtime parsing je slow, JSON je fast (1 ms vs 50 ms)
- Validace: build-time check (syntax errory = fail build)

**Trade-off:** Extra build krok, ale Vite to řeší automaticky (watch mode).

### 5.5 Proč separace physics / rendering?

**Rozhodnutí:** `physics.js` je pure function (input → output), žádné side effects.

**Odůvodnění:**
- Testovatelnost: unit testy bez DOM/Canvas mockování
- Reusability: můžeme použít physics pro AI solver (level validace)
- Debugging: můžeš testovat physics v Node.js (console output)
- Performance: physics cache (pokud se state nezmění, skip recalculation)

**Implementace:** `physics.js` exportuje `calculateBeamPath(lamps, mirrors, walls) → { beamPath, illuminated }`. Žádná závislost na `gameState` - jen pure data.

---

## 6. Physics Engine (CORE LOGIKA)

### 6.1 Reflexní tabulka - Implementace

```js
// constants.js
const DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
};

const REFLECTION_TABLE = {
  '/': {
    'UP': 'RIGHT',     // Paprsek jde nahoru → po odrazu doprava
    'DOWN': 'LEFT',    // Paprsek jde dolů → po odrazu doleva
    'LEFT': 'DOWN',    // Paprsek jde doleva → po odrazu dolů
    'RIGHT': 'UP'      // Paprsek jde doprava → po odrazu nahoru
  },
  '\\': {
    'UP': 'LEFT',      // Paprsek jde nahoru → po odrazu doleva
    'DOWN': 'RIGHT',   // Paprsek jde dolů → po odrazu doprava
    'LEFT': 'UP',      // Paprsek jde doleva → po odrazu nahoru
    'RIGHT': 'DOWN'    // Paprsek jde doprava → po odrazu dolů
  }
};
```

### 6.2 Paprsek propagace - Pseudokód

```js
function propagateBeam(startX, startY, direction, gameState) {
  let beamPath = [];           // Buňky s 100% osvětlením
  let illuminated = new Set(); // Všechny osvětlené buňky (včetně 50%)

  let x = startX, y = startY;
  let currentDir = direction;
  let maxSteps = 1000;         // Ochrana před nekonečnou smyčkou

  while (maxSteps-- > 0) {
    // 1. Posun v aktuálním směru
    x += DIRECTIONS[currentDir].dx;
    y += DIRECTIONS[currentDir].dy;

    // 2. Kontrola hranic
    if (isOutOfBounds(x, y, gameState)) break;

    // 3. Kontrola překážky
    let cell = gameState.cells[y][x];

    if (cell === WALL) {
      break; // Paprsek končí
    }

    if (isTarget(cell)) {
      beamPath.push({x, y, brightness: 1.0});
      // Kontrola: správný směr?
      if (targetDirection(cell) === oppositeDir(currentDir)) {
        markTargetHit(x, y, gameState);
      }
      break; // Target zastavuje paprsek
    }

    if (isMirror(cell)) {
      beamPath.push({x, y, brightness: 1.0});
      // Odraz
      currentDir = REFLECTION_TABLE[cell][currentDir];
      continue; // Paprsek pokračuje v novém směru
    }

    // 4. Prázdná buňka - přidej do cesty
    beamPath.push({x, y, brightness: 1.0});
    illuminated.add(`${x},${y}`); // 100% osvětlení

    // 5. Přidej sousední buňky (50% osvětlení)
    addAdjacentIllumination(x, y, currentDir, illuminated);
  }

  return { beamPath, illuminated };
}
```

### 6.3 Osvětlení sousedů (50%)

```js
function addAdjacentIllumination(x, y, direction, illuminated) {
  // Vedlejší řádky/sloupce (kolmé na směr paprsku)
  let perpendicular = [];

  if (direction === 'UP' || direction === 'DOWN') {
    // Paprsek jde vertikálně → osvětli horizontální sousedy
    perpendicular = [
      {x: x-1, y: y},  // Vlevo
      {x: x+1, y: y}   // Vpravo
    ];
  } else {
    // Paprsek jde horizontálně → osvětli vertikální sousedy
    perpendicular = [
      {x: x, y: y-1},  // Nahoře
      {x: x, y: y+1}   // Dole
    ];
  }

  perpendicular.forEach(pos => {
    if (!isOutOfBounds(pos.x, pos.y)) {
      illuminated.add(`${pos.x},${pos.y}`); // 50% osvětlení
    }
  });
}
```

### 6.4 Detekce výhry

```js
function checkVictory(gameState) {
  let allTargetsHit = true;

  gameState.targets.forEach(target => {
    // Kontrola: je target v beamPath?
    let hit = gameState.beamPath.some(cell =>
      cell.x === target.x && cell.y === target.y
    );

    if (!hit) {
      allTargetsHit = false;
      return;
    }

    // Kontrola: správný směr?
    let beamDir = getBeamDirectionAt(target.x, target.y, gameState);
    let requiredDir = targetRequiredDirection(target.symbol);

    if (beamDir !== requiredDir) {
      allTargetsHit = false;
    }
  });

  return allTargetsHit;
}
```

**Optimalizace:**
Physics se volá jen když se změní mirrors (ne každý frame). Pokud hráč jen pohybuje myší, skip recalculation. Cache beamPath v gameState.

---

## 7. State Management

### 7.1 Runtime state (v paměti)

```js
const gameState = {
  // Level data
  currentLevelId: 1,
  levelData: {
    width: 10,
    height: 10,
    cells: [[...]],      // 2D pole (řádky × sloupce)
    lamps: [             // Světelné zdroje
      { x: 1, y: 1, direction: 'RIGHT' }
    ],
    targets: [           // Cíle
      { x: 8, y: 4, direction: 'UP', symbol: '△' }
    ],
    metadata: {
      name: 'Tutorial 1',
      difficulty: 'Easy',
      hint: '...'
    }
  },

  // Hráčovy akce
  placedMirrors: [       // Zrcadla umístěná hráčem
    { x: 3, y: 2, type: '/' },
    { x: 5, y: 3, type: '\\' }
  ],

  // Physics výsledky
  beamPath: [            // Hlavní paprsek (100%)
    { x: 1, y: 1 }, { x: 2, y: 1 }, ...
  ],
  illuminated: Set([     // Všechny osvětlené buňky (100% + 50%)
    '1,1', '2,1', '2,0', '2,2', ...
  ]),
  targetsHit: [          // Které targety jsou trefené
    { x: 8, y: 4, hit: true, correctDirection: false }
  ],

  // UI state
  selectedMirrorType: '/',  // Co je vybráno v paletě
  isComplete: false,        // Level dokončen?
  moves: 0,                 // Počet tahů
  startTime: 1699876543210, // Timestamp (ms)

  // Undo/Redo
  history: [                // Stack předchozích stavů
    { mirrors: [...], moves: 0 },
    { mirrors: [...], moves: 1 }
  ],
  redoStack: []
};
```

### 7.2 Persistent storage (localStorage)

```js
// Klíč: 'lightcaves_save'
{
  version: '1.0',            // Storage schema version
  completedLevels: [1, 2, 3], // ID levelů, které hráč dokončil
  currentLevel: 4,           // Aktuální level
  stats: {                   // Best stats per level
    '1': { moves: 3, time: 45000 },
    '2': { moves: 5, time: 120000 }
  },
  settings: {
    language: 'cs',          // cs/en/es/de/fr
    fontSize: 'medium',      // small/medium/large
    highContrast: false,
    soundEnabled: false      // Pro budoucnost
  },
  discoveredCells: {         // Fog-of-war persistence (optional)
    '1': ['1,1', '2,1', ...],
    '2': [...]
  }
}
```

**API:**
```js
storage.saveProgress(levelId, { moves, time });
storage.loadProgress(); // → vrací celý save objekt
storage.updateSetting('language', 'en');
storage.getSetting('language'); // → 'en'
storage.clearAll(); // Reset (debug)
```

---

## 8. Rendering Pipeline

Canvas vykreslení probíhá v pořadí (zdola nahoru):

```js
function drawGrid(ctx, gameState) {
  // 1. Pozadí (černé)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Fog-of-war (tmavé buňky)
  drawFog(ctx, gameState);

  // 3. Zdi + terén (osvětlené oblasti)
  drawTerrain(ctx, gameState);

  // 4. Paprsek (100% - žlutá čára)
  drawBeam(ctx, gameState.beamPath);

  // 5. Vedlejší osvětlení (50% - šedé buňky)
  drawAmbientLight(ctx, gameState.illuminated);

  // 6. Lampičky (vždy viditelné)
  drawLamps(ctx, gameState.lamps);

  // 7. Targety (vždy viditelné, barevný feedback: hit/miss)
  drawTargets(ctx, gameState.targets);

  // 8. Zrcadla (hráčem umístěná, highlightnuté pokud hover)
  drawMirrors(ctx, gameState.placedMirrors);

  // 9. Grid overlay (tenké čáry mezi buňkami, optional)
  drawGridLines(ctx);
}
```

**Optimalizace - Dirty Rectangles:**
Pokud se změnila jen jedna buňka (umístění zrcadla), překresli jen affected region:
```js
renderer.markDirty(x, y, width, height);
renderer.render(); // Překreslí jen dirty areas
```

**Font rendering:**
Monospace font (Courier New, 16px). Každý znak je přesně `CELL_SIZE × CELL_SIZE` pixelů (např. 20×20). ASCII symboly: `ctx.fillText(symbol, x, y)`.

**60 FPS:**
```js
function gameLoop() {
  if (gameState.isDirty) {
    renderer.drawGrid(gameState);
    gameState.isDirty = false;
  }
  requestAnimationFrame(gameLoop);
}
```

---

## 9. Performance Considerations

| Metrika | Target | Implementace |
|---------|--------|--------------|
| **Initial load** | < 2s | Minifikace (Vite), lazy load jazyků, Service Worker cache |
| **Level load** | < 100ms | Pre-parsed JSON levely (ne TXT runtime), single array lookup |
| **Physics calculation** | < 10ms | Max 1000 iterací (ochrana loop), cache pokud state nezměněn |
| **Rendering** | 60 FPS | Dirty rectangles, skip frame pokud není změna |
| **Memory** | < 10 MB | Jeden level v paměti, history limit 20 kroků |

**Profiling:**
Chrome DevTools Performance tab. Sleduj: physics calculation time, Canvas draw calls, GC pauses.

**Optimalizace pro starý hardware:**
- Canvas size: max 1200×800 (škáluj pokud screen větší)
- Font: pre-render ASCII znaky do sprite sheetu (texture atlas) → rychlejší než fillText
- Physics: early exit (pokud paprsek mimo screen, skip)

---

## 10. Testing Strategy

### Unit testy (Jest)

**Kritické: Reflexní tabulka**
Test všech 8 kombinací (2 zrcadla × 4 směry):
```js
test('Paprsek z leva na / zrcadlo jde dolů', () => {
  expect(reflect('/', 'LEFT')).toBe('DOWN');
});
```

**Physics:**
- Paprsek jde rovně dokud nenarazí na zeď
- Paprsek se odráží od zrcadla správným směrem
- Target je detekován pouze při správném směru
- 50% osvětlení se aplikuje na sousedy

### Integration testy

End-to-end scénáře:
- Načti level 1 → umísti zrcadlo → zkontroluj beamPath → výhra
- Undo → ověř že state je restored
- Uložení → reload page → progress je zachován

### Manual QA

- Každý level musí být solvable (level-validator při buildu)
- Accessibility: screen reader čte grid (ARIA labels)
- Keyboard navigation: Tab/Enter ovládání palety
- Responsiveness: mobilní browser (landscape mode)

---

## 11. Future Extensibility

**Jak přidat post-MVP features bez refactoru:**

### Vícebarevné paprsky (RGB)
- Přidej `color` field do lamp: `{ x, y, direction, color: 'red' }`
- Physics: každý paprsek má color property
- Renderer: `ctx.strokeStyle = beamColor`
- Targety: přidej `requiredColor` field, kontroluj v `checkVictory()`

**Estimate:** +2 dny práce, žádná změna core architektury.

### Pohyblivá zrcadla (animace)
- Přidej `animation` field do mirror: `{ x, y, type, animation: { type: 'rotate', speed: 1 } }`
- Renderer: update rotation angle každý frame
- Physics: calculate mirror orientation v čase `t`

**Estimate:** +3 dny, physics zůstává pure (jen input orientation se mění).

### Level editor (UI)
- Nový mód: `gameState.editorMode = true`
- UI: přidej paletu s WALL, LAMP, TARGET symboly
- Export: `exportLevel()` → TXT soubor (download)
- Validace: `validateLevel()` → check solvability (BFS solver)

**Estimate:** +1 týden, reuse renderer + input-handler.

### Multiplayer (out of scope, ale...)
- WebSocket server pro sync gameState
- Conflict resolution: operační transformace (OT)
- UI: live cursory ostatních hráčů

**Estimate:** +1 měsíc, velká změna (potřeba backend).

---

## Závěr

Architektura je **záměrně jednoduchá**: vanilla JS, jeden state objekt, separace physics/rendering/UI. Žádné over-engineering.

**Klíčové rozhodnutí:** Offline-first + žádné dependencies = rychlý vývoj, snadný maintenance, zero hosting costs.

**Další krok:** Prototyp physics enginu (2-3 dny) → ověř že reflexe fungují správně → pokračuj UI + rendering.

**Success kritérium:** Jeden vývojář dokáže za 4 měsíce dodat produkční app s 20 levely, která běží na 5 let starém hardware offline.

---

**Konec architekturního dokumentu.**
