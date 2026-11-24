import {
  ABILITIES, CENTERS, ENNEAGRAM_AFFINITIES, ENNEAGRAM_NAMES, GROWTH_MOVES,
  MOVE_SYNERGIES, MOVE_PURPOSES, ROLE_PURPOSES, MBTI_TYPES, NATURE_EFFECTS, OCEAN_KEYS,
  GENERATED_TYPES, TYPE_AFFINITY, ROLE_AFFINITIES, ROLE_DESCRIPTIONS, ROLE_MOVES, ROLE_NAMES,
  ROLE_CALIBRATED_TEMPLATES, BASE_STAT_WEIGHTS, ENNEAGRAM_STAT_BASELINE, STAT_KEYS, TYPE_ATTACKS
} from './data.mjs?v=v2-complete-stable-3';
import { chooseHeldItem } from './held-items.mjs?v=v2-complete-stable-3';
import { classifyArchetype } from './archetypes.mjs';
import { classifyNature } from './nature.mjs';
import { classifyRole } from './roles.mjs';
import { composeFieldReport } from './profile-analysis.mjs?v=signature-copy-29';
import { deriveFunctionPreferences, deriveFunctionStatAffinities } from './functions.mjs';
import { refineBigFiveAffinities, facetContrastMap } from './bigfive-facets.mjs';
import { selectSignatureStrategy, signatureAbility, signatureHeldItem } from './strategies.mjs?v=signature-copy-29';

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const average = xs => xs.reduce((a,b) => a+b, 0) / xs.length;
const round = n => Math.round(n);
// Scores describe motivational resonance, not trait likelihood. A type is
// selected independently at each layer, allowing real monotype convergence.
const strongestType=(sources,excluded=[])=>{
  return GENERATED_TYPES
    .filter(type=>!excluded.includes(type))
    .map(type=>({
      type,
      score:sources.reduce((sum,[enneagram,weight])=>
        sum + weight*TYPE_AFFINITY[enneagram][type],0)
    }))
    .sort((a,b)=>b.score-a.score ||
      GENERATED_TYPES.indexOf(a.type)-GENERATED_TYPES.indexOf(b.type))[0].type;
};

// Primary: core identity (88%) and an evidenced wing (12%).
// Secondary: second fix (65%), third fix (30%), core (5%).
// Hidden: third fix (60%), second fix (30%), wing (10%),
//         excluding visible types. Unknown wings use 70% third/30% second.
export function deriveTyping({core,second,third,wing=null}) {
  if(!isValidTritype(String(core)+String(second)+String(third)))
    throw new Error('Typing requires one Enneagram fix from each center.');
  if(wing!=null && ![core===1?9:core-1,core===9?1:core+1].includes(wing))
    throw new Error('Typing wing must be adjacent to the core.');

  const primary=strongestType(
    wing==null ? [[core,1]] : [[core,.88],[wing,.12]]
  );
  const secondary=strongestType([[second,.65],[third,.30],[core,.05]]);
  const types=[...new Set([primary,secondary])];
  const hiddenType=strongestType(
    wing==null ? [[third,.70],[second,.30]] :
      [[third,.60],[second,.30],[wing,.10]],types
  );
  return {types,hiddenType};
}

export function deriveMbti(scores) {
  if (!Array.isArray(scores) || scores.length !== 5 || scores.some(n => !Number.isFinite(n) || n < 0 || n > 100)) {
    throw new Error('Five 16Personalities scores between 0 and 100 are required.');
  }
  return (scores[0] >= 50 ? 'I':'E') +
    (scores[1] >= 50 ? 'N':'S') +
    (scores[2] >= 50 ? 'F':'T') +
    (scores[3] >= 50 ? 'P':'J');
}

export function isValidTritype(value) {
  if (!/^[1-9]{3}$/.test(String(value))) return false;
  const nums = [...String(value)].map(Number);
  return new Set(nums).size === 3 &&
    Object.values(CENTERS).every(center => nums.filter(n=>center.includes(n)).length === 1);
}

export function deriveTritype(scores) {
  if (!Array.isArray(scores) || scores.length !== 9 || scores.some(n=>!Number.isFinite(n)||n<0||n>100)) {
    throw new Error('Nine Enneagram scores between 0 and 100 are required.');
  }
  const winners = Object.values(CENTERS).map(center =>
    [...center].sort((a,b)=>scores[b-1]-scores[a-1] || a-b)[0]
  );
  return winners.sort((a,b)=>scores[b-1]-scores[a-1] || a-b).join('');
}

// Rowe's nine type totals can be signed. Keep them distinct from the app's
// 0–100 scores; only their within-report relationships are comparable.
// The 50-point span floor damps small differences instead of inventing 0/100
// extremes. The 80-point output span is a game calibration, not a validated
// crosswalk to Find My Nine. All scores remain continuous, preserving ties.
export function normalizeRoweScores(raw) {
  if(!Array.isArray(raw) || raw.length!==9 ||
     raw.some(value=>typeof value!=='number' || !Number.isFinite(value)))
    throw new Error('Rowe results require nine finite numeric type scores (negative values are allowed).');
  const lowest=Math.min(...raw),highest=Math.max(...raw);
  const midpoint=(lowest+highest)/2;
  const referenceSpan=Math.max(50,highest-lowest);
  return raw.map(value=>clamp(50+80*(value-midpoint)/referenceSpan));
}

export function rankingToScores(ranking) {
  if (!Array.isArray(ranking) || ranking.length !== 9 ||
      new Set(ranking.map(Number)).size !== 9 || ranking.some(n=>!Number.isInteger(Number(n)) || +n < 1 || +n > 9)) {
    throw new Error('Enter each Enneagram type (1–9) exactly once in your ranking.');
  }
  const scores = Array(9).fill(0);
  ranking.map(Number).forEach((type, index) => { scores[type-1] = 100 - index*12; });
  return scores;
}

export function inferredEnneagramScores(tritype) {
  if (!isValidTritype(tritype)) throw new Error('A tritype must contain one type from each Enneagram center.');
  const scores = Array(9).fill(32);
  [...tritype].map(Number).forEach((n,i)=> { scores[n-1]=[96,81,69][i]; });
  return scores;
}

export function inferredMbtiScores(mbti) {
  if (!MBTI_TYPES.includes(mbti)) throw new Error('Choose a valid four-letter personality type.');
  return [
    mbti[0] === 'I' ? 75:25, mbti[1] === 'N'?75:25,
    mbti[2] === 'F'?75:25, mbti[3] === 'P'?75:25, 50
  ];
}

export function deriveWing(core, scores) {
  const before = core === 1 ? 9 : core-1;
  const after = core === 9 ? 1 : core+1;
  return scores[before-1] >= scores[after-1] ? before : after;
}

// Big Five is five broad domains feeding six different fictional strengths.
// Avoid equating low agreeableness with assertion or stress with battle Speed.
export function oceanAffinity(xs) {
  const [o,c,e,a,n] = xs;
  const stability=100-n;
  return [
    .55*c+.35*stability+.10*a,          // resilient persistence
    .45*e+.20*(100-a)+.35*c,            // assertion with follow-through
    .45*c+.30*(100-e)+.25*stability,    // maintaining boundaries
    .60*o+.20*c+.20*(100-e),           // conceptual ingenuity
    .65*stability+.20*a+.15*c,         // emotional regulation
    .45*e+.35*o+.20*(100-c)            // response tempo and flexibility
  ];
}
export function enneagramAffinity(scores) {
  // Square the weight above a soft threshold to preserve individual peaks without discarding the other six types.
  const weights = scores.map(s=>Math.pow(Math.max(0,s-20),2)+16);
  const total = weights.reduce((a,b)=>a+b,0);
  // Remove unequal nine-type column priors before blending sources. Uniform
  // motivational scores produce 50 on every stat; deviations retain their
  // original type-specific distances and meaningful differentiation.
  return STAT_KEYS.map((_,i)=>clamp(50+
    weights.reduce((sum,w,j)=>sum+w*ENNEAGRAM_AFFINITIES[j+1][i],0)/total-
    ENNEAGRAM_STAT_BASELINE[i]));
}
// Cognitive preferences are not capacities. Resilience and composure have
// weak cognitive proxies, deliberately shrunk toward 50. 16P A/T is excluded
// to avoid counting neuroticism again.
export function mbtiAffinity(s) {
  const [i,n,f,p] = s;
  const e=100-i, sensed=100-n, t=100-f, j=100-p;
  return [
    .35*j+.20*i+.45*50,
    .45*e+.35*t+.20*j,
    .45*j+.30*i+.25*t,
    .60*n+.25*t+.15*i,
    .35*i+.30*j+.35*50,
    .45*e+.35*p+.20*sensed
  ];
}

export function normalizeStats(affinities, total = 535, min = 45, max = 140) {
  if (affinities.length !== 6 || affinities.some(n=>!Number.isFinite(n))) throw new Error('Six numeric affinities required.');
  if (6*min > total || 6*max < total) throw new Error('Impossible stat bounds.');
  const mean = average(affinities);
  const raw = affinities.map(a=>total/6+1.25*(a-mean));
  // Project onto the fixed-total, bounded six-stat simplex. Unlike one-way
  // clipping, this handles cases where several bounds are hit together.
  let low=min-Math.max(...raw)-1;
  let high=max-Math.min(...raw)+1;
  for (let i=0;i<80;i++) {
    const middle=(low+high)/2;
    const candidate=raw.reduce((sum,value)=>sum+clamp(value+middle,min,max),0);
    if(candidate<total) low=middle; else high=middle;
  }
  const values=raw.map(v=>clamp(v+(low+high)/2,min,max));
  const integers=values.map(Math.floor);
  let remaining=total-integers.reduce((a,b)=>a+b,0);
  const ascending=values.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>a.f-b.f||b.i-a.i);
  const descending=[...ascending].reverse();
  if (remaining>0) {
    for(const {i} of descending) {
      if(!remaining)break;
      if(integers[i]<max){integers[i]++;remaining--;}
    }
  } else if (remaining<0) {
    for(const {i} of ascending) {
      if(!remaining)break;
      if(integers[i]>min){integers[i]--;remaining++;}
    }
  }
  if (remaining!==0) throw new Error('Could not normalize base stat total.');
  return Object.fromEntries(STAT_KEYS.map((k,i)=>[k,integers[i]]));
}

export function applyNature(baseStats,nature) {
  const effect=NATURE_EFFECTS[nature];
  if (!effect) throw new Error('Unknown Nature: '+nature);
  const result={...baseStats};
  result[effect[0]]=Math.floor(baseStats[effect[0]]*1.1);
  result[effect[1]]=Math.floor(baseStats[effect[1]]*0.9);
  return result;
}

// Standard and Hidden Abilities come from the same curated pool. Supporting
// Enneagram fixes affect the ranking, but cannot force an unrelated type.
const ABILITY_HINTS={
  1:['Sturdy','Clear Body','Pressure'],
  2:['Friend Guard','Regenerator','Natural Cure'],
  3:['Technician','Adaptability','Sheer Force'],
  4:['Infiltrator','Cursed Body','Serene Grace'],
  5:['Analytic','Pressure','Magic Guard'],
  6:['Sturdy','Unaware','Intimidate'],
  7:['Motor Drive','Speed Boost','Regenerator'],
  8:['Intimidate','Guts','Sheer Force'],
  9:['Regenerator','Sturdy','Unaware']
};

function abilityStatFit(item,stats) {
  if(item.name==='Analytic' && stats.spe<80)return 15;
  if(item.name==='Sturdy' && stats.def+stats.spd>=185)return 12;
  if(item.name==='Technician' && stats.spe>=90)return 12;
  if(item.name==='Speed Boost' && stats.spe>=100)return 12;
  if(item.name==='Ice Scales' && stats.spd>=95)return 12;
  return 0;
}

function chooseAbility(role,types,stats,secondFix) {
  const hints=ABILITY_HINTS[secondFix];
  const ranked=ABILITIES.filter(item=>!item.strategyOnly).map(item=>{
    let score=(item.roles.includes(role)?60:0)+
      (item.types.includes(types[0])?26:0)+
      (item.types.includes(types[1])?18:0);
    if(hints.includes(item.name))score+=18;
    score+=abilityStatFit(item,stats);
    return {...item,score};
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
  return ranked[0];
}

export function chooseHiddenAbility({role,secondaryRole=null,types,stats,second,third,standard}) {
  // The visible type constraint is strict: Fire/Fighting cannot receive
  // Sand Force, and Water/Ice cannot receive Solid Rock.
  const viable=ABILITIES.filter(item=>
    !item.strategyOnly && item.name!==standard.name && item.types.some(type=>types.includes(type))
  );
  if(!viable.length)throw new Error('No complementary Hidden Ability for visible typing.');
  return viable.map(item=>{
    let score=(item.roles.includes(role)?40:0)+
      (secondaryRole && item.roles.includes(secondaryRole)?12:0)+
      (item.types.includes(types[0])?38:0)+
      (types[1] && item.types.includes(types[1])?28:0)+
      (ABILITY_HINTS[second].includes(item.name)?14:0)+
      (ABILITY_HINTS[third].includes(item.name)?24:0)+
      abilityStatFit(item,stats);
    // Favor a distinct mechanism only after establishing type and role fit.
    if(item.roles.some(r=>!standard.roles.includes(r)))score+=5;
    return {...item,score};
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name))[0].name;
}

const MOVE_STAT_FIT={
  spe:['Agility','Flame Charge','Dragon Dance','Tailwind','Volt Switch','U-turn'],
  def:['Iron Defense','Reflect','Cotton Guard','Acid Armor','Stockpile','Bulk Up'],
  spd:['Light Screen','Amnesia','Calm Mind','Cosmic Power','Mist'],
  atk:['Swords Dance','Bulk Up','Drain Punch','Coil','Hone Claws'],
  spa:['Nasty Plot','Calm Mind','Charge Beam','Quiver Dance']
};
const PHYSICAL_ATTACKS=new Set(['Flame Charge','U-turn','Flip Turn','Drain Punch']);
const SPECIAL_ATTACKS=new Set(['Charge Beam','Volt Switch']);
const PHYSICAL_SETUP=new Set(['Swords Dance','Dragon Dance','Bulk Up','Hone Claws','Coil','Curse']);
const SPECIAL_SETUP=new Set(['Nasty Plot','Quiver Dance','Charge Beam']);

// Hard mechanical requirements precede any psychology-based move weighting.
// Moves are abstract signature moves, so species learnsets are not assumed.
export function isMoveEligible(name,{types,stats,role=null,ability=null}){
  if(name==='Curse' && types.includes('Ghost'))return false;
  // Snow must be supplied by the same four-move build, not assumed from teammates.
  // A signature Snow Warning set satisfies the weather prerequisite.
  const abilityName=typeof ability==='string'?ability:ability?.name;
  if(name==='Aurora Veil' &&
    (abilityName!=='Snow Warning'||!types.includes('Ice')))return false;
  // Trick Room reverses Speed order: do not give it to fast Pokémon.
  if(name==='Trick Room' && stats.spe>85)return false;
  // Shed Tail sacrifices half the user's HP and requires enough staying power.
  if(name==='Shed Tail' && stats.hp<92)return false;
  // Charge has a strongly Electric-dependent offensive effect.
  if(name==='Charge' && !types.includes('Electric'))return false;
  if(role==='Sweeper'){
    if(PHYSICAL_SETUP.has(name) && stats.atk+12<stats.spa)return false;
    if(SPECIAL_SETUP.has(name) && stats.spa+12<stats.atk)return false;
  }
  return true;
}

function scoreMove(name,types,stats,second,third) {
  const affinity=MOVE_SYNERGIES[name];
  if(!affinity)throw new Error('Missing move affinity: '+name);
  let score=(affinity.types.includes(types[0])?60:0)+
    (types[1] && affinity.types.includes(types[1])?36:0)+
    (affinity.fixes.includes(second)?21:0)+
    (affinity.fixes.includes(third)?11:0);
  for(const [key,moves] of Object.entries(MOVE_STAT_FIT)){
    if(moves.includes(name) && stats[key]>=100)score+=12;
  }
  if(PHYSICAL_ATTACKS.has(name) && stats.spa>stats.atk)
    score-=Math.min(35,Math.round((stats.spa-stats.atk)*.9));
  if(SPECIAL_ATTACKS.has(name) && stats.atk>stats.spa)
    score-=Math.min(35,Math.round((stats.atk-stats.spa)*.9));
  return score;
}

const MOVE_EFFECT_GROUPS={
  'Swords Dance':'attack-setup','Bulk Up':'attack-setup',
  'Coil':'attack-setup','Hone Claws':'attack-setup',
  'Work Up':'attack-setup','Dragon Dance':'attack-setup',
  'Nasty Plot':'special-setup','Quiver Dance':'special-setup',
  'Calm Mind':'special-setup','Growth':'special-setup',
  'Agility':'speed-setup','Tailwind':'speed-setup',
  'Rest':'recovery','Recover':'recovery','Aqua Ring':'recovery',
  'Light Screen':'screen','Reflect':'screen','Aurora Veil':'screen'
};

// Baton Pass is a growth/setup-transfer move, not a generic Pivot switch.
// It needs a transferable stat stage established by one of the other three
// moves or by the *active standard Ability*. Weather, screens, Tailwind and
// defensive typing bonuses do not create Baton Passable stat stages.
const BATON_PASS_SETUP_MOVES=new Set([
  'Swords Dance','Dragon Dance','Flame Charge','Agility','Hone Claws',
  'Nasty Plot','Calm Mind','Quiver Dance','Growth','Charge Beam','Work Up',
  'Iron Defense','Amnesia','Stockpile','Cotton Guard','Cosmic Power',
  'Acid Armor','Bulk Up','Coil','Curse','Charge'
]);
const BATON_PASS_SETUP_ABILITIES=new Set(['Speed Boost']);

export function hasBatonPassSetup({moves=[],ability=null}={}) {
  const abilityName=typeof ability==='string'?ability:ability?.name;
  return BATON_PASS_SETUP_ABILITIES.has(abilityName) ||
    moves.some(move=>BATON_PASS_SETUP_MOVES.has(typeof move==='string'?move:move.name));
}

// Duplicate defensive effects are invalid, not merely an affinity penalty.
// The growth slot should add new behavior rather than repeat an existing shield.
export function isMovePairCompatible(tactic,growth,{strategy=null,attacks=[],ability=null}={}) {
  if(tactic===growth)return false;
  if(growth==='Baton Pass' && !hasBatonPassSetup({moves:[...attacks,tactic],ability}))return false;
  if((tactic==='Aurora Veil' && ['Reflect','Light Screen'].includes(growth)) ||
     (growth==='Aurora Veil' && ['Reflect','Light Screen'].includes(tactic)))return false;
  if((tactic==='Trick Room' && ['Agility','Tailwind','Dragon Dance','Flame Charge'].includes(growth)) ||
     (growth==='Trick Room' && ['Agility','Tailwind','Dragon Dance','Flame Charge'].includes(tactic)))return false;
  // Repeating an active environment or curing the condition that enables the
  // specialization works against the chosen four-move plan.
  if(strategy?.ability==='Misty Surge' && growth==='Safeguard')return false;
  if(['Guts','Poison Heal'].includes(strategy?.ability) && growth==='Rest')return false;
  return true;
}

function roleTacticScore(name,role,types,stats,second,third) {
  let score=scoreMove(name,types,stats,second,third);
  // A close secondary role influences tactical expression without replacing
  // the declared primary role's functional contract.
  if(role.secondary && ROLE_MOVES[role.secondary.name].includes(name))score+=20;
  if(PHYSICAL_SETUP.has(name) && stats.atk>=stats.spa)score+=12;
  if(SPECIAL_SETUP.has(name) && stats.spa>=stats.atk)score+=12;
  if(name==='Trick Room')score+=Math.max(0,95-stats.spe)*.6;
  if(name==='Shed Tail')score+=Math.max(0,stats.hp-95)*.35;
  return score;
}

function chooseMoves(attackTypes,visibleTypes,role,stats,core,second,third,strategy=null,standardAbility=null) {
  const physical=stats.atk>=stats.spa;
  const style=physical?'physical':'special';
  const attacks=attackTypes.map(type=>{
    const move=TYPE_ATTACKS[type].find(entry=>entry[1]===style);
    return {name:move[0],category:style==='physical'?'Physical STAB':'Special STAB',
      why:'Its '+type+' typing is expressed through '+style+' offense.'};
  });
  // A few strategies earn one explicit attack substitution rather than only
  // changing their ability, role tactic and item. The other attack stays put.
  if(strategy?.attackSwap){
    const swap=strategy.attackSwap;
    const index=Number.isInteger(swap.slot)?swap.slot:attackTypes.indexOf(swap.type);
    if(index<0||index>1||swap.style!==style ||
       (swap.type && attackTypes[index]!==swap.type))
      throw new Error('Invalid signature attack substitution: '+strategy.id);
    attacks[index]={name:swap.move,
      category:swap.type?(style==='physical'?'Physical STAB':'Special STAB'):'Signature physical coverage',
      why:swap.why};
  }
  const selected=new Set(attacks.map(m=>m.name));
  if(selected.size!==2)throw new Error('Signature attack substitution duplicated an attack.');
  // A signature tactic belongs to the role that earned the package, even
  // when that is the close secondary role; the displayed primary is unchanged.
  const tacticRole=strategy?.matchedRole||role.primary.name;
  const validRole=ROLE_MOVES[tacticRole].filter(name=>
    !selected.has(name) &&
    (!strategy||name===strategy.tactic) &&
    MOVE_PURPOSES[name]?.includes(ROLE_PURPOSES[tacticRole]) &&
    isMoveEligible(name,{types:visibleTypes,stats,role:tacticRole,
      ability:strategy?.ability}));
  const growth=GROWTH_MOVES[core];
  const validGrowth=growth.choices.filter(name=>
    !selected.has(name) && isMoveEligible(name,{types:visibleTypes,stats}));
  if(!validRole.length || !validGrowth.length)
    throw new Error('No mechanically coherent role/growth moves for the build.');

  // Score pairs together, rather than greedily exhausting a fourth-slot choice.
  // Semantic growth eligibility is guaranteed by the curated core lesson pool.
  const pairs=[];
  for(const tactic of validRole)for(const growthName of validGrowth){
    if(!isMovePairCompatible(tactic,growthName,{
      strategy,attacks,ability:strategy?.ability||standardAbility
    }))continue;
    const roleScore=roleTacticScore(tactic,role,visibleTypes,stats,second,third);
    const growthScore=scoreMove(growthName,visibleTypes,stats,second,third);
    const duplicateEffect=MOVE_EFFECT_GROUPS[tactic] &&
      MOVE_EFFECT_GROUPS[tactic]===MOVE_EFFECT_GROUPS[growthName];
    const score=roleScore*.9+growthScore*.85-(duplicateEffect?45:0);
    pairs.push({tactic,growthName,score});
  }
  if(!pairs.length)throw new Error('No compatible tactical/growth move pair.');
  pairs.sort((a,b)=>b.score-a.score||
    a.tactic.localeCompare(b.tactic)||a.growthName.localeCompare(b.growthName));
  const {tactic,growthName}=pairs[0];
  return [
    ...attacks,
    {name:tactic,category:'Role tactic',
      why:'This '+tacticRole.toLowerCase()+' tactic reflects its visible typing, stats, and supporting motivations.'},
    {name:growthName,category:'Growth move',why:growth.reason}
  ];
}

// Rendering a Pokémon requires measured/detailed input for all three major
// frameworks. Keep the lower-level generator available for legacy/internal
// scoring tests, but never expose an inferred, incomplete build to visitors.
export function requireCompletePersonalityInputs(input) {
  if(!input||typeof input!=='object')throw new Error('Complete all three personality sections before generating.');
  if(input.mbtiScores==null && input.functionScores==null)
    throw new Error('Cognitive style is required: enter 16Personalities percentages or all eight cognitive-function results. A four-letter type alone is insufficient.');
  if(input.enneagramScores==null && input.enneagramRanking==null && input.roweScores==null)
    throw new Error('Enneagram results are required: enter nine scores, complete a nine-type ranking, or enter nine Rowe totals. A tritype alone is insufficient.');
  if(input.bigFive==null)
    throw new Error('Big Five results are required: enter all five domain scores before generating.');
  return input;
}
export function generateCompleteBuild(input) {
  return generateBuild(requireCompletePersonalityInputs(input));
}

export function generateBuild(input) {
  const warnings=[];
  const usingFunctions=input.functionScores!=null;
  if(usingFunctions && input.mbtiScores!=null)
    throw new Error('Choose cognitive-function scores or 16Personalities percentages, not both.');
  // A/T is not a cognitive function. When provided without a strength,
  // reuse the established type-only 75/25 estimate; otherwise stay neutral.
  const identityPreference=String(input.identityPreference??'').trim().toUpperCase();
  if(!usingFunctions && identityPreference)
    throw new Error('A/T identity preference can only accompany cognitive-function scores.');
  if(identityPreference && !['A','T'].includes(identityPreference))
    throw new Error('A/T identity preference must be Assertive (A) or Turbulent (T).');
  let mbtiScores=usingFunctions ? deriveFunctionPreferences(input.functionScores) : input.mbtiScores;
  if(usingFunctions && identityPreference)
    mbtiScores=[...mbtiScores.slice(0,4),identityPreference==='T'?75:25];
  const override=String(input.typeOverride||'').trim().toUpperCase().replace(/-[AT]$/,'');
  if (mbtiScores == null && !override) throw new Error('Enter your 16Personalities scores or choose a type.');
  if (mbtiScores == null) {
    mbtiScores=inferredMbtiScores(override);
    warnings.push('16Personalities percentages were estimated from your chosen type.');
  }
  const suggestedType=deriveMbti(mbtiScores);
  const mbti=override || suggestedType;
  if (!MBTI_TYPES.includes(mbti)) throw new Error('Invalid MBTI type.');
  if(usingFunctions) {
    warnings.push('Eight function totals directly inform base stat affinities; four derived preference contrasts inform the suggested type and Nature. Neither is Sakinorva’s typing algorithm.');
    if(identityPreference)
      warnings.push('The supplied '+identityPreference+' identity label uses the existing 75/25 type-only proxy for scoring; no measured A/T percentage was supplied.');
    else
      warnings.push('The A/T axis was not provided; its contribution is neutral and no A/T label was inferred.');
    if(override && override!==suggestedType)
      warnings.push('Your selected '+override+' type is used for Nature preference polarity and archetype interpretation; the function-derived '+suggestedType+' suggestion and raw eight-function stat affinities remain unchanged.');
  }

  const usingRowe=input.roweScores!=null;
  if(usingRowe && (input.enneagramScores!=null || input.enneagramRanking!=null))
    throw new Error('Use Rowe raw scores or conventional Enneagram scores/ranking, not both.');
  let enneaScores=usingRowe ? normalizeRoweScores(input.roweScores) : input.enneagramScores;
  if(usingRowe) warnings.push('Rowe signed totals were mapped to relative 0–100 game scores (50-point minimum reference span). These are not test percentages or calibrated to Find My Nine; subtype results are not yet modeled.');
  if (enneaScores == null && input.enneagramRanking) {
    enneaScores=rankingToScores(input.enneagramRanking);
    warnings.push('Enneagram ranking was converted into evenly spaced proxy scores.');
  }
  const tritypeOverride=String(input.tritypeOverride||'').trim();
  if (tritypeOverride && !isValidTritype(tritypeOverride)) throw new Error('Tritype must include one gut, one heart, and one head type.');
  if (enneaScores == null) {
    if (!tritypeOverride) throw new Error('Enter your Enneagram scores, ranking, or tritype.');
    enneaScores=inferredEnneagramScores(tritypeOverride);
    warnings.push('Enneagram scores were estimated from your chosen tritype.');
  }
  const suggestedTritype=deriveTritype(enneaScores);
  const tritype=tritypeOverride || suggestedTritype;
  const [core,second,third]=[...tritype].map(Number);
  const wingNeighbors=[core===1?9:core-1, core===9?1:core+1];
  const selectedWing=input.wingOverride==null||input.wingOverride==='' ? deriveWing(core,enneaScores) : Number(input.wingOverride);
  if (!wingNeighbors.includes(selectedWing)) throw new Error('Your wing must be adjacent to your core type.');

  const ocean=input.bigFive || [50,50,50,50,50];
  if (!Array.isArray(ocean) || ocean.length!==5 || ocean.some(n=>!Number.isFinite(n)||n<0||n>100)) {
    throw new Error('Big Five scores must contain five numbers from 0–100.');
  }
  if(input.bigFiveFacets!=null && input.bigFive==null)
    throw new Error('Enter all five Big Five domain scores before adding facet percentiles.');
  if (!input.bigFive) warnings.push('Big Five scores were set to neutral 50-point placeholders for base stats; Nature scoring excludes unmeasured Big Five.');
  // Nature scores a motivational/cognitive/temperamental *preference contrast*,
  // not raw stats or an already selected battle role. Run before role selection.
  const natureScoring=classifyNature({
    enneagramScores:enneaScores,core,second,third,mbtiScores,mbti,
    bigFive:input.bigFive??null,
    hasMeasuredCognition:usingFunctions||input.mbtiScores!=null
  });
  const nature=natureScoring.name;
  // Facets refine the *existing* Big Five source, not a fourth weighting.
  // Missing facet groups fall back to the original domain-only contribution.
  const facetScoring=refineBigFiveAffinities(ocean,oceanAffinity(ocean),input.bigFiveFacets);
  const facetContrasts=facetContrastMap(ocean,input.bigFiveFacets);
  const oa=facetScoring.affinities,ea=enneagramAffinity(enneaScores);
  // Use all eight measured functions when provided. The four contrasts remain
  // useful for Nature/identity, but are a lossy representation for base stats.
  const ma=usingFunctions?deriveFunctionStatAffinities(input.functionScores):
    mbtiAffinity(mbtiScores);
  // Stat-specific evidence strength. Functions retain eight distinct signals,
  // percentage inputs retain four measured contrasts, and type-only inputs
  // receive conservative cognitive weights because they use 75/25 proxies.
  const statWeightMode=usingFunctions?'functions':
    input.mbtiScores!=null?'percentages':'typeOnly';
  const statWeights=BASE_STAT_WEIGHTS[statWeightMode];
  const blend=STAT_KEYS.map((key,i)=>{
    const w=statWeights[key];
    return w.bigFive*oa[i]+w.enneagram*ea[i]+w.cognition*ma[i];
  });
  const baseStats=normalizeStats(blend);
  const effectiveStats=applyNature(baseStats,nature);
  // Do not let fabricated proxy scores supply a typing wing when the visitor
  // entered only a tritype. Explicit wing or actual scores/ranking can do so.
  const hasRealEnneagramInput=input.enneagramScores!=null || input.enneagramRanking!=null || usingRowe;
  const typingWing=(input.wingOverride!=null && input.wingOverride!=='') ||
    hasRealEnneagramInput ? selectedWing : null;
  const {types,hiddenType}=deriveTyping({core,second,third,wing:typingWing});
  const toolkitTypes=types.length===1?[types[0],types[0]]:types;
  // Identity is classified from base personality stats, not a Nature
  // modifier that changes two battle stats after the personality build.
  const role=classifyRole(baseStats,toolkitTypes);
  // A specialization is a joint ability / tactic / item package selected only
  // after visible typing, effective stats, role, motivations and temperament.
  // Ordinary generalist selection stays intact when no package earns its place.
  const signatureStrategy=selectSignatureStrategy({
    types,role,stats:effectiveStats,core,second,third,
    bigFive:ocean,hasBigFive:input.bigFive!=null
  });
  const ability=signatureStrategy?signatureAbility(signatureStrategy):
    chooseAbility(role.primary.name,toolkitTypes,effectiveStats,second);
  const hiddenAbility=chooseHiddenAbility({
    role:role.primary.name,secondaryRole:role.secondary?.name,
    types,stats:effectiveStats,second,third,standard:ability
  });
  const moveTypes=types.length===1?[types[0],hiddenType]:types;
  const moves=chooseMoves(moveTypes,types,role,effectiveStats,core,second,third,signatureStrategy,ability);
  if (types.length===1) moves[1].category=hiddenType+' coverage (hidden affinity)';
  // Item choice follows move choice: equipment must actually work with its
  // holder and the four signature moves.
  const heldItem=signatureStrategy?signatureHeldItem(signatureStrategy,{
    core,role,bigFive:ocean,hasBigFive:input.bigFive!=null
  }):
    chooseHeldItem({
      tritype,core,second,third,wing:selectedWing,
      enneagramScores:enneaScores,bigFive:ocean,mbtiScores,
      role,types,moves,ability,hasBigFive:input.bigFive!=null,facetContrasts
    });
  const identity=mbti + (usingFunctions ? (identityPreference?'-'+identityPreference:'') :
    input.mbtiScores ? (mbtiScores[4] >= 50?'-T':'-A') : '');
  const build={
    mbti, identity, nature, natureScoring, identityPreference:usingFunctions?(identityPreference||null):null,
    cognitiveSource:usingFunctions?'functions':'16personalities', enneagramSource:usingRowe?'rowe':'standard',
    // Keep only high/low OCEAN flags on the result; never expose raw Big Five scores in the PNG.
    // 1 = at least 50 (higher), 0 = below 50 (lower), null = unmeasured.
    oceanBinary:input.bigFive ? ocean.map(value=>value>=50 ? 1 : 0) : null,
    natureBoost:NATURE_EFFECTS[nature][0],natureDrop:NATURE_EFFECTS[nature][1],
    tritype, suggestedTritype, suggestedType, wing:selectedWing, typingWing,
    core, second, third, coreName:ENNEAGRAM_NAMES[core],title:'',
    types,hiddenType,monotype:types.length===1,ability,hiddenAbility,moves,role,heldItem,
    signatureStrategy,
    baseStats,effectiveStats,statWeightMode,statWeights,
    facetScoring:{
      activeDomains:facetScoring.activeDomains,
      corrections:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,round(facetScoring.corrections[i]*10)/10]))
    },
    affinities:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,round(blend[i])])),
    breakdown:{bigFive:oa,enneagram:ea,mbti:ma},
    warnings
  };
  // Archetype is a *summary* of the complete build, never an input to typing,
  // base stats, role, abilities, moves, or held-item selection.
  build.archetype=classifyArchetype({
    enneagramScores:enneaScores,mbtiScores,bigFive:ocean,
    mbti,core,second,third,role,facetContrasts
  });
  build.title=build.archetype.title;
  build.report=composeFieldReport(build,{bigFive:input.bigFive,mbtiScores,facetContrasts});
  return build;
}
