# V3 semantic base-stat model

This is a fictional game scoring calibration, not an assessment of capacity or a validated psychological model. Existing inputs and share links remain readable; recalculation intentionally changes stats and may change downstream role, ability, item, moves and archetype. Nature preferences and Enneagram typing are unchanged directly. PR #45 establishes v3.0.0 as the release baseline; later merged PRs increment v3.0.x after verified publication.

## Pipeline and exact decisions

- Eight functions: fixed provisional engineering pivot 64, **not** a confirmed Sakinorva midpoint or population average. For signed deviation d, use d × (1 + 0.5 × (d/50)^2) inside ±50, then linear continuation with slope 2.5 outside that range. Subtract the transformed response of the uniform personal mean before blending; any eight identical scores produce six neutral 50 affinities. This does not assert that uniformly high function totals mean greater general capacity.
- Alternative pathways: interpolate between the weighted mean of transformed inputs and the stronger transformed input. Peak weight = 0.75 × clamp((max(raw pair) − reference − 10)/30, 0, 1). Equal inputs remain equal. Ni/Ne in Ingenuity use equal alternative weights, with Ti complementary; Se/Ne in Speed and Si/Fi in Defense are additional alternative hypotheses. Fe supplies a small direct Speed contribution; Fi is removed as a direct Attack proxy. HP and SpD retain weak, downweighted cognitive proxies.
- Big Five: apply the same signed transform around percentile 50; defer clipping to the completed source affinity. Full facet groups replace their own domain terms. Remove low sociability, low agreeableness, low activity and low orderliness as direct evidence of unrelated strengths. Low neuroticism remains a directional proxy for resilience/regulation. See SEMANTIC_FACET_COMPONENTS in src/stat-model.mjs for every coefficient. O5/O1 and O4/O1 have gated alternative aggregation for Ingenuity and responsiveness respectively. Artistic interest remains a small complementary Ingenuity term. The Agreeableness domain still contributes to other outcomes, but not directly to base stats.
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

- Final allocation: center six blended affinities at 100 and multiply their deviations by 1.25 × 600/535 × 1.5. Preserve the bounded simplex and integer largest-remainder allocation, exact 600 BST and 50–157 bounds. The legacy normalizeStats helper's default scale remains unchanged for backwards comparison; the live generator explicitly passes SPREAD_GAIN.

## Numerical pre-integration stress test

Seed 20261125, 2,000 independent 30-facet/8-function/9-Rowe profiles and another 2,000 with facets correlated around five random domains (uniform noise ±30); cognition and Rowe are independently randomized in both. Same profiles in each before/after pair. These are not actual people or a representative distribution.

| Metric | Independent V2 | Independent V3 | Correlated facets V2 | Correlated facets V3 |
|---|---:|---:|---:|---:|
| Mean within-build SD | 8.93 | 19.79 | 10.80 | 23.34 |
| Builds with any stat >=130 or <=70 | 0.65% | 58.05% | 4.15% | 73.80% |
| Individual stats at hard bounds | 0% | 1.35% | 0% | 3.57% |
| Invalid BST allocations | 0 | 0 | 0 | 0 |

Independent cohort V3 mean stats: 99.05 / 97.79 / 98.76 / 102.77 / 99.71 / 101.92. Correlated-facet cohort: 101.20 / 98.18 / 100.32 / 99.50 / 100.62 / 100.16. The residual mean shifts and correlated-cohort boundary saturation merit review; no artificial quotas or source-specific offsets were applied. Completed source clipping can still discard extreme differences.

This report is stat-level evidence, not the full CI result. The integration tests exercise the complete generator. Run npm test, npm run audit:v2 and the browser smoke script; compare the paired audit with the main baseline before merging.

## Candidate boundary audit (not applied)

Same 4,000 seeded profiles; only allocation limits changed. All candidates preserve exact 600 BST with zero invalid allocations. Individual-stat boundary frequency:

| Bounds | Independent | Correlated facets | Correlated SD |
|---|---:|---:|---:|
| 50–157 (current) | 1.35% | 3.57% | 23.34 |
| 40–160 | 0.44% | 1.63% | 23.68 |
| 40–150 | 1.07% | 3.51% | 23.39 |

40–160 is the recommended candidate: symmetric about neutral 100 and reduces clipping without materially changing the overall distribution. Bound change remains separate from the approved release numbering.
