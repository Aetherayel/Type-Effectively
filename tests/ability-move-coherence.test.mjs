import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBuild, chooseHiddenAbility } from '../src/engine.mjs';
import { ABILITIES, GROWTH_MOVES, MOVE_SYNERGIES, ROLE_MOVES } from '../src/data.mjs';
import { generateRandomBuildInput } from '../src/random-build.mjs';

const scoreInputs={
  mbtiScores:[86,84,22,16,30],
  bigFive:[80,90,20,60,15]
};

const permutations=xs=>[
  [xs[0],xs[1],xs[2]],[xs[0],xs[2],xs[1]],
  [xs[1],xs[0],xs[2]],[xs[1],xs[2],xs[0]],
  [xs[2],xs[0],xs[1]],[xs[2],xs[1],xs[0]]
];

test('every selectable role or growth move has defined elemental and fix meaning',()=>{
  const named=new Set();
  for(const role of Object.values(ROLE_MOVES))
    for(const pool of Object.values(role))
      for(const move of pool)named.add(move);
  for(const growth of Object.values(GROWTH_MOVES)){
    assert.equal(growth.choices.length,5);
    assert.ok(growth.reason.length>20);
    for(const move of growth.choices)named.add(move);
  }
  for(const move of named){
    const affinity=MOVE_SYNERGIES[move];
    assert.ok(affinity,'missing type/fix affinity: '+move);
    assert.ok(affinity.types.length>0,'no elemental meaning: '+move);
    assert.ok(affinity.fixes.length>0,'no Enneagram meaning: '+move);
  }
});

test('Pivot tactics switch our own Pokémon; setup passing and other utility stay distinct',()=>{
  // Baton Pass can switch in the game, but this app reserves Pivot for
  // tempo/repositioning rather than passing setup boosts to a teammate.
  const selfSwitches=new Set([
    'U-turn','Flip Turn','Volt Switch','Parting Shot',
    'Chilly Reception','Teleport','Shed Tail'
  ]);
  for(const [style,moves] of Object.entries(ROLE_MOVES.Pivot)){
    assert.equal(moves.length,6,style);
    assert.equal(new Set(moves).size,moves.length,style);
    assert.ok(moves.every(move=>selfSwitches.has(move)),
      'non-pivot move listed for '+style+': '+moves.filter(move=>!selfSwitches.has(move)));
    assert.ok(!moves.includes('Baton Pass'),style);
  }
  assert.ok(GROWTH_MOVES[5].choices.includes('Baton Pass'),
    'keep Baton Pass where its sharing/setup meaning belongs');
  assert.ok(MOVE_SYNERGIES['Shed Tail'],
    'every new self-switch move needs affinity weights');
});

test('Fire/Fighting and Water/Ice Hidden Abilities are compatible with their visible typing',()=>{
  const stats={hp:95,atk:115,def:100,spa:70,spd:90,spe:65};
  for(const [types,role,second,third,standard,forbidden] of [
    [['Fire','Fighting'],'Tank',3,8,'Guts','Sand Force'],
    [['Water','Ice'],'Wall',9,5,'Regenerator','Solid Rock']
  ]){
    const actual=chooseHiddenAbility({
      role,types,stats,second,third,
      standard:ABILITIES.find(item=>item.name===standard)
    });
    const candidate=ABILITIES.find(item=>item.name===actual);
    assert.ok(candidate?.types.some(type=>types.includes(type)),types.join('/'));
    assert.notEqual(actual,standard);
    assert.notEqual(actual,forbidden);
  }
});

test('all 324 tritype/wing combinations give coherent, distinct abilities and unique moves',()=>{
  let count=0;
  for(const gut of [8,9,1])for(const heart of [2,3,4])for(const head of [5,6,7]){
    for(const trio of permutations([gut,heart,head])){
      const [core]=trio;
      for(const wing of [core===1?9:core-1,core===9?1:core+1]){
        const b=generateBuild({...scoreInputs,tritypeOverride:trio.join(''),wingOverride:wing});
        const hidden=ABILITIES.find(ability=>ability.name===b.hiddenAbility);
        assert.ok(hidden?.types.some(type=>b.types.includes(type)),
          'off-type hidden ability for '+b.tritype+'w'+wing+': '+b.hiddenAbility);
        assert.notEqual(b.hiddenAbility,b.ability.name);
        assert.equal(new Set(b.moves.map(x=>x.name)).size,4);
        const style=b.effectiveStats.atk>=b.effectiveStats.spa?'physical':'special';
        assert.ok(ROLE_MOVES[b.role.primary.name][style].includes(b.moves[2].name));
        assert.ok(GROWTH_MOVES[core].choices.includes(b.moves[3].name));
        count++;
      }
    }
  }
  assert.equal(count,324);
});

test('randomized builds vary tactical and growth moves without sacrificing determinism',()=>{
  let seed=24815;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const roleMoves={},coreMoves={},hiddenAbilities=new Set();
  for(let i=0;i<1800;i++){
    const input=generateRandomBuildInput(rand);
    const build=generateBuild(input);
    (roleMoves[build.role.primary.name]??=new Set()).add(build.moves[2].name);
    (coreMoves[build.core]??=new Set()).add(build.moves[3].name);
    hiddenAbilities.add(build.hiddenAbility);
    assert.equal(new Set(build.moves.map(m=>m.name)).size,4);
    assert.equal(build.hiddenAbility,generateBuild(input).hiddenAbility);
    assert.deepEqual(build.moves,generateBuild(input).moves);
  }
  assert.equal(Object.keys(roleMoves).length,6);
  assert.ok(Object.values(roleMoves).every(pool=>pool.size>=3),
    'every battle role should have at least three attainable tactics');
  assert.equal(Object.keys(coreMoves).length,9);
  assert.ok(Object.values(coreMoves).every(pool=>pool.size>=2),
    'every Enneagram core should have more than one attainable growth move');
  assert.ok(hiddenAbilities.size>=16,'hidden abilities should not collapse into a tiny pool');
});
