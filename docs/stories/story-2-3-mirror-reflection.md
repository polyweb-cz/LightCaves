# Story 2.3: Mirror Reflection Logic

## User Story

**As a** fyzikář
**I want to** mít logiku pro reflexi paprsku na zrcadlech
**So that** paprsek se správně odrazí, když narazí na zrcadlo

## Popis

Vytvořit logiku která:
- Pozná dva typy zrcadel: `/` (slash) a `\` (backslash)
- Správně odrazí paprsek podle typu zrcadla a směru příchodu
- Integruje se s existujícím `propagateBeam()` algoritmu
- Zastaví paprsek, pokud se dostane do cyklu (nekonečné odrazování)

## Acceptance Criteria

- [ ] Metoda detectMirror(x, y, mirrors) vrací zrcadlo nebo null
- [ ] Metoda reflectBeam(direction, mirrorType) vrací nový směr
- [ ] Paprsek se odrazí podle REFLECTION_TABLE z constants
- [ ] Cyklus je detekován (beam + zrcadlo combo se neopakuje)
- [ ] Paprsek se zastaví, pokud by se opakovalo
- [ ] Unit testy: 8 testů
- [ ] npm test projde

## Technical Details

```javascript
// Reflexe paprsku:
// Slash mirror (/)
//   N -> E, S -> W, E -> N, W -> S
// Backslash mirror (\)
//   N -> W, S -> E, E -> S, W -> N

// V propagateBeam loop:
// const mirrorKey = `${x},${y}`
// if (mirrors[mirrorKey]) {
//   const mirror = mirrors[mirrorKey]
//   dir = REFLECTION_TABLE[mirror.type][dir]
// }
```

## Odhad

- 0.5 dne (reflexní logika + testy)
