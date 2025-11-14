# Story 2.5: Target Detection with Mirrors

## User Story

**As a** řešitel puzzlu
**I want to** vědět, zda je úkol vyřešen (paprsek zasáhne cíl)
**So that** mohu vědět, když jsem vyřešil levl

## Popis

Vytvořit kompletní systém pro detekci cíle:
- Kontrola, zda paprsek zasáhne cíl na správné pozici
- Kontrola, zda paprsek přichází ze správného směru
- Práce s přímým paprskem (bez zrcadel)
- Práce s odraženým paprskem (s zrcadly)
- Vrací true/false stavový výsledek

## Acceptance Criteria

- [ ] isTargetComplete(beamPath, target) vrací boolean
- [ ] Detekuje, když paprsek zasáhne správný cíl
- [ ] Kontroluje příchod paprsku ze správného směru
- [ ] Vrací false, když cíl není zasažen
- [ ] Vrací false, když je paprsek z nesprávného směru
- [ ] Zvládá prázdný paprsek (null/prázdné pole)
- [ ] Unit testy: 10 testů
- [ ] npm test projde

## Technical Details

```javascript
isTargetComplete(beamPath, target) {
  // beamPath: [{x, y, direction}, ...] nebo null
  // target: {x, y, direction}

  if (!beamPath || !beamPath.length) return false

  const lastBeam = beamPath[beamPath.length - 1]
  const isPositionMatch = lastBeam.x === target.x && lastBeam.y === target.y

  // Paprsek přichází opačným směrem, než cestuje
  const oppositeDir = getOppositeDirection(lastBeam.direction)
  const isDirectionMatch = oppositeDir === target.direction

  return isPositionMatch && isDirectionMatch
}
```

## Odhad

- 0.5 dne (detekce + testy)
