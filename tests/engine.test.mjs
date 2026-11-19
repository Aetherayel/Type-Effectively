import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyNature, deriveMbti, deriveTritype, generateBuild,
  inferredEnneagramScores, isValidTritype, normalizeStats,
  pairType, rankingToScores
} from '../src/engine.mjs';
import { DEMOS, PAIR_TYPES, TYPE_COLORS } from '../src/data.mjs';

const sum = stats => Object.values(stats).reduce((a,b)=>a+b,0);
const baseInput = {
  mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:DEMOS.architect.bigfive
};

test('36 unique pairings cover the 18 standard types exactly twice',()=>{
  assert.equal(Object.keys(PAIR_TYPES).length,36);
  for(const type of Object.keys(TYPE_COLORS)){
    assert.equal(Object.values(PAIR_TYPES).filter(x=>x===type).length,2,type);
  }
  assert.equal(pairType(5,9),'Ice');
  assert.equal(pairType(9,5),'Ice');
  assert.equal(pairType(5,3),'Steel');
});

test('score-derived and manually overridden identities',()=>{
  const b=generateBuild(baseInput);
  assert.equal(b.tritype,'593');
  assert.equal(b.identity,'INTJ-A');
  assert.deepEqual(b.types,['Ice','Steel']);
  assert.equal(b.hiddenType,'Normal');
  assert.equal(b.nature,'Quiet');

  const reversed=generateBuild({...baseInput,tritypeOverride:'539'});
  assert.deepEqual(reversed.types,['Steel','Ice']);
  assert.equal(reversed.hiddenType,'Normal');

  const wife=generateBuild({...baseInput,...{
    mbtiScores:DEMOS.catalyst.mbti,enneagramScores:DEMOS.catalyst.enneagram,
    bigFive:DEMOS.catalyst.bigfive,typeOverride:'ESFP',tritypeOverride:'714'
  }});
  assert.deepEqual(wife.types,['Electric','Ghost']);
  assert.equal(wife.hiddenType,'Ice');
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

test('monotype pairings collapse duplicate types while preserving hidden coverage',()=>{
  const build=generateBuild({...baseInput,tritypeOverride:'351'});
  assert.deepEqual(build.types,['Steel']);
  assert.equal(build.monotype,true);
  assert.equal(build.hiddenType,'Psychic');
  assert.equal(build.moves.length,4);
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

test('type-only inputs are supported but marked as estimated',()=>{
  const b=generateBuild({typeOverride:'INTJ',tritypeOverride:'593'});
  assert.equal(b.identity,'INTJ');
  assert.equal(b.warnings.length,3);
  assert.equal(sum(b.baseStats),535);
});
