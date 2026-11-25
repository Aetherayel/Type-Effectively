import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRole, directionalRoleFit, ROLE_DIRECTION_VARIANTS } from '../src/roles.mjs';
import { ROLE_CALIBRATED_TEMPLATES, STAT_KEYS, toReferenceStats } from '../src/data.mjs';
import { signatureStatFit, SIGNATURE_STRATEGIES } from '../src/strategies.mjs';
import { abilityStatFit, isMoveEligible, isMovePairCompatible, generateCompleteBuild } from '../src/engine.mjs';
import { heldItemStatFit, isHeldItemCompatible } from '../src/held-items.mjs';
import { trainingPlan, validTrainingEvs } from '../src/ev-training.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' != '+b);
test('directional fit is independent of amplitude once the evidence is pronounced',()=>{
  const center=535/6,t=ROLE_CALIBRATED_TEMPLATES.Wall;
  const stretch=k=>t.map(v=>center+k*(v-center));
  close(directionalRoleFit(stretch(1),[t]),100);
  close(directionalRoleFit(stretch(2),[t]),100);
  close(directionalRoleFit(stretch(0),[t]),80);
  assert.ok(directionalRoleFit(stretch(-1),[t])<80);
  const equal=Object.fromEntries(STAT_KEYS.map(k=>[k,100]));
  const extreme={hp:160,atk:40,def:160,spa:40,spd:160,spe:40};
  assert.equal(classifyRole(equal,['Steel']).hybridMargin,7);
  assert.equal(classifyRole(extreme,['Steel']).hybridMargin,5);
  for(const variants of Object.values(ROLE_DIRECTION_VARIANTS))
    for(const target of variants)assert.equal(target.reduce((a,b)=>a+b),535);
});
test('all signature targets reward desirable strengths monotonically, rather than a narrow exact spread',()=>{
  for(const strategy of SIGNATURE_STRATEGIES){
    const near=Object.fromEntries(STAT_KEYS.map(k=>[k,95]));
    const high={...near};
    for(const key of Object.keys(strategy.targets))high[key]=Math.max(near[key],strategy.targets[key]+30);
    assert.ok(signatureStatFit(strategy,high)>=signatureStatFit(strategy,near),strategy.id);
  }
  const solar=SIGNATURE_STRATEGIES.find(s=>s.id==='solar-engine');
  close(signatureStatFit(solar,{atk:130,spa:45,spe:111}),100);
  close(signatureStatFit(solar,{atk:45,spa:130,spe:111}),100);
  const snow=SIGNATURE_STRATEGIES.find(s=>s.id==='snow-bastion');
  close(signatureStatFit(snow,{hp:140,def:145,spd:135}),100);
});
test('abilities and items react to meaningful stat differences, without new incompatibilities',()=>{
  const slow={hp:105,atk:55,def:130,spa:125,spd:105,spe:40};
  const fast={...slow,spe:125};
  assert.ok(abilityStatFit({name:'Analytic'},slow)>abilityStatFit({name:'Analytic'},fast));
  assert.ok(abilityStatFit({name:'Speed Boost'},fast)>abilityStatFit({name:'Speed Boost'},slow));
  assert.ok(heldItemStatFit({name:'Wise Glasses'},slow)>heldItemStatFit({name:'Muscle Band'},slow));
  assert.ok(heldItemStatFit({name:'Rocky Helmet'},slow)>heldItemStatFit({name:'Rocky Helmet'},{...slow,def:65}));
  assert.equal(isMoveEligible('Trick Room',{types:['Psychic'],stats:slow,ability:'Speed Boost'}),false);
  assert.equal(isMovePairCompatible('Trick Room','Quiver Dance'),false);
});
test('V3 complete builds preserve roles, compatible packages, valid EVs and 600 BST in all input modes',()=>{
  let seed=20261125;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const vec=n=>Array.from({length:n},()=>Math.floor(rand()*101));
  const roles=new Set(),packages=new Set();
  for(const mode of ['quick','functions','facets','full'])for(let i=0;i<300;i++){
    const domains=vec(5);
    const input={enneagramScores:vec(9),bigFive:domains,
      ...(['functions','full'].includes(mode)?{functionScores:vec(8)}:{mbtiScores:vec(5)})};
    if(['facets','full'].includes(mode))input.bigFiveFacets=domains.flatMap(x=>
      Array.from({length:6},()=>Math.max(0,Math.min(100,x+(rand()-.5)*60))));
    const b=generateCompleteBuild(input),v=Object.values(b.baseStats);
    assert.equal(v.reduce((a,c)=>a+c),600);assert.ok(v.every(x=>x>=40&&x<=160));
    assert.equal(b.archetype.role,b.role.primary.name);
    assert.equal(new Set(b.moves.map(m=>m.name)).size,4);
    assert.ok(isHeldItemCompatible(b.heldItem,{types:b.types,moves:b.moves,ability:b.ability}));
    assert.ok(isMovePairCompatible(b.moves[2].name,b.moves[3].name,{strategy:b.signatureStrategy,attacks:b.moves.slice(0,2),ability:b.ability}));
    assert.ok(!b.moves.some(m=>m.name==='Trick Room')||b.ability.name!=='Speed Boost');
    for(const approach of ['auto','reinforce','compensate']){
      const p=trainingPlan(b,approach);
      assert.ok(validTrainingEvs(p.evs));assert.equal(p.evs.reduce((a,c)=>a+c),508);
      if(p.trickRoom)assert.equal(p.evs[5],0);
    }
    roles.add(b.role.primary.name);if(b.signatureStrategy)packages.add(b.signatureStrategy.id);
  }
  assert.equal(roles.size,6);
  assert.equal(packages.size,SIGNATURE_STRATEGIES.length);
});
