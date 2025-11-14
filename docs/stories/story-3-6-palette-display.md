# Story 3.6: Palette Display

## User Story

**As a** hráč
**I want to** vidět vizuální výběr typů zrcadel
**So that** vím, jaké zrcadlo je vybráno k umístění

## Popis

Vytvořit systém pro vykreslování palety zrcadel - vizuální ukazatel kterého typu zrcadla je vybráno:
- Zobrazení obou typů: `/` a `\`
- Zvýraznění vybraného typu (highlight)
- Eventuální ikonky nebo barvy rozlišující typy
- Počet dostupných zrcadel (pokud je omezený)

## Acceptance Criteria

- [ ] Třída PaletteRenderer
- [ ] drawMirrorOption(type, isSelected) - vykreslí jeden typ zrcadla
- [ ] drawAllMirrors(selectedType) - vykreslí všechny typy s zvýrazněním
- [ ] drawMirrorCount(counts) - vykreslí počty dostupných zrcadel
- [ ] drawPalette(selectedType, counts) - vykreslí celou paletu
- [ ] Unit testy: 10 testů
- [ ] npm test projde

## Technical Details

```javascript
// Palette layout (vlevo na stránce, pod HUD)
// Příklad:
// Mirrors: [/ (selected)]  [\ (unselected)]
// Or with counts: [/ x5 (selected)] [\ x3 (unselected)]

drawMirrorOption(type, isSelected) {
  const symbol = type === '/' ? SYMBOLS.MIRROR_SLASH : SYMBOLS.MIRROR_BACKSLASH
  const color = isSelected ? COLORS.ACCENT : COLORS.TEXT
  const backgroundColor = isSelected ? COLORS.HIGHLIGHT : COLORS.BG

  // Draw background box if selected
  if (isSelected) {
    this.renderer.drawRect(x, y, width, height, backgroundColor)
  }

  // Draw mirror symbol
  this.renderer.drawText(symbol, x, y, color)
}

drawPalette(selectedType, counts = {}) {
  let xPos = 10
  const yPos = 30

  // Draw both mirror types
  ['/','\\'].forEach(type => {
    const isSelected = type === selectedType
    this.drawMirrorOption(type, isSelected)
    if (counts[type]) {
      this.renderer.drawText(`x${counts[type]}`, xPos + 20, yPos, COLORS.TEXT)
    }
    xPos += 40
  })
}
```

## Odhad

- 0.5 dne (palette renderer + testy)
