// Post-results training only. Never feed EVs into the personality/classification engine.
import { STAT_KEYS } from './data.mjs';

export const TRAINING_IV = 31;
export const MAX_EV_PER_STAT = 252;
export const USABLE_EV_BUDGET = 508; // 510 legal EVs; only 508 contribute in 4-point steps at Lv. 100.
const EV_STEP = 4;

export function validTrainingEvs(evs) {
  return Array.isArray(evs) && evs.length === STAT_KEYS.length &&
    evs.every(value => Number.isInteger(value) && value >= 0 &&
      value <= MAX_EV_PER_STAT && value % EV_STEP === 0) &&
    evs.reduce((sum, value) => sum + value, 0) <= USABLE_EV_BUDGET;
}

export function emptyTrainingEvs() {
  return Array(STAT_KEYS.length).fill(0);
}

export function level100Stats(baseStats, natureBoost, natureDrop, evs) {
  if (!validTrainingEvs(evs)) throw new Error('Invalid training EV allocation.');
  return Object.fromEntries(STAT_KEYS.map((key, index) => {
    const base = baseStats[key];
    if (!Number.isInteger(base) || base < 1) throw new Error('Invalid base stat: ' + key);
    const points = 2 * base + TRAINING_IV + Math.floor(evs[index] / 4);
    if (key === 'hp') return [key, points + 110];
    const modifier = key === natureBoost ? 1.1 : key === natureDrop ? 0.9 : 1;
    return [key, Math.floor((points + 5) * modifier)];
  }));
}

// Training is post-result and never changes identity. A pronounced defensive
// split reinforces the stronger side by default; mixed builds compensate.
// Users can request either approach explicitly and can still edit every EV.
export function trainingPlan(build,mode='auto') {
  if(!['auto','reinforce','compensate'].includes(mode))throw new Error('Unknown training approach.');
  const role=build.role.primary.name, stats=build.effectiveStats;
  const offense=stats.atk>=stats.spa?'atk':'spa';
  const weakDefense=stats.def<=stats.spd?'def':'spd';
  const strongDefense=weakDefense==='def'?'spd':'def';
  const trickRoom=(build.moves||[]).some(m=>(typeof m==='string'?m:m.name)==='Trick Room');
  const split=Math.abs(stats.def-stats.spd);
  const fastUtility=['Support','Controller'].includes(role)&&stats.spe>=115&&!trickRoom;
  const slowOffense=role==='Sweeper'&&stats.spe<70;
  const resolved=mode==='auto'?((split>=35||fastUtility||slowOffense)?'reinforce':'compensate'):mode;
  const defense=resolved==='reinforce'?strongDefense:weakDefense;
  const other=defense==='def'?'spd':'def';
  let primary,secondary,leftover;
  switch(role){
    case 'Sweeper':
      {
        const preserveSpeed=trickRoom||(slowOffense&&resolved==='reinforce');
        [primary,secondary,leftover]=[offense,preserveSpeed?'hp':'spe',preserveSpeed?defense:'hp'];break;
      }
    case 'Tank':
      [primary,secondary,leftover]=['hp',offense,defense];break;
    case 'Pivot':
      // Slow switching can protect the incoming teammate; don't automatically
      // spend 252 EVs trying to repair an extreme low-Speed silhouette.
      [primary,secondary,leftover]=trickRoom||stats.spe<70?['hp',defense,offense]:['spe','hp',offense];break;
    default:
      [primary,secondary,leftover]=fastUtility&&resolved==='reinforce'?['hp','spe',defense]:['hp',defense,other];break;
  }
  const evs=emptyTrainingEvs();
  for(const [key,points] of [[primary,252],[secondary,252],[leftover,4]])evs[STAT_KEYS.indexOf(key)]=points;
  return {evs,approach:resolved,defensiveSplit:split,trickRoom};
}
export function suggestTrainingEvs(build,mode='auto') {
  return trainingPlan(build,mode).evs;
}
