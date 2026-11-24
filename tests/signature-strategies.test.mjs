import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SIGNATURE_STRATEGIES, selectSignatureStrategy, signatureHeldItem, protectivePlanningFit
} from '../src/strategies.mjs';
import { ABILITIES, GROWTH_MOVES, MOVE_PURPOSES, ROLE_MOVES, ROLE_PURPOSES } from '../src/data.mjs';
import { isMoveEligible, isMovePairCompatible, generateBuild } from '../src/engine.mjs';
import { isHeldItemCompatible } from '../src/held-items.mjs';
import { buildCardSvg } from '../src/export-card.mjs';
import { generateRandomBuildInput } from '../src/random-build.mjs';

const stats={hp:112,atk:68,def:119,spa:70,spd:111,spe:55};
const ctx=({types=['Ice','Steel'],name='Wall',secondary=null,motives=[5,1,3],bigFive=[62,83,28,55,43],values=stats,hasBigFive=true,mbtiScores=[82,88,25,18,50],bigFiveFacets=null}={})=>({
  types,role:{primary:{name,score:94},secondary:secondary?{name:secondary,score:92}:null},stats:values,
  core:motives[0],second:motives[1],third:motives[2],
  bigFive,hasBigFive,mbtiScores,bigFiveFacets
});

test('twelve packages have distinct coherent mechanics and real item/ability references',()=>{
  assert.equal(SIGNATURE_STRATEGIES.length,12);
  const ids=new Set();
  for(const s of SIGNATURE_STRATEGIES){
    assert.ok(!ids.has(s.id),'duplicate signature '+s.id);
    ids.add(s.id);
    const ability=ABILITIES.find(x=>x.name===s.ability);
    assert.ok(ability,'missing ability '+s.ability);
    assert.ok(s.requiredTypes.some(type=>ability.types.includes(type)));
    for(const classifiedRole of s.roles){
      const tacticRole=s.tacticRoles?.[classifiedRole]||classifiedRole;
      assert.ok(ROLE_MOVES[tacticRole]?.includes(s.tactic),
        'tactic missing its allowed purpose pool: '+s.id+'/'+classifiedRole);
      assert.ok(MOVE_PURPOSES[s.tactic]?.includes(ROLE_PURPOSES[tacticRole]),
        'tactic has inconsistent purpose: '+s.id+'/'+classifiedRole);
    }
    const item=signatureHeldItem(s,{
      core:s.motivations[0],
      role:{primary:{name:s.roles[0]}},
      bigFive:s.bigFive
    });
    assert.equal(item.name,s.item);
    assert.ok(isHeldItemCompatible(item,{
      types:s.requiredTypes,moves:[s.tactic,s.attackSwap?.move].filter(Boolean),ability
    }),'item must work in chosen package: '+s.id);
    assert.match(item.why,/Your Type \d+ core/);
    assert.ok(!item.why.includes(s.name),'item rationale must not repeat the strategy name');
    assert.ok(!item.why.includes(s.mechanism),'item rationale must not repeat the synergy explanation');
  }
});

test('Snow Bastion expresses an Ice defensive/protective strategy across four roles',()=>{
  const s=selectSignatureStrategy(ctx());
  assert.equal(s?.id,'snow-bastion');
  assert.equal(s.ability,'Snow Warning');
  assert.equal(s.tactic,'Aurora Veil');
  assert.equal(s.item,'Icy Rock');
  assert.equal(s.matchedRole,'Wall');
  assert.equal(s.tacticRole,'Wall');
  for(const [name,tacticRole] of [
    ['Wall','Wall'],['Tank','Wall'],['Support','Support'],['Controller','Support']
  ]){
    const result=selectSignatureStrategy(ctx({name}));
    assert.equal(result?.id,'snow-bastion',name+' can earn an Ice protection setup');
    assert.equal(result?.matchedRole,name,'the actual role must be retained');
    assert.equal(result?.tacticRole,tacticRole,'the tactic must have a coherent purpose');
  }
  for(const name of ['Sweeper','Pivot'])
    assert.equal(selectSignatureStrategy(ctx({name})),null,
      name+' does not qualify without a protected or defending role');
  const hybrid=selectSignatureStrategy(ctx({name:'Tank',secondary:'Wall'}));
  assert.equal(hybrid?.matchedRole,'Tank','primary role has precedence when eligible');
  assert.equal(hybrid?.tacticRole,'Wall','Aurora Veil remains protective');
  assert.equal(selectSignatureStrategy(ctx({name:'Wall',secondary:'Tank'}))?.matchedRole,'Wall');
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

test('planning and facet evidence affect Snow Bastion preference, not hard eligibility',()=>{
  const prepared=ctx({
    name:'Tank',mbtiScores:[85,95,12,9,50],bigFive:[62,83,28,55,43]
  });
  const improvising=ctx({
    name:'Tank',mbtiScores:[30,10,94,95,50],bigFive:[62,83,28,55,43]
  });
  const strategic=selectSignatureStrategy(prepared);
  const spontaneous=selectSignatureStrategy(improvising);
  assert.equal(strategic?.id,'snow-bastion');
  assert.equal(spontaneous?.id,'snow-bastion',
    'Architect-style planning is an advantage, not an eligibility requirement');
  assert.ok(strategic.planningFit>spontaneous.planningFit+30);
  assert.ok(strategic.score>spontaneous.score+4);
  assert.equal(strategic.matchedRole,'Tank');
  const facets=Array(30).fill(50);
  const high=[...facets],low=[...facets];
  for(const i of [4,7,11]){high[i]=95;low[i]=5;} // O5 Intellect, C2 Order, C6 Caution
  const detailHigh=protectivePlanningFit({...prepared,bigFiveFacets:high});
  const detailLow=protectivePlanningFit({...prepared,bigFiveFacets:low});
  assert.ok(detailHigh>detailLow+30,'direct facets must matter beyond broad domain');
  assert.ok(selectSignatureStrategy({...prepared,bigFiveFacets:high}).score>
    selectSignatureStrategy({...prepared,bigFiveFacets:low}).score);
  assert.equal(selectSignatureStrategy({...prepared,types:['Steel','Water']}),null,
    'no psychological fit can bypass the Ice-type requirement');
  assert.equal(selectSignatureStrategy({...prepared,values:{...stats,spd:81}}),null,
    'no planning score can bypass special-defensive viability');
  const source=readFileSync(new URL('../src/strategies.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/classifyArchetype|archetype\.title|archetype\.mode/,
    'signatures must use original evidence, never final archetype titles');
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
    {id:'grassy-sanctuary',input:ctx({types:['Grass','Fairy'],name:'Support',motives:[9,2,6],
      values:{hp:112,atk:65,def:92,spa:85,spd:119,spe:86},bigFive:[64,67,48,82,39]})},
    {id:'ashen-vanguard',input:ctx({types:['Fighting','Rock'],name:'Tank',motives:[8,3,6],
      values:{hp:107,atk:122,def:102,spa:67,spd:92,spe:68},bigFive:[55,82,64,39,51]})},
    {id:'venom-alchemist',input:ctx({types:['Grass','Ground'],name:'Wall',motives:[9,5,6],
      values:{hp:119,atk:76,def:112,spa:81,spd:108,spe:47},bigFive:[67,72,29,60,47]})},
    {id:'sandbound-citadel',input:ctx({types:['Rock','Ground'],name:'Wall',motives:[1,5,6],
      values:{hp:112,atk:77,def:123,spa:65,spd:109,spe:62},bigFive:[61,90,29,42,45]})},
    {id:'arcane-catalyst',input:ctx({types:['Psychic','Ghost'],name:'Sweeper',motives:[5,3,7],
      values:{hp:81,atk:62,def:71,spa:127,spd:80,spe:117},bigFive:[92,62,54,29,38]})},
    {id:'circuit-architect',input:ctx({types:['Electric','Steel'],name:'Sweeper',motives:[3,5,7],
      values:{hp:83,atk:60,def:84,spa:119,spd:81,spe:123},bigFive:[78,76,79,35,39]})},
    {id:'misty-custodian',input:ctx({types:['Fairy','Psychic'],name:'Support',motives:[2,1,6],
      values:{hp:108,atk:70,def:93,spa:76,spd:121,spe:83},bigFive:[67,73,47,88,47]})}
  ];
  for(const {id,input} of examples){
    assert.equal(selectSignatureStrategy(input)?.id,id,id+' should be reachable');
    // Every existing strategy can use its intended tactic through a close
    // secondary role without pretending the Pokémon has changed primary role.
    const otherRole=input.role.primary.name==='Wall'?'Tank':'Wall';
    const hybrid={...input,role:{primary:{name:otherRole,score:94},
      secondary:{name:input.role.primary.name,score:92}}};
    const selected=selectSignatureStrategy(hybrid);
    assert.equal(selected?.id,id,id+' should be reachable through secondary role');
    assert.equal(selected?.matchedRole,input.role.primary.name,
      id+' must preserve the qualifying role');
  }
});

test('move-pair compatibility rejects redundant screens and self-sabotaging growth',()=>{
  assert.equal(isMovePairCompatible('Aurora Veil','Reflect'),false);
  assert.equal(isMovePairCompatible('Aurora Veil','Light Screen'),false);
  assert.equal(isMovePairCompatible('Aurora Veil','Helping Hand'),true);
  assert.equal(isMovePairCompatible('Light Screen','Reflect'),true);
  assert.equal(isMovePairCompatible('Protect','Rest',{strategy:{ability:'Poison Heal'}}),false);
  assert.equal(isMovePairCompatible('Bulk Up','Rest',{strategy:{ability:'Guts'}}),false);
  assert.equal(isMovePairCompatible('Heal Bell','Safeguard',{strategy:{ability:'Misty Surge'}}),false);
});

test('type and offense gates rule out mechanically impossible packages',()=>{
  assert.equal(selectSignatureStrategy(ctx({types:['Fire','Fighting'],name:'Tank',motives:[8,3,6],
    values:{hp:107,atk:122,def:102,spa:67,spd:92,spe:68},
    bigFive:[55,82,64,39,51]})),null);
  assert.equal(selectSignatureStrategy(ctx({types:['Grass','Poison'],name:'Wall',motives:[9,5,6],
    values:{hp:119,atk:76,def:112,spa:81,spd:108,spe:47},
    bigFive:[67,72,29,60,47]})),null);
  assert.equal(selectSignatureStrategy(ctx({types:['Electric','Steel'],name:'Sweeper',motives:[3,5,7],
    values:{hp:83,atk:125,def:84,spa:109,spd:81,spe:123},
    bigFive:[78,76,79,35,39]})),null);
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
  if(general.signatureStrategy){
    assert.equal(general.ability.name,general.signatureStrategy.ability);
    assert.equal(general.moves[2].name,general.signatureStrategy.tactic);
  }
  // An old generalist becoming a specialist after a new Nature is a valid
  // downstream effect; the seeded population audit still guards prevalence.
});

test('the Signature Strategy callout alone explains specialist synergy',()=>{
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../src/profile-analysis.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('SIGNATURE STRATEGY'));
  assert.ok(source.includes('build.signatureStrategy.mechanism'));
  assert.doesNotMatch(guide,/signatureStrategy/,
    'Trainer Guide should describe the Pokémon, not repeat its package');
  assert.equal((source.match(/build\.signatureStrategy\.mechanism/g)||[]).length,1,
    'the result should explain mechanics in exactly one callout');
  assert.ok(!source.includes('Signature strategy:</strong>'),
    'methodology should not restate specialist qualification');
  assert.ok(!source.includes("'Signature strategy: '+"),
    'copied summaries should read like normal Pokémon builds');
  const minimal=generateBuild({
    mbtiScores:[70,70,30,25,25],enneagramScores:[50,30,65,20,50,20,90,10,30],
    bigFive:[45,50,70,42,49]
  });
  const artwork=buildCardSvg({...minimal,signatureStrategy:selectSignatureStrategy(ctx())});
  assert.ok(!artwork.includes('SIGNATURE STRATEGY'),
    'exported PNG should not label specializations');
  assert.ok(!artwork.includes('SNOW BASTION'),
    'exported PNG should not advertise strategy names');
});

test('seeded population retains generalists and validates any specialized package end-to-end',()=>{
  let seed=123456789;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const counts={generalist:0};
  const exported=new Set();
  for(let i=0;i<4000;i++){
    const b=generateBuild(generateRandomBuildInput(random));
    assert.ok(isMovePairCompatible(b.moves[2].name,b.moves[3].name,{
      strategy:b.signatureStrategy,attacks:b.moves.slice(0,2),ability:b.ability
    }),
      'redundant or contradictory growth move: '+b.moves[2].name+' / '+b.moves[3].name);
    if(b.moves[2].name==='Aurora Veil')
      assert.ok(!['Reflect','Light Screen'].includes(b.moves[3].name),
        'Aurora Veil must never repeat its protective effect in slot 4');
    const s=b.signatureStrategy;
    if(!s){counts.generalist++;continue;}
    counts[s.id]=(counts[s.id]||0)+1;
    assert.equal(b.ability.name,s.ability);
    assert.equal(b.moves[2].name,s.tactic);
    assert.ok([b.role.primary.name,b.role.secondary?.name].includes(s.matchedRole),
      'specialization must match an actually classified role: '+s.id);
    assert.ok(ROLE_MOVES[s.tacticRole].includes(s.tactic),
      'specialization tactic must belong to its functional pool: '+s.id);
    assert.ok(MOVE_PURPOSES[s.tactic]?.includes(ROLE_PURPOSES[s.tacticRole]),
      'specialization tactic must have an aligned tactical purpose: '+s.id);
    assert.equal(b.heldItem.name,s.item);
    assert.ok(isMovePairCompatible(b.moves[2].name,b.moves[3].name,{
      strategy:s,attacks:b.moves.slice(0,2),ability:b.ability
    }));
    if(s.id==='snow-bastion')assert.notEqual(b.moves[3].name,'Baton Pass',
      'Aurora Veil and snow defense cannot be passed to a teammate');
    if(s.attackSwap)
      assert.ok(b.moves.slice(0,2).some(m=>m.name===s.attackSwap.move));
    assert.ok(isHeldItemCompatible(b.heldItem,{types:b.types,moves:b.moves,ability:b.ability}));
    assert.ok(GROWTH_MOVES[b.core].choices.includes(b.moves[3].name));
    assert.equal(Object.values(b.baseStats).reduce((a,n)=>a+n,0),535);
    assert.ok(!b.report.combat.includes(s.name));
    assert.ok(!JSON.stringify(b.report).includes(s.name),
      'Trainer Guide must not mention signature strategy name: '+s.id);
    assert.ok(!JSON.stringify(b.report).includes(s.mechanism),
      'Trainer Guide must not repeat strategy mechanics: '+s.id);
    assert.ok(!b.moves.some(m=>m.why.includes(s.mechanism)),
      'move rationales must not repeat strategy mechanics: '+s.id);
    assert.ok(!b.heldItem.why.includes(s.mechanism) && !b.heldItem.why.includes(s.name),
      'held-item rationale must read like a regular build: '+s.id);
    if(!exported.has(s.id)){
      const svg=buildCardSvg(b);
      assert.ok(!svg.includes('SIGNATURE STRATEGY') && !svg.includes(s.name.toUpperCase()),
        'PNG must not advertise the signature label: '+s.id);
      exported.add(s.id);
    }
  }
  console.log('Signature strategy audit, 4,000 seeded builds:',JSON.stringify(counts));
  assert.ok(counts.generalist>2000,'specialists should not dominate random builds: '+JSON.stringify(counts));
  for(const strategy of SIGNATURE_STRATEGIES)
    assert.ok(counts[strategy.id]>0,'specialty unreachable in a full-engine seeded population: '+strategy.id);
});
