// Deterministic pre/post role recalibration comparison against the same
// synthetic full-profile inputs. No behavioral changes or population claims.
// Run: node scripts/audit-role-candidates.mjs
import assert from 'node:assert/strict';
import { generateCompleteBuild } from '../src/engine.mjs';
import { ROLE_AFFINITIES, ROLE_CALIBRATED_TEMPLATES, ROLE_NAMES, STAT_KEYS } from '../src/data.mjs';
import { classifyRole } from '../src/roles.mjs';
const total=535,mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const round=(x,d=1)=>Number(x.toFixed(d));
const labels=['Sweeper','Wall','Tank','Pivot','Support','Controller'];
let seed=260612;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const nums=n=>Array.from({length:n},()=>Math.floor(random()*101));
const roleCounts=rows=>Object.fromEntries(labels.map(k=>[k,rows.filter(r=>r.primary===k).length]));
const toolkit=b=>b.types.length===1?[b.types[0],b.types[0]]:b.types;

// Frozen reproduction of the V2.0.0 model: Nature-adjusted stats, uncorrected
// template proximity, and no distinct defensive priority or Wall variants.
function previousRole(build){
  const stats=STAT_KEYS.map(k=>build.effectiveStats[k]),sum=stats.reduce((a,b)=>a+b,0);
  const normalized=stats.map(x=>x*total/sum),types=toolkit(build);
  const scores=ROLE_NAMES.map((role,idx)=>{
    const base=ROLE_CALIBRATED_TEMPLATES[role],variants=[base];
    if(role==='Sweeper'||role==='Tank')
      variants.push([base[0],base[3],base[2],base[1],base[4],base[5]]);
    const rms=Math.min(...variants.map(target=>Math.sqrt(mean(
      normalized.map((v,i)=>(v-target[i])**2)))));
    const shape=100*Math.exp(-rms*rms/(2*25*25));
    const typeFit=.55*ROLE_AFFINITIES[types[0]][idx]+
      .45*ROLE_AFFINITIES[types[1]][idx];
    return {name:role,score:Math.round(.8*shape+.2*typeFit)};
  }).sort((a,b)=>b.score-a.score||ROLE_NAMES.indexOf(a.name)-ROLE_NAMES.indexOf(b.name));
  return {primary:scores[0].name,
    secondary:scores[1].score>=scores[0].score-5?scores[1].name:null};
}
function roleMetrics(baseStats){
  const bulk=[baseStats.hp,baseStats.def,baseStats.spd],top2=[...bulk].sort((a,b)=>b-a).slice(0,2);
  const offense=Math.max(baseStats.atk,baseStats.spa);
  return {topTwoBulk:mean(top2),bulkMean:mean(bulk),offense,gap:mean(top2)-offense,
    twoOver100:bulk.filter(x=>x>100).length>=2};
}
const pairings=[];
for(let i=0;i<1200;i++){
  const cognitive=i%2===0?{mbtiScores:nums(5)}:{functionScores:nums(8)};
  const build=generateCompleteBuild({...cognitive,bigFive:nums(5),enneagramScores:nums(9)});
  const original=previousRole(build);
  const reclassified=classifyRole(build.baseStats,toolkit(build));
  assert.deepEqual(build.role,reclassified,'production and independent classification diverged');
  pairings.push({before:original,after:{
    primary:build.role.primary.name,secondary:build.role.secondary?.name||null},
    metrics:roleMetrics(build.baseStats)});
}
function summarize(field){
  const roles=pairings.map(row=>({...row[field],metrics:row.metrics}));
  const summaries=Object.fromEntries(['Wall','Tank'].map(key=>{
    const selected=roles.filter(row=>row.primary===key);
    return [key,{n:selected.length,
      topTwoBulk:round(mean(selected.map(row=>row.metrics.topTwoBulk))),
      bulkMean:round(mean(selected.map(row=>row.metrics.bulkMean))),
      offense:round(mean(selected.map(row=>row.metrics.offense))),
      defensivePriority:round(mean(selected.map(row=>row.metrics.gap))),
      twoDefensiveStatsAbove100:selected.filter(row=>row.metrics.twoOver100).length}];
  }));
  return {roles:roleCounts(roles),
    hybrids:roles.filter(row=>row.secondary).length,defensive:summaries};
}
const changes={};for(const row of pairings){
  if(row.before.primary===row.after.primary)continue;
  const key=row.before.primary+' → '+row.after.primary;
  changes[key]=(changes[key]||0)+1;
}
const out={
  seed:260612,n:pairings.length,
  before:summarize('before'),after:summarize('after'),
  changedPrimary:pairings.filter(row=>row.before.primary!==row.after.primary).length,
  changedSecondary:pairings.filter(row=>row.before.secondary!==row.after.secondary).length,
  transitions:Object.entries(changes).sort((a,b)=>b[1]-a[1]).slice(0,18),
  caveat:'Synthetic independent scores; not a population prevalence estimate.'
};
assert.equal(Object.values(out.before.roles).reduce((a,b)=>a+b,0),1200);
assert.equal(Object.values(out.after.roles).reduce((a,b)=>a+b,0),1200);
assert.ok(Object.values(out.after.roles).every(n=>n>0),'some roles are unreachable');
console.log('ROLE_COMPARE_JSON='+JSON.stringify(out));
