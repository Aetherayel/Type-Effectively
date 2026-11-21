import { ABILITIES } from './data.mjs';
import { HELD_ITEMS, ITEM_FAMILIES } from './held-items-data.mjs';
import { isHeldItemCompatible } from './held-items.mjs';

const clamp=value=>Math.max(0,Math.min(100,value));
const mean=values=>values.reduce((sum,n)=>sum+n,0)/values.length;

// Each package commits ability + role tactic + equipment to one actual battle
// mechanism. Required types, roles and stat gates are hard eligibility rules;
// whole-profile fit decides whether a valid package should supersede a generalist.
// This is an authored game classification, not a psychological measurement.
export const SIGNATURE_STRATEGIES=Object.freeze([
  {
    id:'snow-bastion',name:'Snow Bastion',roles:['Wall'],requiredTypes:['Ice'],
    ability:'Snow Warning',tactic:'Aurora Veil',item:'Icy Rock',
    minimum:{def:83,spd:82},targets:{hp:113,def:119,spd:112},
    motivations:[1,5,6,9],bigFive:[62,83,28,55,43],
    insight:'Establishes protective conditions before everyone else notices the storm. Snow lasts longer; Aurora Veil still has its normal duration.',
    mechanism:'Snow Warning supplies the snow Aurora Veil requires. Icy Rock extends snow, not Aurora Veil.'
  },
  {
    id:'solar-engine',name:'Solar Engine',roles:['Sweeper'],requiredTypes:['Fire'],
    ability:'Drought',tactic:'Growth',item:'Heat Rock',
    minimum:{spe:78},targets:{atk:105,spa:105,spe:111},
    motivations:[3,7,8],bigFive:[76,60,81,39,33],
    insight:'Creates an opening and converts it into momentum. The groundwork was apparently part of the attack.',
    mechanism:'Drought activates sunlight, boosting Growth and Fire attacks; Heat Rock extends the sunlight.'
  },
  {
    id:'regenerative-scout',name:'Regenerative Scout',roles:['Pivot'],requiredTypes:['Water'],
    ability:'Regenerator',tactic:'Flip Turn',item:'Heavy-Duty Boots',
    minimum:{hp:82},targets:{hp:113,def:94,spe:101},
    motivations:[2,5,9],bigFive:[66,67,46,70,36],
    insight:'Intervenes usefully, then withdraws before the work becomes a lifestyle.',
    mechanism:'Flip Turn switches out to trigger Regenerator; Heavy-Duty Boots prevent entry-hazard penalties on repeat visits.'
  },
  {
    id:'toxic-warden',name:'Toxic Warden',roles:['Controller'],requiredTypes:['Poison'],
    ability:'Corrosion',tactic:'Toxic',item:'Black Sludge',
    minimum:{spd:78},targets:{hp:107,def:102,spd:115},
    motivations:[4,5,8],bigFive:[78,63,34,28,54],
    insight:'Identifies a weakness, applies sustained pressure, and watches the results with unacceptable patience.',
    mechanism:'Corrosion allows Toxic to poison Steel- and Poison-type targets; Black Sludge sustains a Poison-type holder.'
  },
  {
    id:'barbed-bulwark',name:'Barbed Bulwark',roles:['Wall'],requiredTypes:['Steel'],
    ability:'Iron Barbs',tactic:'Iron Defense',item:'Rocky Helmet',
    minimum:{def:98},targets:{hp:115,def:132,spd:92},
    motivations:[1,6,8],bigFive:[43,86,41,32,48],
    insight:'Reinforces its boundaries until charging at them becomes an expensive personality choice.',
    mechanism:'Iron Defense strengthens physical staying power while Iron Barbs and Rocky Helmet punish contact.'
  },
  {
    id:'slow-labyrinth',name:'Slow Labyrinth',roles:['Controller'],requiredTypes:['Psychic'],
    ability:'Magic Bounce',tactic:'Trick Room',item:'Room Service',
    maximum:{spe:75},targets:{hp:111,def:102,spd:114,spe:42},
    motivations:[5,6,9],bigFive:[87,72,21,47,53],
    insight:'Changes the rules of tempo, then uses its apparent slowness as a tactical advantage.',
    mechanism:'Trick Room reverses ordinary move order; Room Service lowers Speed when it activates. Magic Bounce reflects eligible incoming status moves.'
  }
]);

function motivationFit(strategy,{core,second,third}) {
  return clamp(15+(strategy.motivations.includes(core)?55:0)+
    (strategy.motivations.includes(second)?25:0)+
    (strategy.motivations.includes(third)?15:0));
}
function statFit(strategy,stats) {
  const deviations=Object.entries(strategy.targets).map(([stat,target])=>
    Math.abs(stats[stat]-target));
  return clamp(100-1.25*mean(deviations));
}
function traitFit(strategy,bigFive) {
  return clamp(100-.9*mean(bigFive.map((value,i)=>
    Math.abs(value-strategy.bigFive[i]))));
}
function satisfiesGates(strategy,stats) {
  return Object.entries(strategy.minimum||{}).every(([key,min])=>stats[key]>=min) &&
    Object.entries(strategy.maximum||{}).every(([key,max])=>stats[key]<=max);
}

export function selectSignatureStrategy({
  types,role,stats,core,second,third,bigFive,hasBigFive=true
}) {
  if(!Array.isArray(types)||!role?.primary?.name||!stats||
      !Array.isArray(bigFive)||bigFive.length!==5)return null;
  const eligible=SIGNATURE_STRATEGIES.flatMap(strategy=>{
    if(!strategy.roles.includes(role.primary.name) ||
       !strategy.requiredTypes.every(type=>types.includes(type)) ||
       !satisfiesGates(strategy,stats))return [];
    const motive=motivationFit(strategy,{core,second,third});
    if(motive<55)return []; // A thematic match alone cannot force a specialist.
    const score=.35*role.primary.score+.27*statFit(strategy,stats)+
      .24*motive+.14*(hasBigFive?traitFit(strategy,bigFive):55);
    const threshold=hasBigFive?77:82; // Missing traits are not invented evidence.
    if(score<threshold)return [];
    const ability=ABILITIES.find(entry=>entry.name===strategy.ability);
    const item=HELD_ITEMS.find(entry=>entry.name===strategy.item);
    if(!ability||!item||
       !ability.types.some(type=>types.includes(type))||
       !isHeldItemCompatible(item,{types,moves:[{name:strategy.tactic}],ability}))
      throw new Error('Invalid signature strategy configuration: '+strategy.id);
    return [{...strategy,score:Math.round(score*10)/10}];
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return eligible[0]||null;
}

export function signatureAbility(strategy) {
  if(!strategy)return null;
  return {...ABILITIES.find(entry=>entry.name===strategy.ability)};
}

export function signatureHeldItem(strategy) {
  if(!strategy)return null;
  const item=HELD_ITEMS.find(entry=>entry.name===strategy.item);
  const family=ITEM_FAMILIES[item.family];
  return {
    name:item.name,family:item.family,familyLabel:family.label,
    effect:item.effect,quip:item.quip,
    why:strategy.name+': '+strategy.mechanism
  };
}
