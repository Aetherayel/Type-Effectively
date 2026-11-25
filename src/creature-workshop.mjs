import { STAT_KEYS, STAT_NAMES, ROLE_DESCRIPTIONS } from './data.mjs';
import { NATURE_DIMENSIONS } from './nature.mjs';
import { getDefensiveMatchups } from './matchups.mjs';
import { cardVersionFooter } from './build-version.mjs';

const clean = value => typeof value === 'string' ? value.trim() : '';
const describe = (label, value) => clean(value) ? label + ': ' + clean(value) : null;
const statLabel = key => STAT_NAMES[STAT_KEYS.indexOf(key)];

// Only derived, visible build information; never serialize questionnaire inputs.
export function buildCreaturePrompt(build, preferences = {}) {
  const roles = [build.role.primary.name, build.role.secondary?.name].filter(Boolean);
  const r = build.report;
  const matchups = getDefensiveMatchups(build.types);
  const weaknesses = [...matchups.quadWeak, ...matchups.weak].map(x => x.type + ' (' + x.multiplier + '×)');
  const bst = STAT_KEYS.reduce((sum, key) => sum + build.baseStats[key], 0);
  return [
    'Create an original signature Pokémon-inspired creature from this Type Effectively build. Interpret the entire build as a cohesive fictional species, not a human portrait or a modification of an existing Pokémon.',
    '', 'BUILD IDENTITY',
    build.isSample ? 'Provenance: random sample / synthetic scores, not a personal assessment.' : null,
    'Archetype: ' + build.title + ' — ' + build.archetype.signature,
    'Personality labels: ' + build.identity + '; Enneagram ' + build.tritype + (build.typingWing == null ? '' : ' (' + build.core + 'w' + build.typingWing + ')'),
    'Visible typing: ' + build.types.join(' / '),
    'Hidden elemental affinity: ' + build.hiddenType + ' (supporting inspiration only; not an extra visible type).',
    'Nature: ' + build.nature + ' (+10% ' + statLabel(build.natureBoost) + ', −10% ' + statLabel(build.natureDrop) + '). Prefers ' + NATURE_DIMENSIONS[build.natureBoost] + ' over ' + NATURE_DIMENSIONS[build.natureDrop] + '.',
    'Battle role: ' + roles.join(' / ') + ' — ' + roles.map(name => ROLE_DESCRIPTIONS[name]).join(' / '),
    'Stat specialization: ' + build.role.specialization,
    'Base stats (' + bst + ' BST, before Nature): ' + STAT_KEYS.map((key, i) => STAT_NAMES[i] + ' ' + build.baseStats[key]).join(' / '),
    'Type-only weaknesses: ' + (weaknesses.join(', ') || 'none') + '. Do not invent immunities to erase them.',
    '', 'SIGNATURE MECHANICS',
    'Standard Ability: ' + build.ability.name + ' — ' + build.ability.desc,
    'Hidden Ability: ' + build.hiddenAbility + ' (alternative, not active simultaneously).',
    'Held item: ' + build.heldItem.name + ' — ' + build.heldItem.effect,
    describe('Item symbolism', build.heldItem.why),
    ...build.moves.map((move, i) => 'Move ' + (i + 1) + ': ' + move.name + ' [' + move.category + '] — ' + move.why),
    ...(build.signatureStrategy ? ['Signature strategy: ' + build.signatureStrategy.name,
      describe('Strategy mechanism', build.signatureStrategy.mechanism), describe('Strategy insight', build.signatureStrategy.insight)] : []),
    '', 'PERSONALITY & BEHAVIOR (playful interpretation, not a diagnosis)',
    ...[['Pokédex observation', r.dexEntry], ['Field observation', r.opener], ['Motivation', r.motives], ['Thinking', r.thinking], ['Temperament', r.temperament], ['Combat behavior', r.combat], ['Limitations', r.tradeoff], ['Quirks', r.twist], ['Teamwork', r.team], ['Growth', r.growth]].map(([label, value]) => describe(label, value)),
    '', 'CREATIVE DIRECTION',
    describe('Creature or animal inspiration', preferences.creature),
    describe('Natural materials, habitat or phenomena', preferences.environment),
    describe('Conceptual or symbolic inspiration', preferences.symbolism),
    'Art style: ' + (clean(preferences.style) || 'Clean Pokémon-inspired full-body creature artwork'),
    describe('Additional direction', preferences.details),
    'Where no preference is supplied, choose original inspirations that fit the entire build. Treat preferences as creative guidance without silently changing the supplied game mechanics.',
    '', 'DESIGN REQUIREMENTS',
    '- Start with a distinctive, readable silhouette and coherent anatomy. Integrate the visible typing into the creature’s biology rather than attaching unrelated decorations.',
    '- Use the relative base-stat distribution and battle role to establish proportions, movement, power and limitations. HP suggests endurance; Attack physical assertion; Defense protection; Special Attack ingenuity and elemental expression; Special Defense composure and resistance; Speed responsiveness and mobility. Do not equate a lower stat with a defect.',
    '- Make the Nature and field observations visible through demeanor and behavior. Find one memorable feature that expresses the most important ability or strategy; not every move needs its own physical feature.',
    '- Design a fully developed creature appropriate to its 600 BST. It can be impressive without resembling a Legendary Pokémon. Avoid excessive ornaments, armor strapped on without purpose, or a generic humanoid warrior.',
    '- Keep the visible typing, Nature, base stats, abilities, held item and four moves intact. The held item can inspire symbolism without becoming permanent anatomy. Keep weaknesses and growth opportunities meaningful.',
    '', 'DELIVERABLE',
    'Complete the following in sequence: build data → finalized species specification → illustration.',
    '1. Species identity: Provide a memorable species name, its etymology, classification, and a concise Pokédex entry.',
    '2. Design specification: Establish the creature’s biological inspirations, anatomy (including the number and placement of limbs and distinctive appendages), silhouette, proportions, coloration, signature biological feature, and demeanor. Explain how these reflect the supplied build. Finalize this exact species before generating any illustration.',
    'Before invoking image generation, present the complete written species identity and finalized design specification visibly to the user as ordinary response text. Do not fulfill the written deliverables solely within image-generation instructions or an image. The illustration supplements the written profile; it does not replace it.',
    '3. Illustration: Generate a standalone, full-body illustration of the exact species established above. Use the finalized species specification as the primary visual source of truth, rather than independently reinterpreting the original build. When handing off to an image generator, explicitly include the finalized visual description and the chosen art style.',
    'Preserve the established species identity, anatomy, silhouette, proportions, coloration and distinguishing features. Do not substitute a different species, rename it, or introduce conflicting anatomical features.',
    'Show one complete creature in a natural pose against a simple neutral background, with readable anatomy and a distinctive silhouette. Follow the Art style specified in CREATIVE DIRECTION.',
    'Keep the illustration separate from the written species profile. Do not include text, statistics, typography, labels, type badges, borders, infographic panels, Pokédex cards, stat sheets, character reference sheets, additional poses, or unrelated scenery.',
    'If image generation is unavailable, provide a self-contained illustration prompt derived from the finalized species specification instead. If the platform cannot present the written profile before invoking its image tool in the same response, present the complete written profile and that illustration prompt first; do not silently omit the written deliverables.' ,
    '', 'Source: Type Effectively — ' + cardVersionFooter(build) + '. Unofficial fan-inspired creative exercise.'
  ].filter(line => line !== null).join('\n');
}

export function renderCreatureWorkshop(build, container, { onCopy = () => {} } = {}) {
  container.insertAdjacentHTML('beforeend', `
    <section class="creature-workshop ev-trainer" id="creature-workshop" aria-labelledby="creature-workshop-title">
      <div class="ev-head"><div><span class="mini-label">POST-BUILD · CREATURE DESIGN</span>
        <h4 id="creature-workshop-title">Create your signature Pokémon<span class="terminal-dot">.</span></h4></div></div>
      <p class="ev-intro">Your personality has a moveset. Now give it a body. Add a few inspirations or leave everything blank and let your build do the talking.</p>
      <details class="creature-guide"><summary>Quick creature design guide</summary>
        <p>Start with your archetype and role: what does this creature do? Pick an animal, object or phenomenon that fits its purpose. Let the typing shape its biology, the stats shape its proportions and the Nature shape its demeanor.</p>
        <p>Choose one memorable feature inspired by an ability or move. Preserve its weaknesses and quirks. A 600 BST creature can look formidable without looking legendary.</p>
        <p>Try combining an animal, a natural element and a concept: a musk ox + glacial metal + winter guardian. Later, explore sprites, shiny colors, evolutions and signature move animations.</p>
      </details>
      <div class="creature-fields">
        <div class="field"><label for="creature-inspiration">Creature inspiration (optional)</label><input id="creature-inspiration" type="text" maxlength="300" placeholder="Musk ox, owl, lantern, mythical creature…"></div>
        <div class="field"><label for="creature-environment">Nature &amp; materials (optional)</label><input id="creature-environment" type="text" maxlength="300" placeholder="Glacial metal, autumn forest, storm clouds…"></div>
        <div class="field"><label for="creature-symbolism">Concept &amp; symbolism (optional)</label><input id="creature-symbolism" type="text" maxlength="300" placeholder="Guardian, wanderer, ancient observatory…"></div>
        <div class="field"><label for="creature-style">Art style</label><select id="creature-style"><option value="">Pokémon-inspired creature artwork</option><option>Classic pixel-art battle sprite</option><option>Detailed fantasy creature concept art</option><option>Cozy stylized creature illustration</option><option>Original creature field-guide illustration</option></select></div>
        <div class="field"><label for="creature-details">Make it yours (optional)</label><textarea id="creature-details" rows="3" maxlength="2000" placeholder="Colors, anatomy, personality, details to include or avoid…"></textarea></div>
      </div>
      <details class="creature-guide creature-preview"><summary>Preview complete prompt</summary><label class="mini-label" for="creature-prompt">GENERATED PROMPT</label><textarea id="creature-prompt" rows="12" readonly></textarea></details>
      <button type="button" id="copy-creature-prompt" class="primary-button" aria-describedby="creature-privacy">Copy creature prompt ↗</button>
      <p class="ev-caveat" id="creature-privacy">Paste into your preferred AI assistant or image generator, or use as an artist's brief. No card attachment needed. The prompt includes derived personality labels, build and field observations, not raw questionnaire scores. Nothing is sent automatically; review before sharing with another service.</p>
    </section>`);
  const panel = container.querySelector('#creature-workshop');
  const fields = { creature: '#creature-inspiration', environment: '#creature-environment', symbolism: '#creature-symbolism', style: '#creature-style', details: '#creature-details' };
  const preview = panel.querySelector('#creature-prompt');
  const refresh = () => {
    preview.value = buildCreaturePrompt(build, Object.fromEntries(Object.entries(fields).map(([key, selector]) => [key, panel.querySelector(selector).value])));
    return preview.value;
  };
  for (const selector of Object.values(fields)) {
    panel.querySelector(selector).addEventListener('input', refresh);
    panel.querySelector(selector).addEventListener('change', refresh);
  }
  panel.querySelector('.creature-preview').addEventListener('toggle', refresh);
  panel.querySelector('#copy-creature-prompt').addEventListener('click', () => onCopy(refresh()));
  refresh();
}
