# Story 2.1: Level Data Model

## User Story

**As a** vývojář
**I want to** mít interní reprezentaci levelu v paměti
**So that** mohu s ní pracovat v physics enginu

## Popis

Vytvořit `Level` třídu v `src/game/level.js` která parsuje a reprezentuje level data:
- Mapa (grid) - 2D pole s typy buněk
- Lampička (zdroj) - pozice + směr
- Cíl - pozice + očekávaný směr
- Metadata (jméno, obtížnost, max zrcadel)

## Acceptance Criteria

- [ ] Level class má konstruktor s mapData
- [ ] Grid je 2D pole (cellType enums)
- [ ] Lamp má x, y, direction
- [ ] Target má x, y, expectedDirection
- [ ] Metadata: name, difficulty, maxMirrors
- [ ] Validace gridů (min/max velikost)
- [ ] Unit test: 5 testů pro Level class
- [ ] npm test projde

## Technical Details

```javascript
class Level {
  constructor(mapData) {
    this.width = mapData.width
    this.height = mapData.height
    this.grid = mapData.grid  // 2D array
    this.lamp = mapData.lamp  // {x, y, direction}
    this.target = mapData.target  // {x, y, direction}
    this.metadata = mapData.metadata
  }

  isValidPosition(x, y) { ... }
  getCellType(x, y) { ... }
  getCell(x, y) { ... }
}
```

## Odhad

- 1 den (class + validace + testy)
