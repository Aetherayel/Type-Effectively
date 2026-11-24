import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TYPE_COLORS, DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { TYPE_EFFECTIVENESS, ALL_TYPES, getDefensiveMatchups } from '../src/matchups.mjs';
import { buildCardSvg, CARD_HEIGHT, CARD_WIDTH, oceanHeaderText } from '../src/export-card.mjs';

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
  assert.ok(svg.includes(sample.title),'export should use the whole-build archetype title');
  assert.match(svg,/>ICE<\/text>/);
  assert.match(svg,/>WATER<\/text>/);
  assert.match(svg,/Quiet/);
  assert.match(svg,/535 BST/);
  assert.ok(svg.includes(sample.ability.name));
  assert.ok(svg.includes('↑'+sample.effectiveStats[sample.natureBoost]));
  assert.ok(svg.includes(String(sample.baseStats[sample.natureBoost])));
  assert.ok(svg.includes('↓'+sample.effectiveStats[sample.natureDrop]));
  assert.equal((svg.match(/class="stat-radar-label-name"/g)||[]).length,6);
  assert.match(svg,/OCEAN shown only as high \/ low/);
  assert.match(svg,/>O:H · C:H · E:L · A:H · N:L<\/text>/);
  assert.doesNotMatch(svg,/mbtiScores|enneagramScores|bigFive|enneagramRanking|#build=/);
  assert.doesNotMatch(svg,/<image\b|<foreignObject\b|https:\/\//);
  assert.throws(()=>buildCardSvg({...sample,types:['Fake']}),/valid Pokémon typing/);
});

test('export card calls out primary or hybrid battle role without a duplicate subtitle',()=>{
  const singleSvg=buildCardSvg(sample);
  assert.match(singleSvg,/>BATTLE ROLE<\/text>/);
  assert.match(singleSvg,new RegExp('>'+sample.role.primary.name+'<\\/text>'));
  assert.ok(!singleSvg.includes(sample.nature+' Nature · '+sample.ability.name+' Ability'));
  assert.match(singleSvg,/>ABILITIES<\/text>/);
  assert.match(singleSvg,new RegExp('>'+sample.nature+' Nature · \\+10%'));
  const hybrid=buildCardSvg({
    ...sample,
    role:{...sample.role,secondary:{name:'Controller'}}
  });
  assert.match(hybrid,/>Tank \/ Controller<\/text>/);
  assert.doesNotMatch(hybrid,/>Quiet · Tank \/ Controller · Analytic<\/text>/);
  assert.match(hybrid,/viewBox="0 0 960 1700"/);
});

test('OCEAN header exports five binary high/low traits, never precise numbers',()=>{
  assert.deepEqual(sample.oceanBinary,[1,1,0,1,0]);
  assert.equal('oceanScores' in sample,false,'build should not retain raw Big Five values');
  assert.equal(oceanHeaderText(sample),'O:H · C:H · E:L · A:H · N:L');
  const svg=buildCardSvg(sample);
  assert.match(svg,/<text x="878" y="140" text-anchor="end"[^>]*>O:H · C:H · E:L · A:H · N:L<\/text>/);
  assert.doesNotMatch(svg,/O80|C90|E20|A60|N15/);
  assert.equal(oceanHeaderText({oceanBinary:[0,0,0,0,0]}),'O:L · C:L · E:L · A:L · N:L');
  assert.equal(oceanHeaderText({oceanBinary:[1,1,1,1,1]}),'O:H · C:H · E:H · A:H · N:H');

  const estimated=generateBuild({typeOverride:'INTJ',tritypeOverride:'593'});
  assert.equal(estimated.oceanBinary,null);
  assert.equal(oceanHeaderText(estimated),'OCEAN · Estimated');
  assert.match(buildCardSvg(estimated),/>OCEAN · Estimated<\/text>/);
  assert.throws(()=>oceanHeaderText({oceanBinary:[1,0,1]}),/five binary flags/);
  assert.throws(()=>oceanHeaderText({oceanBinary:[1,0,50,1,0]}),/five binary flags/);
});

test('50 is the inclusive threshold for high; values below 50 are low',()=>{
  const input={mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:[49,50,51,0,100]};
  assert.deepEqual(generateBuild(input).oceanBinary,[0,1,1,0,1]);
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
