# Story 3.3: Beam Visualization

## User Story

**As a** hráč
**I want to** vidět paprsek z lampičky
**So that** vidím, kam směřuje světlo

## Popis

Vytvořit systém pro vykreslování paprsku:
- Vykreslí paprsek přes všechny buňky cesty
- Začíná v lampičce
- Skončí na poslední buňce cesty
- Animovaná či statická linie
- Zvýraznění na zrcadlech

## Acceptance Criteria

- [ ] Třída BeamRenderer pro vykreslování paprsku
- [ ] drawBeam(beamPath) - vykreslí celý paprsek
- [ ] Žlutá barva (konstanta COLORS.BEAM)
- [ ] Tlustá linie pro viditelnost
- [ ] Animované pulzování (stretch cíl)
- [ ] Reflektivní body na zrcadlech
- [ ] Unit testy: 8 testů
- [ ] npm test projde

## Technical Details

```javascript
class BeamRenderer {
  constructor(renderer, gridRenderer) {
    this.renderer = renderer
    this.gridRenderer = gridRenderer
  }

  drawBeam(beamPath, lamps = {}) {
    if (!beamPath || beamPath.length === 0) return

    const cellWidth = this.gridRenderer.cellWidth
    const cellHeight = this.gridRenderer.cellHeight

    // Vykresli paprsek
    for (let i = 0; i < beamPath.length - 1; i++) {
      const cell1 = beamPath[i]
      const cell2 = beamPath[i + 1]

      const x1 = cell1.x * cellWidth + cellWidth / 2
      const y1 = cell1.y * cellHeight + cellHeight / 2
      const x2 = cell2.x * cellWidth + cellWidth / 2
      const y2 = cell2.y * cellHeight + cellHeight / 2

      this.renderer.setLineWidth(3)
      this.renderer.drawLine(x1, y1, x2, y2, COLORS.BEAM)
    }
  }
}
```

## Odhad

- 0.5 dne (beam renderer + testy)
