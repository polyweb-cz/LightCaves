# Story 2.2: Beam Propagation Engine

## User Story

**As a** fyzikář
**I want to** mít algoritmus pro šíření paprsku po mapě
**So that** paprsek se správně šíří od lampičky

## Popis

Vytvořit algoritmus v `src/game/physics.js` který:
- Počítá paprsek od lampičky krok po kroku
- Zastavuje se na zdích
- Ignoruje zrcadla (zatím jen jde dál)
- Vrací cestu paprsku jako array bodů

## Acceptance Criteria

- [ ] propagateBeam(level, lampPosition, direction) metoda
- [ ] Paprsek se šíří správným směrem
- [ ] Zastavuje se na zdích
- [ ] Vrací array souřadnic [x, y]
- [ ] Bez smyčky (zastaví se na kraji mapy)
- [ ] Unit testy: 5 testů
- [ ] npm test projde

## Technical Details

```javascript
function propagateBeam(level, startX, startY, direction) {
  let x = startX, y = startY
  const path = []

  while (true) {
    // Pohni se v daném směru
    const next = getNextPosition(x, y, direction)

    // Zkontroluj hranice
    if (!level.isValidPosition(next.x, next.y)) break

    // Zkontroluj zdi
    if (level.isWall(next.x, next.y)) break

    // Přidej do cesty
    path.push({x: next.x, y: next.y})
    x = next.x
    y = next.y
  }

  return path
}
```

## Odhad

- 1 den (algoritmus + testy)
