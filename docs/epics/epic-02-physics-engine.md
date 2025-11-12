# Epic 2: Core Physics Engine

## Popis

Epic 2 implementuje srdce celé hry - **fyzikální engine pro šíření světelného paprsku**. Tento epic přeměňuje statickou mapu znaků na dynamický interaktivní systém, kde paprsek světla cestuje gridem, odráží se od zrcadel a osvětluje okolí. Bez tohoto epicu hra nemá žádnou logiku - je to jen černý canvas s ASCII znaky.

Fyzikální engine musí být **100% deterministický** - stejné rozmístění zrcadel musí vždy produkovat stejnou cestu paprsku. To je kritické pro puzzle design a pro to, aby byli hráči schopni plánovat řešení. Engine musí také být dostatečně rychlý - výpočet cesty paprsku musí proběhnout instantně (< 5ms) i na velkých mapách, protože se spouští při každé interakci (umístění/rotace zrcadla).

Klíčovou součástí je **reflexní tabulka z Epic 1** (`constants.js`), která definuje jak se paprsek odráží od zrcadel. Epic 2 tuto tabulku intenzivně používá v každém kroku propagace paprsku. Dále implementujeme **game state management** - centrální objekt, který drží aktuální stav levelu (pozice zrcadel, cesta paprsku, completion status). Tento state bude renderován v Epic 3 a manipulován input handlery v Epic 4.

Důležitým aspektem je **visibility system** (fog of war) - označení, která políčka jsou osvětlena paprskem (100% jas), která jsou v šedé zóně vedlejším světlem (50% jas) a která zůstávají ve tmě (0% jas). Toto vytváří atmosféru a je klíčové pro gameplay - hráč vidí jen osvětlené části mapy.

## Cíle

- [ ] Interní reprezentace levelu (data model) - parsing z string formátu do strukturovaného objektu
- [ ] Beam propagation algoritmus - šíření paprsku step-by-step po gridu od lampičky
- [ ] Reflexní logika - lookup funkce s reflexní tabulkou, correct handling všech 8 kombinací (2 zrcadla × 4 směry)
- [ ] Kompletní beam path calculation s infinite loop detection (max 100 kroků)
- [ ] Target detection - detekce kdy je cíl správně osvícen (correct direction + 100% intensity)
- [ ] Visibility/fog of war system - označení osvětlených, částečně osvětlených a tmavých buněk
- [ ] Game state management - centrální state objekt, update triggery, invalidation cache při změně
- [ ] Performance optimalizace - caching beam path, lazy recalculation, profilování
- [ ] Komprehensivní testování - unit testy pro reflexní logiku, integration testy pro kompletní levely, edge cases
- [ ] Error handling - graceful handling infinite loops, out-of-bounds paprsků, missing data

## Stories

### Story 2.1: Level Data Model

**As a** vývojář
**I want to** mít interní reprezentaci levelu v memory
**So that** můžu snadno přistupovat k buňkám gridu, detekovat kolize a manipulovat se stavem

**Acceptance Criteria:**
- [ ] `/src/game/levelParser.js` existuje a exportuje funkci `parseLevel(levelString)`
- [ ] `parseLevel()` přijímá multi-line string (TXT formát) a vrací `mapData` objekt
- [ ] `mapData` struktura: `{ width: number, height: number, cells: Array<Array<Cell>>, lamp: {x, y, direction}, target: {x, y, direction} }`
- [ ] `Cell` objekt: `{ type: string, x: number, y: number, content: string }`
- [ ] Cell type enum: `CELL_TYPES = { WALL: 'wall', EMPTY: 'empty', LAMP: 'lamp', TARGET: 'target', MIRROR_SLASH: 'mirror_slash', MIRROR_BACKSLASH: 'mirror_backslash' }`
- [ ] Parser detekuje lampičku (▲►▼◄) a ukládá její pozici + směr do `lamp` property
- [ ] Parser detekuje target (△▷▽◁) a ukládá jeho pozici + směr do `target` property
- [ ] Parser validuje level: musí existovat přesně 1 lampička a přesně 1 target, jinak throw error
- [ ] ASCII mapping: '█' → WALL, '.' → EMPTY, '/' → MIRROR_SLASH, '\\' → MIRROR_BACKSLASH
- [ ] Getter funkce: `getCell(x, y)` vrací Cell nebo null pokud out-of-bounds
- [ ] Dev test: parse ukázkový level → `console.log(mapData)` vypíše správnou strukturu

**Technické poznámky:**
- String parsing: `levelString.split('\n')` → iteruj přes řádky → iteruj přes znaky
- 2D array indexing: `cells[y][x]` (row-first, pak column)
- Direction mapping lampička: '▲' → 'UP', '►' → 'RIGHT', '▼' → 'DOWN', '◄' → 'LEFT'
- Direction mapping target: '△' → 'UP', '▷' → 'RIGHT', '▽' → 'DOWN', '◁' → 'LEFT'
- Validace: `if (lampCount !== 1 || targetCount !== 1) throw new Error('Invalid level: must have exactly 1 lamp and 1 target')`
- Edge case: prázdné řádky na konci souboru → trim whitespace
- Performance: pro velké mapy (100×100), parsing by měl trvat < 10ms

**Ukázkový level string:**
```
█████████
█.......█
█.◄.....█
█...../█
█.....\██
█......△█
█████████
```

**Výsledný mapData:**
```js
{
  width: 9,
  height: 7,
  cells: [[...], [...], ...],  // 2D array of Cell objects
  lamp: { x: 2, y: 2, direction: 'LEFT' },
  target: { x: 7, y: 5, direction: 'RIGHT' }
}
```

---

### Story 2.2: Beam Propagation Engine

**As a** vývojář
**I want to** mít algoritmus pro šíření paprsku po mapě
**So that** můžu vypočítat cestu paprsku od lampičky step-by-step

**Acceptance Criteria:**
- [ ] `/src/game/beamEngine.js` existuje a exportuje funkci `propagateBeam(mapData, mirrors)`
- [ ] `propagateBeam()` přijímá `mapData` (z parseru) a `mirrors` array (hráčem umístěná zrcadla)
- [ ] Algoritmus začíná na pozici lampičky s jejím směrem (např. `{x: 2, y: 2, direction: 'LEFT'}`)
- [ ] Step-by-step: každý krok posune paprsek o 1 buňku v aktuálním směru (`x += dx, y += dy`)
- [ ] Collision detection: pokud paprsek narazí na `WALL`, stop propagation
- [ ] Collision detection: pokud paprsek narazí na `MIRROR`, zatím stop (reflexe přidáme v Story 2.3)
- [ ] Out-of-bounds check: pokud paprsek vyjede mimo grid, stop propagation
- [ ] Return value: array of `beamPath` - všechny navštívené buňky: `[{x, y, direction}, {x, y, direction}, ...]`
- [ ] Infinite loop detection: max 100 kroků, pak force stop (prevent infinite loops)
- [ ] Unit test: přímý paprsek bez zrcadel projde prázdným gridem až k cíli
- [ ] Dev test: `console.log(beamPath.length)` vypíše počet navštívených buněk

**Technické poznámky:**
- Direction vectors z constants.js: `DIRECTIONS.UP = {dx: 0, dy: -1}`, atd.
- Step loop:
```js
let currentPos = { x: lamp.x, y: lamp.y };
let currentDir = lamp.direction;
const path = [];

for (let step = 0; step < MAX_STEPS; step++) {
  const { dx, dy } = DIRECTIONS[currentDir];
  currentPos.x += dx;
  currentPos.y += dy;

  const cell = getCell(currentPos.x, currentPos.y);
  if (!cell || cell.type === CELL_TYPES.WALL) break;

  path.push({ x: currentPos.x, y: currentPos.y, direction: currentDir });

  // Mirror check (Story 2.3)
}

return path;
```
- MAX_STEPS konstanta: 100 (dostatečné i pro velké mapy s mnoha zrcadly)
- Edge case: lampička směřuje do zdi → path je prázdný array
- Edge case: lampička na okraji mapy → okamžitě out-of-bounds → path je prázdný

---

### Story 2.3: Mirror Reflection Logic

**As a** vývojář
**I want to** aplikovat reflexní tabulku z constants.js
**So that** paprsek se správně odráží od zrcadel

**Acceptance Criteria:**
- [ ] `/src/game/beamEngine.js` obsahuje funkci `reflect(direction, mirrorType)`
- [ ] `reflect()` přijímá current direction ('UP', 'DOWN', 'LEFT', 'RIGHT') a mirror type ('/', '\\')
- [ ] Funkce lookupuje v `REFLECTION_TABLE[mirrorType][direction]` a vrací nový směr
- [ ] Všech 8 kombinací je správně implementováno (viz Epic 1, Story 1.4 pro přesnou tabulku)
- [ ] Unit test pro každou kombinaci: `reflect('RIGHT', '/') === 'UP'`, `reflect('LEFT', '/') === 'DOWN'`, atd.
- [ ] Unit test: invalid input (neexistující směr nebo mirror) → throw error s clear message
- [ ] Integration: `propagateBeam()` volá `reflect()` když paprsek narazí na zrcadlo
- [ ] Paprsek pokračuje v novém směru po reflexi (nestaví se na zrcadle)
- [ ] Dev test: level s jedním zrcadlem '/' → paprsek se správně odrazí
- [ ] Console output: `console.log('Reflection:', oldDir, '->', newDir)` pro debugging

**Technické poznámky:**
- Import reflexní tabulky: `import { REFLECTION_TABLE } from '../utils/constants.js'`
- Lookup function:
```js
export function reflect(direction, mirrorType) {
  if (!REFLECTION_TABLE[mirrorType]) {
    throw new Error(`Invalid mirror type: ${mirrorType}`);
  }
  if (!REFLECTION_TABLE[mirrorType][direction]) {
    throw new Error(`Invalid direction: ${direction} for mirror ${mirrorType}`);
  }
  return REFLECTION_TABLE[mirrorType][direction];
}
```
- Integration do propagateBeam():
```js
if (cell.type === CELL_TYPES.MIRROR_SLASH || cell.type === CELL_TYPES.MIRROR_BACKSLASH) {
  const mirrorChar = cell.type === CELL_TYPES.MIRROR_SLASH ? '/' : '\\';
  currentDir = reflect(currentDir, mirrorChar);
  // Continue propagation in new direction
}
```
- Edge case: paprsek narazí na zrcadlo z "nesprávné" strany → stále se odrazí podle tabulky (physics je konzistentní)
- Performance: lookup je O(1) díky object hash table

**Unit test examples:**
```js
// Test all 8 combinations
assert(reflect('RIGHT', '/') === 'UP');
assert(reflect('LEFT', '/') === 'DOWN');
assert(reflect('DOWN', '/') === 'LEFT');
assert(reflect('UP', '/') === 'RIGHT');

assert(reflect('RIGHT', '\\') === 'DOWN');
assert(reflect('LEFT', '\\') === 'UP');
assert(reflect('DOWN', '\\') === 'RIGHT');
assert(reflect('UP', '\\') === 'LEFT');
```

---

### Story 2.4: Beam Path Calculation

**As a** vývojář
**I want to** kompletní výpočet cesty paprsku s reflexemi
**So that** můžu určit všechny osvětlené buňky a detekovat dokončení levelu

**Acceptance Criteria:**
- [ ] `propagateBeam()` nyní plně funguje s reflexemi (integrace Story 2.2 + 2.3)
- [ ] Return value: `beamPath` array obsahuje všechny navštívené buňky včetně směru po každé reflexi
- [ ] Infinite loop detection: pokud paprsek navštíví stejnou buňku se stejným směrem dvakrát, stop propagation
- [ ] Loop detection tracking: `visited` Set obsahující string keys `"x,y,dir"` (např. `"5,3,LEFT"`)
- [ ] Caching: `beamPath` se cachuje v game state, nepočítá se při každém renderu
- [ ] Cache invalidation: když hráč umístí/odstraní/rotuje zrcadlo, cache se smaže
- [ ] Unit test: level s 2 zrcadly → paprsek se odrazí dvakrát a dorazí k cíli
- [ ] Unit test: level s infinite loop (2 zrcadla odrážejí paprsek tam a zpět) → propagation se zastaví po N krocích
- [ ] Performance test: level 50×50 s 10 zrcadly → výpočet trvá < 5ms
- [ ] Dev test: `console.log(beamPath)` vypíše kompletní cestu s reflexemi

**Technické poznámky:**
- Visited tracking:
```js
const visited = new Set();
const key = `${currentPos.x},${currentPos.y},${currentDir}`;
if (visited.has(key)) {
  console.warn('Infinite loop detected, stopping propagation');
  break;
}
visited.add(key);
```
- Mirrors array format: `[{ x: number, y: number, type: '/' | '\\' }, ...]`
- Mirror lookup: před collision check s mapData, check jestli na current pozici je hráčem umístěné zrcadlo
- Merge mirrors: `const allMirrors = [...mapData.staticMirrors, ...playerMirrors]` (staticMirrors z levelu, playerMirrors od hráče)
- Cache implementation: `let cachedBeamPath = null; let cacheValid = false;`
- Cache check:
```js
export function calculateBeamPath(mapData, mirrors, forceRecalc = false) {
  if (cacheValid && !forceRecalc) return cachedBeamPath;

  cachedBeamPath = propagateBeam(mapData, mirrors);
  cacheValid = true;
  return cachedBeamPath;
}

export function invalidateCache() {
  cacheValid = false;
}
```
- Edge case: lampička je obklopená zdmi → beamPath je prázdný, level je unsolvable (není error, jen nelze vyřešit)

**Integration example:**
```js
const mapData = parseLevel(levelString);
const playerMirrors = [{ x: 5, y: 3, type: '/' }];
const beamPath = calculateBeamPath(mapData, playerMirrors);
console.log(`Beam traveled ${beamPath.length} cells`);
```

---

### Story 2.5: Target Detection

**As a** vývojář
**I want to** detekovat kdy je cíl správně osvícen
**So that** můžu označit level jako completed a spustit victory screen

**Acceptance Criteria:**
- [ ] `/src/game/targetDetection.js` existuje a exportuje funkci `isTargetLit(mapData, beamPath)`
- [ ] `isTargetLit()` přijímá `mapData` (obsahuje target pozici + směr) a `beamPath` (z beam engine)
- [ ] Check 1: paprsek musí projít targetovou buňkou (target.x, target.y musí být v beamPath)
- [ ] Check 2: paprsek musí mít správný směr na targetové buňce (target.direction === beam.direction v této buňce)
- [ ] Check 3: intenzita světla na targetu musí být 100% (prozatím vždy true, intensity přidáme později)
- [ ] Return value: boolean `true` pokud všechny checks projdou, jinak `false`
- [ ] Unit test: paprsek dorazí k targetu se správným směrem → `isTargetLit() === true`
- [ ] Unit test: paprsek dorazí k targetu se špatným směrem (např. zdola místo zprava) → `isTargetLit() === false`
- [ ] Unit test: paprsek nedorazí k targetu (zastaví se dřív) → `isTargetLit() === false`
- [ ] Integration: `calculateBeamPath()` nyní vrací `{ path, isComplete }` (isComplete z target detection)
- [ ] Dev test: vyřeš level s jedním zrcadlem → console vypíše "Level complete!"

**Technické poznámky:**
- Target lookup v beamPath:
```js
export function isTargetLit(mapData, beamPath) {
  const target = mapData.target;

  // Find target cell in beam path
  const targetCell = beamPath.find(cell => cell.x === target.x && cell.y === target.y);

  if (!targetCell) return false;  // Beam doesn't reach target

  // Check direction match
  if (targetCell.direction !== target.direction) return false;

  // TODO: Check intensity (Story 2.6)

  return true;
}
```
- Direction semantics: target direction je směr, ODKUD paprsek musí přijít
  - Target '▷' (RIGHT) = paprsek musí přijít zleva (direction 'RIGHT')
  - Target '△' (UP) = paprsek musí přijít zespodu (direction 'UP')
- Edge case: target je na pozici lampičky → depends on design, prozatím považujeme za invalid level
- Edge case: více paprsků projde targetem (pokud implementujeme multiple beams later) → stačí 1 se správným směrem
- Integration example:
```js
const beamPath = calculateBeamPath(mapData, mirrors);
const isComplete = isTargetLit(mapData, beamPath);

if (isComplete) {
  console.log('🎉 Level complete!');
  triggerVictoryScreen();
}
```

---

### Story 2.6: Visibility / Fog of War System

**As a** vývojář
**I want to** označit která políčka jsou osvětlena
**So that** můžu renderovat fog of war a vytvořit atmosféru

**Acceptance Criteria:**
- [ ] `/src/game/visibility.js` existuje a exportuje funkci `calculateVisibility(mapData, beamPath)`
- [ ] `calculateVisibility()` vrací `visibilityMap` - 2D array s intenzitami světla pro každou buňku
- [ ] Intenzita: `1.0` = plně osvětlená (paprsek prochází buňkou), `0.5` = částečně osvětlená (vedlejší buňka), `0.0` = tmavá
- [ ] Plně osvětlené buňky: všechny buňky v `beamPath`
- [ ] Částečně osvětlené buňky: všechny sousední buňky (orthogonal, ne diagonal) k osvětleným buňkám
- [ ] Tmavé buňky: všechny ostatní
- [ ] `visibilityMap[y][x]` vrací number (0.0, 0.5, nebo 1.0)
- [ ] Unit test: přímý paprsek 5 buněk dlouhý → 5 buněk má 1.0, jejich sousedé mají 0.5, zbytek 0.0
- [ ] Unit test: lampička obklopená zdmi → pouze lampička má 1.0, zbytek 0.0
- [ ] Performance: výpočet pro 100×100 grid trvá < 2ms
- [ ] Dev test: `console.table(visibilityMap)` vypíše 2D grid intenzit

**Technické poznámky:**
- Inicializace: `const visibilityMap = Array(height).fill(0).map(() => Array(width).fill(0.0));`
- Mark primary lit cells:
```js
beamPath.forEach(cell => {
  visibilityMap[cell.y][cell.x] = 1.0;
});
```
- Mark adjacent cells (secondary light):
```js
const ADJACENT_OFFSETS = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];

beamPath.forEach(cell => {
  ADJACENT_OFFSETS.forEach(offset => {
    const adjX = cell.x + offset.dx;
    const adjY = cell.y + offset.dy;

    if (isInBounds(adjX, adjY) && visibilityMap[adjY][adjX] < 0.5) {
      visibilityMap[adjY][adjX] = 0.5;
    }
  });
});
```
- Priorita: pokud buňka je v beamPath (1.0) a zároveň adjacent (0.5), priority má 1.0
- Walls: i zdi mohou být osvětlené (pokud paprsek narazí) → renderer je zobrazí světlejší
- Edge case: adjacent buňka je wall → stále dostane 0.5 (světlo osvětluje i zeď)
- Rendering hook: renderer použije `visibilityMap` pro alpha compositing nebo color mixing

**Použití v rendereru (Epic 3):**
```js
const intensity = visibilityMap[y][x];
ctx.fillStyle = mixColors(cellColor, FOG_COLOR, intensity);
// intensity 1.0 = full cellColor
// intensity 0.5 = 50% mix
// intensity 0.0 = full FOG_COLOR (dark)
```

---

### Story 2.7: Game State Management

**As a** vývojář
**I want to** mít centrální game state objekt
**So that** všechny komponenty sdílejí konzistentní stav a změny se propagují správně

**Acceptance Criteria:**
- [ ] `/src/game/gameState.js` existuje a exportuje objekt `gameState` + funkce `initGameState(levelId)`, `updateState()`
- [ ] `gameState` struktura:
```js
{
  currentLevel: number,         // ID aktuálního levelu
  mapData: object,              // Parsed level data
  playerMirrors: Array,         // Hráčem umístěná zrcadla [{x, y, type}, ...]
  beamPath: Array,              // Aktuální cesta paprsku
  visibilityMap: Array<Array>,  // Fog of war data
  isComplete: boolean,          // Je level dokončený?
  stats: {                      // Statistiky pro tento level
    moves: number,              // Počet akcí (umístění/rotace zrcadla)
    time: number                // Čas v ms od startu levelu
  }
}
```
- [ ] `initGameState(levelId)` načte level, parsuje data, inicializuje prázdný state
- [ ] `updateState()` přepočítá `beamPath`, `visibilityMap`, `isComplete` (volá physics engine funkce)
- [ ] `updateState()` se volá automaticky po každé změně `playerMirrors` (placement/rotation/removal)
- [ ] Triggering: `addMirror(x, y, type)`, `removeMirror(x, y)`, `rotateMirror(x, y)` volají `updateState()`
- [ ] Immutability: funkce vracejí nový state místo mutace (nebo explicitně mutují s clear komentářem)
- [ ] Event system: `addEventListener('stateChanged', callback)` pro UI updates
- [ ] Unit test: `addMirror()` → `gameState.playerMirrors` obsahuje nové zrcadlo
- [ ] Unit test: `updateState()` → `gameState.beamPath` je recalculated
- [ ] Integration test: init level → add mirror → update → check isComplete
- [ ] Dev test: `console.log(gameState)` vypíše aktuální stav po každé změně

**Technické poznámky:**
- Singleton pattern: jediný shared state object (alternativa: Redux/Zustand store, ale overkill pro tuto hru)
- State update flow:
```js
export function addMirror(x, y, type) {
  gameState.playerMirrors.push({ x, y, type });
  gameState.stats.moves++;
  updateState();
  notifyListeners('stateChanged', gameState);
}

export function updateState() {
  gameState.beamPath = calculateBeamPath(gameState.mapData, gameState.playerMirrors);
  gameState.visibilityMap = calculateVisibility(gameState.mapData, gameState.beamPath);
  gameState.isComplete = isTargetLit(gameState.mapData, gameState.beamPath);
}
```
- Event listeners:
```js
const listeners = {};

export function addEventListener(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

function notifyListeners(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(callback => callback(data));
  }
}
```
- Mirror operations:
  - `addMirror(x, y, type)`: přidá zrcadlo, pokud buňka je prázdná (není wall/lamp/target)
  - `removeMirror(x, y)`: odstraní zrcadlo z playerMirrors array
  - `rotateMirror(x, y)`: toggleuje mezi '/' a '\\' (rotate = flip type)
- Validace: check bounds, check cell není occupied by lamp/target/wall
- Stats tracking: `moves` incrementuje i při remove/rotate, `time` se počítá od `initGameState()` pomocí `performance.now()`

**Integration example:**
```js
// In main.js or game.js
initGameState(1);  // Load level 1

// User clicks on grid to place mirror
canvas.addEventListener('click', (e) => {
  const { x, y } = pixelToGrid(e.offsetX, e.offsetY);
  addMirror(x, y, '/');  // Adds mirror, updates state, triggers re-render
});

// Listen for completion
addEventListener('stateChanged', (state) => {
  if (state.isComplete) {
    showVictoryScreen(state.stats);
  }
});
```

---

### Story 2.8: Physics Testing & Validation

**As a** vývojář
**I want to** mít komprehensivní unit a integration testy
**So that** můžu být si jistý že fyzika funguje správně a neregresují bugy

**Acceptance Criteria:**
- [ ] `/tests/unit/beamEngine.test.js` existuje (unit testy pro beam propagation)
- [ ] `/tests/unit/reflection.test.js` existuje (unit testy pro reflexní logiku - všech 8 kombinací)
- [ ] `/tests/unit/targetDetection.test.js` existuje (unit testy pro target detection)
- [ ] `/tests/integration/fullLevel.test.js` existuje (integration test - kompletní level end-to-end)
- [ ] Reflexní testy: 8 testů pro všechny kombinace `reflect(direction, mirrorType)`
- [ ] Beam propagation testy: přímý paprsek, paprsek naráží do zdi, paprsek vyjede mimo grid
- [ ] Reflection integration testy: paprsek s 1 zrcadlem, paprsek s 2 zrcadly, infinite loop detection
- [ ] Target detection testy: correct direction, wrong direction, beam doesn't reach
- [ ] Fixture data: 5 testovacích levelů v `/tests/fixtures/levels/` (trivial, medium, complex, unsolvable, infinite-loop)
- [ ] Test runner: npm script `npm run test` spustí všechny testy (použij Vitest nebo Jest)
- [ ] Coverage report: `npm run test:coverage` → coverage > 80% na všech physics modulech
- [ ] CI integration: testy běží automaticky v GitHub Actions (optional, ale recommended)
- [ ] Všechny testy projdou zelené

**Technické poznámky:**
- Test framework: Vitest (rychlý, integrace s Vite) nebo Jest (populární, ale pomalejší)
- Install: `npm install vitest --save-dev`
- Vitest config v `vite.config.js`:
```js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',  // Physics testy nepotřebují DOM
  }
});
```
- Test file structure:
```js
import { describe, it, expect } from 'vitest';
import { reflect } from '../../src/game/beamEngine.js';

describe('Reflection Logic', () => {
  it('should reflect RIGHT to UP on / mirror', () => {
    expect(reflect('RIGHT', '/')).toBe('UP');
  });

  it('should reflect LEFT to DOWN on / mirror', () => {
    expect(reflect('LEFT', '/')).toBe('DOWN');
  });

  // ... 6 more tests for other combinations

  it('should throw error for invalid mirror type', () => {
    expect(() => reflect('RIGHT', 'X')).toThrow('Invalid mirror type');
  });
});
```
- Fixture levels: TXT soubory v `/tests/fixtures/levels/`
  - `level-trivial.txt`: přímý paprsek, žádná zrcadla
  - `level-one-mirror.txt`: 1 zrcadlo '/', jednoduchá reflexe
  - `level-complex.txt`: 3 zrcadla, několik reflexí
  - `level-unsolvable.txt`: target je za zdí, nelze osvítit
  - `level-infinite-loop.txt`: 2 zrcadla vytvářejí cycle
- Integration test example:
```js
import { parseLevel } from '../../src/game/levelParser.js';
import { calculateBeamPath } from '../../src/game/beamEngine.js';
import { isTargetLit } from '../../src/game/targetDetection.js';
import fs from 'fs';

it('should solve level-one-mirror.txt', () => {
  const levelString = fs.readFileSync('./tests/fixtures/levels/level-one-mirror.txt', 'utf-8');
  const mapData = parseLevel(levelString);
  const mirrors = [{ x: 5, y: 3, type: '/' }];  // Pre-placed solution
  const beamPath = calculateBeamPath(mapData, mirrors);
  const isComplete = isTargetLit(mapData, beamPath);

  expect(isComplete).toBe(true);
  expect(beamPath.length).toBeGreaterThan(0);
});
```
- Coverage: `npm run test:coverage` vytvoří `/coverage` folder s HTML reportem
- CI setup (GitHub Actions): `.github/workflows/test.yml` spouští `npm test` při každém push/PR

---

### Story 2.9: Performance Optimization

**As a** vývojář
**I want to** optimalizovat physics engine pro rychlost
**So that** hra běží plynule i na velkých mapách s mnoha zrcadly

**Acceptance Criteria:**
- [ ] Caching: `beamPath` se nepočítá při každém renderu, jen když se změní `playerMirrors`
- [ ] Cache invalidation: `invalidateCache()` se volá při `addMirror()`, `removeMirror()`, `rotateMirror()`
- [ ] Lazy recalculation: `updateState()` se volá jen když je třeba (ne při každém mouse move)
- [ ] Profilování: `console.time('beam propagation')` měří čas výpočtu beam path
- [ ] Benchmark: level 50×50 s 10 zrcadly → propagace < 5ms (average z 100 runů)
- [ ] Benchmark: level 100×100 s 20 zrcadly → propagace < 10ms
- [ ] Optimalizace visited Set: použij string keys `"x,y,dir"` místo object comparison (fast lookup)
- [ ] Optimalizace grid access: `getCell(x, y)` je inline místo function call (v hot path)
- [ ] Memory profiling: physics engine nealokuje nové objekty v hot loopech (reuse buffers)
- [ ] Performance report: `npm run benchmark` vypíše tabulku s časy pro různé velikosti gridů

**Technické poznámky:**
- Caching implementation (už částečně v Story 2.4):
```js
let cachedBeamPath = null;
let cacheKey = null;  // Hash of mapData + mirrors state

function getCacheKey(mapData, mirrors) {
  return JSON.stringify({ lamp: mapData.lamp, mirrors });  // Simple hash
}

export function calculateBeamPath(mapData, mirrors, forceRecalc = false) {
  const key = getCacheKey(mapData, mirrors);

  if (cachedBeamPath && cacheKey === key && !forceRecalc) {
    return cachedBeamPath;
  }

  console.time('beam propagation');
  cachedBeamPath = propagateBeam(mapData, mirrors);
  console.timeEnd('beam propagation');

  cacheKey = key;
  return cachedBeamPath;
}
```
- Hot path optimization: inline grid access místo funkce
```js
// Before (slow)
const cell = getCell(x, y);

// After (fast)
const cell = (y >= 0 && y < height && x >= 0 && x < width) ? cells[y][x] : null;
```
- Object reuse: v propagateBeam loopě netvořit nové objekty
```js
// Before (allocates new object every iteration)
path.push({ x: currentPos.x, y: currentPos.y, direction: currentDir });

// After (reuse object pool) - optional, pokud profiling ukáže že je to bottleneck
const pathNode = pathPool.pop() || {};
pathNode.x = currentPos.x;
pathNode.y = currentPos.y;
pathNode.direction = currentDir;
path.push(pathNode);
```
- Benchmark script: `/scripts/benchmark.js`
```js
const { parseLevel } = require('../src/game/levelParser.js');
const { calculateBeamPath } = require('../src/game/beamEngine.js');

const sizes = [10, 25, 50, 100];
const runs = 100;

sizes.forEach(size => {
  const levelString = generateTestLevel(size);  // Helper to generate level
  const mapData = parseLevel(levelString);
  const mirrors = generateRandomMirrors(10);

  console.time(`Benchmark ${size}x${size}`);
  for (let i = 0; i < runs; i++) {
    calculateBeamPath(mapData, mirrors, true);  // Force recalc
  }
  console.timeEnd(`Benchmark ${size}x${size}`);
});
```
- Performance targets:
  - 20×20 grid: < 1ms
  - 50×50 grid: < 5ms
  - 100×100 grid: < 10ms
- If targets nejsou splněné: profile pomocí Chrome DevTools → identifikuj bottlenecky → optimalizuj hot spots

---

### Story 2.10: Edge Cases & Error Handling

**As a** vývojář
**I want to** ošetřit všechny edge cases a error stavy
**So that** hra nehavaruje a poskytne clear feedback při nevalidních stavech

**Acceptance Criteria:**
- [ ] Edge case: paprsek se vrací zpět na lampičku (loop) → detekováno visited Set, propagace stopne
- [ ] Edge case: paprsek cyklí mezi 2 zrcadly (infinite loop) → detekováno max steps, propagace stopne, console warning
- [ ] Edge case: invalid level (žádná lampička) → `parseLevel()` throw error s clear message "Level must have exactly 1 lamp"
- [ ] Edge case: invalid level (2 targetů) → `parseLevel()` throw error "Level must have exactly 1 target"
- [ ] Edge case: out-of-bounds grid access → `getCell(x, y)` vrací `null`, nepřistupuje k undefined array indexu
- [ ] Edge case: player umístí zrcadlo na lampičku → `addMirror()` validuje, vrací false, loguje warning
- [ ] Edge case: player umístí zrcadlo mimo grid → `addMirror()` validuje bounds, vrací false
- [ ] Edge case: level je unsolvable (target za zdí) → `isComplete` zůstává false, není error (valid state)
- [ ] Error handling: všechny public API funkce mají try-catch s jasným error message
- [ ] Error handling: chyby se logují do console s kontextem (coords, direction, mirror type)
- [ ] Graceful degradation: pokud physics engine selže, hra zobrazí error screen místo white screen of death
- [ ] Unit test pro každý edge case (10 testů celkem)

**Technické poznámky:**
- Validation v addMirror:
```js
export function addMirror(x, y, type) {
  // Bounds check
  if (x < 0 || x >= gameState.mapData.width || y < 0 || y >= gameState.mapData.height) {
    console.warn(`Cannot place mirror at [${x}, ${y}]: out of bounds`);
    return false;
  }

  // Cell occupancy check
  const cell = gameState.mapData.cells[y][x];
  if (cell.type !== CELL_TYPES.EMPTY) {
    console.warn(`Cannot place mirror at [${x}, ${y}]: cell is occupied by ${cell.type}`);
    return false;
  }

  // Check if mirror already exists at this position
  const existing = gameState.playerMirrors.find(m => m.x === x && m.y === y);
  if (existing) {
    console.warn(`Cannot place mirror at [${x}, ${y}]: mirror already exists`);
    return false;
  }

  // All checks passed, place mirror
  gameState.playerMirrors.push({ x, y, type });
  gameState.stats.moves++;
  updateState();
  notifyListeners('stateChanged', gameState);
  return true;
}
```
- Error wrapper:
```js
export function safeCalculateBeamPath(mapData, mirrors) {
  try {
    return calculateBeamPath(mapData, mirrors);
  } catch (error) {
    console.error('Error calculating beam path:', error);
    console.error('Context:', { lamp: mapData.lamp, mirrors });
    return [];  // Return empty path on error
  }
}
```
- Infinite loop warning:
```js
if (step >= MAX_STEPS) {
  console.warn('Beam propagation stopped: max steps reached (possible infinite loop)');
  console.warn('Last position:', currentPos, 'Direction:', currentDir);
}
```
- Error screen (pro Epic 3 - UI):
```js
addEventListener('error', (error) => {
  showErrorScreen(`Physics engine error: ${error.message}`);
});
```
- Edge case tests:
```js
describe('Edge Cases', () => {
  it('should stop propagation on infinite loop', () => {
    // Level with 2 mirrors creating cycle
    const levelString = `...`;
    const mapData = parseLevel(levelString);
    const mirrors = [{ x: 3, y: 3, type: '/' }, { x: 5, y: 3, type: '\\' }];
    const beamPath = calculateBeamPath(mapData, mirrors);

    expect(beamPath.length).toBeLessThanOrEqual(MAX_STEPS);
  });

  it('should throw error for level without lamp', () => {
    const levelString = `███\n█.█\n███`;  // No lamp
    expect(() => parseLevel(levelString)).toThrow('exactly 1 lamp');
  });

  it('should return false when placing mirror out of bounds', () => {
    initGameState(1);
    const result = addMirror(-1, 5, '/');
    expect(result).toBe(false);
  });

  // ... 7 more edge case tests
});
```
- Defensive programming: assert invariants (např. `console.assert(beamPath.length <= MAX_STEPS)`)

---

## Definition of Done

- [ ] Všechny stories (2.1 - 2.10) splněny a otestovány
- [ ] Level parser umí parsovat TXT formát do interního data modelu
- [ ] Beam propagation algoritmus funguje s reflexemi od zrcadel
- [ ] Reflexní tabulka je 100% správně aplikovaná (všech 8 kombinací testováno)
- [ ] Target detection správně identifikuje kdy je level dokončený (correct direction + reach)
- [ ] Visibility/fog of war system označuje osvětlené, částečně osvětlené a tmavé buňky
- [ ] Game state management drží konzistentní stav, triggery fungují po změnách
- [ ] Unit testy: všechny reflexní kombinace, beam propagation, target detection
- [ ] Integration testy: kompletní levely (5 fixture levelů) - trivial, medium, complex, unsolvable, infinite-loop
- [ ] Test coverage > 80% na všech physics modulech
- [ ] Performance benchmarky splňují targets (50×50 < 5ms, 100×100 < 10ms)
- [ ] Všechny edge cases jsou ošetřené (infinite loops, out-of-bounds, invalid levels)
- [ ] Error handling: žádné unhandled exceptions, jasné error messages
- [ ] Console test: `initGameState(1)` → `addMirror(5, 3, '/')` → `console.log(gameState.isComplete)` vypíše correct result
- [ ] Code review: kód je čitelný, dobře strukturovaný, s JSDoc komentáři
- [ ] Dokumentace: technický dokument popisující physics algoritmus (optional, ale užitečné)

## Odhad

**8-10 dní** (1 vývojář, full-time)

**Breakdown:**
- Story 2.1 (Level Data Model): 1 den (parsing, validace, edge cases)
- Story 2.2 (Beam Propagation Engine): 1.5 dne (algoritmus, step-by-step, collision detection)
- Story 2.3 (Mirror Reflection Logic): 0.5 dne (lookup funkce, 8 kombinací unit testů)
- Story 2.4 (Beam Path Calculation): 1 den (infinite loop detection, caching, integrace)
- Story 2.5 (Target Detection): 0.5 dne (simple checks, unit testy)
- Story 2.6 (Visibility System): 1 den (adjacent cells calculation, performance opt)
- Story 2.7 (Game State Management): 1.5 dne (state struktura, triggering, event system)
- Story 2.8 (Physics Testing): 1.5 dne (unit testy + integration testy + fixtures)
- Story 2.9 (Performance Optimization): 1 den (profiling, caching, benchmarks)
- Story 2.10 (Edge Cases): 0.5 dne (error handling, edge case testy)
- Buffer: 1 den (debugging, unplánované problémy)

**Risks:**
- **Reflexní logika chyba**: Chyba v reflexní tabulce nebo její aplikaci by způsobila fundamentální problémy. Mitigace: extensive unit testing všech 8 kombinací PŘED integrací
- **Infinite loop edge cases**: Nesprávná detekce infinite loops může způsobit freeze browseru. Mitigace: konzervativní MAX_STEPS (100), visited Set tracking
- **Performance na velkých mapách**: Pokud physics engine je pomalý, hra bude lagovat. Mitigace: early benchmarking (Story 2.9), caching, hot path optimalizace
- **State consistency**: Pokud game state a UI jsou out-of-sync, gameplay bude buggy. Mitigace: single source of truth (gameState), event system pro updates
- **Edge cases discovery**: Můžou se objevit neočekávané edge cases během testování. Mitigace: buffer time, comprehensive edge case testing (Story 2.10)

**Závislosti:**
- Epic 1 MUSÍ být hotový (Constants.js s reflexní tabulkou, folder structure, input handler skeleton)
- Levely ve formátu TXT (zatím můžeme použít fixture data z `/tests/fixtures/levels/`)
- Renderer (Epic 3) může začít paralelně jakmile je hotová Story 2.4 (beam path calculation)

**Milestone po Epic 2:**
Physics engine funguje end-to-end - lze načíst level, umístit zrcadla, vypočítat cestu paprsku a detekovat dokončení levelu. Game state je ready pro rendering (Epic 3) a input handling (Epic 4). Všechny testy projdou, performance je dobrá, edge cases jsou ošetřené. **Hra má mozek, ale ještě nemá oči (rendering) ani ruce (full input interaction).**
