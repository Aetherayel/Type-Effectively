import {
  ENNEAGRAM_NAMES, MBTI_TYPES, OCEAN_LABELS,
  ROLE_DESCRIPTIONS, STAT_KEYS, STAT_NAMES, TEST_LINKS, TYPE_COLORS
} from './data.mjs?v=v2-raw-affinities-1';
import { deriveMbti, deriveTritype, generateCompleteBuild, isValidTritype, normalizeRoweScores } from './engine.mjs?v=v2-raw-affinities-1';
import { FUNCTION_KEYS, deriveFunctionPreferences } from './functions.mjs';
import { FACET_GROUPS, FACET_KEYS, validateFacetScores } from './bigfive-facets.mjs';
import { NATURE_DIMENSIONS } from './nature.mjs';
import { renderStatRadar } from './radar.mjs';
import { renderAffinityComparison } from './stat-affinity-ui.mjs';
import { renderRelatives } from './relatives-ui.mjs';
import { getDefensiveMatchups } from './matchups.mjs';
import { downloadCardPng, downloadTrainedCardPng } from './export-card.mjs?v=1.3.0';
import { itemSpriteUrl } from './item-sprites.mjs';
import { generateRandomBuildInput } from './random-build.mjs';
import { renderLiveCornerArtwork, renderLiveRoleWatermark } from './card-art.mjs?v=role-emblems-1';
import { cardVersionFooter, normalizeBuildVersion } from './build-version.mjs';
import { renderTrainingPanel } from './training-ui.mjs?v=1.3.0';

const $ = id => document.getElementById(id);
const mbtiAxes=[
  ['Energy','Extraverted','Introverted'],
  ['Mind','Observant','Intuitive'],
  ['Nature','Thinking','Feeling'],
  ['Tactics','Judging','Prospecting'],
  ['Identity','Assertive','Turbulent']
];
const oceanDetails=[
  'Curiosity & imagination','Order & follow-through','Social energy & assertion',
  'Cooperation & empathy','Sensitivity to stress'
];
const FUNCTION_LABELS=['Extraverted intuition','Introverted intuition','Extraverted sensing','Introverted sensing','Extraverted thinking','Introverted thinking','Extraverted feeling','Introverted feeling'];
const state={mbtiMode:'scores',enneaMode:'scores',testMode:'quick',touched:{mbti:false,functions:false,enneagram:false,rowe:false,bigfive:false},lastBuild:null,lastInput:null,lastTrainingEvs:null,isSample:false};
let toastTimeout;

function activeBuildVersion() {
  const raw=document.querySelector('meta[name="application-version"]')?.content;
  return normalizeBuildVersion('v'+raw);
}
function refreshVersionFooter(build) {
  const node=$('build-version-footer');
  if(node)node.textContent=cardVersionFooter(build);
}
function refreshPublishedBuildVersion(version) {
  const build=state.lastBuild;
  if(!build || !normalizeBuildVersion(version))return;
  build.renderVersion=version;
  // Confirm the version for builds generated before async release lookup finishes.
  // A restored shared card always keeps its original release provenance.
  if(!build.restoredFromShare)build.createdVersion=version;
  refreshVersionFooter(build);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function sliderMarkup(prefix,index,title,left,right,value=50) {
  const id=prefix+'-'+index;
  const poles=left && right ? '<div class="range-poles"><span>'+left+'</span><span>'+right+'</span></div>' : '';
  const mbti=prefix==='mbti';
  const poleControl=mbti?'<select class="pole-select" id="'+id+'-pole" aria-label="'+title+' reported preference"><option value="left">'+left+'</option><option value="right" selected>'+right+'</option></select>':'';
  return '<div class="range-field">' +
    '<label class="range-top" for="'+id+'"><strong>'+title+'</strong><span class="range-percent" id="'+id+'-readout">50% · balanced</span></label>' +
    '<div class="range-bottom"><input class="range-control" id="'+id+'" type="range" min="0" max="100" step="1" value="'+value+'" data-score="'+prefix+'"/>' +
    '<input class="range-number" type="number" min="'+(mbti?'50':'0')+'" max="100" step="1" value="'+value+'" id="'+id+'-number" aria-label="'+title+' percentage" data-number-for="'+id+'"/>'+poleControl+'</div>'+poles+'</div>';
}
function enneagramMarkup(n) {
  return '<div class="ennea-score"><div class="ennea-head"><span>TYPE '+n+'</span><strong id="ennea-'+(n-1)+'-readout">50</strong></div>' +
    '<input type="range" min="0" max="100" value="50" id="ennea-'+(n-1)+'" data-score="enneagram" aria-label="Type '+n+' '+ENNEAGRAM_NAMES[n]+' score"/>' +
    '<input type="number" min="0" max="100" value="50" id="ennea-'+(n-1)+'-number" data-number-for="ennea-'+(n-1)+'" aria-label="Type '+n+' numeric score"/></div>';
}
function roweMarkup(n) {
  return '<label class="ennea-score rowe-score" for="rowe-'+(n-1)+'">'+
    '<span>TYPE '+n+'</span><input type="number" step="any" inputmode="decimal" id="rowe-'+(n-1)+'" placeholder="Raw score" aria-label="Rowe type '+n+' raw total"/></label>';
}
function readRoweScores() {
  const fields=Array.from({length:9},(_,i)=>$('rowe-'+i));
  if(fields.some(field=>field.value.trim()===''))
    throw new Error('Enter all nine raw Rowe Enneagram scores, including negative values.');
  const values=fields.map(field=>Number(field.value));
  if(values.some(value=>!Number.isFinite(value)))
    throw new Error('All nine Rowe scores must be finite numbers.');
  return values;
}
function functionMarkup(key,index) {
  return '<label class="function-entry" for="function-'+index+'"><span><strong>'+key+'</strong> · '+FUNCTION_LABELS[index]+'</span>'+
    '<input id="function-'+index+'" type="number" step="any" inputmode="decimal" placeholder="Score" aria-label="'+key+' overall score" /></label>';
}
function readFunctionScores() {
  const fields=FUNCTION_KEYS.map((_,i)=>$('function-'+i));
  if(fields.some(field=>field.value.trim()===''))
    throw new Error('Enter all eight cognitive-function totals before generating.');
  const scores=fields.map(field=>Number(field.value));
  if(scores.some(value=>!Number.isFinite(value)))
    throw new Error('Cognitive-function totals must be finite numbers.');
  return scores;
}
function facetMarkup(group,index) {
  return '<fieldset class="facet-group"><legend>'+group.code+' · '+escapeHtml(group.label)+'</legend>'+
    '<div class="facet-grid">'+group.facets.map((label,j)=>{
      const i=index*6+j;
      return '<label class="facet-entry" for="facet-'+i+'"><span>'+group.code+(j+1)+' · '+escapeHtml(label)+'</span>'+
        '<input id="facet-'+i+'" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="Percentile" aria-label="'+escapeHtml(label)+' percentile"/></label>';
    }).join('')+'</div></fieldset>';
}
function facetFieldValues() {
  return FACET_KEYS.map((_,i)=>$('facet-'+i).value.trim());
}
function readFacetScores() {
  const strings=facetFieldValues();
  if(strings.every(v=>v===''))return null;
  const scores=strings.map(v=>v===''?null:Number(v));
  return validateFacetScores(scores);
}
function resetFacetFields() {
  FACET_KEYS.forEach((_,i)=>{$('facet-'+i).value='';});
  updateFacetEntryStatus();
}
function updateFacetEntryStatus() {
  const strings=facetFieldValues();
  let complete=0,incomplete=0;
  for(let i=0;i<FACET_GROUPS.length;i++){
    const count=strings.slice(i*6,i*6+6).filter(Boolean).length;
    if(count===6)complete++;
    else if(count>0)incomplete++;
  }
  $('facet-entry-status').textContent=incomplete
    ? complete+' complete facet group(s), '+incomplete+' incomplete. Fill all six in a group or clear it.'
    : complete===5
      ? 'All 30 facets complete. Broad domain scores are optional and will not override these details.'
      : complete
        ? complete+' of five facet groups complete. Enter broad domain scores to cover missing groups.'
        : 'No facets supplied. Enter all five broad domain scores instead.';
}
function setTestingPath(mode,chooseInput=true) {
  state.testMode=mode==='advanced'?'advanced':'quick';
  document.querySelectorAll('[data-test-mode]').forEach(button=>{
    const active=button.dataset.testMode===state.testMode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  const advanced=state.testMode==='advanced';
  const entries=[
    ['mind',advanced?TEST_LINKS.functions:TEST_LINKS.mbti,advanced?'Take the Sakinorva Functions test ↗':'Take the free 16Personalities test ↗',advanced?'256 questions · function domains':'~10 min · external site'],
    ['ennea',advanced?TEST_LINKS.rowe:TEST_LINKS.enneagram,advanced?'Take the Rowe Enneagram test ↗':'Take the free Find My Nine test ↗',advanced?'306 questions · nine scores':'Full nine-score results'],
    ['bigfive',advanced?TEST_LINKS.ipipneo300:TEST_LINKS.bigfive,advanced?'Take the IPIP-NEO-300 test ↗':'Take the free Ocean Test ↗',advanced?'300 questions · domains + 30 facets':'50 questions · free scores']
  ];
  entries.forEach(([key,href,title,detail])=>{
    const link=$(key+'-test-link');
    link.href=href; link.textContent=title;
    $(key+'-test-detail').textContent=detail;
  });
  $('assessment-note').textContent=advanced?
    'Longer questionnaires offer more detail, not guaranteed accuracy. Enter cognitive totals, nine Enneagram scores, and either all 30 Big Five facets or domain scores for any missing facet groups.':
    'Shorter tests with straightforward scores. You can still enter detailed data below.';
  if(chooseInput) {
    setMode('mbti',advanced?'functions':'scores');
    setMode('ennea',advanced?'rowe':'scores');
  }
}
function setupFields() {
  $('mbti-score-fields').innerHTML=mbtiAxes.map(([title,left,right],i)=>sliderMarkup('mbti',i,title,left,right)).join('');
  $('function-score-fields').innerHTML=FUNCTION_KEYS.map(functionMarkup).join('');
  $('ennea-score-fields').innerHTML=Array.from({length:9},(_,i)=>enneagramMarkup(i+1)).join('');
  $('rowe-score-fields').innerHTML=Array.from({length:9},(_,i)=>roweMarkup(i+1)).join('');
  $('bigfive-fields').innerHTML=OCEAN_LABELS.map((label,i)=>sliderMarkup('bigfive',i,label,oceanDetails[i],'High '+label)).join('');
  $('bigfive-facet-groups').innerHTML=FACET_GROUPS.map(facetMarkup).join('');
  FACET_KEYS.forEach((_,i)=>$('facet-'+i).addEventListener('input',updateFacetEntryStatus));
  updateFacetEntryStatus();
  const typeSelect=$('mbti-override');
  [...MBTI_TYPES].sort().forEach(type=>{
    const el=document.createElement('option');el.value=type;el.textContent=type;typeSelect.append(el);
  });
  document.querySelectorAll('[data-score]').forEach(el=>el.addEventListener('input',()=>{
    state.touched[el.dataset.score==='ennea'?'enneagram':el.dataset.score]=true;
    
    syncSlider(el.id,el.value);
    updateDerived();
  }));
  document.querySelectorAll('[data-number-for]').forEach(el=>el.addEventListener('input',()=>{
    if (el.value==='') return;
    const ref=el.dataset.numberFor;
    const isMbti=ref.startsWith('mbti-');
    const num=Math.min(100,Math.max(isMbti?50:0,Number(el.value)));
    if (!Number.isFinite(num)) return;
    state.touched[ref.split('-')[0]==='ennea'?'enneagram':ref.split('-')[0]]=true;
    
    const score=isMbti?($(ref+'-pole').value==='right'?num:100-num):num;
    syncSlider(ref,Math.round(score));
    updateDerived();
  }));
  document.querySelectorAll('.pole-select').forEach(el=>el.addEventListener('change',()=>{
    const ref=el.id.replace('-pole','');
    const percent=Number($(ref+'-number').value);
    const score=el.value==='right'?percent:100-percent;
    state.touched.mbti=true;
    syncSlider(ref,score);updateDerived();
  }));
  $('ennea-ranking').addEventListener('input',()=>{state.touched.enneagram=true;updateDerived();});
  document.querySelectorAll('[id^="rowe-"][type="number"]').forEach(el=>el.addEventListener('input',()=>{
    state.touched.rowe=true;updateDerived();
  }));
  $('mbti-override').addEventListener('change',()=>{updateDerived();});
  $('function-identity').addEventListener('change',()=>{updateDerived();});
  document.querySelectorAll('[id^="function-"][type="number"]').forEach(el=>el.addEventListener('input',()=>{
    state.touched.functions=true;updateDerived();
  }));
  $('tritype-override').addEventListener('input',()=>{updateDerived();});
  $('wing-override').addEventListener('change',()=>{});
}
function syncSlider(id,value) {
  const v=Math.max(0,Math.min(100,Math.round(Number(value))));
  $(id).value=String(v);
  const isMbti=id.startsWith('mbti-');
  $(id+'-number').value=String(isMbti?Math.max(v,100-v):v);
  if(isMbti) $(id+'-pole').value=v>=50?'right':'left';
  const readout=$(id+'-readout');
  if (isMbti) {
    const index=Number(id.split('-')[1]);
    const [,,right]=mbtiAxes[index];
    const left=mbtiAxes[index][1];
    readout.textContent=v===50?'50% · balanced':(v>50?v+'% '+right:(100-v)+'% '+left);
  } else {
    readout.textContent=String(v)+(id.startsWith('bigfive-')?'%':'');
  }
}
function readScores(prefix,length) {
  return Array.from({length},(_,i)=>Number($(prefix+'-'+i).value));
}
function setScores(prefix,vals) {vals.forEach((v,i)=>syncSlider(prefix+'-'+i,v));}
function setMode(group,mode) {
  // Labels alone are overrides, never standalone tests.
  if(group==='mbti' && !['scores','functions'].includes(mode))mode='scores';
  if(group==='ennea' && !['scores','ranking','rowe'].includes(mode))mode='scores';
  state[group+'Mode']=mode;
  document.querySelectorAll('[data-'+group+'-mode]').forEach(button=>{
    const active=button.dataset[group+'Mode']===mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  if(group==='mbti') {
    $('mbti-score-fields').classList.toggle('hidden',mode!=='scores');
    $('mbti-score-help').classList.toggle('hidden',mode!=='scores');
    $('function-score-fields').classList.toggle('hidden',mode!=='functions');
    $('function-help').classList.toggle('hidden',mode!=='functions');
    $('mbti-type-fields').classList.remove('hidden');
    $('function-identity-fields').classList.toggle('hidden',mode!=='functions');
    $('function-identity-help').classList.toggle('hidden',mode!=='functions');
    $('mbti-override-label').innerHTML=mode==='functions'?
      'Four-letter type override <span class="muted">(optional; e.g. Sakinorva result)</span>':
      'Type override <span class="muted">(optional with scores)</span>';
    $('mbti-subtitle').textContent=mode==='functions'?
      'Eight cognitive functions, entered directly. All eight inform base stats; their preference contrasts inform Nature and other classifications.':
      'Five 16Personalities dimensions. Yes, we kept the percentages. They actually do something here.';
    $('mbti-derived').textContent='Your test results determine the suggested type. You may override the label without replacing your scores.';
    $('mbti-override').options[0].textContent=mode==='functions'?'Use function-derived suggestion':'Auto-detect from scores';
  } else {
    $('ennea-score-fields').classList.toggle('hidden',mode!=='scores');
    $('ennea-ranking-fields').classList.toggle('hidden',mode!=='ranking');
    $('ennea-score-help').classList.toggle('hidden',mode!=='scores');
    $('rowe-score-fields').classList.toggle('hidden',mode!=='rowe');
    $('rowe-score-help').classList.toggle('hidden',mode!=='rowe');
    $('tritype-override').placeholder='e.g. 593';
  }
  updateDerived();
}
function parseRanking() {
  const raw=$('ennea-ranking').value.trim();
  if (!raw) return null;
  const parts=raw.split(/[\s,>\-/]+/).filter(Boolean);
  if(parts.length!==9||parts.some(part=>!/^[1-9]$/.test(part))||new Set(parts).size!==9) return null;
  return parts.map(Number);
}
function inferredTritype() {
  if(state.enneaMode==='rowe'?!state.touched.rowe:!state.touched.enneagram) return '';
  try {
    if(state.enneaMode==='scores') return deriveTritype(readScores('ennea',9));
    if(state.enneaMode==='rowe') return deriveTritype(normalizeRoweScores(readRoweScores()));
    if(state.enneaMode==='ranking'){
      const ranking=parseRanking();if(!ranking)return '';
      const scores=Array(9).fill(0);
      ranking.forEach((n,i)=>{scores[n-1]=100-i*12;});
      return deriveTritype(scores);
    }
  } catch{return '';}
  return '';
}
function updateDerived() {
  const override=$('mbti-override').value;
  const selectedAT=state.mbtiMode==='functions'?$('function-identity').value:'';
  const canSuggest=state.mbtiMode==='scores'&&state.touched.mbti;
  let suggested=canSuggest?deriveMbti(readScores('mbti',5)):'';
  if(state.mbtiMode==='functions') {
    try {
      suggested=deriveMbti(deriveFunctionPreferences(readFunctionScores()));
    } catch { suggested=''; }
  }
  $('mbti-derived').textContent=state.mbtiMode==='functions'?
    (suggested
      ? (override?'Selected type: '+override+' · function-derived suggestion: '+suggested:
        'Game-derived preference: '+suggested)+
        ' · Nature follows the complete profile'+
        ' · '+(selectedAT?'Identity: '+selectedAT+' (estimated strength)':'A/T not provided')
      : (override?'Selected type: '+override+' · ':'')+
        'Enter all eight overall function totals to infer a game-compatible preference.'):
    override?'Selected: '+override+(suggested && suggested!==override?' · test-derived suggestion: '+suggested:''):
    suggested?'Suggested type: '+suggested+' · Nature follows the complete profile':
    'Enter your five 16Personalities percentages to infer a type. A four-letter label alone cannot generate a build.';

  const tritypeOverride=$('tritype-override').value.trim();
  const derived=inferredTritype();
  $('ennea-derived').textContent=tritypeOverride
    ? 'Selected tritype: '+tritypeOverride+(derived&&derived!==tritypeOverride?' · score-derived suggestion: '+derived:'')
    : derived?'Suggested tritype: '+derived
    : state.enneaMode==='ranking'?'Enter a complete ranking of all nine types.':
    state.enneaMode==='rowe'?'Enter the nine signed raw totals from your Rowe report.':
    'Add your nine test scores to determine a tritype; overrides cannot substitute for test results.';

  const coreString=isValidTritype(tritypeOverride)?tritypeOverride:derived;
  const core=coreString?Number(coreString[0]):null;
  const select=$('wing-override');
  const previous=select.value;
  select.innerHTML='<option value="">Auto-detect</option>';
  if(core){
    for(const adjacent of [core===1?9:core-1,core===9?1:core+1]){
      const option=document.createElement('option');
      option.value=String(adjacent);
      option.textContent=core+'w'+adjacent;
      select.append(option);
    }
    if([...select.options].some(opt=>opt.value===previous)) select.value=previous;
  }
}
function collectInput() {
  const typeOverride=$('mbti-override').value;
  const functionScores=state.mbtiMode==='functions'?readFunctionScores():null;
  const identityPreference=state.mbtiMode==='functions'?($('function-identity').value||null):null;
  const tritypeOverride=$('tritype-override').value.trim();
  if(tritypeOverride&&!isValidTritype(tritypeOverride)) throw new Error('Tritype needs exactly one gut (8/9/1), heart (2/3/4), and head (5/6/7) type.');
  const mbtiScores=state.mbtiMode==='scores' && state.touched.mbti ? readScores('mbti',5):null;
  if(!mbtiScores&&!functionScores) throw new Error('Cognitive style test results are required: enter 16Personalities percentages or eight functions. A type override alone is insufficient.');
  let enneagramScores=null,enneagramRanking=null,roweScores=null;
  if(state.enneaMode==='scores'&&state.touched.enneagram) enneagramScores=readScores('ennea',9);
  if(state.enneaMode==='rowe') roweScores=readRoweScores();
  if(state.enneaMode==='ranking'){
    enneagramRanking=parseRanking();
    if(!enneagramRanking) throw new Error('Your ranking must contain each digit 1–9 exactly once.');
  }
  if(!enneagramScores&&!enneagramRanking&&!roweScores) throw new Error('Enneagram test results are required: enter nine scores, Rowe totals, or a full nine-type ranking. A tritype override alone is insufficient.');
  const bigFiveFacets=readFacetScores();
  if(!state.touched.bigfive && (!bigFiveFacets || bigFiveFacets.some(n=>n===null)))
    throw new Error('Big Five test results are required: enter five broad domains or all 30 IPIP-NEO facets.');
  return {
    mbtiScores,typeOverride,functionScores,identityPreference,enneagramScores,enneagramRanking,roweScores,tritypeOverride,
    wingOverride:$('wing-override').value,
    bigFive:state.touched.bigfive?readScores('bigfive',5):null,
    bigFiveFacets
  };
}
function typeChip(type) {
  const color=TYPE_COLORS[type]||'#98afb8';
  return '<span class="type-chip" style="background:'+color+'">'+escapeHtml(type)+'</span>';
}
function renderMatchups(types) {
  const matchups=getDefensiveMatchups(types);
  const groups=[
    ['4× Weakness',matchups.quadWeak,'4×','danger'],
    ['2× Weakness',matchups.weak,'2×','weak'],
    ['½× Resistance',matchups.resist,'½×','resist'],
    ['¼× Resistance',matchups.strongResist,'¼×','strong'],
    ['Immunity',matchups.immune,'0×','immune']
  ];
  const rows=groups.map(([heading,entries,multiplier,kind])=>
    '<div class="matchup-row matchup-'+kind+'">'+
      '<span class="matchup-label">'+heading+'</span>'+
      '<div class="matchup-types">'+
        (entries.length
          ? entries.map(({type})=>
              '<span class="matchup-chip" style="--matchup-type:'+TYPE_COLORS[type]+'">'+
                '<strong>'+escapeHtml(type)+'</strong><span>'+multiplier+'</span></span>'
            ).join('')
          : '<span class="matchup-none">None</span>')+
      '</div>'+
    '</div>'
  ).join('');
  return '<section class="matchup-panel" aria-label="Defensive type matchups">'+
    '<div class="result-section-title"><h4>Type matchups</h4><span>DEFENSIVE PROFILE</span></div>'+
    '<p class="matchup-explain">Incoming attack damage against '+types.map(escapeHtml).join(' / ')+' typing.</p>'+
    '<div class="matchup-grid">'+rows+'</div>'+
    '<p class="matchup-caveat">Typing only; abilities, items, weather and other battle effects can change these results.</p>'+
  '</section>';
}
function renderFieldReport(build) {
  const a=build.archetype,r=build.report;
  const parts=[
    ['01 / INSTINCTS','What gets this Pokémon moving?',r.motives],
    ['02 / FIELD BEHAVIOR','How to read its approach',r.thinking],
    ['03 / TEMPERAMENT','What to expect in training',r.temperament],
    ['04 / DEPLOYMENT','Where to send it into battle',r.combat],
    ['05 / CAUTIONS','What the trainer should watch for',r.tradeoff],
    ['06 / ODDITIES','What might surprise you',r.twist],
    ['07 / TEAMWORK','Which partners bring out its best',r.team],
    ['08 / GROWTH','How to expand its moveset',r.growth]
  ];
  const breakdown=[
    ['Motivation',a.breakdown.motivation,'25%'],
    ['Cognitive style',a.breakdown.cognition,'20%'],
    ['Temperament',a.breakdown.temperament,'25%'],
    ['Battle expression',a.breakdown.battle,'30%']
  ];
  return '<section class="field-report" aria-label="Trainer field report">'+
    '<div class="field-report-head"><span class="mini-label">UNOFFICIAL FIELD GUIDE · TRAINER EDITION</span>'+
      '<h4>Your Pokémon, according to our highly unofficial Pokédex</h4>'+
      '<p>You caught the creature. Here is what the field researchers think you should do with it. Clipboard optional; Potions recommended.</p></div>'+
    '<div class="dex-entry"><span class="mini-label">POKÉDEX ENTRY · '+escapeHtml(a.title.toUpperCase())+'</span>'+
      '<p>'+escapeHtml(r.dexEntry)+'</p></div>'+
    '<div class="report-intro"><span>FIELD OBSERVATION · '+escapeHtml(a.modeLabel.toUpperCase())+'</span>'+
      '<strong>'+escapeHtml(a.signature)+'</strong><p>'+escapeHtml(r.opener)+'</p></div>'+
    '<section class="trainer-playbook" aria-label="Recommended training plan">'+
      '<h5>TRAINER PLAYBOOK <span>3 FIELD ORDERS</span></h5>'+
      '<div class="trainer-step-grid">'+r.trainerTips.map((tip,i)=>
        '<div class="trainer-step"><span class="mini-label">0'+(i+1)+' / '+escapeHtml(tip.label)+'</span>'+
        '<strong>'+escapeHtml(tip.title)+'</strong><p>'+escapeHtml(tip.text)+'</p></div>').join('')+'</div></section>'+
    '<div class="report-grid">'+parts.map(([label,heading,description])=>
      '<article class="report-tile"><span class="mini-label">'+escapeHtml(label)+'</span>'+
      '<h5>'+escapeHtml(heading)+'</h5><p>'+escapeHtml(description)+'</p></article>').join('')+'</div>'+
    '<details class="report-explain"><summary>Why '+escapeHtml(a.title)+'? Show the receipts +</summary>'+
      '<p>'+escapeHtml(r.reasoning)+'</p>'+
      '<p class="report-score-explain">Scores are relative compatibility points out of 100, not probabilities, diagnoses, or scientific confidence. The four inputs overlap: battle style already incorporates stats and typing.</p>'+
      '<div class="report-score-grid">'+breakdown.map(([name,value,weight])=>
        '<div class="report-score-row"><div><strong>'+escapeHtml(name)+'</strong><span>'+weight+' weight · '+value+'/100 match</span></div>'+
          '<div class="report-meter" aria-hidden="true"><i style="width:'+Math.max(0,Math.min(100,value))+'%"></i></div></div>').join('')+'</div>'+
      '<div class="report-neighbors"><strong>Other near-matches</strong><p>'+a.alternatives.map(x=>escapeHtml(x.title)+' ('+x.score+'/100)').join(' · ')+'</p></div>'+
    '</details>'+
    '<p class="report-disclaimer">'+escapeHtml(r.caution)+'</p>'+
  '</section>';
}

function renderCard(build) {
  const [first,second]=build.types;
  const pcolor=TYPE_COLORS[first],scolor=TYPE_COLORS[second||first];
  const warningHtml=build.warnings.length?'<div class="warning-note"><strong>Input notes:</strong><br />'+build.warnings.map(escapeHtml).join('<br />')+'</div>':'';
  const moveHtml=build.moves.map((move,i)=>'<div class="move"><span class="mini-label">'+escapeHtml(move.category)+'</span><strong>'+escapeHtml(move.name)+'</strong><p>'+escapeHtml(move.why)+'</p></div>').join('');
  const roleSecondary=build.role.secondary?' / '+build.role.secondary.name:'';
  const cornerArtwork=renderLiveCornerArtwork(build.types);
  const roleWatermark=renderLiveRoleWatermark(build.role.primary.name);
  $('result-container').innerHTML=
    '<article class="result-card'+(build.monotype?' monotype':'')+(cornerArtwork?' has-type-art':'')+'" style="--pcolor:'+pcolor+';--scolor:'+scolor+'">'+
    (cornerArtwork?'<div class="result-artwork" aria-hidden="true">'+cornerArtwork+'</div>':'')+
    '<div class="pokemon-header">'+
      (state.isSample?'<div class="random-sample-mark">RANDOM SAMPLE · SYNTHETIC SCORES</div>':'')+
      '<div class="pokemon-type-accent" aria-hidden="true"></div>'+
      '<div class="pokemon-intro">'+
        '<div class="card-topline"><span class="card-kicker">PERSONALITY POKÉMON</span><span class="result-id">#'+build.tritype+' / '+escapeHtml(build.identity)+'</span></div>'+
        '<h3>'+escapeHtml(build.title)+'</h3><p class="archetype-tagline">'+escapeHtml(build.archetype.signature)+'</p>'+
        '<div class="pokemon-identity-row">'+
          '<div class="type-chips">'+build.types.map(typeChip).join('')+'</div>'+
          '<span class="pokemon-subtitle">'+escapeHtml(build.nature)+' · '+escapeHtml(build.role.primary.name+roleSecondary)+' · '+escapeHtml(build.ability.name)+'</span>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="result-body">'+
      '<div class="result-section-title"><h4>Base stats</h4><span>535 BST</span></div>'+
      '<div class="stat-view-switch" role="group" aria-label="Stat score view">'+
        '<button type="button" id="stat-view-bst" class="stat-view-button active" aria-pressed="true">Pokémon stats</button>'+
        '<button type="button" id="stat-view-affinity" class="stat-view-button" aria-pressed="false">Before normalization</button>'+
      '</div>'+
      '<div id="stat-view-bst-panel">'+
      '<div class="stat-visual">'+roleWatermark+renderStatRadar(build.baseStats,build.effectiveStats)+
      '</div>'+
      '<p class="nature-summary"><strong>'+escapeHtml(build.nature)+' Nature</strong> · +10% '+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(build.natureBoost)])+' · −10% '+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(build.natureDrop)])+'</p>'+
       '<details class="nature-detail"><summary>Why '+escapeHtml(build.nature)+'? · '+build.natureScoring.score+' tradeoff fit</summary>'+
         '<p>Prefers '+escapeHtml(NATURE_DIMENSIONS[build.natureBoost])+' over '+escapeHtml(NATURE_DIMENSIONS[build.natureDrop])+'. This describes a priority tradeoff, not which stat you are best at.</p>'+
         '<p><strong>Score:</strong> 50 + (boost priority − sacrificed priority) / 2. Each input source gets its own score before weighting:</p>'+
         '<div class="nature-factors">'+Object.entries(build.natureScoring.components).map(([source,value])=>
           '<span>'+escapeHtml(source==='motivation'?'Enneagram':source==='cognition'?'Cognition':'Big Five')+' · '+build.natureScoring.weights[source]+'% × '+value+'</span>').join('')+'</div>'+
         '<p>'+ (build.natureScoring.temperamentMeasured?'':'Big Five was not supplied, so it was excluded rather than treated as measured 50. ')+
           (build.natureScoring.cognitionEstimated?'Four-letter type provided a reduced-weight cognitive estimate. ':'')+
           'Top alternative: '+escapeHtml(build.natureScoring.alternatives[0].name)+' ('+build.natureScoring.alternatives[0].score+'). Authored game affinities, not psychological probabilities.</p>'+
       '</details>'+
      '</div>'+renderAffinityComparison(build)+
      '<div class="role-panel"><span class="mini-label">BATTLE CLASSIFICATION</span><strong>'+escapeHtml(build.role.primary.name+roleSecondary)+'</strong>'+
        '<p>'+escapeHtml(ROLE_DESCRIPTIONS[build.role.primary.name])+'</p>'+
        '<div class="role-subline">'+escapeHtml(build.role.specialization.toUpperCase())+' SPREAD · '+build.role.primary.score+'% ROLE FIT</div>'+
      '</div>'+
      (build.signatureStrategy?
        '<div class="signature-strategy"><span class="mini-label">SIGNATURE STRATEGY · '+build.signatureStrategy.score+' FIT</span>'+
          '<strong>'+escapeHtml(build.signatureStrategy.name)+'</strong>'+
          '<p>'+escapeHtml(build.signatureStrategy.insight)+'</p>'+
          '<p class="signature-mechanism">'+escapeHtml(build.signatureStrategy.mechanism)+'</p></div>':'')+
      '<div class="result-section-title"><h4>Abilities</h4><span>PRIMARY / HIDDEN</span></div>'+
      '<div class="ability-list">'+
        '<div class="ability-box"><span class="mini-label">Standard ability</span><strong>'+escapeHtml(build.ability.name)+'</strong><p>'+escapeHtml(build.ability.desc)+'</p></div>'+
        '<div class="ability-box hidden-ability"><span class="mini-label">Hidden ability · alternate strength</span><strong>'+escapeHtml(build.hiddenAbility)+'</strong><p>Matches your visible typing and battle role, with supporting motivations '+build.second+' and '+build.third+' influencing the choice. Not active alongside the standard Ability.</p></div>'+
      '</div>'+
      '<section class="held-item-section" aria-label="Thematic held item">'+
        '<div class="result-section-title"><h4>Held item</h4><span>PERSONALITY FLAVOR</span></div>'+
        '<div class="held-item-card">'+
          '<div class="held-item-content">'+
            '<div class="held-item-art" aria-hidden="true"><span class="held-item-fallback">◇</span>'+
              '<img id="held-item-sprite" src="'+escapeHtml(itemSpriteUrl(build.heldItem.name))+'" alt="" width="72" height="72" decoding="async"></div>'+
            '<div class="held-item-copy">'+
              '<div class="held-item-heading"><strong>'+escapeHtml(build.heldItem.name)+'</strong><span>'+escapeHtml(build.heldItem.familyLabel)+'</span></div>'+
              '<p class="held-item-effect">'+escapeHtml(build.heldItem.effect)+'</p>'+
              '<p class="held-item-quip">“'+escapeHtml(build.heldItem.quip)+'”</p>'+
            '</div>'+
          '</div>'+
          '<div class="held-item-why"><span class="mini-label">WHY YOU GOT THIS</span>'+escapeHtml(build.heldItem.why)+'</div>'+
        '</div>'+
        '<p class="held-item-caveat">A personality metaphor, not an active battle modifier.</p>'+
      '</section>'+
      '<div class="result-section-title"><h4>Signature moveset</h4><span>04 MOVES</span></div>'+
      '<div class="moves">'+moveHtml+'</div>'+
      renderFieldReport(build)+
      renderMatchups(build.types)+
      '<details class="explain"><summary>How was this build calculated? +</summary>'+
        '<p><strong>Typing:</strong> '+escapeHtml(build.types[0])+' comes from Enneagram core '+build.core+
        (build.typingWing!=null?' (88% core, 12% wing '+build.typingWing+'). ':' alone; no unverified wing was assumed. ')+
        (build.monotype?'The supporting motivations converge on the same element, creating a monotype. ':
          'The '+escapeHtml(build.types[1])+' secondary type blends fix '+build.second+' (65%), fix '+build.third+' (30%) and the core (5%). ')+
        'Hidden affinity '+escapeHtml(build.hiddenType)+' comes chiefly from fix '+build.third+
        ', with support from fix '+build.second+(build.typingWing!=null?' and the wing. ':'; no wing is assumed. ')+
        'It differs from the visible type(s) and provides monotype move coverage. Your Hidden Ability is chosen separately from abilities compatible with your visible typing, role, stats and supporting motivations.</p>'+
        '<p><strong>535 base points:</strong> Each stat blends Big Five, all nine Enneagram motivations, and cognition with its own weights. Use the <em>Before normalization</em> toggle above to compare modeled 0–100 affinities with the fixed 535 BST allocation. Cognition uses '+(build.statWeightMode==='functions'?'all eight entered functions':build.statWeightMode==='percentages'?'entered 16Personalities percentages':'a lower-weight estimate from four MBTI letters')+'. The six stats are bounded and normalized to exactly 535. Nature is scored independently from preference priorities; '+escapeHtml(build.nature)+' then applies ±10% to two non-HP stats.</p>'+
        '<div class="nature-factors">'+STAT_KEYS.map(key=>{
          const w=build.statWeights[key];
          return '<span>'+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(key)])+': '+Math.round(w.bigFive*100)+'% Big Five · '+Math.round(w.enneagram*100)+'% Enneagram · '+Math.round(w.cognition*100)+'% cognition</span>';
        }).join('')+'</div>'+
        (build.facetScoring.activeDomains.length
          ? '<p><strong>Facet-first Big Five:</strong> Complete groups '+escapeHtml(build.facetScoring.activeDomains.join(', '))+
            ' replace their broad-domain contributions with meaning-specific facets. Missing groups use reported domains; no facets are added as an extra scoring source. Nature, archetype temperament, and held-item fit also use the available detail directly. '+
            'With all 30 facets, reported broad scores cannot override the model.</p>'+
            (Object.values(build.facetScoring.corrections).some(delta=>delta!=null)
              ? '<p>For comparison only, Big Five affinity difference versus the domain-only formula (not bonus points):</p>'+
                '<div class="nature-factors">'+STAT_KEYS.map(key=>{
                  const delta=build.facetScoring.corrections[key];
                  return '<span>'+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(key)])+': '+
                    (delta==null?'n/a':(delta>0?'+':'')+delta.toFixed(1))+'</span>';
                }).join('')+'</div>'
              : '<p>With no broad-domain inputs, no domain-only comparison is calculated.</p>')
          : '<p><strong>Big Five detail:</strong> Five broad domains only; existing domain scoring remains unchanged.</p>')+
        (build.enneagramSource==='rowe' ? '<p><strong>Rowe source:</strong> Signed raw Enneagram totals were translated into within-profile game affinities with a minimum 50-point reference span. This preserves relative gaps and ties; it is not a percentile or a validated comparison against Find My Nine. Rowe subtype values currently do not alter the build.</p>' : '')+
        '<p><strong>Battle role:</strong> Classified from the 535 base stat points <em>before Nature modifies battle stats</em>. Stat-template similarity supplies 80% and visible-type toolkit fit 20%. Neutral-reference compensation reduces the advantage of role targets closest to the average Pokémon. Walls can specialize in physical, special, or mixed endurance; a small bulk-versus-offense preference distinguishes a Wall from a retaliating Tank. Nature still affects battle performance, signature eligibility, and move mechanics, but not battle-role identity. Slot three is a mechanically eligible role tactic; slot four is a corrective Enneagram growth move.</p>'+
        '<p><strong>Archetype:</strong> 36 authored identities (six operating styles × six battle expressions). Candidates combine 25% Enneagram motivation, 20% cognitive preference, 25% Big Five temperament, and 30% battle-role fit. Facets substitute within the temperament component when present, not as a capped additive bonus. Battle fit already includes stat shape and typing. Best score wins, not a measured personality likelihood.</p>'+
        (build.facetScoring.activeDomains.length?
          '<p><strong>Detailed temperament:</strong> The chosen archetype’s facet-aware fit differs from its coarse contextual approximation by '+(build.archetype.facetAdjustment>=0?'+':'')+build.archetype.facetAdjustment.toFixed(1)+' points. '+
          (build.heldItem.facetAdjustment!=null
            ? 'The item-family fit differs from its coarse comparison by '+(build.heldItem.facetAdjustment>=0?'+':'')+build.heldItem.facetAdjustment.toFixed(1)+' points.'
            : 'A mechanically defined signature package fixes its held item.')+
          ' These are comparisons, not additive bonuses. Facets also inform Nature; typing remains Enneagram-derived.</p>'
          :'')+
        '<p><strong>Held item:</strong> Equipment is matched to personality, role, typing, moves and Ability. Detailed facets replace broad-domain fit terms where available; they cannot make incompatible equipment usable or change 535 BST.</p>'+
        '<p><strong>Your suggested labels:</strong> '+escapeHtml(build.suggestedType)+' / '+build.suggestedTritype+' before any manual overrides. '+(build.cognitiveSource==='functions'?'The inferred four letters are a game-compatible summary of the function contrasts, not a Sakinorva result. A chosen type override changes the cognitive polarity used for Nature scoring and archetype interpretation, but does not overwrite the original function strengths. '+(build.identityPreference?'Your '+escapeHtml(build.identityPreference)+' label supplies a categorical identity proxy. ':'No A/T classification was supplied. '):'')+'These are interpretations, not clinical findings.</p>'+
      '</details>'+warningHtml+
      '<div class="result-actions"><button type="button" id="download-card" class="outline-button primary-export">Download Personality Card ↓</button>'+ 
      '<button type="button" id="download-trained-card" class="outline-button trained-export">Download Trained Build ↓</button>'+
      '<button type="button" id="copy-build" class="outline-button">Copy build ↗</button>'+
      '<button type="button" id="share-build" class="outline-button">Copy share link ↗</button></div>'+
    '</div>'+
    '<footer class="build-version-footer" id="build-version-footer">'+escapeHtml(cardVersionFooter(build))+'</footer>'+
    '</article>';
  $('result-status').classList.add('ready');
  $('result-status').innerHTML='<span></span> '+(state.isSample?'RANDOM SAMPLE':'BUILD COMPLETE');
  const setStatView=mode=>{
    const showAffinity=mode==='affinity';
    $('stat-view-bst-panel').hidden=showAffinity;
    $('stat-view-affinity-panel').hidden=!showAffinity;
    $('stat-view-bst').classList.toggle('active',!showAffinity);
    $('stat-view-affinity').classList.toggle('active',showAffinity);
    $('stat-view-bst').setAttribute('aria-pressed',String(!showAffinity));
    $('stat-view-affinity').setAttribute('aria-pressed',String(showAffinity));
  };
  $('stat-view-bst').addEventListener('click',()=>setStatView('bst'));
  $('stat-view-affinity').addEventListener('click',()=>setStatView('affinity'));
  $('download-card').addEventListener('click',async()=>{
    const button=$('download-card');
    if(button.disabled)return;
    button.disabled=true;
    button.textContent='Preparing PNG…';
    try {
      await downloadCardPng(build);
      showToast('PNG card ready to save or share.');
    } catch(error) {
      showToast(error.message||'Could not download the card.');
    } finally {
      button.disabled=false;
      button.textContent='Download Personality Card ↓';
    }
  });
  $('download-trained-card').addEventListener('click',async()=>{
    const button=$('download-trained-card');
    if(button.disabled)return;
    button.disabled=true;
    button.textContent='Preparing trained PNG…';
    try {
      // Snapshot the current allocation at click time; the export never derives it from base stats.
      await downloadTrainedCardPng(build, state.lastTrainingEvs);
      showToast('Trained build PNG ready to save or share.');
    } catch(error) {
      showToast(error.message||'Could not download the trained card.');
    } finally {
      button.disabled=false;
      button.textContent='Download Trained Build ↓';
    }
  });
  $('held-item-sprite')?.addEventListener('error',event=>event.currentTarget.remove());
  $('copy-build').addEventListener('click',()=>copyText(buildSummary(build),'Build copied.'));
  $('share-build').addEventListener('click',()=>copyShareLink());
  // Training remains separate from identity; users may export either card.
  renderTrainingPanel(build,$('result-container'),{
    initialEvs:state.lastTrainingEvs,
    onChange:evs=>{state.lastTrainingEvs=evs;}
  });
  // Optional real-Pokémon comparisons load only after the base build is complete.
  void renderRelatives(build,$('result-container'));
}
function buildSummary(b) {
  return [
    'TYPE EFFECTIVELY — '+b.title,
    b.identity+' · '+b.tritype+' · '+b.types.join(' / ')+' · '+b.nature,
    'Role: '+b.role.primary.name+(b.role.secondary?' / '+b.role.secondary.name:''),
    'BST 535: '+STAT_KEYS.map((k,i)=>STAT_NAMES[i]+' '+b.baseStats[k]).join(' · '),
    'Ability: '+b.ability.name+' · Hidden: '+b.hiddenAbility,
    'Held item: '+b.heldItem.name+' — '+b.heldItem.quip,
    'Moves: '+b.moves.map(m=>m.name).join(' / '),
    'Version: '+cardVersionFooter(b),
    'Unofficial personality Pokémon, not scientific assessment.'
  ].join('\n');
}
async function copyText(value,message) {
  try {
    await navigator.clipboard.writeText(value);showToast(message);
  } catch {
    const field=document.createElement('textarea');field.value=value;field.style.position='fixed';field.style.opacity='0';
    document.body.append(field);field.select();
    const worked=document.execCommand('copy');field.remove();
    showToast(worked?message:'Copy unavailable. Try a secure HTTPS connection.');
  }
}
function copyShareLink() {
  if(!state.lastInput)return;
  const payload={version:1,buildVersion:state.lastBuild?.createdVersion||null,mode:{mbti:state.mbtiMode,ennea:state.enneaMode,testing:state.testMode},input:state.lastInput,sample:state.isSample,trainingEvs:state.lastTrainingEvs};
  const hash='#build='+encodeURIComponent(JSON.stringify(payload));
  const url=location.origin+location.pathname+location.search+hash;
  copyText(url,'Link copied. Anyone with it can view these personality scores.');
}
function showToast(message) {
  const node=$('toast');node.textContent=message;node.classList.add('visible');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('visible'),3200);
}
function setError(message) {
  $('form-error').textContent=message;
  $('form-error').classList.toggle('hidden',!message);
}
function clearIncompleteResult() {
  state.lastBuild=null;state.lastInput=null;state.lastTrainingEvs=null;state.isSample=false;
  $('result-container').innerHTML='<div class="empty-state"><div class="empty-orb"><span class="empty-core">?</span></div><div class="empty-overline">THREE TESTS REQUIRED</div><h3>Build incomplete.</h3><p>Enter cognitive style, Enneagram, and Big Five results to generate your Pokémon.</p><div class="empty-detail">AWAITING ALL THREE REPORTS <span class="blink-cursor">_</span></div></div>';
  $('result-status').classList.remove('ready');
  $('result-status').innerHTML='<span></span> INCOMPLETE';
}
function runBuild(scroll=true,isSample=false,sharedVersion=undefined) {
  try {
    const input=collectInput();
    const build=generateCompleteBuild(input);
    build.renderVersion=activeBuildVersion();
    build.restoredFromShare=sharedVersion!==undefined;
    build.createdVersion=build.restoredFromShare?normalizeBuildVersion(sharedVersion):build.renderVersion;
    state.isSample=isSample;
    if(sharedVersion===undefined)state.lastTrainingEvs=null;
    state.lastBuild=build;state.lastInput=input;setError('');renderCard(build);
    if(scroll&&window.matchMedia('(max-width: 850px)').matches) $('result-container').scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }catch(error){
    clearIncompleteResult();
    setError(error.message||'Unable to generate this build.');
    return false;
  }
}
function clearAll() {
  setScores('mbti',[50,50,50,50,50]);
  FUNCTION_KEYS.forEach((_,i)=>{$('function-'+i).value='';});
  setScores('ennea',[50,50,50,50,50,50,50,50,50]);
  Array.from({length:9},(_,i)=>$('rowe-'+i)).forEach(el=>{el.value='';});
  setScores('bigfive',[50,50,50,50,50]);
  resetFacetFields();
  $('bigfive-facet-panel').open=false;
  state.touched={mbti:false,functions:false,enneagram:false,rowe:false,bigfive:false};
  $('mbti-override').value='';$('function-identity').value='';
  $('tritype-override').value='';$('ennea-ranking').value='';$('wing-override').value='';
  setTestingPath('quick');setMode('ennea','scores');
  state.lastBuild=null;state.lastInput=null;state.isSample=false;state.lastTrainingEvs=null;
  $('result-container').innerHTML='<div class="empty-state"><div class="empty-orb"><span class="empty-core">?</span></div><div class="empty-overline">NO DATA, NO DRAMA</div><h3>Something\'s evolving.</h3><p>Enter your personality details to discover the Pokémon they create.</p><div class="empty-detail">AWAITING TRAINER DATA <span class="blink-cursor">_</span></div></div>';
  $('result-status').classList.remove('ready');
  $('result-status').innerHTML='<span></span> WAITING';
  setError('');
  history.replaceState(null,'',location.pathname+location.search);
}
function restoreShared() {
  if(!location.hash.startsWith('#build='))return;
  try {
    const payload=JSON.parse(decodeURIComponent(location.hash.slice(7)));
    if(payload.version!==1||!payload.input||!payload.mode) return;
    const input=payload.input;
    if(input.mbtiScores){setScores('mbti',input.mbtiScores);state.touched.mbti=true;}
    if(input.functionScores){
      if(!Array.isArray(input.functionScores)||input.functionScores.length!==8) throw new Error('Invalid function scores.');
      input.functionScores.forEach((value,i)=>{$('function-'+i).value=String(value);});
      state.touched.functions=true;
    }
    if(input.enneagramScores){setScores('ennea',input.enneagramScores);state.touched.enneagram=true;}
    if(input.enneagramRanking){$('ennea-ranking').value=input.enneagramRanking.join(' ');state.touched.enneagram=true;}
    if(input.roweScores){
      if(!Array.isArray(input.roweScores)||input.roweScores.length!==9) throw new Error('Invalid Rowe scores.');
      input.roweScores.forEach((value,i)=>{$('rowe-'+i).value=String(value);});
      state.touched.rowe=true;
    }
    if(input.bigFive){setScores('bigfive',input.bigFive);state.touched.bigfive=true;}
    if(input.bigFiveFacets){
      validateFacetScores(input.bigFiveFacets);
      input.bigFiveFacets.forEach((value,i)=>{$('facet-'+i).value=value==null?'':String(value);});
      $('bigfive-facet-panel').open=true;
      updateFacetEntryStatus();
    }
    $('mbti-override').value=input.typeOverride||'';
    $('function-identity').value=input.functionScores&&['A','T'].includes(input.identityPreference)?
      input.identityPreference:'';
    $('tritype-override').value=input.tritypeOverride||'';
    setTestingPath(payload.mode.testing==='advanced'?'advanced':'quick',false);
    setMode('mbti',input.functionScores?'functions':'scores');
    setMode('ennea',input.roweScores?'rowe':['scores','ranking','rowe'].includes(payload.mode.ennea)?payload.mode.ennea:'scores');
    updateDerived();$('wing-override').value=input.wingOverride||'';
    state.lastTrainingEvs=payload.trainingEvs;
    if(runBuild(false,payload.sample===true,payload.buildVersion??null))
      showToast(payload.sample===true?'Random sample restored. Its generated scores are in the link.':'Shared build loaded. These scores are visible in the link.');
    else showToast('This shared build is missing required test results; enter all three sections.');
  }catch {showToast('That shared build link could not be read.');}
}
// Generate synthetic scores, show them in the editable form, and immediately
// render the same actual build engine used for manual input. Repeated clicks
// sample new combinations without navigating away from the result column.
function randomizeBuild() {
  const input=generateRandomBuildInput();
  setTestingPath('quick');
  FUNCTION_KEYS.forEach((_,i)=>{$('function-'+i).value='';});
  Array.from({length:9},(_,i)=>$('rowe-'+i)).forEach(el=>{el.value='';});
  setMode('mbti','scores');
  setMode('ennea','scores');
  setScores('mbti',input.mbtiScores);
  setScores('ennea',input.enneagramScores);
  setScores('bigfive',input.bigFive);
  resetFacetFields();
  $('bigfive-facet-panel').open=false;
  state.touched={mbti:true,functions:false,enneagram:true,rowe:false,bigfive:true};
  $('mbti-override').value='';
  $('function-identity').value='';
  $('tritype-override').value='';
  $('wing-override').value='';
  $('ennea-ranking').value='';
  updateDerived();
  // A previous share-link hash must not continue advertising a different build.
  history.replaceState(null,'',location.pathname+location.search);
  runBuild(false,true);
}

function init() {
  setupFields();
  document.querySelectorAll('[data-test-mode]').forEach(button=>button.addEventListener('click',()=>setTestingPath(button.dataset.testMode)));
  setTestingPath('quick',false);
  document.querySelectorAll('[data-mbti-mode]').forEach(button=>button.addEventListener('click',()=>setMode('mbti',button.dataset.mbtiMode)));
  document.querySelectorAll('[data-ennea-mode]').forEach(button=>button.addEventListener('click',()=>setMode('ennea',button.dataset.enneaMode)));
  $('build-form').addEventListener('submit',event=>{event.preventDefault();runBuild();});
  $('reset-button').addEventListener('click',clearAll);
  $('randomize-button').addEventListener('click',randomizeBuild);
  document.addEventListener('type-effectively:release-version',event=>{
    refreshPublishedBuildVersion(event.detail?.version);
  });
  updateDerived();
  restoreShared();
}
init();
