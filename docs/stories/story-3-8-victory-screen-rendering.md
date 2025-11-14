# Story 3.8: Victory Screen Rendering

## User Story

**As a** hráč
**I want to** vidět obrazovku s výhrou a statistikami
**So that** vidím svoje výsledky a mohu jít na další level

## Popis

Vytvořit systém pro vykreslování obrazovky vítězství (victory/completion screen):
- Potvrzení výhry ("Level Complete!")
- Zobrazení statistik: počet tahů, čas, obtížnost
- Best stats (nejlepší dosavadní výsledky na tomto levelu)
- Tlačítka: Další level, Zopakovat, Menu
- Animace/efekty vítězství (opcional)

## Acceptance Criteria

- [ ] Třída VictoryScreenRenderer
- [ ] drawVictoryTitle() - vykreslí titulek vítězství
- [ ] drawLevelStats(stats) - vykreslí statistiky levelu
- [ ] drawBestStats(bestStats) - vykreslí nejlepší dosavadní výsledky
- [ ] drawVictoryButtons() - vykreslí navigační tlačítka
- [ ] drawCompleteScreen(levelStats, bestStats) - vykreslí celou obrazovku
- [ ] Unit testy: 12 testů
- [ ] npm test projde

## Technical Details

```javascript
// Victory screen layout (centered overlay)
// Příklad:
// ╔════════════════════════╗
// ║    LEVEL COMPLETE!    ║
// ║                        ║
// ║ Your Score:            ║
// ║  Moves: 3              ║
// ║  Time: 1:23            ║
// ║                        ║
// ║ Best:                  ║
// ║  Moves: 2              ║
// ║  Time: 0:45            ║
// ║                        ║
// ║ [Next] [Retry] [Menu] ║
// ╚════════════════════════╝

drawCompleteScreen(levelStats, bestStats) {
  // Draw semi-transparent dark overlay
  this.renderer.ctx.globalAlpha = 0.7
  this.renderer.drawRect(0, 0, this.width, this.height, '#000000')
  this.renderer.ctx.globalAlpha = 1.0

  // Draw box
  const boxX = this.width / 2 - 150
  const boxY = this.height / 2 - 150
  this.drawBox(boxX, boxY, 300, 300)

  // Draw content
  let yPos = boxY + 20
  this.drawVictoryTitle(yPos)
  yPos += 40
  this.drawLevelStats(levelStats, yPos)
  yPos += 80
  this.drawBestStats(bestStats, yPos)
  yPos += 80
  this.drawVictoryButtons(yPos)
}

drawLevelStats(stats, y) {
  this.renderer.drawText('Your Score:', x, y, COLORS.TEXT)
  this.renderer.drawText(`  Moves: ${stats.moves}`, x, y + 20, COLORS.ACCENT)
  this.renderer.drawText(`  Time: ${formatTime(stats.time)}`, x, y + 40, COLORS.ACCENT)
}
```

## Odhad

- 0.5 dne (victory renderer + testy)
