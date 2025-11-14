# Story 1.6: Basic CSS Styling

## User Story

**As a** vývojář
**I want to** mít CSS pro tmavý minimalistický design
**So that** hra vypadá již minimalisticky a atmosfericky

## Popis

Rozšíření `src/styles.css` - přidání CSS pravidel pro:
- Button styling (jednoduchý, minimalistický)
- Modal styling (victory screen, menus)
- Text styling (nadpisy, labely)
- Hover effects (bez animací, jen subtilní)

## Acceptance Criteria

- [ ] Button styling je jednoduchý (border, black bg, white text)
- [ ] Hover effect na buttonech (opacity change)
- [ ] Modal má lesklý shadow efekt
- [ ] Text je čitelný (white na black)
- [ ] CSS je čisté a bez prefixů
- [ ] Build funguje bez CSS warningů
- [ ] Stránka vypadá minimalisticky

## Technical Details

Přidat CSS pravidla pro:
- `.button { border: 1px solid white; padding: 8px 16px; ... }`
- `.button:hover { opacity: 0.8; }`
- `.modal { background: #000; border: 2px solid #fff; ... }`
- `h1, h2, h3 { color: #fff; font-family: monospace; ... }`

## Odhad

- 0.5 dne (CSS styling)
