# Changelog

**Live patch releases:** From v1.1.1 onward, every merged PR into `main` is tagged as v1.1.x after the exact commit is confirmed deployed on GitHub Pages. The web app displays the matched published version, while v1.1.0 remains the scoring-model baseline. See [Publishing via GitHub Pages](README.md#publishing-via-github-pages).

## 1.1.0 — Battle role balance

- Recalibrate the six role reference templates 25% toward the 535/6-stat center, preserving their characteristic shapes.
- Reduce unintended Pivot dominance and make Wall and other battle roles more reachable without enforcing equal frequencies.
- Retain the 80% stat fit / 20% elemental toolkit weights, the five-point hybrid threshold, 535 base-stat budget, typing system, and all 36 archetypes.
- Allow regenerated roles to inform abilities, moves, items, archetypes, card exports, and Trainer Field Reports consistently.
- Add seeded role-balance, geometry, and whole-build regression tests; update release metadata and browser cache keys.

## 1.0.0 — First complete version

The v1.0 baseline for Type Effectively includes:

- A **17-type motivational typing model** based on 153 authored Enneagram affinity scores. Normal stays in the official Pokémon chart and comparisons, but is excluded from generated personality typing.
- Primary, secondary and hidden affinities determined by the ordered tritype and an evidenced wing.
- Manual or inferred 16Personalities, Enneagram and Big Five inputs; Nature, a normalized 535-point stat distribution and six battle roles.
- All 18 official SVG elemental corner motifs, all six muted battle-role watermarks and downloadable PNG cards.
- One-click **Randomize** with clearly labeled synthetic profiles, editable scores and share links.
- Standard and Hidden Abilities, moves, held items, weaknesses/resistances and real Pokémon comparisons.
- Exhaustive type-coverage checks for **324 valid ordered tritype/wing configurations**, alongside the existing feature tests.

This is a game-inspired personality illustration, not a validated psychological assessment or an official Pokémon product.

Version 1.0.0 is proposed through the release pull request; create the GitHub tag/release when it is merged.
