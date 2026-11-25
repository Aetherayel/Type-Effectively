# V3 semantic base-stat model

This is a fictional game scoring calibration, not an assessment of capacity or a validated psychological model. Existing inputs and share links remain readable; recalculation intentionally changes stats and may change downstream role, ability, item, moves and archetype. Nature preferences and Enneagram typing are unchanged directly. PR #45 establishes v3.0.0 as the release baseline; later merged PRs increment v3.0.x after verified publication.

## Pipeline and exact decisions

- Eight functions: fixed provisional engineering pivot 64, **not** a confirmed Sakinorva midpoint or population average. For signed deviation d, use d × (1 + 0.5 × (d/50)^2) inside ±50, then linear continuation with slope 2.5 outside that range. Subtract the transformed response of the uniform personal mean before blending; any eight identical scores produce six neutral 50 affinities. This does not assert that uniformly high function totals mean greater general capacity.
- Alternative pathways: interpolate between the weighted mean of transformed inputs and the stronger transformed input. Peak weight = 0.75 × clamp((max(raw pair) − reference − 10)/30, 0, 1). Equal inputs remain equal. Ni/Ne in Ingenuity use equal alternative weights, with Ti complementary; Se/Ne in Speed and Si/Fi in Defense are additional alternative hypotheses. Fe supplies a small direct Speed contribution; Fi is removed as a direct Attack proxy. HP and SpD retain weak, downweighted cognitive proxies.
- Big Five: apply the same signed transform around percentile 50; preserve signed signals without clipping. Full facet groups replace their own domain terms. Remove low sociability, low agreeableness, low activity and low orderliness as direct evidence of unrelated strengths. Low neuroticism remains a directional proxy for resilience/regulation. See SEMANTIC_FACET_COMPONENTS in src/stat-model.mjs for every coefficient. O5/O1 and O4/O1 have gated alternative aggregation for Ingenuity and responsiveness respectively. Artistic interest remains a small complementary Ingenuity term. The Agreeableness domain still contributes to other outcomes, but not directly to base stats.
- Quick path: the same Big Five domain budgets apply without inventing missing facet values. 16Personalities bipolar contrasts retain their prior mapping with nonlinear amplification; A/T is excluded. Percentage and internal type-only framework matrices remain unchanged.
- Enneagram: retain existing quadratic motivational weighting and centered prototype affinities.
- Eight-function source matrix (Big Five / Enneagram / cognition):

| Stat | Big Five | Enneagram | Cognition |
|---|---:|---:|---:|
| HP | 60 | 35 | 5 |
| Attack | 45 | 35 | 20 |
| Defense | 40 | 45 | 15 |
| Sp. Atk | 35 | 25 | 40 |
| Sp. Def | 65 | 25 | 10 |
| Speed | 45 | 25 | 30 |

- Final allocation: center six blended affinities at 100 and multiply their deviations by 1.25 × 600/535 × 1.5. Preserve the bounded simplex and integer largest-remainder allocation, exact 600 BST and 20–180 bounds. The legacy normalizeStats helper's default scale remains unchanged for backwards comparison; the live generator explicitly passes SPREAD_GAIN.

## Numerical pre-integration stress test

Seed 20261125, 2,000 independent 30-facet/8-function/9-Rowe profiles and another 2,000 with facets correlated around five random domains (uniform noise ±30); cognition and Rowe are independently randomized in both. Same profiles in each before/after pair. These are not actual people or a representative distribution.

| Metric | Independent V2 | Independent V3 | Correlated facets V2 | Correlated facets V3 |
|---|---:|---:|---:|---:|
| Mean within-build SD | 8.93 | 19.79 | 10.80 | 23.34 |
| Builds with any stat >=130 or <=70 | 0.65% | 58.05% | 4.15% | 73.80% |
| Individual stats at hard bounds | 0% | 1.35% | 0% | 3.57% |
| Invalid BST allocations | 0 | 0 | 0 | 0 |

Independent cohort V3 mean stats: 99.05 / 97.79 / 98.76 / 102.77 / 99.71 / 101.92. Correlated-facet cohort: 101.20 / 98.18 / 100.32 / 99.50 / 100.62 / 100.16. The residual mean shifts and correlated-cohort boundary saturation merit review; no artificial quotas or source-specific offsets were applied. This initial experiment used source clipping; the final V3 removes it.

This report is stat-level evidence, not the full CI result. The integration tests exercise the complete generator. Run npm test, npm run audit:v2 and the browser smoke script; compare the paired audit with the main baseline before merging.

## Final V3 boundary audit

Same 4,000 seeded profiles; only allocation limits changed. All candidates preserve exact 600 BST with zero invalid allocations. Individual-stat boundary frequency:

| Bounds | Independent | Correlated facets | Correlated SD |
|---|---:|---:|---:|
| 50–157 (initial prototype) | 1.35% | 3.57% | 23.34 |
| 40–160 | 0.44% | 1.63% | 23.68 |
| 40–150 | 1.07% | 3.51% | 23.39 |

40–160 was the intermediate V3 boundary. The final V3 uses 20–180, as audited below. The pre-integration stress test describes the original prototype with 50–157 bounds.

## Final source affinity cap audit

With intermediate 40–160 bounds, a paired stat-level test on the same 4,000 profiles found:

| Source caps | Independent SD | Correlated SD | Independent boundary frequency | Correlated boundary frequency |
|---|---:|---:|---:|---:|
| Retained | 19.90 | 23.68 | 0.44% | 1.63% |
| Remove Big Five only | 19.97 | 24.48 | 0.49% | 2.40% |
| Remove Big Five and functions | 20.06 | 24.55 | 0.52% | 2.48% |

All cases preserved 600 BST. Amplified Big Five inputs have a natural affinity envelope of −25 to 125; eight-function raw totals have no equivalent enforced scale, so removing their cap can disproportionately magnify extreme input values. The final V3 removes the intermediate caps for all stat sources, retaining questionnaire validity checks, finite arithmetic checks, the 600 BST and then-current 40–160 base-stat limits. The centered Enneagram prototype range makes its former cap redundant. The diagnostic now shows signed uncapped affinities using a shared adaptive axis. Extreme cognitive totals can dominate the blend, deliberately; the fixed budget still limits final stats. No population rarity claim is inferred from the synthetic cohorts.

## V3 downstream recalibration

The 600 BST, 40–160 bounds, Nature, typing and stat-source formulas remain unchanged in this pass. All role calculations still use pre-Nature 535-reference units. Role shape is now centered cosine similarity mapped to 0–100; interpolate from neutral fit 80 to full directional evidence as reference SD rises from 0 to 15. Above 15, increasing amplitude along a direction no longer reduces fit. Retain the 80/20 shape/toolkit blend and small Wall/Tank adjustments. The hybrid margin decreases continuously from seven to five points over that same evidence range; specialization labels retain the 15 and 25 SD thresholds. Original role directions, physical/special Wall variants, fast and slow Pivot, fast and bulky Support, and slow Controller variants all remain authored tactical interpretations, not population quotas.

Signature packages use mean positive stat shortfall, with existing hard stat, type, role and motivation gates preserved. Solar Engine requires one strong attacking channel, not both; remove unjustified Speed fit targets from Regenerative Scout and Sandbound Citadel. Ordinary abilities use continuous, at-most-20-point relevant-stat bonuses; Technician no longer receives a Speed bonus unrelated to its move-power effect. Tactical and growth moves receive continuous relevant-stat bonuses and bounded mismatch penalties; preserve the core's growth pool, role purpose and pair compatibility. Trick Room rejects Speed Boost and incompatible Speed-boosting moves. Ordinary held items gain a small, bounded six-point mechanical preference/penalty on top of their existing personality and role fit. Explicit signature equipment stays fixed.

Archetype identity selects one of six operating styles matching the actual primary battle role; all 36 identities remain reachable. Role fit remains an input to the reported score, not another opportunity to override the battle role. Training remains post-result: defense split >=35 favors reinforcing specialization; mixed defenses favor compensation. Fast utility builds can invest in Speed, slow Pivots and very slow Sweepers can invest elsewhere, and Trick Room keeps Speed free. Explicit reinforcement and compensation plans remain legal, editable 252/252/4 starting spreads; the UI offers separate buttons only when the plans materially differ.

### Paired 1,200-profile downstream audit

Seed 20261125, 300 profiles per input mode (percentages/domain, functions/domain, percentages/facets, functions/facets), independent uniform integer domain/Enneagram/cognition inputs and facets with uniform ±30 noise around their parent domain. Compare uncapped V3 before this pass (commit 364777c) with final V3. This is a synthetic design stress test, not a prevalence estimate.

| Metric | Prior V3 | Recalibrated V3 |
|---|---:|---:|
| Sweeper | 398 | 367 |
| Wall | 329 | 254 |
| Tank | 177 | 126 |
| Pivot | 66 | 108 |
| Support | 76 | 107 |
| Controller | 154 | 238 |
| Hybrid roles | 485 | 594 |
| Signature packages | 177 | 261 |
| Distinct signature packages | 11 | 12 |
| Mean primary directional/template fit | 81.64 | 87.65 |
| Primary fit below 50 | 4 | 0 |
| Distinct held items | 59 | 55 |
| Distinct standard abilities | 31 | 32 |
| Generator/compatibility failures | 0 | 0 |

The fit metrics use different scoring geometries and are not directly interchangeable psychological measurements. More Pivots and Supports are reachable; Controller also grows and Tank contracts. These are not equal-frequency targets. The post-change audit checks all four input modes, four unique moves, compatible items and move pairs, 600 BST, 40–160 limits, role-consistent archetypes, all three legal EV plans, and zero Speed EVs for Trick Room. 734/1,200 builds have different reinforcement/compensation allocations (including differences of just four EVs); the UI only exposes materially different alternatives. Held-item variety declines modestly, a known tradeoff of greater mechanical fit. The new regression file tests the full cohort and reachability, plus targeted invariants.

## Final V3 expanded boundary audit

After downstream recalibration, 4,000 paired synthetic complete builds (1,000 per quick/functions/facets/full input mode, seed 20261125) were tested while changing only the final allocation limits. All other scoring rules, Nature and typing remain unchanged. These are stress-test frequencies, not population estimates.

| Bounds | Mean within-build SD | Builds at a boundary | Stats at a boundary |
|---|---:|---:|---:|
| 40–160 | 24.09 | 519/4000 | 607/24000 |
| 30–170 | 24.37 | 195/4000 | 203/24000 |
| 20–180 (selected) | 24.46 | 53/4000 | 54/24000 |
| 1–595 | 24.49 | 1/4000 | 1/24000 |

20–180 changes 464 base spreads, 26 primary roles, 14 signature assignments and 35 movesets versus 40–160. All 4,000 builds preserved exact 600 BST, four unique moves, compatible held items and legal suggested EVs. Extreme cognitive stress cases can yield 263 SpA or 332 Speed under unrestricted allocation; zero base stats also violate level-100 training's positive-stat contract. The selected symmetric limits preserve exceptional profiles without allowing one stat to consume nearly the whole budget. The live and exported radar use the shared 180 cap and allow post-Nature labels up to 198. The earlier downstream audit used 40–160; those historical results are retained above.
