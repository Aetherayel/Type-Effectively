import test from 'node:test';
import assert from 'node:assert/strict';
import { amplifyDeviation, alternativeSignal, semanticFunctionAffinities,
  semanticBigFiveAffinities, semanticPercentageAffinities, SEMANTIC_FACET_COMPONENTS,
  COGNITIVE_REFERENCE, SPREAD_GAIN } from '../src/stat-model.mjs';
import { generateCompleteBuild, normalizeStats } from '../src/engine.mjs';
import { FACET_KEYS } from '../src/bigfive-facets.mjs';
const neutral=Array(6).fill(50), equalStats=Array(6).fill(100);
const avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const sd=xs=>Math.sqrt(avg(xs.map(x=>(x-100)**2)));
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, a+' != '+b);
const blank=Array(30).fill(50);
const set=(xs,key,v)=>xs.map((x,i)=>i===FACET_KEYS.indexOf(key)?v:x);
const profile={functionScores:Array(8).fill(64),enneagramScores:Array(9).fill(50),bigFive:Array(5).fill(50)};
test('V3 nonlinear signal is symmetric, monotone and preserves neutral',()=>{
  assert.equal(amplifyDeviation(0),0);
  for(let d=1;d<=150;d++){
    approx(amplifyDeviation(-d),-amplifyDeviation(d));
    assert.ok(amplifyDeviation(d)>amplifyDeviation(d-1));
  }
  assert.ok(amplifyDeviation(40)>40);
  assert.ok(amplifyDeviation(40)-amplifyDeviation(39)>amplifyDeviation(10)-amplifyDeviation(9));
});
test('uniform cognitive endorsement cannot manufacture a stat preference',()=>{
  for(const ref of [50,60,64,70,80])
    for(const v of [0,30,64,100,128,200])
      assert.deepEqual(semanticFunctionAffinities(Array(8).fill(v),ref),neutral);
  for(const v of [30,64,100]){
    const b=generateCompleteBuild({...profile,functionScores:Array(8).fill(v)});
    assert.deepEqual(Object.values(b.baseStats),equalStats);
    assert.equal(b.statModelVersion,'v3-semantic');
  }
});
test('Ni and Ne provide equivalent alternative Ingenuity but distinct expression',()=>{
  const ni=[30,100,64,64,64,80,64,64],ne=[100,30,64,64,64,80,64,64];
  const a=semanticFunctionAffinities(ni),b=semanticFunctionAffinities(ne);
  approx(a[3],b[3]);
  assert.ok(a[2]>b[2]);
  assert.ok(b[5]>a[5]);
  assert.ok(alternativeSignal(100,30,COGNITIVE_REFERENCE)>
    (amplifyDeviation(36)+amplifyDeviation(-34))/2);
  assert.ok(alternativeSignal(100,100,64)>alternativeSignal(100,30,64));
});
test('Fe directly informs responsive adaptation; no forced cognitive stat contribution for unrelated functions',()=>{
  const a=semanticFunctionAffinities([64,64,64,64,64,64,40,64]);
  const b=semanticFunctionAffinities([64,64,64,64,64,64,90,64]);
  // Direct Fe influence is most visible after removing the shared response.
  assert.ok(b[5]-b[2]>a[5]-a[2]);
});
test('facet and domain budgets are explicit and neutral, with exact uniform-group fallback',()=>{
  for(const parts of Object.values(SEMANTIC_FACET_COMPONENTS)){
    approx(sum(parts.map(p=>p.w)),1);
    for(const p of parts){approx(sum(p.mix),1);assert.ok(p.keys.every(k=>k.startsWith(p.d)));}
  }
  assert.deepEqual(semanticBigFiveAffinities(Array(5).fill(50),blank).affinities,neutral);
  const domains=[35,75,20,80,60],facets=domains.flatMap(x=>Array(6).fill(x));
  const a=semanticBigFiveAffinities(domains,null),b=semanticBigFiveAffinities(domains,facets);
  a.affinities.forEach((x,i)=>approx(x,b.affinities[i]));
  assert.deepEqual(semanticPercentageAffinities(Array(5).fill(50)),neutral);
});
test('removed proxies cannot directly raise unrelated Big Five affinities',()=>{
  const base=semanticBigFiveAffinities(null,blank).affinities;
  for(const key of ['E2','E5','A4','A5','O6','A2','N3']){
    const next=semanticBigFiveAffinities(null,set(blank,key,0)).affinities;
    approx(next[3],base[3]);
    approx(next[2],base[2]);
    if(key.startsWith('A'))approx(next[1],base[1]);
  }
  const next=semanticBigFiveAffinities(null,set(blank,'O5',95)).affinities;
  assert.ok(next[3]>base[3]);
});
test('finite uncapped framework affinities and 600 allocation hold across input modes',()=>{
  let seed=20261125;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const vec=n=>Array.from({length:n},()=>Math.floor(rand()*101));
  for(let i=0;i<400;i++){
    const input={enneagramScores:vec(9),bigFive:vec(5),...(i%2?{functionScores:vec(8)}:{mbtiScores:vec(5)})};
    if(i%3===0)input.bigFiveFacets=vec(30);
    const b=generateCompleteBuild(input),v=Object.values(b.baseStats);
    assert.equal(sum(v),600);assert.ok(v.every(x=>Number.isInteger(x)&&x>=20&&x<=180));
    assert.ok(Object.values(b.rawStatAffinities).every(Number.isFinite));
    assert.equal(new Set(b.moves.map(m=>m.name)).size,4);
    assert.equal(b.statModelVersion,'v3-semantic');
    assert.deepEqual(generateCompleteBuild(input).baseStats,b.baseStats);
    const affinities=Object.values(b.rawStatAffinities);
    const baseline=Object.values(normalizeStats(affinities));
    const amplified=Object.values(normalizeStats(affinities,600,20,180,SPREAD_GAIN));
    assert.ok(sd(amplified)+1>=sd(baseline));
  }
});

test('20–180 bounds are symmetric and reserve the same 600 BST for extreme shapes',()=>{
  assert.deepEqual(Object.values(normalizeStats([100,100,100,0,0,0],600,undefined,undefined,SPREAD_GAIN)),[180,180,180,20,20,20]);
  assert.deepEqual(Object.values(normalizeStats([0,0,0,100,100,100],600,undefined,undefined,SPREAD_GAIN)),[20,20,20,180,180,180]);
});

test('source affinities preserve exceptional positive and negative signals before allocation',()=>{
  const high=semanticBigFiveAffinities([100,100,100,100,0],null).affinities;
  const low=semanticBigFiveAffinities([0,0,0,0,100],null).affinities;
  high.forEach(x=>approx(x,125));low.forEach(x=>approx(x,-25));
  const strong=semanticFunctionAffinities([0,200,0,0,0,200,0,0]);
  assert.ok(strong[3]>100);assert.ok(strong.some(x=>x<0));
  const stronger=semanticFunctionAffinities([0,220,0,0,0,220,0,0]);
  assert.ok(stronger[3]>strong[3]);
  const b=generateCompleteBuild({...profile,functionScores:[0,200,0,0,0,200,0,0]});
  assert.ok(b.sourceStatAffinities.spa.cognition>100);
  assert.ok(b.rawStatAffinities.spa>100);
  assert.equal(sum(Object.values(b.baseStats)),600);
  assert.ok(Object.values(b.baseStats).every(x=>x>=20&&x<=180));
  assert.equal(b.baseStats.spa,180);
  assert.equal(new Set(b.moves.map(m=>m.name)).size,4);
});
