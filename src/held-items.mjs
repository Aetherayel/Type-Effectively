import { HELD_ITEMS, ITEM_FAMILIES } from './held-items-data.mjs';

const TRAIT_LABELS = ['Openness','Conscientiousness','Extraversion','Agreeableness','Emotional sensitivity'];
const average = values => values.reduce((sum,value)=>sum+value,0)/values.length;
const traitFit = (scores,target) => 100-average(scores.map((score,i)=>Math.abs(score-target[i])));
const hash = value => {
  // FNV-1a; browser-independent deterministic tie-breaker, not true randomness.
  let out=2166136261;
  for(let i=0;i<value.length;i++)out=Math.imul(out^value.charCodeAt(i),16777619);
  return out>>>0;
};

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
export function heldItemRationale({core,role,bigFive,hasBigFive=true,family}) {
  const signal=bigFive.map((value,i)=>({i,value,distance:Math.abs(value-50)}))
    .sort((a,b)=>b.distance-a.distance||a.i-b.i)[0];
  const traitPhrase=hasBigFive && signal.distance>=13
    ? (signal.value>50?'higher ':'lower ')+TRAIT_LABELS[signal.i]
    : null;
  return 'Your Type '+core+' core'+
    (traitPhrase?', '+traitPhrase:'')+
    ', and '+role.primary.name+' role point toward '+family.insight+'.';
}

export function chooseHeldItem({
  tritype,core,second,third,wing,enneagramScores,bigFive,mbtiScores,
  role,types,moves,ability,hasBigFive=true
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
    const traits=traitFit(bigFive,family.target);
    return [key,.68*coreSignal+.32*traits];
  }));
  const seed=[tritype,wing,...mbtiScores,...enneagramScores,...bigFive,role.primary.name].join('|');
  const sorted=HELD_ITEMS.filter(item=>!item.strategyOnly && isHeldItemCompatible(item,{types,moves,ability})).map(item=>{
    const familyScore=familyScores[item.family];
    const traits=traitFit(bigFive,item.targets);
    const roleScore=item.roles.includes(role.primary.name) ? 100 :
      role.secondary && item.roles.includes(role.secondary.name) ? 75 : 35;
    const tie=(hash(seed+'|'+item.name)/4294967295-.5)*8;
    return {item,score:.47*familyScore+.38*traits+.15*roleScore+tie};
  }).sort((a,b)=>b.score-a.score || a.item.name.localeCompare(b.item.name));
  if(!sorted.length)throw new Error('No compatible thematic held item.');
  const selected=sorted[0].item;
  const family=ITEM_FAMILIES[selected.family];
  const explanation=heldItemRationale({core,role,bigFive,hasBigFive,family});

  return {
    name:selected.name,
    family:selected.family,
    familyLabel:family.label,
    effect:selected.effect,
    quip:selected.quip,
    why:explanation
  };
}
