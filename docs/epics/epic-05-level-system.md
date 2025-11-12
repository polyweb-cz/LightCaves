# Epic 5: Level System

## Popis

Epic 5 přináší **herní obsah** - kompletní systém pro načítání, parsování a správu levelů. Po dokončení Epic 1-4 má hra funkční engine, fyziku, rendering a UI, ale žádný obsah. Tento epic přidává **20 ručně designovaných levelů** (tutorial 1-5, standard 6-20) plus celou infrastrukturu pro jejich loading, validaci, progresivní obtížnost a hint systém. Z technické demo se stává **hratelná hra** s reálným progression systemem.

Jádrem tohoto epicu je **level parser** - konverze plain text TXT formátu (ASCII grid + metadata) do interní JSON struktury. TXT formát je human-readable a umožňuje rychlé prototypování levelů v textovém editoru. Parser musí být **robustní** - validuje rozměry gridu, kontroluje povinné elementy (lampička, target), ověřuje ASCII symboly a detekuje chyby (např. chybějící zeď, neplatný znak). Pokud je level invalid, parser vrací detailní error report místo crash aplikace.

**Level progression** sleduje, které levely hráč dokončil, a odemyká nové. Model je lineární - level 2 se odemkne teprve po dokončení level 1. Progress se ukládá do localStorage (využívá storage.js z Epic 1) a persistuje mezi sessions. Hráč může kdykoliv zopakovat dokončené levely (pro lepší čas nebo méně mirrors), ale nemůže skočit dopředu. Anti-frustration feature: replay libovolného dokončeného levelu bez penalty.

**Difficulty progression** je carefully curated - tutorial levely (1-5) učí základy (1 zrcadlo, jednoduchý odraz, cíl na dohled), standard levely (6-20) postupně přidávají complexity (více zrcadel, labyrinth walls, indirect paths). Difficulty je viditelná v UI (Easy/Medium/Hard badge) a reflektuje se v level designu - Easy = přímočarý path, Medium = potřeba plánování, Hard = multi-step řešení s experimentováním. Progression curve je smooth - žádné difficulty spikey.

**Level assets & localization** - každý level má název, description a optional hint text. Všechny texty existují v češtině a angličtině (`/data/strings/cs.json`, `/data/strings/en.json`). UI automaticky načítá správnou jazykovou mutaci podle nastavení. Hints jsou **optional** - hráč si je může zobrazit tlačítkem "Nápověda" pokud se zasekne, bez penalty (hints nejsou cheat, ale learning tool). Hint popisuje high-level strategii, ne konkrétní řešení ("Zkus postavit zrcadlo na souřadnicích X,Y").

**Quality assurance** je built-in - automated validation v build pipeline ověřuje že všechny levely jsou well-formed (valid ASCII, lamp a target existují, žádné duplicitní IDs). Bonus: **level solver** - jednoduchý brute-force algorithm testuje že level je řešitelný (existuje kombinace zrcadel, která vede paprsek do targetu). Pokud solver level nevyřeší, build failuje - prevence unsolvable levelů v produkci.

## Cíle

- [ ] TXT level format specifikace a dokumentace (README pro level designers)
- [ ] Level parser (TXT → JSON) s robustní validací a error handling
- [ ] 5 tutorial levelů (progresivní obtížnost, hint texty)
- [ ] 15 standard levelů (mix Easy/Medium/Hard, různé geometrie)
- [ ] Level loading systém s cachingem (rychlé přepínání mezi levely)
- [ ] Progression tracking (completed levels, current level, unlock logic)
- [ ] Difficulty indicators v UI (Easy/Medium/Hard badges)
- [ ] Hint systém (zobrazení/skrytí hintů, storage v level datech)
- [ ] Localization (čeština + angličtina pro názvy, descriptions, hints)
- [ ] Automated validation + level solver v build pipeline (CI/CD ready)

## Stories

### Story 5.1: Level Format & Specification

**As a** level designer
**I want to** mít definovaný TXT formát pro levely s jasnou specifikací
**So that** můžu vytvářet levely v textovém editoru a parser je správně načte

**Acceptance Criteria:**
- [ ] `/docs/level-format.md` existuje a obsahuje kompletní specifikaci TXT formátu
- [ ] TXT formát má dvě sekce: **metadata** (klíč: hodnota) a **ASCII grid** (vizuální mapa)
- [ ] Metadata obsahuje: `id`, `name`, `difficulty` (easy/medium/hard), `max_mirrors` (kolik zrcadel je k dispozici)
- [ ] Metadata obsahuje: `hint` (optional, text pro hráče), `description` (krátký popis levelu)
- [ ] ASCII grid používá symboly z `constants.js`: `█` (zeď), `.` (prázdno), `▲►▼◄` (lamp), `△▷▽◁` (target)
- [ ] Grid má pevný formát: každý řádek stejná délka (paddnutý spaces), ohraničený prázdným řádkem před a po
- [ ] Validační pravidla: max 100×100 cells, minimálně 5×5, právě jedna lampička, právě jeden target
- [ ] Příklad levelu v dokumentaci: kompletní tutorial level 1 s komentáři
- [ ] Reserved symboly: `/` a `\` jsou zakázané v TXT souboru (zrcadla umísťuje hráč, ne designer)
- [ ] Parser musí ignorovat prázdné řádky a komentáře (řádky začínající `#`)

**Technické poznámky:**
- TXT formát je inspirovaný INI/YAML - human-readable, jednoduchý parsing
- Metadata parsing: regex nebo split-by-line + `key: value` parsing
- Grid parsing: najít první non-empty line po metadata, číst dokud neprázdný
- Validace: kontrola že všechny znaky v gridu jsou valid symboly z constants
- Error handling: pokud chybí povinné pole (např. `id`), parser vrací error objekt s detailem
- Příklad TXT souboru:
```
id: 1
name: První kroky
difficulty: easy
max_mirrors: 1
hint: Umísti jedno zrcadlo aby paprsek dorazil k cíli
description: Tutoriální level - naučí základy

█████████
█▲......█
█.......█
█......△█
█████████
```

**Level format dokumentace (náhled):**
- Syntaxe TXT formátu (metadata + grid)
- Seznam všech povolených ASCII symbolů
- Validační pravidla (min/max rozměry, povinné elementy)
- Error handling (co se stane když je level invalid)
- Best practices pro level design (difficulty balancing, testovatelnost)

---

### Story 5.2: Level Parser & Validator

**As a** vývojář
**I want to** mít robustní parser který konvertuje TXT levely do JSON
**So that** hra může načítat levely z human-readable formátu a validovat je před použitím

**Acceptance Criteria:**
- [ ] `/src/data/LevelParser.js` existuje a exportuje `parseLevel(txtContent)`, `validateLevel(levelData)`
- [ ] `parseLevel()` parsuje TXT string a vrací JSON objekt: `{ id, name, difficulty, max_mirrors, hint, description, grid, lamp, target }`
- [ ] Grid je 2D array: `grid[y][x]` kde `grid[0][0]` je levý horní roh
- [ ] Lamp a target jsou objekty: `{ x, y, direction }` (direction = 'UP', 'RIGHT', 'DOWN', 'LEFT')
- [ ] Parser detekuje direction lampičky/targetu podle ASCII symbolu (`▲` = UP, `►` = RIGHT, atd.)
- [ ] `validateLevel()` kontroluje: právě 1 lamp, právě 1 target, grid je obdélníkový (všechny řádky stejná délka)
- [ ] Validace: žádné neznámé symboly v gridu (všechny musí být v `VALID_SYMBOLS` z constants)
- [ ] Validace: grid je obklopen zdmi (první a poslední řádek = `█`, první a poslední sloupec = `█`)
- [ ] Error handling: pokud validace selže, vrací `{ error: true, message: "Chyba: ..." }` místo crash
- [ ] Dev test: parsuj ukázkový TXT level → JSON výstup je correct, lamp a target mají správné coords

**Technické poznámky:**
- Parsing steps: 1) split by lines, 2) parse metadata (lines s `:`), 3) find grid start, 4) parse grid line-by-line
- Grid parsing: každý line convertuj na array of chars: `line.split('')`
- Lamp/target detection: loop přes grid, když najdeš `▲►▼◄`, ulož coords + direction
- Direction mapping: `{ '▲': 'UP', '►': 'RIGHT', '▼': 'DOWN', '◄': 'LEFT' }`
- Validace borders: check `grid[0]` (top row) a `grid[height-1]` (bottom row) jsou all `█`
- Edge case: pokud TXT obsahuje tab characters, replace s spaces (`.replace(/\t/g, ' ')`)
- Error messages měly být user-friendly: "Level 5: Chybí lampička na mapě"

**Parser implementace (skeleton):**
```js
export function parseLevel(txtContent) {
  const lines = txtContent.trim().split('\n');
  const metadata = {};
  const gridLines = [];
  let inGrid = false;

  for (const line of lines) {
    if (line.trim().startsWith('#')) continue; // Komentář
    if (line.includes(':') && !inGrid) {
      const [key, value] = line.split(':').map(s => s.trim());
      metadata[key] = value;
    } else if (line.trim() && !line.includes(':')) {
      inGrid = true;
      gridLines.push(line);
    }
  }

  const grid = gridLines.map(line => line.split(''));
  const { lamp, target } = findLampAndTarget(grid);

  return {
    id: parseInt(metadata.id),
    name: metadata.name,
    difficulty: metadata.difficulty,
    max_mirrors: parseInt(metadata.max_mirrors),
    hint: metadata.hint || '',
    description: metadata.description || '',
    grid,
    lamp,
    target
  };
}

export function validateLevel(levelData) {
  if (!levelData.lamp) return { error: true, message: 'Chybí lampička' };
  if (!levelData.target) return { error: true, message: 'Chybí cíl' };
  // ... další validace
  return { error: false };
}
```

---

### Story 5.3: Level Data Structure & Caching

**As a** vývojář
**I want to** mít konzistentní interní reprezentaci levelů s cachingem
**So that** loading levelů je rychlý a data jsou vždy konzistentní

**Acceptance Criteria:**
- [ ] `/src/data/LevelManager.js` existuje a exportuje `loadLevel(levelId)`, `getCurrentLevel()`, `getAllLevels()`
- [ ] `loadLevel()` načte level z TXT souboru, parsuje jej, validuje a ukládá do cache
- [ ] Cache je in-memory objekt: `{ 1: levelData, 2: levelData, ... }` (level ID → data)
- [ ] První load levelu parsuje TXT (pomalé), další loady používají cache (instant)
- [ ] `getCurrentLevel()` vrací aktuálně načtený level (ten který hráč právě hraje)
- [ ] `getAllLevels()` vrací array všech level IDs (1-20) pro level select screen
- [ ] Level data obsahují metadata + runtime state: `{ ...levelData, placedMirrors: [], isCompleted: false }`
- [ ] `placedMirrors` je array objektů: `[{ x, y, type: '/' or '\\' }, ...]` (zrcadla umístěná hráčem)
- [ ] `resetLevel()` funkce vymaže `placedMirrors` a resetuje runtime state (pro "Zkusit znovu")
- [ ] Dev test: `loadLevel(1)` → načte level 1, další `loadLevel(1)` vrátí cached data

**Technické poznámky:**
- Caching pattern: lazy loading - level se parsuje teprve když je poprvé potřeba
- Cache invalidation: pokud se změní TXT soubor (dev režim), cache se automaticky vymaže
- Runtime state separace: level data (immutable) vs. runtime state (mutable - placed mirrors, timer, atd.)
- In-memory cache je dostatečný - 20 levelů × ~1 KB = ~20 KB total (zanedbatelné)
- Future optimization: přednačíst všechny levely při app start (async background loading)
- Level loading error handling: pokud TXT soubor neexistuje, vrať fallback level (prázdný 10×10 grid)

**LevelManager API (interface):**
```js
export class LevelManager {
  constructor() {
    this.cache = {};
    this.currentLevel = null;
  }

  loadLevel(levelId) {
    if (this.cache[levelId]) return this.cache[levelId]; // Cache hit

    const txtContent = loadTxtFile(`/data/levels/level-${levelId}.txt`);
    const levelData = parseLevel(txtContent);
    const validation = validateLevel(levelData);

    if (validation.error) {
      console.error(`Level ${levelId} validation failed:`, validation.message);
      return null;
    }

    this.cache[levelId] = { ...levelData, placedMirrors: [] };
    return this.cache[levelId];
  }

  getCurrentLevel() { return this.currentLevel; }

  resetLevel(levelId) {
    if (this.cache[levelId]) {
      this.cache[levelId].placedMirrors = [];
    }
  }
}
```

---

### Story 5.4: Tutorial Levels (1-5)

**As a** hráč
**I want to** projít 5 tutoriálními levely které mě naučí základy
**So that** rozumím mechanikám hry (zrcadla, paprsky, odrazy) před standardními levely

**Acceptance Criteria:**
- [ ] 5 TXT levelů v `/src/data/levels/`: `level-1.txt`, `level-2.txt`, ..., `level-5.txt`
- [ ] **Level 1**: 7×5 grid, 1 zrcadlo `/`, lampička vlevo, cíl vpravo, přímý path (hint: "Umísti jedno zrcadlo")
- [ ] **Level 2**: 9×7 grid, 1 zrcadlo `\`, lampička nahoře, cíl dole, jiný direction (hint: "Zkus druhý typ zrcadla")
- [ ] **Level 3**: 10×8 grid, 2 zrcadla (1× `/`, 1× `\`), path vyžaduje oba (hint: "Potřebuješ oba typy zrcadel")
- [ ] **Level 4**: 12×10 grid, několik zdí jako obstacles, 2 zrcadla, cíl za stěnou (hint: "Najdi cestu kolem stěny")
- [ ] **Level 5**: 15×12 grid, 3 zrcadla, složitější path (hint: "Plánuj dopředu - paprsek musí několikrát odbočit")
- [ ] Všechny tutorial levely mají `difficulty: easy` a jasný hint text
- [ ] Levely jsou otestované - existuje validní řešení (level designer vyřešil každý level před commitnutím)
- [ ] Grid design: minimalistický - žádné zbytečné zdi, focus na learning mechaniky
- [ ] Level names: "První kroky", "Druhý typ zrcadla", "Kombinace", "Překážky", "Plánování"
- [ ] Dev test: nahraj každý level do hry, ověř že je hratelný a řešitelný

**Technické poznámky:**
- Tutorial progression: level 1 = nejjednodušší (1 mirror, obvious solution), level 5 = připravuje na standard levels
- Grid sizing: začít malý (7×5), postupně růst (15×12 max pro tutorial)
- Hint quality: hints by měly být helpful ale ne spoilery ("Umísti zrcadlo uprostřed" = spoiler, "Zkus zrcadlo mezi lampičkou a cílem" = hint)
- Playtesting: každý level by měl hráč vyřešit za < 2 minuty (tutorial nemá frustrovat)
- Level 1 design (example):
```
id: 1
name: První kroky
difficulty: easy
max_mirrors: 1
hint: Umísti jedno lomítko (/) aby paprsek dorazil k cíli
description: Základy - nauč se jak fungují zrcadla

███████
█▲....█
█.....█
█....△█
███████
```

---

### Story 5.5: Standard Levels (6-20)

**As a** hráč
**I want to** mít 15 standardních levelů s progresivní obtížností
**So that** hra má dostatečný obsah a každý level je nová výzva

**Acceptance Criteria:**
- [ ] 15 TXT levelů v `/src/data/levels/`: `level-6.txt` až `level-20.txt`
- [ ] **Easy levely (6-10)**: 5 levelů, 2-3 zrcadla, jednoduchá geometrie, jasný path
- [ ] **Medium levely (11-15)**: 5 levelů, 3-5 zrcadel, complex walls, vyžaduje plánování
- [ ] **Hard levely (16-20)**: 5 levelů, 5-7 zrcadel, labyrinth, multi-step řešení
- [ ] Každý level má unique layout - žádné duplicity, různé grid sizes (10×10 až 25×25)
- [ ] Mix lamp directions: ne všechny lampičky jsou UP nebo RIGHT, různé orientace
- [ ] Mix target positions: cíl je sometimes blízko lampy (needs indirect path), sometimes far
- [ ] Alespoň 3 levely používají "corner trick" (paprsek musí odbočit v rohu dvakrát)
- [ ] Difficulty progression je smooth: level 10 je těžší než level 6, ale ne o moc (no spikes)
- [ ] Všechny levely jsou otestované - level designer je vyřešil a confirmed řešitelnost
- [ ] Dev test: nahraj každý level, ověř že je visually distinct a hratelný

**Technické poznámky:**
- Design philosophy: každý level učí nový koncept nebo kombinaci triků
- Easy = hráč vidí řešení hned, Medium = potřebuje chvíli promyslet, Hard = trial & error potřebný
- Grid variety: různé shapes - square, wide rectangle, tall rectangle (ne všechny levely jsou čtvercové)
- Wall placement: walls by měly vytvářet "chambers" nebo "corridors" (visual interest + gameplay challenge)
- Lamp/target positioning: avoid trivial setups (lamp a target na stejné ose = boring)
- Level names (example): "Labyrint", "Odrazová komora", "Křižovatka", "Spirála", "Finální zkouška"
- Balancing: hard levely by měly být challenging ale ne impossible (< 10 minut na řešení)

**Level variety checklist:**
- [ ] Alespoň 2 levely s lampou UP, 2× DOWN, 2× LEFT, 2× RIGHT
- [ ] Alespoň 3 levely kde target je v "dead corner" (za stěnou, potřebuje bounce)
- [ ] Alespoň 2 levely s narrow corridors (1 tile široké)
- [ ] Alespoň 1 level s central pillar/obstacle který hráč musí obejít
- [ ] Alespoň 1 level kde paprsek musí projít přes 5+ cells bez zrcadla (long straight)

**Difficulty guidelines:**
- Easy (6-10): max 15×15 grid, 2-3 mirrors, solution má ≤ 3 odrazy
- Medium (11-15): max 20×20 grid, 3-5 mirrors, solution má 4-6 odrazů
- Hard (16-20): max 25×25 grid, 5-7 mirrors, solution má 7+ odrazů

---

### Story 5.6: Level Loading & Transitions

**As a** hráč
**I want to** hladké přechody mezi levely s loading feedback
**So that** hra nevypadá zmrzlá a UX je smooth

**Acceptance Criteria:**
- [ ] Loading screen overlay: černé pozadí + text "Načítání úrovně..." + animovaná tečka
- [ ] Loading screen se zobrazí když hráč vybere nový level (level select → game)
- [ ] Loading trvá minimálně 300ms (artificial delay pokud loading je instant) - dává visual feedback
- [ ] Fade-out animace před loadingem: current screen fade to black (0.2s transition)
- [ ] Fade-in animace po loadingu: new level fade from black (0.2s transition)
- [ ] Loading screen používá CSS animation: tečky "..." animují (1s loop, opacity 0→1→0)
- [ ] Error handling: pokud level load fails, zobrazí error message: "Nepodařilo se načíst level X" + tlačítko "Zpět"
- [ ] Next level transition (po victory): fade-out → loading → fade-in do level select nebo next level
- [ ] Žádný stutter/freeze během transition - animace jsou smooth (60 FPS)
- [ ] Dev test: přepni mezi levely rychle za sebou → všechny transitions jsou smooth, žádný visual glitch

**Technické poznámky:**
- Loading screen HTML:
```html
<div id="loadingScreen" class="loading-screen">
  <p>Načítání úrovně<span class="dots">...</span></p>
</div>
```
- CSS animation:
```css
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.loading-screen.visible { opacity: 1; }
.dots { animation: blink 1s infinite; }
@keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
```
- JavaScript transition flow:
```js
async function loadNewLevel(levelId) {
  showLoadingScreen(); // Fade in
  await sleep(300); // Min delay
  const level = await levelManager.loadLevel(levelId);
  await sleep(100);
  hideLoadingScreen(); // Fade out
  renderLevel(level);
}
```
- Artificial delay: pokud level load je < 300ms, čekej do 300ms (user experience - instant loading vypadá "glitchy")
- Preloading optimization: pokud víme next level (např. po victory), můžeme jej preloadovat na pozadí během hry

---

### Story 5.7: Difficulty Progression & Indicators

**As a** hráč
**I want to** vidět obtížnost levelu před začátkem hraní
**So that** vím do čeho jdu a můžu si vybrat podle nálady (easy pro relaxaci, hard pro challenge)

**Acceptance Criteria:**
- [ ] Difficulty metadata v TXT levelech: `difficulty: easy`, `difficulty: medium`, `difficulty: hard`
- [ ] Level select screen zobrazuje difficulty badge u každého levelu (barevný label)
- [ ] Easy badge: zelený (#0F0), text "Snadná", zobrazí se u levelů 1-10
- [ ] Medium badge: žlutý (#FF0), text "Střední", zobrazí se u levelů 11-15
- [ ] Hard badge: červený (#F00), text "Těžká", zobrazí se u levelů 16-20
- [ ] In-game UI: difficulty badge je viditelný v top baru (vedle level name)
- [ ] Level loading: parser načte difficulty z TXT a uloží do level data
- [ ] Filter v level select (optional): "Zobrazit pouze: Všechny / Snadné / Střední / Těžké"
- [ ] Difficulty je pureley informační - neovlivňuje gameplay (pouze visual indicator)
- [ ] Dev test: otevři level select → každý level má viditelný difficulty badge, barvy jsou správné

**Technické poznámky:**
- Difficulty mapping:
```js
const DIFFICULTY_CONFIG = {
  easy: { label: 'Snadná', color: '#0F0', icon: '●' },
  medium: { label: 'Střední', color: '#FF0', icon: '●●' },
  hard: { label: 'Těžká', color: '#F00', icon: '●●●' }
};
```
- Badge HTML:
```html
<span class="difficulty-badge difficulty-easy">Snadná</span>
```
- CSS:
```css
.difficulty-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.difficulty-easy { background: #0F0; color: #000; }
.difficulty-medium { background: #FF0; color: #000; }
.difficulty-hard { background: #F00; color: #FFF; }
```
- Accessibility: difficulty by měla být accessible i bez barev (text + icon pattern)
- Filter implementation (optional): level select má dropdown "Obtížnost: Všechny", onChange filtruje grid
- Localization: difficulty labels jsou v strings JSON: `"difficulty.easy": "Snadná"` (čeština), `"difficulty.easy": "Easy"` (angličtina)

---

### Story 5.8: Level Hints & Help System

**As a** hráč
**I want to** zobrazit nápovědu pokud se zaseknu na levelu
**So that** můžu pokračovat bez frustrace a naučit se strategie

**Acceptance Criteria:**
- [ ] Hint text je stored v TXT levelech: `hint: Zkus umístit zrcadlo do rohu`
- [ ] In-game UI má button "Nápověda" (nebo ikona "?") v top baru
- [ ] Klik na "Nápověda" zobrazí modal overlay s hint textem (černé pozadí + bílý text)
- [ ] Modal obsahuje: hint text, tlačítko "Zavřít" (nebo ESC key closes modal)
- [ ] Hint zobrazení NEMÁ penalty - hráč může použít hint kdykoliv bez ztráty bodů/času
- [ ] Pokud level nemá hint (`hint: ''`), button "Nápověda" je disabled nebo hidden
- [ ] Hint quality: hints jsou helpful ale ne spoilery ("Zkus umístit zrcadlo mezi lampu a cíl" vs. "Postav zrcadlo na [3,5]")
- [ ] Tutorial levely (1-5): všechny mají hints, standard levely (6-20): hints jsou optional (ne všechny levely mají hint)
- [ ] Hint modal je responsive: na mobilu zabírá celou obrazovku, na desktopu je centrovaný box
- [ ] Dev test: otevři level s hintem, klikni "Nápověda" → modal se zobrazí, hint je čitelný

**Technické poznámky:**
- Hint modal HTML:
```html
<div id="hintModal" class="modal">
  <div class="modal-content">
    <h2>Nápověda</h2>
    <p id="hintText">Zkus umístit zrcadlo...</p>
    <button class="btn" onclick="closeHintModal()">Zavřít</button>
  </div>
</div>
```
- CSS:
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #111;
  border: 2px solid #666;
  padding: 20px;
  max-width: 500px;
  text-align: center;
}
```
- Hint button state: pokud `level.hint === ''`, button má `disabled` attribute a gray color
- Localization: hints jsou v level TXT souborech, takže musí existovat separate TXT files pro každý jazyk (level-1-cs.txt, level-1-en.txt) NEBO hints jsou v strings JSON a TXT obsahuje hint ID
- Better approach: hints v strings JSON (`"level1.hint": "..."`) → TXT obsahuje jen `hint_id: level1.hint`

---

### Story 5.9: Level Assets & Localization

**As a** hráč
**I want to** hrát hru v češtině nebo angličtině podle nastavení
**So that** rozumím level názvům, descriptions a hints v mém jazyce

**Acceptance Criteria:**
- [ ] `/src/data/strings/cs.json` obsahuje české texty: level names, descriptions, hints
- [ ] `/src/data/strings/en.json` obsahuje anglické texty: level names, descriptions, hints
- [ ] `/src/utils/i18n.js` existuje a exportuje `loadStrings(language)`, `getString(key)`
- [ ] `loadStrings()` načte správný JSON soubor podle nastavení (default: `cs`)
- [ ] `getString(key)` vrací přeložený text: `getString('level1.name')` → "První kroky" (cs) nebo "First Steps" (en)
- [ ] UI automaticky používá `getString()` pro všechny level texty (names, descriptions, hints)
- [ ] Language switching: změna jazyka v Settings → reload strings → UI se aktualizuje (re-render)
- [ ] Fallback: pokud string chybí v current language, použij anglický (default language)
- [ ] All 20 levelů mají překlady v obou jazycích (40 level names, 40 descriptions, ~10 hints)
- [ ] Dev test: změň jazyk z cs → en → všechny level names se změní, hints jsou v angličtině

**Technické poznámky:**
- JSON structure:
```json
{
  "level1.name": "První kroky",
  "level1.description": "Základní tutoriál - nauč se mechaniky",
  "level1.hint": "Umísti jedno zrcadlo",
  "level2.name": "Druhý typ",
  ...
}
```
- i18n.js implementation:
```js
let currentStrings = {};

export function loadStrings(language) {
  const json = fetch(`/data/strings/${language}.json`).then(r => r.json());
  currentStrings = json;
}

export function getString(key, fallback = '') {
  return currentStrings[key] || currentStrings[`${key}.en`] || fallback;
}
```
- Initial load: `loadStrings()` se volá v `main.js` při app start (podle saved settings)
- Language switch: Settings modal má dropdown "Jazyk: Čeština / English", onChange uloží do localStorage + reload strings
- TXT files: level TXT soubory obsahují **jen** grid + metadata (id, difficulty, max_mirrors), texty jsou v strings JSON
- Alternative approach: každý level má separate TXT per language (level-1-cs.txt, level-1-en.txt) - jednodušší pro level designers, ale více souborů

---

### Story 5.10: Level Progression & Unlocking

**As a** hráč
**I want to** odemykat levely postupně jak je dokončuji
**So that** mám pocit progression a nemohu skočit dopředu (guided experience)

**Acceptance Criteria:**
- [ ] Progression model: level 1 je odemčený vždy, level N+1 se odemkne po dokončení level N
- [ ] Level select screen: odemčené levely = zelený border + clickable, zamčené = šedý border + ikona 🔒 + not clickable
- [ ] Progress tracking v localStorage: `{ completedLevels: [1, 2, 3], currentLevel: 4 }`
- [ ] `markLevelComplete(levelId)` funkce: přidá level do completedLevels, odemkne next level, uloží do storage
- [ ] `isLevelUnlocked(levelId)` funkce: vrací true pokud level je odemčený (completed previous nebo levelId === 1)
- [ ] Replay feature: hráč může kdykoliv zopakovat completed level (klik na completed level v level select)
- [ ] Level select UI: completed levely mají ✓ badge (zelený checkmark) + zobrazí best time/moves
- [ ] First-time player: pouze level 1 je unlocked, ostatní zamčené
- [ ] New game button v Settings: reset progress (smaže completedLevels, vrátí na level 1) - confirmation dialog!
- [ ] Dev test: dohraj level 1 → level 2 se odemkne, dohraj level 2 → level 3 unlocked, atd.

**Technické poznámky:**
- Progression storage schema:
```js
{
  version: '1.0',
  completedLevels: [1, 2, 3], // Array of completed level IDs
  currentLevel: 4, // Next level to play
  stats: {
    1: { time: 45000, moves: 7, bestTime: 45000 },
    2: { time: 60000, moves: 10, bestTime: 55000 },
    ...
  }
}
```
- `markLevelComplete()` implementation:
```js
export function markLevelComplete(levelId, stats) {
  const progress = loadProgress();
  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }
  progress.currentLevel = Math.max(progress.currentLevel, levelId + 1);
  progress.stats[levelId] = stats;
  saveProgress(progress);
}
```
- Level unlock check:
```js
export function isLevelUnlocked(levelId) {
  if (levelId === 1) return true; // Level 1 vždy unlocked
  const progress = loadProgress();
  return progress.completedLevels.includes(levelId - 1); // Previous level completed
}
```
- Level select rendering: loop přes 1-20, pro každý level check `isLevelUnlocked()`, apply CSS class `.locked` nebo `.unlocked`
- Completed badge: pokud `progress.completedLevels.includes(levelId)`, přidej ✓ icon a zobrazí stats (time, moves)
- Anti-cheat: progress je stored v localStorage → hráč může editovat (cheat all levels unlocked), ale to je OK (single-player hra, žádný multiplayer/leaderboard)

---

### Story 5.11: Level Validation & QA Pipeline

**As a** vývojář
**I want to** automated validation všech levelů v build pipeline
**So that** broken/unsolvable levely nikdy nedorazí do produkce

**Acceptance Criteria:**
- [ ] `/scripts/validate-levels.js` Node.js script: načte všechny TXT levely, parsuje je, validuje každý
- [ ] Validation checks: 1) TXT parsing OK, 2) všechny required fields (id, name, difficulty, max_mirrors), 3) grid is rectangular, 4) lamp a target existují, 5) žádné invalid symboly
- [ ] Script vypíše report: "✓ Level 1 OK", "✓ Level 2 OK", "✗ Level 15 FAILED: Missing target"
- [ ] Pokud jakýkoliv level fails validation, script exituje s error code 1 (build fail)
- [ ] `npm run validate-levels` spustí validation script
- [ ] CI/CD integration: `package.json` obsahuje `"test": "npm run validate-levels"` → GitHub Actions runne test před každým merge
- [ ] Bonus: level solver - brute-force algorithm zkusí všechny kombinace zrcadel a ověří že existuje řešení
- [ ] Solver timeout: pokud solver běží > 10 sekund, skip (level může být solvable ale příliš complex pro brute-force)
- [ ] Solver report: "✓ Level 1 solvable (3 mirrors)", "✓ Level 5 solvable (5 mirrors)", "⚠ Level 20 timeout (could not verify)"
- [ ] Dev test: zkaž level (smaž target) → `npm run validate-levels` failne s error message

**Technické poznámky:**
- Validation script structure:
```js
import fs from 'fs';
import { parseLevel, validateLevel } from '../src/data/LevelParser.js';

const levelFiles = fs.readdirSync('./src/data/levels');
let allValid = true;

for (const file of levelFiles) {
  const content = fs.readFileSync(`./src/data/levels/${file}`, 'utf-8');
  const level = parseLevel(content);
  const validation = validateLevel(level);

  if (validation.error) {
    console.error(`✗ ${file} FAILED: ${validation.message}`);
    allValid = false;
  } else {
    console.log(`✓ ${file} OK`);
  }
}

if (!allValid) process.exit(1); // Fail build
```
- Level solver (basic brute-force):
```js
function solvLevel(level) {
  const { grid, lamp, target, max_mirrors } = level;
  // Try all combinations of mirrors in empty cells
  // For each combo: simulate beam path (use physics engine)
  // If beam reaches target → return true
  // Timeout after 10 seconds → return 'timeout'
}
```
- Solver complexity: max_mirrors=7, grid=25×25 → ~1000 empty cells → 7 mirrors = C(1000,7) combinations (billions!) → need pruning (only try sensible positions)
- Practical solver: instead of brute-force, use heuristics - pouze positions na beam path nebo 1 cell od beam
- CI/CD: GitHub Actions workflow `.github/workflows/test.yml`:
```yaml
name: Validate Levels
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run validate-levels
```

---

## Definition of Done

- [ ] Všechny stories (5.1 - 5.11) splněny a otestovány
- [ ] Level TXT format je dokumentovaný (`/docs/level-format.md`)
- [ ] Level parser načítá a validuje TXT levely bez errorů
- [ ] 5 tutorial levelů (1-5) je vytvořeno, testováno a řešitelné
- [ ] 15 standard levelů (6-20) je vytvořeno s progresivní obtížností
- [ ] Level loading má smooth transitions (fade-out/fade-in, loading screen)
- [ ] Difficulty badges jsou viditelné v UI (Easy/Medium/Hard)
- [ ] Hint systém funguje - modal zobrazuje hint text, ESC closes
- [ ] Localization funguje - všechny level texty existují v češtině a angličtině
- [ ] Progression tracking odemyká levely postupně (linear unlock)
- [ ] Automated validation pipeline (`npm run validate-levels`) ověřuje všechny levely
- [ ] CI/CD integration - build failuje pokud level validation selže
- [ ] Manuální QA: projdi všech 20 levelů v hře, ověř že jsou hratelné a řešitelné
- [ ] Code review: parser, level manager, i18n jsou čitelné a dobře dokumentované

## Odhad

**10-14 dní** (1 vývojář, full-time)

**Breakdown:**
- Story 5.1 (Level Format): 1 den (specifikace + dokumentace)
- Story 5.2 (Parser & Validator): 2 dny (parsing logic + validation rules + error handling)
- Story 5.3 (Data Structure & Caching): 1 den (level manager + caching logic)
- Story 5.4 (Tutorial Levels): 1.5 dne (design + create 5 levels + playtest)
- Story 5.5 (Standard Levels): 3 dny (design + create 15 levels + playtest + balancing)
- Story 5.6 (Loading & Transitions): 1 den (loading screen + fade animations)
- Story 5.7 (Difficulty Indicators): 0.5 dne (badges + UI integration)
- Story 5.8 (Hints): 1 den (modal + hint storage + integration)
- Story 5.9 (Localization): 1.5 dne (i18n system + translate 20 levels × 2 languages)
- Story 5.10 (Progression): 1 den (unlock logic + storage integration)
- Story 5.11 (Validation Pipeline): 1.5 dne (validation script + optional solver + CI/CD setup)
- Buffer: 1 den (debugging, playtesting, level tweaks)

**Risks:**
- Level design je time-consuming - 20 levelů × testování každého = hodně času → allocate buffer
- Level balancing: obtížnost může být subjektivní - potřeba playtesting s reálnými hráči → iterace
- Solver implementace: brute-force je exponenciální → možná nebude feasible pro hard levely → optional feature
- Localization: translate 20 level names + descriptions + hints = ~100 strings → consider professional translator nebo community help
- Tutorial level quality: pokud tutorial je špatný, hráči budou frustrovaní → extra čas na polish

**Milestone po Epic 5:**
Hra má kompletní obsah - 20 levelů ready to play. Progression system funguje, levely jsou validované a řešitelné. Hráč může projít celou hru od tutorial po finální level. Next epic (Epic 6) přidá polish: sounds, particle effects, animations, achievements.

## Závislosti

**Depends on:**
- Epic 1: Storage wrapper (pro save/load progress)
- Epic 2: Physics engine (pro level simulation - solver)
- Epic 3: Renderer (pro zobrazení levelů)
- Epic 4: UI system (pro level select, modals, buttons)

**Blocks:**
- Epic 6: Polish & Effects (potřebuje existující levely pro testing particle effects)
- Epic 7: Achievements (potřebuje completed levels tracking)

## Technical Debt

- **Level solver**: brute-force není scalable pro complex levely - consider smarter algorithms (A*, heuristics)
- **TXT format**: plain text parsing je fragile - consider přechod na JSON nebo YAML formát (více robust)
- **Localization**: manual translations v JSON souborech - consider i18n framework (i18next) pro professional workflow
- **Level editor**: designers editují TXT v textovém editoru - consider visual level editor (HTML canvas based) pro rychlejší prototyping

## Poznámky

- Level design je **creative process** - nejde jen o coding, ale o gameplay experience. Allokuj čas na iterace a playtesting.
- Difficulty balancing vyžaduje **feedback od hráčů** - internal playtesting může být biased (developer zná všechny tricky). Consider beta testing.
- Hints jsou **learning tool**, ne cheat - měly by být encouraged, ne penalized. Hráč který používá hint se učí, není slabý hráč.
- Progression unlocking je **design choice** - linear unlock vytváří guided experience, ale může frustrovat hráče kteří chtějí skip. Consider "easy unlock mode" v Settings (pro accessibility).
- Level validation v CI/CD je **game changer** - prevence broken levelů v produkci šetří hodiny debuggingu. Worth the effort.
