# Story 3.2: Grid & Cell Rendering

## User Story

**As a** hráč
**I want to** vidět herní grid a stěny
**So that** vidím mapu levelu

## Popis

Vytvořit systém pro vykreslování herního gridu:
- Vykreslí grid čar (buňky)
- Vykreslí zdi (černé buňky)
- Vykreslí prázdné buňky (tmavé pozadí)
- Integruje se s Renderer třídou
- Optimization pro velkých mapách

## Acceptance Criteria

- [ ] Třída GridRenderer pro vykreslování gridu
- [ ] drawGrid(level) - vykreslí celý grid
- [ ] drawCell(x, y, cellType) - vykreslí jednu buňku
- [ ] Různé barvy pro stěny a prázdné buňky
- [ ] Gridové čáry pro vizuální orientaci
- [ ] Správné výpočty z konstant CELL_WIDTH/HEIGHT
- [ ] Unit testy: 8 testů
- [ ] npm test projde

## Technical Details

```javascript
class GridRenderer {
  constructor(renderer, level) {
    this.renderer = renderer
    this.level = level
  }

  drawGrid() {
    // Vykresli všechny buňky gridu
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        this.drawCell(x, y)
      }
    }
  }

  drawCell(x, y) {
    const cellType = this.level.getCellType(x, y)
    const px = x * CELL_WIDTH_PX
    const py = y * CELL_HEIGHT_PX

    if (cellType === CELL_TYPES.WALL) {
      this.renderer.drawRect(px, py, CELL_WIDTH_PX, CELL_HEIGHT_PX, COLORS.WALL)
    } else {
      this.renderer.drawRect(px, py, CELL_WIDTH_PX, CELL_HEIGHT_PX, COLORS.BG)
    }
  }
}
```

## Odhad

- 0.5 dne (grid renderer + testy)
