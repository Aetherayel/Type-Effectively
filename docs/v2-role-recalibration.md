# V2 role recalibration — base stats before Nature

## Why this is a separate PR

The V2.0.0 scoring overhaul centered the six-stat baseline, removing an unintended
Defense prior. However, the six battle-role reference profiles were authored when
stat distributions differed, and the previous classifier used **Nature-modified
battle stats**. Nature therefore had two routes into gameplay identity: it was a
separate personality classification and could independently change battle role.

This PR treats role as an interpretation of the 535-point **underlying personality
spread**, not the later ±10% Nature battle effect. Nature still changes effective
battle stats, ability/move efficacy and specialist stat prerequisites. It cannot
change the underlying role chosen for those mechanics.

## What the new role model actually calculates

1. The same six authored role templates remain, each compressed 25% toward
   535/6 to keep targets within reach of personality-driven stat spreads.
2. For each role, calculate Gaussian RMSE similarity between the **base stats**
   and its eligible reference templates. Sweeper and Tank still permit
   physical or special offense.
3. Wall additionally permits mixed bulk (original template), physical bulk
   (120/55/135/55/90/80) or special bulk (120/55/90/55/135/80). Each variant
   has a legal 535-point total; each uses the same calibration scale.
4. Each role starts with a different similarity to a completely neutral
   (535/6 per stat) Pokémon. Rather than granting Pivot an accidental advantage
   for being closest to average, use
   **65% original stat fit + 35% (80 + original fit - neutral-profile fit)**,
   clipping the corrected fit to 0–100. This preserves most existing
   distance-sensitive scoring while removing part of the unequal neutral prior
   for all six roles, not just Tank/Wall.
5. A small defensive-role distinction uses top-two bulk
   (the two highest among HP, Def, and Sp. Def) and
   max(Attack, Sp. Atk). **Walls** prefer bulk above offense;
   **Tanks** prefer useful bulk *with* meaningful offensive investment.
   A 100-point defensive value is a **soft anchor**, not a qualification gate.
   The adjustment is capped at ±3.5 points for Wall and ±3 for Tank; it
   cannot overpower an unrelated role with a clearly stronger fit.
6. The original formula remains **80% stat fit / 20% elemental toolkit**
   plus the small defensive adjustment. The secondary role still requires
   a score within **five points**. The full six-role taxonomy remains.

The implementation lives in `src/roles.mjs`; the generator now passes
`baseStats` instead of `effectiveStats` to `classifyRole`. This keeps
scoring in one place and allows unit tests to inspect role explanations.

## Before-and-after audit (1,200 identical deterministic synthetic inputs)

The source of the comparison is `scripts/audit-role-candidates.mjs`.
Its reference model reproduces the original Nature-adjusted role formula;
the selected model reproduces the new production classifier. These are
synthetic stress tests across mixed 16P and eight-function input modes, **not
real-world population estimates or target distribution quotas**.

| Primary role | Original | Recalibrated |
| --- | ---: | ---: |
| Sweeper | 215 (17.9%) | **276 (23.0%)** |
| Wall | 47 (3.9%) | **105 (8.8%)** |
| Tank | 305 (25.4%) | **222 (18.5%)** |
| Pivot | 304 (25.3%) | **268 (22.3%)** |
| Support | 164 (13.7%) | **148 (12.3%)** |
| Controller | 165 (13.8%) | **181 (15.1%)** |

**291 of 1,200 primary roles changed (24.3%)**. All six remain reachable.
The model does *not* require particular role frequencies; this is evidence that
the change has not merely moved the old Tank/Pivot dominance to another role.

Defensive emphasis is more informative than frequency alone:

| Metric | Recalibrated Wall | Recalibrated Tank |
| --- | ---: | ---: |
| Average of two strongest defensive base stats | 104.7 | 97.5 |
| Average of all HP/Def/SpD base stats | 101.1 | 93.8 |
| Highest of Attack or Sp. Atk | 84.4 | 96.3 |
| Top-two defensive average minus offense | +20.2 | +1.2 |

A strong physical or special Wall can qualify without all three defensive
stats exceeding 100; no absolute gate is imposed.

### Transparent limitations

- This is a **symbolic game model**, not calibrated psychology.
- The five-point secondary-role margin yields many close hybrids:
  **848/1,200 (70.7%)**, versus **674/1,200 (56.2%)** with the old role
  classifier. This is a documented tradeoff; the PR deliberately does
  not silently redefine the previously selected five-point hybrid rule.
- Role changes can legitimately change archetypes, standard/hidden abilities,
  tactics, held items, and signature-strategy eligibility. They may also
  affect the distribution of specialization, because existing strategy
  eligibility considers secondary roles. Check exported cards and written
  text through the existing end-to-end suite.
- Specialist packages still have hard *battle-mechanical* minimum stat gates,
  evaluated on Nature-adjusted effective stats. These are not role gates.
- The synthetic results are reproducible but do not establish the role
  frequencies of actual users or validate questionnaire accuracy.

## Tests

`tests/role-recalibration.test.mjs` checks that role assignments match
the pre-Nature base stats, representative mixed/physical/special Wall and Tank
templates classify sensibly, all six roles remain reachable, and the
defensive styles remain differentiated. `scripts/audit-role-candidates.mjs`
also asserts that the deployed role classifier and the selected audit model
agree on every primary and secondary role across all 1,200 synthetic profiles.
CI runs this alongside the full tests and browser startup smoke check.

**Merge scope:** role scoring and the explanations/tests that follow it;
no changes to personality framework weights, Nature selection, battle moves,
the 535-BST budget, elemental typing or the six-role taxonomy.
