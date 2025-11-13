# Epic 6: Persistence & Settings

**Status:** Planned
**Priorita:** High
**Odhadovaná složitost:** 18 Story Points
**Cílová iterace:** Iterace 6 (FINÁLNÍ)

---

## Přehled

Epic 6 zavádí systém ukládání progressu, nastavení hry a finální build proces pro deployment. Toto je **poslední epic pro MVP** - po jeho dokončení je hra plně hratelná, persistentní a připravená na nasazení na GitHub Pages.

**Kontext z předchozích epiků:**
- **Epic 1:** CMake build, asset management, testing framework
- **Epic 2:** Physics engine pro raycast a reflekce
- **Epic 3:** Rendering pipeline pro vizualizaci hry
- **Epic 4:** UI komponenty (menu, HUD, modal dialogy)
- **Epic 5:** 20 handcrafted levelů s progression systémem

**Klíčové features:**
- localStorage-based persistence (progress, settings)
- Uložení dokončených levelů a aktuální pozice
- Nastavení jazyka, velikosti fontu a zvuku
- Factory reset a clear progress funkce
- Browser compatibility layer (fallback pro starší browsery)
- Data export/import pro backup
- Production build s minifikací a optimalizací
- GitHub Pages deployment pipeline
- Performance profiling a final testing

---

## Business Value

**Proč je tento epic důležitý:**
- Hráči neztratí progress při zavření prohlížeče
- Nastavení se ukládá a aplikuje automaticky
- Hra je deployment-ready (MVP hotové)
- Browser compatibility zajišťuje širokou dostupnost
- Export dat umožňuje backup a sharing

**Metriky úspěchu:**
- 100% progress retention (žádná ztráta dat)
- Settings se aplikují do 100ms po načtení
- Build process < 60 sekund
- Deployment na GitHub Pages funguje jedním příkazem
- Podpora min. 95% moderních prohlížečů

---

## User Stories

### Story 6.1: localStorage Data Model

**Jako:** Developer
**Chci:** Jasně definovaný datový model pro persistence
**Abych:** Měl konzistentní strukturu pro ukládání progressu a nastavení

**Popis:**
Navrhni a implementuj JSON schéma pro ukládání game state do localStorage. Model musí být forward-compatible (umožňuje přidávání nových fieldů) a validovatelný.

**Technické požadavky:**
- **Progress data struktura:**
  ```json
  {
    "version": "1.0.0",
    "progress": {
      "completed_levels": [
        "tutorial_01",
        "tutorial_02",
        "level_06"
      ],
      "current_level": "tutorial_03",
      "last_played": "2025-11-13T14:30:00Z",
      "total_playtime_seconds": 3600
    },
    "settings": {
      "language": "cs_CZ",
      "font_size": "medium",
      "volume": 0.7,
      "hints_enabled": true
    },
    "statistics": {
      "total_levels_completed": 3,
      "total_hints_used": 2,
      "fastest_completion_time": 45
    }
  }
  ```
- **Storage manager třída:**
  ```cpp
  class StorageManager {
  public:
      static StorageManager& instance();

      // Progress methods
      void save_progress(const ProgressData& data);
      ProgressData load_progress();
      void clear_progress();

      // Settings methods
      void save_settings(const SettingsData& data);
      SettingsData load_settings();

      // Validation
      bool validate_data(const std::string& json_string);

  private:
      const std::string STORAGE_KEY = "lightcaves_save_v1";
      const std::string VERSION = "1.0.0";
  };
  ```
- **Validation:**
  - JSON schema validation při load
  - Version check (fallback na default pokud je starší verze)
  - Corrupted data detection (nevalidní JSON = reset na default)
  - Field presence check (required fields musí existovat)
- **Error handling:**
  - `localStorage.setItem()` může failnout (quota exceeded)
  - Graceful degradation: pokud save failne, loguj warning
  - Fallback: in-memory storage pokud localStorage není dostupné

**Akceptační kritéria:**
- [ ] JSON schéma je zdokumentované v `/docs/persistence-schema.md`
- [ ] `StorageManager` třída existuje s všemi metodami
- [ ] Data se ukládají pod klíčem `lightcaves_save_v1`
- [ ] Validation detekuje corrupted data
- [ ] Version check funguje (fallback na default pro staré verze)
- [ ] Unit testy pokrývají save, load, validate, clear
- [ ] Error handling pro quota exceeded

**DoD:**
- Code review passed
- Unit testy zelené (coverage > 90%)
- Dokumentace commitnuta

---

### Story 6.2: Save Progress on Level Complete

**Jako:** Hráč
**Chci:** Automatické uložení progressu po dokončení levelu
**Abych:** Neztratil svůj postup při zavření hry

**Popis:**
Implementuj trigger pro uložení progressu při dokončení levelu. Save musí být rychlý, asynchronní a s error handling pro quota exceeded.

**Technické požadavky:**
- **Save trigger:**
  - Volá se v `VictoryScreen::on_continue_clicked()`
  - Aktualizuje `completed_levels` array
  - Aktualizuje `current_level` na další level
  - Inkrementuje `total_levels_completed` statistiku
- **Save process:**
  ```cpp
  void GameController::save_progress_after_victory() {
      ProgressData data;
      data.completed_levels = progress_manager_.get_completed_levels();
      data.current_level = progress_manager_.get_next_level();
      data.last_played = get_current_timestamp();
      data.total_playtime_seconds = session_time_ + previous_playtime_;

      try {
          storage_manager_.save_progress(data);
          log_info("Progress saved successfully");
      } catch (const StorageException& e) {
          log_error("Failed to save progress: " + e.what());
          show_save_error_dialog();
      }
  }
  ```
- **Error handling:**
  - Quota exceeded: zobraz dialog "Storage full, cannot save progress"
  - localStorage disabled: upozorni hráče "Saving disabled, progress will be lost"
  - Corruption detection: pokud save failne, loguj detailed error
- **Visual feedback:**
  - Subtle "Saving..." indicator (200ms) po kliknutí na Continue
  - "Progress saved" checkmark icon (zmizí po 1 sekundě)
  - Error dialog pokud save failne
- **Performance:**
  - Save operace < 50ms (asynchronní, neblokuje UI)
  - Debounce: pokud hráč spamuje Continue, save pouze jednou

**Integrace s Epic 4 (UI):**
- Victory screen zobrazuje save status
- Error dialog používá `ModalDialog` komponentu

**Akceptační kritéria:**
- [ ] Progress se automaticky ukládá po dokončení levelu
- [ ] `completed_levels` array se aktualizuje správně
- [ ] `current_level` je nastaven na další level
- [ ] "Saving..." indicator se zobrazuje
- [ ] Error dialog se zobrazuje při quota exceeded
- [ ] Save je asynchronní (< 50ms latence)
- [ ] Unit testy pro save trigger a error handling

**DoD:**
- Integration testy: save po victory
- Performance test: save < 50ms
- Code review passed

---

### Story 6.3: Load Progress on Game Start

**Jako:** Hráč
**Chci:** Automatické načtení mého progressu při spuštění hry
**Abych:** Mohl pokračovat tam, kde jsem skončil

**Popis:**
Implementuj loading progressu při startup hry. Systém musí validovat data, detekovat corruption a fallbackovat na default state pokud je potřeba.

**Technické požadavky:**
- **Load trigger:**
  - Volá se v `GameController::initialize()`
  - Načítá data z localStorage před zobrazením main menu
  - Fallback na level 1 pokud žádná data nejsou
- **Load process:**
  ```cpp
  void GameController::load_progress_on_startup() {
      try {
          ProgressData data = storage_manager_.load_progress();

          if (!validate_progress_data(data)) {
              log_warning("Corrupted progress data, resetting to default");
              data = create_default_progress();
          }

          progress_manager_.set_completed_levels(data.completed_levels);
          progress_manager_.set_current_level(data.current_level);
          session_start_time_ = get_current_timestamp();
          previous_playtime_ = data.total_playtime_seconds;

          log_info("Progress loaded: " + std::to_string(data.completed_levels.size()) + " levels completed");
      } catch (const StorageException& e) {
          log_error("Failed to load progress: " + e.what());
          // Fallback na default
          initialize_default_progress();
      }
  }
  ```
- **Validation:**
  - Check verze: pokud je verze novější než supported, upozorni hráče
  - Check completed levels: všechny level IDs existují v `/assets/levels/`
  - Check current level: je validní level ID a je odemčený
  - Check timestamps: jsou validní ISO 8601 formát
- **Fallback strategie:**
  - Žádná data: vytvoř default (level 1, nic completed)
  - Corrupted data: reset na default, loguj warning
  - Neznámá verze: pokus se načíst, ignoruj neznámé fieldy
- **Loading screen:**
  - Zobraz "Loading progress..." text (< 200ms)
  - Fade-in do main menu po načtení
- **Migration:**
  - Pokud je verze 0.9.x, migruj na 1.0.0 format
  - Backup starých dat před migrací

**Akceptační kritéria:**
- [ ] Progress se načítá automaticky při startupu
- [ ] Validace detekuje corrupted data
- [ ] Fallback na default funguje
- [ ] Level select menu zobrazuje správné odemčené levely
- [ ] Current level je nastaven správně
- [ ] Loading screen se zobrazuje
- [ ] Unit testy pro load, validation, fallback, migration

**DoD:**
- Integration testy: load při startup
- Edge case testy: corrupted data, missing fields
- Code review passed

---

### Story 6.4: Settings Persistence

**Jako:** Hráč
**Chci:** Uložení mých nastavení (jazyk, font, volume)
**Abych:** Je nemusel nastavovat znovu při každém spuštění

**Popis:**
Implementuj ukládání a načítání nastavení z Epic 4 (language, font size, volume). Settings se aplikují automaticky při startupu a ukládají se okamžitě po změně.

**Technické požadavky:**
- **Settings data struktura:**
  ```cpp
  struct SettingsData {
      Language language;        // CZECH, ENGLISH
      FontSize font_size;       // SMALL, MEDIUM, LARGE
      float volume;             // 0.0 - 1.0
      bool hints_enabled;       // true/false
  };
  ```
- **Save trigger:**
  - Volá se okamžitě po změně nastavení v Settings menu
  - Auto-save (žádný "Save" button není potřeba)
  - Debounce: pokud hráč mění slider rychle, save po 500ms inactivity
- **Load trigger:**
  - Volá se při startupu (po načtení progressu)
  - Aplikuje nastavení na UI komponenty
  - Aplikuje nastavení na game engine (volume, language)
- **Settings manager:**
  ```cpp
  class SettingsManager {
  public:
      static SettingsManager& instance();

      void set_language(Language lang);
      Language get_language() const;

      void set_font_size(FontSize size);
      FontSize get_font_size() const;

      void set_volume(float volume);
      float get_volume() const;

      void set_hints_enabled(bool enabled);
      bool are_hints_enabled() const;

      void save();
      void load();

  private:
      SettingsData settings_;
      StorageManager& storage_;
  };
  ```
- **Default settings:**
  - Language: detekce browser locale (fallback: cs_CZ)
  - Font size: MEDIUM
  - Volume: 0.7
  - Hints enabled: true
- **Apply settings:**
  - Language: aktualizuj `LocalizationManager` (Epic 5)
  - Font size: aktualizuj CSS root variable `--font-size`
  - Volume: aktualizuj audio engine (Epic 7 placeholder)
  - Hints enabled: schovej/zobraz hint button

**Integrace s Epic 4 (UI):**
- Settings menu čte a zapisuje přes `SettingsManager`
- Změny se aplikují okamžitě (live preview)

**Akceptační kritéria:**
- [ ] Settings se ukládají okamžitě po změně
- [ ] Settings se načítají při startupu
- [ ] Language setting aplikuje lokalizaci
- [ ] Font size aplikuje CSS změny
- [ ] Volume setting je připraven (placeholder pro audio)
- [ ] Default settings fungují (locale detection)
- [ ] Unit testy pro save, load, apply

**DoD:**
- Integration testy: změna settings → save → restart → load
- Visual test: settings jsou aplikované
- Code review passed

---

### Story 6.5: Clear Progress / Factory Reset

**Jako:** Hráč
**Chci:** Možnost smazat všechen progress a začít znovu
**Abych:** Mohl hru hrát od začátku nebo předat někomu jinému

**Popis:**
Implementuj "Clear Progress" funkci v Settings menu. Funkce smaže všechen progress (completed levels, stats) ale zachová nastavení (language, font, volume). Vyžaduje confirmation dialog.

**Technické požadavky:**
- **Clear Progress button:**
  - Lokace: Settings menu, sekce "Danger Zone"
  - Text: "Clear Progress" / "Vymazat postup"
  - Barva: červená (warning action)
  - Icon: trash can nebo reset icon
- **Confirmation dialog:**
  ```
  Title: "Clear All Progress?"
  Message: "This will delete all your completed levels and statistics.
           Your settings (language, volume) will be preserved.
           This action cannot be undone."
  Buttons: [Cancel] [Clear Progress]
  ```
  - Cancel button: zavře dialog, nic se nestane
  - Clear Progress button: červený, provede reset
- **Clear process:**
  ```cpp
  void GameController::clear_progress() {
      // Backup settings
      SettingsData settings = settings_manager_.get_settings();

      // Clear progress data
      ProgressData default_progress = create_default_progress();
      storage_manager_.save_progress(default_progress);

      // Restore settings
      settings_manager_.save_settings(settings);

      // Reset UI state
      progress_manager_.reset();
      level_select_menu_.reload();

      log_info("Progress cleared, settings preserved");
      show_notification("Progress has been reset");
  }
  ```
- **Factory reset (advanced):**
  - Druhý button: "Factory Reset" / "Tovární nastavení"
  - Smaže progress i settings
  - Confirmation dialog je přísnější:
    ```
    "This will delete EVERYTHING (progress and settings).
     Are you absolutely sure?"
    ```
- **Visual feedback:**
  - Po resetu: zobraz notification "Progress cleared"
  - Automatický návrat do main menu
  - Level select menu se reloadne (jen Tutorial 1 odemčený)

**Integrace s Epic 4 (UI):**
- Confirmation dialog používá `ModalDialog` komponentu
- Notification používá toast notification systém

**Akceptační kritéria:**
- [ ] "Clear Progress" button existuje v Settings menu
- [ ] Confirmation dialog se zobrazuje
- [ ] Clear progress smaže completed levels a stats
- [ ] Settings jsou zachované (language, font, volume)
- [ ] "Factory Reset" smaže vše (progress + settings)
- [ ] Level select menu se reloadne po resetu
- [ ] Notification se zobrazuje po úspěšném resetu
- [ ] Unit testy pro clear progress a factory reset

**DoD:**
- Integration testy: clear → restart → verify reset
- Manual test: confirmation dialog funguje
- Code review passed

---

### Story 6.6: Browser Compatibility Check

**Jako:** Hráč
**Chci:** Hru hrát i na starším prohlížeči
**Abych:** Nebyl limitovaný technickými požadavky

**Popis:**
Implementuj detekci podpory localStorage a fallback pro starší prohlížeče. Pokud localStorage není dostupné, hra funguje v in-memory módu s varováním hráči.

**Technické požadavky:**
- **localStorage detection:**
  ```cpp
  bool StorageManager::is_local_storage_available() {
      try {
          const std::string test_key = "__lightcaves_test__";
          localStorage.setItem(test_key, "test");
          localStorage.removeItem(test_key);
          return true;
      } catch (const std::exception& e) {
          return false;
      }
  }
  ```
- **Fallback: in-memory storage:**
  - Pokud localStorage není dostupné, použij `std::map<std::string, std::string>`
  - Data přežijí session, ale ne refresh
  - Upozorni hráče: "Your progress will not be saved between sessions"
- **Browser compatibility warning:**
  - Zobraz modal dialog při startupu pokud localStorage není dostupné:
    ```
    Title: "Limited Browser Support"
    Message: "Your browser doesn't support data persistence.
             Progress will be lost when you close this tab.
             For best experience, use a modern browser (Chrome, Firefox, Edge)."
    Button: [Continue Anyway]
    ```
  - Warning se zobrazuje jen jednou per session
- **Supported browsers:**
  - Chrome 4+
  - Firefox 3.5+
  - Safari 4+
  - Edge (všechny verze)
  - IE 8+ (best effort, žádná záruka)
- **Feature detection:**
  - Check localStorage
  - Check JSON.parse/stringify
  - Check ES6 features (fallback na transpiled code)
- **Graceful degradation:**
  - localStorage unavailable: in-memory fallback
  - JSON unavailable: použij custom parser (velmi unlikely)
  - Cookies fallback: ne (příliš omezené, 4KB limit)

**Akceptační kritéria:**
- [ ] localStorage detection funguje
- [ ] In-memory fallback funguje
- [ ] Warning dialog se zobrazuje při no localStorage
- [ ] Hra funguje v in-memory módu (progress v session)
- [ ] Dokumentace v `/docs/browser-compatibility.md`
- [ ] Testováno na min. 3 prohlížečích (Chrome, Firefox, Safari)
- [ ] Unit testy pro detection a fallback

**DoD:**
- Cross-browser testing passed
- Dokumentace commitnuta
- Code review passed

---

### Story 6.7: Data Export/Import

**Jako:** Hráč
**Chci:** Exportovat a importovat můj progress
**Abych:** Mohl zálohovat data nebo sdílet progress s kamarády

**Popis:**
Implementuj export progressu jako JSON soubor a import z JSON. Bonus: share score feature s base64 encoding pro sdílení přes URL.

**Technické požadavky:**
- **Export funkce:**
  - Button v Settings menu: "Export Progress" / "Exportovat postup"
  - Vygeneruje JSON soubor ke stažení:
    ```json
    {
      "export_version": "1.0.0",
      "exported_at": "2025-11-13T14:30:00Z",
      "progress": { ... },
      "settings": { ... },
      "statistics": { ... }
    }
    ```
  - Filename: `lightcaves_progress_2025-11-13.json`
  - Download mechanismus:
    ```cpp
    void export_progress() {
        std::string json = storage_manager_.export_to_json();
        std::string filename = "lightcaves_progress_" + get_current_date() + ".json";
        trigger_download(filename, json);
    }
    ```
- **Import funkce:**
  - Button: "Import Progress" / "Importovat postup"
  - File picker: vybrat JSON soubor
  - Validation:
    - Check export_version
    - Validate JSON schema
    - Check data integrity
  - Confirmation dialog:
    ```
    "Importing will overwrite your current progress.
     Are you sure you want to continue?"
    ```
  - Po importu: reload game state, zobraz notification
- **Share score feature (bonus):**
  - Button: "Share Score" / "Sdílet skóre"
  - Vygeneruje base64 encoded string:
    ```
    completed: 15/20, playtime: 2h 30m
    Code: TGlnaHRDYXZlczE1MjAyaDMw...
    ```
  - Copyable link: `https://your-game.com/?import=TGlnaHRDYXZlczE1...`
  - Při otevření linku: nabídni import progressu
- **Security:**
  - Validace importovaných dat (prevent injection)
  - Whitelist allowed fields
  - Sanitize hodnoty (např. volume jen 0.0-1.0)

**Integrace s Epic 4 (UI):**
- Export/Import buttons v Settings menu
- File picker dialog
- Share modal s copyable link

**Akceptační kritéria:**
- [ ] Export progress vytvoří JSON soubor ke stažení
- [ ] Import progress načte JSON a validuje data
- [ ] Confirmation dialog před importem
- [ ] Share score vygeneruje base64 kód
- [ ] Import z URL funguje (`?import=...`)
- [ ] Validace brání corrupted/malicious importu
- [ ] Unit testy pro export, import, validation

**DoD:**
- Integration testy: export → import → verify
- Security review: injection prevention
- Code review passed

---

### Story 6.8: Build & Deployment Pipeline

**Jako:** Developer
**Chci:** Automatizovaný build a deployment na GitHub Pages
**Abych:** Mohl nasadit hru jedním příkazem

**Popis:**
Implementuj production build s minifikací a GitHub Pages deployment. Hra musí být optimalizovaná pro production (minified JS/CSS, compressed assets).

**Technické požadavky:**
- **Production build:**
  - CMake target: `make production`
  - Kroky:
    1. Compile C++ code s `-O3` optimalizací
    2. Transpile ES6 → ES5 (pro starší browsery)
    3. Minify JavaScript (UglifyJS nebo Terser)
    4. Minify CSS (cssnano)
    5. Compress assets (PNG → optimized PNG, TXT → gzip)
    6. Generate `dist/` folder s production buildem
  - Build time: < 60 sekund
- **Build configuration:**
  ```cmake
  # CMakeLists.txt
  if(CMAKE_BUILD_TYPE STREQUAL "Release")
      set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -DNDEBUG")
      set(MINIFY_JS ON)
      set(COMPRESS_ASSETS ON)
  endif()
  ```
- **GitHub Pages deployment:**
  - Script: `scripts/deploy.sh`
  - Kroky:
    ```bash
    #!/bin/bash
    # Build production version
    npm run build

    # Copy dist/ to gh-pages branch
    git checkout -B gh-pages
    git add dist/
    git commit -m "Deploy to GitHub Pages"
    git push origin gh-pages --force
    git checkout main
    ```
  - NPM script: `npm run deploy` volá `scripts/deploy.sh`
- **.gitignore:**
  ```
  # Build artifacts
  build/
  dist/
  node_modules/

  # IDE
  .vscode/
  .idea/
  *.swp

  # OS
  .DS_Store
  Thumbs.db
  ```
- **Environment variables:**
  - `.env.example` (commitnuto)
  - `.env` (gitignored)
  - Proměnné:
    ```
    GITHUB_TOKEN=your_token_here
    DEPLOY_BRANCH=gh-pages
    ```
- **GitHub Actions (CI/CD):**
  - `.github/workflows/deploy.yml`
  - Trigger: push to `main` branch
  - Steps:
    1. Checkout code
    2. Install dependencies
    3. Run tests
    4. Build production
    5. Deploy to gh-pages
  - Auto-deployment na každý commit do `main`

**Akceptační kritéria:**
- [ ] `npm run build` vytvoří production build v `dist/`
- [ ] Build obsahuje minified JS a CSS
- [ ] Assets jsou compressed
- [ ] `npm run deploy` nasadí na GitHub Pages
- [ ] GitHub Actions CI/CD funguje
- [ ] `.gitignore` ignoruje build artifacts
- [ ] Dokumentace deployment v `/docs/deployment.md`
- [ ] Deployment time: < 3 minuty (build + push)

**DoD:**
- Production build funguje lokálně
- GitHub Pages deployment funguje
- CI/CD pipeline je zelená
- Dokumentace commitnuta
- Code review passed

---

### Story 6.9: Performance & Testing

**Jako:** Developer
**Chci:** Profilovat performance a otestovat persistence layer
**Abych:** Zajistil, že hra je rychlá a spolehlivá

**Popis:**
Implementuj performance profiling pro localStorage I/O a kompletní test suite pro persistence layer. Všechny testy musí projít před deploym.

**Technické požadavky:**
- **Performance profiling:**
  - Měření localStorage save/load times
  - Target: save < 50ms, load < 100ms
  - Profiling tool: Chrome DevTools Performance tab
  - Test s různými velikostmi dat:
    - Small: 5 completed levels
    - Medium: 15 completed levels
    - Large: 20 completed levels + 1000 stats entries
  - Report v `/docs/performance-report.md`
- **Unit testy:**
  - **StorageManager:**
    - `test_save_progress()` - ukládání progressu
    - `test_load_progress()` - načítání progressu
    - `test_validate_data()` - validace JSON
    - `test_corrupted_data()` - handling corrupted data
    - `test_quota_exceeded()` - handling quota error
    - `test_version_migration()` - migrace z 0.9.x na 1.0.0
  - **SettingsManager:**
    - `test_save_settings()` - ukládání nastavení
    - `test_load_settings()` - načítání nastavení
    - `test_default_settings()` - default values
    - `test_apply_settings()` - aplikace settings
  - **ProgressManager:**
    - `test_mark_completed()` - označení levelu jako completed
    - `test_is_unlocked()` - unlocking logic
    - `test_clear_progress()` - reset progressu
  - Coverage target: > 90%
- **Integration testy:**
  - **Save/Load flow:**
    ```cpp
    test_save_load_flow() {
        // 1. Dokončit level
        game.complete_level("tutorial_01");

        // 2. Save progress
        game.save_progress();

        // 3. Simulovat restart
        game.restart();

        // 4. Load progress
        game.load_progress();

        // 5. Verify
        assert(game.is_level_completed("tutorial_01"));
        assert(game.get_current_level() == "tutorial_02");
    }
    ```
  - **Clear progress flow:**
    - Dokončit levely → clear → restart → verify reset
  - **Settings persistence flow:**
    - Změnit settings → restart → verify settings aplikované
  - **Export/Import flow:**
    - Export → clear → import → verify data restored
- **Edge case testy:**
  - localStorage disabled (in-memory fallback)
  - Corrupted JSON (fallback na default)
  - Quota exceeded (error dialog)
  - Invalid level IDs v completed_levels
  - Future version (neznámé fieldy ignorovány)
  - Concurrent save operations (race conditions)
- **Performance benchmarks:**
  - localStorage I/O: save < 50ms, load < 100ms
  - Validation: < 10ms
  - Export: < 200ms
  - Import: < 300ms

**Akceptační kritéria:**
- [ ] Všechny unit testy projdou (> 90% coverage)
- [ ] Všechny integration testy projdou
- [ ] Edge case testy pokrývají 10+ scénářů
- [ ] Performance benchmarks splněny
- [ ] Performance report v `/docs/performance-report.md`
- [ ] Test suite běží v CI/CD pipeline
- [ ] Zero known critical bugs

**DoD:**
- Test suite zelená
- Performance report commitnut
- Code coverage > 90%
- Code review passed

---

## Technické poznámky

### Architektura

**Core komponenty:**
```
src/
├── persistence/
│   ├── StorageManager.h/cpp         # localStorage I/O
│   ├── ProgressData.h               # Data structures
│   ├── SettingsData.h
│   └── DataValidator.h/cpp          # JSON validation
├── settings/
│   └── SettingsManager.h/cpp        # Settings logic
└── export/
    └── ExportManager.h/cpp          # Export/Import

tests/
├── persistence/
│   ├── storage_manager_test.cpp
│   └── data_validator_test.cpp
└── integration/
    └── save_load_flow_test.cpp
```

**Data flow:**
```
GameController
    ↓
ProgressManager → StorageManager → localStorage
    ↓                    ↑
SettingsManager ←────────┘
```

### Dependencies mezi epiky

- **Epic 1:** Build system (CMake, deployment scripts)
- **Epic 4:** UI komponenty (Settings menu, modal dialogy)
- **Epic 5:** Progress tracking (completed levels, current level)

### Performance targets

- localStorage save: < 50ms
- localStorage load: < 100ms
- Data validation: < 10ms
- Export: < 200ms
- Import: < 300ms
- Build time: < 60 sekund
- Deployment time: < 3 minuty

### Testing strategie

- **Unit testy:**
  - StorageManager (10+ testů)
  - SettingsManager (8+ testů)
  - DataValidator (12+ testů)
- **Integration testy:**
  - Save/Load flow
  - Clear progress flow
  - Settings persistence flow
  - Export/Import flow
- **Performance testy:**
  - localStorage I/O benchmarks
  - Large data set tests
  - Concurrent operation tests
- **Cross-browser testy:**
  - Chrome, Firefox, Safari, Edge
  - localStorage availability check
  - In-memory fallback validation

---

## Rizika a mitigace

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|--------|-----------------|-------|------------|
| Quota exceeded (storage full) | Střední | Nízký | Error dialog, graceful degradation |
| localStorage disabled (privacy mode) | Střední | Střední | In-memory fallback, warning dialog |
| Corrupted save data | Nízká | Střední | Validation, fallback na default |
| Browser compatibility issues | Nízká | Střední | Feature detection, fallback |
| GitHub Pages deployment fail | Nízká | Vysoký | Manual deployment fallback, CI/CD monitoring |
| Build process timeout | Nízká | Nízký | Optimalizace build, incrementální builds |

---

## Definice dokončení (Definition of Done)

Epic 6 je považován za hotový, pokud:

- [ ] Všech 9 stories má status "Done"
- [ ] Progress se ukládá a načítá správně
- [ ] Settings jsou persistentní
- [ ] Clear progress a factory reset fungují
- [ ] Browser compatibility layer funguje
- [ ] Export/Import dat funguje
- [ ] Production build < 60 sekund
- [ ] GitHub Pages deployment jedním příkazem
- [ ] Všechny unit testy zelené (> 90% coverage)
- [ ] Všechny integration testy zelené
- [ ] Performance benchmarks splněny
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari)
- [ ] Dokumentace kompletní
- [ ] Zero known critical bugs
- [ ] **MVP je hotový a deployment-ready**

---

## Závislosti a follow-up

**Závislosti:**
- Epic 1: Build system, CMake
- Epic 4: UI komponenty (Settings menu, modal dialogy)
- Epic 5: Progress tracking, level completion

**Follow-up epiky (post-MVP):**
- **Epic 7:** Sound & Music (ambient sounds, victory jingle, volume control)
- **Epic 8:** Polish & Juice (particle effects, screen shake, animations)
- **Epic 9:** Analytics & Leaderboards (completion times, global stats)
- **Epic 10:** Level Editor (community level creation)

---

## Akceptační kritéria celého epicu

- [ ] localStorage persistence funguje (save/load)
- [ ] Settings jsou automaticky aplikované při startupu
- [ ] Clear progress a factory reset fungují
- [ ] Browser compatibility warning pro staré browsery
- [ ] Export/Import dat funguje
- [ ] Production build optimalizuje assets (minified, compressed)
- [ ] GitHub Pages deployment jedním příkazem
- [ ] Performance: save < 50ms, load < 100ms
- [ ] Test coverage > 90%
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

**Metriky:**
- 100% progress retention (žádná ztráta dat)
- Settings aplikovány do 100ms po načtení
- Build time < 60 sekund
- Deployment time < 3 minuty
- Zero critical bugs
- 95%+ browser support

---

## Post-MVP Roadmap

Po dokončení Epic 6 je **MVP hotové**. Další rozvoj:

1. **Phase 2: Polish (Epic 7-8)**
   - Sound effects & music
   - Visual polish & animations
   - Particle effects

2. **Phase 3: Community (Epic 9-10)**
   - Leaderboards & analytics
   - Level editor
   - Community sharing

3. **Phase 4: Mobile (Epic 11)**
   - Touch controls
   - Responsive design
   - PWA support

---

**Odhadovaná časová náročnost:** 2-3 týdny (1 programátor)
**Story Points:** 18 SP
**Priorita:** High (blocker pro release)
**Status po dokončení:** **MVP READY FOR DEPLOYMENT**
