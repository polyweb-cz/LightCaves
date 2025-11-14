# Story 2.4: Beam Path Calculation with Mirrors

## User Story

**As a** hráč
**I want to** vidět cestu paprsku když umístím zrcadla
**So that** můžu ladit řešení puzzle

## Popis

Vytvořit sjednocenou metodu která:
- Počítá cestu paprsku od lampičky
- Integruje umístěná zrcadla
- Vrací kompletní cestu včetně všech odrazů
- Optimalizuje pro výkon (cache, minimální iterace)

## Acceptance Criteria

- [ ] Metoda calculateBeamPath(mirrors) vrací kompletní cestu
- [ ] Cesta obsahuje všechny odrazy
- [ ] Cesta se zastaví na zdi nebo hranici
- [ ] Zastavuje se při detekci cyklu
- [ ] Pracuje s 0 zrcadly (přímý paprsek)
- [ ] Pracuje s více zrcadly (reflexní řetězec)
- [ ] Unit testy: 6 testů
- [ ] npm test projde

## Technical Details

```javascript
// Veřejná API
calculateBeamPath(mirrors = {}) {
  // mirrors = {'x,y': {type: '/', x, y}, ...}
  const path = this.propagateBeam(
    this.level,
    this.level.lamp.x,
    this.level.lamp.y,
    this.level.lamp.direction,
    mirrors
  )
  return path
}

// Interní data struktura
// Path: [{x, y, direction}, {x, y, direction}, ...]
```

## Odhad

- 0.5 dne (integrace + testy)
