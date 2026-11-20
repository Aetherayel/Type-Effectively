import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPE_CATALOG, ARCHETYPE_WEIGHTS, classifyArchetype } from '../src/archetypes.mjs';
import { DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';

const roleNames=['Sweeper','Wall','Tank','Pivot','Support','Controller'];
const roleShape=(favorite='Controller')=>({
  primary:{name:favorite,score:88},
  secondary:null,
  all:roleNames.map(name=>({name,score:name===favorite?88:45}))
});
const mediumEnnea=[55,55,55,55,55,55,55,55,55];
const base={
  enneagramScores:mediumEnnea,mbtiScores:[75,75,25,25,30],
  bigFive:[80,85,30,40,30],mbti:'INTJ',
  core:5,second:1,third:3,role:roleShape()
};

test('36 curated archetype identities span every operating style and battle expression',()=>{
  assert.equal(ARCHETYPE_CATALOG.length,36);
  assert.equal(new Set(ARCHETYPE_CATALOG.map(x=>x.id)).size,36);
  assert.equal(new Set(ARCHETYPE_CATALOG.map(x=>x.title)).size,36);
  assert.equal(new Set(ARCHETYPE_CATALOG.map(x=>x.mode)).size,6);
  for(const mode of new Set(ARCHETYPE_CATALOG.map(x=>x.mode))){
    assert.deepEqual(
      ARCHETYPE_CATALOG.filter(x=>x.mode===mode).map(x=>x.role),
      roleNames
    );
  }
  assert.ok(ARCHETYPE_CATALOG.every(x=>x.title.startsWith('The ') && x.gift && x.shadow && x.signature));
  assert.equal(Object.values(ARCHETYPE_WEIGHTS).reduce((a,b)=>a+b,0),1);
});

test('whole-build classification is deterministic, explainable, and role-sensitive',()=>{
  const first=classifyArchetype(base);
  assert.deepEqual(classifyArchetype(base),first);
  assert.ok(first.title.startsWith('The '));
  assert.equal(first.role,'Controller');
  assert.equal(first.alternatives.length,3);
  assert.equal(Object.keys(first.breakdown).length,4);
  for(const value of Object.values(first.breakdown))
    assert.ok(value>=0 && value<=100);
  assert.ok(first.score>=0 && first.score<=100);
  assert.ok(first.margin>=0);
  assert.notEqual(classifyArchetype({...base,role:roleShape('Sweeper')}).title,first.title);
});

test('same core and battle style need not dictate the archetype',()=>{
  const strategic=classifyArchetype(base);
  const energetic=classifyArchetype({...base,mbtiScores:[15,55,25,80,25],mbti:'ENTP',
    bigFive:[75,55,95,35,25]});
  assert.notEqual(strategic.mode,energetic.mode);
  assert.equal(strategic.role,energetic.role);
});

test('final build retains generator rules while gaining a real field report',()=>{
  const input={
    mbtiScores:DEMOS.architect.mbti,
    enneagramScores:DEMOS.architect.enneagram,
    bigFive:DEMOS.architect.bigfive
  };
  const build=generateBuild(input);
  assert.equal(build.title,build.archetype.title);
  assert.ok(ARCHETYPE_CATALOG.some(x=>x.id===build.archetype.id));
  assert.equal(Object.values(build.baseStats).reduce((a,b)=>a+b,0),535);
  assert.equal(build.moves.length,4);
  assert.ok(build.report.opener.includes(build.archetype.modeJoke));
  assert.ok(build.report.motives.includes(String(build.core)));
  assert.ok(build.report.combat.includes(build.role.primary.name));
  assert.ok(build.report.growth.includes(build.moves[3].name));
  assert.match(build.report.reasoning,/game-design similarities/);
  for(const key of ['opener','motives','thinking','temperament','combat','tradeoff',
    'twist','team','growth','reasoning','caution'])
    assert.ok(build.report[key].length>30,'Missing '+key);
  assert.equal('bigFive' in build,false);
  assert.equal('enneagramScores' in build,false);
});

test('estimated temperament is explained, not asserted as measured',()=>{
  const build=generateBuild({typeOverride:'INTJ',tritypeOverride:'513'});
  assert.match(build.report.temperament,/not supplied/);
  assert.match(build.report.twist,/Missing temperament data/);
  assert.equal(build.title,build.archetype.title);
});

test('archetype scores are not simulated probabilities',()=>{
  const winner=classifyArchetype(base);
  assert.ok(winner.method.includes('motivation 25'));
  assert.ok(!('probability' in winner));
  assert.ok(!('confidence' in winner));
});
