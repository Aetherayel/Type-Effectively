# Paired 535 → 600 BST audit

## Design

All builds receive 600 base points, not a personality-dependent power rating.
Neutral base stat = 100. Relative amplification changes from 1.25 to
1.25 × 600/535 ≈ 1.40187. Integer bounds change from 45–140 to 50–157.
The same bounded simplex projection and largest-remainder rounding are retained.
Roles normalize back to the original 535 reference (including dispersion labels).
Abilities, move tactics and signature strategies consume rounded Nature-adjusted
535-reference stats. The actual 600-BST base/effective numbers remain public
and level-100 EV training uses actual base stats. Real Pokémon relatives scale
to the build total, so their ranking can change deliberately.

## Paired synthetic stress audit

Baseline: `96413069eaffe4345fd325058f0e7a3f9e7d5da2`.
Seed: 20261124. 500 profiles each: percentages, eight functions, four-letter
fallback (internal compatibility), and percentages with all 30 facets.
This is synthetic sensitivity testing, not a distribution of real people.

| Metric | 535 | 600 |
| --- | ---: | ---: |
| Average stat | 89.167 | 100 |
| Mean within-profile standard deviation | 9.906 | 11.105 |
| Observed individual stat range | 47–135 | 52–151 |
| Signature strategies selected | 477 | 479 |
| Invalid allocations | 0 | 0 |

Mean absolute deviation from exact proportional scaling: 0.374 points per
stat. Largest deviation: 1.327. Neutral profile: six 100s. Raw affinities,
typing and Nature unchanged in all 2,000 profiles.

| Output | Changed profiles | Percent |
| --- | ---: | ---: |
| Primary role | 69 | 3.45 |
| Secondary role | 157 | 7.85 |
| Dispersion label | 12 | 0.60 |
| Signature strategy ID | 22 | 1.10 |
| Standard Ability | 73 | 3.65 |
| Hidden Ability | 69 | 3.45 |
| Held item | 74 | 3.70 |
| Archetype | 69 | 3.45 |
| Moveset | 90 | 4.50 |

Every changed primary role had an original first/second score margin of
at most two points. Role frequencies remained nearly unchanged:

| Role | Before | After |
| --- | ---: | ---: |
| Controller | 278 | 278 |
| Pivot | 465 | 466 |
| Tank | 405 | 406 |
| Sweeper | 461 | 458 |
| Wall | 183 | 180 |
| Support | 208 | 212 |

The transition is intentionally not a recalibration of personality inputs.
Integer quantization and Nature flooring can still move close decisions.
Relative move thresholds are retained as model conventions; they are not
claims of optimal competitive Pokémon speed tiers.

## Reproduction

From the updated repository:

```sh
git worktree add --detach ../type-effectively-535 96413069eaffe4345fd325058f0e7a3f9e7d5da2
node scripts/audit-bst.mjs ../type-effectively-535
npm test
```

The paired audit was executed against fetched engine sources in a JS harness,
including the committed normalization/role implementations. The standalone
worktree command above reproduces the same cohort generator in Node.
