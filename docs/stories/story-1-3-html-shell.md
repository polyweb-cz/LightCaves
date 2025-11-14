# Story 1.3: HTML Shell

## User Story
**As a** vývojář
**I want to** mít HTML shell s Canvas a základním CSS
**So that** mohu vykreslit hru na obrazovku

## Popis

Tato story vytváří HTML shell s Canvas elementem a základními styly pro vizuální základnu hry LightCaves. Cílem je připravit validní HTML5 stránku s centrovaným Canvas elementem, vhodným CSS pro ASCII-game aesthetic (černé pozadí, bílý text, monospace font) a všemi potřebnými meta tagy.

Implementace zahrnuje vytvoření/úpravu `index.html` s semantic strukturou, CSS reset a layout v `style.css`, přidání vhodných meta tagů (charset, viewport, theme-color, og:image) a ověření W3C validity. Výsledkem bude připravené základní plátno pro budoucí implementaci game engine.

## Acceptance Criteria

- [ ] AC1: HTML shell existuje v `index.html` s základní strukturou
- [ ] AC2: Canvas element existuje s `id="gameCanvas"`, `width="800"`, `height="600"`
- [ ] AC3: Meta tagy jsou nastaveny: charset UTF-8, viewport, theme-color (#000)
- [ ] AC4: Title je `"LightCaves"`, meta description je vyplněna
- [ ] AC5: CSS (`src/style.css`) nastavuje černé pozadí a centruje Canvas
- [ ] AC6: Font je nastaven na monospace (`font-family: 'Courier New', monospace`)
- [ ] AC7: Canvas má border (bílý, 2px) a černé pozadí (#000)
- [ ] AC8: Page bez zobrazování scrollbarů (overflow: hidden)
- [ ] AC9: HTML prochází W3C validací (bez chyb/warnings)
- [ ] AC10: Stránka se otevírá bez chyb v DevTools (console clean)

## Technical Details

### Požadavky

**Předchozí stories:**
- Story 1.1: Vite Setup (musí být hotová)
- Story 1.2: Folder Structure (vzorná struktura)

**Browser support:**
- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- Canvas API support

### Implementační kroky

#### 1. Úprava `index.html`

Nahradit obsah `index.html`:

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="LightCaves - puzzle game o světle a zrcadlech" />
  <meta property="og:title" content="LightCaves" />
  <meta property="og:description" content="LightCaves - puzzle game o světle a zrcadlech" />

  <title>LightCaves</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <div id="gameContainer">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

#### 2. CSS reset a layout v `src/style.css`

Nahradit obsah `src/style.css`:

```css
/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

/* Game Container & Canvas */
#gameContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #000;
}

#gameCanvas {
  display: block;
  border: 2px solid #fff;
  background-color: #000;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Disable any default interactions */
body, html {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
```

#### 3. Ověření a testování

**HTML validace:**
- Spustit W3C HTML validator na `http://localhost:5173`
- Ověřit že nejsou žádné errors (warnings je OK)

**Browser testing:**
- Otevřít `npm run dev` a jít na localhost:5173
- Ověřit že Canvas je centrovaný na obrazovce
- Ověřit DevTools Console - bez chyb
- Test responsive (změnit velikost okna - Canvas zůstane centrovaný)

**Visual checklist:**
- [ ] Canvas je vidět na černém pozadí
- [ ] Canvas má bílý border
- [ ] Canvas je přesně v centru okna
- [ ] Žádné scrollbary
- [ ] Font je monospace

### Výsledné soubory

**Upravené:**
- `index.html` - HTML shell s Canvas elementem
- `src/style.css` - CSS reset, layout, dark theme

**Bez změn (z Story 1.1/1.2):**
- `src/main.js` - Already exists (Vite entry point)
- `vite.config.js` - Already configured
- `package.json` - Already setup

## Validace / Testing

### Manuální testy

- [ ] **Dev server**: `npm run dev` spustí bez chyb
- [ ] **Visual check**: Canvas je vidět a centrovaný
- [ ] **Console clean**: Žádné errors v browser console
- [ ] **DevTools**: Žádné red errors
- [ ] **Responsive**: Canvas zůstane centrovaný i když se změní velikost okna
- [ ] **Dark theme**: Pozadí je čistě černé (#000)
- [ ] **Border visible**: Canvas má viditelný bílý border
- [ ] **No scrollbars**: Overflow je hidden, scrollbary nejsou

### W3C Validace

```bash
# Spustit dev server
npm run dev

# Otevřít https://validator.w3.org/ a zadat URL localhost:5173
# Ověřit že:
# - Žádné "Errors" nejsou zobrazeny
# - Všechny povinné elementy jsou přítomny
# - Struktura je semantic (<!DOCTYPE>, <html>, <head>, <body>)
```

### Performance

- Page load time: < 500ms (vanilla setup)
- Canvas rendering ready: < 100ms
- No layout shift (CLS = 0)

## Závislosti

**Předchozí stories:**
- Story 1.1: Vite Setup (dev server musí fungovat)

**Blokující pro:**
- Story 1.4: Canvas API & Basic Rendering (potřebuje HTML shell)
- Všechny budoucí game features

**External:**
- Žádné nové external dependencies

## Poznámky

### CSS specifika

- **image-rendering**: `pixelated` pro zachování pixel-perfect vzhledu (ASCII art)
- **overflow: hidden**: Zabránění scrollbar, plné využití viewport
- **monospace font**: Nezbytné pro ASCII aesthetic

### HTML struktura

- **Semantic**: Používá `<canvas>` správně jako interactive content
- **Accessibility**: Data je v meta tagech pro sociální media
- **Responsive**: Viewport meta tag umožní budoucí mobile support

### Budoucí rozšíření

V následujících stories se přidá:
- Canvas resize na window size (Game 1.4)
- Touch/mouse event handling (Game 1.4)
- Game state UI overlay (UI story)

## Odhad

**Časová náročnost:** 0.5 dne (jednoduché)

**Breakdown:**
- Úprava HTML a CSS: 20 min
- Testování a validace: 15 min
- W3C validace a troubleshooting: 15 min

**Complexity:** Very Low (Pure HTML/CSS, no logic)

**Risk:** Minimal (Standardní HTML5, no external dependencies)
