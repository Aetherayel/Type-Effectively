// Paired before/after audit, not a representative population or a psychometric study.
// Usage: node scripts/audit-bst.mjs ../type-effectively-535
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateBuild as current } from '../src/engine.mjs';
if (!process.argv[2]) throw new Error('Pass a checkout of the 535-BST baseline.');
const {generateBuild:baseline}=await import(pathToFileURL(resolve(process.argv[2],'src/engine.mjs')));
const keys=['hp','atk','def','spa','spd','spe'];
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const round=x=>Number(x.toFixed(3));
let seed=20261124;
const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const vec=n=>Array.from({length:n},()=>Math.floor(rand()*101));
const fields=b=>({
  type:b.types.join(),nature:b.nature,role:b.role.primary.name,
  secondary:b.role.secondary?.name,spread:b.role.specialization,
  specialty:b.signatureStrategy?.id,ability:b.ability.name,hidden:b.hiddenAbility,
  item:b.heldItem.name,archetype:b.archetype.id,moves:b.moves.map(m=>m.name).join()
});
const counts=xs=>Object.fromEntries([...new Set(xs)].sort().map(x=>[x,xs.filter(y=>x===y).length]));
const summarize=rows=>({
  n:rows.length,
  oldMean:keys.map((_,i)=>round(mean(rows.map(r=>r.av[i])))),
  newMean:keys.map((_,i)=>round(mean(rows.map(r=>r.bv[i])))),
  rangeOld:[Math.min(...rows.flatMap(r=>r.av)),Math.max(...rows.flatMap(r=>r.av))],
  rangeNew:[Math.min(...rows.flatMap(r=>r.bv)),Math.max(...rows.flatMap(r=>r.bv))],
  meanSpreadOld:round(mean(rows.map(r=>Math.sqrt(mean(r.av.map(v=>(v-535/6)**2)))))),
  meanSpreadNew:round(mean(rows.map(r=>Math.sqrt(mean(r.bv.map(v=>(v-100)**2)))))),
  meanScaleError:round(mean(rows.flatMap(r=>r.errors))),
  maxScaleError:round(Math.max(...rows.flatMap(r=>r.errors))),
  changes:Object.fromEntries(Object.keys(rows[0].before).map(k=>[k,rows.filter(r=>r.before[k]!==r.after[k]).length])),
  oldRoles:counts(rows.map(r=>r.before.role)),newRoles:counts(rows.map(r=>r.after.role)),
  specialties:[rows.filter(r=>r.before.specialty).length,rows.filter(r=>r.after.specialty).length],
  changedRoleOldMaxMargin:Math.max(0,...rows.filter(r=>r.before.role!==r.after.role).map(r=>r.oldMargin)),
  rawChanged:rows.filter(r=>!r.rawEqual).length
});
const all=[],cohorts={};
for(const mode of ['percentages','functions','typeOnly','facets']){
  const rows=[];
  for(let i=0;i<500;i++){
    const input={enneagramScores:vec(9),bigFive:vec(5)};
    if(mode==='functions')input.functionScores=vec(8);
    else if(mode==='typeOnly')input.typeOverride=['INTJ','ENFP','ISTP','ESFJ'][i%4];
    else input.mbtiScores=vec(5);
    if(mode==='facets')input.bigFiveFacets=vec(30);
    const a=baseline(input),b=current(input);
    const av=keys.map(k=>a.baseStats[k]),bv=keys.map(k=>b.baseStats[k]);
    if(av.reduce((x,y)=>x+y,0)!==535||bv.reduce((x,y)=>x+y,0)!==600||
       bv.some(v=>!Number.isInteger(v)||v<50||v>157))
      throw new Error('Invalid allocation in '+mode);
    rows.push({av,bv,before:fields(a),after:fields(b),
      rawEqual:JSON.stringify(a.rawStatAffinities)===JSON.stringify(b.rawStatAffinities),
      oldMargin:a.role.all[0].score-a.role.all[1].score,
      errors:av.map((v,j)=>Math.abs(v*600/535-bv[j]))});
  }
  all.push(...rows);cohorts[mode]=summarize(rows);
  // Preserve the original audit's one extra profile draw between cohorts.
  vec(9);vec(5);vec(5);
}
console.log(JSON.stringify({seed:20261124,statOrder:keys,cohorts,total:summarize(all)},null,2));
