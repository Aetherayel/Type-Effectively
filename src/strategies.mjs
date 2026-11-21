import { ABILITIES } from './data.mjs';
import { HELD_ITEMS, ITEM_FAMILIES } from './held-items-data.mjs';
import { isHeldItemCompatible, heldItemRationale } from './held-items.mjs';

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
    id:'grassy-sanctuary',name:'Grassy Sanctuary',roles:['Support'],requiredTypes:['Grass'],forbiddenTypes:['Ground'],
    ability:'Grassy Surge',tactic:'Life Dew',item:'Terrain Extender',
    minimum:{hp:80,spd:84},targets:{hp:112,def:92,spd:119,spe:86},
    motivations:[2,6,9],bigFive:[64,67,48,82,39],
    insight:'Changes the surroundings so recovery is normal, then quietly provides even more of it.',
    mechanism:'Grassy Surge establishes healing terrain, Life Dew actively restores allies, and Terrain Extender prolongs passive healing.'
  },
  {
    id:'ashen-vanguard',name:'Ashen Vanguard',roles:['Tank'],requiredTypes:['Fighting'],forbiddenTypes:['Fire'],
    ability:'Guts',tactic:'Bulk Up',item:'Flame Orb',offensiveStyle:'physical',
    attackSwap:{slot:1,move:'Facade',style:'physical',why:'Physical coverage that hits harder when affected by a status condition.'},
    minimum:{atk:98,hp:80},targets:{hp:107,atk:122,def:102,spd:92},
    motivations:[3,6,8],bigFive:[55,82,64,39,51],
    insight:'Responds to adversity by improving its stance and hitting harder. This is not permission to create avoidable emergencies.',
    mechanism:'Flame Orb burns its non-Fire holder, activating Guts; Bulk Up improves Attack and Defense, while Facade doubles in power when burned.'
  },
  {
    id:'venom-alchemist',name:'Venom Alchemist',roles:['Wall'],requiredTypes:['Grass'],forbiddenTypes:['Poison','Steel'],
    ability:'Poison Heal',tactic:'Protect',item:'Toxic Orb',
    minimum:{hp:92,def:84},targets:{hp:119,def:112,spd:108},
    motivations:[5,6,9],bigFive:[67,72,29,60,47],
    insight:'Converts a persistent irritant into a source of recovery. Would appreciate that the hazard is now documented.',
    mechanism:'Toxic Orb poisons the holder, Poison Heal converts poison into HP recovery, and Protect buys another recovery turn.'
  },
  {
    id:'sandbound-citadel',name:'Sandbound Citadel',roles:['Wall'],requiredTypes:['Rock'],
    ability:'Sand Stream',tactic:'Shore Up',item:'Smooth Rock',
    minimum:{hp:84,def:88,spd:78},targets:{hp:112,def:123,spd:109,spe:62},
    motivations:[1,5,6],bigFive:[61,90,29,42,45],
    insight:'Turns bad weather into building material. Every contingency has its own weatherproof folder.',
    mechanism:'Sand Stream supplies sand, boosting Rock-type special bulk; Shore Up restores more HP during sand and Smooth Rock extends the weather.'
  },
  {
    id:'arcane-catalyst',name:'Arcane Catalyst',roles:['Sweeper'],requiredTypes:['Psychic'],
    ability:'Magic Guard',tactic:'Nasty Plot',item:'Life Orb',offensiveStyle:'special',
    minimum:{spa:102,spe:84},targets:{hp:81,spa:127,spe:117},
    motivations:[3,5,7],bigFive:[92,62,54,29,38],
    insight:'Makes ambitious plans and extracts the upside without paying the predictable incidental costs. Suspiciously efficient.',
    mechanism:'Nasty Plot doubles special attacking power; Magic Guard prevents Life Orb HP loss while retaining its damage boost.'
  },
  {
    id:'circuit-architect',name:'Circuit Architect',roles:['Sweeper'],requiredTypes:['Electric'],
    ability:'Electric Surge',tactic:'Charge',item:'Terrain Extender',offensiveStyle:'special',
    attackSwap:{type:'Electric',move:'Rising Voltage',style:'special',why:'Its Electric typing is expressed through special offense.'},
    minimum:{spa:100,spe:88},targets:{hp:83,spa:119,spe:123,spd:81},
    motivations:[3,5,7],bigFive:[78,76,79,35,39],
    insight:'Improves the operating environment, charges its system, and then announces that everything is proceeding according to the plan.',
    mechanism:'Electric Surge creates Electric Terrain; Charge strengthens the next Electric attack, Terrain Extender prolongs terrain and Rising Voltage doubles against grounded targets.'
  },
  {
    id:'misty-custodian',name:'Misty Custodian',roles:['Support'],requiredTypes:['Fairy'],
    ability:'Misty Surge',tactic:'Heal Bell',item:'Misty Seed',
    minimum:{spd:89,hp:80},targets:{hp:108,def:93,spd:121,spe:83},
    motivations:[1,2,6],bigFive:[67,73,47,88,47],
    insight:'Creates room for others to recover and then quietly addresses what was already broken.',
    mechanism:'Misty Surge shields grounded allies from new major status conditions; Heal Bell cures existing status, while Misty Seed grants one Special Defense boost.'
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
       strategy.forbiddenTypes?.some(type=>types.includes(type)) ||
       (strategy.offensiveStyle==='physical' && stats.atk<stats.spa) ||
       (strategy.offensiveStyle==='special' && stats.spa<=stats.atk) ||
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
       !isHeldItemCompatible(item,{types,moves:[strategy.tactic,strategy.attackSwap?.move].filter(Boolean),ability}))
      throw new Error('Invalid signature strategy configuration: '+strategy.id);
    return [{...strategy,score:Math.round(score*10)/10}];
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return eligible[0]||null;
}

export function signatureAbility(strategy) {
  if(!strategy)return null;
  return {...ABILITIES.find(entry=>entry.name===strategy.ability)};
}

export function signatureHeldItem(strategy,{core,role,bigFive,hasBigFive=true}) {
  if(!strategy)return null;
  const item=HELD_ITEMS.find(entry=>entry.name===strategy.item);
  const family=ITEM_FAMILIES[item.family];
  return {
    name:item.name,family:item.family,familyLabel:family.label,
    effect:item.effect,quip:item.quip,
    why:heldItemRationale({core,role,bigFive,hasBigFive,family})
  };
}
