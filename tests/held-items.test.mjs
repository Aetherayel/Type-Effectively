import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HELD_ITEMS, ITEM_FAMILIES } from '../src/held-items-data.mjs';
import { chooseHeldItem } from '../src/held-items.mjs';
import { DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { buildCardSvg } from '../src/export-card.mjs';

const architectInput={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive,
  typeOverride:'INTJ',tritypeOverride:'593'
};

test('exactly 72 distinct real held item names in nine balanced behavioral families',()=>{
  const names=HELD_ITEMS.map(item=>item.name);
  assert.equal(names.length,72);
  assert.equal(new Set(names).size,72);
  assert.equal(Object.keys(ITEM_FAMILIES).length,9);
  for(const [key,family] of Object.entries(ITEM_FAMILIES)) {
    const members=HELD_ITEMS.filter(item=>item.family===key);
    assert.equal(members.length,8,key+' must have eight distinct items');
    assert.equal(family.ennea.length,9);
    assert.equal(family.target.length,5);
    assert.ok(family.insight.length>12);
    assert.ok(members.every(item=>item.effect.length>10 && item.quip.length>15));
    for(const item of members) {
      assert.equal(item.targets.length,5,item.name);
      assert.ok(item.targets.every(value=>Number.isInteger(value)&&value>=0&&value<=100),item.name);
      assert.ok(item.roles.length>0&&item.roles.length<=2,item.name);
      assert.ok(item.roles.every(role=>['Sweeper','Tank','Wall','Pivot','Support','Controller'].includes(role)),item.name);
    }
  }
});

test('same inputs produce the same held item without altering Pokémon battle numbers',()=>{
  const first=generateBuild(architectInput),second=generateBuild(architectInput);
  assert.deepEqual(first.heldItem,second.heldItem);
  assert.ok(HELD_ITEMS.some(item=>item.name===first.heldItem.name));
  assert.equal(first.heldItem.name.length>0,true);
  assert.ok(first.heldItem.effect.length>0);
  assert.ok(first.heldItem.quip.length>0);
  assert.match(first.heldItem.why,/Type 5 core/);
  assert.match(first.heldItem.why,/role point toward/);
  assert.equal(Object.values(first.baseStats).reduce((a,b)=>a+b,0),535);
  assert.deepEqual(first.effectiveStats,{hp:103,atk:53,def:110,spa:119,spd:99,spe:54});
  assert.equal(first.moves.length,4);
});

test('different Big Five patterns diversify items even for a shared 593 tritype',()=>{
  const choices=new Set();
  for(let i=0;i<36;i++) {
    const bigFive=[
      (i*19)%101,(i*33+17)%101,(i*47+29)%101,
      (i*59+31)%101,(i*71+43)%101
    ];
    const build=generateBuild({...architectInput,bigFive});
    assert.equal(build.tritype,'593');
    choices.add(build.heldItem.name);
  }
  assert.ok(choices.size>=10,'only '+choices.size+' items for 36 distinct Big Five profiles');
});

test('seeded varied builds explore many held items and every family',()=>{
  let seed=56789;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const names=new Set(),families=new Set();
  for(let i=0;i<1200;i++){
    const input={
      mbtiScores:Array.from({length:5},()=>Math.floor(random()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(random()*101)),
      bigFive:Array.from({length:5},()=>Math.floor(random()*101))
    };
    const build=generateBuild(input);
    names.add(build.heldItem.name);
    families.add(build.heldItem.family);
    assert.equal(generateBuild(input).heldItem.name,build.heldItem.name);
  }
  assert.ok(names.size>=40,'only '+names.size+' unique items in varied builds');
  assert.equal(families.size,9,'all behavioral families should be reachable');
});

test('estimated Big Five scores never masquerade as measured trait findings',()=>{
  const build=generateBuild({typeOverride:'INTJ',tritypeOverride:'593'});
  assert.ok(build.heldItem.why.includes('Type 5 core'));
  assert.doesNotMatch(build.heldItem.why,/higher |lower /);
});

test('a held item is selected from the complete build and can be independently calculated',()=>{
  const b=generateBuild(architectInput);
  const candidate=chooseHeldItem({
    tritype:b.tritype,core:b.core,second:b.second,third:b.third,wing:b.wing,
    enneagramScores:architectInput.enneagramScores,
    bigFive:architectInput.bigFive,
    mbtiScores:architectInput.mbtiScores,
    role:b.role
  });
  assert.deepEqual(candidate,b.heldItem);
  assert.throws(()=>chooseHeldItem({}),/complete personality build/);
});

test('held item name, effect, explanation and joke survive a score-free PNG export',()=>{
  const build=generateBuild(architectInput);
  const svg=buildCardSvg(build);
  assert.match(svg,/HELD ITEM/);
  assert.ok(svg.includes(build.heldItem.name));
  assert.ok(svg.includes(build.heldItem.effect.replace(/&/g,'&amp;')));
  assert.ok(svg.includes(build.heldItem.quip));
  assert.ok(svg.includes('WHY:'));
  assert.match(svg,/No questionnaire scores included/);
  assert.doesNotMatch(svg,/mbtiScores|enneagramScores|bigFive|#build=/);
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('build.heldItem.effect'));
  assert.ok(source.includes('build.heldItem.quip'));
  assert.ok(source.includes('build.heldItem.why'));
});

test('held item export escapes potentially unsafe display data',()=>{
  const b=generateBuild(architectInput);
  const svg=buildCardSvg({...b,heldItem:{...b.heldItem,
    name:'<script>bad()</script>',quip:'A & B',why:'<test> & free',
    effect:'Control < chaos & uncertainty'
  }});
  assert.doesNotMatch(svg,/<script>|<test>/);
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(svg.includes('A &amp; B'));
  assert.ok(svg.includes('&lt;test&gt; &amp; free'));
});
