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

// Deterministic, role-informed starting point rather than another personality score.
// Weakest defense is favored for resilience; offensives use the actual Nature-adjusted shape.
// A Controller keeps its Speed free for potential Trick Room tactics.
export function suggestTrainingEvs(build) {
  const role = build.role.primary.name;
  const stats = build.effectiveStats;
  const offense = stats.atk >= stats.spa ? 'atk' : 'spa';
  const weakDefense = stats.def <= stats.spd ? 'def' : 'spd';
  const otherDefense = weakDefense === 'def' ? 'spd' : 'def';
  let primary, secondary, leftover;
  switch (role) {
    case 'Sweeper':
      [primary, secondary, leftover] = [offense, 'spe', 'hp'];
      break;
    case 'Tank':
      [primary, secondary, leftover] = ['hp', offense, weakDefense];
      break;
    case 'Pivot':
      [primary, secondary, leftover] = ['spe', 'hp', offense];
      break;
    case 'Wall':
    case 'Support':
    case 'Controller':
    default:
      [primary, secondary, leftover] = ['hp', weakDefense, otherDefense];
      break;
  }
  const result = emptyTrainingEvs();
  for (const [key, points] of [[primary, 252], [secondary, 252], [leftover, 4]]) {
    result[STAT_KEYS.indexOf(key)] = points;
  }
  return result;
}
