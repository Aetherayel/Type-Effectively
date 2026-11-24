import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FACET_GROUPS,FACET_KEYS,FACET_REFINEMENTS,FACET_CONTRAST_CAP,
  validateFacetScores,refineBigFiveAffinities
} from '../src/bigfive-facets.mjs';
import { oceanAffinity, generateBuild } from '../src/engine.mjs';
import { DEMOS, STAT_KEYS } from '../src/data.mjs';

const sameDomainFacets=domains=>FACET_GROUPS.flatMap(g=>Array(6).fill(domains[g.domainIndex]));
const set=(facets,key,value)=>facets.map((old,i)=>FACET_KEYS[i]===key?value:old);
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const profile={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:[27,94,21,69,14]
};

test('canonical thirty IPIP-NEO facets have stable domain identities and intentional mappings',()=>{
  assert.equal(FACET_GROUPS.length,5);
  assert.deepEqual(FACET_GROUPS.map(g=>g.code),['O','C','E','A','N']);
  assert.deepEqual(FACET_GROUPS.map(g=>g.facets.length),[6,6,6,6,6]);
  assert.equal(FACET_KEYS.length,30);
  assert.equal(new Set(FACET_KEYS).size,30);
  assert.deepEqual(FACET_KEYS.slice(0,6),['O1','O2','O3','O4','O5','O6']);
  assert.ok(FACET_GROUPS[0].facets.includes('Intellect'));
  assert.ok(FACET_GROUPS[1].facets.includes('Self-Discipline'));
  const used=Object.values(FACET_REFINEMENTS).flatMap(rows=>rows.flatMap(row=>Object.keys(row.focus)));
  assert.ok(!used.includes('O6'),'political values cannot become a stat bonus');
  assert.ok(!used.includes('A2'),'moral norms cannot become a stat bonus');
  for(const row of Object.values(FACET_REFINEMENTS).flat())
    assert.ok(Math.abs(sum(Object.values(row.focus))-1)<1e-10);
  assert.equal(FACET_CONTRAST_CAP,30);
});

test('missing facet inputs preserve original domain-only scoring exactly',()=>{
  const original=oceanAffinity(profile.bigFive);
  assert.deepEqual(refineBigFiveAffinities(profile.bigFive,original,null),{
    affinities:original,activeDomains:[],corrections:Array(6).fill(0)
  });
  const build=generateBuild(profile);
  const empty=generateBuild({...profile,bigFiveFacets:null});
  assert.deepEqual(build.baseStats,empty.baseStats);
  assert.deepEqual(build.effectiveStats,empty.effectiveStats);
  assert.deepEqual(build.affinities,empty.affinities);
  assert.deepEqual(build.nature,empty.nature);
  assert.deepEqual(build.role,empty.role);
  assert.deepEqual(build.moves,empty.moves);
  assert.deepEqual(build.facetScoring.activeDomains,[]);
});

test('facet scores identical to their parent domains do not fabricate stat shifts',()=>{
  const all=sameDomainFacets(profile.bigFive);
  const base=oceanAffinity(profile.bigFive);
  const result=refineBigFiveAffinities(profile.bigFive,base,all);
  assert.deepEqual(result.affinities,base);
  assert.deepEqual(result.corrections,Array(6).fill(0));
  assert.deepEqual(result.activeDomains,['O','C','E','A','N']);
  const build=generateBuild({...profile,bigFiveFacets:all});
  assert.deepEqual(build.baseStats,generateBuild(profile).baseStats);
});

test('matching broad Openness, contrasting Intellect facets yield different Ingenuity',()=>{
  const base=sameDomainFacets(profile.bigFive);
  const high=set(base,'O5',96),low=set(base,'O5',4);
  const one=generateBuild({...profile,bigFiveFacets:high});
  const other=generateBuild({...profile,bigFiveFacets:low});
  assert.deepEqual(one.facetScoring.activeDomains,['O','C','E','A','N']);
  assert.ok(one.breakdown.bigFive[3]>other.breakdown.bigFive[3]);
  assert.ok(one.baseStats.spa>other.baseStats.spa,
    'intellectual preference facets should differentiate Sp. Atk even when overall O is unchanged');
  assert.deepEqual(one.nature,other.nature,'facets must not secretly reclassify Nature');
  assert.deepEqual(one.types,other.types,'facets must not change Enneagram typing');
  assert.equal(sum(Object.values(one.baseStats)),535);
  assert.equal(sum(Object.values(other.baseStats)),535);
});

test('no incremental SpA influence from political or moral facets',()=>{
  const base=sameDomainFacets(profile.bigFive);
  const original=refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),base);
  for(const key of ['O6','A2']){
    const changed=refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),set(base,key,100));
    assert.equal(changed.affinities[3],original.affinities[3],
      key+' must not independently affect conceptual ingenuity');
  }
});

test('selected facets target recognizable behavior, not a generic all-stat boost',()=>{
  const base=sameDomainFacets(profile.bigFive);
  const focused=set(base,'E3',95);
  const neutral=refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),base);
  const strengthened=refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),focused);
  assert.ok(strengthened.affinities[1]>neutral.affinities[1],'assertiveness raises Attack affinity');
  assert.equal(strengthened.affinities[3],neutral.affinities[3],'assertiveness does not boost ingenuity');
  const lessVulnerable=set(base,'N6',1);
  const composed=refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),lessVulnerable);
  assert.ok(composed.affinities[4]>neutral.affinities[4],'lower Vulnerability raises composure');
});

test('partial facet domain groups are valid; partial individual domains are rejected',()=>{
  const all=sameDomainFacets(profile.bigFive);
  const first=all.map((v,i)=>i<6?v:null);
  assert.deepEqual(validateFacetScores(first),first);
  assert.deepEqual(refineBigFiveAffinities(profile.bigFive,oceanAffinity(profile.bigFive),first).activeDomains,['O']);
  assert.throws(()=>validateFacetScores(first.slice(0,29)),/30 IPIP-NEO/);
  assert.throws(()=>validateFacetScores(Array(30).fill(null)),/at least one complete/);
  assert.throws(()=>validateFacetScores(first.map((v,i)=>i===3?null:v)),/six Openness facets/);
  assert.throws(()=>validateFacetScores(set(first,'O5',101)),/between 0 and 100/);
  assert.throws(()=>validateFacetScores(set(first,'O5',-1)),/between 0 and 100/);
  assert.throws(()=>validateFacetScores(set(first,'O5','high')),/between 0 and 100/);
  assert.throws(()=>generateBuild({...profile,bigFiveFacets:all,bigFive:null}),/five Big Five domain scores/);
});

test('factor weights and 535 BST unchanged; optional facets propagate through full result',()=>{
  const all=sameDomainFacets(profile.bigFive);
  const facets=set(set(all,'O5',97),'C5',92);
  const a=generateBuild({...profile,bigFiveFacets:facets});
  const b=generateBuild({...profile,bigFiveFacets:facets});
  assert.deepEqual(a,b,'same full input produces identical complete build');
  assert.equal(sum(Object.values(a.baseStats)),535);
  assert.ok(Object.values(a.baseStats).every(n=>n>=45&&n<=140));
  assert.equal(a.statWeights.spa.bigFive,.25,'facet input must not increase Big Five source weight');
  assert.equal(a.statWeightMode,'percentages');
  assert.ok(a.facetScoring.corrections.spa!==0);
  assert.ok(a.report&&a.archetype&&a.moves.length===4);
});

test('seeded facet populations preserve all-stat reachability and plausible bounds',()=>{
  let seed=3707;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const tops=Array(6).fill(0),roles=new Set(),count=900;
  for(let i=0;i<count;i++){
    const bigFive=Array.from({length:5},()=>Math.floor(rand()*101));
    // Start from the parent percentile, then introduce bounded facet scatter.
    const facets=sameDomainFacets(bigFive).map(v=>Math.max(0,Math.min(100,Math.round(v+(rand()-.5)*120))));
    const build=generateBuild({
      bigFive,bigFiveFacets:facets,
      mbtiScores:Array.from({length:5},()=>Math.floor(rand()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(rand()*101))
    });
    assert.equal(sum(Object.values(build.baseStats)),535);
    assert.ok(Object.values(build.baseStats).every(n=>n>=45&&n<=140));
    const spread=STAT_KEYS.map(k=>build.baseStats[k]);
    tops[spread.indexOf(Math.max(...spread))]++;
    roles.add(build.role.primary.name);
  }
  assert.ok(tops.every(n=>n>0),'no stat may become unreachably dominant/suppressed: '+tops);
  assert.equal(roles.size,6,'all six battle roles must remain reachable with facets');
});

test('browser form, shared-link restore, and result explanation expose the optional facet path',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/id="bigfive-facet-panel"/);
  assert.match(html,/id="bigfive-facet-groups"/);
  assert.match(app,/FACET_GROUPS\.map\(facetMarkup\)/);
  assert.match(app,/bigFiveFacets:readFacetScores\(\)/);
  assert.match(app,/input\.bigFiveFacets/);
  assert.match(app,/resetFacetFields\(\)/);
  assert.match(app,/IPIP-NEO facet refinement/);
});
