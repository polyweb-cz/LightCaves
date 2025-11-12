# Epic 3: Basic Rendering System

## Popis

Epic 3 přeměňuje neviditelnou logiku fyzikálního enginu (Epic 2) na **vizuální ASCII art hru** renderovanou na HTML Canvas elementu. Po dokončení tohoto epicu bude hra poprvé VIDITELNÁ a HRATELNÁ - hráč uvidí temné jeskyně, světelný paprsek cestující gridem, záblesky osvětlení a zrcadla odrážející světlo. Bez tohoto epicu máme pouze čísla v paměti - teď je přeměníme na atmosférickou vizuální zkušenost.

Rendering systém musí být **rychlý a efektivní** - cílem je stabilních 60 FPS i na velkých mapách (50×50+). To znamená inteligentní dirty flagging (překreslit pouze změněné buňky), vrstvené renderování (base layer + dynamic layer) a minimalizaci Canvas API callů. Každý frame není nutné překreslit celou mapu - pouze části, které se změnily (paprsek, nově umístěné zrcadlo, změna osvětlení).

Klíčovou součástí je **ASCII character rendering** - hra používá monospace font (Courier New) a grid-based positioning. Každá buňka mapy je vykreslena jako ASCII znak: zdi jsou `█`, lampičky `▲►▼◄`, cíle `△▷▽◁`, zrcadla `/` a `\`, paprsek jako žluté buňky. Znaky musí být pixel-perfect zarovnané a konzistentní - žádné podivné offsety nebo rozmazané fonty.

**Lighting system** (fog of war) vytváří atmosféru - osvětlené buňky (100% jas) jsou jasně viditelné, částečně osvětlené buňky (50% jas) jsou šedivé, a neprozkoumaná území jsou ponořena do temnoty (0% jas = černá). Když hráč umístí zrcadlo a paprsek se odrazí do nové oblasti, temnota se postupně rozplývá - tento gradual reveal efekt je klíčový pro gameplay feel. Hra není jen puzzle - je to **expediční průzkum temných jeskyní se světlem jako jedinou zbraní**.

## Cíle

- [ ] Canvas element inicializace + context 2D setup + resize handling pro responsive layout
- [ ] Frame rate management - stabilních 60 FPS s requestAnimationFrame + frame time tracking
- [ ] ASCII character rendering engine - monospace font, grid-based positioning, pixel-perfect alignment
- [ ] Map base layer rendering - zdi, lampičky, cíle, statická zrcadla z mapData (bílá, zelená barva)
- [ ] Beam visualization - žlutý paprsek (`#FFFF00`) vykreslený přes buňky v beamPath
- [ ] Visibility/lighting system - osvětlené (100%), částečně osvětlené (50%), tmavé (0%) buňky s plynulými přechody
- [ ] Mirror visualization - hráčem umístěná zrcadla (`/` a `\`) výrazně odlišená od pozadí
- [ ] Dynamic rendering updates - trigger rerendering při změně game state, dirty flags pro partial redraws
- [ ] Target highlight & victory state - blikající/zářící efekt když je cíl osvícen
- [ ] Performance optimization - render profiling, caching layer data, efficient Canvas API usage, 60 FPS na 100×100 gridech

## Stories

### Story 3.1: Canvas Setup & Initialization

**As a** vývojář
**I want to** inicializovat Canvas element a nastavit rendering context
**So that** můžu začít vykreslovat hru na obrazovku

**Acceptance Criteria:**
- [ ] `/src/renderer/canvasSetup.js` existuje a exportuje `initCanvas(canvasId)`, `getContext()`, `resizeCanvas()`
- [ ] `initCanvas(canvasId)` najde Canvas element v HTML (např. `<canvas id="gameCanvas"></canvas>`)
- [ ] Canvas má fixed nebo responsive velikost podle container divu (např. 1200×800px nebo 100% parent width)
- [ ] Context 2D je získán pomocí `canvas.getContext('2d')` a cachován v modulu
- [ ] `resizeCanvas()` adjustuje canvas dimensions při window resize + přepočítá cell size (width/height)
- [ ] Grid configuration: `CELL_WIDTH = 16px`, `CELL_HEIGHT = 20px` (konstanty v config)
- [ ] Počet columns/rows: `cols = Math.floor(canvas.width / CELL_WIDTH)`, `rows = Math.floor(canvas.height / CELL_HEIGHT)`
- [ ] Clear function: `clearCanvas()` vymaže celý canvas (`ctx.clearRect(0, 0, width, height)`)
- [ ] Background: canvas má černé pozadí (`#000000`) - temné jeskyně
- [ ] Dev test: otevřít HTML → canvas je viditelný a vyplní container, černé pozadí

**Technické poznámky:**
- Canvas HTML:
```html
<div id="gameContainer" style="width: 1200px; height: 800px;">
  <canvas id="gameCanvas"></canvas>
</div>
```
- Canvas setup:
```js
let canvas = null;
let ctx = null;
let cellWidth = 16;
let cellHeight = 20;

export function initCanvas(canvasId) {
  canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error(`Canvas element #${canvasId} not found`);
  }

  ctx = canvas.getContext('2d');
  resizeCanvas();

  // Set black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  console.log(`Canvas initialized: ${canvas.width}x${canvas.height}`);
}

export function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Recalculate grid dimensions
  const cols = Math.floor(canvas.width / cellWidth);
  const rows = Math.floor(canvas.height / cellHeight);

  console.log(`Grid: ${cols} cols × ${rows} rows`);
}

export function getContext() {
  return ctx;
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```
- Resize listener:
```js
window.addEventListener('resize', resizeCanvas);
```
- Cell size reasoning: 16×20 je dobrý poměr pro ASCII znaky - trochu vyšší než široký (monospace fonty mají obvykle aspect ratio ~0.6)
- Edge case: Canvas není podporován (starý browser) → show fallback message "Your browser does not support Canvas"

---

### Story 3.2: ASCII Character Rendering

**As a** vývojář
**I want to** renderovat jednotlivé ASCII znaky na grid pozicích
**So that** můžu zobrazit zdi, lampičky, cíle, zrcadla jako text

**Acceptance Criteria:**
- [ ] `/src/renderer/charRenderer.js` existuje a exportuje `drawChar(char, x, y, color, opacity)`
- [ ] `drawChar()` vykreslí ASCII znak na grid pozici `(x, y)` - kde `x` je column, `y` je row
- [ ] Pixel pozice: `pixelX = x * CELL_WIDTH`, `pixelY = y * CELL_HEIGHT`
- [ ] Font: `ctx.font = '16px Courier New'` (monospace, bold optional)
- [ ] Font settings: `ctx.textBaseline = 'top'`, `ctx.textAlign = 'left'` (consistent alignment)
- [ ] Color: parametr `color` (např. `#FFFFFF` pro bílou) aplikován pomocí `ctx.fillStyle`
- [ ] Opacity: parametr `opacity` (0.0 - 1.0) aplikován pomocí `ctx.globalAlpha`
- [ ] Znaky: zdi `█`, lampičky `▲►▼◄`, cíle `△▷▽◁`, zrcadla `/` `\`, prázdné buňky `.` (nebo nic)
- [ ] Unit test: vykreslit všechny znaky do 1 řady → vizuálně zkontrolovat alignment
- [ ] Dev test: `drawChar('█', 0, 0, '#FFFFFF', 1.0)` vykreslí bílý blok v levém horním rohu

**Technické poznámky:**
- Draw function:
```js
import { CELL_WIDTH, CELL_HEIGHT } from '../utils/config.js';

export function drawChar(char, x, y, color, opacity = 1.0) {
  const ctx = getContext();

  const pixelX = x * CELL_WIDTH;
  const pixelY = y * CELL_HEIGHT;

  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = '16px Courier New';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  ctx.fillText(char, pixelX, pixelY);

  ctx.globalAlpha = 1.0;  // Reset
}
```
- Alternative: použít `measureText()` pro centrování znaků v buňce:
```js
const textMetrics = ctx.measureText(char);
const offsetX = (CELL_WIDTH - textMetrics.width) / 2;
const offsetY = (CELL_HEIGHT - 16) / 2;  // 16 is font size
ctx.fillText(char, pixelX + offsetX, pixelY + offsetY);
```
- Performance: `drawChar()` je hot path - minimize ctx property změny (batch stejné barvy dohromady)
- Font fallback: `'16px Courier New, monospace'` (pokud Courier New není dostupný)
- Edge case: char je prázdný string → nic nevykresluj
- Unicode support: ▲►▼◄△▷▽◁ vyžadují UTF-8 encoding v HTML (`<meta charset="UTF-8">`)

**Character mapping:**
```js
export const CELL_CHARS = {
  WALL: '█',
  EMPTY: '.',
  LAMP_UP: '▲',
  LAMP_RIGHT: '►',
  LAMP_DOWN: '▼',
  LAMP_LEFT: '◄',
  TARGET_UP: '△',
  TARGET_RIGHT: '▷',
  TARGET_DOWN: '▽',
  TARGET_LEFT: '◁',
  MIRROR_SLASH: '/',
  MIRROR_BACKSLASH: '\\',
  BEAM: '·'  // Optional: subtle dot pro paprsek buňky
};
```

---

### Story 3.3: Map Base Layer Rendering

**As a** vývojář
**I want to** vykreslit statickou mapu (zdi, lampičky, cíle)
**So that** hráč vidí level layout

**Acceptance Criteria:**
- [ ] `/src/renderer/mapRenderer.js` existuje a exportuje `renderMap(mapData, visibilityMap)`
- [ ] `renderMap()` iteruje přes `mapData.cells` (2D array) a vykresluje každou buňku
- [ ] Zdi (`CELL_TYPES.WALL`): bílá barva `#FFFFFF`, znak `█`
- [ ] Prázdné buňky (`CELL_TYPES.EMPTY`): nekreslí se (zůstává černé pozadí) nebo tečka `.` s 10% opacity
- [ ] Lampička: zelená barva `#00FF00`, znak podle směru (`▲►▼◄`)
- [ ] Cíl: zelená barva `#00FF00`, znak podle směru (`△▷▽◁`)
- [ ] Opacity modulace: buňky mají opacity podle `visibilityMap[y][x]` (1.0 = plně viditelné, 0.5 = šedivé, 0.0 = neviditelné)
- [ ] Rendering order: zdi → lampičky → cíle (layering, pokud je třeba)
- [ ] Performance: cache rendered base layer (draw do off-screen canvas) a composite na main canvas
- [ ] Dev test: `renderMap(mapData, fullVisibilityMap)` vykreslí celou mapu s plným jasem
- [ ] Visual test: mapa odpovídá TXT formátu levelu - zdi na správných pozicích, lampička viditelná

**Technické poznámky:**
- Rendering loop:
```js
import { drawChar } from './charRenderer.js';
import { CELL_TYPES, CELL_CHARS } from '../utils/constants.js';

export function renderMap(mapData, visibilityMap) {
  const { cells, lamp, target } = mapData;

  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      const cell = cells[y][x];
      const visibility = visibilityMap[y][x];

      if (visibility === 0.0) continue;  // Skip dark cells

      let char = '';
      let color = '#FFFFFF';

      switch (cell.type) {
        case CELL_TYPES.WALL:
          char = CELL_CHARS.WALL;
          color = '#FFFFFF';
          break;
        case CELL_TYPES.EMPTY:
          // Don't draw empty cells (or draw faint '.')
          continue;
        case CELL_TYPES.LAMP:
          char = getLampChar(lamp.direction);
          color = '#00FF00';
          break;
        case CELL_TYPES.TARGET:
          char = getTargetChar(target.direction);
          color = '#00FF00';
          break;
      }

      drawChar(char, x, y, color, visibility);
    }
  }
}

function getLampChar(direction) {
  const map = {
    'UP': CELL_CHARS.LAMP_UP,
    'RIGHT': CELL_CHARS.LAMP_RIGHT,
    'DOWN': CELL_CHARS.LAMP_DOWN,
    'LEFT': CELL_CHARS.LAMP_LEFT,
  };
  return map[direction];
}

function getTargetChar(direction) {
  const map = {
    'UP': CELL_CHARS.TARGET_UP,
    'RIGHT': CELL_CHARS.TARGET_RIGHT,
    'DOWN': CELL_CHARS.TARGET_DOWN,
    'LEFT': CELL_CHARS.TARGET_LEFT,
  };
  return map[direction];
}
```
- Off-screen canvas caching (performance optimization):
```js
let baseLayerCanvas = null;
let baseLayerDirty = true;

export function renderMapCached(mapData, visibilityMap) {
  if (baseLayerDirty) {
    baseLayerCanvas = document.createElement('canvas');
    baseLayerCanvas.width = canvas.width;
    baseLayerCanvas.height = canvas.height;
    const offCtx = baseLayerCanvas.getContext('2d');

    // Render to off-screen canvas
    renderMapToContext(offCtx, mapData, visibilityMap);
    baseLayerDirty = false;
  }

  // Composite cached layer onto main canvas
  ctx.drawImage(baseLayerCanvas, 0, 0);
}

export function invalidateBaseLayer() {
  baseLayerDirty = true;
}
```
- Visibility modulation: `drawChar()` již používá opacity parametr, takže stačí předat `visibility`
- Edge case: lampička a cíl na stejné pozici (invalid level) → parser by měl detekovat v Epic 2

---

### Story 3.4: Beam Visualization

**As a** vývojář
**I want to** vykreslit světelný paprsek
**So that** hráč vidí cestu světla gridem

**Acceptance Criteria:**
- [ ] `/src/renderer/beamRenderer.js` existuje a exportuje `renderBeam(beamPath)`
- [ ] `renderBeam()` iteruje přes `beamPath` array (z physics engine) a vykresluje každou buňku
- [ ] Barva paprsku: žlutá `#FFFF00` (jasná, výrazná)
- [ ] Rendering style: option 1 = žlutý background fill celé buňky, option 2 = žlutý znak `·` (tečka)
- [ ] Opacity: 100% (paprsek je vždy plně viditelný, ignoruje visibility system)
- [ ] Rendering layer: paprsek se renderuje NAD mapou ale POD zrcadly (layering order)
- [ ] Animace (optional): subtle glow/pulse efekt (opacity osciluje 0.8 - 1.0)
- [ ] Performance: batch draw všech beam buněk v jednom průchodu (minimize ctx state changes)
- [ ] Dev test: `renderBeam(beamPath)` vykreslí žlutou čáru od lampičky k cíli
- [ ] Visual test: paprsek je jasně viditelný a kontrastní proti černému pozadí

**Technické poznámky:**
- Beam rendering (option 1 - background fill):
```js
import { CELL_WIDTH, CELL_HEIGHT } from '../utils/config.js';

export function renderBeam(beamPath) {
  const ctx = getContext();

  ctx.fillStyle = '#FFFF00';
  ctx.globalAlpha = 0.6;  // Semi-transparent yellow glow

  beamPath.forEach(cell => {
    const pixelX = cell.x * CELL_WIDTH;
    const pixelY = cell.y * CELL_HEIGHT;

    ctx.fillRect(pixelX, pixelY, CELL_WIDTH, CELL_HEIGHT);
  });

  ctx.globalAlpha = 1.0;  // Reset
}
```
- Beam rendering (option 2 - character based):
```js
import { drawChar } from './charRenderer.js';

export function renderBeam(beamPath) {
  beamPath.forEach(cell => {
    drawChar('·', cell.x, cell.y, '#FFFF00', 1.0);
  });
}
```
- Glow animation (optional, pokud máme čas):
```js
let glowPhase = 0;

export function renderBeamAnimated(beamPath, time) {
  glowPhase = (Math.sin(time * 0.005) + 1) / 2;  // Oscillates 0-1
  const opacity = 0.8 + glowPhase * 0.2;  // 0.8 - 1.0

  ctx.globalAlpha = opacity;
  // ... render beam
}
```
- Directional arrows (optional): pro každou beam buňku vykreslit malou šipku ukazující směr (`→`, `↓`, atd.)
- Performance: pokud beamPath má 100+ buněk, batch fillRect calls:
```js
ctx.beginPath();
beamPath.forEach(cell => {
  ctx.rect(cell.x * CELL_WIDTH, cell.y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
});
ctx.fill();
```

---

### Story 3.5: Visibility / Lighting System

**As a** vývojář
**I want to** aplikovat fog of war/lighting efekt
**So that** neprozkoumaná území jsou tmavá a osvětlená místa vyniknou

**Acceptance Criteria:**
- [ ] `/src/renderer/lightingRenderer.js` existuje a exportuje `applyLighting(visibilityMap)`
- [ ] `visibilityMap` (z physics engine) obsahuje hodnoty 0.0 (tmavá), 0.5 (šedá), 1.0 (osvětlená)
- [ ] Osvětlené buňky (1.0): plná barva, žádná modifikace
- [ ] Částečně osvětlené buňky (0.5): šedivé (#808080), nebo 50% alpha mix s černou
- [ ] Tmavé buňky (0.0): černé (#000000), nic se nekreslí
- [ ] Rendering approach: použij `ctx.globalAlpha` při renderování každé buňky (již implementováno v Story 3.3)
- [ ] Alternative approach: vykresli celou mapu, pak overlay dark layer s alpha composite
- [ ] Smooth transitions (optional): když se visibility změní, fade-in efekt (0.0 → 0.5 → 1.0 postupně)
- [ ] Performance: visibility check je fast lookup (`visibilityMap[y][x]`), žádné expensive calculations v render loop
- [ ] Dev test: `applyLighting(visibilityMap)` ztmaví polovinu mapy, druhá půlka je světlá
- [ ] Visual test: když hráč umístí zrcadlo a paprsek osvítí novou oblast, temné buňky se rozsvítí

**Technické poznámky:**
- Lighting je již částečně implementován v `renderMap()` (Story 3.3) pomocí opacity parametru
- Overlay approach (alternative):
```js
export function applyLightingOverlay(visibilityMap) {
  const ctx = getContext();

  // Draw dark overlay everywhere
  ctx.fillStyle = '#000000';

  for (let y = 0; y < visibilityMap.length; y++) {
    for (let x = 0; x < visibilityMap[y].length; x++) {
      const visibility = visibilityMap[y][x];
      const darkness = 1.0 - visibility;  // Inverse

      if (darkness === 0) continue;  // Fully lit, no overlay

      ctx.globalAlpha = darkness;
      ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
    }
  }

  ctx.globalAlpha = 1.0;
}
```
- Fade-in animation:
```js
const visibilityAnimState = {};  // Track animation progress for each cell

export function updateVisibilityAnim(visibilityMap, deltaTime) {
  for (let y = 0; y < visibilityMap.length; y++) {
    for (let x = 0; x < visibilityMap[y].length; x++) {
      const key = `${x},${y}`;
      const targetVis = visibilityMap[y][x];

      if (!visibilityAnimState[key]) {
        visibilityAnimState[key] = 0.0;
      }

      const current = visibilityAnimState[key];
      if (current < targetVis) {
        visibilityAnimState[key] = Math.min(current + deltaTime * 0.002, targetVis);  // Fade in
      }
    }
  }
}
```
- Color mixing pro partial visibility:
```js
function mixColors(color1, color2, t) {
  // Linear interpolation between color1 and color2
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r * t + c2.r * (1 - t));
  const g = Math.round(c1.g * t + c2.g * (1 - t));
  const b = Math.round(c1.b * t + c2.b * (1 - t));

  return rgbToHex(r, g, b);
}
```

---

### Story 3.6: Mirror Visualization

**As a** vývojář
**I want to** vykreslit zrcadla (statická i hráčem umístěná)
**So that** hráč vidí kde jsou zrcadla a jak ovlivňují paprsek

**Acceptance Criteria:**
- [ ] `/src/renderer/mirrorRenderer.js` existuje a exportuje `renderMirrors(mapData, playerMirrors)`
- [ ] `renderMirrors()` vykreslí statická zrcadla z `mapData.cells` (type `MIRROR_SLASH`, `MIRROR_BACKSLASH`)
- [ ] `renderMirrors()` vykreslí hráčem umístěná zrcadla z `playerMirrors` array
- [ ] Znaky: `/` pro slash mirror, `\` pro backslash mirror
- [ ] Barva: bílá `#FFFFFF` (výrazná, kontrastní)
- [ ] Highlight: hráčem umístěná zrcadla mají jinou barvu (např. cyan `#00FFFF`) nebo subtile outline
- [ ] Rendering layer: zrcadla se renderují NAD paprskem (pokrývají žlutý glow)
- [ ] Hover efekt (optional): když hráč najedou myší na zrcadlo, zvýrazni ho (brighter color, glow)
- [ ] Dev test: `renderMirrors(mapData, playerMirrors)` vykreslí všechna zrcadla
- [ ] Visual test: zrcadla jsou na správných pozicích a jsou výrazně viditelná

**Technické poznámky:**
- Mirror rendering:
```js
import { drawChar } from './charRenderer.js';
import { CELL_TYPES, CELL_CHARS } from '../utils/constants.js';

export function renderMirrors(mapData, playerMirrors, visibilityMap) {
  const ctx = getContext();

  // Render static mirrors from map
  for (let y = 0; y < mapData.cells.length; y++) {
    for (let x = 0; x < mapData.cells[y].length; x++) {
      const cell = mapData.cells[y][x];
      const visibility = visibilityMap[y][x];

      if (visibility === 0.0) continue;

      if (cell.type === CELL_TYPES.MIRROR_SLASH) {
        drawChar(CELL_CHARS.MIRROR_SLASH, x, y, '#FFFFFF', visibility);
      } else if (cell.type === CELL_TYPES.MIRROR_BACKSLASH) {
        drawChar(CELL_CHARS.MIRROR_BACKSLASH, x, y, '#FFFFFF', visibility);
      }
    }
  }

  // Render player-placed mirrors
  playerMirrors.forEach(mirror => {
    const visibility = visibilityMap[mirror.y][mirror.x];
    if (visibility === 0.0) return;

    const char = mirror.type === '/' ? CELL_CHARS.MIRROR_SLASH : CELL_CHARS.MIRROR_BACKSLASH;
    const color = '#00FFFF';  // Cyan for player mirrors

    drawChar(char, mirror.x, mirror.y, color, visibility);
  });
}
```
- Hover highlight:
```js
let hoveredMirror = null;

export function setHoveredMirror(x, y) {
  hoveredMirror = { x, y };
}

export function renderMirrorsWithHover(mapData, playerMirrors, visibilityMap) {
  // ... normal rendering ...

  // Highlight hovered mirror
  if (hoveredMirror) {
    const mirror = playerMirrors.find(m => m.x === hoveredMirror.x && m.y === hoveredMirror.y);
    if (mirror) {
      drawChar(mirror.type, mirror.x, mirror.y, '#FFFF00', 1.0);  // Bright yellow
    }
  }
}
```
- Alternative rendering: použít CSS-like box pro zrcadla místo ASCII znaků (rectangles s diagonal lines)
- Edge case: player mirror překrývá static mirror → player mirror má prioritu (renderuje se později)

---

### Story 3.7: Dynamic Rendering Updates

**As a** vývojář
**I want to** trigger re-rendering pouze když se změní game state
**So that** hra běží efektivně a neplýtvám CPU na zbytečné redraws

**Acceptance Criteria:**
- [ ] `/src/renderer/renderLoop.js` existuje a exportuje `startRenderLoop()`, `stopRenderLoop()`, `requestRender()`
- [ ] `startRenderLoop()` spustí `requestAnimationFrame` loop, který volá `render()` každý frame
- [ ] `render()` volá všechny rendering funkce v pořadí: clearCanvas → renderMap → renderBeam → renderMirrors
- [ ] Dirty flag system: `renderNeeded` boolean, nastavený na `true` když se změní game state
- [ ] `requestRender()` nastaví `renderNeeded = true`, aby se příští frame vyrenderoval
- [ ] Pokud `renderNeeded === false`, skip rendering (nic se nezměnilo)
- [ ] Game state listener: `addEventListener('stateChanged', requestRender)` triggernuje re-render
- [ ] Frame time tracking: `console.log('Frame time:', deltaTime, 'ms')` pro performance monitoring
- [ ] Target frame rate: 60 FPS (16.67ms per frame)
- [ ] Dev test: change game state → frame se vyrenderuje → FPS counter ukazuje 60 FPS

**Technické poznámky:**
- Render loop:
```js
import { clearCanvas } from './canvasSetup.js';
import { renderMap } from './mapRenderer.js';
import { renderBeam } from './beamRenderer.js';
import { renderMirrors } from './mirrorRenderer.js';
import { gameState } from '../game/gameState.js';

let renderNeeded = true;
let animationFrameId = null;
let lastFrameTime = 0;

export function startRenderLoop() {
  renderNeeded = true;
  lastFrameTime = performance.now();
  animationFrameId = requestAnimationFrame(renderFrame);
}

function renderFrame(currentTime) {
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  if (renderNeeded) {
    render();
    renderNeeded = false;
  }

  animationFrameId = requestAnimationFrame(renderFrame);
}

function render() {
  const { mapData, beamPath, playerMirrors, visibilityMap } = gameState;

  clearCanvas();
  renderMap(mapData, visibilityMap);
  renderBeam(beamPath);
  renderMirrors(mapData, playerMirrors, visibilityMap);

  // Debug: FPS counter
  // console.log('Rendered frame');
}

export function requestRender() {
  renderNeeded = true;
}

export function stopRenderLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
```
- Game state integration:
```js
// In gameState.js
import { requestRender } from '../renderer/renderLoop.js';

export function updateState() {
  // ... update logic ...
  requestRender();  // Trigger re-render
}
```
- Partial redraws (advanced optimization):
```js
const dirtyRegions = [];

export function markDirty(x, y, width, height) {
  dirtyRegions.push({ x, y, width, height });
}

function renderDirtyRegions() {
  dirtyRegions.forEach(region => {
    // Only redraw this region
    ctx.save();
    ctx.beginPath();
    ctx.rect(region.x, region.y, region.width, region.height);
    ctx.clip();

    render();  // Full render but clipped to region

    ctx.restore();
  });

  dirtyRegions.length = 0;
}
```
- FPS counter (debug overlay):
```js
let frameCount = 0;
let fpsUpdateTime = 0;
let currentFps = 0;

function updateFpsCounter(currentTime) {
  frameCount++;
  if (currentTime - fpsUpdateTime > 1000) {
    currentFps = frameCount;
    frameCount = 0;
    fpsUpdateTime = currentTime;
    console.log('FPS:', currentFps);
  }
}
```

---

### Story 3.8: Target Highlight / Victory State

**As a** vývojář
**I want to** zvýraznit cíl když je osvícen a zobrazit victory animaci
**So that** hráč vidí okamžitý feedback když level dokončí

**Acceptance Criteria:**
- [ ] `/src/renderer/victoryRenderer.js` existuje a exportuje `renderTargetHighlight(target, isLit)`, `renderVictoryAnimation()`
- [ ] `renderTargetHighlight()` vykreslí cíl s glow efektem pokud `isLit === true`
- [ ] Glow efekt: blikající barva (alternuje mezi zelenou `#00FF00` a žlutou `#FFFF00`)
- [ ] Blink rate: 2 Hz (2 bliknutí za sekundu)
- [ ] Victory animation: když `gameState.isComplete === true`, spusť victory screen
- [ ] Victory screen: fade-in overlay s textem "Level Complete!" + stats (moves, time)
- [ ] Victory sound (optional): přehrát victory sound effect (pokud máme audio)
- [ ] Animation duration: 2 sekundy, pak zobrazit "Next Level" button
- [ ] Dev test: umísti správné zrcadlo → cíl začne blikat → victory screen se zobrazí
- [ ] Visual test: blikání je smooth, ne epileptic, text je čitelný

**Technické poznámky:**
- Target highlight:
```js
import { drawChar } from './charRenderer.js';

let blinkPhase = 0;

export function renderTargetHighlight(target, isLit, time) {
  if (!isLit) {
    // Normal rendering (done in renderMap)
    return;
  }

  // Blink effect
  blinkPhase = Math.floor(time / 500) % 2;  // Toggles every 500ms
  const color = blinkPhase === 0 ? '#00FF00' : '#FFFF00';

  const char = getTargetChar(target.direction);
  drawChar(char, target.x, target.y, color, 1.0);

  // Glow effect: draw semi-transparent halo around target
  drawGlow(target.x, target.y, color, 0.3);
}

function drawGlow(x, y, color, intensity) {
  const ctx = getContext();
  const pixelX = x * CELL_WIDTH + CELL_WIDTH / 2;
  const pixelY = y * CELL_HEIGHT + CELL_HEIGHT / 2;

  const gradient = ctx.createRadialGradient(pixelX, pixelY, 0, pixelX, pixelY, CELL_WIDTH * 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.globalAlpha = intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(
    (x - 1) * CELL_WIDTH,
    (y - 1) * CELL_HEIGHT,
    CELL_WIDTH * 3,
    CELL_HEIGHT * 3
  );
  ctx.globalAlpha = 1.0;
}
```
- Victory screen:
```js
let victoryAnimProgress = 0;
let victoryAnimStartTime = 0;

export function renderVictoryAnimation(currentTime) {
  if (victoryAnimStartTime === 0) {
    victoryAnimStartTime = currentTime;
  }

  victoryAnimProgress = (currentTime - victoryAnimStartTime) / 2000;  // 2 second duration

  const ctx = getContext();
  const alpha = Math.min(victoryAnimProgress, 1.0);

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.globalAlpha = alpha;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Victory text
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);

  // Stats
  ctx.font = '24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Moves: ${gameState.stats.moves}`, canvas.width / 2, canvas.height / 2 + 60);
  ctx.fillText(`Time: ${formatTime(gameState.stats.time)}`, canvas.width / 2, canvas.height / 2 + 90);

  ctx.globalAlpha = 1.0;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```
- Victory trigger:
```js
// In renderLoop.js
function render() {
  // ... normal rendering ...

  if (gameState.isComplete) {
    renderVictoryAnimation(performance.now());
  }
}
```

---

### Story 3.9: Fog of War (Darkness Effect)

**As a** vývojář
**I want to** mít atmosférický dark fog efekt
**So that** hra má temnou atmosféru a prozkoumaná území vyniknou

**Acceptance Criteria:**
- [ ] Černé pozadí (`#000000`) je default pro celý canvas
- [ ] Neprozkoumaná území (visibility 0.0) zůstávají černá - nic se nekreslí
- [ ] Osvětlená území (visibility 1.0) mají plnou barvu znaků
- [ ] Částečně osvětlená území (visibility 0.5) mají šedivou barvu nebo sníženou opacity
- [ ] Gradual reveal efekt: když hráč umístí zrcadlo a paprsek osvítí novou oblast, tmavé buňky postupně fade-in (0.0 → 0.5 → 1.0 během 500ms)
- [ ] Smooth transitions: žádné náhlé blikání, plynulý přechod
- [ ] Atmospheric feeling: hra je temná, světlo je vzácné, paprsek je jedinou cestou jak prozkoumat jeskyni
- [ ] Vignette efekt (optional): tmavší okraje canvasu (radial gradient overlay)
- [ ] Dev test: načti level → většina mapy je černá, jen lampička a její okolí je viditelné
- [ ] Visual test: umísti zrcadlo → nová oblast se postupně rozsvítí (fade-in efekt)

**Technické poznámky:**
- Fog of war je již částečně implementován v Story 3.3 (opacity modulace) a Story 3.5 (lighting system)
- Fade-in animation (z Story 3.5):
```js
// In renderLoop.js
const visibilityAnimState = new Map();

function updateVisibilityAnimation(visibilityMap, deltaTime) {
  for (let y = 0; y < visibilityMap.length; y++) {
    for (let x = 0; x < visibilityMap[y].length; x++) {
      const key = `${x},${y}`;
      const targetVis = visibilityMap[y][x];

      let currentVis = visibilityAnimState.get(key) || 0.0;

      if (currentVis < targetVis) {
        currentVis = Math.min(currentVis + deltaTime * 0.002, targetVis);
        visibilityAnimState.set(key, currentVis);
      } else if (currentVis > targetVis) {
        // Fade out (když paprsek zmizí)
        currentVis = Math.max(currentVis - deltaTime * 0.001, targetVis);
        visibilityAnimState.set(key, currentVis);
      }
    }
  }

  return visibilityAnimState;
}

function render() {
  const animatedVisibility = updateVisibilityAnimation(gameState.visibilityMap, deltaTime);

  clearCanvas();
  renderMap(mapData, animatedVisibility);  // Use animated visibility
  // ...
}
```
- Vignette overlay (atmospheric effect):
```js
export function renderVignette() {
  const ctx = getContext();
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.max(canvas.width, canvas.height) * 0.7;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```
- Particle effects (advanced, optional): jemné floating particles (dust) v osvětlených oblastech pro depth

---

### Story 3.10: Performance & Optimization

**As a** vývojář
**I want to** optimalizovat rendering engine pro 60 FPS
**So that** hra běží plynule i na velkých mapách a starších zařízeních

**Acceptance Criteria:**
- [ ] Performance profiling: měř čas každé rendering funkce (`console.time`/`timeEnd`)
- [ ] Benchmark: level 50×50 s 10 zrcadly → render frame < 16ms (60 FPS)
- [ ] Benchmark: level 100×100 s 20 zrcadly → render frame < 16ms
- [ ] Caching: base layer (mapa) se cachuje do off-screen canvas, composite na main canvas
- [ ] Dirty regions: pouze změněné oblasti se překreslí (beam path change, mirror placement)
- [ ] Batch rendering: minimize ctx property changes - seskup drawChar calls se stejnou barvou
- [ ] Font rendering optimization: použij pre-rendered sprite atlas pro ASCII znaky (advanced)
- [ ] Memory profiling: renderer nealokuje nové objekty v hot loopech
- [ ] FPS counter: zobraz FPS v debug overlay (top-right corner)
- [ ] Performance report: `npm run benchmark:render` spustí rendering benchmarks

**Technické poznámky:**
- Profiling:
```js
function render() {
  console.time('renderFrame');

  console.time('clearCanvas');
  clearCanvas();
  console.timeEnd('clearCanvas');

  console.time('renderMap');
  renderMap(mapData, visibilityMap);
  console.timeEnd('renderMap');

  console.time('renderBeam');
  renderBeam(beamPath);
  console.timeEnd('renderBeam');

  console.time('renderMirrors');
  renderMirrors(mapData, playerMirrors, visibilityMap);
  console.timeEnd('renderMirrors');

  console.timeEnd('renderFrame');
}
```
- Off-screen canvas caching (již zmíněno v Story 3.3):
```js
let baseLayerCanvas = null;
let baseLayerDirty = true;

export function renderMapCached(mapData, visibilityMap) {
  if (baseLayerDirty) {
    baseLayerCanvas = document.createElement('canvas');
    baseLayerCanvas.width = canvas.width;
    baseLayerCanvas.height = canvas.height;
    const offCtx = baseLayerCanvas.getContext('2d');

    renderMapToContext(offCtx, mapData, visibilityMap);
    baseLayerDirty = false;
  }

  ctx.drawImage(baseLayerCanvas, 0, 0);
}
```
- Batch rendering:
```js
// Group chars by color to minimize fillStyle changes
const charsByColor = new Map();

mapData.cells.forEach((row, y) => {
  row.forEach((cell, x) => {
    const color = getCellColor(cell);
    if (!charsByColor.has(color)) {
      charsByColor.set(color, []);
    }
    charsByColor.get(color).push({ char: cell.char, x, y });
  });
});

// Render all chars of same color in batch
charsByColor.forEach((chars, color) => {
  ctx.fillStyle = color;
  chars.forEach(({ char, x, y }) => {
    ctx.fillText(char, x * CELL_WIDTH, y * CELL_HEIGHT);
  });
});
```
- Sprite atlas (advanced optimization):
```js
// Pre-render all ASCII chars to sprite atlas (1 time cost)
const spriteAtlas = document.createElement('canvas');
spriteAtlas.width = 16 * 16;  // 16x16 grid of chars
spriteAtlas.height = 16 * 20;
const atlasCtx = spriteAtlas.getContext('2d');

// Render chars to atlas
CELL_CHARS.forEach((char, index) => {
  const x = (index % 16) * 16;
  const y = Math.floor(index / 16) * 20;
  atlasCtx.fillText(char, x, y);
});

// In render loop: use drawImage instead of fillText
function drawCharFromAtlas(char, x, y) {
  const charCode = char.charCodeAt(0);
  const srcX = (charCode % 16) * 16;
  const srcY = Math.floor(charCode / 16) * 20;

  ctx.drawImage(
    spriteAtlas,
    srcX, srcY, 16, 20,  // Source rect
    x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT  // Dest rect
  );
}
```
- Memory optimization:
```js
// Reuse objects instead of creating new ones
const reusableCell = { x: 0, y: 0 };

beamPath.forEach(cell => {
  reusableCell.x = cell.x;
  reusableCell.y = cell.y;
  renderBeamCell(reusableCell);
});
```
- FPS debug overlay:
```js
export function renderDebugOverlay(fps) {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`FPS: ${fps}`, canvas.width - 10, 20);
}
```

---

## Definition of Done

- [ ] Všechny stories (3.1 - 3.10) splněny a otestovány
- [ ] Canvas element je inicializován, resize handling funguje
- [ ] Frame rate management: stabilních 60 FPS na mid-range hardware
- [ ] ASCII character rendering: všechny znaky (█▲►▼◄△▷▽◁/\) jsou pixel-perfect zarovnané
- [ ] Map base layer: zdi, lampičky, cíle se správně renderují s odpovídajícími barvami
- [ ] Beam visualization: žlutý paprsek je jasně viditelný a správně zarovnaný s gridem
- [ ] Visibility/lighting system: osvětlené (1.0), částečně osvětlené (0.5), tmavé (0.0) buňky jsou vizuálně odlišené
- [ ] Mirror visualization: statická i hráčem umístěná zrcadla jsou výrazně viditelná
- [ ] Dynamic rendering updates: re-render se spouští pouze při změně game state (dirty flags fungují)
- [ ] Target highlight: cíl blikne/zazáří když je správně osvícen
- [ ] Victory animation: smooth fade-in overlay s "Level Complete!" textem a stats
- [ ] Fog of war: černé pozadí, gradual reveal efekt při osvětlení nových oblastí (fade-in animation)
- [ ] Performance: render frame < 16ms i na 100×100 gridech (60 FPS maintained)
- [ ] Off-screen canvas caching: base layer se cachuje a composite na main canvas
- [ ] Visual testing: hra je čitelná, znaky jsou ostré, barvy jsou kontrastní, atmosféra je temná a atmospheric
- [ ] Cross-browser testing: rendering funguje v Chrome, Firefox, Safari, Edge
- [ ] Responsive: canvas se adjustuje při window resize, grid layout zůstává konzistentní
- [ ] Console test: `initCanvas('gameCanvas')` → `startRenderLoop()` → hra se zobrazí a běží na 60 FPS
- [ ] Integration s Epic 2: physics engine data (mapData, beamPath, visibilityMap) se správně renderují
- [ ] Code review: rendering kód je čitelný, well-structured, s performance komentáři
- [ ] Dokumentace: rendering architecture dokument (layer system, caching strategy) (optional)

## Odhad

**6-8 dní** (1 vývojář, full-time)

**Breakdown:**
- Story 3.1 (Canvas Setup): 0.5 dne (initialization, resize handling, config)
- Story 3.2 (ASCII Character Rendering): 1 den (font setup, drawChar funkce, alignment testing)
- Story 3.3 (Map Base Layer): 1 den (renderMap loop, color mapping, visibility integration)
- Story 3.4 (Beam Visualization): 0.5 dne (žlutý glow rendering, path iteration)
- Story 3.5 (Lighting System): 1 den (opacity modulation, fog of war, fade-in animation)
- Story 3.6 (Mirror Visualization): 0.5 dne (static + player mirrors, highlight effects)
- Story 3.7 (Dynamic Rendering): 1 den (render loop, dirty flags, requestAnimationFrame, FPS tracking)
- Story 3.8 (Target Highlight/Victory): 1 den (blink effect, glow, victory screen, animation)
- Story 3.9 (Fog of War Atmosphere): 0.5 dne (gradual reveal, vignette, polish)
- Story 3.10 (Performance Optimization): 1.5 dne (profiling, caching, batching, benchmarks)
- Buffer: 1 den (visual polish, bug fixes, edge cases)

**Risks:**
- **Font rendering inconsistency**: Různé browsery renderují monospace fonty mírně odlišně (sub-pixel differences). Mitigace: disable anti-aliasing (`ctx.imageSmoothingEnabled = false`), test v multiple browsers
- **Performance na velkých mapách**: Rendering 100×100 gridů může být pomalý na starších zařízeních. Mitigace: aggressive caching, dirty regions, sprite atlas optimization
- **ASCII character support**: Ne všechny znaky (▲►▼◄△▷▽◁) jsou dostupné ve všech fontech. Mitigace: fallback font stack, test v multiple OS (Windows, macOS, Linux)
- **Animation smoothness**: Fade-in/blink efekty mohou vypadat choppy pokud delta time není správně tracked. Mitigace: use `performance.now()`, interpolate animations properly
- **Canvas context loss**: Na mobilních zařízeních může browser context zbavit při memory pressure. Mitigace: listen pro `webglcontextlost` event, re-initialize canvas

**Závislosti:**
- Epic 2 MUSÍ být hotový (physics engine poskytuje mapData, beamPath, visibilityMap, gameState)
- HTML soubor s Canvas elementem (`<canvas id="gameCanvas"></canvas>`)
- Config file s visual constants (cell size, colors, font settings) z Epic 1

**Milestone po Epic 3:**
Hra je poprvé VIDITELNÁ a HRATELNÁ - hráč vidí mapu, lampičku, paprsek cestující gridem, zrcadla, osvětlené oblasti, fog of war atmosféru. Když umístí zrcadlo (zatím jen programově, Epic 4 přidá mouse input), paprsek se odrazí a osvítí nové oblasti. Victory screen se zobrazí při dokončení levelu. **Hra má oči (rendering), mozek (physics), ale ještě nemá ruce (full input interaction - Epic 4).**

---

## Technický Přehled: Rendering Architecture

### Layer System
```
┌──────────────────────────────────┐
│  Canvas (1200×800px)              │
│                                    │
│  Layer 1: Background (black)      │
│  Layer 2: Map (walls, lamp, target)│
│  Layer 3: Beam (yellow glow)      │
│  Layer 4: Mirrors (player-placed) │
│  Layer 5: Lighting (fog overlay)  │
│  Layer 6: UI (victory screen)     │
└──────────────────────────────────┘
```

### Rendering Pipeline
```
gameState change → requestRender() → renderNeeded = true
  ↓
requestAnimationFrame → render()
  ↓
clearCanvas() → black background
  ↓
renderMap() → walls, lamp, target (cached)
  ↓
renderBeam() → yellow glow overlay
  ↓
renderMirrors() → static + player mirrors
  ↓
applyLighting() → visibility modulation
  ↓
renderVictoryAnimation() (if complete)
  ↓
renderDebugOverlay() (FPS counter)
```

### Color Palette
```js
export const COLORS = {
  BACKGROUND: '#000000',      // Black (dark caves)
  WALL: '#FFFFFF',            // White (solid rock)
  LAMP: '#00FF00',            // Green (light source)
  TARGET: '#00FF00',          // Green (goal)
  BEAM: '#FFFF00',            // Yellow (light beam)
  MIRROR_STATIC: '#FFFFFF',   // White (fixed mirrors)
  MIRROR_PLAYER: '#00FFFF',   // Cyan (player-placed)
  FOG_PARTIAL: '#808080',     // Gray (50% visibility)
  VICTORY: '#FFFF00',         // Yellow (completion)
};
```

### Performance Targets
```
Map Size    | Target Frame Time | FPS
------------|-------------------|-----
20×20       | < 5ms             | 200+
50×50       | < 10ms            | 100+
100×100     | < 16ms            | 60
```

### Optimization Strategies
1. **Off-screen canvas caching**: Base layer (walls) rendered once, composited every frame
2. **Dirty region tracking**: Only redraw cells that changed (beam path, new mirror)
3. **Batch rendering**: Group characters by color, minimize ctx state changes
4. **Sprite atlas**: Pre-render ASCII chars, use drawImage instead of fillText (advanced)
5. **Visibility culling**: Don't render cells with 0.0 visibility (darkness)
6. **requestAnimationFrame**: Native browser frame rate management (60 FPS)
7. **Memory reuse**: Avoid object allocation in render loops (reuse buffers)

### Visual Effects
- **Beam glow**: Semi-transparent yellow overlay (opacity 0.6)
- **Target blink**: Alternating green/yellow at 2 Hz when lit
- **Fog of war**: Gradual fade-in (0.0 → 1.0 over 500ms) when area becomes lit
- **Victory overlay**: Dark fade-in (70% black) with yellow text
- **Vignette**: Radial gradient darkening canvas edges (atmospheric)
- **Glow halos**: Radial gradient around lit target (optional polish)

### ASCII Character Set
```
█ - Wall (solid block)
. - Empty cell (optional faint dot)
▲►▼◄ - Lamp (directional arrows)
△▷▽◁ - Target (outline arrows)
/ \ - Mirrors (slash/backslash)
· - Beam path (subtle dot, optional)
```

### Font Configuration
```js
export const FONT_CONFIG = {
  family: 'Courier New, monospace',
  size: 16,  // px
  weight: 'normal',  // or 'bold'
  baseline: 'top',
  align: 'left',
};

export const CELL_CONFIG = {
  width: 16,   // px (matches font size)
  height: 20,  // px (1.25 aspect ratio for better vertical spacing)
};
```

---

## Ukázkový Render Output

```
████████████████████████████
█..........................█
█..◄.......................█  ← Lampička (zelená)
█..····....................█  ← Paprsek (žlutý)
█..····....................█
█..····....................█
█..···············/········█  ← Zrcadlo (bílé)
█..···············▽········█  ← Cíl (zelený, blikající)
████████████████████████████

Legenda:
- Černé pozadí = neprozkoumaná území (fog of war)
- Šedé znaky = částečně osvětlené (50% jas)
- Bílé/barevné znaky = plně osvětlené (100% jas)
- Žlutý glow = cesta paprsku
```
