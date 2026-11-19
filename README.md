# Type Effectively

> **Know yourself. Know your weaknesses. Blame type matchups.**

Ever wondered what kind of Pokémon your personality would make you?

No? Well, we made the calculator anyway.

**Type Effectively** turns 16Personalities, Enneagram, and Big Five results into a personalized Pokémon-style build: elemental typing, Nature, a **535 base stat total**, battle role, standard and Hidden Ability, and four signature moves.

No sign-in. No backend. No personality data submitted to a server. Just an unreasonable amount of information about your imaginary battle potential.

## Try it locally

Requires a modern browser. No dependencies or build tools.

```bash
python3 -m http.server 4173
# Open http://localhost:4173
```

For automated checks (Node.js 20+):

```bash
npm test
```

The app is plain HTML, CSS, and browser-native JavaScript modules, so it works on static hosts such as GitHub Pages.

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

The six possible tactical roles are Sweeper, Wall, Tank, Pivot, Support, and Controller. Specialization (versatile / focused / highly specialized) is inferred from stat dispersion rather than assigned from a personality label.

### Examples

| Profile | Typing | Nature | Hidden pairing |
| --- | --- | --- | --- |
| INTJ-A · 593 | Ice / Steel | Quiet | Normal |
| ESFP-T · 714 | Electric / Ghost | Jolly | Ice |
| Any type · 351 | Steel (mono) | Depends on type | Psychic |

Use the two example buttons to populate and experiment with complete test-score profiles.

## Privacy and sharing

Every build is calculated locally in the browser. Nothing is written to a database and nothing is automatically stored in local storage. The optional **Copy share link** action encodes the entered results in the URL **fragment** (the portion after `#`); fragment contents are not sent in ordinary HTTP requests. Anyone who receives that link **can read the personality scores encoded in it**. Don't share a link you want to keep private.

The page loads Google Fonts for typography; that makes a separate font request, but does not transmit questionnaire scores.

## Publishing via GitHub Pages

The included [Pages workflow](.github/workflows/pages.yml) publishes the static site when changes land on `main`.

In **Repository Settings → Pages**, choose **GitHub Actions** as the build/deployment source. The first successful run provides the public site URL. The repository being public is not itself proof that Pages is configured or deployed.

## Project structure

```text
index.html                Frontend structure
styles.css                Responsive visual design
src/data.mjs              Pair map, templates, Natures, abilities, moves
src/engine.mjs            Pure, testable scoring + selection logic
src/app.mjs               Browser form, overrides, cards, sharing
tests/engine.test.mjs     Full tritype coverage + randomized invariants
.github/workflows/        Static Pages deployment
```

## Important caveats

**This is a game-inspired personality illustration, not a psychological assessment or an official Pokémon team builder.** The Big Five measures continuous traits, but the conversion into HP, Attack, and other game stats is an authored metaphor, not a scientifically established relationship. 16Personalities is not a validated test of Jungian cognitive functions; Enneagram typing is also interpretive. A person's Nature or damage output does not measure intelligence, virtue, or worth.

The move and ability combinations are conceptual; they are **not guaranteed to be legal for any existing species**. No official Pokémon graphics, sprites, or audio are included.

Unofficial fan project, not affiliated with or endorsed by Nintendo, Game Freak, Creatures, or The Pokémon Company.

---

*Because apparently having a personality wasn't complicated enough.*
