import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGNATURE_STRATEGIES, selectSignatureStrategy, signatureHeldItem } from '../src/strategies.mjs';
import { ABILITIES, GROWTH_MOVES, MOVE_PURPOSES, ROLE_MOVES, ROLE_PURPOSES } from '../src/data.mjs';
import { isMoveEligible, generateBuild } from '../src/engine.mjs';
import { isHeldItemCompatible } from '../src/held-items.mjs';
import { buildCardSvg } from '../src/export-card.mjs';
import { generateRandomBuildInput } from '../src/random-build.mjs';

const stats={hp:112,atk:68,def:119,spa:70,spd:111,spe:55};
const ctx=({types=['Ice','Steel'],name='Wall',motives=[5,1,3],bigFive=[62,83,28,55,43],values=stats,hasBigFive=true}={})=>({
  types,role:{primary:{name,score:94}},stats:values,
  core:motives[0],second:motives[1],third:motives[2],
  bigFive,hasBigFive
});

test('six packages have distinct coherent mechanics and real item/ability references',()=>{
  assert.equal(SIGNATURE_STRATEGIES.length,6);
  const ids=new Set();
  for(const s of SIGNATURE_STRATEGIES){
    assert.ok(!ids.has(s.id),'duplicate signature '+s.id);
    ids.add(s.id);
    const ability=ABILITIES.find(x=>x.name===s.ability);
    assert.ok(ability,'missing ability '+s.ability);
    assert.ok(s.requiredTypes.some(type=>ability.types.includes(type)));
    assert.ok(ROLE_MOVES[s.roles[0]].includes(s.tactic),'tactic is not in role move pool');
    assert.ok(MOVE_PURPOSES[s.tactic]?.includes(ROLE_PURPOSES[s.roles[0]]));
    const item=signatureHeldItem(s);
    assert.equal(item.name,s.item);
    assert.ok(isHeldItemCompatible(item,{
      types:s.requiredTypes,moves:[{name:s.tactic}],ability
    }),'item must work in chosen package: '+s.id);
    assert.ok(item.why.includes(s.mechanism));
  }
});

test('Snow Bastion works as a complete Ice/Steel wall package and cannot fake snow',()=>{
  const s=selectSignatureStrategy(ctx());
  assert.equal(s?.id,'snow-bastion');
  assert.equal(s.ability,'Snow Warning');
  assert.equal(s.tactic,'Aurora Veil');
  assert.equal(s.item,'Icy Rock');
  assert.equal(isMoveEligible('Aurora Veil',{
    types:['Ice','Steel'],stats,role:'Wall'
  }),false);
  assert.equal(isMoveEligible('Aurora Veil',{
    types:['Ice','Steel'],stats,role:'Wall',ability:'Snow Warning'
  }),true);
  assert.equal(isHeldItemCompatible('Icy Rock',{
    types:['Ice','Steel'],moves:[{name:'Aurora Veil'}]
  }),false);
  assert.equal(isHeldItemCompatible('Icy Rock',{
    types:['Ice','Steel'],moves:[{name:'Aurora Veil'}],ability:'Snow Warning'
  }),true);
  assert.equal(isHeldItemCompatible('Light Clay',{
    types:['Ice','Steel'],moves:[{name:'Aurora Veil'}],ability:'Snow Warning'
  }),true);
});

test('each other specialization is meaningfully reachable with matching complete inputs',()=>{
  const examples=[
    {id:'solar-engine',input:ctx({types:['Fire','Grass'],name:'Sweeper',motives:[7,3,8],
      values:{hp:85,atk:105,def:75,spa:105,spd:72,spe:111},bigFive:[76,60,81,39,33]})},
    {id:'regenerative-scout',input:ctx({types:['Water','Bug'],name:'Pivot',motives:[9,5,2],
      values:{hp:113,atk:81,def:94,spa:84,spd:72,spe:101},bigFive:[66,67,46,70,36]})},
    {id:'toxic-warden',input:ctx({types:['Poison','Ghost'],name:'Controller',motives:[5,8,4],
      values:{hp:107,atk:72,def:102,spa:78,spd:115,spe:60},bigFive:[78,63,34,28,54]})},
    {id:'barbed-bulwark',input:ctx({types:['Steel','Ice'],name:'Wall',motives:[1,8,3],
      values:{hp:115,atk:64,def:132,spa:65,spd:92,spe:67},bigFive:[43,86,41,32,48]})},
    {id:'slow-labyrinth',input:ctx({types:['Psychic','Ghost'],name:'Controller',motives:[5,6,9],
      values:{hp:111,atk:74,def:102,spa:92,spd:114,spe:42},bigFive:[87,72,21,47,53]})}
  ];
  for(const {id,input} of examples)
    assert.equal(selectSignatureStrategy(input)?.id,id,id+' should be reachable');
});

test('theme alone does not force specialization, and missing Big Five raises the bar',()=>{
  assert.equal(selectSignatureStrategy(ctx({name:'Sweeper'})),null);
  assert.equal(selectSignatureStrategy(ctx({types:['Ice','Steel'],motives:[3,7,8]})),null);
  assert.equal(selectSignatureStrategy(ctx({values:{...stats,def:52}})),null);
  assert.equal(selectSignatureStrategy(ctx({hasBigFive:false,
    values:{hp:88,atk:92,def:83,spa:90,spd:82,spe:100},
    motives:[3,1,5]})),null);
});

test('strategy selection is deterministic and keeps ordinary scoring available',()=>{
  assert.deepEqual(selectSignatureStrategy(ctx()),selectSignatureStrategy(ctx()));
  const general=generateBuild({
    mbtiScores:[70,70,30,25,25],enneagramScores:[50,30,65,20,50,20,90,10,30],
    bigFive:[45,50,70,42,49]
  });
  assert.equal(Object.values(general.baseStats).reduce((a,b)=>a+b,0),535);
  assert.equal(general.moves.length,4);
  assert.ok(GROWTH_MOVES[general.core].choices.includes(general.moves[3].name));
  assert.equal(general.signatureStrategy??null,null);
});

test('card and Trainer Guide use the same strategy as the selected mechanical package',()=>{
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../src/profile-analysis.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('SIGNATURE STRATEGY'));
  assert.ok(source.includes('build.signatureStrategy.mechanism'));
  assert.ok(guide.includes('build.signatureStrategy.mechanism'));
  const minimal=generateBuild({
    mbtiScores:[70,70,30,25,25],enneagramScores:[50,30,65,20,50,20,90,10,30],
    bigFive:[45,50,70,42,49]
  });
  const artwork=buildCardSvg({...minimal,signatureStrategy:selectSignatureStrategy(ctx())});
  assert.ok(artwork.includes('SIGNATURE STRATEGY · SNOW BASTION'));
});

test('seeded population retains generalists and validates any specialized package end-to-end',()=>{
  let seed=123456789;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const counts={generalist:0};
  for(let i=0;i<1200;i++){
    const b=generateBuild(generateRandomBuildInput(random));
    const s=b.signatureStrategy;
    if(!s){counts.generalist++;continue;}
    counts[s.id]=(counts[s.id]||0)+1;
    assert.equal(b.ability.name,s.ability);
    assert.equal(b.moves[2].name,s.tactic);
    assert.equal(b.heldItem.name,s.item);
    assert.ok(isHeldItemCompatible(b.heldItem,{types:b.types,moves:b.moves,ability:b.ability}));
    assert.ok(GROWTH_MOVES[b.core].choices.includes(b.moves[3].name));
    assert.equal(Object.values(b.baseStats).reduce((a,n)=>a+n,0),535);
    assert.ok(b.report.combat.includes(s.name));
  }
  assert.ok(counts.generalist>400,'specialists should not dominate random builds: '+JSON.stringify(counts));
  assert.ok(Object.keys(counts).length>=2,'at least one package should occur naturally: '+JSON.stringify(counts));
});
