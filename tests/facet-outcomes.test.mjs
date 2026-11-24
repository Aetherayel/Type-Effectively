import test from 'node:test';
import assert from 'node:assert/strict';
import { FACET_GROUPS, FACET_KEYS, facetContrastMap, facetProfileFit } from '../src/bigfive-facets.mjs';
import {
  ARCHETYPE_FACET_FOCI,ITEM_FACET_FOCI,EXCLUDED_DIRECT_FACETS,
  facetOutcomeAudit,facetFieldObservations
} from '../src/facet-outcomes.mjs';
import { ARCHETYPE_PROTOTYPES, classifyArchetype } from '../src/archetypes.mjs';
import { deriveTritype, deriveMbti, generateBuild } from '../src/engine.mjs';
import { DEMOS } from '../src/data.mjs';
import { ITEM_FAMILIES } from '../src/held-items-data.mjs';

const broad=[55,70,40,60,35];
const facets=()=>FACET_GROUPS.flatMap(g=>Array(6).fill(broad[g.domainIndex]));
const changed=(key,value)=>facets().map((v,i)=>FACET_KEYS[i]===key?value:v);
const roles=['Sweeper','Wall','Tank','Pivot','Support','Controller'];
const role=favorite=>({
  primary:{name:favorite,score:90},secondary:null,
  all:roles.map(name=>({name,score:name===favorite?90:45}))
});
const full={mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:broad};

test('all thirty facets are intentionally mapped or excluded',()=>{
  const audit=facetOutcomeAudit();
  assert.equal(audit.length,30);
  assert.deepEqual(audit.map(x=>x.key),FACET_KEYS);
  assert.deepEqual(audit.filter(x=>x.excluded).map(x=>x.key),
    [...EXCLUDED_DIRECT_FACETS].sort((a,b)=>FACET_KEYS.indexOf(a)-FACET_KEYS.indexOf(b)));
  assert.ok(audit.every(x=>x.excluded!==Boolean(x.effects.length)));
  assert.equal(EXCLUDED_DIRECT_FACETS.length,3);
  assert.equal(Object.keys(ARCHETYPE_FACET_FOCI).length,6);
  assert.deepEqual(Object.keys(ITEM_FACET_FOCI),Object.keys(ITEM_FAMILIES));
});

test('field observations recognize only distinctive facet evidence',()=>{
  const neutral=facetContrastMap(null,Array(30).fill(50));
  assert.ok(Object.values(neutral).every(v=>v===0));
  const high=facetFieldObservations({E2:30,A1:-30,N5:20});
  assert.equal(high.length,2);
  assert.ok(high.some(item=>item.key==='E2'));
  assert.ok(high.some(item=>item.key==='A1'));
  assert.deepEqual(facetFieldObservations({E2:10,O3:5}),[]);
  const sample=generateBuild({...full,bigFiveFacets:changed('E2',100)});
  assert.match(sample.report.temperament,/detailed IPIP-NEO report suggests/);
  assert.match(sample.report.temperament,/guild hall/);
});

test('archetype temperament fit uses direct selected facets, not +6 nudges',()=>{
  const proto=ARCHETYPE_PROTOTYPES.find(x=>x.id==='steward');
  const [core,second,third]=deriveTritype(proto.ennea).split('').map(Number);
  const args={
    enneagramScores:proto.ennea,mbtiScores:proto.mbti,
    bigFive:broad,mbti:deriveMbti(proto.mbti),core,second,third,role:role('Support')
  };
  const base=classifyArchetype(args);
  const detailed=classifyArchetype({...args,facetScores:changed('A3',100)});
  assert.equal(base.mode,'steward');
  assert.ok(detailed.breakdown.motivation===base.breakdown.motivation);
  assert.ok(detailed.breakdown.cognition===base.breakdown.cognition);
  assert.ok(detailed.breakdown.battle===base.breakdown.battle);
  assert.notEqual(
    facetProfileFit(broad,facets(),proto.ocean,ARCHETYPE_FACET_FOCI.steward),
    facetProfileFit(broad,changed('A3',100),proto.ocean,ARCHETYPE_FACET_FOCI.steward)
  );
});

test('equipment family uses meaning-specific facet fit while preserving prerequisites',()=>{
  const family=ITEM_FAMILIES.support;
  const high=facetProfileFit(broad,changed('A3',100),family.target,ITEM_FACET_FOCI.support);
  const low=facetProfileFit(broad,changed('A3',0),family.target,ITEM_FACET_FOCI.support);
  assert.notEqual(high,low);
  const build=generateBuild({...full,bigFiveFacets:changed('A3',100)});
  assert.ok(build.heldItem.name);
  assert.equal(build.moves.length,4);
  if(build.signatureStrategy)assert.equal(build.heldItem.facetAdjustment,undefined);
  else assert.ok(Number.isFinite(build.heldItem.facetAdjustment));
});

test('excluded political, moral and depressive facets do not change complete build',()=>{
  const original=generateBuild({...full,bigFiveFacets:facets()});
  for(const facet of EXCLUDED_DIRECT_FACETS){
    const next=generateBuild({...full,bigFiveFacets:changed(facet,100)});
    for(const key of ['baseStats','nature','role','types','archetype','heldItem','moves','report'])
      assert.deepEqual(next[key],original[key],facet+' affected '+key);
  }
});

test('facet-specific outcomes remain reproducible with same complete input',()=>{
  const input={...full,bigFiveFacets:changed('O5',98)};
  const a=generateBuild(input),b=generateBuild(input);
  assert.deepEqual(a,b);
  assert.deepEqual(a.types,generateBuild(full).types);
  assert.equal(Object.values(a.baseStats).reduce((x,y)=>x+y,0),535);
  assert.equal(a.statWeights.spa.bigFive,generateBuild(full).statWeights.spa.bigFive);
  assert.ok(!('bigFiveFacets' in a),'exact private facet inputs should not appear in public build');
});
