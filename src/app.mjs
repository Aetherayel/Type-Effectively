import {
  ENNEAGRAM_NAMES, NATURE_BY_MBTI, OCEAN_LABELS,
  ROLE_DESCRIPTIONS, STAT_KEYS, STAT_NAMES, TEST_LINKS, TYPE_COLORS
} from './data.mjs?v=1.2.0';
import { deriveMbti, deriveTritype, generateBuild, isValidTritype, normalizeRoweScores } from './engine.mjs?v=1.2.0';
import { FUNCTION_KEYS, deriveFunctionPreferences } from './functions.mjs';
import { renderStatRadar } from './radar.mjs';
import { renderRelatives } from './relatives-ui.mjs';
import { getDefensiveMatchups } from './matchups.mjs';
import { downloadCardPng } from './export-card.mjs?v=role-emblems-1';
import { itemSpriteUrl } from './item-sprites.mjs';
import { generateRandomBuildInput } from './random-build.mjs';
import { renderLiveCornerArtwork, renderLiveRoleWatermark } from './card-art.mjs?v=role-emblems-1';
import { cardVersionFooter, normalizeBuildVersion } from './build-version.mjs';

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
const state={mbtiMode:'scores',enneaMode:'scores',testMode:'quick',touched:{mbti:false,functions:false,enneagram:false,rowe:false,bigfive:false},lastBuild:null,lastInput:null,isSample:false};
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
    ['bigfive',advanced?TEST_LINKS.ipipneo300:TEST_LINKS.bigfive,advanced?'Take the IPIP-NEO-300 test ↗':'Take the free Ocean Test ↗',advanced?'300 questions · domain percentiles':'50 questions · free scores']
  ];
  entries.forEach(([key,href,title,detail])=>{
    const link=$(key+'-test-link');
    link.href=href; link.textContent=title;
    $(key+'-test-detail').textContent=detail;
  });
  $('assessment-note').textContent=advanced?
    'Longer questionnaires offer more detail, not guaranteed accuracy. Use comparable function totals, nine Enneagram scores, and five Big Five domain percentiles.':
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
  const typeSelect=$('mbti-override');
  Object.keys(NATURE_BY_MBTI).sort().forEach(type=>{
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
      'Eight cognitive functions, entered directly. Their contrasts influence stats and classification without adding a second scoring engine.':
      'Five 16Personalities dimensions. Yes, we kept the percentages. They actually do something here.';
    $('mbti-derived').textContent=mode==='type'?'Select the four-letter type you identify with. We will use estimated percentage scores where needed.':'Your percentages determine the suggested type. You can override it below.';
    $('mbti-override').options[0].textContent=mode==='type'?'Choose a type…':
      mode==='functions'?'Use function-derived suggestion':'Auto-detect from scores';
  } else {
    $('ennea-score-fields').classList.toggle('hidden',mode!=='scores');
    $('ennea-ranking-fields').classList.toggle('hidden',mode!=='ranking');
    $('ennea-score-help').classList.toggle('hidden',mode!=='scores');
    $('rowe-score-fields').classList.toggle('hidden',mode!=='rowe');
    $('rowe-score-help').classList.toggle('hidden',mode!=='rowe');
    $('tritype-override').placeholder=mode==='tritype'?'Required, e.g. 593':'e.g. 593';
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
  if(state.enneaMode==='tritype'||(state.enneaMode==='rowe'?!state.touched.rowe:!state.touched.enneagram)) return '';
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
        ' · Nature: '+NATURE_BY_MBTI[override||suggested]+
        ' · '+(selectedAT?'Identity: '+selectedAT+' (estimated strength)':'A/T not provided')
      : (override?'Selected type: '+override+' · ':'')+
        'Enter all eight overall function totals to infer a game-compatible preference.'):
    override?'Selected: '+override+(suggested && suggested!==override?' · test-derived suggestion: '+suggested:''):
    suggested?'Suggested type: '+suggested+' · Nature: '+NATURE_BY_MBTI[suggested]:
    state.mbtiMode==='type'?'Choose your four-letter type above to continue.':'Enter your percentages to infer your type, or choose an override.';

  const tritypeOverride=$('tritype-override').value.trim();
  const derived=inferredTritype();
  $('ennea-derived').textContent=tritypeOverride
    ? 'Selected tritype: '+tritypeOverride+(derived&&derived!==tritypeOverride?' · score-derived suggestion: '+derived:'')
    : derived?'Suggested tritype: '+derived
    : state.enneaMode==='ranking'?'Enter a complete ranking of all nine types.':
    state.enneaMode==='rowe'?'Enter the nine signed raw totals from your Rowe report.':
    state.enneaMode==='tritype'?'Enter your three-number tritype above.':'Add your nine scores or an override to determine your tritype.';

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
  if(!mbtiScores&&!typeOverride&&!functionScores) throw new Error('Please enter your 16Personalities scores, a four-letter type, or eight function scores.');
  let enneagramScores=null,enneagramRanking=null,roweScores=null;
  if(state.enneaMode==='scores'&&state.touched.enneagram) enneagramScores=readScores('ennea',9);
  if(state.enneaMode==='rowe') roweScores=readRoweScores();
  if(state.enneaMode==='ranking'){
    enneagramRanking=parseRanking();
    if(!enneagramRanking) throw new Error('Your ranking must contain each digit 1–9 exactly once.');
  }
  if(!enneagramScores&&!enneagramRanking&&!roweScores&&!tritypeOverride) throw new Error('Enter Enneagram scores, Rowe raw totals, a complete ranking, or a valid tritype.');
  return {
    mbtiScores,typeOverride,functionScores,identityPreference,enneagramScores,enneagramRanking,roweScores,tritypeOverride,
    wingOverride:$('wing-override').value,
    bigFive:state.touched.bigfive?readScores('bigfive',5):null
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
      '<div class="stat-visual">'+roleWatermark+renderStatRadar(build.baseStats,build.effectiveStats)+
      '</div>'+
      '<p class="nature-summary"><strong>'+escapeHtml(build.nature)+' Nature</strong> · +10% '+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(build.natureBoost)])+' · −10% '+escapeHtml(STAT_NAMES[STAT_KEYS.indexOf(build.natureDrop)])+'</p>'+
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
        '<p><strong>535 base points:</strong> 70% Big Five, 20% nine Enneagram scores, and 10% cognitive preference dimensions'+(build.cognitiveSource==='functions'?' derived from eight comparable function totals':' from 16Personalities')+' determine stat affinities. The six stats are bounded and normalized to exactly 535. '+escapeHtml(build.nature)+' then applies ±10% to two non-HP stats.</p>'+
        (build.enneagramSource==='rowe' ? '<p><strong>Rowe source:</strong> Signed raw Enneagram totals were translated into within-profile game affinities with a minimum 50-point reference span. This preserves relative gaps and ties; it is not a percentile or a validated comparison against Find My Nine. Rowe subtype values currently do not alter the build.</p>' : '')+
        '<p><strong>Battle role:</strong> 80% similarity to role stat targets, 20% type toolkit affinity. Slot three is a mechanically eligible role tactic; slot four is a corrective Enneagram growth move. Both are chosen together, not necessarily from any official species learnset.</p>'+
        (build.signatureStrategy?'<p><strong>Signature strategy:</strong> '+escapeHtml(build.signatureStrategy.name)+' qualifies through its visible type, battle role, stat gates, motivation patterns, and (when supplied) Big Five profile. Its '+escapeHtml(build.signatureStrategy.ability)+' Ability, '+escapeHtml(build.signatureStrategy.tactic)+' tactic and '+escapeHtml(build.signatureStrategy.item)+' item form one compatible package; the growth-move slot remains independent. Other builds retain the normal selection algorithm.</p>':'')+
        '<p><strong>Archetype:</strong> 36 authored identities (six operating styles × six battle expressions). Candidates combine 25% Enneagram motivation, 20% MBTI-style cognitive preference, 25% Big Five temperament, and 30% battle-role fit. Battle fit already includes stat shape and visible typing. Best score wins; this is a playful classification, not a measured personality likelihood.</p>'+
        '<p><strong>Held item:</strong> One of 72 real Pokémon held items selected by Enneagram core and fixes, Big Five tendencies, battle role, and deterministic profile matching. Item candidates are filtered for compatibility with the generated typing and selected moves. They remain thematic and do not modify calculated stats or type matchups.</p>'+
        '<p><strong>Your suggested labels:</strong> '+escapeHtml(build.suggestedType)+' / '+build.suggestedTritype+' before any manual overrides. '+(build.cognitiveSource==='functions'?'The inferred four letters are a game-compatible summary of the function contrasts, not a Sakinorva result. A chosen type override changes Nature and archetype interpretation but does not overwrite the original function strengths. '+(build.identityPreference?'Your '+escapeHtml(build.identityPreference)+' label supplies a categorical identity proxy. ':'No A/T classification was supplied. '):'')+'These are interpretations, not clinical findings.</p>'+
      '</details>'+warningHtml+
      '<div class="result-actions"><button type="button" id="download-card" class="outline-button primary-export">Download card ↓</button>'+
      '<button type="button" id="copy-build" class="outline-button">Copy build ↗</button>'+
      '<button type="button" id="share-build" class="outline-button">Copy share link ↗</button></div>'+
    '</div>'+
    '<footer class="build-version-footer" id="build-version-footer">'+escapeHtml(cardVersionFooter(build))+'</footer>'+
    '</article>';
  $('result-status').classList.add('ready');
  $('result-status').innerHTML='<span></span> '+(state.isSample?'RANDOM SAMPLE':'BUILD COMPLETE');
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
      button.textContent='Download card ↓';
    }
  });
  $('held-item-sprite')?.addEventListener('error',event=>event.currentTarget.remove());
  $('copy-build').addEventListener('click',()=>copyText(buildSummary(build),'Build copied.'));
  $('share-build').addEventListener('click',()=>copyShareLink());
  // Optional real-Pokémon comparisons load only after the base build is complete.
  void renderRelatives(build,$('result-container'));
}
function buildSummary(b) {
  return [
    'TYPE EFFECTIVELY — '+b.title,
    b.identity+' · '+b.tritype+' · '+b.types.join(' / ')+' · '+b.nature,
    'Role: '+b.role.primary.name+(b.role.secondary?' / '+b.role.secondary.name:''),
    ...(b.signatureStrategy?['Signature strategy: '+b.signatureStrategy.name+' — '+b.signatureStrategy.mechanism]:[]),
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
  const payload={version:1,buildVersion:state.lastBuild?.createdVersion||null,mode:{mbti:state.mbtiMode,ennea:state.enneaMode,testing:state.testMode},input:state.lastInput,sample:state.isSample};
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
function runBuild(scroll=true,isSample=false,sharedVersion=undefined) {
  try {
    const input=collectInput();
    const build=generateBuild(input);
    build.renderVersion=activeBuildVersion();
    build.restoredFromShare=sharedVersion!==undefined;
    build.createdVersion=build.restoredFromShare?normalizeBuildVersion(sharedVersion):build.renderVersion;
    state.isSample=isSample;
    state.lastBuild=build;state.lastInput=input;setError('');renderCard(build);
    if(scroll&&window.matchMedia('(max-width: 850px)').matches) $('result-container').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){setError(error.message||'Unable to generate this build.');}
}
function clearAll() {
  setScores('mbti',[50,50,50,50,50]);
  FUNCTION_KEYS.forEach((_,i)=>{$('function-'+i).value='';});
  setScores('ennea',[50,50,50,50,50,50,50,50,50]);
  Array.from({length:9},(_,i)=>$('rowe-'+i)).forEach(el=>{el.value='';});
  setScores('bigfive',[50,50,50,50,50]);
  state.touched={mbti:false,functions:false,enneagram:false,rowe:false,bigfive:false};
  $('mbti-override').value='';$('function-identity').value='';
  $('tritype-override').value='';$('ennea-ranking').value='';$('wing-override').value='';
  setTestingPath('quick');setMode('ennea','scores');
  state.lastBuild=null;state.lastInput=null;state.isSample=false;
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
    $('mbti-override').value=input.typeOverride||'';
    $('function-identity').value=input.functionScores&&['A','T'].includes(input.identityPreference)?
      input.identityPreference:'';
    $('tritype-override').value=input.tritypeOverride||'';
    setTestingPath(payload.mode.testing==='advanced'?'advanced':'quick',false);
    setMode('mbti',input.functionScores?'functions':payload.mode.mbti==='type'?'type':'scores');
    setMode('ennea',input.roweScores?'rowe':['scores','ranking','tritype','rowe'].includes(payload.mode.ennea)?payload.mode.ennea:'scores');
    updateDerived();$('wing-override').value=input.wingOverride||'';
    runBuild(false,payload.sample===true,payload.buildVersion??null);
    showToast(payload.sample===true?'Random sample restored. Its generated scores are in the link.':'Shared build loaded. These scores are visible in the link.');
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
