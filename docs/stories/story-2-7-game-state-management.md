# Story 2.7: Game State Management

## User Story

**As a** herním enginem
**I want to** sledovat stav hry (řešení, zrcadla, cíl)
**So that** mohu kontrolovat výhru/prohru

## Popis

Vytvořit systém pro správu herního stavu:
- Sledovat umístěná zrcadla v levelu
- Sledovat, zda je úkol splněn (cíl osvětlen)
- Spočítat počet použitých zrcadel
- Vrátit aktuální stav hry

## Acceptance Criteria

- [ ] Třída GameState nebo struktura pro stav
- [ ] Sleduje umístěná zrcadla
- [ ] Sleduje splnění cíle
- [ ] Vrací počet použitých zrcadel
- [ ] Vrací maximální povolený počet zrcadel
- [ ] Integruje se s PhysicsEngine
- [ ] Unit testy: 5 testů
- [ ] npm test projde

## Technical Details

```javascript
class GameState {
  constructor(level) {
    this.level = level
    this.mirrors = {} // {'x,y': {type, x, y}}
    this.isComplete = false
  }

  addMirror(x, y, type) {
    this.mirrors[`${x},${y}`] = { type, x, y }
  }

  removeMirror(x, y) {
    delete this.mirrors[`${x},${y}`]
  }

  updateCompletion(isComplete) {
    this.isComplete = isComplete
  }

  getMirrorCount() {
    return Object.keys(this.mirrors).length
  }
}
```

## Odhad

- 0.5 dne (stav + testy)
