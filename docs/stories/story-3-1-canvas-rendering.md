# Story 3.1: Canvas Rendering System

## User Story

**As a** hráč
**I want to** vidět hru na obrazovce
**So that** mohu řešit puzzle vizuálně

## Popis

Vytvořit základní systém pro vykreslování na Canvas:
- Inicializace Canvas kontextu
- Renderer třída s metodami pro kreslení
- Clearing a refresh
- Základní geometrie (obdélníky, čáry, text)

## Acceptance Criteria

- [ ] Třída Renderer s Canvas 2D kontextem
- [ ] Metoda clear() - vyčistí plátno
- [ ] Metoda drawRect(x, y, w, h, color) - kreslí obdélník
- [ ] Metoda drawLine(x1, y1, x2, y2, color) - kreslí čáru
- [ ] Metoda drawText(text, x, y, color) - kreslí text
- [ ] Metoda setLineWidth(width) - nastaví tloušťku čáry
- [ ] Inicializace z Canvas elementu
- [ ] Unit testy: 6 testů
- [ ] npm test projde

## Technical Details

```javascript
class Renderer {
  constructor(canvasElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.width = canvasElement.width
    this.height = canvasElement.height
  }

  clear(color = '#000000') {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, w, h)
  }

  drawLine(x1, y1, x2, y2, color) {
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }
}
```

## Odhad

- 0.5 dne (renderer + testy)
