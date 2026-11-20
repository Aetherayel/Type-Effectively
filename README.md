# Type Effectively

**Version 1.0.0 — First complete personality Pokémon generator**

> **Know yourself. Know your weaknesses. Blame type matchups.**

Ever wondered what kind of Pokémon your personality would make you?

No? Well, we made the calculator anyway.

**Type Effectively** turns 16Personalities, Enneagram, and Big Five results into a personalized Pokémon-style build: elemental typing, Nature, a **535 base stat total**, battle role, standard and Hidden Ability, a personality-driven held item, and four signature moves. A bonus **Pokémon Relatives** section compares your build against real Pokémon for exact typings, closest six-stat distributions, and matching Abilities.

No sign-in. No backend. No personality data submitted to a server. Just an unreasonable amount of information about your imaginary battle potential. The app downloads a compact Pokédex snapshot locally; artwork is loaded directly from the PokéAPI sprite repository.

[**Try Type Effectively in your browser**](https://aetherayel.github.io/Type-Effectively/)

## Three tests, one build

| Layer | Recommended free assessment | What the app uses |
| --- | --- | --- |
| Personality | [16Personalities](https://www.16personalities.com/free-personality-test) | The five bipolar trait percentages; inferred or overridden four-letter type determines Nature |
| Motivation | [Find My Nine](https://findmynine.com/test) | All nine Enneagram scores; derives the core, wing, and ordered tritype |
| Temperament | [Ocean Test](https://oceantest.net/test) | Five Big Five scores; the main base-stat influence |

These are independent external websites. **No test integration, scraping, affiliation, or automatic import is implied.** Users enter the result numbers manually.

Don't have the full results? You can select an MBTI-style type, enter an ordered Enneagram ranking, or supply a tritype. The result clearly labels estimated inputs. If Big Five is missing, neutral 50-point placeholders are used and disclosed.

### Explore random combinations

The **Randomize ↻** button beside the results heading instantly creates a **synthetic sample build** using the ordinary calculator: five generated bipolar 16Personalities scores, nine Enneagram scores with a valid ordered tritype, and five Big Five scores. The editable input controls update to match the sample, so visitors can inspect exactly how it was produced. Clicking again creates a fresh combination without requiring any manual form entry.

The result clearly reads **RANDOM SAMPLE · SYNTHETIC SCORES**, not a personal assessment. A manual Generate action returns to normal results; Reset clears the sample. Share links preserve the sample label, and randomizing clears any old share-link hash. All work remains local in the browser.

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

## Generation model (v1.0)

Deterministic. The same inputs always produce the same result. The output is explainable.

1. **Elemental typing:** Score each of the 17 elements against all nine Enneagram motivations using `TYPE_AFFINITY`. **Primary:** core 88% + wing 12% (or core 100% if wing is unknown). **Secondary:** second fix 65% + third fix 30% + core 5%. **Hidden affinity:** third fix 60% + second fix 30% + wing 10% (or 70% third / 30% second if wing is unknown); exclude both visible types. All three selections are deterministic. Monotypes arise only when primary and secondary independently coincide.
2. **Nature:** Map the four-letter personality type onto one of 16 existing Pokémon Natures.
3. **Base affinities:** Blend **70% Big Five**, **20% nine-type Enneagram distribution**, and **10% 16Personalities dimension percentages**.
4. **Base stats:** Center the six affinities around 535/6, multiply deviations by 1.1, constrain each stat to 45–140, and redistribute/round to preserve **exactly 535 BST**.
5. **Nature modifiers:** Apply +10% to one and −10% to another non-HP stat *after* the base stat calculation. These do not change the underlying BST.
6. **Battle role:** Match the effective stat distribution against six reference profiles. Role suitability is **80% stat similarity** (an RMSE-to-score conversion) plus **20% type toolkit affinity**. Near-ties are shown as hybrid roles.
7. **Abilities and moves:** Rank standard Ability candidates by role, visible typing, stat synergy, and second fix. Select a **different Hidden Ability** from the same curated pool, **strictly requiring affinity with at least one visible Pokémon type**, then score it against battle role, stats, second fix, and third fix. The hidden *elemental* affinity remains separate and can provide monotype coverage, but never dictates an off-type Hidden Ability. Four moves comprise primary STAB, secondary STAB/coverage, a **type- and fix-sensitive role tactic** chosen from six candidates per role/offensive style, and a **core growth move** chosen from five thematic candidates using visible types and supporting fixes. All four move names are distinct.
8. **Held item:** Rank **72 real Pokémon held items** across **nine behavioral families** using Enneagram core/fixes, the Big Five profile, and battle role. Use a small deterministic full-input tie-breaker to diversify close fits, and explain the choice using actual input patterns. Items are thematic and **do not modify the calculated stats, moves, or matchups**.

The standard and Hidden Abilities are **alternative strengths**, not concurrently active. A Fire/Fighting build cannot be assigned Sand Force solely because it has a Ground hidden elemental affinity; a Water/Ice build cannot inherit Solid Rock by the same mechanism. This changes mechanical selection without altering the v1.0 seventeen-type typing or 535-BST model.

The six possible tactical roles are Sweeper, Wall, Tank, Pivot, Support, and Controller. Specialization (versatile / focused / highly specialized) is inferred from stat dispersion rather than assigned from a personality label.

### Examples

| Profile | Typing | Nature | Hidden affinity |
| --- | --- | --- | --- |
| INTJ-A · 593 (5w6) | Ice / Water | Quiet | Fighting |
| ESFP · 714 (7w8) | Electric / Steel | Jolly | Psychic |
| INTJ · 514 (5w4) | Psychic / Steel | Quiet | Ghost |

These are examples of actual supported profiles. If the visitor supplies only a tritype with no wing or measured Enneagram scores, typing uses the core alone rather than inferring a wing from proxy data.

## Pokémon Relatives: real Pokémon comparisons

Once your build is generated, a bonus section loads the versioned [local Pokédex index](data/pokedex.json), created from the public [PokéAPI CSV database](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv). It includes **1,351 species entries and alternate forms** from the November 19, 2026 snapshot, including species identifiers, names, types, six base stats, and standard/hidden abilities. This remains static until the index is regenerated and committed.

- **Type twins** require exactly the same full type set, disregarding type order. Monotypes match other monotypes. If there are no exact matches, the UI explicitly labels overlapping-type **neighbors** instead.
- **Stat siblings** minimize a six-dimensional RMSE after scaling each real Pokémon's stat distribution to **535 BST**, plus a small penalty (`0.08 × absolute BST difference`) to distinguish overall strength differences. The distance is a comparison score, not a psychological similarity percentage.
- **Ability relatives** match the generated standard Ability and alternate Hidden Ability by canonical PokéAPI identifier, whether that real Pokémon lists the ability in a regular or hidden slot.

To update the index, run `npm run refresh:pokedex`, review the generated diff, and commit it. The refresh script fetches source CSVs only during manual regeneration; the website never calls PokéAPI for its comparisons.\n\nResults diversify by species rather than repeating multiple forms of the same Pokémon. The display uses remote [PokéAPI official-artwork images](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/other/official-artwork) with sprite fallbacks; it does not copy Pokémon art into this repository. Imagery and names remain the intellectual property of their respective rights holders. Failed Pokémon data/art requests must never stop the primary personality result from working.

## Understanding the stats (on-site guide)

A static **Understanding your stats** section appears below the input/results workspace, before the footer. It is available without generating a build, with a short jump link from the results area. It defines HP (resilience), Attack (assertiveness), Defense (discipline), Sp. Atk (creative analysis), Sp. Def (composure/cooperation), and Speed (energy/responsiveness).

The guide explains the fixed **535 BST** budget, the **70/20/10 Big Five / Enneagram / 16Personalities** affinity blend, Nature's ±10% changes, and high/low OCEAN abbreviations. This interpretation is **site-only**: nothing was added to the downloaded PNG. All descriptions are authored symbolic metaphors, not claims of measured ability or psychological validity.

## Elemental card artwork: 17 generated identities, 18 supported Pokémon types

The **visible results card and downloaded PNG** use one shared, browser-generated SVG motif system covering **all 18 official Pokémon types**. **Normal remains supported for official defensive matchups, real-Pokémon comparisons and existing artwork, but is not generated as a motivational typing**. Each element has a distinct visual identity: Normal (engraved geometry), Fire (flame tongues/embers), Water (rolling waves), Electric (lightning), Grass (vines/leaves), Ice (crystalline shards), Fighting (impact fractures), Poison (dripping toxins), Ground (layered earth), Flying (wind/feathers), Psychic (concentric rings/prisms), Bug (chitin/wing cells), Rock (stone slabs), Ghost (spectral wisps), Dragon (scales/claws), Dark (shadow tendrils), Steel (riveted beams), and Fairy (ribbons/starlight).

The **primary type enters from the top-left**, while the **secondary type enters from the bottom-right**. Monotypes use their motif in both corners. Layers fade toward the card content; live SVG gradients are namespaced per corner to prevent conflicts. The PNG exports through the existing SVG-to-Canvas renderer. **No pre-rendered pairings, server, or third-party artwork fetch is needed.**

All **six battle roles** now receive a faint, monochrome watermark behind the radar, shared by the live card and exported PNG: **Sweeper** (crossed blades), **Tank** (original fortress shield), **Wall** (battlements), **Pivot** (circular arrows), **Support** (radiant crest), and **Controller** (containment rings). A hybrid build uses the **primary role only**, avoiding overlapping symbols. Each watermark is deliberately subdued and never affects battle calculations.

[Review the six generated role emblems](previews/battle-role-emblems.svg). This gallery brightens the marks for visual inspection; the cards render them at much lower opacity.

Older visual-composition samples from the pair-mapping version: [Ice/Steel Tank](previews/ice-steel-tank.svg), [Grass/Flying Pivot](previews/grass-flying-card.svg), and [Water/Ghost Pivot](previews/water-ghost-card.svg). These demonstrate the SVG artwork renderer, **not** the 17-type algorithm's current outputs. In the browser PNG, the selected held-item sprite is drawn afterward; the static SVG samples use their fallback icons.

## Downloadable card and defensive matchups

**Download card** produces a self-contained, branded PNG using a local SVG-to-Canvas export. It includes the Pokémon archetype, typing, Nature, battle role, **standard and Hidden Abilities, all four signature moves, the six-stat radar, plus a compact held-item illustration, name, and dry punchline**. The item's detailed effect and personalized rationale remain on the results screen, not on the image. **The PNG shares only five high/low OCEAN indicators** (O, C, E, A, N) beneath the MBTI/tritype label, using **H for scores of at least 50 and L for scores below 50**. Exact Big Five values remain private to the local calculator. Without entered Big Five results, the card reads **OCEAN · Estimated**. The Enneagram and 16Personalities questionnaire scores and full input payload are also excluded. The artwork is generated locally via SVG-to-Canvas with no screenshot service or additional library; the item icon is fetched from the public PokéAPI sprite repository, with a built-in fallback if unavailable.

### Held items: a little too much personality

The optional-feeling but deterministic **Held item** section is a humorous metaphor about coping strategies, not another psychological test or a battle modifier. It shows the item's real in-game effect, one dry caption, and a short **Why you got this** explanation tied to the individual's strongest input tendencies and battle role. The results screen shows the full explanation alongside an authentic held-item sprite. The PNG includes the item icon, name and dry line, but omits its effect and reasoning so the card remains compact.

The catalog contains **72 different real held items, eight per family**: control & certainty, protection & boundaries, endurance & recovery, ambition & performance, risk & improvisation, adaptability & escape, preparation & contingency, persistence & repetition, and support & relationships. No item is restricted to one MBTI or tritype. Varying the Big Five scores can produce different items even within the same tritype; identical complete inputs always produce identical selections. When Big Five was not entered, the explanation never pretends that neutral placeholder values were measured traits.

The **Type matchups** section evaluates incoming attacks against the generated one- or two-type Pokémon using the modern (Generation VI onward) 18-type effectiveness chart. It lists 4× weaknesses, 2× weaknesses, ½× resistances, ¼× resistances, and immunities. Unaffected attacks are omitted. These multipliers describe *typing only*; abilities, items, weather, and other battle effects can change damage in an actual Pokémon battle.

## Privacy and sharing

Every build is calculated locally in the browser. Nothing is written to a database and nothing is automatically stored in local storage. The PNG download includes only binary high/low OCEAN indicators, not exact Big Five percentages, other raw questionnaire scores, or the full submitted input. The optional **Copy share link** action encodes the entered results in the URL **fragment** (the portion after `#`); fragment contents are not sent in ordinary HTTP requests. Anyone who receives that link **can read the personality scores encoded in it**. Don't share a link you want to keep private.

The page loads Google Fonts for typography, Pokémon artwork and held-item icons from the GitHub-hosted PokéAPI sprite collection. PNG export loads only the selected item sprite (without questionnaire data) before drawing it onto a local canvas; the fallback icon is used when a sprite cannot be fetched. These third-party requests can expose normal network metadata such as IP address, but **do not include questionnaire scores**. The optional Pokédex snapshot is loaded from the same static website.

## Publishing via GitHub Pages

GitHub Pages publishes the static site from `main` through GitHub's built-in branch-based publisher. The public app is at [Type Effectively](https://aetherayel.github.io/Type-Effectively/).

The repository's [GitHub Actions workflow](.github/workflows/pages.yml) runs `npm test` for pushes to `main` and pull requests. **It does not deploy Pages:** the built-in publisher already handles that. Do not enable a second deployment workflow without first changing the Pages publishing source in **Repository Settings → Pages**.

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
src/export-card.mjs       Local SVG-to-PNG result card export
src/relatives.mjs         Pure type, stat, and ability matchers
src/relatives-ui.mjs      Bonus Pokémon cards and artwork fallbacks
data/pokedex.json         Static Pokémon and form index (1,351 records)\nscripts/refresh-pokedex.mjs  Rebuild the index from public PokéAPI CSVs
tests/engine.test.mjs     Full tritype coverage + randomized invariants
tests/held-items.test.mjs Held-item coverage, diversity, determinism and export
tests/features.test.mjs  Type matchups and PNG export regression tests
tests/relatives.test.mjs Real Pokémon index + comparison tests
.github/workflows/        Static Pages deployment
```

## Important caveats

**This is a game-inspired personality illustration, not a psychological assessment or an official Pokémon team builder.** The Big Five measures continuous traits, but the conversion into HP, Attack, and other game stats is an authored metaphor, not a scientifically established relationship. 16Personalities is not a validated test of Jungian cognitive functions; Enneagram typing is also interpretive. A person's Nature or damage output does not measure intelligence, virtue, or worth.

The move and ability combinations are conceptual; they are **not guaranteed to be legal for any existing species**. No official Pokémon graphics, sprites, or audio are included.

Unofficial fan project, not affiliated with or endorsed by Nintendo, Game Freak, Creatures, or The Pokémon Company.

---

*Because apparently having a personality wasn't complicated enough.*
