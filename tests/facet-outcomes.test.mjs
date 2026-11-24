import test from 'node:test';
import assert from 'node:assert/strict';
import { facetContrastMap, FACET_GROUPS, FACET_KEYS } from '../src/bigfive-facets.mjs';
import {
  ARCHETYPE_FACET_FOCI, ITEM_FACET_FOCI, EXCLUDED_DIRECT_FACETS,
  ARCHETYPE_FACET_CAP, ITEM_FACET_CAP,
  archetypeFacetAdjustment,itemFacetAdjustment,
  facetFieldObservations,facetOutcomeAudit
} from '../src/facet-outcomes.mjs';
import { ARCHETYPE_PROTOTYPES, classifyArchetype } from '../src/archetypes.mjs';
import { deriveTritype, deriveMbti, generateBuild } from '../src/engine.mjs';
import { DEMOS } from '../src/data.mjs';
import { ITEM_FAMILIES } from '../src/held-items-data.mjs';

const ocean=[55,70,40,60,35];
const facets=()=>FACET_GROUPS.flatMap(g=>Array(6).fill(ocean[g.domainIndex]));
const changed=(key,value)=>facets().map((v,i)=>FACET_KEYS[i]===key?value:v);
const changeMany=pairs=>facets().map((v,i)=>pairs[FACET_KEYS[i]]??v);
const roles=['Sweeper','Wall','Tank','Pivot','Support','Controller'];
const role=favorite=>({
  primary:{name:favorite,score:90},secondary:null,
  all:roles.map(name=>({name,score:name===favorite?90:45}))
});
const full={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:ocean
};

test('every IPIP-NEO facet has an explicit non-stat use or a deliberate exclusion',()=>{
  const audit=facetOutcomeAudit();
  assert.equal(audit.length,30);
  assert.deepEqual(audit.map(item=>item.key),FACET_KEYS);
  assert.deepEqual(audit.filter(item=>item.excluded).map(item=>item.key),
    [...EXCLUDED_DIRECT_FACETS].sort((a,b)=>FACET_KEYS.indexOf(a)-FACET_KEYS.indexOf(b)));
  for(const entry of audit) {
    assert.ok(entry.excluded!==Boolean(entry.effects.length),
      entry.key+' must be deliberately used or excluded, not both');
  }
  assert.equal(EXCLUDED_DIRECT_FACETS.length,3);
  assert.equal(Object.keys(ARCHETYPE_FACET_FOCI).length,6);
  assert.deepEqual(Object.keys(ITEM_FACET_FOCI),Object.keys(ITEM_FAMILIES));
});

test('facet contrasts require a reported parent, are bounded, and omit missing groups',()=>{
  const none=facetContrastMap(ocean,null);
  assert.deepEqual(none,{});
  const all=facetContrastMap(ocean,facets());
  assert.equal(Object.keys(all).length,30);
  assert.ok(Object.values(all).every(n=>n===0));
  const oOnly=changed('O5',100).map((v,i)=>i<6?v:null);
  const contrast=facetContrastMap(ocean,oOnly);
  assert.equal(contrast.O5,30);
  assert.equal(contrast.O2,0);
  assert.ok(!('C5' in contrast));
  const low=facetContrastMap(ocean,changed('C2',0));
  assert.equal(low.C2,-30);
  assert.equal(ARCHETYPE_FACET_CAP,6);
  assert.equal(ITEM_FACET_CAP,4);
});

test('facet detail adjusts only the existing archetype temperament-fit component',()=>{
  assert.equal(archetypeFacetAdjustment('steward',null),0);
  assert.equal(archetypeFacetAdjustment('steward',{}),0);
  const positive={A3:30,A4:30,A6:30,E1:30};
  const negative={A3:-30,A4:-30,A6:-30,E1:-30};
  assert.equal(archetypeFacetAdjustment('steward',positive),6);
  assert.equal(archetypeFacetAdjustment('steward',negative),-6);
  assert.equal(archetypeFacetAdjustment('strategist',positive),0);
  const proto=ARCHETYPE_PROTOTYPES.find(x=>x.id==='steward');
  const [core,second,third]=deriveTritype(proto.ennea).split('').map(Number);
  const args={
    enneagramScores:proto.ennea,mbtiScores:proto.mbti,
    bigFive:proto.ocean.map(x=>x>50?x-10:x+10),
    mbti:deriveMbti(proto.mbti),core,second,third,role:role('Support')
  };
  const base=classifyArchetype(args);
  const enhanced=classifyArchetype({...args,facetContrasts:positive});
  assert.equal(base.mode,'steward');
  assert.equal(enhanced.mode,'steward');
  assert.equal(enhanced.facetAdjustment,6);
  assert.equal(base.facetAdjustment,0);
  assert.equal(enhanced.breakdown.motivation,base.breakdown.motivation);
  assert.equal(enhanced.breakdown.cognition,base.breakdown.cognition);
  assert.equal(enhanced.breakdown.battle,base.breakdown.battle);
  assert.equal(enhanced.breakdown.temperament-base.breakdown.temperament,6);
});

test('facet-driven item family preferences are bounded, contextual and not universal',()=>{
  assert.equal(itemFacetAdjustment('support',{A3:30,A4:30,A6:30}),4);
  assert.equal(itemFacetAdjustment('support',{A3:-30,A4:-30,A6:-30}),-4);
  assert.equal(itemFacetAdjustment('protection',{A3:30,A4:30}),0);
  assert.ok(itemFacetAdjustment('risk',{O4:30,E5:30})>0);
  assert.ok(itemFacetAdjustment('preparation',{C6:30,C2:30})>0);
  assert.ok(itemFacetAdjustment('support',null)===0);
  const special=generateBuild({...full,bigFiveFacets:changeMany({A3:90,A4:90,A6:90})});
  assert.equal(special.baseStats.hp>=45,true);
  if(special.signatureStrategy)assert.equal(special.heldItem.facetAdjustment,undefined,
    'mechanically required signature equipment cannot be modified by facet preferences');
  else assert.ok(Math.abs(special.heldItem.facetAdjustment)<=4);
});

test('facet-specific field observations distinguish social nuances without changing Nature',()=>{
  const high=facetFieldObservations({E2:30,A1:-30,N5:20});
  assert.equal(high.length,2);
  assert.ok(high.some(item=>item.key==='E2'));
  assert.ok(high.some(item=>item.key==='A1'));
  assert.deepEqual(facetFieldObservations({E2:10,O3:5}),[]);
  const withNotes=generateBuild({...full,bigFiveFacets:changed('E2',100)});
  const without=generateBuild({...full,bigFiveFacets:facets()});
  assert.equal(withNotes.nature,without.nature);
  assert.deepEqual(withNotes.baseStats,without.baseStats);
  assert.match(withNotes.report.temperament,/detailed IPIP-NEO report suggests/);
  assert.match(withNotes.report.temperament,/guild hall/);
  assert.doesNotMatch(without.report.temperament,/detailed IPIP-NEO report suggests/);
});

test('excluded political, moral and depressive facets never independently change outcomes',()=>{
  const baseline=generateBuild({...full,bigFiveFacets:facets()});
  for(const facet of EXCLUDED_DIRECT_FACETS){
    const input={...full,bigFiveFacets:changed(facet,99)};
    const build=generateBuild(input);
    assert.deepEqual(build.baseStats,baseline.baseStats,facet+' shifted stats');
    assert.equal(build.nature,baseline.nature,facet+' shifted Nature');
    assert.equal(build.archetype.title,baseline.archetype.title,facet+' shifted archetype');
    assert.equal(build.heldItem.name,baseline.heldItem.name,facet+' shifted item');
    assert.equal(build.report.temperament,baseline.report.temperament,facet+' shifted field notes');
  }
});

test('facets do not add a hidden weighting source or alter typing and growth rules',()=>{
  const input={...full,bigFiveFacets:changeMany({C2:95,A3:95,A4:94,O3:95,E6:95})};
  const a=generateBuild(input);
  const b=generateBuild(input);
  assert.deepEqual(a,b);
  const old=generateBuild(full);
  assert.equal(a.nature,old.nature,'Nature remains independently scored');
  assert.deepEqual(a.types,old.types,'Enneagram typing is independent of facets');
  assert.equal(a.moves[3].category,'Growth move');
  assert.equal(Object.values(a.baseStats).reduce((x,y)=>x+y,0),535);
  assert.equal(a.statWeights.spa.bigFive,old.statWeights.spa.bigFive);
  assert.ok(a.archetype.facetAdjustment>=-6&&a.archetype.facetAdjustment<=6);
  assert.ok(!('bigFiveFacets' in a),'no raw facet percentiles in public build result');
});
