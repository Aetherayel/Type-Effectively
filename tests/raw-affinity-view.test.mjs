import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateBuild, normalizeStats } from '../src/engine.mjs';
import { SPREAD_GAIN } from '../src/stat-model.mjs';
import { DEMOS, STAT_KEYS } from '../src/data.mjs';
import { affinityViewData, renderAffinityComparison } from '../src/stat-affinity-ui.mjs';

const full={mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:DEMOS.architect.bigfive};
const total=build=>STAT_KEYS.reduce((sum,key)=>sum+build.baseStats[key],0);

test('raw pre-normalization affinities and source values are returned alongside unchanged fixed BST',()=>{
  for(const input of [
    full,
    {...full,functionScores:[20,90,20,30,75,40,25,60],mbtiScores:null},
    {...full,bigFive:[27,94,21,69,14]}
  ]){
    const b=generateBuild(input);
    assert.equal(total(b),600);
    const {mean,rows}=affinityViewData(b);
    assert.equal(rows.length,6);
    assert.ok(mean>=0&&mean<=100);
    for(const row of rows){
      const weights=row.weights,values=row.sources;
      const expected=weights.bigFive*values.bigFive+
        weights.enneagram*values.enneagram+weights.cognition*values.cognition;
      assert.ok(Math.abs(row.affinity-expected)<=.15,
        row.key+' raw score must be the unnormalized weighted source blend');
      assert.ok(Math.abs(row.affinity-b.affinities[row.key])<=.5,
        'legacy integer compatibility affinity must remain the same signal');
      assert.ok(row.affinity>=0&&row.affinity<=100);
    }
    assert.ok(Math.abs(rows.reduce((sum,row)=>sum+row.distance,0))<1e-8,
      'distance from own mean must sum to zero');
    const recomputed=normalizeStats(rows.map(row=>row.affinity),600,40,160,SPREAD_GAIN);
    for(const key of STAT_KEYS)assert.ok(Math.abs(recomputed[key]-b.baseStats[key])<=1,
      'display rounding must not disguise a different base build');
  }
});

test('the separate affinity display reports meaningful raw scores, personal mean and all sources',()=>{
  const b=generateBuild({...full,bigFive:[22,83,26,61,17]});
  const markup=renderAffinityComparison(b);
  const {mean,rows}=affinityViewData(b);
  assert.match(markup,/id="stat-view-affinity-panel" hidden/);
  assert.match(markup,/not Pokémon base stats, test percentiles/);
  assert.match(markup,/not a population ranking/);
  assert.match(markup,/Show Big Five, Enneagram and cognition contributions/);
  assert.match(markup,/fixed/);
  assert.equal((markup.match(/class="affinity-row" data-affinity-stat="/g)||[]).length,6);
  assert.equal((markup.match(/class="affinity-meter-mean"/g)||[]).length,6);
  assert.equal((markup.match(/class="affinity-number"/g)||[]).length,6);
  assert.equal((markup.match(/<tr><th scope="row">/g)||[]).length,6);
  assert.ok(markup.includes('Your six-affinity mean: <strong>'+mean.toFixed(1)+'</strong>'));
  assert.ok(markup.includes('Pokémon base stat: '+b.baseStats.spa));
  assert.ok(rows.some(row=>row.distance>0)&&rows.some(row=>row.distance<0));
  assert.ok(markup.includes('modeled personality affinities before stat normalization'));
});

test('high absolute affinity may still receive below-average fixed-budget base stat',()=>{
  const example={
    rawStatAffinities:{hp:90,atk:84,def:88,spa:75,spd:86,spe:79},
    baseStats:{hp:111,atk:103,def:109,spa:89,spd:105,spe:83},
    statWeights:Object.fromEntries(STAT_KEYS.map(key=>[key,{bigFive:.5,enneagram:.3,cognition:.2}])),
    sourceStatAffinities:Object.fromEntries(STAT_KEYS.map(key=>[key,{bigFive:75,enneagram:75,cognition:75}]))
  };
  const {mean,rows}=affinityViewData(example);
  assert.ok(mean>75,'example has a six-affinity mean above Ingenuity');
  const ingenuity=rows.find(row=>row.key==='spa');
  assert.equal(ingenuity.affinity,75);
  assert.ok(ingenuity.distance<0);
  assert.ok(ingenuity.baseStat<600/6);
});

test('the affinity inspection UI is independent of PNG exports and downstream mechanics',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const exportCode=readFileSync(new URL('../src/export-card.mjs',import.meta.url),'utf8');
  assert.match(app,/renderAffinityComparison\(build\)/);
  assert.match(app,/id="stat-view-affinity"/);
  assert.match(app,/id="stat-view-bst"/);
  assert.match(app,/setStatView/);
  assert.match(app,/aria-pressed/);
  assert.match(exportCode,/renderStatRadar\(build\.baseStats,build\.effectiveStats\)/);
  assert.doesNotMatch(exportCode,/renderAffinityComparison|stat-view-affinity-panel/,
    'public export must stay Pokémon-BST-based, regardless of selected diagnostic view');
  assert.doesNotMatch(app,/normalizeStats\(build\.rawStatAffinities\)/,
    'display toggles must not recalculate the build');
});

test('invalid/incomplete raw affinity objects are rejected rather than inventing scores',()=>{
  const b=generateBuild(full);
  assert.throws(()=>renderAffinityComparison({...b,rawStatAffinities:{...b.rawStatAffinities,spa:NaN}}),
    /Six unnormalized affinities/);
  assert.throws(()=>renderAffinityComparison({...b,sourceStatAffinities:{}}),
    /requires a complete scored build/);
});
