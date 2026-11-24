import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  generateCompleteBuild, requireCompletePersonalityInputs,
  enneagramAffinity, generateBuild
} from '../src/engine.mjs';
import { DEMOS, ENNEAGRAM_STAT_BASELINE, ENNEAGRAM_AFFINITIES, STAT_KEYS } from '../src/data.mjs';

const full={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive
};
test('build rendering rejects missing cognitive, Enneagram or Big Five tests',()=>{
  assert.throws(()=>generateCompleteBuild({...full,mbtiScores:null,typeOverride:'INTJ'}),
    /Cognitive style is required/);
  assert.throws(()=>generateCompleteBuild({...full,enneagramScores:null,tritypeOverride:'593'}),
    /Enneagram results are required/);
  assert.throws(()=>generateCompleteBuild({...full,bigFive:null}),
    /Big Five results are required/);
  assert.throws(()=>generateCompleteBuild({...full,mbtiScores:null,enneagramScores:null,bigFive:null}),
    /Cognitive style is required/);
  assert.throws(()=>requireCompletePersonalityInputs(null),/all three/);
});
test('complete alternative assessments and label overrides remain compatible',()=>{
  const pairs=[
    full,
    {...full,typeOverride:'INTJ',tritypeOverride:'593'},
    {...full,mbtiScores:null,functionScores:[45,72,12,29,52,69,21,58]},
    {...full,enneagramScores:null,enneagramRanking:[5,9,3,6,1,4,8,7,2]},
    {...full,enneagramScores:null,roweScores:[5,4,8,10,34,2,8,-4,12]}
  ];
  for(const input of pairs){
    const build=generateCompleteBuild(input);
    assert.equal(Object.values(build.baseStats).reduce((x,y)=>x+y,0),600);
    assert.ok(build.role.primary.name);
    assert.equal(build.moves.length,4);
  }
});
test('neutral reference contains no authored stat prior',()=>{
  const means=ENNEAGRAM_AFFINITIES[1].map((_,i)=>
    Object.values(ENNEAGRAM_AFFINITIES).reduce((sum,row)=>sum+row[i],0)/9);
  assert.deepEqual(ENNEAGRAM_STAT_BASELINE,means);
  const neutral=enneagramAffinity(Array(9).fill(50));
  assert.ok(neutral.every(x=>Math.abs(x-50)<1e-10),'unequal Enneagram column means should not bias the baseline: '+neutral);
  const build=generateCompleteBuild({
    mbtiScores:Array(5).fill(50),
    enneagramScores:Array(9).fill(50),
    bigFive:Array(5).fill(50)
  });
  const stats=STAT_KEYS.map(key=>build.baseStats[key]);
  assert.equal(stats.reduce((x,y)=>x+y,0),600);
  assert.deepEqual(stats,Array(6).fill(100));
  assert.ok(Math.max(...stats)-Math.min(...stats)<=1,
    'neutral profile should generate nearly equal base stats: '+stats);
  assert.ok(Math.abs(stats[2]-stats[5])<=1);
});
test('Enneagram differences remain meaningful after column centering',()=>{
  const type1=enneagramAffinity([100,0,0,0,0,0,0,0,0]);
  const type7=enneagramAffinity([0,0,0,0,0,0,100,0,0]);
  assert.ok(type1[2]>type7[2],'type 1 should emphasize Fortitude more than type 7');
  assert.ok(type7[5]>type1[5],'type 7 should emphasize Responsiveness more than type 1');
  assert.notDeepEqual(generateBuild({...full,enneagramScores:[100,0,0,0,0,0,0,0,0]}).baseStats,
    generateBuild({...full,enneagramScores:[0,0,0,0,0,0,100,0,0]}).baseStats);
});
test('no incomplete user-visible builds or type/tritype-only mode buttons remain',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(app,/generateCompleteBuild\(input\)/);
  assert.match(app,/clearIncompleteResult\(\)/);
  assert.match(app,/Big Five test results are required/);
  assert.match(html,/All three test sections required/);
  assert.doesNotMatch(html,/data-mbti-mode="type"/);
  assert.doesNotMatch(html,/data-ennea-mode="tritype"/);
});
