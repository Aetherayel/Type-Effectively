# Type Effectively

**Version 2.1.0 — Community Beta**

> **Know yourself. Know your weaknesses. Blame type matchups.**

Ever wondered what kind of Pokémon your personality would make you?

No? Well, we made the calculator anyway.

**Type Effectively** turns 16Personalities, Enneagram, and Big Five results into a personalized Pokémon-style build: elemental typing, Nature, a **600 base stat total**, battle role, standard and Hidden Ability, a personality-driven held item, and four signature moves. A **36-archetype synthesis** and an eight-part, playful **Trainer Field Report** explain how the final creature behaves, where it excels, and what could go comically wrong. A bonus **Pokémon Relatives** section compares your build against real Pokémon for exact typings, closest six-stat distributions, and matching Abilities.

No sign-in. No backend. No personality data submitted to a server. Just an unreasonable amount of information about your imaginary battle potential. The app downloads a compact Pokédex snapshot locally; artwork is loaded directly from the PokéAPI sprite repository.

[**Try Type Effectively in your browser**](https://aetherayel.github.io/Type-Effectively/)

## Three tests, one build

| Layer | Quick path | Comprehensive path | What enters the model |
| --- | --- | --- | --- |
| Cognition | [16Personalities](https://www.16personalities.com/free-personality-test) | [Sakinorva Functions](https://sakinorva.net/test/function_bunya) (256 items) | Five bipolar trait percentages **or** eight comparable function totals (Ne, Ni, Se, Si, Te, Ti, Fe, Fi) |
| Motivation | [Find My Nine](https://findmynine.com/test) | [Rowe Enneagram](https://sakinorva.net/test/rowe) (306 items) | All nine Enneagram scores; derives the core, wing, and ordered tritype |
| Temperament | [Ocean Test](https://oceantest.net/test) | [IPIP-NEO-300](https://ipipneo.com/en/ipip-neo-300) (300 items) | Five Big Five domain scores/percentiles; the primary base-stat influence |

These are independent external websites. **No test integration, scraping, affiliation, or automatic import is implied.** Users enter the result numbers manually. Comprehensive means a longer, more detailed questionnaire—not a claim of scientifically superior Enneagram or cognitive-function typing.

**Function input:** Supply all eight comparable overall numeric function totals, including decimals if needed; do not mix scores from different domains or test scales. For Nature and type suggestion, the app takes the mean difference between opposing groups and maps each to a bounded 0–100 preference centered at 50. The cognition dimensions are: introverted versus extraverted functions, intuition versus sensing, feeling versus thinking, and outward perceiving versus outward judging. These derived preferences inform whole-profile Nature scoring and other legacy classification layers; they are not Sakinorva's typing algorithms or measured MBTI results. **Base stats instead use all eight function totals directly**, centered against the within-report mean, so different function profiles can earn different stats even when their four derived preferences match. Function totals and their contrasts also inform held items and whole-build archetype classification.

**Optional Sakinorva type override:** Use the existing four-letter type dropdown while entering eight functions. The app still records and scores the **same eight function totals**, but the chosen type controls the displayed identity and the cognitive polarity used in Nature scoring, and informs whole-build archetype interpretation. The function-derived suggestion remains visible for comparison. The Enneagram-derived elemental typing is unaffected by an MBTI override.

**Optional A/T identity:** Functions do not measure the Assertive/Turbulent axis. Leave A/T as **Not provided** to omit the suffix and retain an internal neutral 50 placeholder for compatibility; no measured A/T is claimed. If you know your A or T designation, select it independently. With no measured percentage, the engine uses its existing **type-only 75/25 proxy** (A → 25 and T → 75 on the Turbulent axis), explicitly flagged as an estimate. Input choices are preserved in shared links and reflected on result cards, without exposing raw function scores in PNG exports.

**Advanced Enneagram / Big Five:** Rowe reports nine **signed raw Enneagram type totals** (negative scores are valid) and separate subtype/instinct results. Select **Rowe raw** in the Enneagram panel and transcribe its nine type totals directly. The ordinary **9 scores** input still uses 0–100 values. The paths share typing and a fixed 600-point budget, but use stat-specific framework weights that differ between percentage and eight-function cognition inputs. Enter the five IPIP-NEO domain percentiles in O/C/E/A/N order, or supply all 30 facet percentiles; complete facet groups replace their corresponding domain contributions.

**Rowe normalization (authored game convention, not a validated crosswalk):** Let `low` and `high` be the smallest and largest of the nine raw totals, `mid=(low+high)/2`, and `span=max(50, high-low)`. Each type's internal score becomes `clamp(50 + 80*(raw-mid)/span, 0, 100)`. This maps the profile's relative order and distances onto the same internal domain without pretending Rowe provides percentages or forcing a narrowly spaced test result to 0/100 extremes. The 50-point reference floor and 80-point range are design choices, not empirical calibration, and two sources' resulting profiles cannot be compared as if they were the same instrument. Ties remain ties, so choose a manual tritype override if the reported test or self-typing resolves an important tie. Raw scores remain in a shared build link but are never printed on the exported PNG. Rowe's 27 instinctual subtype totals are currently **not** modeled.

**All three assessments are mandatory for a visible result.** Supply five 16Personalities percentages **or** eight cognitive-function scores, all nine Enneagram scores / Rowe totals **or** a complete nine-type ranking, and either five Big Five domains **or** all 30 IPIP-NEO facets. Four-letter type and tritype overrides remain available **alongside** test results but cannot substitute for them. Optional IPIP-NEO facets provide more detail. Earlier shared links missing any section no longer generate a result.

### Explore random combinations

The **Randomize ↻** button beside the results heading instantly creates a **synthetic sample build** using the ordinary calculator: five generated bipolar 16Personalities scores, nine Enneagram scores with a valid ordered tritype, and five Big Five scores. The editable input controls update to match the sample, so visitors can inspect exactly how it was produced. Clicking again creates a fresh combination without requiring any manual form entry.

The result clearly reads **RANDOM SAMPLE · SYNTHETIC SCORES**, not a personal assessment. The hero offers instant sample exploration or a personal build. Synthetic provenance persists through edits, copied summaries, PNG exports and share links; choose Reset inputs or Build my Pokémon to start a fresh personal build. Randomizing clears any old share-link hash. All work remains local in the browser.

**v1.0 note:** Randomized profiles now use the 17-type motivational affinity model. All 17 generated types are reachable across valid tritypes and wings; Normal remains part of official Pokémon mechanics but is not generated as a personality type.

### Manual overrides

The inferred four-letter type, ordered tritype, and wing can be overridden. Overrides affect **identity and type selection**, while entered score distributions remain intact for stats. This preserves the distinction between your interpretation of the tests and the raw measurements.

A tritype must have exactly one number from each center:

- Gut: 8, 9, 1
- Heart: 2, 3, 4
- Head: 5, 6, 7

There are **27 distinct center combinations** and **162 ordered tritypes**. Each of the nine Enneagram motivations has an explicit affinity score for every one of the **17 generated Pokémon types**; Normal is excluded only from personality typing. Ordered core, second and third fixes—and an evidenced wing when available—determine the elemental result. Two independently scored roles can select the same type, creating a genuine **monotype**.


### Meanings of the 17 generated elemental identities

| Type | Motivation-level meaning |
| --- | --- |
| Fire | Intensity, passion and decisive transformation |
| Water | Adaptation, responsiveness and finding a way through |
| Electric | Momentum, activation and rapid connection |
| Grass | Cultivation, patience and restoration |
| Ice | Restraint, preservation and protective distance |
| Fighting | Confrontation, discipline and overcoming resistance |
| Poison | Counterpressure, deterrence and strategic boundaries |
| Ground | Rootedness, pragmatism and dependability |
| Flying | Freedom, exploration and expanded perspective |
| Psychic | Insight, abstraction and foresight |
| Bug | Interdependence, persistence and specialized cooperation |
| Rock | Fortitude, steadfastness and resistance to change |
| Ghost | Interior depth, introspection and mystery |
| Dragon | Sovereignty, agency and commanding presence |
| Dark | Cunning, privacy and indirect strategic advantage |
| Steel | Structure, precision and principled consistency |
| Fairy | Enchantment, imaginative connection and encouragement |

All affinity values are **authored game-design interpretations**, not measured likelihoods or psychological diagnoses. The nine Enneagram rows each contain a score for every one of these 17 meanings. See `TYPE_AFFINITY` in `src/data.mjs`. The complete 162 ordered-tritype × 2 valid-wing space is tested for reachability; Pokémon mechanics still operate on all 18 official types.

### Slot 3 vs. slot 4: tactical identity and corrective formation

**Slot 3 (role tactic)** expresses what the build does effectively. Function classification is mandatory; elemental fit and battle statistics choose among valid tactics. Curse is ineligible as a durability buff for Ghost types; Aurora Veil requires Snow Warning within the same build; Trick Room is restricted to low-Speed builds; Shed Tail requires a reasonable HP reserve. The offensive stat ratio can prefer certain attacks without classifying Status moves as physical or special.

**Slot 4 (growth move)** expresses the correction the core Enneagram motivation most needs. Type 3 must share success rather than merely boost personal achievement; Type 5 must pass understanding outward rather than simply think harder; Type 6 must act despite uncertainty rather than accumulate protection. All five candidate moves per core have been audited against those lessons. Joint selection considers both slots, while preserving the identity-defining move meaning. **Baton Pass** is eligible only when another equipped move establishes transferable self-stat boosts, or the active standard Ability is **Speed Boost**. A Hidden Ability is an alternative, not active alongside the standard one. Snow, Aurora Veil, Reflect, Light Screen and Tailwind do not supply transferable stat stages. Builds without valid Baton Pass setup keep the other core-specific growth choices.

## V2.0 stability corrections — complete inputs, no hash, neutral source priors

- **Mandatory three-part assessment:** The UI accepts only actual cognitive questionnaire scores, complete Enneagram scores/Rowe totals/ranking, and five Big Five domains or all 30 facets. Type and tritype overrides adjust identity but cannot stand in for a missing framework. No result card, share action, EV trainer, or printed interpretation is rendered from an incomplete entry; invalid regeneration also clears previously rendered results.
- **Held-item stability:** Removed the raw-score FNV-1a tie adjustment (previously up to ±4 score points). Eligible items are ranked on motivational family fit, Big Five trait compatibility, battle-role fit and bounded facet nuances, with stable name-based ties. A one-point questionnaire adjustment now changes held items only when substantive scores/eligibility genuinely change.
- **Centered Enneagram stat baselines:** Each of the six authored type-prototype column means is subtracted and replaced with an affinity of 50. Identical nine-type inputs now contribute a neutral value to every stat, whatever that stat's framework weighting. Relative differences between types are preserved. At all-neutral inputs, the 600 BST is exactly **100 in each stat**.
- **Defensive role distinction remains intentionally unresolved:** Wall is about sustained containment; Tank is a durable attacker. Their synthetic frequency should be audited separately before merging them or modifying battle-role geometry.

The baseline before these changes is preserved in `docs/v2-audit-baseline.md`. Rerun `npm run audit:v2` against the current branch to compare outcome distributions.

## V2 boundary: existing changes versus potential next steps

**V2.0 delivers** stat-specific source weights, direct eight-function cognitive affinity scoring, recalibrated Big Five and Enneagram affinities, aligned stat and Nature meanings, and tests of overall distribution and mechanical coherence. This deliberately changes old results.

**Also included in V2:** IPIP-NEO **facet-first** scoring. Complete facet groups replace broad-domain inputs within the relevant scoring pathways; a full 30-facet report can satisfy Big Five without additional domain scores. Old five-domain inputs and links remain valid.

## Generation model (v2.1; core Pokémon typing retained; 600 BST)

Deterministic. The same inputs always produce the same result. The output is explainable.

1. **Elemental typing:** Score each of the 17 elements against all nine Enneagram motivations using `TYPE_AFFINITY`. **Primary:** core 88% + wing 12% (or core 100% if wing is unknown). **Secondary:** second fix 65% + third fix 30% + core 5%. **Hidden affinity:** third fix 60% + second fix 30% + wing 10% (or 70% third / 30% second if wing is unknown); exclude both visible types. All three selections are deterministic. Monotypes arise only when primary and secondary independently coincide.
2. **Nature:** Score all **20 distinct non-neutral Pokémon Natures** as a motivation/cognition/temperament **priority tradeoff**, before applying Nature to stats. See the scoring specification below; MBTI letters alone no longer determine Nature.
3. **Base affinities:** Blend Big Five, nine-type Enneagram distribution, and cognition using **stat-specific source weights**. The cognitive contribution is adjusted according to whether users enter eight functions or actual 16Personalities percentages. The historical four-letter-only calibration remains an internal compatibility rule but is not available as a user-facing input mode (see matrix below).
4. **Base stats:** Center the six affinities around 100, multiply deviations by 1.25 × (600/535), constrain each stat to 50–157, and redistribute/round to preserve **exactly 600 BST**.

   **New results-only diagnostic:** In the Base Stats panel, select **Before normalization** to inspect all six unnormalized, *blended* game affinities (0–100), their six-affinity mean, and each affinity’s deviation from that mean. The underlying values are generated by the same formulas as the Pokémon stats; this view does not recalculate the build, alter the fixed BST, assign a relative population rank, or imply measured ability. An optional source breakdown reveals each stat’s Big Five / Enneagram / cognition affinity and its framework weight, including any Big Five facet refinement. The default Pokémon radar remains the canonical battle-stat view; both downloadable card versions and EV training are intentionally unaffected by the screen-only inspection toggle.
5. **Nature modifiers:** Apply +10% to one and −10% to another non-HP stat *after* the base stat calculation. These do not change the underlying BST.
6. **Battle role (V2 refinement):** Classify from the **600 base stats before Nature's ±10% modifiers**. Keep all six roles and the 80% stat-template similarity / 20% elemental toolkit model, with secondary roles within five score points. Original 535-BST calibration references remain in `ROLE_TEMPLATES`, compressed 25% toward 535/6; the 600-BST base stats are converted to this reference scale, but their different distances from a neutral Pokémon introduced a Pivot advantage. The V2 calibration in `src/roles.mjs` preserves **65% of raw stat similarity** and uses **35% neutral-baseline-corrected fit** (each role compared with its own fit against a perfectly balanced 535-BST reference). Wall now matches mixed, physical, or special endurance templates. Small bounded adjustments based on the two strongest of HP/Def/Sp. Def, offensive investment, and defensive priority differentiate Walls that endure from Tanks that endure *and retaliate*. No hard 100-reference-point eligibility gates or arbitrary frequency quotas are added. Nature affects battle performance and the subsequent specialist/move gates, **never role classification**.
7. **Abilities and moves:** For non-signature builds, rank standard Ability candidates by role, visible typing, stat synergy, and second fix. Select a **different Hidden Ability** from the same curated pool, **strictly requiring affinity with at least one visible Pokémon type**, then score it against battle role, stats, second fix, and third fix. The hidden *elemental* affinity remains separate and can provide monotype coverage, but never dictates an off-type Hidden Ability. Four moves comprise primary STAB, secondary STAB/coverage, a **functionally classified role tactic**, and a **corrective growth move**. The third move is chosen by role function first (offense, protection, endurance, positioning, ally support or disruption), then checked against mechanical prerequisites, stats, visible types, supporting fixes and hybrid role. The fourth move must express the Enneagram core's **growth lesson rather than its usual defensive strategy**. The last two moves are **selected as a pair**, preserving four unique moves and avoiding redundant or contradictory setups.
8. **Held item:** For non-signature builds, select moves before ranking **72 regular Pokémon held-item candidates** across **nine behavioral families**. Reject items whose defining effect conflicts with the resulting typing and moves: for example Assault Vest on a Status-move build, Black Sludge without Poison typing, Big Root without draining/recovery interaction, Light Clay without screens, and unsupported weather/terrain items. Choice items are excluded from these multi-action four-move builds because their lock conflicts with the app's tactical/growth model. Score compatible choices using the Enneagram, Big Five and role, with stable name-based exact ties. Items remain thematic and **do not modify calculated stats, moves or matchups**.

9. **Whole-build archetype (post-generation):** After typing, Nature, 600-point stats, role, Abilities, moves and item are finalized, classify the result against **36 curated archetypes**: six motivational/cognitive/temperamental operating styles × six battle expressions. The game-affinity score combines **25% Enneagram motivation** (all nine scores plus ordered tritype), **20% 16Personalities cognitive preference** (five percentages, respecting overridden letters), **25% Big Five temperament**, and **30% battle-role compatibility**. Battle compatibility already reflects stats and visible typing, so neither is independently counted again. The best-ranked candidate wins; close competitors and four scoring components are shown for transparency. Nothing in archetype selection feeds backward into the Pokémon build.
10. **Trainer Field Report:** A fictional, dynamically generated **Pokédex field entry** introduces the creature, followed by a **three-order Trainer Playbook**: practice the actual role-tactic move using the strongest stats, bring coverage for the actual type-chart weaknesses, and train the actual corrective growth move. Eight further field notes address instincts, MBTI-style habits, OCEAN temperament, deployment, vulnerabilities, contradictions, party synergy, and growth—**as advice to a Pokémon trainer**, not a clinical assessment of the player. The narrative references the complete generated build, including Nature and the 600 BST budget. Missing Big Five inputs are explicitly described as estimates, not observations. The report displays qualitative observations, not raw personal assessment scores; downloaded card behavior is unchanged.

### Base-stat calibration and semantic contract

**Base stat = relative strength. Nature = prioritized behavior at another behavior's expense.** The same six meanings apply throughout the model; no Pokémon Nature name is treated as a validated personality definition.

**Stat-specific source weights** — each entry is Big Five / Enneagram / cognition; each row totals 100% independently. These are authored game-design judgments, not claims of psychometric reliability.

| Stat | Eight functions entered | 16Personalities percentages entered | MBTI label only |
| --- | --- | --- | --- |
| HP · Resilience | 60 / 30 / 10 | 65 / 30 / 5 | 70 / 25 / 5 |
| Attack · Assertion | 35 / 35 / 30 | 45 / 35 / 20 | 50 / 40 / 10 |
| Defense · Fortitude | 35 / 45 / 20 | 40 / 45 / 15 | 45 / 45 / 10 |
| Sp. Atk · Ingenuity | 25 / 25 / 50 | 45 / 30 / 25 | 50 / 40 / 10 |
| Sp. Def · Composure | 60 / 25 / 15 | 65 / 25 / 10 | 70 / 25 / 5 |
| Speed · Responsiveness | 40 / 25 / 35 | 50 / 25 / 25 | 60 / 30 / 10 |

**Why:** Big Five supplies stronger proxies for sustained resilience and emotional composure. Enneagram motivation contributes more to principled boundaries. Detailed functions supply richer distinctions for conceptual ingenuity and responsiveness. The extra dimensions are not automatically *truer*: the weights reflect explanatory detail, not questionnaire validity. These inputs still normalize to exactly 600 BST. All three framework sections are required for visible builds, so missing Big Five no longer contributes inferred neutral values in the interface. Nature scoring stays separate.

| Stat | Meaning | Distinction |
| --- | --- | --- |
| HP | Resilience | Sustained effort and recovery |
| Attack | Assertion | Direct action and confrontation |
| Defense | Fortitude | Boundaries and resistance to disruption |
| Sp. Atk | Ingenuity | Inventive connections and conceptual solutions |
| Sp. Def | Composure | Emotional regulation and perspective |
| Speed | Responsiveness | Reaction tempo and quick adaptation |

### Facet-first Big Five scoring (V2)

**Three-section rule stays mandatory.** The Big Five section can be fulfilled in either of two ways: (a) all five reported broad O/C/E/A/N scores, or (b) **all 30 IPIP-NEO facet percentiles**. Users may combine the two: each *complete group of six* facets replaces that broad domain for downstream scoring; any group not entered uses its reported parent domain. No group may be partially filled. Raw test sums do not substitute for facet percentiles. Existing domain-only inputs and shared links remain compatible.

**When facets exist, broad domains do not constrain or add a bonus to their contribution.** Each outcome uses a selected subset of facets relevant to its meaning. Each stat still receives its original Big Five / Enneagram / cognition framework weight, and every Pokémon still has **exactly 600 BST**.

| Stat | Facet-first examples (directly used when those six-facet groups are complete) |
| --- | --- |
| HP · Resilience | C5 Self-Discipline, C4 Achievement-Striving; N6 Vulnerability, N1 Anxiety; A3 Altruism, A6 Sympathy |
| Attack · Assertion | E3 Assertiveness, E4 Activity Level; C1 Self-Efficacy, C4 Achievement-Striving; inverse A4 Cooperation/A5 Modesty |
| Defense · Fortitude | C3 Dutifulness, C6 Cautiousness, C5 Self-Discipline; inverse E5 Excitement-Seeking/E4 Activity; inverse N6 Vulnerability |
| Sp. Atk · Ingenuity | **O5 Intellect (65%), O1 Imagination (25%), O2 Artistic Interests (10%)** in the existing 60% Openness slot; C5/C1 and low E2/E5 inform other existing slots |
| Sp. Def · Composure | Inverse N6 Vulnerability, N2 Anger, N1 Anxiety; A4 Cooperation/A1 Trust; C6 Cautiousness/C5 Self-Discipline |
| Speed · Responsiveness | E4 Activity, E3 Assertiveness, E5 Excitement-Seeking; O4 Adventurousness/O1 Imagination; inverse C2 Orderliness/C6 Cautiousness |

A facet-first Sp. Atk can therefore be high even if overall Openness is low: **reported Openness is not used in the detailed Openness term**. The implementation is in `src/bigfive-facets.mjs` (`FACET_STAT_COMPONENTS`). Each component coefficient and facet-focused convex weight is explicit and deterministic. Percentile ranks are not raw additive trait quantities; these combinations are **authored game heuristics**, not inferred psychometric factor scores.

Other outcomes are facet-aware without introducing a new scoring source:

- **Nature:** uses independently mapped facet combinations within its original **25% temperament** preference evidence. Nature remains separate from stat calculations.
- **Archetype:** compares meaning-relevant facets to the six authored behavioral prototypes within the existing **25% temperament fit**. No extra +6 bonus is added.
- **Held items:** each eligible equipment family's and item's target-fit comparison uses selected facets instead of parent domains. The original family/trait/role weighting and compatibility requirements are unchanged, with no extra +4 scoring bonus.
- **Signature strategies and compact OCEAN summary indicators:** existing whole-profile systems that still require five numbers receive *symbolic facet-context signals*, not manufactured IPIP domain percentiles. They are generated from specified, relevant facets only for the groups that were supplied. Never label these numbers as measured broad scores.
- **Trainer's Guide:** emphasizes specific facet patterns rather than offering generic high/low Openness claims that might contradict them. Distinctive facet notes are judged against a **neutral game-score reference** rather than an unavailable parent percentile.

**Deliberate exclusions:** O6 Liberalism (political/moral views), A2 Morality (moral conformity), and N3 Depression (depressive affect) have no independent facet gameplay or interpretive effect. When only broad scores are provided, the original domain score still applies normally. The model is neither an intelligence test nor a diagnosis.

Both the unnormalized-affinity display and the downloadable Pokémon cards remain consistent with the current generator. Broad-only stat and item calculations are preserved as a backward-compatible path.

**Big Five base affinities** (O/C/E/A/N are entered domains, Stability=100−N):

- HP = `0.55C + 0.35 Stability + 0.10A`; Atk = `0.45E + 0.20(100−A) + 0.35C`
- Def = `0.45C + 0.30(100−E) + 0.25 Stability`; SpA = `0.60O + 0.20C + 0.20(100−E)`
- SpD = `0.65 Stability + 0.20A + 0.15C`; Spe = `0.45E + 0.35O + 0.20(100−C)`

**16Personalities cognitive base affinities** (used only without eight-function results; I/N/F/P as reported, E=100−I, S=100−N, T=100−F, J=100−P):

- HP = `0.35J + 0.20I + 0.45×50`; Atk = `0.45E + 0.35T + 0.20J`
- Def = `0.45J + 0.30I + 0.25T`; SpA = `0.60N + 0.25T + 0.15I`
- SpD = `0.35I + 0.30J + 0.35×50`; Spe = `0.45E + 0.35P + 0.20S`

**Direct eight-function base affinities** (used only when comparable Ne/Ni/Se/Si/Te/Ti/Fe/Fi totals are entered): subtract the within-profile eight-function mean from each score, producing deviations `ne,ni,se,si,te,ti,fe,fi`. Bound each resulting stat affinity to 0–100.

- HP = `50 + 0.50×(0.35si + 0.30ni + 0.20te + 0.15fi)`
- Atk = `50 + 0.50te + 0.30se + 0.20fi`
- Def = `50 + 0.35si + 0.35fi + 0.20ni + 0.10ti`
- SpA = `50 + 0.42ni + 0.32ne + 0.26ti`
- SpD = `50 + 0.45×(0.40ti + 0.35fi + 0.25si)`
- Spe = `50 + 0.45se + 0.35ne + 0.20te`

This retains the distinctions that the four-letter reduction loses, without interpreting raw Sakinorva totals as 0–100 percentiles. Uniformly shifting every input function score has no effect. HP and SpD are attenuated, since functional preferences are weak evidence for resilience or emotional regulation. The stat-specific cognitive contribution changes with the reported detail; no additional scoring source is introduced. The four derived preference contrasts still inform Nature and legacy interpretation, keeping base-stat style and Nature priorities conceptually separate.

HP and SpD cognitive affinities deliberately shrink toward neutral 50 because the four cognitive axes are weak evidence for resilience and emotional regulation. The 16Personalities A/T dimension is excluded to avoid double-counting emotional sensitivity. Authored nine-type Enneagram base affinities live in `ENNEAGRAM_AFFINITIES`, distinct from Nature's motivational preferences. Lower Agreeableness is only a minority contributor to Attack; Neuroticism no longer raises Speed. HP, Defense and Sp. Def can correlate, but now have different principal signals.

**Limits:** This is a deterministic game calibration, not a validated personality assessment. The weights and prototypes are design judgments. They intentionally change downstream battle roles, abilities and moves when the recalibrated stat spread warrants it; typing, Nature mechanics, and the then-535-point budget remained unchanged.

### How Nature is scored (v1.4 onward; retained in V2)

Nature answers **which behavior is prioritized, and which competing response is sacrificed?** It does **not** rank aptitude, so it never reads base stats, battle role, typing, abilities, or archetype. The five non-HP meanings are shared with base stats; the preference and capacity formulas remain separate:

| Nature preference axis | Interpretation |
| --- | --- |
| Attack | Decisive assertion (choosing to confront/act) |
| Defense | Protective fortitude (choosing boundaries/resistance) |
| Sp. Atk | Inventive exploration (choosing inquiry/possibilities) |
| Sp. Def | Steady composure (choosing regulation/perspective) |
| Speed | Responsive adaptation (choosing immediate adjustment) |

**Enneagram component:** Nine authored motivational prototypes, ordered Attack / Defense / Sp. Atk / Sp. Def / Speed. These are **preference scores**, not the `ENNEAGRAM_AFFINITIES` aptitude matrix used for base stats.

| Type | Atk | Def | SpA | SpD | Spe |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 46 | 94 | 75 | 83 | 27 |
| 2 | 38 | 53 | 48 | 96 | 64 |
| 3 | 94 | 68 | 54 | 41 | 88 |
| 4 | 41 | 32 | 91 | 63 | 64 |
| 5 | 22 | 77 | 99 | 74 | 21 |
| 6 | 40 | 89 | 76 | 94 | 32 |
| 7 | 79 | 22 | 70 | 28 | 99 |
| 8 | 99 | 72 | 38 | 34 | 77 |
| 9 | 22 | 64 | 45 | 96 | 36 |

For each preference axis: `Motivation = 50 + (0.55 × core prototype + 0.25 × second fix + 0.10 × third fix + 0.10 × all-nine weighted prototype) − nine-type prototype mean for that axis`. All-nine weights are `max(0, score − 20)^2 + 16` and are normalized to sum to 1, preserving the supplied score distribution. Mean-centering prevents authored category offsets from making one stat the default winner.

**Cognitive component:** Let `I,N,F,P` be four 0–100 preference percentages; `E=100−I`, `S=100−N`, `T=100−F`, `J=100−P`. For an intentional type override, keep the reported distance from 50 but point it toward the overridden letter. The four preference axes (not A/T) determine:

- Atk = `0.30E + 0.55T + 0.15J`; Def = `0.20I + 0.15S + 0.15T + 0.50J`
- SpA = `0.20I + 0.55N + 0.25T`; SpD = `0.35I + 0.30J + 0.35×50` (weak cognitive proxy)
- Spe = `0.30E + 0.25S + 0.45P`

**Big Five component, only when measured:** `O,C,E,A,N` are the entered 0–100 domains and `Stability = 100−N`.

- Atk = `0.30E + 0.30(100−A) + 0.40C`; Def = `0.55C + 0.25 Stability + 0.20(100−E)`
- SpA = `0.55O + 0.25(100−E) + 0.20C`; SpD = `0.65 Stability + 0.15A + 0.20C`
- Spe = `0.40E + 0.25(100−C) + 0.35O`

For each candidate Nature's boost stat `b` and reduced stat `d`, calculate a source's **pair fit** as `50 + (sourcePriority[b] − sourcePriority[d])/2`. Score the candidate as **45% Enneagram + 30% cognition + 25% Big Five**. A four-letter-only proxy reduces cognitive weight to 15 before re-normalizing. The user-facing generator requires measured Big Five domains; internal historical fallback modes are still present for lower-level test compatibility but never generate a user-visible build. Highest score wins; exact ties are alphabetically deterministic. No arbitrary variation or equalization quota is applied.

**Worked example (bundled INTJ-A / 593 sample):** Quiet (+Sp. Atk, −Speed) receives Enneagram pair fit **67.7**, cognitive pair fit **83.8**, and Big Five pair fit **75.5**. The resulting score is **74.5** after weighting (45/30/25). This is the bundled demo profile, not a fixed result for all INTJs or all 593s. Numbers are rounded for display; candidate ranking uses full precision.

The results screen's **Why this Nature?** disclosure shows the selected contrast, weighted component fits, and close alternative. All five neutral Natures are intentionally excluded from the 20 distinct mechanical tradeoffs; the selected Nature preserves the existing ±10% non-HP modifiers and 600 BST. Nature-adjusted stats continue to feed specialists, moves, and EV suggestions (roles use pre-Nature base stats), so changing Nature can legitimately alter the downstream build. This is a fictional game model, not validated psychological scoring.

### Signature Strategies

**Battle role = what the Pokémon does. Signature Strategy = how its mechanics work together.** Twelve authored, optional packages are now available:

| Strategy | Required role / typing | Ability | Role move | Held item |
| --- | --- | --- | --- | --- |
| Snow Bastion | **Wall, Tank, Support or Controller / Ice** | Snow Warning | Aurora Veil | Icy Rock |
| Solar Engine | Sweeper / Fire | Drought | Growth | Heat Rock |
| Regenerative Scout | Pivot / Water | Regenerator | Flip Turn | Heavy-Duty Boots |
| Toxic Warden | Controller / Poison | Corrosion | Toxic | Black Sludge |
| Barbed Bulwark | Wall / Steel | Iron Barbs | Iron Defense | Rocky Helmet |
| Grassy Sanctuary | Support / Grass | Grassy Surge | Life Dew | Terrain Extender |
| Ashen Vanguard | Tank / Fighting (not Fire) | Guts | Bulk Up | Flame Orb |
| Venom Alchemist | Wall / Grass (not Poison/Steel) | Poison Heal | Protect | Toxic Orb |
| Sandbound Citadel | Wall / Rock | Sand Stream | Shore Up | Smooth Rock |
| Arcane Catalyst | Sweeper / Psychic | Magic Guard | Nasty Plot | Life Orb |
| Circuit Architect | Sweeper / Electric | Electric Surge | Charge | Terrain Extender |
| Misty Custodian | Support / Fairy | Misty Surge | Heal Bell | Misty Seed |

A package must pass **hard role, visible-type, Nature-adjusted 535-reference stat, motivation (at least 55 fit), and mechanical item/move eligibility**. The other eleven packages retain their established 35% role / 27% effective-stat fit / 24% ordered Enneagram motivation / 14% Big Five fit formula. Snow Bastion instead uses **25% role / 27% stat / 24% motivation / 9% Big Five / 15% preparation-and-planning fit**. That last component derives from conceptual/J/T cognitive preferences and C2 Orderliness, C6 Cautiousness, and O5 Intellect when available, without requiring the later Architect archetype title. The acceptance threshold is **77 fit points** with complete Big Five evidence; it is an authored game score, not a psychological probability. If multiple packages qualify, highest score wins with deterministic tie-breaking. Complete conditions for all twelve strategies are documented in [Specialization eligibility](docs/specialization-eligibility.md).

Specialization jointly selects standard Ability, role tactic and held item. A close **secondary battle role** (within the existing five-point hybrid threshold) can qualify just as the primary role can. **Snow Bastion's protective Aurora Veil** serves both fortification (Wall/Tank) and team defense (Support/Controller) by using a coherent Wall or Support tactic pool; this **never relabels** the actual role or archetype. Other packages keep their qualifying role's normal tactic pool. All typing, stat, motivation, and trait gates still apply. **In the result UI, the Signature Strategy box is the only place that names or explains the package**; the individual ability, moves, held item, Trainer Guide, methodology, copied text and downloadable card present those choices as ordinary Pokémon characteristics. **Two explicitly gated attack substitutions** also express whole-build mechanics: the physically oriented Ashen Vanguard replaces its secondary attack with **Facade**, using Flame Orb + Guts; the specially oriented Circuit Architect replaces its Electric attack with **Rising Voltage**, boosted against grounded targets in Electric Terrain. The other attack remains unchanged. All cases preserve two offensive moves, the corrective growth move (slot 4), elemental typing, Nature, 600 BST, battle role and the separate Hidden Ability. **Icy Rock extends snow, not Aurora Veil**: Light Clay would extend the Veil itself. A Snow Bastion cannot also select Reflect or Light Screen as its growth move because the barriers are redundant. Specialist-only Abilities and self-status Orbs are excluded from normal independent selection.

**The existing “Focused / Highly specialized” stat-spread label is different:** it describes stat dispersion, not this optional Signature Strategy.

**Archetype taxonomy:** `src/archetypes.mjs` defines six independent operating-style prototypes and 36 authored names, signatures, strengths, and pitfalls. Prototype fit uses distance to the Enneagram, MBTI-style, and OCEAN score distributions; role compatibility uses the six already computed role fits. Every candidate uses the same weights and deterministic tie-breaking. The 0–100 values are **authored game-design similarities**, never probabilities, predictions, diagnoses, or scientifically validated typology.

**Pivot role convention:** Tactics must reposition the user's Pokémon (for example, U-turn, Volt Switch, Parting Shot or Shed Tail). Baton Pass remains available as a **growth/setup-transfer move**, not a Pivot role tactic. Dragon Tail (forces an opponent switch), Rapid Spin (removes hazards) and Tailwind (speed support) are likewise excluded from Pivot tactics.

The standard and Hidden Abilities are **alternative strengths**, not concurrently active. A Fire/Fighting build cannot be assigned Sand Force solely because it has a Ground hidden elemental affinity; a Water/Ice build cannot inherit Solid Rock by the same mechanism. This changes mechanical selection without altering the v1.0 seventeen-type typing or the then-535-BST model.

The six possible tactical roles are Sweeper, Wall, Tank, Pivot, Support, and Controller. Specialization (versatile / focused / highly specialized) is inferred from stat dispersion rather than assigned from a personality label. **Historical v1.1 behavior:** That role calibration preserved the Nature system of its day. **v1.4 changed Nature selection; v2.0 recalibrates the base-stat model**, so derived roles and specialist outcomes can change; the then-535 base-stat budget, elemental typing, archetype catalog, and hybrid threshold remained intact. A newly selected role may legitimately change the standard/Hidden Ability, move pair, held item, and Trainer Field Report; card exports and report text use the same recomputed build.

### Examples

| Profile | Typing | Nature | Hidden affinity |
| --- | --- | --- | --- |
| INTJ-A · 593 (5w6) | Ice / Water | Quiet (sample complete profile) | Fighting |
| ESFP · 714 (7w8) | Electric / Steel | Hasty (sample complete profile) | Psychic |
| INTJ · 514 (5w4) | Psychic / Steel | Varies with full profile | Ghost |

Typing examples remain deterministic for the stated core/wing/fixes. **Nature now depends on motivation, cognition and measured temperament**, so it cannot be inferred from MBTI/tritype labels alone. If the visitor supplies only a tritype with no wing or measured Enneagram scores, typing uses the core alone rather than inferring a wing from proxy data.

## Pokémon Relatives: real Pokémon comparisons

Once your build is generated, a bonus section loads the versioned [local Pokédex index](data/pokedex.json), created from the public [PokéAPI CSV database](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv). It includes **1,351 species entries and alternate forms** from the November 19, 2026 snapshot, including species identifiers, names, types, six base stats, and standard/hidden abilities. This remains static until the index is regenerated and committed.

- **Type twins** require exactly the same full type set, disregarding type order. Monotypes match other monotypes. If there are no exact matches, the UI explicitly labels overlapping-type **neighbors** instead.
- **Stat siblings** minimize a six-dimensional RMSE after scaling each real Pokémon's stat distribution to **600 BST**, plus a small penalty (`0.08 × absolute BST difference`) to distinguish overall strength differences. The distance is a comparison score, not a psychological similarity percentage.
- **Ability relatives** match the generated standard Ability and alternate Hidden Ability by canonical PokéAPI identifier, whether that real Pokémon lists the ability in a regular or hidden slot.

To update the index, run `npm run refresh:pokedex`, review the generated diff, and commit it. The refresh script fetches source CSVs only during manual regeneration; the website never calls PokéAPI for its comparisons.\n\nResults diversify by species rather than repeating multiple forms of the same Pokémon. The display uses remote [PokéAPI official-artwork images](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/other/official-artwork) with sprite fallbacks; it does not copy Pokémon art into this repository. Imagery and names remain the intellectual property of their respective rights holders. Failed Pokémon data/art requests must never stop the primary personality result from working.

## Train your Pokémon (after results)

Once a personality build is generated, a **Train your Pokémon** panel appears **beneath**, not inside, its personality card. It uses the original 600-point `baseStats` with fixed 31 IVs, level 100, a user-adjustable EV allocation, and the actual Pokémon stat formulas. Nature applies once **after** IV/EV calculation; `effectiveStats` (which already contains Nature adjustments for classification) is deliberately **not** used as the formula's input.

- The sliders accept 0–252 EVs per stat in useful four-point increments, up to **508 useful EVs**. Pokémon formally allow 510 EVs, but the remaining two cannot affect level-100 stats.
- A **Suggested training** button deterministically proposes a 252/252/4 spread from the preexisting role and Nature-adjusted stat shape. Walls, Supports and Controllers emphasize HP and the weaker defense; Sweepers emphasize their better attacking stat and Speed; Tanks emphasize HP/offense; Pivots emphasize Speed/HP. Controllers never receive Speed from the suggestion, preserving potential Trick Room use. A **Reset EVs** button clears the spread.
- Changes update the six level-100 stat numbers immediately. They never recalculate the 600 BST, Nature, typing, moves, abilities, held item, archetype, or Trainer Guide.
- **Copy share link** includes the EV spread, so it restores for another viewer; older share links without training data still work and start with suggested training. EV choices remain local unless intentionally shared.
- **Download Personality Card** preserves the original identity card, including its base-stat radar. **Download Trained Build** creates a separate PNG with the current Base / EVs / Level-100 six-stat table (31 IVs), while retaining identity, types, role, abilities, all four moves, item, and version provenance. The trained card is rebuilt from the live EV allocation when clicked, not from the original suggested values. The **Copy build** text remains an identity-only summary.

The feature is playful game training, not a new input to personality interpretation.

## Understanding the stats (on-site guide)

A static **Understanding your stats** section appears below the input/results workspace, before the footer. It is available without generating a build, with a short jump link from the results area. It defines HP (resilience), Attack (assertion), Defense (fortitude), Sp. Atk (ingenuity), Sp. Def (composure), and Speed (responsiveness).

The guide explains the fixed **600 BST** budget, the stat-specific Big Five / Enneagram / cognition affinity blends, Nature's ±10% changes, and high/low OCEAN abbreviations. This interpretation is **site-only**: nothing was added to the downloaded PNG. All descriptions are authored symbolic metaphors, not claims of measured ability or psychological validity.

## Elemental card artwork: 17 generated identities, 18 supported Pokémon types

The **visible results card and downloaded PNG** use one shared, browser-generated SVG motif system covering **all 18 official Pokémon types**. **Normal remains supported for official defensive matchups, real-Pokémon comparisons and existing artwork, but is not generated as a motivational typing**. Each element has a distinct visual identity: Normal (engraved geometry), Fire (flame tongues/embers), Water (rolling waves), Electric (lightning), Grass (vines/leaves), Ice (crystalline shards), Fighting (impact fractures), Poison (dripping toxins), Ground (layered earth), Flying (wind/feathers), Psychic (concentric rings/prisms), Bug (chitin/wing cells), Rock (stone slabs), Ghost (spectral wisps), Dragon (scales/claws), Dark (shadow tendrils), Steel (riveted beams), and Fairy (ribbons/starlight).

The **primary type enters from the top-left**, while the **secondary type enters from the bottom-right**. Monotypes use their motif in both corners. Layers fade toward the card content; live SVG gradients are namespaced per corner to prevent conflicts. The PNG exports through the existing SVG-to-Canvas renderer. **No pre-rendered pairings, server, or third-party artwork fetch is needed.**

All **six battle roles** now receive a faint, monochrome watermark behind the radar, shared by the live card and exported PNG: **Sweeper** (crossed blades), **Tank** (original fortress shield), **Wall** (battlements), **Pivot** (circular arrows), **Support** (radiant crest), and **Controller** (containment rings). A hybrid build uses the **primary role only**, avoiding overlapping symbols. Each watermark is deliberately subdued and never affects battle calculations.

[Review the six generated role emblems](previews/battle-role-emblems.svg). This gallery brightens the marks for visual inspection; the cards render them at much lower opacity.

Older visual-composition samples from the pair-mapping version: [Ice/Steel Tank](previews/ice-steel-tank.svg), [Grass/Flying Pivot](previews/grass-flying-card.svg), and [Water/Ghost Pivot](previews/water-ghost-card.svg). These demonstrate the SVG artwork renderer, **not** the 17-type algorithm's current outputs. In the browser PNG, the selected held-item sprite is drawn afterward; the static SVG samples use their fallback icons.

## Downloadable card and defensive matchups

**Card version provenance:** Every generated result card and its exported PNG prints the release on which that card was created (for example, **CREATED v1.2.0**) in a restrained bottom footer. The **Copy build** summary includes the same label. **Copy share link** records the origin release separately from the URL schema version. If that link is reopened after the site updates, its inputs are **recalculated using the current engine**; the footer then shows both **CREATED v1.2.0 · RECALCULATED v1.2.3**, so a changed outcome is not mistakenly attributed to the old version. Legacy links that predate this field say **CREATED VERSION UNRECORDED**, not a fabricated release. The card footer updates if the verified published patch arrives after an initial build, while previously shared source-version metadata remains immutable.

**Download Personality Card** produces a self-contained, branded PNG using a local SVG-to-Canvas export. It includes the Pokémon archetype, typing, Nature, battle role, **standard and Hidden Abilities, all four signature moves, the six-stat radar, plus a compact held-item illustration, name, and dry punchline**. The separate **Download Trained Build** shares the same presentation and item sprite but swaps the radar for six Base / EV / Level-100 stat rows, the Nature modifier, and the current EV budget. Both cards use the same creation/recalculation version footer. The item's detailed effect and personalized rationale remain on the results screen, not on the image. **The PNG shares only five high/low OCEAN indicators** (O, C, E, A, N) beneath the MBTI/tritype label, using **H for scores of at least 50 and L for scores below 50**. Exact Big Five values remain private to the local calculator. Cards require all five Big Five domains or all 30 facets; complete facet groups replace domain contributions. The Enneagram and 16Personalities questionnaire scores and full input payload are also excluded. The artwork is generated locally via SVG-to-Canvas with no screenshot service or additional library; the item icon is fetched from the public PokéAPI sprite repository, with a built-in fallback if unavailable.

### Held items: a little too much personality

The optional-feeling but deterministic **Held item** section is a humorous metaphor about coping strategies, not another psychological test or a battle modifier. It shows the item's real in-game effect, one dry caption, and a short **Why you got this** explanation tied to the individual's strongest input tendencies and battle role. The results screen shows the full explanation alongside an authentic held-item sprite. The PNG includes the item icon, name and dry line, but omits its effect and reasoning so the card remains compact.

The catalog contains **72 regular real held-item candidates, eight per family**, plus **Flame Orb and Toxic Orb reserved for eligible specialist packages**: control & certainty, protection & boundaries, endurance & recovery, ambition & performance, risk & improvisation, adaptability & escape, preparation & contingency, persistence & repetition, and support & relationships. No item is hard-coded to one MBTI or tritype, but item effects must be compatible with the generated Pokémon. The eligible pool therefore varies by typing and moves. Varying the Big Five scores can produce different items even within the same tritype; identical complete inputs always produce identical selections. Scores must come from all three user-entered assessment sections. No item is selected using a survey-score hash; near ties resolve by consistent item name ordering after genuine mechanical and personality fit scoring.

The **Type matchups** section evaluates incoming attacks against the generated one- or two-type Pokémon using the modern (Generation VI onward) 18-type effectiveness chart. It lists 4× weaknesses, 2× weaknesses, ½× resistances, ¼× resistances, and immunities. Unaffected attacks are omitted. These multipliers describe *typing only*; abilities, items, weather, and other battle effects can change damage in an actual Pokémon battle.

## Privacy and sharing

Every build is calculated locally in the browser. The 19 broad-score fields require individual confirmation; untouched sliders are not measured values, and typing 50 explicitly confirms a neutral score. The feedback link opens a public GitHub issue template without sending scores automatically.  Nothing is written to a database and nothing is automatically stored in local storage. The PNG download includes only binary high/low OCEAN indicators, not exact Big Five percentages, other raw questionnaire scores, or the full submitted input. The optional **Copy share link** action encodes the entered results in the URL **fragment** (the portion after `#`); fragment contents are not sent in ordinary HTTP requests. Anyone who receives that link **can read the personality scores encoded in it**. This is disclosed before copying. Use PNGs for public sharing if you do not want to disclose the raw numbers; cards still show identity labels and high/low indicators.

The page loads Google Fonts for typography, Pokémon artwork and held-item icons from the GitHub-hosted PokéAPI sprite collection. PNG export loads only the selected item sprite (without questionnaire data) before drawing it onto a local canvas; the fallback icon is used when a sprite cannot be fetched. These third-party requests can expose normal network metadata such as IP address, but **do not include questionnaire scores**. The optional Pokédex snapshot is loaded from the same static website.

## Publishing via GitHub Pages

**Browser module caching:** The release badge is verified independently against the published GitHub Pages commit. A previously cached JavaScript engine can therefore temporarily run older logic while the badge shows a newer release. When a PR changes scoring, update **both** the entry-script query in `index.html` and the scoring-engine import query in `src/app.mjs`; coordinate the scoring dependency cache keys. UI-only releases may independently bump the app and stylesheet cache key while retaining the unchanged engine key. After deployment, reload in a fresh private window to bypass any older cached module URLs.

GitHub Pages publishes the static site from `main` through GitHub's built-in branch-based publisher. The public app is at [Type Effectively](https://aetherayel.github.io/Type-Effectively/).

The repository's [GitHub Actions workflow](.github/workflows/pages.yml) runs `npm test` for pushes to `main` and pull requests. **It does not deploy Pages:** the built-in publisher already handles that. Do not enable a second deployment workflow without first changing the Pages publishing source in **Repository Settings → Pages**.

**Preview an open PR:** Branches do not automatically receive Pages URLs. For a temporary preview of the v2.0 scoring changes, use [the third-party RawGitHack development viewer for PR #33](https://raw.githack.com/Aetherayel/Type-Effectively/feature/personality-stat-recalibration/index.html). It serves the PR branch with correct web Content-Types; expect a few minutes of CDN cache delay after commits. It is not the official production origin or an independently deployed GitHub Pages preview. Check the PR's green GitHub Actions test before evaluating mechanics; do not treat its live-version marker as a published release number.

**Automatic live releases (v2.1.x):** PR **#39** establishes **v2.1.0** upon merge and successful publication. Each later merged PR increments **v2.1.x** by merged-PR history, not arbitrary pushes or commits. PR #33 retains its historical v2.0.0 baseline. PR #32 retains its historical **v1.4.0** baseline. Earlier v1.1.x, v1.2.x, and v1.3.x releases retain their historical tags. [The release workflow](.github/workflows/version-release.yml) waits until the **exact merge commit** is successfully published by GitHub Pages before creating its GitHub Release/tag. A failed publication does not count as a verified release.

The small **version marker in the site header** and footer matches the commit SHA produced by GitHub Pages in `deploy-revision.json` against **v1.1.x, v1.2.x, v1.3.x, v1.4.x, v2.0.x and v2.1.x** GitHub Releases. In local preview or when GitHub's API is unavailable, the page retains its bundled **v2.1.0** baseline marker. The lookup is non-blocking and sends no personality inputs. `package.json`, the HTML metadata, README, and changelog identify the **v2.1.0 feature baseline**; later published merges increment the live patch version without write-back version commits or a second deployment workflow.

## Project structure

```text
index.html                Frontend structure
styles.css                Responsive visual design
src/data.mjs              Pair map, templates, Natures, abilities, moves
src/engine.mjs            Pure, testable scoring + selection logic
src/app.mjs               Browser form, overrides, cards, sharing
src/matchups.mjs          Defensive type-chart calculations
src/held-items-data.mjs   72 curated real items and personality affinity profiles
src/held-items.mjs        Deterministic item selection and explanations
src/item-sprites.mjs       Verified held-item sprite URLs and safe export loading
src/export-card.mjs       Personality / trained SVG-to-PNG exports
src/ev-training.mjs       Pure EV validation, role suggestions and level-100 calculations
src/training-ui.mjs        Post-results EV sliders and live stat table
src/relatives.mjs         Pure type, stat, and ability matchers
src/relatives-ui.mjs      Bonus Pokémon cards and artwork fallbacks
data/pokedex.json         Static Pokémon and form index (1,351 records)\nscripts/refresh-pokedex.mjs  Rebuild the index from public PokéAPI CSVs
tests/engine.test.mjs     Full tritype coverage + randomized invariants
tests/held-items.test.mjs Held-item coverage, diversity, determinism and export
tests/features.test.mjs  Type matchups and PNG export regression tests
tests/relatives.test.mjs Real Pokémon index + comparison tests
.github/workflows/        Test workflow and live-release version tagging
```

## Important caveats

**This is a game-inspired personality illustration, not a psychological assessment or an official Pokémon team builder.** The Big Five measures continuous traits, but the conversion into HP, Attack, and other game stats is an authored metaphor, not a scientifically established relationship. 16Personalities is not a validated test of Jungian cognitive functions; Enneagram typing is also interpretive. A person's Nature or damage output does not measure intelligence, virtue, or worth.

The move and ability combinations are conceptual; they are **not guaranteed to be legal for any existing species**. No official Pokémon graphics, sprites, or audio are included.

Unofficial fan project, not affiliated with or endorsed by Nintendo, Game Freak, Creatures, or The Pokémon Company.

---

*Because apparently having a personality wasn't complicated enough.*

### 600-BST power budget

The signature creature receives a universal 600 base points. The 535-to-600 transition scales both the center and deviations by 600/535 (subject to integer bounds/rounding). Nature and personality inputs are unchanged. Role geometry, ability/move thresholds and strategy gates retain their original 535-reference calibration; the latter use rounded `effectiveStats × 535/600`. Actual base and effective stats are displayed and used for EV training. See [the paired normalization audit](docs/bst-600-audit.md). Historical audit documents retain their original 535-BST numbers.
