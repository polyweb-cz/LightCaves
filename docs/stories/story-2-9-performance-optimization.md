# Story 2.9: Performance Optimization

## User Story

**As a** hráč
**I want to** aby hra běžela plynule
**So that** je zážitek příjemný

## Popis

Optimalizovat physics engine:
- Cache beam paths
- Lazy evaluation kde je možné
- Minimalizovat alokace objektů
- Profil a benchmarkingu

## Acceptance Criteria

- [ ] Beam path calculation <5ms pro 10×10 level
- [ ] Mirror reflection <1ms
- [ ] Target detection <1ms
- [ ] getIlluminatedCells <1ms
- [ ] Benchmark test results zaznamenány
- [ ] Bez memory leaks
- [ ] npm test projde

## Technical Details

- Použít Object.freeze pro constants
- Reuse arrays kde je to bezpečné
- Benchmark: time propagation, reflection, detection
- Memory: check for unused references

## Odhad

- 1 den (profilování + optimalizace)
