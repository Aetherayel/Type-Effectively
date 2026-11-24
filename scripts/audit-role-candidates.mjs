// Role geometry comparison on the same deterministic synthetic profiles.
// Evaluation only; no changes to production roles made by this script.
// All metrics are stress-test results, not estimated personality prevalence.
import { generateBuild } from '../src/engine.mjs';
import { STAT_KEYS, ROLE_NAMES, ROLE_TEMPLATES, ROLE_AFFINITIES } from '../src/data.mjs';
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const statMean=535/6;
const round=(v,p=1)=>Number(v.toFixed(p));
let seed=260612;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const nums=n=>Array.from({length:n},()=>Math.floor(random()*101));
const scenarios={
  currentEffective:{nature:true,templates:ROLE_TEMPLATES,axis:false},
  originalBase:{nature:false,templates:ROLE_TEMPLATES,axis:false},
  adjustedBase:{nature:false,templates:{...ROLE_TEMPLATES,
    Wall:[108,72,104,73,110,68],Tank:[101,108,93,90,87,56]},axis:false},
  adjustedWithAxes:{nature:false,templates:{...ROLE_TEMPLATES,
    Wall:[108,72,104,73,110,68],Tank:[101,108,93,90,87,56]},axis:true},
  originalWithAxes:{nature:false,templates:ROLE_TEMPLATES,axis:true},
  moderateWall:{nature:false,templates:{...ROLE_TEMPLATES,
    Wall:[110,70,110,65,112,68],Tank:[101,108,93,90,87,56]},axis:true}
};
function calculate(build,scenario){
  const stats=scenario.nature?build.effectiveStats:build.baseStats;
  const vals=STAT_KEYS.map(key=>stats[key]),total=vals.reduce((a,b)=>a+b,0);
  const normalized=vals.map(v=>v*535/total);
  const [hp,atk,def,spa,spd,spe]=normalized;
  const topTwo=[hp,def,spd].sort((a,b)=>b-a).slice(0,2);
  const topBulk=mean(topTwo),bulkMean=(hp+def+spd)/3,offense=Math.max(atk,spa);
  const gap=topBulk-offense;
  const familyAdjustment={
    Wall:clamp(.3*(topBulk-100)+.32*(gap-15),-7,7),
    Tank:clamp(.4*(offense-100)+.25*(topBulk-100)-Math.max(0,2*(90-bulkMean)),-7,6)
  };
  const types=build.types.length===1?[build.types[0],build.types[0]]:build.types;
  const ranked=ROLE_NAMES.map((role,idx)=>{
    const target=scenario.templates[role].map(v=>statMean+.75*(v-statMean));
    const options=[target];
    if(role==='Sweeper'||role==='Tank')
      options.push([target[0],target[3],target[2],target[1],target[4],target[5]]);
    const rms=Math.min(...options.map(t=>Math.sqrt(mean(normalized.map((v,i)=>(v-t[i])**2)))));
    const statFit=100*Math.exp(-rms*rms/(2*25*25));
    const toolkit=.55*ROLE_AFFINITIES[types[0]][idx]+.45*ROLE_AFFINITIES[types[1]][idx];
    const bonus=scenario.axis?(familyAdjustment[role]||0):0;
    return {name:role,score:Math.round(.8*statFit+.2*toolkit+bonus)};
  }).sort((a,b)=>b.score-a.score||ROLE_NAMES.indexOf(a.name)-ROLE_NAMES.indexOf(b.name));
  return {primary:ranked[0].name,secondary:ranked[1].score>=ranked[0].score-5?ranked[1].name:null,
    stats:normalized,offense,topBulk,bulkMean,gap,scores:ranked};
}
const profiles=[];
for(let i=0;i<1200;i++){
  const mbti=i%2===0?{mbtiScores:nums(5)}:{functionScores:nums(8)};
  const input={...mbti,bigFive:nums(5),enneagramScores:nums(9)};
  const build=generateBuild(input);
  profiles.push(build);
}
const observations=Object.fromEntries(Object.entries(scenarios).map(([key,scene])=>
  [key,profiles.map(build=>calculate(build,scene))]));
const summary={};
for(const [name,rows] of Object.entries(observations)){
  const roles=Object.fromEntries(ROLE_NAMES.map(key=>[key,rows.filter(r=>r.primary===key).length]));
  const wall=rows.filter(r=>r.primary==='Wall'),tank=rows.filter(r=>r.primary==='Tank');
  const metrics=items=>({
    n:items.length,meanTop2Bulk:round(mean(items.map(r=>r.topBulk))),
    meanBulk:round(mean(items.map(r=>r.bulkMean))),meanOffense:round(mean(items.map(r=>r.offense))),
    meanGap:round(mean(items.map(r=>r.gap))),
    twoBulkAbove100:items.filter(r=>[r.stats[0],r.stats[2],r.stats[4]].filter(v=>v>100).length>=2).length
  });
  const comparing=observations.currentEffective;
  summary[name]={count:rows.length,roles,wall:metrics(wall),tank:metrics(tank),
    changedFromCurrent:rows.filter((r,i)=>r.primary!==comparing[i].primary).length,
    hybrid:rows.filter(r=>r.secondary).length};
}
const transitions={};for(const name of ['originalBase','adjustedBase','adjustedWithAxes','moderateWall']){
  const table={};
  observations.currentEffective.forEach((prior,i)=>{
    const after=observations[name][i];
    if(prior.primary!==after.primary){
      const key=prior.primary+' → '+after.primary;
      table[key]=(table[key]||0)+1;
    }
  });
  transitions[name]=Object.entries(table).sort((a,b)=>b[1]-a[1]).slice(0,15);
}
console.log('ROLE_COMPARE_JSON='+JSON.stringify({seed:260612,summary,transitions}));
