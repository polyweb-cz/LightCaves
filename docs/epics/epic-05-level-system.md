# Epic 5: Level System

**Status:** Planned
**Priorita:** High
**Odhadovaná složitost:** 21 Story Points
**Cílová iterace:** Iterace 5

---

## Přehled

Epic 5 zavádí kompletní systém pro načítání, správu a prezentaci levelů. Hra obsahuje 20 ručně vytvořených levelů s progresivní obtížností, od tutoriálů po náročné puzzly. Systém podporuje validaci, lokalizaci (CZ/EN) a robustní loading infrastrukturu.

**Kontext z předchozích epiků:**
- **Epic 1:** CMake build, asset management, testing framework
- **Epic 2:** Physics engine pro paprsek, reflekce, detekci kolizí
- **Epic 3:** Rendering pipeline pro zrcadla, světelné paprsky, terrain
- **Epic 4:** UI komponenty (menu, HUD, modal dialogy)

**Klíčové features:**
- TXT-based level format s ASCII gridem a metadaty
- Parser s validací a error reportingem
- 20 handcrafted levelů (5 tutoriálů + 15 standardních)
- Systém obtížnosti (Easy/Medium/Hard)
- Level hints a progresivní unlocking
- Lokalizace do češtiny a angličtiny
- Automatická validace řešitelnosti (build-time solver)

---

## Business Value

**Proč je tento epic důležitý:**
- Hra získává plný obsah (20 levelů = 2-4 hodiny gameplay)
- Progresivní obtížnost zajišťuje onboarding nových hráčů
- Robustní level format umožňuje snadné přidávání dalších levelů
- Validace předchází broken levelům v production buildu

**Metriky úspěchu:**
- 20/20 levelů je načitatelných bez chyb
- Průměrný čas načtení levelu < 200ms
- 100% levelů prochází validací řešitelnosti
- Tutorial completion rate > 90%

---

## User Stories

### Story 5.1: Level Format & Specification

**Jako:** Level designer
**Chci:** Jasně definovaný TXT formát pro levely
**Abych:** Mohl vytvářet a editovat levely v plain textu bez custom nástrojů

**Popis:**
Navrhni a implementuj TXT-based level format, který kombinuje metadata (název, obtížnost, limity) a ASCII grid reprezentaci playfieldu. Parser musí být robustní vůči chybám a poskytovat jasné error messages.

**Technické požadavky:**
- **Formát TXT souboru:**
  ```
  NAME: Tutorial 1 - První odraz
  DIFFICULTY: easy
  MAX_MIRRORS: 1
  DESCRIPTION_CZ: Nauč se základy odrazu světla
  DESCRIPTION_EN: Learn the basics of light reflection
  HINT_CZ: Umísti zrcadlo tak, aby světlo dopadlo na cíl
  HINT_EN: Place the mirror to reflect light to the target
  ---
  ##########
  #L.......#
  #........#
  #......T.#
  ##########
  ```
- **Symboly ASCII gridu:**
  - `#` = stěna (solid terrain)
  - `.` = prázdné políčko (walkable)
  - `L` = lampa (light source)
  - `T` = target (goal)
  - `M` = předumístěné zrcadlo (pre-placed mirror)
- **Parser:**
  - Čtení TXT souboru po řádcích
  - Parsing metadata pomocí key-value páru
  - Separátor `---` mezi metadaty a gridem
  - Validace:
    - Přesně jedna lampa `L`
    - Přesně jeden target `T`
    - Grid je obdélníkový (všechny řádky stejně dlouhé)
    - Grid má minimálně 5x5, maximálně 30x30
    - Neobsahuje neznámé symboly
- **Error handling:**
  - Jasné chybové hlášky (např. "Level 'tutorial_01.txt': Missing required field 'NAME'")
  - Výpis řádku a pozice chyby
  - Parser fallback: při chybě vrátí `nullptr` místo crash

**Akceptační kritéria:**
- [ ] TXT formát je zdokumentovaný v `/docs/level-format.md`
- [ ] Parser `LevelParser::parse(const std::string& filepath)` existuje
- [ ] Parser validuje všechna pravidla (rozměry, symboly, min/max)
- [ ] Unit testy pokrývají 10+ edge cases (missing field, invalid symbol, non-rectangular grid, etc.)
- [ ] Error messages obsahují název souboru a řádek chyby

**DoD:**
- Code review passed
- Testy zelené (coverage > 85%)
- Dokumentace commitnuta

---

### Story 5.2: Level Data Structure

**Jako:** Programátor
**Chci:** Interní datovou strukturu pro načtené levely
**Abych:** Měl konzistentní reprezentaci levelu v paměti a mohl s ní efektivně pracovat

**Popis:**
Navrhni C++ třídu `Level` pro interní reprezentaci levelu. Třída musí obsahovat všechna data z TXT souboru plus derived properties (např. grid dimensions). Implementuj loading pipeline a in-memory caching.

**Technické požadavky:**
- **Třída `Level`:**
  ```cpp
  class Level {
  public:
      std::string name;
      Difficulty difficulty;  // enum: EASY, MEDIUM, HARD
      int max_mirrors;
      std::string description_cz;
      std::string description_en;
      std::string hint_cz;
      std::string hint_en;

      Grid2D<CellType> grid;  // 2D array z Epic 2
      Vector2 lamp_position;
      Vector2 target_position;
      std::vector<Vector2> pre_placed_mirrors;

      int width() const;
      int height() const;
      bool is_valid() const;
  };
  ```
- **Enums:**
  ```cpp
  enum class Difficulty { EASY, MEDIUM, HARD };
  enum class CellType { EMPTY, WALL, LAMP, TARGET, MIRROR };
  ```
- **Loading pipeline:**
  - `LevelManager::load_level(const std::string& level_id)` vrací `std::shared_ptr<Level>`
  - Level ID formát: `"tutorial_01"`, `"level_15"`, etc.
  - Cesta k souboru: `/assets/levels/{level_id}.txt`
  - Při prvním načtení se level uloží do cache
- **Caching:**
  - `std::unordered_map<std::string, std::shared_ptr<Level>> level_cache_`
  - Cache invalidace při reloadu (dev mode)
  - Memory management: sdílené pointery pro bezpečnost

**Akceptační kritéria:**
- [ ] Třída `Level` existuje s všemi požadovanými fieldy
- [ ] `LevelManager` načítá levely z `/assets/levels/`
- [ ] Cache funguje: druhé načtení stejného levelu je < 5ms
- [ ] `Level::is_valid()` kontroluje konzistenci dat (lamp a target existují)
- [ ] Unit testy pro loading, caching a validaci

**DoD:**
- Code review passed
- Memory leaks check (valgrind/sanitizers)
- Dokumentace API

---

### Story 5.3: Tutorial Levels (1-5)

**Jako:** Nový hráč
**Chci:** 5 tutoriálových levelů s postupnou obtížností
**Abych:** Se naučil základní mechaniky hry a chápal, jak puzzle řešit

**Popis:**
Vytvoř 5 handcrafted tutoriálových levelů s jasnou progresí. Každý level představuje jeden koncept a má hint text vysvětlující cíl.

**Level design požadavky:**
1. **Tutorial 1: První odraz**
   - Grid: 10x10
   - Max mirrors: 1
   - Koncept: Základní odraz světla od jedného zrcadla
   - Řešení: Umísti zrcadlo mezi lampu a target
   - Hint: "Umísti zrcadlo tak, aby světlo dopadlo na cíl"

2. **Tutorial 2: Dva odrazy**
   - Grid: 12x10
   - Max mirrors: 2
   - Koncept: Řetězení dvou odrazů
   - Překážky: Jedna stěna mezi lampou a targetem
   - Hint: "Někdy je potřeba více než jeden odraz"

3. **Tutorial 3: Přesné umístění**
   - Grid: 10x10
   - Max mirrors: 1
   - Koncept: Přesnost umístění a rotace zrcadla
   - Layout: Úzká chodba s lampou na jednom konci, target na opačné straně
   - Hint: "Úhel zrcadla musí být přesný"

4. **Tutorial 4: Omezené zdroje**
   - Grid: 15x12
   - Max mirrors: 2
   - Koncept: Hraní s limitem zrcadel
   - Layout: Složitější cesta vyžadující přesně 2 zrcadla
   - Hint: "Máš omezený počet zrcadel - použij je moudře"

5. **Tutorial 5: Překážky**
   - Grid: 15x15
   - Max mirrors: 3
   - Koncept: Navigace světla kolem složitých překážek
   - Layout: Místnost s několika stěnami vytvářejícími bludiště
   - Hint: "Světlo může cestovat dlouhou a složitou cestou"

**Implementace:**
- Vytvoř TXT soubory: `/assets/levels/tutorial_01.txt` až `tutorial_05.txt`
- Všechny tutoriály mají `DIFFICULTY: easy`
- Hint texty v češtině i angličtině
- Otestuj řešitelnost ručně před commitem

**Akceptační kritéria:**
- [ ] 5 TXT souborů existuje v `/assets/levels/`
- [ ] Každý level je načitatelný bez chyb
- [ ] Všechny levely jsou ručně otestované a řešitelné
- [ ] Hints jsou v obou jazycích
- [ ] Progrese obtížnosti je plynulá (tutorial 1 = nejjednodušší, tutorial 5 = složitější)

**DoD:**
- Levely commitnuty
- Playtest report (alespoň 2 osoby otestovaly)
- Screenshots levelů v `/docs/levels/screenshots/`

---

### Story 5.4: Standard Levels (6-20)

**Jako:** Hráč, který dokončil tutoriály
**Chci:** 15 standardních levelů s různou obtížností
**Abych:** Měl dostatek obsahu a postupně narůstající challenge

**Popis:**
Vytvoř 15 handcrafted levelů s progresivní obtížností. Levely 6-10 jsou easy, 11-15 medium, 16-20 hard. Každý level má unikátní layout a vyžaduje jiný přístup k řešení.

**Level design požadavky:**

**Easy Levels (6-10):**
- Grid: 12x12 až 15x15
- Max mirrors: 2-3
- Koncept: Jednoduché puzzly s jasnými řešeními
- Typické layouts:
  - Jednoduchý zákrut
  - Několik menších překážek
  - Řešení v 2-3 krocích

**Medium Levels (11-15):**
- Grid: 15x15 až 20x18
- Max mirrors: 3-4
- Koncept: Složitější puzzly vyžadující plánování
- Typické layouts:
  - Více místností propojených chodbami
  - Větší počet překážek
  - Řešení v 3-5 krocích
  - Někdy více možných řešení

**Hard Levels (16-20):**
- Grid: 18x18 až 25x20
- Max mirrors: 4-5
- Koncept: Komplexní puzzly s tight constraints
- Typické layouts:
  - Velké bludiště
  - Maximální využití limitu zrcadel
  - Řešení v 5+ krocích
  - Často jen jedno správné řešení
  - Level 20: finální boss level (největší, nejtěžší)

**Implementace:**
- Vytvoř TXT soubory: `/assets/levels/level_06.txt` až `level_20.txt`
- Pojmenování:
  - `level_06.txt`: "Světelný koridor"
  - `level_10.txt`: "První výzva"
  - `level_15.txt`: "Křišťálové bludiště"
  - `level_20.txt`: "Mistr světla"
- Každý level má:
  - Unikátní název
  - Difficulty tag (easy/medium/hard)
  - Volitelný hint (ne všechny levely musí mít hint)
  - Description v obou jazycích

**Akceptační kritéria:**
- [ ] 15 TXT souborů existuje (`level_06.txt` až `level_20.txt`)
- [ ] Všechny levely jsou načitatelné bez chyb
- [ ] Difficulty progression: 6-10 easy, 11-15 medium, 16-20 hard
- [ ] Každý level je ručně otestovaný a řešitelný
- [ ] Levely mají různorodé layouty (ne copy-paste)
- [ ] Level 20 je výrazně nejtěžší (finální výzva)

**DoD:**
- Levely commitnuty
- Playtest report s completion times
- Difficulty curve je validována playtesty

---

### Story 5.5: Level Loading & Transitions

**Jako:** Hráč
**Chci:** Hladké přechody mezi levely
**Abych:** Měl plynulý zážitek bez vizuálních skoků

**Popis:**
Implementuj loading screen a fade transitions při načítání levelu. Loading musí být asynchronní (nepozastaví rendering) a vizuálně příjemný.

**Technické požadavky:**
- **Loading screen:**
  - Tmavý overlay s alpha 0.8
  - Rotating spinner (jednoduchá animace)
  - Text: "Loading..." / "Načítání..."
  - Progress indikátor není nutný (levely se načítají rychle)
- **Fade-out/fade-in transitions:**
  - Fade-out současného levelu (300ms)
  - Loading nového levelu (< 200ms)
  - Fade-in nového levelu (300ms)
  - Celková transition duration: ~800ms
- **Asynchronní loading:**
  - Level se načítá v separátním threadu (nebo async task)
  - Main thread renderuje loading screen
  - Po načtení se aktivuje fade-in
- **State management:**
  - `GameState::LOADING` stav
  - Během loading state nelze provádět input
  - Po dokončení přechod do `GameState::PLAYING`

**Integrace s Epic 4 (UI):**
- Loading screen používá UI komponenty z Epic 4
- Modal overlay pro fade efekt
- Spinner je custom UI element (nebo CSS animation ekvivalent)

**Akceptační kritéria:**
- [ ] Fade-out/fade-in transitions jsou implementovány
- [ ] Loading screen se zobrazuje během načítání
- [ ] Transition duration je ~800ms
- [ ] Level loading je non-blocking (nepozastaví rendering)
- [ ] Input je disabled během loading state
- [ ] Vizuální test: transitions jsou smooth (60 FPS)

**DoD:**
- Transitions fungují na všech 20 levelech
- Performance test: loading time < 200ms per level
- Code review passed

---

### Story 5.6: Difficulty Progression

**Jako:** Hráč
**Chci:** Vidět obtížnost levelu před jeho spuštěním
**Abych:** Věděl, jakou výzvu očekávat

**Popis:**
Implementuj vizuální indikátory obtížnosti v level select menu a během gameplay. Systém musí jasně komunikovat, zda je level easy, medium nebo hard.

**Technické požadavky:**
- **Visual indicators:**
  - **Easy:** Zelená barva, 1 hvězdička (⭐☆☆)
  - **Medium:** Oranžová barva, 2 hvězdičky (⭐⭐☆)
  - **Hard:** Červená barva, 3 hvězdičky (⭐⭐⭐)
- **Level select menu:**
  - Každý level má difficulty badge v pravém horním rohu
  - Barva pozadí thumbnails odpovídá obtížnosti (subtle tint)
  - Tooltip: "Easy", "Medium", "Hard" (lokalizováno)
- **In-game HUD:**
  - Difficulty indicator v levém horním rohu HUDu
  - Malá ikona s hvězdičkami
  - Neměnné během hry (level obtížnost je fixed)
- **Difficulty mapping:**
  - Tutoriály (1-5): All easy
  - Levely 6-10: Easy
  - Levely 11-15: Medium
  - Levely 16-20: Hard

**Integrace s Epic 4 (UI):**
- Difficulty badge je UI komponenta
- Používá Theme colors z Epic 4
- Responsive layout (přizpůsobuje se velikosti menu)

**Akceptační kritéria:**
- [ ] Level select menu zobrazuje difficulty badge u každého levelu
- [ ] In-game HUD zobrazuje aktuální difficulty
- [ ] Barvy jsou konzistentní: zelená/oranžová/červená
- [ ] Hvězdičky odpovídají obtížnosti (1/2/3)
- [ ] Difficulty je lokalizovaná (Easy/Snadný, Medium/Střední, Hard/Těžký)
- [ ] Visual test: indicators jsou čitelné na všech rozlišeních

**DoD:**
- UI komponenty pro difficulty implementovány
- Screenshot dokumentace v `/docs/ui/`
- Code review passed

---

### Story 5.7: Level Hints

**Jako:** Hráč, který uvízl na levelu
**Chci:** Zobrazit hint k levelu
**Abych:** Dostal nápovědu bez nutnosti použít externí zdroje

**Popis:**
Implementuj systém hintů, který hráčům poskytuje volitelné nápovědy k levelům. Hinty jsou skryté defaultně a zobrazují se na požádání.

**Technické požadavky:**
- **Hint button:**
  - Tlačítko "Show Hint" / "Zobrazit nápovědu" v pause menu
  - Ikona: žárovka nebo otazník
  - Disabled, pokud level nemá hint
- **Hint display:**
  - Modal dialog s hint textem
  - Zobrazuje hint v aktuálním jazyku (CZ/EN)
  - Tlačítko "Close" / "Zavřít"
  - Semi-transparent overlay (neblokuje celou obrazovku)
- **Hint tracking:**
  - Systém loguje, kolik hráčů použilo hint (analytics)
  - Hint count pro každý level (kolikrát hráč hint zobrazil)
  - Ne penalty za použití hintu (jen statistika)
- **Hint content:**
  - Tutoriály (1-5): Všechny mají hinty
  - Easy levely (6-10): ~50% má hinty
  - Medium levely (11-15): ~30% má hinty
  - Hard levely (16-20): ~20% má hinty (challenge je záměrný)

**Integrace s Epic 4 (UI):**
- Hint modal používá `ModalDialog` komponentu z Epic 4
- Tlačítko je standardní UI button

**Akceptační kritéria:**
- [ ] "Show Hint" tlačítko existuje v pause menu
- [ ] Tlačítko je disabled, pokud level nemá hint
- [ ] Hint modal se zobrazuje po kliknutí
- [ ] Hint text je v aktuálním jazyku (CZ/EN)
- [ ] Modal lze zavřít tlačítkem "Close"
- [ ] Všech 5 tutoriálů má funkční hinty
- [ ] Hint usage je logován (pro analytics)

**DoD:**
- UI komponenty implementovány
- Integration testy pro hint display
- Code review passed

---

### Story 5.8: Localization (Czech/English)

**Jako:** Hráč
**Chci:** Hrát hru ve svém preferovaném jazyku
**Abych:** Rozuměl všem textům a instrukcím

**Popis:**
Implementuj kompletní lokalizaci level content do češtiny a angličtiny. Systém musí dynamicky přepínat jazyky bez restartu hry.

**Technické požadavky:**
- **Lokalizovaný content v levelech:**
  - `DESCRIPTION_CZ` a `DESCRIPTION_EN` v každém TXT souboru
  - `HINT_CZ` a `HINT_EN` (pokud level má hint)
  - `NAME` zůstává v angličtině (interní ID), ale zobrazuje se lokalizovaný název
- **Language manager:**
  - Singleton `LocalizationManager`
  - Metoda `set_language(Language lang)` (Language::CZECH nebo Language::ENGLISH)
  - Metoda `get_string(const std::string& key) -> std::string`
  - Default jazyk: detekce systému (fallback na češtinu)
- **Dynamic switching:**
  - Hráč může přepnout jazyk v Settings menu (Epic 4)
  - Po změně jazyka se všechny texty aktualizují okamžitě
  - Level names, descriptions, hints se reloadují
- **Translation keys:**
  - Level names: `level.tutorial_01.name` = "Tutorial 1 - První odraz"
  - Descriptions: `level.tutorial_01.description` = "Nauč se základy..."
  - Hints: `level.tutorial_01.hint` = "Umísti zrcadlo..."
- **Translation files:**
  - `/assets/localization/cs_CZ.json`
  - `/assets/localization/en_US.json`
  - JSON formát:
    ```json
    {
      "level.tutorial_01.name": "Tutorial 1 - První odraz",
      "level.tutorial_01.description": "Nauč se základy...",
      "ui.show_hint": "Zobrazit nápovědu"
    }
    ```

**Integrace s Epic 4 (UI):**
- Settings menu má dropdown pro Language selection
- UI labels používají `LocalizationManager::get_string()`

**Akceptační kritéria:**
- [ ] Všech 20 levelů má české i anglické texty
- [ ] `LocalizationManager` implementován
- [ ] Language switching funguje bez restartu
- [ ] Settings menu má Language dropdown (CZ/EN)
- [ ] Všechny UI texty jsou lokalizované
- [ ] Default jazyk: detekce systému
- [ ] Translation files existují: `cs_CZ.json`, `en_US.json`

**DoD:**
- Všechny texty přeloženy (100% coverage)
- Language switching test (manual + unit test)
- Code review passed

---

### Story 5.9: Level Validation

**Jako:** Developer
**Chci:** Automatickou validaci levelů při buildu
**Abych:** Nikdy necommitl broken level do repository

**Popis:**
Implementuj build-time validaci všech levelů. Systém musí ověřit, že levely jsou syntakticky korektní a řešitelné. Build failuje, pokud jakýkoliv level není validní.

**Technické požadavky:**
- **Validation pipeline:**
  - CMake target: `validate_levels`
  - Spouští se automaticky při `make all`
  - Skenuje `/assets/levels/*.txt`
  - Pro každý level:
    1. Parser check (syntaxe)
    2. Structural check (rozměry, symboly, lamp/target existence)
    3. Solvability check (lze level vyřešit?)
- **Solvability solver:**
  - Jednoduchý breadth-first search (BFS) solver
  - Input: Level (grid, lamp, target, max_mirrors)
  - Output: bool (řešitelné / neřešitelné)
  - Algoritmus:
    1. Generuj všechny možné kombinace umístění zrcadel
    2. Pro každou kombinaci simuluj paprsek (Epic 2 physics)
    3. Pokud paprsek dosáhne targetu = level je řešitelný
  - Timeout: 10 sekund na level (pokud solver nenajde řešení do 10s, level je považován za neřešitelný)
- **Error reporting:**
  - Při chybě: jasná chybová zpráva
    ```
    [LEVEL VALIDATION FAILED]
    File: /assets/levels/level_15.txt
    Error: Level is unsolvable
    Reason: No combination of mirrors leads light to target
    ```
  - Build exituje s non-zero exit code
  - CI/CD pipeline failne (zabráníme merge broken levelů)
- **Validation report:**
  - Po úspěšné validaci: summary report
    ```
    [LEVEL VALIDATION SUCCESS]
    Validated 20 levels:
      - 20 passed syntax check
      - 20 passed structural check
      - 20 passed solvability check
    Total validation time: 3.2s
    ```

**Integrace s Epic 1 (Build):**
- CMake target `validate_levels` je dependency pro `all` target
- CI/CD pipeline spouští validation před testem

**Akceptační kritéria:**
- [ ] CMake target `validate_levels` existuje
- [ ] Validation se spouští automaticky při buildu
- [ ] Solver detekuje neřešitelné levely
- [ ] Build failuje, pokud level není validní
- [ ] Error messages obsahují název souboru a důvod chyby
- [ ] Validation report se zobrazuje po úspěšné validaci
- [ ] Unit testy pro solver (testuje na známých řešitelných/neřešitelných levelech)

**DoD:**
- Solver implementován a otestován
- CMake integration funkční
- CI/CD pipeline validuje levely
- Code review passed

---

### Story 5.10: Level Progression

**Jako:** Hráč
**Chci:** Postupně odemykat nové levely podle progress
**Abych:** Měl smysl postupovat hrou a vnímal achievement

**Popis:**
Implementuj unlocking systém, který odemyká levely postupně. Level N je odemčený pouze pokud hráč dokončil level N-1. Systém trackuje progress a umožňuje replay dokončených levelů.

**Technické požadavky:**
- **Progression systém:**
  - Level 1 (Tutorial 1) je vždy odemčený
  - Level N je odemčený, pokud `is_level_completed(N-1) == true`
  - Hráč může hrát jakýkoliv odemčený level opakovaně
- **Progress tracking:**
  - Persistence: `/save/progress.json`
  - Formát:
    ```json
    {
      "completed_levels": [
        "tutorial_01",
        "tutorial_02",
        "level_06"
      ],
      "current_level": "tutorial_03",
      "total_playtime": 3600
    }
    ```
  - `ProgressManager::mark_completed(const std::string& level_id)`
  - `ProgressManager::is_completed(const std::string& level_id) -> bool`
  - `ProgressManager::is_unlocked(const std::string& level_id) -> bool`
- **UI integration:**
  - Level select menu:
    - Odemčené levely: normální stav (barevné, clickable)
    - Zamčené levely: greyscale, non-clickable, lock icon
    - Dokončené levely: checkmark badge v rohu
  - Completion percentage: "Progress: 15/20 (75%)" v menu headeru
- **Replay funkce:**
  - Hráč může kliknout na dokončený level a hrát ho znovu
  - Progress se nepřepíše (level zůstává completed)
  - Stats se neaktualizují (jen první completion se počítá)
- **Reset progress:**
  - Settings menu: tlačítko "Reset Progress" / "Resetovat postup"
  - Confirmation dialog: "Are you sure? This will delete all progress."
  - Po resetu: pouze Tutorial 1 je odemčený

**Integrace s Epic 4 (UI):**
- Level select menu zobrazuje lock icons
- Checkmarks pro dokončené levely
- Progress bar v headeru menu

**Akceptační kritéria:**
- [ ] Level N je odemčený pouze pokud N-1 je completed
- [ ] Level 1 je vždy odemčený
- [ ] Progress se ukládá do `/save/progress.json`
- [ ] Level select menu zobrazuje lock icons pro zamčené levely
- [ ] Dokončené levely mají checkmark badge
- [ ] Progress percentage se zobrazuje v menu headeru
- [ ] Hráč může hrát dokončené levely opakovaně
- [ ] "Reset Progress" tlačítko funguje
- [ ] Unit testy pro `ProgressManager`

**DoD:**
- Persistence funguje (save/load)
- UI komponenty implementovány
- Integration testy pro unlock logic
- Code review passed

---

## Technické poznámky

### Architektura

**Core komponenty:**
```
src/
├── levels/
│   ├── Level.h/cpp              # Level data structure
│   ├── LevelParser.h/cpp        # TXT parser
│   ├── LevelManager.h/cpp       # Loading, caching
│   ├── LevelValidator.h/cpp     # Validation logic
│   ├── LevelSolver.h/cpp        # Solvability solver (BFS)
│   └── ProgressManager.h/cpp    # Progression tracking
├── localization/
│   └── LocalizationManager.h/cpp
└── ui/
    └── LevelSelectMenu.h/cpp    # Epic 4 extension
```

**Asset struktura:**
```
assets/
├── levels/
│   ├── tutorial_01.txt
│   ├── tutorial_02.txt
│   ├── ...
│   └── level_20.txt
└── localization/
    ├── cs_CZ.json
    └── en_US.json
```

### Dependencies mezi epiky

- **Epic 1:** Build system, asset loading
- **Epic 2:** Physics pro raycast v solver
- **Epic 3:** Rendering levelů (grid, mirrors, rays)
- **Epic 4:** UI komponenty (level select, pause menu, modals)

### Performance targets

- Level parsing: < 50ms per level
- Level loading (s caching): < 5ms
- Level loading (bez cache): < 200ms
- Validation solver: < 10s per level
- Total validation (20 levelů): < 60s

### Testing strategie

- **Unit testy:**
  - Parser edge cases (20+ testů)
  - Solver korektnost (známé řešitelné/neřešitelné levely)
  - Progress manager (save/load, unlock logic)
- **Integration testy:**
  - Loading pipeline (parsing → data structure → rendering)
  - Transitions (fade-out → load → fade-in)
  - Localization switching
- **Playtesty:**
  - Všech 20 levelů manuálně otestováno
  - Difficulty curve validována (min. 3 playtesteři)
  - Tutorial completion rate sledován

---

## Rizika a mitigace

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|--------|-----------------|-------|------------|
| Levely moc těžké/lehké | Střední | Vysoký | Playtesty, iterativní adjustmenty |
| Solver timeout > 10s | Nízká | Střední | Optimalizace BFS, early exit, caching |
| Parser crash na invalid input | Nízká | Vysoký | Robustní error handling, fuzzing |
| Translations neúplné | Nízká | Nízký | Checklist, automated coverage check |
| Progress file corruption | Nízká | Střední | Backup, validace, factory reset |

---

## Definice dokončení (Definition of Done)

Epic 5 je považován za hotový, pokud:

- [ ] Všech 10 stories má status "Done"
- [ ] 20 levelů existuje a je validních
- [ ] Všechny levely jsou hratelné a řešitelné
- [ ] Level loading funguje < 200ms
- [ ] Transitions jsou smooth (60 FPS)
- [ ] Localization je kompletní (CZ + EN)
- [ ] Validation pipeline funguje v CI/CD
- [ ] Progress tracking a unlocking funguje
- [ ] Code coverage > 80%
- [ ] Dokumentace je kompletní
- [ ] Playtest report od min. 3 osob
- [ ] Všechny regresní testy zelené

---

## Závislosti a follow-up

**Závislosti:**
- Epic 1: Build system (CMake, asset management)
- Epic 2: Physics engine (raycasting pro solver)
- Epic 3: Rendering pipeline (zobrazení levelů)
- Epic 4: UI komponenty (menu, dialogy, HUD)

**Follow-up epiky (budoucí):**
- **Epic 6:** Sound & Music (ambient sounds, level complete jingle)
- **Epic 7:** Polish & Juice (particle efekty, screen shake, polish)
- **Epic 8:** Leaderboards & Analytics (time trials, completion stats)

---

## Akceptační kritéria celého epicu

- [ ] 20 handcrafted levelů (5 tutoriálů + 15 standardních)
- [ ] Parser načítá všechny levely bez chyb
- [ ] Level validation failuje build při broken levelu
- [ ] Smooth transitions mezi levely (< 1s)
- [ ] Difficulty progression je jasná a vizuálně rozlišitelná
- [ ] Hints fungují pro relevantní levely
- [ ] Lokalizace CZ/EN je kompletní
- [ ] Progress tracking a unlocking systém funguje
- [ ] Všechny levely jsou playtest-validated

**Metriky:**
- Tutorial completion rate > 90%
- Average level loading time < 200ms
- Solver validation time < 60s (all levels)
- Code coverage > 80%
- Zero known critical bugs

---

**Odhadovaná časová náročnost:** 3-4 týdny (1 programátor)
**Story Points:** 21 SP
**Priorita:** High (blocker pro release)
