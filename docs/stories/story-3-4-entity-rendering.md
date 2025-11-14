# Story 3.4: Entity Rendering

## User Story

**As a** hráč
**I want to** vidět lampičku, cíl a zrcadla na mapě
**So that** vidím všechny důležité prvky puzzle

## Popis

Vytvořit systém pro vykreslování entit (objektů):
- Lampička s orientací (šipka)
- Cíl s orientací
- Zrcadla (/ a \)
- Symboly z konstant SYMBOLS
- Barvičky z COLORS

## Acceptance Criteria

- [ ] Třída EntityRenderer
- [ ] drawLamp(x, y, direction) - vykreslí lampičku
- [ ] drawTarget(x, y, direction) - vykreslí cíl
- [ ] drawMirror(x, y, type) - vykreslí zrcadlo
- [ ] Použité SYMBOLS z konstant
- [ ] Správné barvy pro entity
- [ ] Unit testy: 8 testů
- [ ] npm test projde

## Technical Details

```javascript
// SYMBOLS.LAMP_E, LAMP_N, LAMP_S, LAMP_W
// SYMBOLS.TARGET_E, TARGET_N, TARGET_S, TARGET_W
// SYMBOLS.MIRROR_SLASH, MIRROR_BACKSLASH

drawLamp(x, y, direction) {
  const symbol = SYMBOLS[`LAMP_${direction}`]
  const px = x * cellWidth + cellWidth / 2
  const py = y * cellHeight + cellHeight / 2
  this.renderer.drawText(symbol, px, py, COLORS.ACCENT)
}
```

## Odhad

- 0.5 dne (entity renderer + testy)
