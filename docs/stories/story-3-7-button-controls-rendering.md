# Story 3.7: Button Controls Rendering

## User Story

**As a** hráč
**I want to** vidět tlačítka pro akce (Undo, Redo, Reset, Menu)
**So that** vím jaké akce mohu provést

## Popis

Vytvořit systém pro vykreslování ovládacích tlačítek:
- Undo tlačítko
- Redo tlačítko
- Reset tlačítko (znovunahrání levelu)
- Menu tlačítko (návrat do menu)
- Vizuální stav tlačítek (aktivní/neaktivní)
- Hover efekty (pokud je tlačítko myší)

## Acceptance Criteria

- [ ] Třída ButtonRenderer
- [ ] drawButton(text, x, y, isEnabled) - vykreslí jedno tlačítko
- [ ] drawUndoButton(isEnabled) - vykreslí Undo tlačítko
- [ ] drawRedoButton(isEnabled) - vykreslí Redo tlačítko
- [ ] drawResetButton(isEnabled) - vykreslí Reset tlačítko
- [ ] drawMenuButton(isEnabled) - vykreslí Menu tlačítko
- [ ] drawAllButtons(gameState) - vykreslí všechna tlačítka
- [ ] Unit testy: 12 testů
- [ ] npm test projde

## Technical Details

```javascript
// Button layout (pod HUD a paletou)
// Příklad:
// [Undo] [Redo] [Reset] [Menu]

drawButton(text, x, y, isEnabled = true) {
  const color = isEnabled ? COLORS.ACCENT : COLORS.DISABLED
  const backgroundColor = isEnabled ? COLORS.BG : COLORS.DISABLED_BG

  // Draw button background
  this.renderer.drawRect(x - 20, y - 5, 40, 10, backgroundColor)

  // Draw button border
  this.renderer.drawRect(x - 20, y - 5, 40, 10, color) // outline

  // Draw text
  this.renderer.drawText(text, x, y, color)
}

drawAllButtons(gameState) {
  const yPos = 50
  let xPos = 10

  this.drawUndoButton(gameState.canUndo)
  xPos += 50

  this.drawRedoButton(gameState.canRedo)
  xPos += 50

  this.drawResetButton(true) // Always enabled
  xPos += 50

  this.drawMenuButton(true)
}
```

## Odhad

- 0.5 dne (button renderer + testy)
