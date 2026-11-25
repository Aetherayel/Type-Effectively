import { HELD_ITEMS, ITEM_FAMILIES } from './held-items-data.mjs';
import { ITEM_FACET_FOCI } from './facet-outcomes.mjs';
import { facetAbsoluteFit } from './bigfive-facets.mjs';

const TRAIT_LABELS = ['Openness','Conscientiousness','Extraversion','Agreeableness','Emotional sensitivity'];
const average = values => values.reduce((sum,value)=>sum+value,0)/values.length;
const traitFit = (scores,target) => 100-average(scores.map((score,i)=>Math.abs(score-target[i])));

// Only reject equipment whose key mechanic contradicts this specific build.
// Situational reactive items remain flavor-eligible; impossible prerequisites do not.
const DRAINING_MOVES=new Set(['Drain Punch','Aqua Ring','Giga Drain','Leech Life',
  'Draining Kiss','Parabolic Charge','Leech Seed','Ingrain','Strength Sap']);
const SCREEN_MOVES=new Set(['Reflect','Light Screen','Aurora Veil']);
const CONTACT_MOVES=new Set(['Flare Blitz','Liquidation','Wild Charge','Leaf Blade',
  'Icicle Crash','Close Combat','Poison Jab','Brave Bird','Zen Headbutt','X-Scissor',
  'Stone Edge','Shadow Claw','Dragon Claw','Crunch','Iron Head','Play Rough',
  'U-turn','Flip Turn','Drain Punch']);
// Parting Shot is sound-based but switches the user before its own Sp. Atk
// boost from Throat Spray can meaningfully contribute to this build.
const SOUND_MOVES=new Set(['Hyper Voice','Boomburst','Snarl','Bug Buzz']);
const MULTI_HIT_MOVES=new Set(['Icicle Spear','Bullet Seed','Rock Blast','Scale Shot']);
const BINDING_MOVES=new Set(['Wrap','Bind','Fire Spin','Whirlpool','Sand Tomb','Infestation']);
const CHARGING_MOVES=new Set(['Solar Beam','Solar Blade','Sky Attack','Meteor Beam']);

export function isHeldItemCompatible(item,{types,moves,ability=null}){
  const name=typeof item==='string'?item:item.name;
  if(!Array.isArray(types)||!types.length||!Array.isArray(moves)||!moves.length)
    throw new Error('Item compatibility requires typing and moves.');
  const names=new Set(moves.map(move=>typeof move==='string'?move:move.name));
  const abilityName=typeof ability==='string'?ability:ability?.name;
  const hasSome=set=>[...set].some(name=>names.has(name));
  if(name==='Assault Vest')return false; // Slot 3 and 4 are always status/utility.
  if(['Choice Band','Choice Specs','Choice Scarf'].includes(name))return false;
  if(name==='Black Sludge')return types.includes('Poison');
  // These orbs are harmful equipment unless the entire package activates their payoff.
  if(name==='Flame Orb')return abilityName==='Guts' &&
    !types.includes('Fire') && names.has('Facade');
  if(name==='Toxic Orb')return abilityName==='Poison Heal' &&
    !types.some(type=>type==='Poison'||type==='Steel');
  if(name==='Big Root')return hasSome(DRAINING_MOVES);
  if(name==='Light Clay')return hasSome(SCREEN_MOVES);
  if(name==='Grip Claw'||name==='Binding Band')return hasSome(BINDING_MOVES);
  if(name==='Throat Spray')return hasSome(SOUND_MOVES);
  if(name==='Loaded Dice')return hasSome(MULTI_HIT_MOVES);
  if(name==='Power Herb')return hasSome(CHARGING_MOVES);
  if(name==='Room Service')return names.has('Trick Room');
  if(name==='Terrain Extender')return ['Grassy Terrain','Electric Terrain','Misty Terrain','Psychic Terrain']
    .some(move=>names.has(move)) ||
    ['Grassy Surge','Electric Surge','Misty Surge','Psychic Surge'].includes(abilityName);
  if(name==='Grassy Seed')return names.has('Grassy Terrain')||abilityName==='Grassy Surge';
  if(name==='Electric Seed')return names.has('Electric Terrain')||abilityName==='Electric Surge';
  if(name==='Misty Seed')return names.has('Misty Terrain')||abilityName==='Misty Surge';
  if(name==='Psychic Seed')return names.has('Psychic Terrain');
  const weather={
    'Heat Rock':'Sunny Day','Damp Rock':'Rain Dance',
    'Icy Rock':'Snowscape','Smooth Rock':'Sandstorm'
  };
  if(weather[name])return names.has(weather[name]) ||
    Boolean(abilityName && {'Icy Rock':'Snow Warning','Heat Rock':'Drought','Damp Rock':'Drizzle','Smooth Rock':'Sand Stream'}[name]===abilityName);
  if(name==='Protective Pads')return hasSome(CONTACT_MOVES);
  // No evolutionary stage exists for an original generated personality Pokémon.
  if(name==='Eviolite'||name==='Everstone')return false;
  return true;
}

// Both ordinary and signature-selected items explain their personality fit
// using the same language. Battle-mechanic combinations belong in the single
// Signature Strategy panel, never the held-item rationale.
export function heldItemRationale({core,role,bigFive,hasBigFive=true,family,facetScores=null}) {
  const signal=bigFive.map((value,i)=>({i,value,distance:Math.abs(value-50)}))
    .sort((a,b)=>b.distance-a.distance||a.i-b.i)[0];
  const traitPhrase=hasBigFive && !facetScores && signal.distance>=13
    ? (signal.value>50?'higher ':'lower ')+TRAIT_LABELS[signal.i]
    : null;
  return 'Your Type '+core+' core'+
    (traitPhrase?', '+traitPhrase:facetScores?', detailed Big Five facets':'')+
    ', and '+role.primary.name+' role point toward '+family.insight+'.';
}

// Small mechanical preference, deliberately subordinate to the item's
// personality family. Missing stats (legacy direct calls) add no bonus.
export function heldItemStatFit(item,stats,moves=[],ability=null) {
  if(!stats)return 0;
  const ramp=(v,start,span=35)=>Math.max(0,Math.min(1,(v-start)/span))*6;
  const names=moves.map(m=>typeof m==='string'?m:m.name);
  const abilityName=typeof ability==='string'?ability:ability?.name;
  const offense=Math.max(stats.atk,stats.spa);
  const bulk=(stats.hp+stats.def+stats.spd)/3;
  switch(item.name){
    case 'Muscle Band': return stats.atk>=stats.spa?ramp(stats.atk,85):-6;
    case 'Wise Glasses': case 'Throat Spray': return stats.spa>=stats.atk?ramp(stats.spa,85):-6;
    case 'Rocky Helmet': case 'Kee Berry': return ramp(stats.def,85);
    case 'Maranga Berry': return ramp(stats.spd,85);
    case 'Leftovers': case 'Black Sludge': return ramp(bulk,85);
    case 'Shell Bell': case 'Expert Belt': case 'Life Orb': return ramp(offense,85);
    case 'Weakness Policy': return Math.min(ramp(bulk,80),ramp(offense,85));
    case 'Zoom Lens': return ramp(100-stats.spe,10,35);
    case "King's Rock": case 'Razor Fang': return names.includes('Trick Room')?ramp(100-stats.spe,15):ramp(stats.spe,85);
    case 'Quick Claw': return names.includes('Trick Room')?-4:ramp(100-stats.spe,15);
    case 'Iron Ball': return names.includes('Trick Room')?ramp(100-stats.spe,10):-6;
    case 'Room Service': return ramp(100-stats.spe,10);
    case 'Eject Pack': return abilityName==='Clear Body'?-6:0;
    default: return 0;
  }
}
export function chooseHeldItem({
  tritype,core,second,third,wing,enneagramScores,bigFive,mbtiScores,
  role,types,moves,ability,stats=null,hasBigFive=true,facetContrasts=null,facetScores=null
}) {
  if(!Array.isArray(enneagramScores)||enneagramScores.length!==9 ||
      !Array.isArray(bigFive)||bigFive.length!==5 ||
      !Array.isArray(mbtiScores)||mbtiScores.length!==5 ||
      !Number.isInteger(core)||core<1||core>9 || !role?.primary?.name ||
      !Array.isArray(types)||!types.length||!Array.isArray(moves)||moves.length!==4) {
    throw new Error('Held item selection requires a complete personality build.');
  }
  const familyScores=Object.fromEntries(Object.entries(ITEM_FAMILIES).map(([key,family])=>{
    const ennea=family.ennea;
    const weighted=enneagramScores.reduce((sum,value,i)=>sum+value*ennea[i],0) /
      Math.max(1,enneagramScores.reduce((sum,value)=>sum+value,0));
    const coreSignal=.54*ennea[core-1]+.23*ennea[second-1]+.13*ennea[third-1]+.10*weighted;
    // Each completed facet group substitutes for its parent within the
    // established temperament share; no extra facet-fit bonus is added.
    const traits=facetAbsoluteFit(bigFive,facetScores,family.target,ITEM_FACET_FOCI[key]);
    return [key,.68*coreSignal+.32*traits];
  }));
  // Rank by actual thematic and tactical fit only. Never hash raw survey
  // values into a pseudo-random bonus: one-point input changes must not
  // reshuffle otherwise identical equipment choices.
  const sorted=HELD_ITEMS.filter(item=>!item.strategyOnly && isHeldItemCompatible(item,{types,moves,ability})).map(item=>{
    const familyScore=familyScores[item.family];
    const traits=facetAbsoluteFit(bigFive,facetScores,item.targets,ITEM_FACET_FOCI[item.family]);
    const roleScore=item.roles.includes(role.primary.name) ? 100 :
      role.secondary && item.roles.includes(role.secondary.name) ? 75 : 35;
    return {item,score:.47*familyScore+.38*traits+.15*roleScore+heldItemStatFit(item,stats,moves,ability)};
  }).sort((a,b)=>b.score-a.score || a.item.name.localeCompare(b.item.name)); // stable exact ties
  if(!sorted.length)throw new Error('No compatible thematic held item.');
  const selected=sorted[0].item;
  const family=ITEM_FAMILIES[selected.family];
  const explanation=heldItemRationale({core,role,bigFive,hasBigFive,family,facetScores});

  return {
    name:selected.name,
    family:selected.family,
    familyLabel:family.label,
    // Explained as difference from the coarse theme fit, not an added bonus.
    facetAdjustment:Math.round(10*(facetAbsoluteFit(bigFive,facetScores,family.target,
      ITEM_FACET_FOCI[selected.family])-
      traitFit(bigFive,family.target)))/10,
    effect:selected.effect,
    quip:selected.quip,
    why:explanation
  };
}
