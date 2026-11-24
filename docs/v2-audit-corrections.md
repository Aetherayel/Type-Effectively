# V2.0 — audit corrections and first comparison

This is the first corrective pass against the historical, reproducible baseline in
[docs/v2-audit-baseline.md](./v2-audit-baseline.md). No Wall/Tank merger or role-template change is included.

## Implemented

**1. Three complete questionnaire sections required for every visible result.**
The public browser route now calls `generateCompleteBuild` and rejects missing cognition
(five 16Personalities axes or eight functions), Enneagram (nine scores, Rowe totals or
complete ranking), or Big Five (five domains). Merely selecting MBTI or tritype overrides
cannot substitute for those inputs. Legacy type-only and tritype-only buttons were
removed; the original low-level `generateBuild` still supports old fixtures and
diagnostics internally, but is not used to render user-facing results. Invalid attempts
clear the previous card, export/trainer state, and user-facing result status.

**2. Held items now rank strictly by explainable fit.**
The FNV-1a raw-score tie adjustment is gone. Eligible equipment is ranked using
the existing 47% family, 38% item-trait, and 15% role-fit contributions (with
bounded facet-family preferences inside the family component). Exact ties are
broken by item name, not a survey-score-dependent pseudo-random number.
Specialized fixed equipment still requires its mechanical prerequisites.

**3. All six Enneagram stat columns are centered to the same 50 affinity.**
`ENNEAGRAM_STAT_BASELINE` contains the arithmetic means of the nine existing
type prototypes for each stat; these means are subtracted before blending,
so a uniform nine-type Enneagram profile yields 50 for every stat. Relative
differences between types are preserved. No other framework weights or battle
role definitions changed.

## First paired comparison

Run `npm run audit:v2` on the branch to reproduce these deterministic
**synthetic stress tests**, not a representative sample of users.

| Metric | Previous V2 baseline | After the three corrections |
| --- | ---: | ---: |
| All-neutral base HP / Atk / Def / SpA / SpD / Spe | 90 / 87 / 95 / 90 / 88 / 85 | **90 / 89 / 89 / 89 / 89 / 89** |
| Held-item change from one Big Five point | 53.7% | **0.7%** |
| Held-item change from one Enneagram point | 50.3% | **1.3%** |
| Held-item change from one 16P point | 52.7% | **1.3%** |
| Held-item change from one function point | 53.0% | **1.3%** |
| Tank primary role, 450 synthetic 16P+domain profiles | 159 (35.3%) | **132 (29.3%)** |
| Wall primary role, same cohort size | 26 (5.8%) | **16 (3.6%)** |

Both sets were collected using deterministic seeded tests. The RNG stream
changes when previously accessed features differ, so these are comparisons of
matching *test designs* rather than row-by-row matched cohorts; no causality
claim should be based on the exact prevalence differences alone.

### Still needs design work

- **Wall versus Tank:** The Wall template requires much higher HP, physical
  Defense and special Defense alongside low attacks. Tank emphasizes mixed
  durability and substantial counterattack. These are separate Pokémon
  mechanics, not synonyms. A neutral stat center reduces Tank prevalence
  but does **not** correct Wall underrepresentation. Do not merge roles solely
  to conceal a rare template; decide whether their strategic difference is
  worth maintaining and, if so, tune the role-target geometry *separately*.
- **Missing Big Five specialty threshold:** Existing internal-only
  low-level generator fixtures still permit omitted Big Five and apply
  a stricter specialist threshold. This pathway is no longer reachable
  from the user-facing app. It remains a candidate for removal in a focused
  code cleanup, not an active incomplete-result option.
- **Actual population:** All distributional checks use synthetic independent
  profiles and cannot establish real-world type frequencies or questionnaire
  validity. Compare real consented, anonymized or realistic correlated profiles
  before interpreting rarity as evidence of truth.

## Validation

New tests assert that incomplete public results are rejected and that
neutral baselines differ by at most one integer stat point. Browser smoke checks
that a missing section clears any prior result rather than showing an outdated
card. Held-item regression tests prohibit hash-based scoring and audit one-point
selection stability. Existing 535-BST, role reachability and special-move
compatibility checks remain in place.
