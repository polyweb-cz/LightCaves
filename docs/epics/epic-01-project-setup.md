# Epic 1: Project Setup & Infrastructure

## Popis

Epic 1 zakládá technickou infrastrukturu celého projektu LightCaves. Cílem je vytvořit funkční development environment s moderním build systémem (Vite), definovat projektovou strukturu, připravit základní HTML shell s Canvas elementem a implementovat všechny utility moduly, které budou používány v dalších epicích.

Tento epic neobsahuje žádnou herní logiku - zaměřuje se čistě na infrastrukturu, tooling a základní boilerplate. Po dokončení bude projekt připravený pro začátek vývoje game enginu (Epic 2). Výsledkem je prázdná aplikace s černým canvasem, která se builduje, běží v dev režimu a je ready k deploymentu.

Kritická součást tohoto epicu je **reflexní tabulka** v `constants.js` - lookup table pro zrcadlové odrazy, která musí být 100% přesná. Chyba v reflexní tabulce by způsobila fundamentální problémy v celé herní fyzice. Rovněž připravujeme input handling skeleton a storage wrapper, které budou okamžitě použitelné v dalších epicích.

## Cíle

- [ ] Funkční Vite build pipeline s hot reload pro rychlou iteraci
- [ ] Projektová struktura podle architektury (`/src/game`, `/src/ui`, `/src/data`, `/src/utils`)
- [ ] HTML shell s Canvas elementem, černým pozadím a responsive layoutem
- [ ] Reflexní tabulka a všechny konstanty (ASCII symboly, barvy, směry) validované a otestované
- [ ] localStorage wrapper s API pro save/load progress a nastavení
- [ ] Input handler skeleton připravený pro event delegaci
- [ ] Production build konfigurace s optimalizacemi
- [ ] Projekt ready pro git deployment (GitHub Pages konfigurace)

## Stories

### Story 1.1: Vite Setup

**As a** vývojář
**I want to** mít Vite build pipeline s hot reload
**So that** mohu rychle iterovat během vývoje a mít optimalizovaný production build

**Acceptance Criteria:**
- [ ] `npm init` vytvořil `package.json` s projektem "lightcaves"
- [ ] Vite a dependencies jsou nainstalovány (`npm install vite --save-dev`)
- [ ] `vite.config.js` existuje a obsahuje základní konfiguraci (root: `./src`, base path `/`)
- [ ] `package.json` obsahuje scripty: `dev`, `build`, `preview`
- [ ] `npm run dev` spustí dev server na `localhost:5173` (nebo jiný port)
- [ ] Dev server má hot reload - změna v `main.js` se projeví okamžitě
- [ ] `npm run build` vytvoří `/dist` složku s minifikovanými soubory
- [ ] `npm run preview` spustí preview server pro testování production buildu
- [ ] Build output je menší než 50 KB (bez node_modules)

**Technické poznámky:**
- Vite místo Webpack = rychlejší cold start (< 1s), native ES modules
- Konfigurace: `build.target: 'es2015'` pro kompatibilitu
- Optimalizace: `build.minify: 'terser'`, `build.sourcemap: false` v produkci
- Dev server: `server.open: true` pro auto-open browseru
- Fallback pro starší browsery: `@vitejs/plugin-legacy` (optional, pokud budget dovolí)

---

### Story 1.2: Folder Structure

**As a** vývojář
**I want to** mít konzistentní projektovou strukturu podle architektury
**So that** vím kde hledat soubory a projekt je škálovatelný

**Acceptance Criteria:**
- [ ] `/src/game` složka existuje (prázdná - pro budoucí game.js, physics.js, renderer.js)
- [ ] `/src/ui` složka existuje (prázdná - pro budoucí ui.js, palette.js, victory-screen.js)
- [ ] `/src/data` složka existuje s podsložkami `/data/levels` a `/data/strings`
- [ ] `/src/utils` složka existuje (připravená pro constants.js, storage.js, input.js)
- [ ] `/src/index.html` existuje (entry point)
- [ ] `/src/main.js` existuje (application init)
- [ ] `/src/styles.css` existuje (základní styling)
- [ ] `/public` složka existuje (pro service-worker.js a static assets)
- [ ] `.gitignore` obsahuje: `node_modules/`, `dist/`, `.env`, `.DS_Store`
- [ ] Všechny složky jsou commitnuté do gitu (prázdné složky obsahují `.gitkeep`)

**Technické poznámky:**
- Separace concerns: `/game` = core logika, `/ui` = user interaction, `/data` = levely + i18n
- Utils jsou reusable across modules (nezávislé na game state)
- `/data/levels` bude obsahovat TXT soubory, build script je zkompiluje do JSON
- `/public` složka se kopíruje do dist bez transformace (Vite default behavior)

---

### Story 1.3: HTML Shell

**As a** vývojář
**I want to** mít HTML shell s Canvas elementem
**So that** můžu začít vykreslovat hru na Canvas

**Acceptance Criteria:**
- [ ] `/src/index.html` obsahuje validní HTML5 doctype a strukturu
- [ ] Meta tagy: `charset="UTF-8"`, `viewport="width=device-width, initial-scale=1.0"`
- [ ] `<title>LightCaves - ASCII Puzzle Game</title>`
- [ ] `<canvas id="gameCanvas"></canvas>` element v body
- [ ] Canvas má CSS třídu `game-canvas`
- [ ] Link na `styles.css` a script tag pro `main.js` (type="module")
- [ ] `styles.css` obsahuje: `body { background: #000; margin: 0; padding: 0; }`
- [ ] `styles.css` obsahuje: `.game-canvas { display: block; margin: 0 auto; border: 1px solid #333; }`
- [ ] Canvas má výchozí velikost 800×600 (bude škálovaný pomocí CSS)
- [ ] `npm run dev` otevře stránku s černým canvasem centrovaným na obrazovce
- [ ] Canvas je viditelný a má tenký šedý border (visual feedback)

**Technické poznámky:**
- Canvas sizing: nastavíme `canvas.width` a `canvas.height` v JavaScriptu (ne CSS) pro pixel-perfect rendering
- CSS: `max-width: 100%; height: auto` pro responsiveness
- Připravit na budoucí UI overlay (buttony mimo canvas)
- Font: Courier New, fallback Consolas (monospace pro ASCII)

---

### Story 1.4: Constants.js

**As a** vývojář
**I want to** mít reflexní tabulku a všechny konstanty v jednom místě
**So that** physics engine má 100% přesná data a konstanty jsou reusable

**Acceptance Criteria:**
- [ ] `/src/utils/constants.js` existuje a je ES6 modul (export const)
- [ ] Reflexní tabulka `REFLECTION_TABLE` obsahuje všechny 8 kombinací (2 zrcadla × 4 směry)
- [ ] Reflexní tabulka je validována unit testem (každý mapping je správný)
- [ ] ASCII symboly: `WALL = '█'`, `EMPTY = '.'`, `MIRROR_SLASH = '/'`, `MIRROR_BACKSLASH = '\\'`
- [ ] Lampičky: `LAMP_UP = '▲'`, `LAMP_RIGHT = '►'`, `LAMP_DOWN = '▼'`, `LAMP_LEFT = '◄'`
- [ ] Targety: `TARGET_UP = '△'`, `TARGET_RIGHT = '▷'`, `TARGET_DOWN = '▽'`, `TARGET_LEFT = '◁'`
- [ ] Barvy: `BEAM_COLOR = '#FFFF00'` (žlutá), `FOG_COLOR = '#333333'` (šedá 50%), `BG_COLOR = '#000000'`, `TEXT_COLOR = '#FFFFFF'`
- [ ] Směry: `DIRECTIONS = { UP: {dx: 0, dy: -1}, DOWN: {dx: 0, dy: 1}, LEFT: {dx: -1, dy: 0}, RIGHT: {dx: 1, dy: 0} }`
- [ ] Grid konfigurace: `CELL_SIZE = 20` (pixelů), `FONT_SIZE = 16`, `GRID_MAX_WIDTH = 100`, `GRID_MAX_HEIGHT = 100`
- [ ] Constants jsou importovatelné v jiných modulech: `import { REFLECTION_TABLE } from './utils/constants.js'`
- [ ] Console test: `console.log(REFLECTION_TABLE['/']['LEFT'])` vypíše `'DOWN'`

**Technické poznámky:**
- Reflexní tabulka MUSÍ odpovídat PRD specifikaci (kritické!)
- Validace: unit test pro každý mapping (8 testů)
- Používat object freeze pro immutability: `Object.freeze(REFLECTION_TABLE)`
- Unicode symboly: testovat v browseru že se zobrazují správně (fallback fonty)
- Barvy: hexadecimal formát pro Canvas API kompatibilitu

**Reflexní tabulka - přesná specifikace:**

```js
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
```

---

### Story 1.5: Storage Wrapper

**As a** vývojář
**I want to** mít localStorage wrapper s clean API
**So that** můžu ukládat progress bez boilerplate kódu a mám error handling

**Acceptance Criteria:**
- [ ] `/src/utils/storage.js` existuje a exportuje funkce: `saveProgress`, `loadProgress`, `clearProgress`, `getSetting`, `setSetting`
- [ ] `saveProgress(levelId, stats)` uloží do localStorage pod klíčem `lightcaves_save`
- [ ] `loadProgress()` načte celý save objekt, nebo vrátí default pokud neexistuje
- [ ] `clearProgress()` smaže celý save (pro reset/debug)
- [ ] `getSetting(key)` vrací hodnotu nastavení (např. language), default pokud neexistuje
- [ ] `setSetting(key, value)` uloží nastavení a vrátí success boolean
- [ ] Error handling: pokud localStorage není dostupný (private mode), loguje warning a používá in-memory fallback
- [ ] Storage schema má verzi: `{ version: '1.0', completedLevels: [], currentLevel: 1, stats: {}, settings: {} }`
- [ ] Migration logic: pokud verze je stará, migruje data do nového formátu (zatím jen placeholder)
- [ ] Console test: `saveProgress(1, {moves: 5, time: 60000})` → `loadProgress()` vrátí správná data
- [ ] Quota check: pokud localStorage je plný (quota exceeded), loguje error a necrashuje

**Technické poznámky:**
- localStorage API: `localStorage.setItem(key, JSON.stringify(data))`
- Try-catch wrapper: catch `SecurityError` (private mode), `QuotaExceededError`
- Default save object:
```js
{
  version: '1.0',
  completedLevels: [],
  currentLevel: 1,
  stats: {},
  settings: {
    language: 'cs',
    fontSize: 'medium',
    highContrast: false
  }
}
```
- In-memory fallback: pokud localStorage nefunguje, použij global variable (data se ztratí po refreshi, ale app necrashne)
- Migration example: pokud `version === '0.9'`, přejmenuj klíč `levels` → `completedLevels`

---

### Story 1.6: Basic CSS

**As a** vývojář
**I want to** mít základní CSS styling pro minimalistický vzhled
**So that** hra vypadá clean, čitelná a funguje na různých velikostech obrazovek

**Acceptance Criteria:**
- [ ] `styles.css` má CSS reset: `* { box-sizing: border-box; }`, `body { margin: 0; padding: 0; }`
- [ ] Body má černé pozadí: `background-color: #000;` a bílý text: `color: #FFF;`
- [ ] Font: `font-family: 'Courier New', Consolas, monospace;` pro celou stránku
- [ ] Canvas styling: `.game-canvas { display: block; margin: 0 auto; border: 1px solid #333; max-width: 100%; height: auto; }`
- [ ] Canvas je centrovaný horizontálně (margin auto)
- [ ] Responsive: na mobilních zařízeních (max-width: 768px) je canvas `width: 100%;`
- [ ] Buttony (pro budoucí UI): `.btn { padding: 10px 20px; background: #333; color: #FFF; border: 1px solid #666; cursor: pointer; }`
- [ ] Button hover: `.btn:hover { background: #555; }`
- [ ] Text je čitelný: `line-height: 1.5;`, `font-size: 14px;`
- [ ] Žádný scroll pokud není potřeba: `html, body { overflow: hidden; }` (canvas zabírá celý viewport)
- [ ] Dev test: otevři v browseru, změň velikost okna → canvas se škáluje, zůstává centrovaný

**Technické poznámky:**
- Minimalistický design = černobílá paleta, žádné gradienty/stíny
- Monospace font je kritický pro ASCII art (každý znak má stejnou šířku)
- Canvas responsive: CSS `max-width: 100%` zachovává aspect ratio
- Připravit CSS proměnné pro budoucí theming: `--bg-color: #000;`, `--text-color: #FFF;`
- Mobile-first přístup: default styling pro mobil, media queries pro desktop

---

### Story 1.7: Input Handler

**As a** vývojář
**I want to** mít input handler skeleton pro myš a klávesnici
**So that** můžu později snadno připojit event listeners k herní logice

**Acceptance Criteria:**
- [ ] `/src/utils/input.js` existuje a exportuje funkce: `initInputHandlers(canvas, callbacks)`
- [ ] Mouse events: `click`, `contextmenu` (pravý klik), `mousemove`
- [ ] Keyboard events: `Tab`, `Enter`, `Delete`, `Backspace`, arrow keys (↑↓←→)
- [ ] `initInputHandlers()` přijímá canvas element a callbacks objekt: `{ onClick, onRightClick, onKeyDown }`
- [ ] Click event: převádí pixel coords na grid coords (x, y) a volá `onClick(x, y)`
- [ ] Right click: preventuje context menu a volá `onRightClick(x, y)`
- [ ] Keyboard: detekuje stisknuté klávesy a volá `onKeyDown(key)`
- [ ] Proof of concept: `onClick` loguje do console: `"Clicked at grid [x, y]"`
- [ ] Grid coords conversion: funkce `pixelToGrid(pixelX, pixelY, cellSize)` → vrací `{x, y}`
- [ ] Event delegation: handler neobsahuje žádnou game logic, jen volá callbacks
- [ ] Dev test: klikni na canvas → console vypíše grid souřadnice

**Technické poznámky:**
- Canvas coords: `event.offsetX`, `event.offsetY` (relativní k canvasu)
- Grid conversion: `gridX = Math.floor(pixelX / CELL_SIZE)`, `gridY = Math.floor(pixelY / CELL_SIZE)`
- Prevent context menu: `event.preventDefault()` na `contextmenu`
- Keyboard: `event.key` property (vrací string jako 'Tab', 'Enter', 'ArrowUp')
- Callbacks pattern: flexibilní - game.js poskytne vlastní funkce
- Edge case: klik mimo canvas → ignorovat (check bounds)

**Skeleton implementace:**

```js
export function initInputHandlers(canvas, callbacks) {
  canvas.addEventListener('click', (e) => {
    const coords = pixelToGrid(e.offsetX, e.offsetY);
    console.log(`Clicked at grid [${coords.x}, ${coords.y}]`);
    if (callbacks.onClick) callbacks.onClick(coords.x, coords.y);
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const coords = pixelToGrid(e.offsetX, e.offsetY);
    if (callbacks.onRightClick) callbacks.onRightClick(coords.x, coords.y);
  });

  document.addEventListener('keydown', (e) => {
    if (callbacks.onKeyDown) callbacks.onKeyDown(e.key);
  });
}

function pixelToGrid(pixelX, pixelY) {
  const CELL_SIZE = 20; // Import from constants later
  return {
    x: Math.floor(pixelX / CELL_SIZE),
    y: Math.floor(pixelY / CELL_SIZE)
  };
}
```

---

### Story 1.8: Build & Deploy Setup

**As a** vývojář
**I want to** mít production build konfiguraci a deploy připravený
**So that** můžu jednoduše nasadit hru na GitHub Pages nebo jiný static hosting

**Acceptance Criteria:**
- [ ] `npm run build` vytvoří `/dist` složku s optimalizovanými soubory
- [ ] `/dist` obsahuje: `index.html`, minifikovaný `main.js`, `styles.css`, všechny assets z `/public`
- [ ] Build output je menší než 50 KB (bez node_modules, jen production bundle)
- [ ] `vite.config.js` obsahuje `base: '/'` pro root path (později změníme na GitHub Pages path)
- [ ] `.gitignore` obsahuje: `node_modules/`, `dist/`, `.env`, `.DS_Store`, `*.log`
- [ ] `README.md` obsahuje sekci "Development": jak spustit dev server, jak buildovat
- [ ] `README.md` obsahuje sekci "Deployment": návod na deploy na GitHub Pages
- [ ] GitHub Pages konfigurace: `vite.config.js` má komentář jak nastavit `base: '/LightCaves/'` (název repo)
- [ ] Deploy test (optional): manuálně zkopíruj `/dist` do GitHub Pages → ověř že hra běží
- [ ] Build proces trvá < 5 sekund

**Technické poznámky:**
- Vite automaticky minifikuje a optimalizuje v production módu
- GitHub Pages deployment: `npm run build` → push `/dist` do `gh-pages` branch (manuálně nebo pomocí GitHub Actions)
- Alternativa: použít `gh-pages` package: `npm install gh-pages --save-dev`, script `deploy: "vite build && gh-pages -d dist"`
- Base path: GitHub Pages používá `/repository-name/`, Netlify používá `/` (root)
- Assets caching: Vite automaticky hashuje filenames (e.g. `main.abc123.js`) pro cache busting

**README.md template:**

```markdown
# LightCaves

ASCII puzzle game - osvětli labyrint pomocí zrcadel a světelných paprsků.

## Development

```bash
npm install          # Instalace dependencies
npm run dev          # Spustí dev server na localhost:5173
npm run build        # Production build do /dist
npm run preview      # Preview production buildu
```

## Deployment (GitHub Pages)

1. Změň `base: '/LightCaves/'` v `vite.config.js` (název tvého repo)
2. `npm run build`
3. Deploy `/dist` složku do GitHub Pages (Settings → Pages → Deploy from branch `gh-pages`)

Nebo použij automatický deploy:
```bash
npm install gh-pages --save-dev
npm run deploy  # Build + push do gh-pages branch
```
```

---

## Definition of Done

- [ ] Všechny stories (1.1 - 1.8) splněny a otestovány
- [ ] `npm run dev` spustí aplikaci s černým canvasem na localhost
- [ ] `npm run build` vytvoří `/dist` bez errorů
- [ ] Reflexní tabulka je validována unit testem (100% coverage na constants.js)
- [ ] Storage wrapper ukládá a načítá data z localStorage správně
- [ ] Input handler loguje grid coords do console při kliknutí
- [ ] Projektová struktura odpovídá architektuře (všechny složky existují)
- [ ] `.gitignore` je nastaven, žádné `node_modules` v gitu
- [ ] README.md obsahuje development a deployment instrukce
- [ ] Manuální QA: otevři v Chrome, Firefox, Safari → canvas je viditelný, žádné console errors
- [ ] Code review: constants.js, storage.js, input.js jsou čitelné a dobře dokumentované (JSDoc komentáře)

## Odhad

**5-7 dní** (1 vývojář, full-time)

**Breakdown:**
- Story 1.1 (Vite Setup): 0.5 dne
- Story 1.2 (Folder Structure): 0.5 dne
- Story 1.3 (HTML Shell): 0.5 dne
- Story 1.4 (Constants.js): 1 den (reflexní tabulka + validace je kritická)
- Story 1.5 (Storage Wrapper): 1 den (error handling + migrations)
- Story 1.6 (Basic CSS): 0.5 dne
- Story 1.7 (Input Handler): 1 den (grid conversion + event delegation)
- Story 1.8 (Build & Deploy): 1 den (konfigurace + dokumentace)
- Buffer: 0.5 dne (debugging, unplánované problémy)

**Risks:**
- Reflexní tabulka: chyba v mappingu by způsobila problémy v celém physics enginu → extra čas na validaci
- localStorage compatibility: starší browsery/private mode → fallback musí fungovat
- Unicode symboly: někteří uživatelé nemají fonty s █, ▲, atd. → fallback ASCII (+, ^, >, v, <)

**Milestone po Epic 1:**
Projekt je ready pro vývoj game enginu (Epic 2: Core Game Logic). Dev environment funguje, všechny utility moduly jsou připravené, build proces je automatizovaný.