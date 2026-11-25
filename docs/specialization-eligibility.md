# V2 — Specialization eligibility and whole-build strategy scoring

A **Signature Strategy** is an optional, coherent *Ability + role tactic + held item* package.
**Battle role** answers how the Pokémon functions; **operating style** describes how it
approaches problems. The authored archetype name is assigned **after** the strategy
and is never a gate or a scoring input for it.

## Hard conditions shared by all twelve strategies

1. The full generator has complete cognition, Enneagram and Big Five test evidence.
2. The Pokémon has the required **visible** type and none of the forbidden visible types.
3. **Primary or close secondary role** matches a listed qualifying role. A secondary
   role exists only when within the established **five role-fit points** of primary.
   The qualifying role's score supplies the strategy-role fit.
4. Nature-adjusted **effective stats**, converted to the original 535-BST reference scale (`round(actual × 535/600)`), meet each minimum and maximum, if specified.
   This is distinct from battle-role classification, which uses **pre-Nature base stats**.
5. If an offensive style is specified, **physical** means Atk >= Sp. Atk; **special**
   means Sp. Atk > Atk.
6. Ordered Enneagram motivational fit must reach **55/100**. Motivation score:
   `clamp(15 + 55×coreMatch + 25×secondMatch + 15×thirdMatch, 0, 100)`.
   Core alone or the two supporting fixes together can qualify; merely having
   the required type or role is not sufficient.
7. Full strategy fit must be **at least 77/100** with measured Big Five evidence.
   With missing Big Five in internal legacy generation, the threshold is 82
   (the public form forbids this condition).
8. Ability, role tactic, move purpose, item, type and attack-swap mechanics
   must be internally compatible. If multiple packages meet all requirements,
   **the highest total score wins**; equal totals break by stable strategy ID.
   Otherwise the Pokémon retains its ordinary generalist Ability/moves/item.

### Eligibility catalogue — current implementation

| Strategy | Qualifying role(s) (primary or secondary) | Required / forbidden visible type | 535-reference effective stat gates | Favored Enneagram fixes | Ability · role tactic · held item |
| --- | --- | --- | --- | --- | --- |
| **Snow Bastion** | **Wall, Tank, Support, Controller** | Ice / none | Def >= 83; Sp. Def >= 82 | 1, 5, 6, 9 | Snow Warning · Aurora Veil · Icy Rock |
| Solar Engine | Sweeper | Fire / none | Speed >= 78 | 3, 7, 8 | Drought · Growth · Heat Rock |
| Regenerative Scout | Pivot | Water / none | HP >= 82 | 2, 5, 9 | Regenerator · Flip Turn · Heavy-Duty Boots |
| Toxic Warden | Controller | Poison / none | Sp. Def >= 78 | 4, 5, 8 | Corrosion · Toxic · Black Sludge |
| Barbed Bulwark | Wall | Steel / none | Defense >= 98 | 1, 6, 8 | Iron Barbs · Iron Defense · Rocky Helmet |
| Grassy Sanctuary | Support | Grass / **Ground excluded** | HP >= 80; Sp. Def >= 84 | 2, 6, 9 | Grassy Surge · Life Dew · Terrain Extender |
| Ashen Vanguard | Tank | Fighting / **Fire excluded** | Attack >= 98; HP >= 80; **physical offense** | 3, 6, 8 | Guts · Bulk Up · Flame Orb; Facade substitution |
| Venom Alchemist | Wall | Grass / **Poison and Steel excluded** | HP >= 92; Defense >= 84 | 5, 6, 9 | Poison Heal · Protect · Toxic Orb |
| Sandbound Citadel | Wall | Rock / none | HP >= 84; Defense >= 88; Sp. Def >= 78 | 1, 5, 6 | Sand Stream · Shore Up · Smooth Rock |
| Arcane Catalyst | Sweeper | Psychic / none | Sp. Atk >= 102; Speed >= 84; **special offense** | 3, 5, 7 | Magic Guard · Nasty Plot · Life Orb |
| Circuit Architect | Sweeper | Electric / none | Sp. Atk >= 100; Speed >= 88; **special offense** | 3, 5, 7 | Electric Surge · Charge · Terrain Extender; Rising Voltage substitution |
| Misty Custodian | Support | Fairy / none | Sp. Def >= 89; HP >= 80 | 1, 2, 6 | Misty Surge · Heal Bell · Misty Seed |

The favored fixes are the **members of the score-matching set**, not a hard list
of allowable core types. The type, role, minimum stats, offensive style,
motivation floor and overall score threshold are distinct filters.
All twelve strategies retain their established reference gates after the 600-BST transition.

### Formula for the other eleven strategies

- **35%** qualifying-role score
- **27%** fit to the strategy's target effective stat spread
- **24%** Enneagram motivation fit
- **14%** fit to its O/C/E/A/N temperament target

The targeted effective-stat similarity is
`clamp(100 - 1.25 × average(|effective_stat - target_stat|), 0, 100)`
over only the stats listed in the strategy's `targets` object.

Big Five similarity is
`clamp(100 - 0.9 × average(|temperament_value - target_value|), 0, 100)`
over all five Big Five context traits. With IPIP-NEO facets, these are
pre-existing symbolic context signals where facet groups replace broad domains;
no fictitious measured domain percentile is claimed.

### Snow Bastion: protective strategy with a planning preference

**Hard gates stay simple:** visible Ice, qualifying Wall/Tank/Support/Controller
role, Def >= 83, Sp. Def >= 82, Enneagram motivational fit >= 55,
total strategy fit >= 77, and legal Snow Warning / Aurora Veil / Icy Rock synergy.

Snow Bastion's **planning fit is a preference, never a hard requirement**.
The scoring uses the *inputs from which an Architect-like strategist might
emerge*, not the final name or archetype title. This avoids circularity because
archetype classification occurs after strategy selection.

For a 16Personalities input (or the existing derived five preferences from a
function-based test), with N = intuition, J = 100 − P, T = 100 − F:

`cognitivePlanning = .50*N + .35*J + .15*T`

`preparation = .50*C2 Orderliness + .50*C6 Cautiousness`

`conceptualPlanning = O5 Intellect`

`planning = .45*cognitivePlanning + .35*preparation + .20*conceptualPlanning`

If a complete relevant facet group is absent, its **reported broad score**
supplies the preparation/conceptual term, exactly like the new facet-first
Big Five engine. The cognition calculation **does not alter or renormalize**
the core stat cognitive-function formulas.

Snow Bastion's final strategy fit allocates exactly 100%:

- **25%** qualifying-role score
- **27%** effective-stat target fit (HP 113, Def 119, Sp. Def 112)
- **24%** ordered Enneagram motivation
- **9%** overall Big Five temperament fit
- **15%** protective planning fit

This reallocates the original 35% role and 14% temperament shares into
a meaningful planning preference. It does **not** add an unbounded bonus.
An exceptionally resilient, protective Ice Wall can still qualify without
Architect-like cognitive preferences; a planning-heavy Ice Controller or Tank
can qualify if it is genuinely durable enough and its full score clears 77.
An Architect title alone guarantees nothing.

**Tactic responsibility:** Aurora Veil is an explicitly protective move,
not a Tank attack or a Controller status-disruption move. When Snow Bastion
matches Wall or Tank, its tactic comes from the **Wall fortification pool**.
When it matches Support or Controller, it comes from the **Support ally pool**.
The actual battle role and archetype are not rewritten. The on-screen Ability,
moves and item remain normal Pokémon characteristics; only the signature
callout explains the coordinated package.

**Mechanical reminder:** Snow Warning enables Aurora Veil; Icy Rock extends
*snow*, not Aurora Veil. Reflect and Light Screen remain incompatible
redundant growth moves beside Aurora Veil. A Snow Bastion also cannot pair
this Veil with unsupported Baton Pass setup.

## Diagnostics and reproducibility

- `tests/signature-strategies.test.mjs`: every role/tactic mapping, hard
  typing and stat gates, high-vs-low planning and facets, absence of archetype
  gating, full 4,000-profile seeded compatibility and reachability stress test.
- `node scripts/smoke-browser.mjs`: complete form, card, source and export
  integration.
- No new specialist labels appear outside the signature strategy callout.
- No Nature, elemental typing, 535 BST, base-role, or final archetype formulas
  change here.

All scoring remains deterministic, fictional and authored for game-design
coherence; these are not validated personality measurements.

### V3 directional stat fit

The target values are desirable lower targets, not exact silhouettes. Score = 100 − 1.25 × mean positive shortfall, bounded to 0–100. Exceeding a desirable strength does not reduce fit. Solar Engine accepts either attack channel as the offensive target. Regenerative Scout and Sandbound Citadel no longer score Speed as a target: switching order and sand do not require a particular Speed. Existing hard minimum/maximum gates, motivation, typing, role and acceptance thresholds remain authoritative.
