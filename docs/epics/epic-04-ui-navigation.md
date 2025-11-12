# Epic 4: UI & Navigation

## Popis

Epic 4 transformuje technicky funkční hru (Epic 1-3) na **plně ovladatelnou interaktivní zkušenost** s intuitivním UI a kompletní navigací. Po dokončení tohoto epicu bude mít hra profesionální menu systémy, level selection, nastavení, in-game controls a všechny interakční prvky potřebné pro plnohodnotnou hru. Z "tech demo" se stane **uživatelsky přívětivá aplikace** s jasným onboardingem a fluid UX.

Jádrem tohoto epicu je **state management pro UI screens** - Main Menu, Level Select, Settings, In-Game UI a Victory Modal. Každý screen má vlastní lifecycle (init, render, cleanup) a navigace mezi nimi musí být seamless. State machine koordinuje přechody: MainMenu → LevelSelect → Game → Victory → LevelSelect loop. Critical je aby navigace NIKDY nevedla k prázdné obrazovce nebo zaseknému stavu.

**Mirror interaction system** je druhou klíčovou komponentou - hráč musí umět jednoduše a intuitivně umísťovat, rotovat a mazat zrcadla. Tři základní interakce: 1) levé kliknutí = umístění zrcadla (s hover preview), 2) pravé kliknutí = rotace zrcadla (/ ↔ \), 3) Delete/prostřední klik = odstranění. Všechny akce mají instant visual feedback - žádné laggy nebo zmatenou UX. Mirror palette zobrazuje dostupný "inventory" zrcadel (např. "Zbývá: 3×/ a 2×\"), který se real-time updatuje při umísťování.

UI musí být **minimalistické a čisté** - dark theme (černé pozadí #000, text #FFF, akcenty šedé #333/#666) bez zbytečných dekorací. ASCII aesthetic se přenáší i do UI - buttony jsou jednoduché obdélníky s monospace fontem, žádné gradienty nebo stíny. Focus je na **funkcionalitě a čitelnosti** - každý button musí být jasně označený, clickable area dostatečně velká (min 44×44px pro mobil), hover states výrazné.

**Accessibility** je priorita - celá hra musí být ovladatelná pouze klávesnicí (Tab pro navigaci, Enter/Space pro aktivaci, Arrows pro level grid). Screen readery musí rozumět struktuře (semantic HTML, ARIA labels). Font size je nastavitelný (malý/střední/velký) a high contrast mode zvyšuje viditelnost UI prvků. Hra by měla být hratelná i pro uživatele s omezenou jemnou motorikou nebo zrakovými problémy.

## Cíle

- [ ] Main Menu screen s funkčními buttony (Start Game, Level Select, Settings, Credits)
- [ ] Level Select screen - grid 20 levelů (4×5), odemčené vs zamčené podle progressu
- [ ] Settings Menu - jazyk (čeština/angličtina), velikost fontu, volume on/off, uložení do localStorage
- [ ] In-game UI - horní lišta (level name, progress indicator, menu button), bottom palette (dostupná zrcadla)
- [ ] Mirror palette & placement system - click-to-place workflow s hover preview
- [ ] Mirror manipulation - rotace pravým klikem, mazání Delete/prostředním klikem
- [ ] Victory Modal - "Úroveň dokončena!" + tlačítka (Další level, Zopakovat, Hlavní menu)
- [ ] Keyboard navigation - Tab/Shift+Tab, Enter/Space, Arrows, Escape (pause menu)
- [ ] In-game pause menu - Pokračovat, Reset level, Zpět na hlavní menu
- [ ] Konzistentní button styling a UI komponenty (reusable ButtonComponent, ModalComponent)

## Stories

### Story 4.1: Main Menu Screen

**As a** hráč
**I want to** vidět úvodní menu po spuštění hry
**So that** můžu vybrat co chci dělat (spustit hru, vybrat level, změnit nastavení)

**Acceptance Criteria:**
- [ ] `/src/ui/MainMenu.js` existuje a exportuje `showMainMenu()`, `hideMainMenu()`
- [ ] Main Menu obsahuje 4 buttony: "Spustit hru" (start current level), "Výběr úrovně", "Nastavení", "Kredity"
- [ ] Buttony jsou vertikálně centrované na obrazovce, spacing 20px mezi nimi
- [ ] Každý button má rozměry 200×50px (desktop), 80% šířky (mobil), centrovaný horizontálně
- [ ] Button hover effect: barva pozadí změní z `#333` na `#555`, transition 0.2s
- [ ] "Spustit hru" načte poslední rozehraný level (nebo level 1 pokud nový hráč)
- [ ] "Výběr úrovně" přejde na Level Select screen (hide main menu, show level select)
- [ ] "Nastavení" otevře Settings modal overlay (main menu zůstává viditelné, modal přes něj)
- [ ] "Kredity" zobrazí modal s textem: "LightCaves (2025) | Design & Code: [jméno] | Font: Courier New"
- [ ] Escape key closes overlay modals (Settings, Kredity) a vrátí na Main Menu
- [ ] Logo/nadpis "LIGHTCAVES" nahoře (ASCII art nebo velký monospace text)
- [ ] Dev test: otevřít hru → main menu je viditelné, všechny buttony jsou clickable

**Technické poznámky:**
- State management: global state `currentScreen = 'mainMenu'`
- Hide/show pattern: `element.style.display = 'none'` nebo 'flex'
- Button HTML template:
```html
<button class="btn btn-primary" data-action="startGame">Spustit hru</button>
<button class="btn btn-primary" data-action="levelSelect">Výběr úrovně</button>
<button class="btn btn-secondary" data-action="settings">Nastavení</button>
<button class="btn btn-secondary" data-action="credits">Kredity</button>
```
- Event delegation: jeden listener na container: `container.addEventListener('click', handleMenuClick)`
- CSS: `.btn { background: #333; color: #FFF; border: 1px solid #666; font-family: 'Courier New'; font-size: 16px; cursor: pointer; }`
- Modal overlay: `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8);`

**UI Mockup (ASCII):**
```
╔══════════════════════════════════╗
║                                  ║
║         L I G H T C A V E S      ║
║                                  ║
║       ┌────────────────────┐     ║
║       │   Spustit hru      │     ║
║       └────────────────────┘     ║
║       ┌────────────────────┐     ║
║       │  Výběr úrovně      │     ║
║       └────────────────────┘     ║
║       ┌────────────────────┐     ║
║       │    Nastavení       │     ║
║       └────────────────────┘     ║
║       ┌────────────────────┐     ║
║       │     Kredity        │     ║
║       └────────────────────┘     ║
║                                  ║
╚══════════════════════════════════╝
```

---

### Story 4.2: Level Select Screen

**As a** hráč
**I want to** vidět všech 20 levelů a vybrat si který chci hrát
**So that** můžu hrát levely v libovolném pořadí nebo zopakovat oblíbené

**Acceptance Criteria:**
- [ ] `/src/ui/LevelSelect.js` existuje a exportuje `showLevelSelect()`, `renderLevelGrid()`
- [ ] Level Select zobrazí grid 4×5 (4 řádky, 5 sloupců) = 20 levelů
- [ ] Každý level box má rozměry 100×100px (desktop), responsive na mobilech
- [ ] Odemčené levely: zelený border `#0F0`, text "Level 1", clickable
- [ ] Zamčené levely: šedý border `#666`, text "🔒", not clickable (cursor: not-allowed)
- [ ] Dokončené levely: zlatý border `#FFD700`, text "Level 1 ✓"
- [ ] Hover na odemčeném levelu: background změní na `#222`
- [ ] Click na level box → načte level (hide level select, show game canvas, init level)
- [ ] Progress tracking: levely 1-N jsou odemčené, kde N = nejvyšší dokončený level + 1
- [ ] Zpět button (vlevo nahoře): "← Hlavní menu" → vrátí na Main Menu
- [ ] Grid je centrovaný, spacing 10px mezi level boxy
- [ ] Dev test: dokončit level 1 → level select zobrazí level 2 odemčený

**Technické poznámky:**
- Progress data: `loadProgress()` vrátí `{ completedLevels: [1, 2, 3], currentLevel: 4 }`
- Unlock logic: `levelId <= currentLevel` → odemčený
- Grid layout: CSS Grid nebo Flexbox:
```css
.level-grid {
  display: grid;
  grid-template-columns: repeat(5, 100px);
  grid-template-rows: repeat(4, 100px);
  gap: 10px;
}
```
- Level box HTML:
```html
<div class="level-box level-unlocked" data-level-id="1">
  <span class="level-number">Level 1</span>
</div>
<div class="level-box level-locked">
  <span class="lock-icon">🔒</span>
</div>
```
- Click handler: check `classList.contains('level-unlocked')` před loadem levelu
- Animation: completed level box má glowing effect (CSS animation keyframes)

**UI Mockup:**
```
╔════════════════════════════════════════╗
║  ← Hlavní menu                         ║
║                                        ║
║         Výběr úrovně                   ║
║                                        ║
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐ ║
║  │Lvl 1│ │Lvl 2│ │Lvl 3│ │ 🔒 │ │🔒 │ ║
║  │  ✓  │ │     │ │     │ │    │ │   │ ║
║  └─────┘ └─────┘ └─────┘ └─────┘ └───┘ ║
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐ ║
║  │ 🔒 │ │ 🔒 │ │ 🔒 │ │ 🔒 │ │🔒 │ ║
║  └─────┘ └─────┘ └─────┘ └─────┘ └───┘ ║
║   ... (další 2 řádky)                  ║
╚════════════════════════════════════════╝
```

---

### Story 4.3: Settings Menu

**As a** hráč
**I want to** změnit nastavení hry (jazyk, velikost fontu, volume)
**So that** můžu přizpůsobit hru mým preferencím

**Acceptance Criteria:**
- [ ] `/src/ui/Settings.js` existuje a exportuje `showSettings()`, `saveSettings()`
- [ ] Settings modal obsahuje 3 options: Jazyk, Velikost fontu, Zvuk
- [ ] Jazyk: Radio buttons "Čeština" / "English" (default: čeština)
- [ ] Velikost fontu: Radio buttons "Malá (14px)" / "Střední (16px)" / "Velká (20px)" (default: střední)
- [ ] Zvuk: Toggle switch "Zapnuto" / "Vypnuto" (default: zapnuto)
- [ ] "Uložit" button → uloží nastavení do localStorage pomocí `setSetting(key, value)`
- [ ] "Zrušit" button → zavře modal bez uložení změn
- [ ] Po uložení: okamžitě aplikuje změny (font size na UI texty, jazyk update menu strings)
- [ ] Settings modal má X button v pravém horním rohu (close)
- [ ] Escape key zavře modal
- [ ] Dark overlay za modalem (`background: rgba(0,0,0,0.9)`)
- [ ] Dev test: změň velikost fontu na "Velká" → UI text se zvětší

**Technické poznámky:**
- localStorage keys: `settings_language`, `settings_fontSize`, `settings_sound`
- Apply settings: `document.documentElement.style.fontSize = '20px'` (dynamický font size)
- Language switching: load strings z `/src/data/strings/cs.json` nebo `en.json`
- Toggle switch HTML:
```html
<label class="toggle">
  <input type="checkbox" id="soundToggle" checked>
  <span class="toggle-slider"></span>
  <span class="toggle-label">Zvuk</span>
</label>
```
- Radio buttons group:
```html
<div class="setting-group">
  <label>Velikost fontu:</label>
  <label><input type="radio" name="fontSize" value="small"> Malá</label>
  <label><input type="radio" name="fontSize" value="medium" checked> Střední</label>
  <label><input type="radio" name="fontSize" value="large"> Velká</label>
</div>
```
- Save logic:
```js
function saveSettings() {
  const language = document.querySelector('input[name="language"]:checked').value;
  const fontSize = document.querySelector('input[name="fontSize"]:checked').value;
  const sound = document.getElementById('soundToggle').checked;

  setSetting('language', language);
  setSetting('fontSize', fontSize);
  setSetting('sound', sound);

  applySettings();
}
```

**UI Mockup:**
```
╔════════════════════════════════╗
║  Nastavení                  X  ║
║                                ║
║  Jazyk:                        ║
║    ○ Čeština   ● English       ║
║                                ║
║  Velikost fontu:               ║
║    ○ Malá   ● Střední   ○ Velká║
║                                ║
║  Zvuk:  [ON]                   ║
║                                ║
║  ┌────────┐  ┌────────┐        ║
║  │ Uložit │  │ Zrušit │        ║
║  └────────┘  └────────┘        ║
╚════════════════════════════════╝
```

---

### Story 4.4: In-Game UI (Top Bar & Bottom Palette)

**As a** hráč
**I want to** vidět název levelu, progress a dostupná zrcadla během hry
**So that** vím kde jsem, kolik jsem splnil a co můžu použít

**Acceptance Criteria:**
- [ ] `/src/ui/InGameUI.js` existuje a exportuje `initInGameUI()`, `updateUI(gameState)`
- [ ] Horní lišta (top bar) obsahuje: Level name (vlevo), Progress indicator (střed), Menu button (vpravo)
- [ ] Level name: text "Úroveň 1: Základy" (načteno z level metadat)
- [ ] Progress indicator: "Cílů: 2/4" (počet osvětlených cílů / celkový počet)
- [ ] Menu button: hamburger icon "☰" nebo text "Menu" → otevře pause menu
- [ ] Top bar má fixed position (vždy viditelná i při scrollu), height 50px, background `#1a1a1a`
- [ ] Bottom palette obsahuje: "Dostupná zrcadla: 3×/ 2×\" (počet zbývajících zrcadel)
- [ ] Palette má visual preview - klikací ikony "/" a "\" s čísly vedle
- [ ] Click na "/" v paletě → aktivuje "placement mode" pro lomítko zrcadlo
- [ ] Active mirror type má highlight (zelený border kolem ikony)
- [ ] Bottom palette má height 60px, background `#1a1a1a`, centrovaná
- [ ] Dev test: během hry osvětli cíl → progress se updatuje (1/4 → 2/4)

**Technické poznámky:**
- Top bar HTML:
```html
<div id="topBar" class="top-bar">
  <span class="level-name">Úroveň 1: Základy</span>
  <span class="progress-indicator">Cílů: 0/4</span>
  <button class="menu-btn">☰</button>
</div>
```
- Bottom palette HTML:
```html
<div id="bottomPalette" class="bottom-palette">
  <span class="palette-label">Dostupná zrcadla:</span>
  <button class="mirror-btn mirror-slash" data-mirror-type="/">
    <span class="mirror-icon">/</span>
    <span class="mirror-count">×3</span>
  </button>
  <button class="mirror-btn mirror-backslash" data-mirror-type="\">
    <span class="mirror-icon">\</span>
    <span class="mirror-count">×2</span>
  </button>
</div>
```
- Update logic:
```js
export function updateUI(gameState) {
  const targetsLit = gameState.targets.filter(t => t.isLit).length;
  const totalTargets = gameState.targets.length;
  document.querySelector('.progress-indicator').textContent = `Cílů: ${targetsLit}/${totalTargets}`;

  // Update mirror counts
  document.querySelector('.mirror-slash .mirror-count').textContent = `×${gameState.availableMirrors['/']}`;
  document.querySelector('.mirror-backslash .mirror-count').textContent = `×${gameState.availableMirrors['\\']}`;
}
```
- CSS: `.top-bar { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; }`

**UI Mockup:**
```
╔════════════════════════════════════════╗
║ Úroveň 1: Základy  Cílů: 2/4      ☰   ║ <- Top Bar
╠════════════════════════════════════════╣
║                                        ║
║         [GAME CANVAS]                  ║
║                                        ║
╠════════════════════════════════════════╣
║  Dostupná zrcadla:  [/×3]  [\×2]       ║ <- Bottom Palette
╚════════════════════════════════════════╝
```

---

### Story 4.5: Mirror Palette & Mirror Placement System

**As a** hráč
**I want to** umístit zrcadlo na mapu kliknutím
**So that** můžu měnit dráhu paprsku a řešit puzzle

**Acceptance Criteria:**
- [ ] `/src/ui/MirrorPlacement.js` existuje a exportuje `initMirrorPlacement()`, `placeMirror(x, y, type)`
- [ ] Click na "/" button v paletě → aktivuje "slash placement mode"
- [ ] Click na "\" button v paletě → aktivuje "backslash placement mode"
- [ ] V placement mode: cursor se změní na crosshair (`cursor: crosshair`)
- [ ] Hover nad prázdnou buňkou gridu → zobrazí preview zrcadla (světle šedé, opacity 0.5)
- [ ] Click na prázdnou buňku → umístí zrcadlo, sníží count v paletě, vypne placement mode
- [ ] Click na obsazenou buňku (zeď, lampička, jiné zrcadlo) → žádná akce, zůstává v placement mode
- [ ] Pokud není dostupné zrcadlo (count = 0): button je disabled (šedý, not clickable)
- [ ] Escape key ukončí placement mode (cursor se vrátí na normal, preview zmizí)
- [ ] Po umístění: okamžitě přepočítá paprsek (volá physics engine) a re-render
- [ ] Dev test: klikni na "/" → hover nad mapou → vidíš preview → klikni → zrcadlo se umístí

**Technické poznámky:**
- Global state: `placementMode = { active: false, mirrorType: null }`
- Hover preview: detekovat mousemove nad canvasem, vypočítat grid coords, vykreslit semi-transparent mirror symbol
- Canvas rendering: `ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'` pro preview
- Click handler:
```js
canvas.addEventListener('click', (e) => {
  if (!placementMode.active) return;

  const coords = pixelToGrid(e.offsetX, e.offsetY);
  const cell = gameState.grid[coords.y][coords.x];

  if (cell === EMPTY) {
    placeMirror(coords.x, coords.y, placementMode.mirrorType);
    decrementMirrorCount(placementMode.mirrorType);
    deactivatePlacementMode();
    recalculateBeam();
    render();
  }
});
```
- Prevent invalid placement: check `cell === EMPTY` před umístěním
- Palette button state:
```js
function updatePaletteButtons() {
  const slashBtn = document.querySelector('.mirror-slash');
  if (gameState.availableMirrors['/'] === 0) {
    slashBtn.disabled = true;
    slashBtn.classList.add('disabled');
  }
}
```

---

### Story 4.6: Mirror Manipulation (Rotation & Deletion)

**As a** hráč
**I want to** rotovat zrcadlo (pravý klik) nebo ho smazat (Delete)
**So that** můžu opravit chyby nebo experimentovat s různými konfiguracemi

**Acceptance Criteria:**
- [ ] `/src/ui/MirrorManipulation.js` existuje a exportuje `rotateMirror(x, y)`, `deleteMirror(x, y)`
- [ ] Pravé kliknutí na zrcadlo → rotace (/ změní na \, \ změní na /)
- [ ] Pravé kliknutí nemá context menu (preventDefault)
- [ ] Delete key stisknutý když je hover nad zrcadlem → odstraní zrcadlo
- [ ] Prostřední klik (mouse button 1) na zrcadlo → odstraní zrcadlo
- [ ] Po rotaci/mazání: vrátí zrcadlo do palety (count se zvýší)
- [ ] Po rotaci/mazání: okamžitě přepočítá paprsek a re-render
- [ ] Rotace je vizuálně smooth (optional: CSS rotation animation 0.2s)
- [ ] Delete funguje pouze na hráčem umístěná zrcadla (ne na statická z mapy)
- [ ] Visual feedback: hover nad zrcadlem změní cursor na pointer (klikatelné)
- [ ] Dev test: umísti /, pravý klik → změní se na \, Delete → zmizí, count v paletě +1

**Technické poznámky:**
- Right click handler:
```js
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const coords = pixelToGrid(e.offsetX, e.offsetY);
  const cell = gameState.grid[coords.y][coords.x];

  if (cell === '/' || cell === '\\') {
    rotateMirror(coords.x, coords.y);
  }
});
```
- Rotate logic:
```js
function rotateMirror(x, y) {
  const currentMirror = gameState.playerMirrors.find(m => m.x === x && m.y === y);
  if (!currentMirror) return; // Static mirror, cannot rotate

  currentMirror.type = currentMirror.type === '/' ? '\\' : '/';
  gameState.grid[y][x] = currentMirror.type;

  recalculateBeam();
  render();
}
```
- Delete logic:
```js
function deleteMirror(x, y) {
  const mirrorIndex = gameState.playerMirrors.findIndex(m => m.x === x && m.y === y);
  if (mirrorIndex === -1) return;

  const mirror = gameState.playerMirrors[mirrorIndex];
  gameState.availableMirrors[mirror.type]++;
  gameState.playerMirrors.splice(mirrorIndex, 1);
  gameState.grid[y][x] = EMPTY;

  updateUI(gameState);
  recalculateBeam();
  render();
}
```
- Keyboard handler:
```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const hoveredCoords = getCurrentHoverCoords(); // Track mouse position
    if (hoveredCoords) deleteMirror(hoveredCoords.x, hoveredCoords.y);
  }
});
```

---

### Story 4.7: Victory Modal (Level Complete Screen)

**As a** hráč
**I want to** vidět "Úroveň dokončena!" screen po splnění všech cílů
**So that** můžu přejít na další level nebo zopakovat současný

**Acceptance Criteria:**
- [ ] `/src/ui/VictoryModal.js` existuje a exportuje `showVictoryModal(levelId, stats)`
- [ ] Victory modal se automaticky zobrazí když všechny cíle jsou osvětlené
- [ ] Modal obsahuje: nadpis "Úroveň dokončena!", stats (čas, počet tahů), 3 buttony
- [ ] Stats: "Čas: 1:23", "Počet tahů: 12" (počet umístěných/rotovaných zrcadel)
- [ ] Button "Další úroveň" → načte level+1, zavře modal, spustí hru
- [ ] Button "Zopakovat" → reset současného levelu, zavře modal, spustí hru
- [ ] Button "Hlavní menu" → vrátí na Main Menu screen
- [ ] Pokud je to poslední level (20): "Další úroveň" změní na "Gratulujeme! Hra dokončena"
- [ ] Modal má celebrační efekt (optional: fade-in animace, glowing text)
- [ ] Escape key nezavře modal (hráč musí vybrat akci)
- [ ] Progress se automaticky uloží: `saveProgress(levelId, stats)`
- [ ] Dev test: dohraj level 1 → modal se objeví, klikni "Další" → level 2 se načte

**Technické poznámky:**
- Victory detection: check `gameState.targets.every(t => t.isLit)` po každém beam recalculation
- Modal HTML:
```html
<div id="victoryModal" class="modal victory-modal">
  <div class="modal-content">
    <h2>Úroveň dokončena!</h2>
    <div class="stats">
      <p>Čas: <span id="completionTime">1:23</span></p>
      <p>Počet tahů: <span id="moveCount">12</span></p>
    </div>
    <div class="modal-buttons">
      <button class="btn btn-primary" data-action="nextLevel">Další úroveň</button>
      <button class="btn btn-secondary" data-action="retry">Zopakovat</button>
      <button class="btn btn-secondary" data-action="mainMenu">Hlavní menu</button>
    </div>
  </div>
</div>
```
- Show logic:
```js
export function showVictoryModal(levelId, stats) {
  const modal = document.getElementById('victoryModal');
  document.getElementById('completionTime').textContent = formatTime(stats.time);
  document.getElementById('moveCount').textContent = stats.moves;

  modal.style.display = 'flex';

  saveProgress(levelId, stats); // Auto-save
  unlockNextLevel(levelId + 1);
}
```
- CSS animation:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.victory-modal { animation: fadeIn 0.3s ease-out; }
```

**UI Mockup:**
```
╔════════════════════════════════╗
║                                ║
║    Úroveň dokončena! 🎉        ║
║                                ║
║    Čas: 1:23                   ║
║    Počet tahů: 12              ║
║                                ║
║  ┌──────────────────────┐      ║
║  │   Další úroveň       │      ║
║  └──────────────────────┘      ║
║  ┌──────────────────────┐      ║
║  │    Zopakovat         │      ║
║  └──────────────────────┘      ║
║  ┌──────────────────────┐      ║
║  │   Hlavní menu        │      ║
║  └──────────────────────┘      ║
║                                ║
╚════════════════════════════════╝
```

---

### Story 4.8: Keyboard Navigation & Accessibility

**As a** hráč bez myši nebo s omezenou motorikou
**I want to** ovládat celou hru pouze klávesnicí
**So that** můžu hrát bez závislosti na myši

**Acceptance Criteria:**
- [ ] `/src/ui/KeyboardNav.js` existuje a exportuje `initKeyboardNavigation()`
- [ ] Tab key přepíná focus mezi interaktivními prvky (buttony, level boxy)
- [ ] Shift+Tab přepíná focus zpět
- [ ] Enter nebo Space aktivuje zaměřený button (jako klik myší)
- [ ] Escape zavírá overlay modals (Settings, Credits) a ukončuje placement mode
- [ ] Arrow keys (↑↓←→) pohybují focus v level select gridu
- [ ] V in-game: arrows pohybují cursor na mapě (virtuální cursor pro placement)
- [ ] Enter v in-game: umístí zrcadlo na pozici virtuálního cursoru
- [ ] R key: rotuje zrcadlo na pozici cursoru
- [ ] Delete/Backspace: maže zrcadlo na pozici cursoru
- [ ] Všechny focusované elementy mají visual feedback (outline nebo glowing border)
- [ ] Dev test: naviguj menu pouze klávesnicí → všechny akce fungují

**Technické poznámky:**
- Focus management: `element.focus()`, `element.blur()`
- Focus trap: v modalech (Settings, Victory) focus cyklí pouze mezi prvky modalu
- Visual focus indicator: CSS `:focus { outline: 2px solid #0F0; outline-offset: 2px; }`
- Virtual cursor state:
```js
let virtualCursor = { x: 0, y: 0, active: false };

document.addEventListener('keydown', (e) => {
  if (!virtualCursor.active) return;

  switch(e.key) {
    case 'ArrowUp':    virtualCursor.y--; break;
    case 'ArrowDown':  virtualCursor.y++; break;
    case 'ArrowLeft':  virtualCursor.x--; break;
    case 'ArrowRight': virtualCursor.x++; break;
    case 'Enter':      placeMirrorAtCursor(); break;
    case 'r':          rotateMirrorAtCursor(); break;
    case 'Delete':     deleteMirrorAtCursor(); break;
  }

  renderCursorPreview();
});
```
- Render cursor: highlight buňka gridu kde je cursor (border nebo background change)
- Arrow keys v level grid:
```js
function handleArrowInGrid(direction) {
  const currentIndex = getFocusedLevelIndex();
  let newIndex;

  switch(direction) {
    case 'ArrowRight': newIndex = currentIndex + 1; break;
    case 'ArrowLeft':  newIndex = currentIndex - 1; break;
    case 'ArrowDown':  newIndex = currentIndex + 5; break; // Next row (5 cols)
    case 'ArrowUp':    newIndex = currentIndex - 5; break;
  }

  focusLevelBox(newIndex);
}
```
- Accessibility attributes: `tabindex="0"` na všechny interaktivní prvky, `aria-label` popisky

---

### Story 4.9: In-Game Pause Menu

**As a** hráč
**I want to** pausnout hru a vidět menu s opcemi
**So that** můžu restartovat level nebo se vrátit do hlavního menu

**Acceptance Criteria:**
- [ ] `/src/ui/PauseMenu.js` existuje a exportuje `showPauseMenu()`, `hidePauseMenu()`
- [ ] Pause menu se otevře kliknutím na "☰" button v top baru nebo Escape key
- [ ] Pause menu má 3 buttony: "Pokračovat", "Resetovat úroveň", "Hlavní menu"
- [ ] "Pokračovat" zavře menu a pokračuje ve hře (resume)
- [ ] "Resetovat úroveň" reload současný level (všechna zrcadla se vymažou, paprsek resetuje)
- [ ] "Hlavní menu" ukončí hru a vrátí na Main Menu screen
- [ ] Během pause: hra je zamrzlá (žádné animace, beam se nepřepočítává)
- [ ] Pause menu má dark overlay přes canvas (`background: rgba(0,0,0,0.85)`)
- [ ] Escape key toggleuje pause (otevře/zavře menu)
- [ ] Pause menu obsahuje název levelu nahoře: "Úroveň 1: Základy"
- [ ] Dev test: Escape → menu se objeví, Escape znovu → menu zmizí

**Technické poznámky:**
- Pause state: `gameState.isPaused = true` → zastaví game loop
- Pause HTML:
```html
<div id="pauseMenu" class="modal pause-menu" style="display: none;">
  <div class="modal-content">
    <h2 id="pauseLevelName">Úroveň 1: Základy</h2>
    <button class="btn btn-primary" data-action="resume">Pokračovat</button>
    <button class="btn btn-secondary" data-action="reset">Resetovat úroveň</button>
    <button class="btn btn-secondary" data-action="mainMenu">Hlavní menu</button>
  </div>
</div>
```
- Toggle logic:
```js
export function togglePauseMenu() {
  const menu = document.getElementById('pauseMenu');
  const isVisible = menu.style.display === 'flex';

  if (isVisible) {
    hidePauseMenu();
    gameState.isPaused = false;
  } else {
    showPauseMenu();
    gameState.isPaused = true;
  }
}
```
- Game loop pause:
```js
function gameLoop(timestamp) {
  if (gameState.isPaused) {
    requestAnimationFrame(gameLoop); // Continue loop but don't update
    return;
  }

  // Normal update/render logic
  updateGame(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}
```
- Reset level:
```js
function resetLevel() {
  gameState.playerMirrors = [];
  gameState.availableMirrors = { ...levelData.mirrors }; // Reset inventory
  gameState.grid = JSON.parse(JSON.stringify(levelData.grid)); // Deep clone
  recalculateBeam();
  render();
  hidePauseMenu();
}
```

**UI Mockup:**
```
╔════════════════════════════════╗
║                                ║
║    Úroveň 1: Základy           ║
║                                ║
║  ┌──────────────────────┐      ║
║  │    Pokračovat        │      ║
║  └──────────────────────┘      ║
║  ┌──────────────────────┐      ║
║  │  Resetovat úroveň    │      ║
║  └──────────────────────┘      ║
║  ┌──────────────────────┐      ║
║  │    Hlavní menu       │      ║
║  └──────────────────────┘      ║
║                                ║
╚════════════════════════════════╝
```

---

### Story 4.10: UI Component Library & Consistent Styling

**As a** vývojář
**I want to** mít reusable UI komponenty a konzistentní styling
**So that** můžu rychle přidávat nové UI prvky a hra vypadá jednotně

**Acceptance Criteria:**
- [ ] `/src/ui/components/Button.js` exportuje `createButton(text, type, onClick)`
- [ ] `/src/ui/components/Modal.js` exportuje `createModal(title, content, buttons)`
- [ ] `/src/styles/ui-components.css` obsahuje všechny button styles (.btn, .btn-primary, .btn-secondary)
- [ ] Button types: `primary` (zelený akcent #0F0), `secondary` (šedý #333), `danger` (červený #F00)
- [ ] Button states: default, hover, active, disabled
- [ ] Button sizing: `padding: 12px 24px`, `font-size: 16px`, `min-width: 150px`
- [ ] Modal component má: header, content area, footer (buttons), close X button
- [ ] Modal má fade-in/fade-out animaci (0.3s ease-out)
- [ ] Všechny texty používají monospace font (Courier New)
- [ ] Color palette: Background `#000`, Text `#FFF`, Accent `#0F0`, Secondary `#666`, Danger `#F00`
- [ ] Spacing system: 4px, 8px, 12px, 16px, 24px (konzistentní margins/paddings)
- [ ] Dev test: použij `createButton()` → button má správný styling a onClick funguje

**Technické poznámky:**
- Button component:
```js
export function createButton(text, type = 'primary', onClick) {
  const btn = document.createElement('button');
  btn.className = `btn btn-${type}`;
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}
```
- Button CSS:
```css
.btn {
  padding: 12px 24px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  border: 1px solid #666;
  background: #333;
  color: #FFF;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
  text-align: center;
}

.btn:hover {
  background: #555;
  border-color: #888;
}

.btn:active {
  transform: scale(0.98);
}

.btn:disabled {
  background: #222;
  color: #666;
  cursor: not-allowed;
}

.btn-primary {
  border-color: #0F0;
}

.btn-primary:hover {
  background: #0F0;
  color: #000;
}

.btn-secondary {
  border-color: #666;
}

.btn-danger {
  border-color: #F00;
}

.btn-danger:hover {
  background: #F00;
  color: #FFF;
}
```
- Modal component:
```js
export function createModal(title, content, buttons = []) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h2>${title}</h2><button class="modal-close">×</button>`;

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = content;

  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  buttons.forEach(btnConfig => {
    const btn = createButton(btnConfig.text, btnConfig.type, btnConfig.onClick);
    footer.appendChild(btn);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  return overlay;
}
```
- Modal CSS:
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1a1a1a;
  border: 2px solid #666;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-close {
  background: none;
  border: none;
  color: #FFF;
  font-size: 24px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
```
- Design system: všechny komponenty používají CSS variables:
```css
:root {
  --bg-color: #000;
  --text-color: #FFF;
  --accent-color: #0F0;
  --secondary-color: #666;
  --danger-color: #F00;
  --font-family: 'Courier New', Consolas, monospace;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
}
```

---

## Definition of Done

- [ ] Všechny stories (4.1 - 4.10) splněny a otestovány
- [ ] Main Menu, Level Select, Settings, Victory Modal, Pause Menu jsou plně funkční
- [ ] Mirror placement system funguje (click to place, hover preview, palette inventory)
- [ ] Mirror manipulation funguje (pravý klik rotuje, Delete maže)
- [ ] Keyboard navigation funguje na všech screen (Tab, Enter, Arrows, Escape)
- [ ] In-game UI updatuje real-time (progress indicator, mirror counts)
- [ ] Settings se ukládají do localStorage a aplikují okamžitě
- [ ] Level progression funguje (odemykání levelů, save progress)
- [ ] Všechny UI komponenty mají konzistentní styling (dark theme, monospace font)
- [ ] Žádné console errors, smooth transitions mezi screens
- [ ] Manuální QA: projdi celý flow (Main Menu → Level Select → Game → Victory → Next Level)
- [ ] Accessibility: všechny interaktivní prvky mají tabindex, aria-labels, focus states
- [ ] Responsive: UI funguje na desktopu (1920×1080) i mobilech (375×667)
- [ ] Code review: všechny UI moduly jsou čitelné, dobře dokumentované (JSDoc komentáře)

## Odhad

**8-10 dní** (1 vývojář, full-time)

**Breakdown:**
- Story 4.1 (Main Menu Screen): 1 den
- Story 4.2 (Level Select Screen): 1.5 dne (grid layout + unlock logic)
- Story 4.3 (Settings Menu): 1 den (localStorage integration)
- Story 4.4 (In-Game UI): 1 den (top bar + bottom palette)
- Story 4.5 (Mirror Placement): 1.5 dne (hover preview + placement workflow)
- Story 4.6 (Mirror Manipulation): 1 den (rotation + deletion)
- Story 4.7 (Victory Modal): 0.5 dne
- Story 4.8 (Keyboard Navigation): 1.5 dne (virtual cursor + focus management)
- Story 4.9 (Pause Menu): 0.5 dne
- Story 4.10 (UI Components): 1 den (reusable components + styling)
- Buffer: 1 den (integrace, edge cases, polishing)

**Risks:**
- Mirror placement UX: musí být intuitivní, pokud je moc komplexní → frustruje hráče
- Keyboard navigation: virtual cursor musí být smooth a vizuálně jasný, jinak hráči nebudou používat
- State management: přechody mezi screens musí být bulletproof (žádné race conditions nebo prázdné obrazovky)
- Mobile touch controls: touch events jsou složitější než mouse events (multi-touch, gestures)

**Dependencies:**
- Epic 1: Input handler (input.js) musí být ready
- Epic 2: Physics engine musí poskytovat API pro mirror placement/rotation a beam recalculation
- Epic 3: Renderer musí umět kreslit mirrors a UI overlay prvky

**Milestone po Epic 4:**
Hra je **plně hratelná end-to-end**. Hráč může spustit hru, vybrat level, umístit zrcadla, vyřešit puzzle, postoupit dál a změnit nastavení. Chybí pouze levely (Epic 5), audio feedback (Epic 6) a final polish (Epic 7).

## Testing Checklist

### Main Menu
- [ ] Všechny buttony jsou clickable a vedou na správné screens
- [ ] Settings modal se otevře a zavře bez errorů
- [ ] Credits modal zobrazuje správné informace

### Level Select
- [ ] Grid zobrazuje všech 20 levelů
- [ ] Odemčené levely jsou zelené a clickable
- [ ] Zamčené levely jsou šedé a not clickable
- [ ] Dokončené levely mají zlatý border a ✓
- [ ] Click na level načte správný level

### Settings
- [ ] Změna jazyka přepne všechny texty (čeština ↔ angličtina)
- [ ] Změna velikosti fontu okamžitě updatuje UI texty
- [ ] Zvuk toggle se ukládá do localStorage
- [ ] "Uložit" button aplikuje změny
- [ ] "Zrušit" button zahodí změny

### In-Game UI
- [ ] Top bar zobrazuje správný název levelu
- [ ] Progress indicator updatuje při osvětlení cílů
- [ ] Bottom palette zobrazuje správné mirror counts
- [ ] Mirror counts se snižují při umístění

### Mirror Placement
- [ ] Click na "/" button aktivuje placement mode
- [ ] Hover nad prázdnou buňkou zobrazí preview
- [ ] Click na buňku umístí zrcadlo
- [ ] Click na obsazenou buňku nic neudělá
- [ ] Escape ukončí placement mode
- [ ] Disabled button když count = 0

### Mirror Manipulation
- [ ] Pravý klik na zrcadlo rotuje (/ ↔ \)
- [ ] Delete key na zrcadlo ho smaže
- [ ] Prostřední klik maže zrcadlo
- [ ] Rotace/mazání vrací zrcadlo do palety
- [ ] Rotace/mazání triggeruje beam recalculation

### Victory Modal
- [ ] Modal se objeví když všechny cíle jsou osvětleny
- [ ] Stats zobrazují správný čas a počet tahů
- [ ] "Další úroveň" načte level+1
- [ ] "Zopakovat" resetuje současný level
- [ ] "Hlavní menu" vrátí na main menu
- [ ] Progress se uloží do localStorage

### Keyboard Navigation
- [ ] Tab přepíná focus mezi buttony
- [ ] Enter/Space aktivuje button
- [ ] Arrows pohybují focus v level grid
- [ ] Arrows pohybují virtual cursor v in-game
- [ ] Enter umístí zrcadlo na cursor position
- [ ] R rotuje zrcadlo na cursor position
- [ ] Delete maže zrcadlo na cursor position
- [ ] Escape zavírá modals a ukončuje modes

### Pause Menu
- [ ] Escape otevře pause menu
- [ ] Hra se zastaví (žádné animace)
- [ ] "Pokračovat" zavře menu a resume
- [ ] "Resetovat úroveň" reload level
- [ ] "Hlavní menu" vrátí na main menu

### UI Styling
- [ ] Všechny buttony mají hover effect
- [ ] Focus states jsou viditelné (green outline)
- [ ] Modals mají fade-in animaci
- [ ] Dark theme je konzistentní napříč všemi screens
- [ ] Monospace font je všude (Courier New)

### Responsive
- [ ] UI vypadá dobře na 1920×1080 (desktop)
- [ ] UI vypadá dobře na 1366×768 (laptop)
- [ ] UI vypadá dobře na 375×667 (mobil)
- [ ] Buttony mají min 44×44px (touch targets)

### Accessibility
- [ ] Všechny interaktivní prvky mají tabindex
- [ ] Focus je viditelný a logický
- [ ] Screen reader může číst všechny texty
- [ ] High contrast mode zvyšuje viditelnost

---

## UX Flow Diagram

```
┌─────────────┐
│ Main Menu   │
└──────┬──────┘
       │
       ├──── "Spustit hru" ──────► [Load Current Level] ──► In-Game
       │
       ├──── "Výběr úrovně" ─────► Level Select ──────────► In-Game
       │                                │
       │                                └─────► "Zpět" ──► Main Menu
       │
       ├──── "Nastavení" ───────────► Settings Modal ────► Main Menu
       │
       └──── "Kredity" ─────────────► Credits Modal ─────► Main Menu

In-Game:
  │
  ├── Mirror Placement (click, hover, Escape)
  ├── Mirror Manipulation (right-click rotate, Delete)
  ├── Pause Menu (Escape) ───► Pokračovat / Reset / Main Menu
  │
  └── Victory Detected ──────► Victory Modal ──► Další / Zopakovat / Main Menu
```

## Wireframes Reference

Všechny UI screens mají minimalistický ASCII-inspired design:
- **Černé pozadí** (#000) - tmavé jeskyně aesthetic
- **Bílý text** (#FFF) - maximální čitelnost
- **Zelené akcenty** (#0F0) - highlight active states, primary buttons
- **Šedé borders** (#333, #666) - jemné separátory
- **Monospace font** (Courier New) - ASCII art konzistence

Layout principles:
- **Centrované elementy** - buttony, modals, level grid jsou vždy centrované
- **Vertikální spacing** - 20-24px mezi UI bloky
- **Padding** - všechny containery mají min 24px padding
- **Max-width** - modals max 500px šířka (čitelnost na velkých monitorech)

## Notes

**UX Priority:** Smooth, intuitive interaction je kritická. Každá akce (click, hover, keypress) musí mít **okamžitý visual feedback** - žádné laggy nebo zmatenou response. Hráč musí "cítit" že hra reaguje - cursor change, hover highlights, button press animations.

**State Management:** UI State machine je komplexní - používej event-driven architecture. Events: `GAME_STARTED`, `LEVEL_COMPLETED`, `SETTINGS_CHANGED`, `MIRROR_PLACED`, atd. Každý screen má lifecycle: `init()`, `render()`, `cleanup()`. Žádné memory leaky - vždy removeEventListener při cleanup.

**Mobile Considerations:** Touch events jsou fundamentálně jiné než mouse events. Touch nemá "hover" state - musíme použít jiný workflow (tap to select mirror type, tap grid to place). Virtual cursor pro keyboard navigation je klíčový pro non-mouse users. Test na reálném mobilu, ne jen Chrome DevTools.

**Localization:** I18n strings v `/src/data/strings/cs.json` a `en.json`. Všechny UI texty loaduj ze stringu, nikdy hardcoded. Current language se ukládá do localStorage. Language switch musí updatovat **všechny** viditelné texty okamžitě (včetně in-game UI).

**Performance:** UI rendering je mimo game loop - používá vlastní render cycle. State changes triggerují UI update, ne každý frame. Modal animace jsou CSS-based (GPU accelerated), ne JavaScript animations. Button hover states jsou pure CSS - žádné JS event handlers pro styling.
