# Story 2.8: Physics Testing & Validation

## User Story

**As a** vývojář
**I want to** mít komplexní testy physics enginu
**So that** mohu zajistit korektnost fyziky

## Popis

Vytvořit komplexní validační testy:
- Testovat kombinace zrcadel a paprsků
- Validovat edge cases (odrazy u zdí, dvojité odrazy)
- Testovat stabilitu algoritmů
- Měřit pokryji kódu (code coverage)

## Acceptance Criteria

- [ ] 10+ integrovaných testů
- [ ] Testy pro komplexní scénáře
- [ ] Testy pro edge cases
- [ ] Testy pro výkon (stress test)
- [ ] Code coverage >80% pro physics.js
- [ ] Všechny testy zelené
- [ ] npm test projde

## Technical Details

Kombinovat testy z předchozích stories do integrovaných scénářů:
- Více zrcadel v řadě
- Cyklické odrazy
- Odrazy u zdí
- Maximální path length
- Stabilita při náhodných datech

## Odhad

- 1 den (komplexní testování)
