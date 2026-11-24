# V2.0 scoring system — baseline influence audit

Status: **Diagnostic, not a recalibration**. Audit captured from PR #33 commit
`f922901a452cb9358b1e00abcbf8aff67fe01aba`, GitHub Actions
[run 45336581861](https://github.com/Aetherayel/Type-Effectively/actions/runs/45336581861).
The audit script is `scripts/audit-v2.mjs`; run with `npm run audit:v2`.
All 172 existing tests and the browser smoke test passed. **No scoring rules were changed by the audit.**

## Scope and methodological limits

- Deterministic RNG seed `20261123`. Each input is a synthetic test case, **not a measured person**.
- Four 450-profile cohorts: five-domain/16P, facet/16P, five-domain/eight-functions, and five-domain/MBTI-label-only.
- Controlled source replacement: the **same 280 baseline inputs per cognitive mode** for changing one entire Big Five, Enneagram, or cognitive source at a time.
- Local sensitivity: **300 independent pairs** per source and perturbation size (+1 and +5 input points), including facets.
- Missing-data contrast: **360 pairs** of reported neutral Big Five domains versus omitted Big Five.
- Facet contrast: **350 pairs** of domain-only input versus detail-filled 30-facet input with the same five domains.
- The cohorts are uniform synthetic stress distributions with independent inputs. They are intentionally broad; **percentages are observed rates in this test suite, not estimates of real-world user frequencies or psychometric validity**. Independent cohort rows are not matched; controlled replacement/facet/missing-data pairs are matched.
- Average absolute stat difference means `mean(abs(baseStatBefore-baseStatAfter))` across the six stats and the sampled profile pairs. A source's impact by this measure is not its causal 'percentage of variance explained', nor is it evidence of psychological predictive accuracy.

## Confirmed findings

### P0 — Raw-score hash dominates ordinary held-item stability

`src/held-items.mjs` derives an FNV-1a tie score from **every exact raw 16P, Enneagram and Big Five score**, plus tritype, wing and role, then gives each item a pseudo-random but deterministic **±4 tie-point offset**. One input-point change changes the hashed seed and can reorder items despite negligible substantive affinity differences.

One-point perturbations (300 paired builds per row):

| Changed input | Mean absolute base-stat change | Different held item | **Held item was only changed output** |
| --- | ---: | ---: | ---: |
| One Big Five domain | 0.16 | 161/300 (53.7%) | **148/300 (49.3%)** |
| One Enneagram score | 0.02 | 151/300 (50.3%) | **144/300 (48.0%)** |
| One 16P preference score | 0.06 | 158/300 (52.7%) | **151/300 (50.3%)** |
| One cognitive-function score | 0.07 | 159/300 (53.0%) | **150/300 (50.0%)** |
| One IPIP-NEO facet | 0.02 | 1/300 (0.3%) | 1/300 (0.3%) |

This is a structural discontinuity, not a normal meaningfully changed equipment preference. The **±4 hash offset** also exceeds the maximum effect of a facet-family preference (**±4 family-fit points × 47% = ±1.88 final item score points**). The facet channel is not the source of the raw hash discontinuity.

**Proposed fix (not implemented):** Remove raw-survey-dependent hash from item ranking. Use actual fit to rank eligible items; resolve exact/near ties with a stable identity-based ordering that does **not** depend on every raw survey number. Assert small input perturbations cannot reshuffle unchanged item fits.

### P1 — Unequal neutral source baselines favor Defense

A neutral-source control with **every** broad Big Five domain, 16P axis, and Enneagram type score set to 50 yields:

| Stat | Enneagram mean affinity across nine prototypes | Actual normalized base stat |
| --- | ---: | ---: |
| HP | 79.11 | 90 |
| Attack | 65.89 | 87 |
| Defense | 76.67 | **95** |
| Sp. Atk | 78.11 | 90 |
| Sp. Def | 75.56 | 88 |
| Speed | 68.56 | **85** |

The five-domain and cognitive affinities are each **50 for every stat** at this control point. The Enneagram prototype means differ, however, and the V2 per-stat weights amplify them differently (e.g., 45% of Defense vs 25% of Speed). The resulting ten-point Defense–Speed gap does **not** come from individual distinctiveness.

This baseline asymmetry is a **confirmed property of authored mapping**, not proof that the user population should be uniform. Decide deliberately whether this prior is intended. If not, center prototype/source baselines **before** stat-specific source blending, then re-audit roles and types. Do not force actual sample distributions to uniformity.

### P1 — Realized source sensitivity differs greatly from nominal weights

Replace one entire framework while holding the other two fixed (280 matched baseline profiles per source and cognitive mode):

| Cognitive input mode | Big Five replaced | Enneagram replaced | Cognition replaced |
| --- | ---: | ---: | ---: |
| 16P percentages | **11.50** base-stat points | **3.12** | **3.95** |
| Eight functions | **9.84** | **3.03** | **4.96** |

These are mean absolute point differences per stat across a broad synthetic replacement, not source-weight percentages. The Enneagram has a smaller effect on **stats** despite important intended effects on elemental typing and move/ability pathways (nearly all full Enneagram replacements change typing). The variation/scaling of source affinity functions matters at least as much as their nominal coefficients.

**Audit next:** Compare source affinity scales and effect sizes on *plausible correlated* personality profiles; consider controlled reference centering and sensitivity envelopes. Avoid simply raising Enneagram weights to force an arbitrary equality.

### P1 — Missing Big Five presence changes specialist eligibility

Comparing 360 full builds with Big Five = `[50,50,50,50,50]` against exactly the same builds with Big Five omitted:

- **360/360 had identical base stats**, and no Nature or typing changes.
- **69/360** received specialties with explicitly reported neutral Big Five scores; **34/360** received specialties when Big Five was omitted.
- **35/360 (9.7%) changed specialty** solely because the source was reported, not because its stat values were different.

The mechanism is explicit in `src/strategies.mjs`: specialty fit thresholds are **77 when Big Five is supplied vs 82 when missing**. This can be interpreted as evidence-confidence gating, but a threshold jump can reward questionnaire completion even for neutral scores.

**Audit next:** Decide whether measured presence should modify specialty eligibility or merely confidence/explanation. Add missing-versus-neutral paired tests around eligibility thresholds.

### P2 — Battle-role priors favor Tank over Wall

In 450 broad-domain/16P uniform synthetic profiles:

| Primary role | Count | Share |
| --- | ---: | ---: |
| Tank | 159 | **35.3%** |
| Pivot | 100 | 22.2% |
| Controller | 64 | 14.2% |
| Support | 51 | 11.3% |
| Sweeper | 50 | 11.1% |
| Wall | 26 | **5.8%** |

This tendency is present across other synthetic modes too (Tank 148–164 of 450; Wall 25–27 of 450). The primary vs next-best role-fit margin averaged **6.30 points**; **238/450** were within five points (the existing secondary-role eligibility band).

All roles are reachable (tests pass). Nothing requires an even distribution; nevertheless, a six-to-one Tank/Wall prevalence deserves comparison against intentional role semantics, template proximity, the baseline stat skew, and type-toolkit weighting.

### P2 — Threshold cascades exist; most are mediated by legitimate rules

With a one-point change to one broad-domain score, **10/300** cases changed at least three outputs among Nature, typing, roles, specialization, abilities, held items, archetype and move list. Comparable figures: Enneagram **5/300**, 16P preferences **2/300**, eight functions **7/300**, facets **1/300**.

The pipeline is feedforward: a Nature or role crossing a genuine threshold can legitimately change abilities, moves, archetype and equipment together. Such cascades need margin-aware explanation, not blanket smoothing. The held-item raw-hash issue is distinct: roughly half of the one-point tests changed **only equipment**, without any other derived outcome change.

### P2 — Facet detail has material reach but preserves Nature and typing

For **350 paired** domain-only versus 30-facet builds (the same broad domains):

- Mean absolute six-stat change: **2.83** base-stat points.
- Primary role changed in **12.6%**, archetype in **22.0%**, held item in **26.0%**, specialty in **7.1%**, and moves in **29.7%**.
- Nature and typing changed in **0%**, as intended by the code's independent rules.

Facet input is not merely cosmetic. However, its multiple paths—stats, archetype temperament, item family preference and guide text—require further paired tests to check whether direct and indirect effects reinforce redundantly. The three intentionally excluded direct facets (O6, A2, N3) remain excluded.

### P2 — Correlated evidence reappears in downstream classifiers

The archetype score combines **25% motivation + 20% cognition + 25% Big Five temperament + 30% battle expression**. Battle expression has already been derived using stats, typing and Nature, all themselves influenced by earlier personality inputs.

This is not a computational cycle. It **is** a deliberate re-use of evidence. The nominal 25/20/25/30 weights should not be presented as independent shares of original evidence or explained variance. A future source-attribution report should show both **direct** and **role-mediated** effects.

## Recommended action sequence — not implemented here

1. **Remove source-hash item churn** and add one-point perturbation invariants for stable item ranking. This is the clearest bug-like behavior.
2. **Resolve neutral baseline bias**: explicitly choose whether each stat should inherit unequal Enneagram reference priors, then calibrate source mappings rather than masking the issue with normalization.
3. **Clarify missing-data semantics** and determine whether specialty thresholds should differ for measured neutral and omitted Big Five.
4. **Audit role-template geometry** with the corrected stat baselines, especially Tank/Wall prevalence and secondary-role margins.
5. **Audit actual influence on correlated profiles**, including complete facets and cognitive functions, before another major scoring formula revision.
6. **Test prose and export coherence** for pairs with equal Big Five domains and contrasting facets, so generic domain interpretations do not contradict specific facet-based stats.

## Reproduction and release boundary

- `npm run audit:v2` prints a machine-readable line prefixed `V2_AUDIT_JSON=`.
- The PR test workflow runs the audit **diagnostically**, followed by its browser smoke test. The audit fails only on broken mechanical invariants; it does **not** assert that authored source weights or role frequencies are psychologically correct.
- The audit script and this report **do not modify personality mappings or scoring behavior**. Any corrective implementation should be separately tested against this baseline before merging V2.0.

**Interpretation rule:** Determinism is necessary, not sufficient. A deterministic selection that flips unpredictably when an irrelevant raw score moves by one is reproducible but not meaningfully interpretable.
