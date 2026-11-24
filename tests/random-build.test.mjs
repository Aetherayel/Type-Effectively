import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateRandomBuildInput } from '../src/random-build.mjs';
import { generateBuild, deriveMbti, deriveTritype, isValidTritype } from '../src/engine.mjs';
import { MBTI_TYPES } from '../src/data.mjs';
import { BATTLE_ROLE_NAMES } from '../src/card-art.mjs';

const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

function seededRng(initial=3711) {
  let seed=initial;
  return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
}

test('random generator emits complete valid inputs, not a fabricated result card',()=>{
  const random=seededRng();
  for(let i=0;i<400;i++){
    const profile=generateRandomBuildInput(random);
    assert.equal(profile.mbtiScores.length,5);
    assert.equal(profile.enneagramScores.length,9);
    assert.equal(profile.bigFive.length,5);
    for(const [key,count] of [['mbtiScores',5],['enneagramScores',9],['bigFive',5]]) {
      assert.ok(profile[key].every(value=>Number.isInteger(value)&&value>=0&&value<=100),key);
      assert.equal(profile[key].length,count);
    }
    assert.equal(profile.typeOverride,'');
    assert.equal(profile.tritypeOverride,'');
    assert.equal(profile.wingOverride,'');
    assert.equal(profile.enneagramRanking,null);
    const build=generateBuild(profile);
    assert.equal(build.suggestedType,build.mbti);
    assert.equal(build.suggestedTritype,build.tritype);
    assert.equal(deriveMbti(profile.mbtiScores),build.mbti);
    assert.equal(deriveTritype(profile.enneagramScores),build.tritype);
    assert.ok(isValidTritype(build.tritype));
    assert.equal(Object.values(build.baseStats).reduce((sum,n)=>sum+n,0),600);
    assert.equal(build.warnings.length,0,'all three measured fields should be populated, not estimated');
    assert.ok(build.oceanBinary!==null);
  }
});

test('random samples explore all MBTI types, ordered tritypes and six role emblems',()=>{
  const random=seededRng();
  const mbti=new Set(),tritypes=new Set(),roles=new Set(),typings=new Set(),items=new Set();
  for(let i=0;i<2200;i++){
    const b=generateBuild(generateRandomBuildInput(random));
    mbti.add(b.mbti);tritypes.add(b.tritype);roles.add(b.role.primary.name);
    typings.add(b.types.join('/'));items.add(b.heldItem.name);
  }
  assert.deepEqual(mbti,new Set(MBTI_TYPES));
  assert.equal(tritypes.size,162,'3 center choices × 3 × 3 × six orders');
  assert.deepEqual(roles,new Set(BATTLE_ROLE_NAMES));
  assert.ok(typings.size>=90,'should visit many type-art pairings');
  assert.ok(items.size>=50,'should show a variety of held items');
});

test('seed injection makes explorations reproducible for automated tests',()=>{
  const first=seededRng(12345),second=seededRng(12345);
  const a=Array.from({length:20},()=>generateRandomBuildInput(first));
  const b=Array.from({length:20},()=>generateRandomBuildInput(second));
  assert.deepEqual(a,b);
  assert.notDeepEqual(a[0],a[1]);
});

test('Randomize is accessible beside the on-site card, not a submit button',()=>{
  assert.match(page,/<button id="randomize-button"[^>]*type="button"/);
  assert.match(page,/aria-label="Generate a random sample Pokémon"/);
  assert.ok(page.indexOf('id="randomize-button"')>page.indexOf('class="result-column"'));
  assert.ok(css.includes('.result-header-actions{display:flex'));
  assert.ok(css.includes('.randomize-button:hover'));
  assert.ok(app.includes("addEventListener('click',()=>exploreSample())"));
});

test('randomize fills editable score controls, runs genuine engine, and labels samples',()=>{
  const source=app.slice(app.indexOf('function randomizeBuild()'),app.indexOf('function init()'));
  assert.ok(source.includes('generateRandomBuildInput()'));
  assert.ok(source.includes("setMode('mbti','scores')"));
  assert.ok(source.includes("setMode('ennea','scores')"));
  for(const [prefix,key] of [['mbti','mbtiScores'],['ennea','enneagramScores'],['bigfive','bigFive']])
    assert.ok(source.includes("setScores('"+prefix+"',input."+key+")"));
  assert.ok(source.includes("state.touched={mbti:true,functions:false,enneagram:true,rowe:false,bigfive:true}"));
  assert.ok(source.includes("FUNCTION_KEYS.forEach"),'random builds must clear stale function inputs');
  assert.ok(source.includes('runBuild(false,true)'),'randomized build should stay in result view');
  assert.ok(app.includes("const build=generateCompleteBuild(input)"),'use complete-input build engine');
  assert.ok(app.includes('RANDOM SAMPLE · SYNTHETIC SCORES'));
  assert.ok(app.includes("state.isSample?'RANDOM SAMPLE':'BUILD COMPLETE'"));
  assert.ok(app.includes('sample:state.isSample'),'share links should preserve the sample label');
  assert.ok(app.includes('runBuild(false,payload.sample===true,payload.buildVersion??null)'),'restored samples retain origin and label');
  assert.ok(app.includes("history.replaceState(null,'',location.pathname+location.search)"),
    'randomizing a shared build must clear its stale hash');
});

test('manual generation and Reset clear the synthetic-sample status',()=>{
  assert.ok(app.includes('function runBuild(scroll=true,isSample=false,sharedVersion=undefined)'));
  assert.ok(app.includes('state.isSample=isSample;'));
  assert.ok(app.includes('state.lastBuild=null;state.lastInput=null;state.isSample=false'));
  assert.match(app,/addEventListener\('submit',event=>\{event.preventDefault\(\);runBuild\(\);\}\)/);
});
