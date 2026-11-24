# Changelog

**Live release numbering:** PR #33 establishes **v2.0.0**, with subsequent merged PRs incrementing v2.0.x. PR #32 retains the historical v1.4.0 baseline; earlier v1.1.x, v1.2.x and v1.3.x releases remain intact. Version tags are created only after the exact merge commit is confirmed live on GitHub Pages. See [Publishing via GitHub Pages](README.md#publishing-via-github-pages).

## 2.0.0 — Stat-specific personality recalibration
- Require all three assessment sections for any user-visible Pokémon: cognitive scores, nine-type Enneagram scores/Rowe/ranking, and five Big Five domains. Four-letter/tritype overrides remain supplemental and cannot replace full tests. Invalid inputs clear stale results.
- Remove the legacy raw-score FNV held-item tie hash; choose equipment by interpretable personality-family, trait, role and compatibility fits with stable exact ties.
- Center all nine Enneagram stat prototypes around a common 50 reference per stat. Neutral inputs yield near-equal 535-BST distribution (90 / 89 / 89 / 89 / 89 / 89), preserving distinctive individual mappings and fixed stat bounds.
- Re-run the V2 whole-model audit; keep separate Wall and Tank roles pending a design decision after observing the post-calibration role distribution.


- Establish a single six-stat semantic contract: HP resilience, Attack assertion, Defense fortitude, Special Attack ingenuity, Special Defense composure, Speed responsiveness.
- Recalibrate the Big Five equations and nine Enneagram six-stat prototypes to reduce overlapping defensive proxies and overly broad novelty/assertion associations.
- Replace a universal framework blend with **per-stat weights** for Big Five, Enneagram, and cognition. When users supply all eight cognitive functions, they contribute directly and receive greater relative emphasis for conceptual ingenuity and responsiveness. Entered 16Personalities percentages and four-letter MBTI-only inputs use progressively more conservative cognitive weight profiles.
- Preserve the 535-point base-stat total, 45–140 stat bounds, deterministic behavior, distinct Nature priority scoring, and existing battle mechanics. Expect generated role, ability, moves, and exported cards to change when the base stat shape warrants it.
- Disclose each stat's source weights in the result explanations, refresh browser module caches, and extend distribution, source-sensitivity, Nature, and end-to-end validation.
- Add optional IPIP-NEO facet percentiles for up to five complete domain groups (30 facets), with exact reported-domain fallback, bounded stat-specific refinements, shared-link round trips, validation, and per-stat affinity explanation. Facets adjust only the existing Big Five source; no fourth source, extra BST, or unrelated political/moral facet bonuses.
- Reuse selected facets to make small **within-source** archetype temperament adjustments, nudge eligible held-item family preferences, and give the Trainer’s Guide up to two additional recognizable field observations. Preserve Nature and typing independence; signature strategy prerequisites and equipment remain authoritative.
- Audit all 30 facets: 27 have a defensible stat, archetype, item, or Trainer’s Guide interpretation; O6 Liberalism, A2 Morality, and N3 Depression have no independent facet effect. They remain represented only within their reported parent domains.

## 1.4.0 — Whole-profile Nature classification

- Replace 16 hard-coded MBTI → Nature mappings with independent scoring across all 20 non-neutral Pokémon stat tradeoffs.
- Interpret Nature as a preferred behavioral priority versus a competing sacrifice, using motivation (45%), cognition (30%), and measured Big Five temperament (25%) with centered nine-type prototypes and transparent pair scoring.
- Reduce weight for four-letter-only cognitive estimates; exclude unmeasured Big Five instead of pretending the midpoint was measured. Respect type overrides for Nature preference polarity without changing base-stat affinities.
- Show a dedicated on-result **Why this Nature?** breakdown and document the exact prototype matrix, equations, missing-input rules and tie-breaking in README.
- Preserve existing ±10% mechanics and EV formulas; accept legitimate changes in roles, specialists, moves and held items when a Nature changes. Add deterministic coverage and a 16,000-profile distribution audit.

## 1.3.0 — Train your Pokémon / two-card exports

- Add an optional **post-results EV trainer** with editable allocations, fixed 31 IVs, level-100 stat calculations, a role-informed suggested spread and reset.
- Keep 535 BST, Nature, typing, moves, items and archetypes determined exclusively by personality inputs; EV training is an independent layer.
- Preserve EVs in share links and restore them from shared builds, including compatibility with legacy links.
- Export **two different PNG cards**: the original base-stat personality identity card, and a companion trained card showing base stats, allocated EVs and level-100 final stats. Both retain typings, abilities, moves, item, artwork and release provenance.
- Introduce a v1.3 release series; preserve historical version identification and add export/formula/regression tests.

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

## Unreleased — Keep specialist commentary in one place

- Confine Signature Strategy names, synergy explanation, and qualification language to the dedicated callout in the results UI.
- Remove duplicated package commentary from role-move text, held-item rationale, Trainer Guide, calculation notes, copied build summaries, and PNG exports; keep all underlying moves, abilities, items, scoring and package selection unchanged.
- Apply the same personality rationale to specialist and ordinary held items; refresh affected browser module cache keys and add cross-surface regression coverage.

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
