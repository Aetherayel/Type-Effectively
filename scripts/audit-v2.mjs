// V2 baseline diagnostic audit. Deterministic synthetic stress testing:
// NOT a sample of actual people, not psychometric validation or calibration.
// Run: node scripts/audit-v2.mjs
// The generator is the sole authority for every observation.
import { generateBuild, oceanAffinity, enneagramAffinity, mbtiAffinity } from '../src/engine.mjs';
import { STAT_KEYS, MBTI_TYPES } from '../src/data.mjs';
import { FACET_GROUPS } from '../src/bigfive-facets.mjs';

const SEED=20261123;
const rng=(()=>{let seed=SEED;return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);})();
const int=n=>Math.floor(rng()*n);
const percentile=()=>int(101);
const vector=n=>Array.from({length:n},percentile);
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:0;
const round=(n,d=2)=>Number(n.toFixed(d));
const counts=items=>Object.fromEntries([...new Set(items)].sort().map(key=>[key,items.filter(v=>v===key).length]));
const stats=b=>STAT_KEYS.map(key=>b.baseStats[key]);
const sum=x=>x.reduce((a,b)=>a+b,0);
const l1=(a,b)=>mean(a.map((v,i)=>Math.abs(v-b[i])));
const correlation=(rows,a,b)=>{
  const x=rows.map(r=>r[a]),y=rows.map(r=>r[b]),mx=mean(x),my=mean(y);
  const v1=sum(x.map(v=>(v-mx)**2)),v2=sum(y.map(v=>(v-my)**2));
  return v1*v2?round(sum(x.map((v,i)=>(v-mx)*(y[i]-my)))/Math.sqrt(v1*v2),3):null;
};
const clamp=v=>Math.max(0,Math.min(100,v));
const randomFacets=domains=>FACET_GROUPS.flatMap(group=>
  Array.from({length:6},()=>clamp(Math.round(domains[group.domainIndex]+(rng()-.5)*65))));
const randomInput=(mode,faceted=false)=>{
  const input={enneagramScores:vector(9),bigFive:vector(5)};
  if(mode==='functions')input.functionScores=vector(8);
  else if(mode==='typeOnly')input.typeOverride=MBTI_TYPES[int(MBTI_TYPES.length)];
  else input.mbtiScores=vector(5);
  if(faceted)input.bigFiveFacets=randomFacets(input.bigFive);
  return input;
};
function build(input) {
  const result=generateBuild(input);
  const values=stats(result);
  if(sum(values)!==600 || values.some(v=>v<20||v>180))
    throw new Error('Audit encountered a broken 600/20–180 stat invariant.');
  if(result.moves.length!==4)throw new Error('Audit encountered an incomplete moveset.');
  return result;
}
const chosen=b=>({
  nature:b.nature,
  type:b.types.join('/'),
  primaryRole:b.role.primary.name,
  secondaryRole:b.role.secondary?.name||null,
  specialty:b.signatureStrategy?.id||null,
  ability:b.ability.name,
  hiddenAbility:b.hiddenAbility,
  item:b.heldItem.name,
  archetype:b.archetype.id,
  moves:b.moves.map(m=>m.name).join('/')
});
const change=(a,b)=>{
  const old=chosen(a),now=chosen(b);
  return Object.fromEntries(Object.keys(old).map(key=>[key,old[key]!==now[key]]));
};
const outputMetrics=(before,after)=>{
  const diffs=change(before,after);
  const statChanges=stats(before).map((x,i)=>Math.abs(x-stats(after)[i]));
  return {
    statL1:l1(stats(before),stats(after)),
    statChanges,
    fields:diffs,
    itemDetails:{
      changed:diffs.item,
      familyChanged:before.heldItem.family!==after.heldItem.family,
      unchangedBaseStats:statChanges.every(delta=>delta===0),
      noOtherClassificationChanged:!Object.entries(diffs).some(([name,changed])=>name!=='item'&&changed),
      stableNatureRoleSpecialty:!diffs.nature&&!diffs.primaryRole&&!diffs.secondaryRole&&!diffs.specialty
    },
    cascade:Object.values(diffs).filter(Boolean).length
  };
};
const summarizeRows=rows=>{
  const baseline=rows.map(stats);
  const top=STAT_KEYS.map(()=>0);
  for(const row of baseline)top[row.indexOf(Math.max(...row))]++;
  const correlations={};
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)
    correlations[STAT_KEYS[i]+'_'+STAT_KEYS[j]]=correlation(baseline,i,j);
  const margins=rows.map(b=>b.role.all[0].score-b.role.all[1].score);
  return {
    n:rows.length,
    meanBase:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,round(mean(baseline.map(row=>row[i])))])),
    topStat:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,top[i]])),
    roleMargin:{mean:round(mean(margins)),within1:margins.filter(m=>m<=1).length,within5:margins.filter(m=>m<=5).length},
    role:counts(rows.map(b=>b.role.primary.name)),
    nature:counts(rows.map(b=>b.nature)),
    specialty:counts(rows.map(b=>b.signatureStrategy?.id||'none')),
    archetypeMode:counts(rows.map(b=>b.archetype.mode)),
    correlations
  };
};
const auditCohorts=()=>{
  const cohorts={};
  for(const [label,mode,faceted] of [
    ['percentages_domains','percentages',false],
    ['percentages_facets','percentages',true],
    ['eight_functions_domains','functions',false],
    ['type_only_domains','typeOnly',false]
  ]){
    const profiles=Array.from({length:450},()=>build(randomInput(mode,faceted)));
    cohorts[label]=summarizeRows(profiles);
  }
  return cohorts;
};
// Replace a complete reported framework while holding the others fixed.
// Values are *normalized output changes*, not statistical variance shares.
const auditSourceReplacement=()=>{
  const result={};
  for(const mode of ['percentages','functions']){
    // Use exactly the same 280 baseline personalities for all three sources,
    // avoiding cohort composition as a confound in realized-sensitivity ranking.
    const originals=Array.from({length:280},()=>randomInput(mode));
    const baselines=originals.map(build);
    const bySource={};
    for(const source of ['bigFive','enneagram','cognition']){
      const metrics=[];
      for(let i=0;i<originals.length;i++){
        const original=originals[i];
        const next={...original};
        if(source==='bigFive')next.bigFive=vector(5);
        else if(source==='enneagram')next.enneagramScores=vector(9);
        else if(mode==='functions')next.functionScores=vector(8);
        else next.mbtiScores=vector(5);
        metrics.push(outputMetrics(baselines[i],build(next)));
      }
      bySource[source]=summarizeDeltas(metrics);
    }
    result[mode]=bySource;
  }
  return result;
};
function summarizeDeltas(rows){
  const changed=Object.keys(rows[0].fields);
  const l1s=rows.map(r=>r.statL1);
  const cascade=rows.map(r=>r.cascade);
  const sorted=[...l1s].sort((a,b)=>a-b);
  const n=rows.length;
  return {
    n,meanStatAbsDelta:round(mean(l1s)),
    p95StatAbsDelta:round(sorted[Math.min(n-1,Math.ceil(.95*n)-1)]),
    meanAbsStatDelta:Object.fromEntries(STAT_KEYS.map((key,i)=>[key,round(mean(rows.map(row=>row.statChanges[i])))])),
    changedPct:Object.fromEntries(changed.map(key=>[key,round(100*mean(rows.map(row=>Number(row.fields[key]))),1)])),
    cascades3plus:rows.filter(r=>r.cascade>=3).length,
    itemDiagnostic:{
      itemChanges:rows.filter(r=>r.itemDetails.changed).length,
      changedFamilies:rows.filter(r=>r.itemDetails.familyChanged).length,
      changesWithIdenticalBaseStats:rows.filter(r=>r.itemDetails.changed&&r.itemDetails.unchangedBaseStats).length,
      itemWasOnlyChangedOutput:rows.filter(r=>r.itemDetails.changed&&r.itemDetails.noOtherClassificationChanged).length,
      itemChangedWithStableNatureAndRole:rows.filter(r=>r.itemDetails.changed&&r.itemDetails.stableNatureRoleSpecialty).length
    },
    maximumChangedFields:Math.max(...cascade)
  };
}
const perturb=(array,index,step)=>array.map((v,i)=>i===index?clamp(v+(v>100-step?-step:step)):v);
const auditLocalSensitivity=()=>{
  const groups={};
  for(const [name,mode,faceted,key,length] of [
    ['bigfive','percentages',false,'bigFive',5],
    ['enneagram','percentages',false,'enneagramScores',9],
    ['cognition_percentages','percentages',false,'mbtiScores',4],
    ['cognition_functions','functions',false,'functionScores',8],
    ['facets','percentages',true,'bigFiveFacets',30]
  ]){
    groups[name]={};
    for(const size of [1,5]){
      const deltas=[],notable=[];
      for(let i=0;i<300;i++){
        const before=randomInput(mode,faceted);
        const index=int(length);
        const after={...before,[key]:perturb(before[key],index,size)};
        const initial=build(before),altered=build(after);
        const m=outputMetrics(initial,altered);
        deltas.push(m);
        if(m.cascade>=3&&notable.length<3)
          notable.push({dimension:key+'['+index+']',step:size,
            statL1:round(m.statL1),changed:Object.keys(m.fields).filter(x=>m.fields[x]),
            before:{nature:initial.nature,role:initial.role.primary.name,archetype:initial.archetype.id},
            after:{nature:altered.nature,role:altered.role.primary.name,archetype:altered.archetype.id}});
      }
      groups[name]['plus'+size]={...summarizeDeltas(deltas),notable};
    }
  }
  return groups;
};
const auditMissingData=()=>{
  const metrics=[],unchangedBase=[];
  const specialty={measuredNeutral:0,omitted:0,changed:0};
  for(let i=0;i<360;i++){
    const original=randomInput('percentages');
    const measured={...original,bigFive:[50,50,50,50,50]};
    const omitted={...original,bigFive:null};
    const first=build(measured),second=build(omitted);
    metrics.push(outputMetrics(first,second));
    unchangedBase.push(stats(first).every((v,k)=>v===stats(second)[k]));
    if(first.signatureStrategy)specialty.measuredNeutral++;
    if(second.signatureStrategy)specialty.omitted++;
    if(first.signatureStrategy?.id!==second.signatureStrategy?.id)specialty.changed++;
  }
  return {
    scenario:'reported neutral-50 domains versus Big Five omitted; all other inputs unchanged',
    sameBaseStats:unchangedBase.filter(Boolean).length,
    specialty,
    ...summarizeDeltas(metrics)
  };
};
const auditFacetRefinement=()=>{
  const metrics=[];
  const protectedOutputs={nature:0,type:0};
  for(let i=0;i<350;i++){
    const original=randomInput('percentages');
    const detailed={...original,bigFiveFacets:randomFacets(original.bigFive)};
    const first=build(original),second=build(detailed);
    metrics.push(outputMetrics(first,second));
    if(first.nature!==second.nature)protectedOutputs.nature++;
    if(first.types.join()!==second.types.join())protectedOutputs.type++;
  }
  return {domainOnlyVersusFacets:summarizeDeltas(metrics),protectedOutputs};
};

// A neutral *source baseline*, not a human profile. All domain scores and all
// preference axes equal 50; all nine Enneagram motivations have equal strength.
const auditNeutralBaseline=()=>{
  const input={
    bigFive:Array(5).fill(50),mbtiScores:Array(5).fill(50),
    enneagramScores:Array(9).fill(50)
  };
  const sample=build(input);
  return {
    input:'all five Big Five domains, all five 16P axes, all nine Enneagram types = 50',
    sourceAffinities:{
      bigFive:oceanAffinity(input.bigFive).map(x=>round(x)),
      enneagram:enneagramAffinity(input.enneagramScores).map(x=>round(x)),
      cognition:mbtiAffinity(input.mbtiScores).map(x=>round(x))
    },
    blendedAffinities:STAT_KEYS.map(key=>sample.affinities[key]),
    stats:sample.baseStats,
    spread:Math.max(...stats(sample))-Math.min(...stats(sample))
  };
};
const audit={
  metadata:{
    branch:'feature/personality-stat-recalibration',
    seed:SEED,
    note:'Uniform synthetic stress profiles: not representative of user distributions or real assessment reliability.',
    sensitivity:'Controlled input replacements and +1/+5 input-point perturbations on random synthetic baselines.',
    metrics:'meanStatAbsDelta = mean absolute base-stat point difference across six stats; changedPct is percentage of paired builds with changed output.'
  },
  neutralBaseline:auditNeutralBaseline(),
  cohorts:auditCohorts(),
  sourceReplacement:auditSourceReplacement(),
  localSensitivity:auditLocalSensitivity(),
  missingBigFive:auditMissingData(),
  facetRefinement:auditFacetRefinement()
};
console.log('V2_AUDIT_JSON='+JSON.stringify(audit));
console.log('V2 audit complete. Deterministic diagnostic only; no scoring rules modified.');
