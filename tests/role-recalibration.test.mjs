import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCompleteBuild, applyNature } from '../src/engine.mjs';
import { DEMOS, ROLE_NAMES, ROLE_TEMPLATES, STAT_KEYS } from '../src/data.mjs';
import {
  classifyRole, defensiveRoleMetrics, ROLE_NEUTRAL_COMPENSATION,
  DEFENSIVE_ROLE_AXIS_WEIGHT, WALL_VARIANTS
} from '../src/roles.mjs';

const baseInput={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive
};
const toObject=xs=>Object.fromEntries(STAT_KEYS.map((key,i)=>[key,xs[i]]));
const total=stats=>STAT_KEYS.reduce((sum,k)=>sum+stats[k],0);

test('role identity comes from 535-BST before Nature battle modifiers',()=>{
  const build=generateCompleteBuild(baseInput);
  assert.equal(total(build.baseStats),535);
  assert.notDeepEqual(build.effectiveStats,build.baseStats);
  assert.deepEqual(build.effectiveStats,applyNature(build.baseStats,build.nature));
  assert.deepEqual(build.role,classifyRole(build.baseStats,build.types));
  assert.equal(build.role.statSource,'base');
  assert.equal(build.role.primary.name,build.archetype.role);
  assert.equal(build.moves.length,4);
});

test('Wall can specialize in physical defense, special defense, or mixed bulk',()=>{
  assert.equal(WALL_VARIANTS.length,2);
  assert.ok(WALL_VARIANTS.every(values=>values.reduce((a,b)=>a+b,0)===535));
  for(const template of [ROLE_TEMPLATES.Wall,...WALL_VARIANTS]){
    const stats=toObject(template);
    const wall=classifyRole(stats,['Steel','Water']);
    assert.equal(wall.primary.name,'Wall','failed defensive variant '+template);
    assert.equal(total(stats),535);
    assert.ok(wall.defensiveMetrics.defenseOverOffense>15);
  }
});

test('Tank requires relative offensive investment rather than merely low Speed',()=>{
  const wall=classifyRole(toObject(ROLE_TEMPLATES.Wall),['Steel','Water']);
  const tank=classifyRole(toObject(ROLE_TEMPLATES.Tank),['Fighting','Ground']);
  assert.equal(wall.primary.name,'Wall');
  assert.equal(tank.primary.name,'Tank');
  assert.ok(wall.defensiveMetrics.defenseOverOffense >
    tank.defensiveMetrics.defenseOverOffense);
  assert.ok(tank.defensiveMetrics.offense > wall.defensiveMetrics.offense);
});

test('soft defensive cues reward top-two bulk without imposing hard 100-point gates',()=>{
  const metrics=defensiveRoleMetrics({hp:115,atk:78,def:123,spa:80,spd:79,spe:60});
  assert.equal(metrics.topTwoBulk,119);
  assert.equal(metrics.offense,80);
  assert.equal(metrics.defenseOverOffense,39);
  const regular=classifyRole(toObject([90,90,90,90,90,85]),['Normal']);
  assert.ok(ROLE_NAMES.includes(regular.primary.name));
  assert.ok(regular.all.every(item=>item.score>=0&&item.score<=100));
  assert.equal(ROLE_NEUTRAL_COMPENSATION,.35);
  assert.equal(DEFENSIVE_ROLE_AXIS_WEIGHT,.5);
});

test('same base stats and typing produce identical role independent of Nature',()=>{
  const stats=toObject([108,72,104,73,110,68]);
  const a=classifyRole(stats,['Steel','Ice']);
  const b=classifyRole(stats,['Steel','Ice']);
  assert.deepEqual(a,b);
  for(const nature of ['Relaxed','Mild','Timid','Careful']){
    const altered=applyNature(stats,nature);
    assert.equal(a.primary.name,classifyRole(stats,['Steel','Ice']).primary.name,
      nature+' must not influence base role');
    assert.notDeepEqual(stats,altered);
  }
});

test('seeded role recalibration retains all six identities without a Tank or Pivot monopoly',()=>{
  let seed=260612;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const nums=n=>Array.from({length:n},()=>Math.floor(random()*101));
  const counts=Object.fromEntries(ROLE_NAMES.map(name=>[name,0]));
  const wall=[],tank=[];
  for(let i=0;i<900;i++){
    const input={
      ...(i%2===0?{mbtiScores:nums(5)}:{functionScores:nums(8)}),
      bigFive:nums(5),enneagramScores:nums(9)
    };
    const build=generateCompleteBuild(input);
    const role=build.role.primary.name;
    counts[role]++;
    if(role==='Wall')wall.push(build.role.defensiveMetrics);
    if(role==='Tank')tank.push(build.role.defensiveMetrics);
    assert.deepEqual(build.role,classifyRole(build.baseStats,build.types));
    assert.equal(total(build.baseStats),535);
    assert.equal(build.moves.length,4);
    assert.ok(build.role.all.every(item=>ROLE_NAMES.includes(item.name)));
  }
  assert.ok(Object.values(counts).every(n=>n>=18),'role unavailable: '+JSON.stringify(counts));
  assert.ok(counts.Tank<300&&counts.Pivot<300,
    'balanced profiles should not default to Tank or Pivot: '+JSON.stringify(counts));
  const avg=(arr,key)=>arr.reduce((a,b)=>a+b[key],0)/arr.length;
  assert.ok(avg(wall,'topTwoBulk')>avg(tank,'topTwoBulk')+4,
    'Walls should be materially more defensive');
  assert.ok(avg(tank,'offense')>avg(wall,'offense')+8,
    'Tanks must reserve more offensive strength');
});
