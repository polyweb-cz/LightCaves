# Story 1.2: Folder Structure

## User Story
**As a** vývojář
**I want to** mít kompletní folder strukturu podle architektury
**So that** mohu snadno najít soubory a rozumět organizaci kódu

## Popis

Tato story vytváří kompletní strukturu projektu LightCaves podle architektonického dokumentu. Cílem je připravit čistou a logickou organizaci kódu, kde každá složka má jasně definovanou zodpovědnost a všechny soubory mají předpřipravené skeleton komentáře s JSDoc dokumentací.

Implementace zahrnuje vytvoření všech potřebných složek (src/game, src/ui, src/data, src/utils), skeleton souborů s JSDoc komentáři a import/export placeholders, README.md v každé složce vysvětlující její účel, a přípravu struktury pro budoucí implementaci bez jakékoliv logiky.

Výsledkem bude projekt připravený pro začátek vývoje, kde vývojář otevře jakýkoliv soubor a okamžitě rozumí jeho účelu díky komentářům a JSDoc dokumentaci. Každá složka má README.md který vysvětluje co do ní patří a jak souvisí s ostatními částmi aplikace.

## Acceptance Criteria

- [ ] AC1: Folder struktura src/{game,ui,data,utils} existuje podle Architecture dokumentu
- [ ] AC2: Každá složka obsahuje README.md s vysvětlením účelu a obsahu
- [ ] AC3: Všechny klíčové .js soubory existují jako skeletony s JSDoc komentáři
- [ ] AC4: Každý skeleton soubor má vstupní komentář vysvětlující účel modulu
- [ ] AC5: Skeleton soubory obsahují export/import placeholders bez implementace
- [ ] AC6: src/data/strings.json existuje jako skeleton s ukázkovými klíči
- [ ] AC7: Root README.md existuje s project overview a development instructions
- [ ] AC8: Žádné syntax errors v JavaScript souborech (lze spustit bez chyb)
- [ ] AC9: Struktura přesně odpovídá Architecture dokumentu (sekce 3)
- [ ] AC10: Všechny README.md mají odkazy na relevantní části Architecture a Epic dokumentů

## Technical Details

### Požadavky

**Předchozí story:**
- Story 1.1: Vite Setup musí být hotová (fungující projekt s npm scripts)

**Runtime:**
- Fungující Vite development environment
- Node.js >= 16.0.0

**Validace:**
- `npm run dev` musí běžet bez syntax errors
- Všechny .js soubory musí být validní ES6 modules

### Folder struktura

Podle Architecture dokumentu (sekce 3), vytvořit:

```
/LightCaves
├── /src
│   ├── /game                 # Core game engine
│   │   ├── README.md         # Vysvětlení game engine modulů
│   │   ├── game.js           # Main game orchestrator
│   │   ├── physics.js        # Physics engine (beam propagation)
│   │   ├── renderer.js       # Canvas rendering
│   │   └── level-parser.js   # TXT level parser
│   ├── /ui                   # User interface
│   │   ├── README.md         # Vysvětlení UI modulů
│   │   ├── ui.js             # UI manager
│   │   └── palette.js        # Mirror palette
│   ├── /data                 # Data & assets
│   │   ├── README.md         # Vysvětlení data struktury
│   │   ├── levels.js         # Level definitions (skeleton)
│   │   └── strings.json      # Language strings (skeleton)
│   ├── /utils                # Utilities
│   │   ├── README.md         # Vysvětlení utility modulů
│   │   ├── constants.js      # Reflexní tabulka, symboly, konstanty
│   │   ├── storage.js        # localStorage wrapper
│   │   └── input.js          # Input handling
│   ├── main.js               # Application init (již existuje z Vite)
│   └── styles.css            # Global styles (již existuje z Vite)
├── /public                   # Static assets (již existuje z Vite)
│   └── .gitkeep              # Keep empty folder in git
└── README.md                 # Root project documentation
```

### Implementační kroky

#### 1. Vytvoření folder struktury

```bash
# V root projektu
mkdir -p src/game
mkdir -p src/ui
mkdir -p src/data
mkdir -p src/utils
touch public/.gitkeep
```

#### 2. Skeleton soubory - src/game/

**src/game/README.md:**
```markdown
# Game Engine

Tato složka obsahuje core game engine - centrální herní logiku LightCaves.

## Moduly

- **game.js** - Main game orchestrator, state management, game loop
- **physics.js** - Physics engine pro beam propagation a reflexní logiku
- **renderer.js** - Canvas rendering systém
- **level-parser.js** - Parser pro TXT levely → JSON format

## Zodpovědnost

Game engine moduly jsou zodpovědné za:
- Správu herního stavu (gameState)
- Výpočet fyziky světelných paprsků
- Vykreslení hry na Canvas
- Načítání a parsing levelů

## Architektury

Viz [Architecture dokumentu sekce 3](/docs/architektura.md#3-architektura---struktura-kódu)

## Související Epic

Epic 2: Core Physics Engine - implementuje physics.js
Epic 3: Rendering System - implementuje renderer.js
Epic 5: Level System - používá level-parser.js
```

**src/game/game.js:**
```javascript
/**
 * @fileoverview Main game orchestrator - centrální řídící logika LightCaves.
 *
 * Tento modul obsahuje hlavní game state, koordinuje interakce mezi physics,
 * renderer a UI moduly. Zodpovídá za game loop, detekci výhry a state management.
 *
 * @module game/game
 * @see {@link module:game/physics} pro fyzikální výpočty
 * @see {@link module:game/renderer} pro vykreslení
 *
 * Architecture reference: docs/architektura.md sekce 3
 * Epic reference: docs/epics/epic-01-project-setup.md
 */

// TODO: Import physics engine (Epic 2)
// import { propagateBeam } from './physics.js';

// TODO: Import renderer (Epic 3)
// import { drawGrid } from './renderer.js';

/**
 * Game state object - centrální store pro všechna herní data
 *
 * @typedef {Object} GameState
 * @property {number} currentLevelId - ID aktuálního levelu
 * @property {Object} levelData - Parsed level data (z level-parser)
 * @property {Array} playerMirrors - Zrcadla umístěná hráčem
 * @property {Array} beamPath - Aktuální cesta světelného paprsku
 * @property {Set} illuminated - Množina osvětlených buněk
 * @property {boolean} isComplete - Je level dokončený?
 * @property {Object} stats - Statistiky (moves, time)
 */
export const gameState = {
  currentLevelId: null,
  levelData: null,
  playerMirrors: [],
  beamPath: [],
  illuminated: new Set(),
  isComplete: false,
  stats: {
    moves: 0,
    time: 0
  }
};

/**
 * Inicializuje hru - načte level, resetuje state
 *
 * @param {number} levelId - ID levelu k načtení
 * @returns {void}
 *
 * @example
 * initGame(1); // Načte první level
 */
export function initGame(levelId) {
  // TODO: Implementovat v Epic 2
  console.log(`Game init: level ${levelId}`);
}

/**
 * Update game state - přepočítá physics a renderer
 *
 * @returns {void}
 */
export function updateGame() {
  // TODO: Implementovat v Epic 2
  console.log('Game update');
}

/**
 * Umístí zrcadlo na grid
 *
 * @param {number} x - X souřadnice
 * @param {number} y - Y souřadnice
 * @param {string} type - Typ zrcadla ('/' nebo '\\')
 * @returns {boolean} True pokud úspěšně umístěno
 */
export function placeMirror(x, y, type) {
  // TODO: Implementovat v Epic 2
  console.log(`Place mirror at [${x}, ${y}]: ${type}`);
  return false;
}

/**
 * Odstraní zrcadlo z gridu
 *
 * @param {number} x - X souřadnice
 * @param {number} y - Y souřadnice
 * @returns {boolean} True pokud úspěšně odstraněno
 */
export function removeMirror(x, y) {
  // TODO: Implementovat v Epic 2
  console.log(`Remove mirror at [${x}, ${y}]`);
  return false;
}

/**
 * Zkontroluje zda je level dokončený (všechny targety osvícené)
 *
 * @returns {boolean} True pokud level dokončen
 */
export function checkVictory() {
  // TODO: Implementovat v Epic 2
  return false;
}
```

**src/game/physics.js:**
```javascript
/**
 * @fileoverview Physics engine pro LightCaves - beam propagation a reflexní logika.
 *
 * CORE modul obsahující fyzikální výpočty světelných paprsků. Immutabilní funkce
 * které přijímají data a vracejí výsledky bez side effects. Kritická část aplikace
 * která musí být 100% deterministická a otestovaná.
 *
 * @module game/physics
 *
 * Architecture reference: docs/architektura.md sekce 6
 * Epic reference: docs/epics/epic-02-physics-engine.md
 */

// TODO: Import reflexní tabulky (Epic 1, Story 1.4)
// import { REFLECTION_TABLE, DIRECTIONS } from '../utils/constants.js';

/**
 * Propaguje světelný paprsek od lampičky po gridu
 *
 * Algoritmus step-by-step prochází gridem ve směru paprsku, detekuje kolize
 * se zdmi a zrcadly, aplikuje reflexní logiku a vrací kompletní cestu paprsku.
 *
 * @param {number} startX - Startovní X pozice (lampička)
 * @param {number} startY - Startovní Y pozice (lampička)
 * @param {string} direction - Počáteční směr ('UP', 'DOWN', 'LEFT', 'RIGHT')
 * @param {Object} mapData - Level data (cells, width, height)
 * @param {Array} mirrors - Pole umístěných zrcadel
 * @returns {Array<Object>} Pole navštívených buněk [{x, y, direction}, ...]
 *
 * @example
 * const path = propagateBeam(1, 1, 'RIGHT', levelData, playerMirrors);
 * console.log(`Beam traveled ${path.length} cells`);
 */
export function propagateBeam(startX, startY, direction, mapData, mirrors) {
  // TODO: Implementovat v Epic 2, Story 2.2-2.4
  console.log(`Propagate beam from [${startX}, ${startY}] direction: ${direction}`);
  return [];
}

/**
 * Aplikuje reflexní logiku - vrací nový směr po odrazu od zrcadla
 *
 * @param {string} direction - Current direction ('UP', 'DOWN', 'LEFT', 'RIGHT')
 * @param {string} mirrorType - Typ zrcadla ('/' nebo '\\')
 * @returns {string} Nový směr po odrazu
 * @throws {Error} Pokud direction nebo mirrorType je invalid
 *
 * @example
 * const newDir = reflect('RIGHT', '/'); // Returns 'UP'
 */
export function reflect(direction, mirrorType) {
  // TODO: Implementovat v Epic 2, Story 2.3
  console.log(`Reflect ${direction} on mirror ${mirrorType}`);
  return direction;
}

/**
 * Vypočítá visibility map - které buňky jsou osvětlené (100%, 50%, 0%)
 *
 * @param {Object} mapData - Level data
 * @param {Array} beamPath - Cesta paprsku z propagateBeam()
 * @returns {Array<Array<number>>} 2D array s intenzitami (0.0, 0.5, 1.0)
 *
 * @example
 * const visibilityMap = calculateVisibility(levelData, beamPath);
 * const intensity = visibilityMap[y][x]; // 0.0 - 1.0
 */
export function calculateVisibility(mapData, beamPath) {
  // TODO: Implementovat v Epic 2, Story 2.6
  return [];
}
```

**src/game/renderer.js:**
```javascript
/**
 * @fileoverview Canvas rendering system pro LightCaves.
 *
 * Zodpovídá za vykreslení ASCII gridu, světelných paprsků, zrcadel a UI elementů
 * na HTML5 Canvas. Používá monospace font pro pixel-perfect ASCII art.
 * Optimalizace: dirty rectangles pro částečné překreslení.
 *
 * @module game/renderer
 *
 * Architecture reference: docs/architektura.md sekce 8
 * Epic reference: docs/epics/epic-03-rendering-system.md
 */

// TODO: Import constants (Epic 1, Story 1.4)
// import { CELL_SIZE, BEAM_COLOR, FOG_COLOR } from '../utils/constants.js';

/**
 * Inicializuje Canvas renderer
 *
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {CanvasRenderingContext2D} Canvas 2D context
 */
export function initRenderer(canvas) {
  // TODO: Implementovat v Epic 3
  const ctx = canvas.getContext('2d');
  console.log('Renderer initialized');
  return ctx;
}

/**
 * Vykreslí kompletní grid - všechny vrstvy (pozadí, paprsky, zrcadla, UI)
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} gameState - Aktuální game state
 * @returns {void}
 *
 * @example
 * drawGrid(ctx, gameState);
 */
export function drawGrid(ctx, gameState) {
  // TODO: Implementovat v Epic 3
  console.log('Draw grid');
}

/**
 * Vykreslí světelný paprsek
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} beamPath - Cesta paprsku
 * @returns {void}
 */
export function drawBeam(ctx, beamPath) {
  // TODO: Implementovat v Epic 3
  console.log(`Draw beam: ${beamPath.length} cells`);
}

/**
 * Vykreslí fog of war (osvětlené vs tmavé oblasti)
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<Array<number>>} visibilityMap - Visibility data
 * @returns {void}
 */
export function drawFog(ctx, visibilityMap) {
  // TODO: Implementovat v Epic 3
  console.log('Draw fog of war');
}
```

**src/game/level-parser.js:**
```javascript
/**
 * @fileoverview Level parser - konverze TXT formátu levelů na JSON.
 *
 * Čte multi-line TXT string (ASCII art level) a převádí ho do strukturovaného
 * JSON objektu pro použití v game engine. Validuje formát, detekuje lampičky
 * a targety, kontroluje správnost levelu.
 *
 * @module game/level-parser
 *
 * Architecture reference: docs/architektura.md sekce 3
 * Epic reference: docs/epics/epic-02-physics-engine.md Story 2.1
 */

// TODO: Import constants (Epic 1, Story 1.4)
// import { WALL, EMPTY, MIRROR_SLASH, MIRROR_BACKSLASH } from '../utils/constants.js';

/**
 * Level data structure - výstup z parseLevel()
 *
 * @typedef {Object} LevelData
 * @property {number} width - Šířka gridu
 * @property {number} height - Výška gridu
 * @property {Array<Array<Object>>} cells - 2D pole buněk
 * @property {Object} lamp - Pozice a směr lampičky {x, y, direction}
 * @property {Object} target - Pozice a směr targetu {x, y, direction}
 * @property {Object} metadata - Metadata (název, obtížnost)
 */

/**
 * Parsuje TXT level string na interní JSON strukturu
 *
 * @param {string} levelString - Multi-line TXT level (ASCII art)
 * @returns {LevelData} Parsed level data
 * @throws {Error} Pokud level je invalid (chybí lampička/target)
 *
 * @example
 * const levelTxt = `
 * █████
 * █◄.△█
 * █████
 * `;
 * const levelData = parseLevel(levelTxt);
 */
export function parseLevel(levelString) {
  // TODO: Implementovat v Epic 2, Story 2.1
  console.log('Parse level');
  return {
    width: 0,
    height: 0,
    cells: [],
    lamp: null,
    target: null,
    metadata: {}
  };
}

/**
 * Validuje level - kontroluje že obsahuje 1 lampičku a 1 target
 *
 * @param {LevelData} levelData - Parsed level data
 * @returns {boolean} True pokud level je validní
 * @throws {Error} S popisem problému pokud invalid
 */
export function validateLevel(levelData) {
  // TODO: Implementovat v Epic 2, Story 2.1
  console.log('Validate level');
  return true;
}
```

#### 3. Skeleton soubory - src/ui/

**src/ui/README.md:**
```markdown
# User Interface

Tato složka obsahuje UI moduly - menu, buttony, paleta zrcadel, event handling.

## Moduly

- **ui.js** - Hlavní UI manager, menu system, event delegation
- **palette.js** - Paleta pro výběr zrcadel (/ a \\)

## Zodpovědnost

UI moduly jsou zodpovědné za:
- Zobrazení menu a navigaci mezi obrazovkami
- Paletu zrcadel (výběr typu pro umístění)
- Event handling (click, keyboard) a delegaci do game.js
- Victory screen a statistiky

## Architektury

Viz [Architecture dokumentu sekce 3](/docs/architektura.md#3-architektura---struktura-kódu)

## Související Epic

Epic 4: UI & Navigation - implementuje všechny UI moduly
```

**src/ui/ui.js:**
```javascript
/**
 * @fileoverview UI manager - menu, buttony, event handling.
 *
 * Hlavní UI orchestrátor pro LightCaves. Spravuje zobrazení menu, nastavení,
 * victory screen a všechny interaktivní prvky mimo Canvas grid.
 *
 * @module ui/ui
 *
 * Architecture reference: docs/architektura.md sekce 3
 * Epic reference: docs/epics/epic-04-ui-navigation.md
 */

// TODO: Import game functions
// import { initGame, checkVictory } from '../game/game.js';

/**
 * Inicializuje UI systém - připojí event listenery na buttony
 *
 * @returns {void}
 */
export function initUI() {
  // TODO: Implementovat v Epic 4
  console.log('UI initialized');
}

/**
 * Zobrazí main menu
 *
 * @returns {void}
 */
export function showMainMenu() {
  // TODO: Implementovat v Epic 4
  console.log('Show main menu');
}

/**
 * Zobrazí level select obrazovku
 *
 * @returns {void}
 */
export function showLevelSelect() {
  // TODO: Implementovat v Epic 4
  console.log('Show level select');
}

/**
 * Zobrazí victory screen se statistikami
 *
 * @param {Object} stats - Statistiky {moves, time}
 * @returns {void}
 */
export function showVictoryScreen(stats) {
  // TODO: Implementovat v Epic 4
  console.log('Victory!', stats);
}

/**
 * Update UI statistik (moves, time)
 *
 * @param {number} moves - Počet tahů
 * @param {number} time - Čas v ms
 * @returns {void}
 */
export function updateStats(moves, time) {
  // TODO: Implementovat v Epic 4
  console.log(`Stats: ${moves} moves, ${time}ms`);
}
```

**src/ui/palette.js:**
```javascript
/**
 * @fileoverview Mirror palette - výběr typu zrcadla pro umístění.
 *
 * UI komponenta pro výběr mezi '/' a '\\' zrcadly. Zobrazuje aktuální výběr
 * a umožňuje přepínání pomocí kliknutí nebo klávesových zkratek.
 *
 * @module ui/palette
 *
 * Architecture reference: docs/architektura.md sekce 3
 * Epic reference: docs/epics/epic-04-ui-navigation.md
 */

/**
 * Aktuálně vybraný typ zrcadla
 * @type {string}
 */
export let selectedMirrorType = '/';

/**
 * Inicializuje mirror paletu
 *
 * @param {HTMLElement} paletteElement - DOM element palety
 * @returns {void}
 */
export function initPalette(paletteElement) {
  // TODO: Implementovat v Epic 4
  console.log('Palette initialized');
}

/**
 * Nastaví vybraný typ zrcadla
 *
 * @param {string} type - Typ zrcadla ('/' nebo '\\')
 * @returns {void}
 */
export function selectMirrorType(type) {
  // TODO: Implementovat v Epic 4
  selectedMirrorType = type;
  console.log(`Selected mirror: ${type}`);
}

/**
 * Vrací aktuálně vybraný typ zrcadla
 *
 * @returns {string} Typ zrcadla ('/' nebo '\\')
 */
export function getSelectedMirrorType() {
  return selectedMirrorType;
}

/**
 * Toggle mezi '/' a '\\'
 *
 * @returns {void}
 */
export function toggleMirrorType() {
  // TODO: Implementovat v Epic 4
  selectedMirrorType = selectedMirrorType === '/' ? '\\' : '/';
  console.log(`Toggled to: ${selectedMirrorType}`);
}
```

#### 4. Skeleton soubory - src/data/

**src/data/README.md:**
```markdown
# Data & Assets

Tato složka obsahuje herní data - levely, language strings a konstanty.

## Soubory

- **levels.js** - Export všech levelů (bude generováno build scriptem z TXT)
- **strings.json** - Language strings pro internacionalizaci

## Zodpovědnost

Data moduly poskytují:
- Level definitions (20 handcrafted levelů)
- Language strings (čeština, angličtina, další jazyky)
- Static data bez logiky

## Architektury

Viz [Architecture dokumentu sekce 3](/docs/architektura.md#3-architektura---struktura-kódu)

## Související Epic

Epic 5: Level System - implementuje level loading a management
Epic 6: Persistence & Settings - implementuje i18n
```

**src/data/levels.js:**
```javascript
/**
 * @fileoverview Level definitions - export všech herních levelů.
 *
 * POZNÁMKA: Tento soubor bude později generován build scriptem z TXT souborů.
 * Pro nyní obsahuje prázdný export pro zachování struktury.
 *
 * @module data/levels
 *
 * Epic reference: docs/epics/epic-05-level-system.md
 */

/**
 * Všechny levely v LightCaves (placeholder)
 *
 * @type {Array<Object>}
 * @example
 * import { levels } from './data/levels.js';
 * const level1 = levels[0];
 */
export const levels = [];

/**
 * Načte level podle ID
 *
 * @param {number} levelId - ID levelu (1-20)
 * @returns {Object|null} Level data nebo null pokud neexistuje
 *
 * @example
 * const level = getLevelById(1);
 */
export function getLevelById(levelId) {
  // TODO: Implementovat v Epic 5
  console.log(`Get level ${levelId}`);
  return null;
}

/**
 * Vrací celkový počet levelů
 *
 * @returns {number} Počet dostupných levelů
 */
export function getLevelCount() {
  return levels.length;
}
```

**src/data/strings.json:**
```json
{
  "meta": {
    "version": "1.0",
    "languages": ["cs", "en"]
  },
  "cs": {
    "game_title": "LightCaves",
    "menu": {
      "play": "Hrát",
      "continue": "Pokračovat",
      "settings": "Nastavení",
      "about": "O hře"
    },
    "game": {
      "level": "Level",
      "moves": "Tahy",
      "time": "Čas",
      "undo": "Zpět",
      "reset": "Reset",
      "menu": "Menu"
    },
    "victory": {
      "title": "Vítězství!",
      "completed": "Level dokončen",
      "stats": "Statistiky",
      "next_level": "Další level",
      "menu": "Menu"
    },
    "settings": {
      "title": "Nastavení",
      "language": "Jazyk",
      "font_size": "Velikost písma",
      "back": "Zpět"
    }
  },
  "en": {
    "game_title": "LightCaves",
    "menu": {
      "play": "Play",
      "continue": "Continue",
      "settings": "Settings",
      "about": "About"
    },
    "game": {
      "level": "Level",
      "moves": "Moves",
      "time": "Time",
      "undo": "Undo",
      "reset": "Reset",
      "menu": "Menu"
    },
    "victory": {
      "title": "Victory!",
      "completed": "Level completed",
      "stats": "Statistics",
      "next_level": "Next level",
      "menu": "Menu"
    },
    "settings": {
      "title": "Settings",
      "language": "Language",
      "font_size": "Font size",
      "back": "Back"
    }
  }
}
```

#### 5. Skeleton soubory - src/utils/

**src/utils/README.md:**
```markdown
# Utilities

Tato složka obsahuje utility moduly - reusable funkce bez závislostí na game state.

## Moduly

- **constants.js** - Reflexní tabulka, ASCII symboly, barvy, směry
- **storage.js** - localStorage wrapper s error handling
- **input.js** - Input handler pro myš a klávesnici

## Zodpovědnost

Utility moduly poskytují:
- Konstanty používané v celé aplikaci
- Abstrakce pro localStorage (save/load progress)
- Event handling pro user input
- Pure funkce bez side effects

## Architektury

Viz [Architecture dokumentu sekce 3](/docs/architektura.md#3-architektura---struktura-kódu)

## Související Epic

Epic 1: Project Setup - implementuje všechny utility moduly (Stories 1.4-1.7)
```

**src/utils/constants.js:**
```javascript
/**
 * @fileoverview Constants - reflexní tabulka, symboly, barvy a směry.
 *
 * KRITICKÝ modul obsahující reflexní lookup table pro zrcadlové odrazy.
 * Jakákoliv chyba v reflexní tabulce způsobí fundamentální problémy v physics.
 *
 * @module utils/constants
 *
 * Architecture reference: docs/architektura.md sekce 6.1
 * Epic reference: docs/epics/epic-01-project-setup.md Story 1.4
 */

/**
 * Reflexní tabulka - lookup pro odrazy světla od zrcadel
 *
 * Mapuje kombinaci (typ zrcadla, směr paprsku) → nový směr po odrazu
 *
 * @constant
 * @type {Object}
 * @example
 * const newDirection = REFLECTION_TABLE['/']['RIGHT']; // Returns 'UP'
 */
export const REFLECTION_TABLE = Object.freeze({
  '/': {
    'RIGHT': 'UP',      // Paprsek zprava → odraz nahoru
    'LEFT': 'DOWN',     // Paprsek zleva → odraz dolů
    'DOWN': 'LEFT',     // Paprsek shora (jde dolů) → odraz doleva
    'UP': 'RIGHT'       // Paprsek zdola (jde nahoru) → odraz doprava
  },
  '\\': {
    'RIGHT': 'DOWN',    // Paprsek zprava → odraz dolů
    'LEFT': 'UP',       // Paprsek zleva → odraz nahoru
    'DOWN': 'RIGHT',    // Paprsek shora (jde dolů) → odraz doprava
    'UP': 'LEFT'        // Paprsek zdola (jde nahoru) → odraz doleva
  }
});

/**
 * Směrové vektory pro pohyb po gridu
 *
 * @constant
 * @type {Object}
 */
export const DIRECTIONS = Object.freeze({
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
});

/**
 * ASCII symboly pro level elementy
 *
 * @constant
 */
export const SYMBOLS = Object.freeze({
  WALL: '█',
  EMPTY: '.',
  MIRROR_SLASH: '/',
  MIRROR_BACKSLASH: '\\',

  // Lampičky (světelné zdroje)
  LAMP_UP: '▲',
  LAMP_RIGHT: '►',
  LAMP_DOWN: '▼',
  LAMP_LEFT: '◄',

  // Targety (cíle)
  TARGET_UP: '△',
  TARGET_RIGHT: '▷',
  TARGET_DOWN: '▽',
  TARGET_LEFT: '◁'
});

/**
 * Barevná paleta
 *
 * @constant
 */
export const COLORS = Object.freeze({
  BEAM_COLOR: '#FFFF00',    // Žlutá (světelný paprsek)
  FOG_COLOR: '#333333',     // Tmavě šedá (fog of war)
  BG_COLOR: '#000000',      // Černá (pozadí)
  TEXT_COLOR: '#FFFFFF',    // Bílá (text)
  WALL_COLOR: '#666666'     // Šedá (zdi)
});

/**
 * Grid konfigurace
 *
 * @constant
 */
export const GRID_CONFIG = Object.freeze({
  CELL_SIZE: 20,           // Pixelů na buňku
  FONT_SIZE: 16,           // Velikost ASCII fontu
  GRID_MAX_WIDTH: 100,     // Maximální šířka gridu
  GRID_MAX_HEIGHT: 100,    // Maximální výška gridu
  MAX_STEPS: 1000          // Max kroků beam propagation (infinite loop protection)
});

/**
 * Cell types enum
 *
 * @constant
 */
export const CELL_TYPES = Object.freeze({
  WALL: 'wall',
  EMPTY: 'empty',
  LAMP: 'lamp',
  TARGET: 'target',
  MIRROR_SLASH: 'mirror_slash',
  MIRROR_BACKSLASH: 'mirror_backslash'
});
```

**src/utils/storage.js:**
```javascript
/**
 * @fileoverview localStorage wrapper - persistence pro save progress a settings.
 *
 * Poskytuje clean API pro ukládání a načítání dat z localStorage s error handling,
 * fallback na in-memory storage pokud localStorage není dostupný (private mode),
 * a migration logic pro schema updates.
 *
 * @module utils/storage
 *
 * Architecture reference: docs/architektura.md sekce 7.2
 * Epic reference: docs/epics/epic-01-project-setup.md Story 1.5
 */

/**
 * Klíč pro localStorage
 * @constant
 */
const STORAGE_KEY = 'lightcaves_save';

/**
 * Default save objekt
 * @constant
 */
const DEFAULT_SAVE = Object.freeze({
  version: '1.0',
  completedLevels: [],
  currentLevel: 1,
  stats: {},
  settings: {
    language: 'cs',
    fontSize: 'medium',
    highContrast: false
  }
});

/**
 * Uloží progress pro level
 *
 * @param {number} levelId - ID levelu
 * @param {Object} stats - Statistiky {moves, time}
 * @returns {boolean} True pokud úspěšně uloženo
 *
 * @example
 * saveProgress(1, { moves: 5, time: 60000 });
 */
export function saveProgress(levelId, stats) {
  // TODO: Implementovat v Epic 1, Story 1.5
  console.log(`Save progress: level ${levelId}`, stats);
  return false;
}

/**
 * Načte celý save objekt
 *
 * @returns {Object} Save data nebo default pokud neexistuje
 */
export function loadProgress() {
  // TODO: Implementovat v Epic 1, Story 1.5
  console.log('Load progress');
  return DEFAULT_SAVE;
}

/**
 * Smaže všechna uložená data (reset)
 *
 * @returns {void}
 */
export function clearProgress() {
  // TODO: Implementovat v Epic 1, Story 1.5
  console.log('Clear progress');
}

/**
 * Načte nastavení podle klíče
 *
 * @param {string} key - Klíč nastavení (např. 'language')
 * @returns {*} Hodnota nastavení nebo null
 */
export function getSetting(key) {
  // TODO: Implementovat v Epic 1, Story 1.5
  console.log(`Get setting: ${key}`);
  return null;
}

/**
 * Uloží nastavení
 *
 * @param {string} key - Klíč nastavení
 * @param {*} value - Hodnota k uložení
 * @returns {boolean} True pokud úspěšně uloženo
 */
export function setSetting(key, value) {
  // TODO: Implementovat v Epic 1, Story 1.5
  console.log(`Set setting: ${key} =`, value);
  return false;
}
```

**src/utils/input.js:**
```javascript
/**
 * @fileoverview Input handler - event handling pro myš a klávesnici.
 *
 * Event delegation systém pro user input. Přijímá Canvas element a callback funkce,
 * konvertuje pixel coords na grid coords a deleguje events do game logic.
 *
 * @module utils/input
 *
 * Architecture reference: docs/architektura.md sekce 4
 * Epic reference: docs/epics/epic-01-project-setup.md Story 1.7
 */

// TODO: Import CELL_SIZE (Epic 1, Story 1.4)
// import { GRID_CONFIG } from './constants.js';

/**
 * Inicializuje input handlers na Canvas elementu
 *
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} callbacks - Callback funkce {onClick, onRightClick, onKeyDown}
 * @returns {void}
 *
 * @example
 * initInputHandlers(canvas, {
 *   onClick: (x, y) => console.log(`Clicked at [${x}, ${y}]`),
 *   onRightClick: (x, y) => console.log(`Right-clicked at [${x}, ${y}]`),
 *   onKeyDown: (key) => console.log(`Key pressed: ${key}`)
 * });
 */
export function initInputHandlers(canvas, callbacks) {
  // TODO: Implementovat v Epic 1, Story 1.7
  console.log('Input handlers initialized');
}

/**
 * Konvertuje pixel coords na grid coords
 *
 * @param {number} pixelX - X pixel souřadnice (relativní k canvasu)
 * @param {number} pixelY - Y pixel souřadnice (relativní k canvasu)
 * @returns {Object} Grid coords {x, y}
 *
 * @example
 * const gridPos = pixelToGrid(150, 75); // {x: 7, y: 3} pokud CELL_SIZE=20
 */
export function pixelToGrid(pixelX, pixelY) {
  // TODO: Implementovat v Epic 1, Story 1.7
  const CELL_SIZE = 20; // Placeholder - import from constants later
  return {
    x: Math.floor(pixelX / CELL_SIZE),
    y: Math.floor(pixelY / CELL_SIZE)
  };
}

/**
 * Konvertuje grid coords na pixel coords (střed buňky)
 *
 * @param {number} gridX - X grid souřadnice
 * @param {number} gridY - Y grid souřadnice
 * @returns {Object} Pixel coords {x, y} (střed buňky)
 */
export function gridToPixel(gridX, gridY) {
  // TODO: Implementovat v Epic 1, Story 1.7
  const CELL_SIZE = 20; // Placeholder
  return {
    x: gridX * CELL_SIZE + CELL_SIZE / 2,
    y: gridY * CELL_SIZE + CELL_SIZE / 2
  };
}
```

#### 6. Root README.md

**README.md:**
```markdown
# LightCaves

ASCII puzzle game - osvětli labyrint pomocí zrcadel a světelných paprsků.

## O hře

LightCaves je offline-first webová puzzle hra, kde hráč manipuluje světelné paprsky pomocí zrcadel. Cílem je osvítit všechny targety správným směrem paprsku. Hra obsahuje 20 handcrafted levelů s postupně rostoucí obtížností.

**Klíčové vlastnosti:**
- ASCII grafika vykreslená na HTML5 Canvas
- Deterministická fyzika (stejné rozmístění = stejný výsledek)
- Offline funkčnost (žádný server není potřeba)
- localStorage persistence (progress se automaticky ukládá)
- Minimalistický design, rychlý load

## Development

### Požadavky

- Node.js >= 16.0.0
- npm >= 7.0.0

### Instalace

```bash
# Naklonuj repository
git clone https://github.com/yourusername/LightCaves.git
cd LightCaves

# Instaluj dependencies
npm install
```

### Development server

```bash
# Spustí Vite dev server na localhost:5173
npm run dev
```

Dev server má hot module replacement (HMR) - změny v kódu se projeví okamžitě bez refresh.

### Production build

```bash
# Build do /dist složky
npm run build

# Preview production buildu
npm run preview
```

### Testing

```bash
# Spustí unit testy (až budou implementovány)
npm test

# Coverage report
npm run test:coverage
```

## Projektová struktura

```
/LightCaves
├── /src
│   ├── /game              # Core game engine
│   │   ├── game.js        # Main game orchestrator
│   │   ├── physics.js     # Physics engine (beam propagation)
│   │   ├── renderer.js    # Canvas rendering
│   │   └── level-parser.js # TXT level parser
│   ├── /ui                # User interface
│   │   ├── ui.js          # UI manager
│   │   └── palette.js     # Mirror palette
│   ├── /data              # Data & assets
│   │   ├── levels.js      # Level definitions
│   │   └── strings.json   # Language strings
│   ├── /utils             # Utilities
│   │   ├── constants.js   # Reflexní tabulka, symboly
│   │   ├── storage.js     # localStorage wrapper
│   │   └── input.js       # Input handling
│   ├── main.js            # Application init
│   └── styles.css         # Global styles
├── /public                # Static assets
├── /docs                  # Documentation
│   ├── architektura.md    # Architecture document
│   ├── prd.md             # Product requirements
│   └── /epics             # Epic specifications
└── vite.config.js         # Vite configuration
```

## Architektura

LightCaves je postavený na vanilla JavaScript bez frameworků. Klíčové architekturní rozhodnutí:

- **Vanilla JS**: Žádné dependencies = menší bundle, rychlejší load
- **Canvas rendering**: HTML5 Canvas pro pixel-perfect ASCII art
- **localStorage**: Offline-first, žádný server není potřeba
- **Immutable physics**: Pure functions pro deterministickou fyziku
- **Event-driven UI**: Separace concerns mezi game engine a UI

Detailní architekturu viz [docs/architektura.md](docs/architektura.md)

## Epics & Stories

Projekt je rozdělen do 6 epiců:

1. **Epic 1: Project Setup** - Infrastructure, utilities, build pipeline
2. **Epic 2: Core Physics Engine** - Beam propagation, reflexní logika
3. **Epic 3: Rendering System** - Canvas rendering, fog of war
4. **Epic 4: UI & Navigation** - Menu, paleta, victory screen
5. **Epic 5: Level System** - 20 levelů, level loading
6. **Epic 6: Persistence & Settings** - Save progress, settings, i18n

Detaily v [docs/epics/](docs/epics/)

## Deployment

### GitHub Pages

1. Změň `base: './'` v `vite.config.js` (název tvého repo)
2. `npm run build`
3. Deploy `/dist` složku do GitHub Pages

### Netlify / Vercel

1. Připoj repository
2. Build command: `npm run build`
3. Publish directory: `dist`

## Licence

MIT

## Autor

[Tvé jméno]

---

**Status:** 🚧 Work in Progress - Epic 1 Story 1.2 (Folder Structure)
```

### Validace

Po vytvoření všech souborů:

```bash
# Test že dev server běží bez syntax errors
npm run dev

# Build test
npm run build
```

## Validace / Testing

### Manuální testy

- [ ] **Folder existence**: Všechny složky src/{game,ui,data,utils} existují
- [ ] **README files**: Každá složka má README.md s popisem
- [ ] **Skeleton files**: Všechny .js soubory existují a jsou validní ES6
- [ ] **JSDoc comments**: Každý soubor má @fileoverview a @module komentář
- [ ] **Function signatures**: Každá exportovaná funkce má JSDoc dokumentaci
- [ ] **No syntax errors**: `npm run dev` spustí server bez chyb
- [ ] **No runtime errors**: Browser console je čistá (žádné red errors)
- [ ] **Import/export**: Všechny soubory mají export statements
- [ ] **Constants valid**: constants.js obsahuje správnou reflexní tabulku
- [ ] **JSON valid**: strings.json je validní JSON (lze parsovat)
- [ ] **Root README**: Root README.md existuje s project overview

### Validační checklist

**Folder struktura:**
```bash
# Ověř že všechny složky existují
ls -la src/game src/ui src/data src/utils
# Expected: README.md a .js soubory v každé složce
```

**Syntax validation:**
```bash
# Dev server musí běžet bez chyb
npm run dev
# Expected: "Local: http://localhost:5173" bez syntax errors

# Build musí projít
npm run build
# Expected: "built in XXXms" bez errors
```

**JSON validation:**
```bash
# Validuj strings.json
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/strings.json')))"
# Expected: Parsed object, žádné syntax errors
```

**Import validation:**
```javascript
// V browser console po npm run dev:
import { gameState } from './src/game/game.js';
console.log(gameState);
// Expected: gameState object, žádné errors
```

### Checklist - Všechny soubory vytvořeny

- [ ] src/game/README.md
- [ ] src/game/game.js
- [ ] src/game/physics.js
- [ ] src/game/renderer.js
- [ ] src/game/level-parser.js
- [ ] src/ui/README.md
- [ ] src/ui/ui.js
- [ ] src/ui/palette.js
- [ ] src/data/README.md
- [ ] src/data/levels.js
- [ ] src/data/strings.json
- [ ] src/utils/README.md
- [ ] src/utils/constants.js
- [ ] src/utils/storage.js
- [ ] src/utils/input.js
- [ ] README.md (root)

## Závislosti

**Předchozí stories:**
- Story 1.1: Vite Setup (MUSÍ být hotová - fungující projekt)

**Blokující pro:**
- Story 1.3: HTML Shell (potřebuje existující strukturu)
- Story 1.4: Constants Implementation (implementuje constants.js)
- Všechny Epic 2+ stories (potřebují existující skeleton soubory)

**External dependencies:**
- Žádné nové dependencies (využívá Vite z Story 1.1)

## Poznámky

### Proč skeleton soubory?

- **Clarity**: Vývojář okamžitě rozumí strukture projektu
- **Documentation**: JSDoc poskytuje inline dokumentaci
- **Typescript-like**: JSDoc types připravují pro případný TS refactor
- **No implementation**: Skeleton = žádná logika, jen struktura
- **Git tracking**: Všechny soubory jsou v git (žádné prázdné složky)

### README.md v každé složce

Každý README.md vysvětluje:
- Účel složky (co do ní patří)
- Seznam modulů s krátkým popisem
- Odkazy na Architecture dokument
- Odkazy na související Epics

Výhoda: Nový vývojář otevře libovolnou složku a okamžitě rozumí kontextu.

### JSDoc konvence

- `@fileoverview`: Popis celého modulu
- `@module`: Název modulu pro cross-referencing
- `@param`: Parametry funkce s typy
- `@returns`: Return value s typem
- `@example`: Ukázkové použití
- `@typedef`: Custom type definitions
- `@see`: Links na related moduly

### Budoucí implementace

Skeleton soubory poskytují "roadmap" pro implementaci:
- Epic 1 Story 1.4-1.7: Implementuje utils/
- Epic 2: Implementuje game/physics.js
- Epic 3: Implementuje game/renderer.js
- Epic 4: Implementuje ui/
- Epic 5: Implementuje data/levels.js

### Troubleshooting

**Dev server fails s import errors:**
- Normální - skeleton soubory nemají implementaci
- Řešení: Nezavádí se žádné soubory v main.js (zatím)

**Empty functions warning:**
- Expected - skeleton soubory mají jen console.log
- Budou naplněny implementací v dalších stories

**Git shows unstaged files:**
- Normální po vytvoření nových souborů
- Zacommituj všechny nové soubory: `git add src/` a `git commit`

## Odhad

**Časová náročnost:** 0.5 - 1 den

**Breakdown:**
- Vytvoření folder struktury: 15 min
- README.md soubory (4×): 1 hodina
- Skeleton .js soubory (14×): 2-3 hodiny
- strings.json vytvoření: 30 min
- Root README.md: 1 hodina
- Validace a testování: 1 hodina

**Complexity:** Low (strukturální práce, žádná logika)

**Risk:** Minimal (copy-paste, syntax validation s npm run dev)

---

**Status:** 🟢 Ready for Implementation

**Next story:** Story 1.3: HTML Shell
