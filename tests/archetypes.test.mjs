import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPE_CATALOG, ARCHETYPE_PROTOTYPES, ARCHETYPE_WEIGHTS, classifyArchetype } from '../src/archetypes.mjs';
import { DEMOS } from '../src/data.mjs';
import { deriveTritype, generateBuild } from '../src/engine.mjs';
import { getDefensiveMatchups } from '../src/matchups.mjs';

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

test('every one of the 36 identities is reachable with its representative full-profile scores',()=>{
  const reached=new Set();
  for(const profile of ARCHETYPE_PROTOTYPES){
    const [core,second,third]=deriveTritype(profile.ennea).split('').map(Number);
    const mbti=(profile.mbti[0]>=50?'I':'E')+(profile.mbti[1]>=50?'N':'S')+
      (profile.mbti[2]>=50?'F':'T')+(profile.mbti[3]>=50?'P':'J');
    for(const wanted of roleNames){
      const chosen=classifyArchetype({
        enneagramScores:profile.ennea,mbtiScores:profile.mbti,bigFive:profile.ocean,
        mbti,core,second,third,
        role:{all:roleNames.map(name=>({name,score:name===wanted?90:45}))}
      });
      assert.equal(chosen.id,profile.id+'-'+wanted.toLowerCase());
      reached.add(chosen.id);
    }
  }
  assert.equal(reached.size,36);
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
  assert.match(build.report.dexEntry,/This (?:[A-Za-z]+(?: \/ [A-Za-z]+)?)-type Pokémon/);
  assert.match(build.report.dexEntry,/\./);
  assert.equal(build.report.trainerTips.length,3);
  assert.ok(build.report.trainerTips[0].text.includes(build.moves[2].name),
    'battle drill must name the selected role tactic');
  assert.ok(build.report.trainerTips[0].text.includes(build.role.primary.name));
  assert.ok(build.report.trainerTips[1].text.includes('partner') ||
    build.report.trainerTips[1].text.includes('switch'));
  assert.ok(build.report.trainerTips[2].text.includes(build.moves[3].name),
    'growth drill must name the actual growth move');
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
  assert.match(build.report.temperament,/No measured Big Five scores were supplied/);
  assert.match(build.report.twist,/temperament data is missing/);
  assert.equal(build.title,build.archetype.title);
});

test('trainer briefing accurately calls out a real four-times type weakness',()=>{
  const candidates=[
    {typeOverride:'INTJ',tritypeOverride:'514'},
    {typeOverride:'INTJ',tritypeOverride:'593'},
    {typeOverride:'ESFP',tritypeOverride:'714'}
  ].map(input=>generateBuild(input));
  const candidate=candidates.find(build=>build.report.trainerTips[1].text.includes('4× damage'));
  assert.ok(candidate,'at least one sampled build should have a four-times type weakness');
  const matchup=getDefensiveMatchups(candidate.types);
  assert.ok(matchup.quadWeak.length>0);
  for(const entry of matchup.quadWeak)
    assert.ok(candidate.report.trainerTips[1].text.includes(entry.type));
});

test('near-neutral measured OCEAN scores do not trigger exaggerated trait claims',()=>{
  const build=generateBuild({
    mbtiScores:DEMOS.architect.mbti,
    enneagramScores:DEMOS.architect.enneagram,
    bigFive:[50,51,49,50,50]
  });
  assert.match(build.report.temperament,/fairly close to the midpoint/);
  assert.doesNotMatch(build.report.temperament,/loudest OCEAN/);
});

test('archetype scores are not simulated probabilities',()=>{
  const winner=classifyArchetype(base);
  assert.ok(winner.method.includes('motivation 25'));
  assert.ok(!('probability' in winner));
  assert.ok(!('confidence' in winner));
});
