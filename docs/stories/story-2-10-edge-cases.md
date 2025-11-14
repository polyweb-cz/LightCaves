# Story 2.10: Edge Cases & Error Handling

## User Story

**As a** tester
**I want to** aby engine zvládal neobvyklé situace
**So that** je stabilní a spolehlivý

## Popis

Ošetřit okrajové případy:
- Miniaturní levely (6×4 minimum)
- Maximální levely (30×16 maximum)
- Lámny paprsky v rozích
- Odrazy mimo grid
- Nevalidní souřadnice
- Null/undefined vstupy

## Acceptance Criteria

- [ ] Handlery pro všechny null inputs
- [ ] Validace souřadnic v každé metodě
- [ ] Testy pro minimální level
- [ ] Testy pro maximální level
- [ ] Testy pro hraničních případů
- [ ] Testy pro invalid data
- [ ] Unit testy: 8+ testů
- [ ] npm test projde

## Technical Details

```javascript
// Validace v każdé metodě
if (!level || !level.grid) {
  console.warn('Invalid level')
  return null
}

if (!Number.isInteger(x) || !Number.isInteger(y)) {
  console.warn('Invalid coordinates')
  return null
}

if (x < 0 || x >= level.width || y < 0 || y >= level.height) {
  console.warn('Coordinates out of bounds')
  return null
}
```

## Odhad

- 0.5 dne (edge cases + testy)
