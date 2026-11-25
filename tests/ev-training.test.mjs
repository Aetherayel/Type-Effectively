import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, STAT_KEYS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import {
  emptyTrainingEvs, level100Stats, suggestTrainingEvs, trainingPlan,
  TRAINING_IV, USABLE_EV_BUDGET, validTrainingEvs
} from '../src/ev-training.mjs';

const neutralStats = Object.fromEntries(STAT_KEYS.map(key => [key, 100]));
const sum = evs => evs.reduce((total, value) => total + value, 0);

test('EV validation enforces six stats, 252 cap, four-point increments, and 508 effective budget', () => {
  assert.equal(TRAINING_IV, 31);
  assert.equal(USABLE_EV_BUDGET, 508);
  assert.deepEqual(emptyTrainingEvs(), [0, 0, 0, 0, 0, 0]);
  assert.ok(validTrainingEvs([252, 252, 4, 0, 0, 0]));
  assert.ok(validTrainingEvs([0, 0, 0, 0, 0, 0]));
  for (const invalid of [
    [252, 252, 8, 0, 0, 0], // exceeds useful budget
    [256, 252, 0, 0, 0, 0], // exceeds per-stat maximum
    [253, 0, 0, 0, 0, 0], // ineffective remainder disallowed by this UI
    [-4, 0, 0, 0, 0, 0],
    [0, 0, 0],
    [0, 0, 0, 0, 0, NaN],
    '252/252/4'
  ]) assert.equal(validTrainingEvs(invalid), false, JSON.stringify(invalid));
});

test('level 100 formula uses raw base stats, 31 IVs, EVs and one Nature application', () => {
  assert.deepEqual(
    level100Stats(neutralStats, 'def', 'spd', [0, 0, 0, 0, 0, 0]),
    { hp: 341, atk: 236, def: 259, spa: 236, spd: 212, spe: 236 }
  );
  assert.deepEqual(
    level100Stats(neutralStats, 'def', 'spd', [252, 252, 4, 0, 0, 0]),
    { hp: 404, atk: 299, def: 260, spa: 236, spd: 212, spe: 236 }
  );
  assert.throws(() => level100Stats(neutralStats, 'def', 'spd', [252, 252, 8, 0, 0, 0]), /Invalid training EV/);
});

test('all six tactical roles get deterministic, legal suggestions without changing the build', () => {
  for (const role of ['Sweeper','Wall','Tank','Pivot','Support','Controller']) {
    const build = {
      role: { primary: { name: role } },
      effectiveStats: { hp: 100, atk: 110, def: 70, spa: 85, spd: 92, spe: 60 }
    };
    const original = structuredClone(build);
    const evs = suggestTrainingEvs(build);
    assert.deepEqual(build, original, role + ' must remain untouched');
    assert.ok(validTrainingEvs(evs), role);
    assert.equal(sum(evs), 508, role);
    assert.deepEqual(suggestTrainingEvs(build), evs, role);
    if (['Wall','Support','Controller'].includes(role)) {
      assert.equal(evs[0], 252, role + ' must invest in HP');
      assert.equal(evs[2], 252, role + ' must address the weaker defense');
    }
    if (role === 'Sweeper') {
      assert.equal(evs[1], 252);
      assert.equal(evs[5], 0, 'very slow Sweepers can reinforce their offense instead of forcing Speed');
      assert.equal(evs[0],252);
    }
    if (role === 'Controller') assert.equal(evs[5], 0, 'do not interfere with Trick Room speed');
  }
});

test('EV training operates downstream and leaves engine-computed characteristics untouched', () => {
  const input = {
    mbtiScores: DEMOS.architect.mbti,
    enneagramScores: DEMOS.architect.enneagram,
    bigFive: DEMOS.architect.bigfive
  };
  const build = generateBuild(input);
  const unchanged = structuredClone({
    baseStats: build.baseStats, effectiveStats: build.effectiveStats,
    role: build.role, nature: build.nature, types: build.types, archetype: build.archetype
  });
  const evs = suggestTrainingEvs(build);
  const trained = level100Stats(build.baseStats, build.natureBoost, build.natureDrop, evs);
  assert.ok(Object.values(trained).every(Number.isInteger));
  assert.deepEqual({
    baseStats: build.baseStats, effectiveStats: build.effectiveStats,
    role: build.role, nature: build.nature, types: build.types, archetype: build.archetype
  }, unchanged);
  assert.equal(STAT_KEYS.reduce((total, key) => total + build.baseStats[key], 0), 600);
});

test('V3 training differentiates a dedicated wall from a mixed wall, and supports both plans',()=>{
  const build={role:{primary:{name:'Wall'}},effectiveStats:{hp:125,atk:55,def:155,spa:60,spd:80,spe:45}};
  assert.deepEqual(trainingPlan(build).evs,[252,0,252,0,4,0]);
  assert.deepEqual(trainingPlan(build,'compensate').evs,[252,0,4,0,252,0]);
  assert.equal(trainingPlan(build).approach,'reinforce');
  const slow={...build,role:{primary:{name:'Pivot'}}};
  assert.equal(trainingPlan(slow).evs[5],0);
  const fast={...build,role:{primary:{name:'Controller'}},effectiveStats:{...build.effectiveStats,spe:120}};
  assert.equal(trainingPlan(fast).evs[5],252);
  for(const mode of ['auto','reinforce','compensate']){
    const trick={...fast,moves:[{name:'Trick Room'}]};
    assert.equal(trainingPlan(trick,mode).evs[5],0);
    assert.ok(validTrainingEvs(trainingPlan(trick,mode).evs));
  }
});
