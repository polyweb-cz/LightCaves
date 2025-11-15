# Story 5.1: Level Design System

## User Story

**As a** designer her
**I want to** vytvořit různé puzzle levely s různými obtížnostmi
**So that** hráči mají co hrát a progresují

## Popis

Vytvořit systém pro design a načítání levelů:
- Level definitions se zrcadly, zdmi, a speciálními prvky
- 5+ levelů s progresí obtížnosti
- Easy, Normal, Hard, Expert obtížnosti
- Levelů s různými konfiguracijami
- Zajímavé puzzle s více řešeními
- Level metadata a statistiky

## Features

- [ ] Level definition system (JSON/Object format)
- [ ] 5+ hot designovaných levelů
- [ ] Easy level: 1-2 zrcadla
- [ ] Normal level: 3-4 zrcadla, složitější
- [ ] Hard level: 5+ zrcadel, mnohacestné cesty
- [ ] Expert level: komplexní puzzle
- [ ] Level stats (best time, best moves)
- [ ] Progressive difficulty
- [ ] Level descriptions
- [ ] Unit testy: 15+ testů

## Acceptance Criteria

- [ ] LevelDatabase class/system
- [ ] 5+ levelů definováno
- [ ] Levely načítají korektně
- [ ] Stats tracking per level
- [ ] npm test projde
- [ ] Hra hratelná s novými levely

## Odhad

- 1 den (design + testy + integrace)
