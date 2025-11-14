# Story 3.5: HUD & Status Display

## User Story

**As a** hráč
**I want to** vidět aktuální stavy hry (jméno levelu, počet tahů, čas)
**So that** mám přehled o svém pokroku v levelu

## Popis

Vytvořit systém pro vykreslování HUD (Heads-Up Display) - stavová řádka s informacemi o hře:
- Jméno/číslo levelu
- Počítadlo tahů (umístění zrcadel)
- Timer (čas od začátku levelu)
- Obtížnost levelu
- Indikátor obtížnosti (visual, hvězdičky atd.)

## Acceptance Criteria

- [ ] Třída HUDRenderer
- [ ] drawLevelName(levelName) - vykreslí název levelu
- [ ] drawMoveCounter(moves) - vykreslí počet tahů
- [ ] drawTimer(seconds) - vykreslí čas ve formátu MM:SS
- [ ] drawDifficulty(difficulty) - vykreslí obtížnost
- [ ] drawAllHUD(gameState) - vykreslí všechny HUD prvky najednou
- [ ] Unit testy: 10 testů
- [ ] npm test projde

## Technical Details

```javascript
// HUD layout (top bar, 1 řádka ASCII)
// Příklad:
// Level 1: Tutorial 1 | Moves: 5 | Time: 1:23 | Difficulty: Easy ⭐

drawLevelName(levelName) {
  const text = `Level: ${levelName}`
  const x = 10, y = 10 // Top-left corner
  this.renderer.drawText(text, x, y, COLORS.TEXT)
}

drawMoveCounter(moves) {
  const text = `Moves: ${moves}`
  const x = this.calculateXPosition() // Right-aligned
  this.renderer.drawText(text, x, y, COLORS.ACCENT)
}

drawTimer(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const text = `${minutes}:${secs.toString().padStart(2, '0')}`
  this.renderer.drawText(text, x, y, COLORS.TEXT)
}
```

## Odhad

- 0.5 dne (HUD renderer + testy)
