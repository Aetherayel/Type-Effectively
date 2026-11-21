import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyNature, deriveMbti, deriveTritype, generateBuild,
  inferredEnneagramScores, isValidTritype, normalizeStats,
  deriveTyping, rankingToScores
} from '../src/engine.mjs';
import {
  DEMOS, GENERATED_TYPES, ROLE_TEMPLATES, ROLE_CALIBRATED_TEMPLATES,
  ROLE_TEMPLATE_SCALE, STAT_KEYS, TYPE_AFFINITY, TYPE_COLORS
} from '../src/data.mjs';

const sum = stats => Object.values(stats).reduce((a,b)=>a+b,0);
const baseInput = {
  mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:DEMOS.architect.bigfive
};

test('all 9 Enneagram motivations have explicit scores for exactly 17 generated elements',()=>{
  assert.equal(GENERATED_TYPES.length,17);
  assert.ok(!GENERATED_TYPES.includes('Normal'));
  assert.equal(Object.keys(TYPE_COLORS).length,18,'Pokémon mechanics still support Normal');
  const expected=[...GENERATED_TYPES].sort();
  for(let core=1;core<=9;core++){
    const row=TYPE_AFFINITY[core];
    assert.deepEqual(Object.keys(row).sort(),expected,'incomplete affinities for '+core);
    for(const [type,value] of Object.entries(row))
      assert.ok(Number.isInteger(value)&&value>=0&&value<=100,core+' / '+type);
  }
});

test('v1.1 role calibration preserves six role shapes and the 535-point reference budget',()=>{
  assert.equal(ROLE_TEMPLATE_SCALE,0.75);
  assert.deepEqual(Object.keys(ROLE_CALIBRATED_TEMPLATES),Object.keys(ROLE_TEMPLATES));
  for(const [role,original] of Object.entries(ROLE_TEMPLATES)) {
    const calibrated=ROLE_CALIBRATED_TEMPLATES[role];
    assert.equal(calibrated.length,STAT_KEYS.length,role);
    const originalMean=sum(Object.fromEntries(STAT_KEYS.map((key,i)=>[key,original[i]])))/STAT_KEYS.length;
    const targetMean=535/STAT_KEYS.length;
    for(let i=0;i<STAT_KEYS.length;i++) {
      const expected=targetMean+ROLE_TEMPLATE_SCALE*(original[i]-targetMean);
      assert.ok(Math.abs(calibrated[i]-expected)<1e-10,role+' stat '+i);
      assert.ok((calibrated[i]-targetMean)*(original[i]-targetMean)>=0,role+' must keep stat direction');
    }
    assert.ok(Math.abs(calibrated.reduce((a,b)=>a+b,0)-535)<1e-8,role+' must keep 535 reference total');
    assert.ok(Math.abs(originalMean-targetMean)<1e-8,role+' original must have 535 reference total');
  }
});

test('seeded role-balance regression preserves role reachability and complete-build coherence',()=>{
  // Guard against the previous Pivot-heavy geometry; not an equal-frequency quota.
  let seed=314159;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const roles=new Map();
  const total=1500;
  for(let i=0;i<total;i++) {
    const scores=()=>Array.from({length:5},()=>Math.floor(random()*101));
    const build=generateBuild({
      mbtiScores:scores(),
      enneagramScores:Array.from({length:9},()=>Math.floor(random()*101)),
      bigFive:scores()
    });
    roles.set(build.role.primary.name,(roles.get(build.role.primary.name)||0)+1);
    assert.equal(sum(build.baseStats),535);
    assert.equal(build.archetype.role,build.role.primary.name);
    assert.equal(build.title,build.archetype.title);
    assert.equal(new Set(build.moves.map(move=>move.name)).size,4);
    assert.ok(build.heldItem.name && build.ability.name && build.hiddenAbility.name);
    assert.ok(build.report.combat.includes(build.role.primary.name));
    assert.ok(build.report.trainerTips[0].text.includes(build.moves[2].name));
    assert.ok(build.report.trainerTips[2].text.includes(build.moves[3].name));
  }
  assert.equal(roles.size,6,'every role must remain reachable');
  assert.ok(roles.get('Pivot')/total < 0.32,'Pivot domination returned: '+roles.get('Pivot')+'/'+total);
  assert.ok(roles.get('Wall')/total > 0.05,'Wall remains suppressed: '+roles.get('Wall')+'/'+total);
});

test('typing separates core+evidenced wing from supporting and hidden motivations',()=>{
  const noWing=deriveTyping({core:5,second:9,third:3});
  assert.deepEqual(noWing.types,['Ice','Water']);
  assert.equal(noWing.hiddenType,'Fighting');
  assert.deepEqual(deriveTyping({core:5,second:1,third:4,wing:4}).types,['Psychic','Steel']);
  assert.deepEqual(deriveTyping({core:5,second:1,third:4,wing:6}).types,['Ice','Steel']);
  assert.throws(()=>deriveTyping({core:1,second:2,third:3}),/one Enneagram fix from each center/);
  assert.throws(()=>deriveTyping({core:5,second:9,third:3,wing:8}),/adjacent/);
});

test('every one of 324 valid tritype/wing configurations reaches valid 17-type mechanics',()=>{
  const perms=xs=>xs.length===1?[xs]:xs.flatMap((n,i)=>perms(xs.filter((_,j)=>i!==j)).map(p=>[n,...p]));
  const visible=new Set(),hidden=new Set(),typings=new Set();
  let count=0,monotypes=0;
  for(const gut of [8,9,1])for(const heart of [2,3,4])for(const head of [5,6,7]){
    for(const [core,second,third] of perms([gut,heart,head])){
      for(const wing of [core===1?9:core-1,core===9?1:core+1]){
        const t=deriveTyping({core,second,third,wing});
        assert.ok(t.types.length===1||t.types.length===2);
        for(const type of t.types) {
          assert.ok(GENERATED_TYPES.includes(type));
          visible.add(type);
        }
        assert.ok(GENERATED_TYPES.includes(t.hiddenType));
        assert.ok(!t.types.includes(t.hiddenType),'hidden affinity must differ from visible types');
        hidden.add(t.hiddenType);
        typings.add(t.types.join('/'));
        if(t.types.length===1)monotypes++;
        count++;
      }
    }
  }
  assert.equal(count,324);
  assert.deepEqual(visible,new Set(GENERATED_TYPES),'every non-Normal type must be reachable');
  assert.deepEqual(hidden,new Set(GENERATED_TYPES),'every type must be possible as hidden affinity');
  assert.ok(typings.size>=100,'typing should remain varied');
  assert.ok(monotypes>0,'independent scoring must allow genuine monotypes');
});

test('score-derived and manually overridden identities',()=>{
  const b=generateBuild(baseInput);
  assert.equal(b.tritype,'593');
  assert.equal(b.identity,'INTJ-A');
  assert.deepEqual(b.types,['Ice','Water']);
  assert.equal(b.hiddenType,'Fighting');
  assert.equal(b.nature,'Quiet');

  const reversed=generateBuild({...baseInput,tritypeOverride:'539'});
  assert.deepEqual(reversed.types,['Ice','Electric']);
  assert.equal(reversed.hiddenType,'Water');

  const wife=generateBuild({...baseInput,...{
    mbtiScores:DEMOS.catalyst.mbti,enneagramScores:DEMOS.catalyst.enneagram,
    bigFive:DEMOS.catalyst.bigfive,typeOverride:'ESFP',tritypeOverride:'714'
  }});
  assert.deepEqual(wife.types,['Electric','Steel']);
  assert.equal(wife.hiddenType,'Psychic');
  assert.equal(wife.nature,'Jolly');
});

test('tritypes enforce exactly one type per center',()=>{
  assert.equal(isValidTritype('593'),true);
  assert.equal(isValidTritype('714'),true);
  for(const value of ['595','532','123','5a9','59','000','888','']) assert.equal(isValidTritype(value),false,value);
  assert.throws(()=>generateBuild({...baseInput,tritypeOverride:'555'}),/Tritype/);
});

test('ranking converts into well-ordered, distinctive proxy scores',()=>{
  const ranks=[5,9,3,6,1,4,8,7,2];
  const scores=rankingToScores(ranks);
  assert.equal(deriveTritype(scores),'593');
  assert.equal(scores[4],100);
  assert.throws(()=>rankingToScores([5,5,3,4,1,6,7,8,9]),/exactly once/);
  assert.equal(deriveTritype(inferredEnneagramScores('593')),'593');
});

test('nature changes two non-HP stats and leaves base stats unchanged',()=>{
  const b=generateBuild(baseInput);
  const effective=applyNature(b.baseStats,'Quiet');
  assert.equal(effective.hp,b.baseStats.hp);
  assert.equal(effective.spa,Math.floor(b.baseStats.spa*1.1));
  assert.equal(effective.spe,Math.floor(b.baseStats.spe*.9));
  assert.equal(sum(b.baseStats),535);
});

test('all 162 ordered tritypes are valid builds, with exactly four distinct moves',()=>{
  const permutations=xs=>xs.length===1?[xs]:xs.flatMap((n,i)=>permutations(xs.filter((_,j)=>i!==j)).map(p=>[n,...p]));
  let count=0;
  for(const head of [5,6,7])for(const heart of [2,3,4])for(const gut of [8,9,1]){
    for(const perm of permutations([head,heart,gut])){
      const build=generateBuild({mbtiScores:baseInput.mbtiScores,bigFive:baseInput.bigFive,tritypeOverride:perm.join('')});
      assert.equal(sum(build.baseStats),535);
      assert.equal(new Set(build.moves.map(x=>x.name)).size,4);
      assert.ok(build.types.length===1||build.types.length===2);
      assert.ok(build.role.primary.score>=0&&build.role.primary.score<=100);
      count++;
    }
  }
  assert.equal(count,162);
});

test('monotype arises only when primary and secondary independently converge',()=>{
  const build=generateBuild({
    ...baseInput,tritypeOverride:'836',wingOverride:9
  });
  assert.equal(build.monotype,true);
  assert.equal(build.types.length,1);
  assert.ok(!build.types.includes(build.hiddenType));
  assert.equal(build.moves.length,4);
  assert.ok(build.moves[1].category.includes('hidden affinity'));
});

test('stat normalization holds under severe extremes',()=>{
  for(const affinity of [
    [0,0,0,0,0,100], [100,0,100,0,100,0], [50,50,50,50,50,50]
  ]){
    const stats=normalizeStats(affinity);
    assert.equal(sum(stats),535);
    assert.ok(Object.values(stats).every(value=>value>=45&&value<=140));
  }
});

test('seeded randomized builds preserve total, limits, determinism, and move uniqueness',()=>{
  let seed=2919;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const roles=new Set();
  for(let i=0;i<750;i++){
    const input={
      mbtiScores:Array.from({length:5},()=>Math.floor(rand()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(rand()*101)),
      bigFive:Array.from({length:5},()=>Math.floor(rand()*101))
    };
    const build=generateBuild(input);
    const stats=Object.values(build.baseStats);
    assert.equal(sum(build.baseStats),535);
    assert.ok(stats.every(n=>n>=45&&n<=140));
    assert.equal(new Set(build.moves.map(m=>m.name)).size,4);
    assert.deepEqual(generateBuild(input).baseStats,build.baseStats);
    roles.add(build.role.primary.name);
  }
  assert.equal(roles.size,6,'every battle role should be attainable');
});

test('type-only inputs do not fabricate a wing for elemental identity',()=>{
  const b=generateBuild({typeOverride:'INTJ',tritypeOverride:'593'});
  assert.equal(b.identity,'INTJ');
  assert.equal(b.warnings.length,3);
  assert.equal(b.typingWing,null);
  assert.deepEqual(b.types,['Ice','Water']);
  assert.equal(sum(b.baseStats),535);
  const override=generateBuild({typeOverride:'INTJ',tritypeOverride:'514',wingOverride:4});
  assert.equal(override.typingWing,4);
  assert.deepEqual(override.types,['Psychic','Steel']);
});
