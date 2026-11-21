# Changelog

**Live release numbering:** The v1.1.x patch series covers releases through merged PR #23. PR #24 introduces the **v1.2.0** minor release; later merged PRs increment v1.2.x. Release tags are created only after the exact merge commit is confirmed live on GitHub Pages. See [Publishing via GitHub Pages](README.md#publishing-via-github-pages).

## Unreleased — Signature strategy expansion and move coherence

- Add six whole-build specializations (Ashen Vanguard, Venom Alchemist, Sandbound Citadel, Arcane Catalyst, Circuit Architect, Misty Custodian), keeping the original six, with no forced assignments.
- Support specialist-only **Flame Orb / Toxic Orb**, status recovery and boosts, automatic sand and terrain setters, and specific tactic / item prerequisites. Preserve the existing balanced pool of 72 regular items.
- Introduce tightly gated **Facade** and **Rising Voltage** offensive substitutions while preserving the other attack, role tactic, and Enneagram growth move.
- Forbid **Aurora Veil + Reflect/Light Screen** as duplicate defenses, and rule out other identified self-defeating strategy/growth combinations. Reject incompatible weather/terrain orbs and setters.
- Validate the full 535-BST generation pipeline, exports, textual results, item consistency and strategy distribution.

## Unreleased — Baton Pass prerequisite correction

- Require Baton Pass to have a transferable self-stat boost from another equipped move, or an active standard Speed Boost Ability. Non-transferable weather and screens cannot qualify it.
- Retain all five Type 3/5 growth choices as authored; only reject Baton Pass for builds without a meaningful setup. Snow Bastion uses another corrective growth move.
- Add direct move-pair tests and seeded end-to-end checks covering the 4,000-build strategy audit, plus active-versus-Hidden Ability semantics.

## Unreleased — Runtime module cache correction

- Refresh the browser's JavaScript module cache keys for the app entry and scoring engine after the v1.2.3 Baton Pass fix. The release badge can update faster than browser-cached module scripts; a v1.2.3 badge alone did not prove that the new engine code was loaded.
- Add a regression check for consistent entry/engine cache keys and document private-window verification for recent deployments.

## 1.2.0 — Comprehensive assessment inputs

- Add a **Quick & simple / Comprehensive** testing path with Sakinorva Functions, Sakinorva Rowe Enneagram, and IPIP-NEO-300 links alongside the original short tests.
- Accept **all eight cognitive-function totals** as direct inputs, deriving continuous game-specific cognition preferences without claiming Sakinorva or MBTI equivalence.
- Allow an **optional four-letter type override** when a user knows their Sakinorva type. The override controls Nature and archetype interpretation while preserving the original function-based affinities.
- Add **optional Assertive/Turbulent (A/T)** identity. Unspecified stays missing, with a neutral placeholder; chosen A/T uses the documented type-only 75/25 estimate, not a fabricated measured percentage.
- Accept **signed raw Rowe Enneagram scores**, including negatives. Apply documented within-report relative normalization; retain raw values and manual tritype/wing overrides.
- Preserve share links, randomized sample builds, original quick inputs, 17-type typing, six battle roles, 36 archetypes, and the fixed **535 base-stat budget** with the **70/20/10 Big Five / Enneagram / cognition** blend.
- Keep the two test sources explicitly distinguished; Rowe subtype scores and Big Five facets are not silently introduced as new mechanics.
- Refresh the bundled version and cache keys, extend regression and browser coverage, and advance future automatic releases to **v1.2.x**.
- Add the **creation-version footer** to live cards, exported PNGs, and copied summaries. Shared links preserve the originating version; older links recalculated under newer releases show both original and current versions.

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
