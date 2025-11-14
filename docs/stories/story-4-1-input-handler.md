# Story 4.1: Input Handler

## User Story

**As a** hráč
**I want to** používat myš a klávesnici k ovládání hry
**So that** mám přirozené ovládání bez zpoždění

## Popis

Vytvořit systém pro zpracování vstupů z uživatele:
- Detekce kliknutí myší na canvas
- Převod pixelových souřadnic na grid souřadnice
- Klávesová vstupní zařízení (WASD, šipky, numpad)
- Speciální klávesy (Enter, Esc, Space, Delete)
- Debouncing/throttling pro rychlé opakované kliknutí
- Keyboard shortcut binding system

## Acceptance Criteria

- [ ] Třída InputHandler
- [ ] detectMouseClick(pixelX, pixelY) -> (gridX, gridY)
- [ ] isKeyPressed(key) - kontrola aktuálního stavu klávesy
- [ ] onKeyDown/onKeyUp event listenery
- [ ] onMouseClick event listener
- [ ] mapKeyboardInput(config) - konfigurovatelné binding
- [ ] Unit testy: 12 testů
- [ ] npm test projde

## Technical Details

```javascript
// Input event mapping
const INPUT_MAP = {
  'mouseClick': (gridX, gridY) => game.placeМirror(gridX, gridY),
  'KeyQ': () => game.undo(),
  'KeyR': () => game.redo(),
  'Escape': () => showMenu(),
  'Space': () => game.pauseGame()
}

// Usage
const input = new InputHandler(canvas)
input.onMouseClick((gridX, gridY) => {
  console.log(`Clicked at ${gridX},${gridY}`)
})
input.onKeyDown('KeyU', () => game.undo())
```

## Odhad

- 0.5 dne (input handler + testy)
