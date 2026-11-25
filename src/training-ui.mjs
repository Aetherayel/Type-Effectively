import { STAT_KEYS, STAT_NAMES } from './data.mjs';
import {
  emptyTrainingEvs, level100Stats, MAX_EV_PER_STAT, trainingPlan,
  TRAINING_IV, USABLE_EV_BUDGET, validTrainingEvs
} from './ev-training.mjs?v=semantic-v3-1';

const escapeHtml = text => String(text).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderTrainingPanel(build, container, { initialEvs = null, onChange = () => {} } = {}) {
  const auto=trainingPlan(build),suggested=auto.evs;
  const reinforce=trainingPlan(build,'reinforce'),compensate=trainingPlan(build,'compensate');
  const distinct=reinforce.evs.some((v,i)=>Math.abs(v-compensate.evs[i])>=100);
  const planCaption=p=>'Suggested '+build.role.primary.name+' spread'+(distinct?' · '+(p.approach==='reinforce'?'reinforce strengths':'cover weaknesses'):' · role-led training')+(p.trickRoom?' · preserve low Speed for Trick Room':'')+'. Change anything you like.';
  let evs = validTrainingEvs(initialEvs) ? [...initialEvs] : [...suggested];
  const rows = STAT_KEYS.map((key, index) =>
    '<div class="ev-row" data-ev-row="' + index + '">' +
      '<label for="training-ev-' + index + '">' + escapeHtml(STAT_NAMES[index]) + '</label>' +
      '<input id="training-ev-' + index + '" data-ev-input="' + index +
        '" type="range" min="0" max="' + MAX_EV_PER_STAT + '" step="4" value="' + evs[index] +
        '" aria-label="' + escapeHtml(STAT_NAMES[index]) + ' effort values">' +
      '<output for="training-ev-' + index + '" data-ev-value="' + index + '"></output>' +
      '<strong data-trained-stat="' + key + '"></strong>' +
    '</div>'
  ).join('');

  container.insertAdjacentHTML('beforeend',
    '<section class="ev-trainer" id="ev-trainer" aria-label="Train your Pokémon">' +
      '<div class="ev-head"><div><span class="mini-label">POST-BUILD · TRAINER MODE</span>' +
        '<h4>Train your Pokémon<span class="terminal-dot">.</span></h4></div>' +
        '<span class="ev-level">LV. 100</span></div>' +
      '<p class="ev-intro">Your personality sets the base stats. Your training determines the final spread. ' +
        'Adjust EVs without changing your typing, role, or signature strategy.</p>' +
      '<div class="ev-budget"><span>Useful EVs allocated</span>' +
        '<strong id="ev-budget-count" aria-live="polite"></strong></div>' +
      '<div class="ev-budget-track"><span id="ev-budget-progress"></span></div>' +
      '<div class="ev-table"><div class="ev-table-head"><span>STAT</span><span>EV ALLOCATION</span>' +
        '<span>EVs</span><span>LV. 100</span></div>' + rows + '</div>' +
      '<div class="ev-actions">' +
        '<button type="button" id="ev-suggest" class="outline-button">Suggested training</button>' +
        (distinct?'<button type="button" id="ev-reinforce" class="outline-button">Reinforce strengths</button>'+
          '<button type="button" id="ev-compensate" class="outline-button">Cover weakness</button>':'') +
        '<button type="button" id="ev-reset" class="outline-button">Reset EVs</button></div>' +
      '<p class="ev-caption" id="ev-caption">'+escapeHtml(planCaption(auto))+'</p>' +
      '<p class="ev-caveat">All IVs fixed at ' + TRAINING_IV +
        '. Each 4 EVs contribute 1 stat point before Nature; a Pokémon can hold 510 EVs, ' +
        'but only 508 matter in 4-point steps. Nature is applied once, after IVs and EVs. ' +
        'This training does not affect the original 600 BST or the exported personality card.</p>' +
    '</section>'
  );
  const panel = container.querySelector('#ev-trainer');
  const inputs = [...panel.querySelectorAll('[data-ev-input]')];
  const update = () => {
    const stats = level100Stats(build.baseStats, build.natureBoost, build.natureDrop, evs);
    const allocated = evs.reduce((sum, ev) => sum + ev, 0);
    panel.querySelector('#ev-budget-count').textContent = allocated + ' / ' + USABLE_EV_BUDGET;
    panel.querySelector('#ev-budget-progress').style.width = (100 * allocated / USABLE_EV_BUDGET) + '%';
    inputs.forEach((input, index) => {
      input.value = String(evs[index]);
      panel.querySelector('[data-ev-value="' + index + '"]').textContent = String(evs[index]);
      panel.querySelector('[data-trained-stat="' + STAT_KEYS[index] + '"]').textContent =
        String(stats[STAT_KEYS[index]]);
      input.setAttribute('aria-valuetext', evs[index] + ' EVs, level 100 stat ' + stats[STAT_KEYS[index]]);
    });
    onChange([...evs]);
  };
  inputs.forEach((input, index) => input.addEventListener('input', () => {
    const requested = Number(input.value);
    const remaining = USABLE_EV_BUDGET - evs.reduce((sum, value) => sum + value, 0) + evs[index];
    evs[index] = Math.min(requested, MAX_EV_PER_STAT, remaining);
    panel.querySelector('#ev-caption').textContent = 'Custom training spread · still the same Pokémon.';
    update();
  }));
  const applyPlan=p=>{
    evs=[...p.evs];
    panel.querySelector('#ev-caption').textContent=planCaption(p);
    update();
  };
  panel.querySelector('#ev-suggest').addEventListener('click',()=>applyPlan(auto));
  panel.querySelector('#ev-reinforce')?.addEventListener('click',()=>applyPlan(reinforce));
  panel.querySelector('#ev-compensate')?.addEventListener('click',()=>applyPlan(compensate));
  panel.querySelector('#ev-reset').addEventListener('click', () => {
    evs = emptyTrainingEvs();
    panel.querySelector('#ev-caption').textContent = 'Untrained spread · allocate EVs to begin.';
    update();
  });
  if (validTrainingEvs(initialEvs) && initialEvs.some((value, i) => value !== suggested[i])) {
    panel.querySelector('#ev-caption').textContent = 'Custom training spread restored from your shared link.';
  }
  update();
}
