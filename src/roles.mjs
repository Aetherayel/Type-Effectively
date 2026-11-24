import {
  ROLE_AFFINITIES, ROLE_CALIBRATED_TEMPLATES, ROLE_NAMES,
  ROLE_TEMPLATE_SCALE, STAT_KEYS
} from './data.mjs';

// Battle identity is chosen from the immutable 535-BST personality silhouette,
// before Nature changes battle performance. Nature still affects actual moves,
// abilities, and specialist stat gates downstream.
const BASE_STAT_TOTAL=535;
const STAT_CENTER=BASE_STAT_TOTAL/STAT_KEYS.length;
const ROLE_SIMILARITY_SIGMA=25;
const NEUTRAL_REFERENCE=80;

// Templates do not begin equally distant from the six-stat center. Preserve
// most of the original geometry while discounting 35% of each role's built-in
// advantage (or disadvantage) against an entirely neutral Pokémon.
export const ROLE_NEUTRAL_COMPENSATION=.35;

// Additional Wall shapes permit physical and special specialization, not
// just simultaneous exceptional HP + Def + Sp. Def. All total 535.
export const WALL_VARIANTS=Object.freeze([
  Object.freeze([120,55,135,55,90,80]), // physical bulwark
  Object.freeze([120,55,90,55,135,80])  // special bulwark
]);

// Small differentiators on the *same base-stat shape*.
// A Wall spends more on resilience than offense; a Tank requires both some
// bulk and threatening offense. 100 and +15 are soft reference signals,
// never eligibility gates. Each adjustment is at most 3.5 role-score points.
export const DEFENSIVE_ROLE_AXIS_WEIGHT=.5;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const round=Math.round;

function roleTargets(role) {
  const base=ROLE_CALIBRATED_TEMPLATES[role];
  const targets=[base];
  if(role==='Sweeper'||role==='Tank')
    targets.push([base[0],base[3],base[2],base[1],base[4],base[5]]);
  if(role==='Wall'){
    for(const template of WALL_VARIANTS){
      targets.push(template.map(value=>
        STAT_CENTER+ROLE_TEMPLATE_SCALE*(value-STAT_CENTER)));
    }
  }
  return targets;
}

function similarity(stats,targets) {
  const rms=Math.min(...targets.map(target=>Math.sqrt(mean(
    stats.map((value,i)=>(value-target[i])**2)
  ))));
  return 100*Math.exp(-rms*rms/(2*ROLE_SIMILARITY_SIGMA**2));
}

export function defensiveRoleMetrics(baseStats) {
  const bulk=[baseStats.hp,baseStats.def,baseStats.spd];
  const topTwo=[...bulk].sort((a,b)=>b-a).slice(0,2);
  const topTwoBulk=mean(topTwo),bulkMean=mean(bulk);
  const offense=Math.max(baseStats.atk,baseStats.spa);
  return {
    topTwoBulk,bulkMean,offense,
    defenseOverOffense:topTwoBulk-offense
  };
}
export function classifyRole(baseStats,types) {
  if(!baseStats||STAT_KEYS.some(k=>!Number.isFinite(baseStats[k]))||
      !Array.isArray(types)||!types.length||
      types.some(type=>!ROLE_AFFINITIES[type]))
    throw new Error('Battle role requires six base stats and valid Pokémon typing.');
  const raw=STAT_KEYS.map(k=>baseStats[k]);
  const normalized=raw.map(v=>v*BASE_STAT_TOTAL/raw.reduce((a,b)=>a+b,0));
  const source=Object.fromEntries(STAT_KEYS.map((key,i)=>[key,normalized[i]]));
  const bulk=defensiveRoleMetrics(source);
  const physicalWall=clamp(
    .3*(bulk.topTwoBulk-100)+.32*(bulk.defenseOverOffense-15),-7,7);
  const tankRetaliation=clamp(
    .4*(bulk.offense-100)+.25*(bulk.topTwoBulk-100)-
    Math.max(0,2*(90-bulk.bulkMean)),-7,6);
  const adjustments={
    Wall:physicalWall*DEFENSIVE_ROLE_AXIS_WEIGHT,
    Tank:tankRetaliation*DEFENSIVE_ROLE_AXIS_WEIGHT
  };
  const toolkitTypes=types.length===1?[types[0],types[0]]:types;
  const scored=ROLE_NAMES.map((role,idx)=>{
    const targets=roleTargets(role);
    const rawFit=similarity(normalized,targets);
    const neutralFit=similarity(STAT_KEYS.map(()=>STAT_CENTER),targets);
    const neutralAdjusted=clamp(NEUTRAL_REFERENCE+rawFit-neutralFit,0,100);
    const statFit=(1-ROLE_NEUTRAL_COMPENSATION)*rawFit+
      ROLE_NEUTRAL_COMPENSATION*neutralAdjusted;
    const toolkit=.55*ROLE_AFFINITIES[toolkitTypes[0]][idx]+
      .45*ROLE_AFFINITIES[toolkitTypes[1]][idx];
    const defensiveAdjustment=adjustments[role]||0;
    return {
      name:role,
      score:round(clamp(.8*statFit+.2*toolkit+defensiveAdjustment,0,100)),
      statFit:round(statFit),toolkit:round(toolkit),
      defensiveAdjustment:round(defensiveAdjustment*10)/10
    };
  }).sort((a,b)=>b.score-a.score||
    ROLE_NAMES.indexOf(a.name)-ROLE_NAMES.indexOf(b.name));
  const spread=Math.sqrt(mean(raw.map(v=>(v-mean(raw))**2)));
  return {
    primary:scored[0],
    secondary:scored[1].score>=scored[0].score-5?scored[1]:null,
    all:scored,
    specialization:spread<15?'Versatile':spread<25?'Focused':'Highly specialized',
    spread:round(spread),
    statSource:'base',
    defensiveMetrics:Object.fromEntries(Object.entries(bulk).map(([key,v])=>[key,Math.round(v*10)/10]))
  };
}
