# Type Effectively

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

### Manual overrides

The inferred four-letter type, ordered tritype, and wing can be overridden. Overrides affect **identity and type selection**, while entered score distributions remain intact for stats. This preserves the distinction between your interpretation of the tests and the raw measurements.

A tritype must have exactly one number from each center:

- Gut: 8, 9, 1
- Heart: 2, 3, 4
- Head: 5, 6, 7

There are 27 distinct center combinations and **162 ordered tritypes**. Pairings are symmetric (5+9 equals 9+5), but the core and fix ordering changes typing order and thematic choices. Two pairings can map to the same elemental type; those builds become valid **monotypes** rather than invalid duplicate typings.

## Generation model (v0.1)

Deterministic. The same inputs always produce the same result. The output is explainable.

1. **Elemental typing:** Lookup core + second fix and core + third fix in the 36-pair matrix. The fix-to-fix pair determines the Hidden Ability's thematic type.
2. **Nature:** Map the four-letter personality type onto one of 16 existing Pokémon Natures.
3. **Base affinities:** Blend **70% Big Five**, **20% nine-type Enneagram distribution**, and **10% 16Personalities dimension percentages**.
4. **Base stats:** Center the six affinities around 535/6, multiply deviations by 1.1, constrain each stat to 45–140, and redistribute/round to preserve **exactly 535 BST**.
5. **Nature modifiers:** Apply +10% to one and −10% to another non-HP stat *after* the base stat calculation. These do not change the underlying BST.
6. **Battle role:** Match the effective stat distribution against six reference profiles. Role suitability is **80% stat similarity** (an RMSE-to-score conversion) plus **20% type toolkit affinity**. Near-ties are shown as hybrid roles.
7. **Abilities and moves:** Rank standard Ability candidates by role, typing, stat synergy, and second fix. Choose a separate Hidden Ability from the hidden pairing, and four moves: primary STAB, secondary STAB/coverage, role tactic, and a growth-themed move.
8. **Held item:** Rank **72 real Pokémon held items** across **nine behavioral families** using Enneagram core/fixes, the Big Five profile, and battle role. Use a small deterministic full-input tie-breaker to diversify close fits, and explain the choice using actual input patterns. Items are thematic and **do not modify the calculated stats, moves, or matchups**.

The six possible tactical roles are Sweeper, Wall, Tank, Pivot, Support, and Controller. Specialization (versatile / focused / highly specialized) is inferred from stat dispersion rather than assigned from a personality label.

### Examples

| Profile | Typing | Nature | Hidden pairing |
| --- | --- | --- | --- |
| INTJ-A · 593 | Ice / Steel | Quiet | Normal |
| ESFP-T · 714 | Electric / Ghost | Jolly | Ice |
| Any type · 351 | Steel (mono) | Depends on type | Psychic |

## Pokémon Relatives: real Pokémon comparisons

Once your build is generated, a bonus section loads the versioned [local Pokédex index](data/pokedex.json), created from the public [PokéAPI CSV database](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv). It includes **1,351 species entries and alternate forms** from the November 19, 2026 snapshot, including species identifiers, names, types, six base stats, and standard/hidden abilities. This remains static until the index is regenerated and committed.

- **Type twins** require exactly the same full type set, disregarding type order. Monotypes match other monotypes. If there are no exact matches, the UI explicitly labels overlapping-type **neighbors** instead.
- **Stat siblings** minimize a six-dimensional RMSE after scaling each real Pokémon's stat distribution to **535 BST**, plus a small penalty (`0.08 × absolute BST difference`) to distinguish overall strength differences. The distance is a comparison score, not a psychological similarity percentage.
- **Ability relatives** match the generated standard Ability and alternate Hidden Ability by canonical PokéAPI identifier, whether that real Pokémon lists the ability in a regular or hidden slot.

To update the index, run `npm run refresh:pokedex`, review the generated diff, and commit it. The refresh script fetches source CSVs only during manual regeneration; the website never calls PokéAPI for its comparisons.\n\nResults diversify by species rather than repeating multiple forms of the same Pokémon. The display uses remote [PokéAPI official-artwork images](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/other/official-artwork) with sprite fallbacks; it does not copy Pokémon art into this repository. Imagery and names remain the intellectual property of their respective rights holders. Failed Pokémon data/art requests must never stop the primary personality result from working.

## Downloadable card and defensive matchups

**Download card** produces a self-contained, branded PNG using a local SVG-to-Canvas export. It includes the Pokémon archetype, typing, Nature, battle role, standard Ability, six-stat radar, **held item, its real in-game effect, a dry punchline, and a brief personality rationale**, but **not the original questionnaire percentages or full input data**. No screenshot service, external image request, or new library is needed to export it.

### Held items: a little too much personality

The optional-feeling but deterministic **Held item** section is a humorous metaphor about coping strategies, not another psychological test or a battle modifier. It shows the item's real in-game effect, one dry caption, and a short **Why you got this** explanation tied to the individual's strongest input tendencies and battle role. It appears on both the results screen and the downloadable PNG.

The catalog contains **72 different real held items, eight per family**: control & certainty, protection & boundaries, endurance & recovery, ambition & performance, risk & improvisation, adaptability & escape, preparation & contingency, persistence & repetition, and support & relationships. No item is restricted to one MBTI or tritype. Varying the Big Five scores can produce different items even within the same tritype; identical complete inputs always produce identical selections. When Big Five was not entered, the explanation never pretends that neutral placeholder values were measured traits.

The **Type matchups** section evaluates incoming attacks against the generated one- or two-type Pokémon using the modern (Generation VI onward) 18-type effectiveness chart. It lists 4× weaknesses, 2× weaknesses, ½× resistances, ¼× resistances, and immunities. Unaffected attacks are omitted. These multipliers describe *typing only*; abilities, items, weather, and other battle effects can change damage in an actual Pokémon battle.

## Privacy and sharing

Every build is calculated locally in the browser. Nothing is written to a database and nothing is automatically stored in local storage. The PNG download exports a result summary without the original questionnaire scores. The optional **Copy share link** action encodes the entered results in the URL **fragment** (the portion after `#`); fragment contents are not sent in ordinary HTTP requests. Anyone who receives that link **can read the personality scores encoded in it**. Don't share a link you want to keep private.

The page loads Google Fonts for typography and Pokémon artwork from the GitHub-hosted PokéAPI sprite collection. These third-party requests can expose normal network metadata such as IP address, but **do not include questionnaire scores**. The optional Pokédex snapshot is loaded from the same static website.

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
