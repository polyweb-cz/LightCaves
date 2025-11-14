# Story 1.4: Constants & Validation

**Status:** Ready for Implementation
**Story Points:** 5
**Sprint:** 1
**Priority:** Must Have

---

## User Story

**As a** vývojář
**I want to** mít validované Constants s reflexní tabulkou
**So that** mohu věřit že fyzika paprsku bude správná

---

## Acceptance Criteria

- [ ] `constants.js` exportuje `REFLECTION_TABLE` s všema kombinacema
- [ ] Reflexní tabulka má právě 8 kombinací (2 zrcadla × 4 směry) - všechny validní
- [ ] `DIRECTIONS` enum je správně definován (N, S, E, W)
- [ ] Unit testy pokrývají všechny 8 kombinace reflexní tabulky
- [ ] Vitest je nainstalován a nakonfigurován
- [ ] Všechny testy projdou bez chyb (`npm test`)
- [ ] Všechny symboly (`SYMBOLS`) jsou správně definovány
- [ ] Build zvládá unit testy (`npm run test`)

---

## Požadavky

### 1. Reflexní Tabulka
Kompletní lookup tabulka pro optickou fyziku:
- Zrcadlo `/` + 4 směry (N, S, E, W) → 4 kombinace
- Zrcadlo `\` + 4 směry (N, S, E, W) → 4 kombinace
- Celkem: **8 kombinací**

Příklad: Paprsek jdoucí **Sever (N)** do zrcadla `/` se odrazí na **Východ (E)**

### 2. Enum DIRECTIONS
```javascript
DIRECTIONS = { N: 'N', S: 'S', E: 'E', W: 'W' }
```
Lokální validace: Všechny čtyři směry jsou definovány a správně pojmenovány.

### 3. SYMBOLS - ASCII Znaky
```javascript
SYMBOLS = {
  WALL: '█', EMPTY: ' ',
  MIRROR_SLASH: '/', MIRROR_BACKSLASH: '\',
  LAMP_N: '▲', LAMP_E: '►', LAMP_S: '▼', LAMP_W: '◄',
  TARGET_N: '△', TARGET_E: '▷', TARGET_S: '▽', TARGET_W: '◁'
}
```
Validace: Všechny symboly jsou dostupné a unikátní.

### 4. Unit Testy
Lokace: `/src/utils/__tests__/constants.test.js`

**Pokrytí:**
- Test reflexní tabulky - všech 8 kombinací
- Test DIRECTIONS enumů - N, S, E, W
- Test SYMBOLS - přítomnost a validita
- Test REFLECTION_TABLE pro chybné klíče

**Test runner:** Vitest (lightweight, integrován s Vite)

---

## Implementační Detaily

### Soubory
| Soubor | Stav | Popis |
|--------|------|-------|
| `/src/utils/constants.js` | ✓ Existuje | Obsahuje reflexní tabulku a všechny konstanty |
| `/src/utils/__tests__/constants.test.js` | Nový | Vitest unit testy |
| `package.json` | Update | Přidat Vitest dev-dependency |
| `vitest.config.js` | Nový | Vitest konfigurace |

### Vitest Setup
1. Instalace: `npm install -D vitest`
2. Config: `vitest.config.js` (minimální config)
3. Package.json skript: `"test": "vitest"`
4. Možnost: `"test:ui": "vitest --ui"` pro debug

---

## Definice Hotovo (DoD)

✓ Všechny AC splněny
✓ `npm test` projde bez chyb
✓ Reflexní tabulka je fyzikálně správná
✓ Code review passed
✓ Commit pushnut na `main`

---

## Odhad
**1 den** (testovací setup + unit testy)

### Breakdown
- 1h: Vitest setup a konfigurace
- 1h: Psaní unit testů (8 kombinací + edge cases)
- 30m: Ověření fyziky a validace
- 30m: Code review a finalizace
