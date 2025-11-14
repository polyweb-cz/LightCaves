# Story 1.4: Constants & Validation

## User Story

**As a** vývojář
**I want to** mít validované Constants s reflexní tabulkou
**So that** mohu věřit že fyzika paprsku bude správná

## Popis

Validace a testování `src/utils/constants.js` - reflexní tabulka, direction enum, symboly. Přidat Vitest test runner a psát unit testy pro všech 8 kombinací reflexe.

## Acceptance Criteria

- [ ] REFLECTION_TABLE exportován a zawiera všech 8 kombinací
- [ ] DIRECTIONS enum má N, S, E, W
- [ ] SYMBOLS enum má všechny ASCII znaky
- [ ] Vitest je nainstalován (`npm install -D vitest`)
- [ ] Unit test soubor: `src/utils/__tests__/constants.test.js`
- [ ] Test soubor pokrývá všech 8 kombinací reflexe
- [ ] `npm test` projde bez chyb
- [ ] Test coverage > 80%

## Technical Details

### Reflexní tabulka - očekávané kombinace

```
/ (forward slash):
  N → E (nahoru → doprava)
  S → W (dolů → doleva)
  E → N (doprava → nahoru)
  W → S (doleva → dolů)

\ (backslash):
  N → W (nahoru → doleva)
  S → E (dolů → doprava)
  E → S (doprava → dolů)
  W → N (doleva → nahoru)
```

### Implementační kroky

1. Nainstalovat Vitest: `npm install -D vitest`
2. Přidat test script do package.json: `"test": "vitest"`
3. Vytvořit `src/utils/__tests__/constants.test.js`
4. Napsat 8 test cases (jeden pro každou kombinaci)
5. Spustit `npm test` a ověřit projití

## Validation / Testing

- [ ] Všechny testy projdou
- [ ] Žádné console chyby
- [ ] Build nebude ovlivněn (`npm run build` funguje)

## Odhad

- 1 den (Vitest setup + 8 testů)

## Poznámky

- Constants.js je již vytvořen v Story 1.2
- Reflexní tabulka je již správná, jen ji testujeme
- Vitest je lightweight, integruje se s Vite
