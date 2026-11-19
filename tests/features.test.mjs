import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TYPE_COLORS, DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { TYPE_EFFECTIVENESS, ALL_TYPES, getDefensiveMatchups } from '../src/matchups.mjs';
import { buildCardSvg, CARD_HEIGHT, CARD_WIDTH } from '../src/export-card.mjs';

const get=(types,kind)=>getDefensiveMatchups(types)[kind].map(item=>item.type).sort();

test('modern attacking chart covers all 18 type rows and valid effectiveness values',()=>{
  assert.deepEqual(Object.keys(TYPE_EFFECTIVENESS).sort(),Object.keys(TYPE_COLORS).sort());
  assert.deepEqual([...ALL_TYPES].sort(),Object.keys(TYPE_COLORS).sort());
  for(const [attacker,row] of Object.entries(TYPE_EFFECTIVENESS)){
    assert.ok(ALL_TYPES.includes(attacker));
    for(const [defender,value] of Object.entries(row)){
      assert.ok(ALL_TYPES.includes(defender),'Invalid defending type '+defender);
      assert.ok([0,.5,2].includes(value),'Invalid value '+attacker+' -> '+defender);
    }
  }
});

test('Ice / Steel has both 4x weaknesses, a Ground weakness and Poison immunity',()=>{
  assert.deepEqual(get(['Ice','Steel'],'quadWeak'),['Fighting','Fire']);
  assert.deepEqual(get(['Ice','Steel'],'weak'),['Ground']);
  assert.deepEqual(get(['Ice','Steel'],'strongResist'),['Ice']);
  assert.deepEqual(get(['Ice','Steel'],'immune'),['Poison']);
  assert.ok(get(['Ice','Steel'],'resist').includes('Dragon'));
});

test('a monotype does not double-apply multipliers',()=>{
  const water=getDefensiveMatchups(['Water']);
  assert.deepEqual(water.quadWeak,[]);
  assert.deepEqual(water.weak.map(x=>x.type).sort(),['Electric','Grass']);
  assert.deepEqual(water.immune,[]);
  assert.deepEqual(get(['Ghost'],'immune'),['Fighting','Normal']);
  assert.throws(()=>getDefensiveMatchups(['Water','Water']),/distinct/);
  assert.throws(()=>getDefensiveMatchups([]),/one or two/);
  assert.throws(()=>getDefensiveMatchups(['???']),/Pokémon types/);
});

test('multipliers stack and immunities override other type interactions',()=>{
  assert.deepEqual(get(['Steel','Fairy'],'immune'),['Dragon','Poison']);
  assert.deepEqual(get(['Electric','Flying'],'immune'),['Ground']);
  assert.deepEqual(get(['Steel','Fairy'],'weak'),['Fire','Ground']);
  const target=['Water','Ground'];
  assert.deepEqual(get(target,'quadWeak'),['Grass']);
  assert.deepEqual(get(target,'immune'),['Electric']);
});

test('every mono and dual typing partitions exactly the 18 incoming attack types',()=>{
  for(let i=0;i<ALL_TYPES.length;i++)for(let j=i;j<ALL_TYPES.length;j++){
    const types=i===j?[ALL_TYPES[i]]:[ALL_TYPES[i],ALL_TYPES[j]];
    const m=getDefensiveMatchups(types);
    const entries=['quadWeak','weak','resist','strongResist','immune','neutral'].flatMap(k=>m[k]);
    assert.equal(entries.length,18,types.join('/')+' should cover all attacking types');
    assert.equal(new Set(entries.map(x=>x.type)).size,18,'No duplicate attackers');
    assert.ok(entries.every(x=>[0,.25,.5,1,2,4].includes(x.multiplier)));
  }
});

const sample=generateBuild({
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive,
  typeOverride:'INTJ',tritypeOverride:'593'
});

test('self-contained downloadable card includes typing, base stats, role and ability',()=>{
  const svg=buildCardSvg(sample);
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg,new RegExp('width="'+CARD_WIDTH+'" height="'+CARD_HEIGHT+'"'));
  assert.match(svg,/The Architect/);
  assert.match(svg,/Ice/);
  assert.match(svg,/Steel/);
  assert.match(svg,/Quiet/);
  assert.match(svg,/535 BST/);
  assert.ok(svg.includes(sample.ability.name));
  assert.match(svg,/↑119/);
  assert.match(svg,/109/);
  assert.match(svg,/↓54/);
  assert.equal((svg.match(/class="stat-radar-label-name"/g)||[]).length,6);
  assert.match(svg,/No questionnaire scores included/);
  assert.doesNotMatch(svg,/mbtiScores|enneagramScores|bigFive|enneagramRanking|#build=/);
  assert.doesNotMatch(svg,/<image\b|<foreignObject\b|https:\/\//);
  assert.throws(()=>buildCardSvg({...sample,types:['Fake']}),/valid Pokémon typing/);
});

test('export card escapes untrusted display text rather than embedding markup',()=>{
  const svg=buildCardSvg({...sample,title:'<script>doBad()</script>',ability:{...sample.ability,name:'A & B'}});
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(svg.includes('A &amp; B'));
  assert.ok(!svg.includes('<script>'));
});

test('result screen includes defensive matchup panel and PNG download button',()=>{
  const code=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const card=code.slice(code.indexOf('function renderCard('),code.indexOf('function buildSummary('));
  assert.ok(code.includes("getDefensiveMatchups(types)"));
  assert.ok(card.includes('renderMatchups(build.types)'));
  assert.ok(card.includes('id="download-card"'));
  assert.ok(card.includes('downloadCardPng(build)'));
});
