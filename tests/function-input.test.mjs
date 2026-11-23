import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveFunctionPreferences, FUNCTION_KEYS } from '../src/functions.mjs';
import { deriveMbti, generateBuild } from '../src/engine.mjs';
import { DEMOS, TEST_LINKS } from '../src/data.mjs';

const totals=[20,90,20,30,75,40,25,60]; // Ne Ni Se Si Te Ti Fe Fi
const input={
  functionScores:totals,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive
};

test('function scores form transparent, bounded, continuous preference contrasts',()=>{
  assert.deepEqual(FUNCTION_KEYS,['Ne','Ni','Se','Si','Te','Ti','Fe','Fi']);
  const axes=deriveFunctionPreferences(totals);
  assert.deepEqual(axes,[60,65,42.5,35,50]);
  assert.equal(deriveMbti(axes),'INTJ');
  assert.deepEqual(deriveFunctionPreferences(Array(8).fill(50)),[50,50,50,50,50]);
  assert.deepEqual(deriveFunctionPreferences([0,100,0,0,100,0,0,0]),[50,75,25,25,50]);
  assert.deepEqual(deriveFunctionPreferences(totals.map(x=>x+100)),axes,'uniform score offset should not alter contrasts');
});

test('function input yields a coherent 535-point build without fabricated A/T',()=>{
  const build=generateBuild(input);
  assert.equal(build.cognitiveSource,'functions');
  assert.equal(build.mbti,'INTJ');
  assert.equal(build.identity,'INTJ');
  assert.equal(build.identityPreference,null);
  assert.equal(build.nature,'Quiet');
  assert.equal(build.baseStats.hp+build.baseStats.atk+build.baseStats.def+build.baseStats.spa+build.baseStats.spd+build.baseStats.spe,535);
  assert.ok(build.warnings.some(w=>w.includes('A/T axis')));
  assert.deepEqual(generateBuild(input).baseStats,build.baseStats);
  assert.equal(build.moves.length,4);
  assert.ok(build.report.combat);
});

test('different function strengths can change the build without changing four-letter category',()=>{
  const first=generateBuild(input);
  const second=generateBuild({...input,functionScores:[25,80,22,40,60,35,30,55]});
  assert.equal(second.mbti,first.mbti);
  assert.notDeepEqual(second.breakdown.mbti,first.breakdown.mbti);
  assert.notDeepEqual(second.affinities,first.affinities);
});

test('function input stays mutually exclusive with legacy cognition and validates eight scores',()=>{
  assert.throws(()=>deriveFunctionPreferences([10,20,30]),/eight numeric/);
  assert.throws(()=>deriveFunctionPreferences([...totals.slice(0,7),Number.NaN]),/eight numeric/);
  assert.throws(()=>deriveFunctionPreferences([...totals.slice(0,7),'50']),/eight numeric/);
  assert.throws(()=>generateBuild({...input,mbtiScores:DEMOS.architect.mbti}),/not both/);
  assert.throws(()=>generateBuild({...input,identityPreference:'X'}),/must be Assertive/);
  assert.throws(()=>generateBuild({...input,mbtiScores:DEMOS.architect.mbti,typeOverride:'INFJ'}),/not both/);
  assert.throws(()=>generateBuild({mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,identityPreference:'A'}),/only accompany/);
  const previous=generateBuild({mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:DEMOS.architect.bigfive});
  assert.equal(previous.identity,'INTJ-A');
  assert.equal(previous.cognitiveSource,'16personalities');
});

test('optional A/T uses a disclosed type-only proxy, never a fabricated measurement',()=>{
  const unspecified=generateBuild(input);
  const assertive=generateBuild({...input,identityPreference:'A'});
  const turbulent=generateBuild({...input,identityPreference:'T'});
  assert.equal(unspecified.identity,'INTJ');
  assert.equal(unspecified.identityPreference,null);
  assert.equal(assertive.identity,'INTJ-A');
  assert.equal(turbulent.identity,'INTJ-T');
  assert.equal(assertive.identityPreference,'A');
  assert.equal(turbulent.identityPreference,'T');
  assert.equal(assertive.breakdown.mbti.length,6);
  assert.notDeepEqual(assertive.breakdown.mbti,unspecified.breakdown.mbti);
  assert.notDeepEqual(turbulent.breakdown.mbti,assertive.breakdown.mbti);
  assert.ok(assertive.warnings.some(note=>note.includes('75/25 type-only proxy')));
  assert.ok(unspecified.warnings.some(note=>note.includes('A/T axis was not provided')));
  assert.deepEqual(generateBuild({...input,identityPreference:'A'}).baseStats,assertive.baseStats);
});

test('manual Sakinorva type override changes Nature scoring inputs, not raw function affinities',()=>{
  const inferred=generateBuild(input);
  const chosen=generateBuild({...input,typeOverride:'ENFP',identityPreference:'A'});
  assert.equal(chosen.suggestedType,'INTJ');
  assert.equal(chosen.mbti,'ENFP');
  assert.equal(chosen.identity,'ENFP-A');
  assert.equal(chosen.natureScoring.cognitionEstimated,false);
  assert.notDeepEqual(chosen.natureScoring.priorities,inferred.natureScoring.priorities,
    'overridden preference poles must affect the Nature candidates');
  assert.deepEqual(chosen.breakdown.mbti,generateBuild({...input,identityPreference:'A'}).breakdown.mbti);
  assert.deepEqual(chosen.types,inferred.types,'Enneagram typing is unchanged');
  assert.ok(chosen.warnings.some(note=>note.includes('overrides the function-derived INTJ')));
  assert.ok(chosen.natureScoring.components.cognition>0);
  assert.throws(()=>generateBuild({...input,typeOverride:'FAKE'}),/Invalid MBTI type/);
});

test('comprehensive recommendations and share-link controls are present',()=>{
  assert.equal(TEST_LINKS.functions,'https://sakinorva.net/test/function_bunya');
  assert.equal(TEST_LINKS.rowe,'https://sakinorva.net/test/rowe');
  assert.equal(TEST_LINKS.ipipneo300,'https://ipipneo.com/en/ipip-neo-300');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.match(html,/data-test-mode="advanced"/);
  assert.match(html,/data-mbti-mode="functions"/);
  assert.match(html,/id="function-score-fields"/);
  assert.match(html,/id="function-identity"/);
  assert.match(html,/id="mbti-override"/);
  assert.match(app,/input\.functionScores/);
  assert.match(app,/setTestingPath\(payload\.mode\.testing/);
  assert.match(app,/const functionScores=state\.mbtiMode==='functions'/);
  assert.match(app,/identityPreference=state\.mbtiMode==='functions'/);
  assert.match(app,/input\.identityPreference/);
});
