import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FACET_GROUPS,FACET_KEYS,FACET_STAT_COMPONENTS,
  FACET_NATURE_COMPONENTS,FACET_CONTEXT_FOCI,
  validateFacetScores,resolveBigFiveEvidence,hasCompleteBigFiveEvidence,
  refineBigFiveAffinities,bigFiveNaturePriorities,facetProfileFit,facetContrastMap
} from '../src/bigfive-facets.mjs';
import { oceanAffinity, generateBuild, generateCompleteBuild } from '../src/engine.mjs';
import { DEMOS, STAT_KEYS } from '../src/data.mjs';

const domains=[27,94,21,69,14];
const sameDomainFacets=xs=>FACET_GROUPS.flatMap(g=>Array(6).fill(xs[g.domainIndex]));
const set=(facets,key,value)=>facets.map((old,i)=>FACET_KEYS[i]===key?value:old);
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const full={mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:domains};

test('all thirty facets and six stat component budgets are explicit and safe',()=>{
  assert.deepEqual(FACET_GROUPS.map(g=>g.code),['O','C','E','A','N']);
  assert.deepEqual(FACET_GROUPS.map(g=>g.facets.length),[6,6,6,6,6]);
  assert.equal(FACET_KEYS.length,30);
  assert.equal(new Set(FACET_KEYS).size,30);
  for(const rows of Object.values(FACET_STAT_COMPONENTS)){
    assert.ok(Math.abs(sum(rows.map(r=>r.coefficient))-1)<1e-12);
    for(const part of rows){
      assert.ok(Math.abs(sum(Object.values(part.focus))-1)<1e-12);
      assert.ok(Object.keys(part.focus).every(key=>key.startsWith(part.domain)));
    }
  }
  for(const rules of Object.values(FACET_NATURE_COMPONENTS))
    assert.ok(Math.abs(sum(rules.map(r=>r.coefficient))-1)<1e-12);
  const used=[
    ...Object.values(FACET_STAT_COMPONENTS).flatMap(rows=>rows.flatMap(r=>Object.keys(r.focus))),
    ...Object.values(FACET_NATURE_COMPONENTS).flatMap(rows=>rows.flatMap(r=>Object.keys(r.focus))),
    ...Object.values(FACET_CONTEXT_FOCI).flatMap(Object.keys)
  ];
  assert.ok(!used.includes('O6'));assert.ok(!used.includes('A2'));assert.ok(!used.includes('N3'));
});

test('five-domain-only builds preserve the previous six Big Five stat affinities exactly',()=>{
  const base=oceanAffinity(domains);
  const detailed=refineBigFiveAffinities(domains,base,null);
  assert.deepEqual(detailed.affinities,base);
  assert.deepEqual(detailed.activeDomains,[]);
  assert.deepEqual(detailed.corrections,[0,0,0,0,0,0]);
  const before=generateBuild(full);
  const after=generateBuild({...full,bigFiveFacets:null});
  assert.deepEqual(before,after);
});

test('30 complete facets satisfy the third required personality assessment without five domains',()=>{
  const facets=sameDomainFacets(domains);
  assert.equal(hasCompleteBigFiveEvidence(null,facets),true);
  const build=generateCompleteBuild({...full,bigFive:null,bigFiveFacets:facets});
  assert.equal(sum(Object.values(build.baseStats)),535);
  assert.ok(build.role.primary.name&&build.nature&&build.archetype);
  assert.equal(build.facetScoring.activeDomains.length,5);
  assert.equal(build.oceanSource,'facet-context');
  assert.ok(Object.values(build.facetScoring.corrections).every(x=>x===null),
    'without reported broad domains there is no domain-comparison delta');
  assert.equal(build.moves.length,4);
});

test('incomplete facet groups are rejected; missing groups need five reported domains',()=>{
  const facets=sameDomainFacets(domains);
  const partial=facets.map((v,i)=>i<6?v:null);
  assert.deepEqual(validateFacetScores(partial),partial);
  assert.throws(()=>resolveBigFiveEvidence(null,partial),/all 30/);
  assert.deepEqual(resolveBigFiveEvidence(domains,partial).activeDomains,['O']);
  assert.throws(()=>generateCompleteBuild({...full,bigFive:null,bigFiveFacets:partial}),/all 30/);
  assert.throws(()=>validateFacetScores(partial.slice(1)),/30 IPIP-NEO/);
  assert.throws(()=>validateFacetScores(partial.map((v,i)=>i===2?null:v)),/six Openness facets/);
  assert.throws(()=>validateFacetScores(set(partial,'O5',101)),/between 0 and 100/);
});

test('high intellectual facets escape low overall Openness without a contrast cap',()=>{
  const base=sameDomainFacets(domains);
  const high=set(set(set(base,'O5',98),'O1',91),'O2',84);
  const low=set(set(set(base,'O5',10),'O1',10),'O2',10);
  const a=refineBigFiveAffinities(domains,oceanAffinity(domains),high);
  const b=refineBigFiveAffinities(domains,oceanAffinity(domains),low);
  const expected=.60*(.65*98+.25*91+.10*84)+
    .20*(.55*domains[1]+.45*domains[1])+
    .20*(100-domains[2]);
  assert.ok(Math.abs(a.affinities[3]-expected)<1e-10);
  assert.ok(a.affinities[3]-b.affinities[3]>25,
    'facet-specific ingenuity should not be capped at the broad-domain score');
  assert.ok(a.affinities[3]>oceanAffinity(domains)[3]+25);
  const highBuild=generateCompleteBuild({...full,bigFiveFacets:high});
  const lowBuild=generateCompleteBuild({...full,bigFiveFacets:low});
  assert.ok(highBuild.sourceStatAffinities.spa.bigFive>
    lowBuild.sourceStatAffinities.spa.bigFive);
  assert.ok(highBuild.baseStats.spa>lowBuild.baseStats.spa);
});

test('with all thirty facets, changing only the five broad scores cannot change gameplay',()=>{
  const facets=set(set(sameDomainFacets(domains),'O5',96),'C5',88);
  const a=generateCompleteBuild({...full,bigFive:[5,5,5,5,5],bigFiveFacets:facets});
  const b=generateCompleteBuild({...full,bigFive:[95,95,95,95,95],bigFiveFacets:facets});
  for(const key of ['baseStats','effectiveStats','nature','role','types','heldItem','archetype','moves','signatureStrategy','rawStatAffinities','sourceStatAffinities','report'])
    assert.deepEqual(a[key],b[key],key+' was still driven by compressed broad inputs');
  assert.deepEqual(a.breakdown.bigFive,b.breakdown.bigFive);
});

test('partial facet group changes only contributions that use that group',()=>{
  const facets=sameDomainFacets(domains).map((v,i)=>i<6?v:null);
  const a=refineBigFiveAffinities(domains,oceanAffinity(domains),facets);
  assert.deepEqual(a.activeDomains,['O']);
  assert.ok(Math.abs(a.affinities[0]-oceanAffinity(domains)[0])<1e-10,
    'O cannot influence HP through a missing unrelated mapping');
  const more=set(facets,'O5',98);
  const b=refineBigFiveAffinities(domains,oceanAffinity(domains),more);
  assert.ok(b.affinities[3]>a.affinities[3]);
  assert.equal(b.affinities[1],a.affinities[1]);
});

test('Nature and archetype/held-item temperament lenses use facets directly',()=>{
  const base=sameDomainFacets(domains);
  const high=set(base,'O5',100),low=set(base,'O5',0);
  const natureHigh=bigFiveNaturePriorities(domains,high);
  const natureLow=bigFiveNaturePriorities(domains,low);
  assert.ok(natureHigh[2]>natureLow[2]);
  const target=[90,80,40,60,25];
  const focus={O5:1,C5:1};
  assert.notEqual(facetProfileFit(domains,high,target,focus),
    facetProfileFit(domains,low,target,focus));
});

test('political values, moral conformity, and depression have no independent gameplay influence',()=>{
  const facets=sameDomainFacets(domains);
  const b=generateBuild({...full,bigFiveFacets:facets});
  for(const key of ['O6','A2','N3']){
    const changed=generateBuild({...full,bigFiveFacets:set(facets,key,100)});
    for(const part of ['baseStats','nature','types','archetype','heldItem','moves','report'])
      assert.deepEqual(changed[part],b[part],key+' changed '+part);
  }
});

test('facet detail has deterministic 535 BST, valid role coverage and no fourth source',()=>{
  let seed=3707;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const tops=Array(6).fill(0),roles=new Set();
  for(let i=0;i<600;i++){
    const broad=Array.from({length:5},()=>Math.floor(rand()*101));
    const facets=sameDomainFacets(broad).map(v=>Math.max(0,Math.min(100,Math.round(v+(rand()-.5)*110))));
    const build=generateCompleteBuild({
      mbtiScores:Array.from({length:5},()=>Math.floor(rand()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(rand()*101)),
      bigFiveFacets:facets
    });
    assert.equal(sum(Object.values(build.baseStats)),535);
    assert.ok(Object.values(build.baseStats).every(n=>n>=45&&n<=140));
    assert.equal(build.statWeights.spa.bigFive,.45);
    const spread=STAT_KEYS.map(k=>build.baseStats[k]);
    tops[spread.indexOf(Math.max(...spread))]++;
    roles.add(build.role.primary.name);
  }
  assert.ok(tops.every(n=>n>0),'one stat never leads: '+tops);
  assert.equal(roles.size,6,'all six tactical roles remain reachable');
});

test('browser shows facet-first input and shared-link restore',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/all 30 IPIP-NEO facets/i);
  assert.match(app,/bigFiveFacets/);
  assert.match(app,/resetFacetFields\(\)/);
  assert.match(app,/Facet-first Big Five/);
  assert.match(app,/input\.bigFiveFacets/);
});
