import {
  ABILITIES, CENTERS, ENNEAGRAM_AFFINITIES, ENNEAGRAM_NAMES, GROWTH_MOVES,
  MOVE_SYNERGIES, NATURE_BY_MBTI, NATURE_EFFECTS, OCEAN_KEYS,
  GENERATED_TYPES, TYPE_AFFINITY, ROLE_AFFINITIES, ROLE_DESCRIPTIONS, ROLE_MOVES, ROLE_NAMES,
  ROLE_TEMPLATES, STAT_KEYS, TYPE_ATTACKS
} from './data.mjs?v=move-coherence-1';
import { chooseHeldItem } from './held-items.mjs';

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
  if (!NATURE_BY_MBTI[mbti]) throw new Error('Choose a valid four-letter personality type.');
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

function oceanAffinity(xs) {
  const [o,c,e,a,n] = xs;
  const stability = 100 - n;
  return [
    .55*stability+.25*c+.2*a,
    .65*e+.35*(100-a),
    .60*c+.40*stability,
    .65*o+.35*c,
    .55*stability+.45*a,
    .50*e+.35*o+.15*n
  ];
}
function enneagramAffinity(scores) {
  // Square the weight above a soft threshold to preserve individual peaks without discarding the other six types.
  const weights = scores.map(s=>Math.pow(Math.max(0,s-20),2)+16);
  const total = weights.reduce((a,b)=>a+b,0);
  return STAT_KEYS.map((_,i)=>weights.reduce((sum,w,j)=>sum+w*ENNEAGRAM_AFFINITIES[j+1][i],0)/total);
}
function mbtiAffinity(s) {
  const [i,n,f,p,t] = s;
  const e = 100-i, j = 100-p, a = 100-t;
  return [
    .45*a+.35*j+.20*f,
    .50*e+.25*t+.25*(100-f),
    .55*j+.45*a,
    .55*n+.25*i+.20*j,
    .40*f+.30*i+.30*a,
    .45*e+.30*p+.25*t
  ];
}

export function normalizeStats(affinities, total = 535, min = 45, max = 140) {
  if (affinities.length !== 6 || affinities.some(n=>!Number.isFinite(n))) throw new Error('Six numeric affinities required.');
  if (6*min > total || 6*max < total) throw new Error('Impossible stat bounds.');
  const mean = average(affinities);
  const raw = affinities.map(a=>total/6+1.1*(a-mean));
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

function classifyRole(stats, types) {
  const vals=STAT_KEYS.map(k=>stats[k]);
  const normalized=vals.map(v=>v*535/vals.reduce((a,b)=>a+b,0));
  const scores=ROLE_NAMES.map((role, idx)=>{
    const target=ROLE_TEMPLATES[role];
    const physical=role==='Sweeper'||role==='Tank';
    const options=[target];
    if (physical) options.push([target[0],target[3],target[2],target[1],target[4],target[5]]);
    const rms=Math.min(...options.map(t=>Math.sqrt(average(normalized.map((v,i)=>(v-t[i])**2)))));
    const statFit=100*Math.exp(-(rms*rms)/(2*25*25));
    const toolkit=.55*ROLE_AFFINITIES[types[0]][idx]+.45*ROLE_AFFINITIES[types[1]][idx];
    return {name:role,score:round(.8*statFit+.2*toolkit),statFit:round(statFit),toolkit:round(toolkit)};
  }).sort((a,b)=>b.score-a.score || ROLE_NAMES.indexOf(a.name)-ROLE_NAMES.indexOf(b.name));
  const baseValues=STAT_KEYS.map(k=>stats[k]);
  const spread=Math.sqrt(average(baseValues.map(s=>(s-average(baseValues))**2)));
  return {
    primary:scores[0],secondary:scores[1].score>=scores[0].score-5?scores[1]:null,
    all:scores, specialization:spread<15?'Versatile':spread<25?'Focused':'Highly specialized',spread:round(spread)
  };
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
  const ranked=ABILITIES.map(item=>{
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
    item.name!==standard.name && item.types.some(type=>types.includes(type))
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
  spd:['Light Screen','Amnesia','Calm Mind','Cosmic Power','Aurora Veil','Mist'],
  atk:['Swords Dance','Bulk Up','Drain Punch','Coil','Hone Claws'],
  spa:['Nasty Plot','Calm Mind','Charge Beam','Trick Room','Quiver Dance']
};

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
  return score;
}

function chooseMove(pool,types,stats,second,third,excluded) {
  const viable=pool.filter(name=>!excluded.has(name));
  if(!viable.length)throw new Error('Not enough unique thematic moves.');
  return viable
    .map(name=>({name,score:scoreMove(name,types,stats,second,third)}))
    .sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name))[0].name;
}

function chooseMoves(attackTypes,visibleTypes,role,stats,core,second,third) {
  const physical=stats.atk>=stats.spa;
  const style=physical?'physical':'special';
  const attacks=attackTypes.map(type=>{
    const move=TYPE_ATTACKS[type].find(entry=>entry[1]===style);
    return {name:move[0],category:style==='physical'?'Physical STAB':'Special STAB',
      why:'Your '+type+' side expressed through '+style+' offense.'};
  });
  const selected=new Set(attacks.map(m=>m.name));
  const tactic=chooseMove(ROLE_MOVES[role][style],visibleTypes,stats,second,third,selected);
  selected.add(tactic);
  const growth=GROWTH_MOVES[core];
  const growthName=chooseMove(growth.choices,visibleTypes,stats,second,third,selected);
  return [
    ...attacks,
    {name:tactic,category:'Role tactic',
     why:'A '+role.toLowerCase()+' tactic shaped by your typing and supporting motivations.'},
    {name:growthName,category:'Growth move',why:growth.reason}
  ];
}

export function generateBuild(input) {
  const warnings=[];
  let mbtiScores=input.mbtiScores;
  const override=String(input.typeOverride||'').trim().toUpperCase().replace(/-[AT]$/,'');
  if (mbtiScores == null && !override) throw new Error('Enter your 16Personalities scores or choose a type.');
  if (mbtiScores == null) {
    mbtiScores=inferredMbtiScores(override);
    warnings.push('16Personalities percentages were estimated from your chosen type.');
  }
  const suggestedType=deriveMbti(mbtiScores);
  const mbti=override || suggestedType;
  if (!NATURE_BY_MBTI[mbti]) throw new Error('Invalid MBTI type.');
  const nature=NATURE_BY_MBTI[mbti];

  let enneaScores=input.enneagramScores;
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
  if (!input.bigFive) warnings.push('Big Five scores were set to neutral 50-point placeholders.');
  const oa=oceanAffinity(ocean), ea=enneagramAffinity(enneaScores), ma=mbtiAffinity(mbtiScores);
  const blend=STAT_KEYS.map((_,i)=>.7*oa[i]+.2*ea[i]+.1*ma[i]);
  const baseStats=normalizeStats(blend);
  const effectiveStats=applyNature(baseStats,nature);
  // Do not let fabricated proxy scores supply a typing wing when the visitor
  // entered only a tritype. Explicit wing or actual scores/ranking can do so.
  const hasRealEnneagramInput=input.enneagramScores!=null || input.enneagramRanking!=null;
  const typingWing=(input.wingOverride!=null && input.wingOverride!=='') ||
    hasRealEnneagramInput ? selectedWing : null;
  const {types,hiddenType}=deriveTyping({core,second,third,wing:typingWing});
  const toolkitTypes=types.length===1?[types[0],types[0]]:types;
  const role=classifyRole(effectiveStats,toolkitTypes);
  const ability=chooseAbility(role.primary.name,toolkitTypes,effectiveStats,second);
  const heldItem=chooseHeldItem({
    tritype,core,second,third,wing:selectedWing,
    enneagramScores:enneaScores,bigFive:ocean,mbtiScores,
    role,hasBigFive:input.bigFive!=null
  });
  const hiddenAbility=chooseHiddenAbility({
    role:role.primary.name,secondaryRole:role.secondary?.name,
    types,stats:effectiveStats,second,third,standard:ability
  });
  const moveTypes=types.length===1?[types[0],hiddenType]:types;
  const moves=chooseMoves(moveTypes,types,role.primary.name,effectiveStats,core,second,third);
  if (types.length===1) moves[1].category=hiddenType+' coverage (hidden affinity)';
  const identity=mbti + (input.mbtiScores ? (mbtiScores[4] >= 50?'-T':'-A') : '');
  const archetype={1:'Reformer',2:'Guardian',3:'Achiever',4:'Visionary',5:'Architect',6:'Sentinel',7:'Catalyst',8:'Vanguard',9:'Anchor'}[core];
  return {
    mbti, identity, nature,
    // Keep only high/low OCEAN flags on the result; never expose raw Big Five scores in the PNG.
    // 1 = at least 50 (higher), 0 = below 50 (lower), null = unmeasured.
    oceanBinary:input.bigFive ? ocean.map(value=>value>=50 ? 1 : 0) : null,
    natureBoost:NATURE_EFFECTS[nature][0],natureDrop:NATURE_EFFECTS[nature][1],
    tritype, suggestedTritype, suggestedType, wing:selectedWing, typingWing,
    core, second, third, coreName:ENNEAGRAM_NAMES[core],title:'The '+archetype,
    types,hiddenType,monotype:types.length===1,ability,hiddenAbility,moves,role,heldItem,
    baseStats,effectiveStats,affinities:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,round(blend[i])])),
    breakdown:{bigFive:oa,enneagram:ea,mbti:ma},
    warnings
  };
}
