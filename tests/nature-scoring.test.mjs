import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyNature, NATURE_STATS, NATURE_MOTIVATIONS } from '../src/nature.mjs';
import { DEMOS, NATURE_EFFECTS } from '../src/data.mjs';
import { deriveTritype, generateBuild, applyNature } from '../src/engine.mjs';
import { level100Stats } from '../src/ev-training.mjs';

const complete={
  enneagramScores:DEMOS.architect.enneagram,
  core:5,second:9,third:3,mbtiScores:DEMOS.architect.mbti,
  mbti:'INTJ',bigFive:DEMOS.architect.bigfive
};

test('Nature pool represents every non-neutral non-HP boost/sacrifice pair',()=>{
  assert.equal(NATURE_STATS.length,5);
  assert.equal(Object.keys(NATURE_EFFECTS).length,20);
  const pairs=new Set();
  for(const [nature,[boost,drop]] of Object.entries(NATURE_EFFECTS)){
    assert.ok(NATURE_STATS.includes(boost)&&NATURE_STATS.includes(drop),nature);
    assert.notEqual(boost,drop,nature);
    pairs.add(boost+'/'+drop);
  }
  assert.equal(pairs.size,20);
  assert.equal(Object.keys(NATURE_MOTIVATIONS).length,9);
  for(const row of Object.values(NATURE_MOTIVATIONS)){
    assert.equal(row.length,5);
    assert.ok(row.every(n=>n>=0&&n<=100));
  }
});

test('winner exposes a reproducible, auditable source-weighted contrast',()=>{
  const a=classifyNature(complete),b=classifyNature(complete);
  assert.deepEqual(a,b);
  assert.equal(a.name,'Quiet');
  assert.deepEqual(a.weights,{motivation:45,cognition:30,temperament:25});
  const reconstructed=Object.entries(a.components).reduce((sum,[source,value])=>
    sum+value*a.weights[source]/100,0);
  assert.ok(Math.abs(reconstructed-a.score)<.11);
  assert.equal(a.boost,'spa');
  assert.equal(a.drop,'spe');
  assert.ok(a.score>50);
  assert.equal(a.alternatives.length,2);
  assert.ok(a.alternatives[0].score<=a.score);
});

test('Nature is not an MBTI lookup: motivations and measured traits can change it',()=>{
  const challenger={
    ...complete,core:8,second:7,third:3,
    enneagramScores:[30,20,94,30,51,43,88,99,22]
  };
  const a=classifyNature(complete),b=classifyNature(challenger);
  assert.equal(complete.mbti,challenger.mbti);
  assert.notEqual(a.name,b.name);
  const shifted=classifyNature({...complete,bigFive:[20,20,90,20,95]});
  assert.notDeepEqual(shifted.priorities,a.priorities);
  assert.notDeepEqual(shifted.components.temperament,a.components.temperament);
});

test('missing temperament is absent, never a measured neutral placeholder',()=>{
  const missing=classifyNature({...complete,bigFive:null});
  const measuredNeutral=classifyNature({...complete,bigFive:[50,50,50,50,50]});
  assert.equal(missing.temperamentMeasured,false);
  assert.deepEqual(missing.weights,{motivation:60,cognition:40});
  assert.equal(missing.components.temperament,undefined);
  assert.equal(measuredNeutral.temperamentMeasured,true);
  assert.deepEqual(measuredNeutral.weights,{motivation:45,cognition:30,temperament:25});
  assert.notDeepEqual(missing.weights,measuredNeutral.weights);
  const estimated=classifyNature({...complete,hasMeasuredCognition:false,bigFive:null});
  assert.equal(estimated.cognitionEstimated,true);
  assert.deepEqual(estimated.weights,{motivation:75,cognition:25});
});

test('A/T does not enter Nature; intentional MBTI overrides change cognitive polarity',()=>{
  const a=classifyNature(complete);
  const at=classifyNature({...complete,mbtiScores:[...complete.mbtiScores.slice(0,4),100]});
  assert.deepEqual(a,at);
  const override=classifyNature({...complete,mbti:'ENFP'});
  assert.notDeepEqual(override.priorities,a.priorities);
  assert.notEqual(override.components.cognition,a.components.cognition);
});

test('Nature selection rejects incomplete or invalid scores',()=>{
  assert.throws(()=>classifyNature({...complete,enneagramScores:[1,2]}),/valid personality inputs/);
  assert.throws(()=>classifyNature({...complete,bigFive:[20,50,120,40,20]}),/valid personality inputs/);
  assert.throws(()=>classifyNature({...complete,mbti:'FAKE'}),/valid personality inputs/);
});

test('Nature selection is separate from base stats but applied before role/EV training',()=>{
  const build=generateBuild({
    mbtiScores:complete.mbtiScores,
    enneagramScores:complete.enneagramScores,bigFive:complete.bigFive
  });
  assert.equal(build.nature,build.natureScoring.name);
  assert.deepEqual(build.effectiveStats,applyNature(build.baseStats,build.nature));
  assert.equal(Object.values(build.baseStats).reduce((sum,v)=>sum+v,0),600);
  const trained=level100Stats(build.baseStats,build.natureBoost,build.natureDrop,[0,0,0,0,0,0]);
  for(const k of NATURE_STATS){
    const before=2*build.baseStats[k]+31+5;
    assert.equal(trained[k],Math.floor(before*
      (k===build.natureBoost?1.1:k===build.natureDrop?.9:1)));
  }
});

test('seeded scoring keeps all 20 Natures reachable without hard-coded MBTI gates',()=>{
  let seed=3427189;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const counters={};
  for(let n=0;n<16000;n++){
    const mbtiScores=Array.from({length:5},()=>Math.floor(random()*101));
    const enneagramScores=Array.from({length:9},()=>Math.floor(random()*101));
    const bigFive=Array.from({length:5},()=>Math.floor(random()*101));
    const tritype=deriveTritype(enneagramScores);
    const [core,second,third]=[...tritype].map(Number);
    const mbti=(mbtiScores[0]>=50?'I':'E')+(mbtiScores[1]>=50?'N':'S')+
      (mbtiScores[2]>=50?'F':'T')+(mbtiScores[3]>=50?'P':'J');
    const a=classifyNature({enneagramScores,core,second,third,mbtiScores,mbti,bigFive});
    counters[a.name]=(counters[a.name]||0)+1;
  }
  console.log('Nature distribution, 16,000 deterministic profiles:',JSON.stringify(counters));
  assert.equal(Object.keys(counters).length,20);
  assert.ok(Math.max(...Object.values(counters))<16000*.25,
    'single Nature must not dominate an unbiased synthetic population');
});

test('results explain the Nature score but exports do not expose raw source data',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.match(app,/Why /);
  assert.match(app,/natureScoring\.components/);
  assert.doesNotMatch(app,/NATURE_BY_MBTI/);
});
