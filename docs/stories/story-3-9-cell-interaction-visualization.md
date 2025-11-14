# Story 3.9: Cell Interaction Visualization

## User Story

**As a** hráč
**I want to** vidět které políčko je pod myší a která jsou označena
**So that** mám vizuální feedback na své interakce

## Popis

Vytvořit systém pro vykreslování interaktivních efektů na buňkách:
- Hover efekt na buňce pod myší
- Zvýraznění vybrané buňky
- Indikátor klikatelné buňky (viditelná/neviditelná mapa)
- Highlight buňky, kam lze umístit zrcadlo
- Červené zvýraznění nevalidních políček

## Acceptance Criteria

- [ ] Třída CellHighlightRenderer
- [ ] drawCellHighlight(x, y, type) - vykreslí highlight na buňce
- [ ] drawHoverCell(x, y) - vykreslí hover efekt
- [ ] drawSelectedCell(x, y) - vykreslí vybranou buňku
- [ ] drawValidPlacement(x, y) - vykreslí validní místo pro zrcadlo
- [ ] drawInvalidCell(x, y) - vykreslí nevalidní buňku (červeně)
- [ ] drawAllHighlights(highlights) - vykreslí všechny zvýraznění
- [ ] Unit testy: 12 testů
- [ ] npm test projde

## Technical Details

```javascript
// Cell highlight types
const HIGHLIGHT_TYPES = {
  HOVER: { color: '#FFFF00', opacity: 0.3 },      // Yellow, subtle
  SELECTED: { color: '#00FF00', opacity: 0.5 },   // Green
  VALID_PLACEMENT: { color: '#00FF00', opacity: 0.2 }, // Light green
  INVALID: { color: '#FF0000', opacity: 0.4 }     // Red
}

drawCellHighlight(x, y, type) {
  const config = HIGHLIGHT_TYPES[type]
  const px = x * this.gridRenderer.cellWidth
  const py = y * this.gridRenderer.cellHeight

  this.renderer.ctx.globalAlpha = config.opacity
  this.renderer.drawRect(
    px, py,
    this.gridRenderer.cellWidth,
    this.gridRenderer.cellHeight,
    config.color
  )
  this.renderer.ctx.globalAlpha = 1.0
}

drawHoverCell(x, y) {
  this.drawCellHighlight(x, y, 'HOVER')
}

drawValidPlacement(x, y) {
  const isCellEmpty = this.level.isCellEmpty(x, y)
  if (isCellEmpty) {
    this.drawCellHighlight(x, y, 'VALID_PLACEMENT')
  } else {
    this.drawCellHighlight(x, y, 'INVALID')
  }
}
```

## Odhad

- 0.5 dne (highlight renderer + testy)
