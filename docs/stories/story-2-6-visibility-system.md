# Story 2.6: Visibility/Fog of War System

## User Story

**As a** grafik
**I want to** znát všechny buňky, které jsou paprskem osvětleny
**So that** mohu správně vykreslovat světlo v levelu

## Popis

Vytvořit systém pro sledování osvětlenosti:
- Spočítá všechny osvětlené buňky
- Vrací mapu osvětlení (Set nebo Array)
- Integruje se s beam path
- Optimalizuje pro rychlost

## Acceptance Criteria

- [ ] Metoda getIlluminatedCells(beamPath) vrací Set buněk
- [ ] Obsahuje všechny buňky z beam path
- [ ] Obsahuje startovní pozici lampičky
- [ ] Pracuje bez paprsků (prázdné levely)
- [ ] Vrací správné souřadnice {x, y}
- [ ] Optimalizován pro >100 buněk za milisekundu
- [ ] Unit testy: 6 testů
- [ ] npm test projde

## Technical Details

```javascript
getIlluminatedCells(beamPath) {
  const illuminated = new Set()

  // Přidej lampičku
  if (this.level && this.level.lamp) {
    illuminated.add(`${this.level.lamp.x},${this.level.lamp.y}`)
  }

  // Přidej všechny buňky z paprsku
  if (beamPath && Array.isArray(beamPath)) {
    beamPath.forEach(cell => {
      illuminated.add(`${cell.x},${cell.y}`)
    })
  }

  return illuminated
}
```

## Odhad

- 0.25 dne (fog of war + testy)
