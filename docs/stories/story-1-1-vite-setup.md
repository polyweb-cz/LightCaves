# Story 1.1: Vite Setup

## User Story
**As a** vývojář
**I want to** mít Vite build pipeline s hot reload
**So that** mohu rychle iterovat během vývoje a mít optimalizovaný production build

## Popis

Tato story zahrnuje kompletní setup Vite build systému pro projekt LightCaves. Vite slouží jako moderní build tool a dev server s extrémně rychlým hot module replacement (HMR), který umožňuje okamžitou zpětnou vazbu během vývoje.

Implementace zahrnuje vytvoření základní Vite konfigurace, nastavení development serveru s HMR, konfiguraci production build pipeline s optimalizacemi (minifikace, tree-shaking, code splitting) a přípravu infrastruktury pro budoucí TypeScript/Canvas integration.

Výsledkem bude funkční development environment, kde vývojář spustí `npm run dev`, otevře browser na localhost:5173 a jakákoliv změna v source kódu se okamžitě projeví v browseru bez refresh. Production build vytvoří optimalizovaný /dist folder připravený pro deployment.

## Acceptance Criteria

- [ ] AC1: `npm init vite` vytvoří skeleton projekt s vanilla JavaScript template
- [ ] AC2: `package.json` obsahuje skripty pro dev, build a preview
- [ ] AC3: `vite.config.js` existuje s konfigurací pro development a production
- [ ] AC4: Dev server běží na localhost:5173 a je dostupný z browseru
- [ ] AC5: Hot Module Replacement (HMR) funguje - změny v JS/CSS se projeví okamžitě bez refresh
- [ ] AC6: Production build vytvoří optimalizovaný kód v `/dist` (minifikace, tree-shaking)
- [ ] AC7: Build output obsahuje správně zpracované assets (HTML, JS, CSS)
- [ ] AC8: `.gitignore` správně ignoruje node_modules, dist, log files a environment files
- [ ] AC9: `npm run preview` spustí preview server pro testování production buildu
- [ ] AC10: Dev server a build proces běží bez chyb a warningů v konzoli

## Technical Details

### Požadavky

**Runtime:**
- Node.js: >= 16.0.0 (doporučeno 18 LTS)
- npm: >= 7.0.0 (doporučeno 9+)

**Dependencies:**
- vite: ^5.0.0 (latest stable)
- Žádné další runtime dependencies v této fázi

**Prohlížeče (target):**
- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- ES2020+ support required

### Kroky implementace

1. **Inicializace projektu**
   ```bash
   npm init vite@latest . -- --template vanilla
   ```
   - Použít vanilla template (čistý JavaScript, bez frameworku)
   - Vite vytvoří základní strukturu s index.html, main.js, style.css

2. **Konfigurace package.json**
   - Upravit project name: `"lightcaves"`
   - Upravit version: `"0.1.0"`
   - Verifikovat scripts:
     ```json
     {
       "scripts": {
         "dev": "vite",
         "build": "vite build",
         "preview": "vite preview"
       }
     }
     ```
   - Přidat popis a metadata projektu

3. **Vytvoření vite.config.js**
   ```javascript
   import { defineConfig } from 'vite'

   export default defineConfig({
     root: './',
     base: './',
     server: {
       port: 5173,
       strictPort: true,
       host: 'localhost',
       open: false
     },
     build: {
       target: 'es2020',
       outDir: 'dist',
       assetsDir: 'assets',
       minify: 'esbuild',
       sourcemap: false,
       rollupOptions: {
         output: {
           manualChunks: undefined
         }
       }
     },
     resolve: {
       extensions: ['.js', '.json']
     }
   })
   ```

4. **Vytvoření .gitignore**
   ```
   # Dependencies
   node_modules/
   package-lock.json

   # Build output
   dist/
   dist-ssr/
   *.local

   # Logs
   logs/
   *.log
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   pnpm-debug.log*

   # Environment
   .env
   .env.local
   .env.*.local

   # Editor
   .vscode/
   .idea/
   *.swp
   *.swo
   *~

   # OS
   .DS_Store
   Thumbs.db
   ```

5. **Instalace dependencies**
   ```bash
   npm install
   ```

6. **Testování dev serveru**
   ```bash
   npm run dev
   ```
   - Otevřít localhost:5173 v browseru
   - Ověřit že se aplikace načte
   - Změnit text v main.js → ověřit HMR (změna bez refresh)

7. **Testování production build**
   ```bash
   npm run build
   npm run preview
   ```
   - Ověřit že /dist obsahuje minifikované soubory
   - Preview server běží bez chyb

### Výsledné soubory

Po dokončení story budou existovat následující soubory:

**Root level:**
- `package.json` - Project metadata, dependencies, npm scripts
- `package-lock.json` - Dependency lock file (tracked in git)
- `vite.config.js` - Vite configuration (dev server, build options)
- `.gitignore` - Git ignore rules
- `index.html` - HTML entry point (Vite používá HTML jako entry)

**Source files:**
- `src/main.js` - JavaScript entry point (importován z index.html)
- `src/style.css` - Global styles (importovány z main.js)
- `public/` - Static assets (optional, pro favicon apod.)

**Generated (ignored by git):**
- `node_modules/` - Installed dependencies
- `dist/` - Production build output

### Příkazy

```bash
# Instalace dependencies
npm install

# Development server s HMR
npm run dev
# → Spustí dev server na http://localhost:5173
# → Změny v kódu se projeví okamžitě

# Production build
npm run build
# → Vytvoří optimalizovaný build v /dist
# → Minifikace, tree-shaking, asset optimization

# Preview production build lokálně
npm run preview
# → Spustí preview server s production buildem
# → Užitečné pro testování před deploymentem
```

### Konfigurace Details

**Dev Server:**
- Port: 5173 (default Vite port)
- Strict port: true (fail if port occupied)
- HMR: enabled by default
- Source maps: inline pro debugging

**Production Build:**
- Target: ES2020 (moderní browsery, menší bundle)
- Minifier: esbuild (rychlejší než terser)
- Source maps: disabled (menší bundle size)
- Asset handling: hash v názvech souborů pro cache busting
- Tree-shaking: automatic (unused code removal)

## Validace / Testing

### Manuální testy

- [ ] **Dev server start**: `npm run dev` spustí server bez chyb
- [ ] **Dev server access**: Browser otevře localhost:5173 a zobrazí aplikaci
- [ ] **Hot reload**: Změna v main.js se projeví okamžitě bez page refresh
- [ ] **CSS HMR**: Změna v style.css se projeví okamžitě bez page refresh
- [ ] **Production build**: `npm run build` vytvoří /dist folder bez chyb
- [ ] **Build output**: /dist obsahuje index.html, minifikovaný JS a CSS
- [ ] **Preview server**: `npm run preview` spustí server s production buildem
- [ ] **Console clean**: Žádné chyby nebo warningy v browser konzoli
- [ ] **Console clean**: Žádné chyby nebo warningy v terminal výstupu
- [ ] **Git ignore**: `git status` neukazuje node_modules ani dist

### Validační checklist

**Development mode:**
```bash
npm run dev
# Expected: Server running at http://localhost:5173
# Expected: No errors in terminal
```

**Production build:**
```bash
npm run build
# Expected: dist/index.html created
# Expected: dist/assets/*.js created (minified)
# Expected: dist/assets/*.css created (minified)
# Expected: "built in XXXms" message
```

**Preview:**
```bash
npm run preview
# Expected: Preview server running
# Expected: Application works identically to dev mode
```

### Performance metriky

- Dev server cold start: < 500ms
- Dev server HMR update: < 100ms
- Production build time: < 5s (pro malý projekt)
- Bundle size: < 50KB (initial, vanilla setup)

## Závislosti

**Předchozí stories:**
- Žádné (první story v Epic 1)

**Blokující pro:**
- Story 1.2: TypeScript Configuration (potřebuje Vite)
- Story 1.3: Canvas Setup (potřebuje dev server)
- Všechny ostatní stories (build pipeline je foundation)

**External dependencies:**
- Node.js runtime
- npm package manager

## Poznámky

### Proč Vite?

- **Rychlost**: Native ESM v dev mode = okamžitý start
- **HMR**: Sub-100ms updates bez full reload
- **Modern**: Optimalizovaný pro ES modules a moderní browsery
- **Simple**: Zero-config pro většinu use cases
- **Production ready**: Rollup-based build s automatickými optimalizacemi

### Budoucí rozšíření

V následujících stories se Vite konfigurace rozšíří o:
- TypeScript support (Story 1.2)
- Path aliases (@/ pro src/)
- Environment variables (.env support)
- Asset optimization (image compression, sprite generation)
- Potenciálně custom Vite plugins pro game assets

### Troubleshooting

**Port 5173 already in use:**
```bash
# Změnit port ve vite.config.js server.port
# nebo killnout běžící Vite process
```

**HMR nefunguje:**
- Zkontrolovat že se soubor importuje (musí být v dependency graph)
- Reloadnout browser
- Restartovat dev server

**Build fails:**
- Zkontrolovat syntax errors v konzoli
- Ověřit že všechny importy existují
- Smazat node_modules a reinstalovat: `rm -rf node_modules && npm install`

## Odhad

**Časová náročnost:** 0.5 - 1 den

**Breakdown:**
- Inicializace a setup: 30 min
- Konfigurace vite.config.js: 30 min
- Testování dev/build/preview: 1 hodina
- Dokumentace a validace: 1 hodina

**Complexity:** Low (standardní setup, well-documented tool)

**Risk:** Minimal (Vite je stable, vanilla template je simple)
