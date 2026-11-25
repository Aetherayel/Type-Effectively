import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BASE_STAT_WEIGHTS, ENNEAGRAM_AFFINITIES, STAT_KEYS, STAT_MEANINGS } from '../src/data.mjs';
import { oceanAffinity, mbtiAffinity, enneagramAffinity, normalizeStats, generateBuild } from '../src/engine.mjs';
import { semanticBigFiveAffinities, semanticPercentageAffinities } from '../src/stat-model.mjs';
import { NATURE_DIMENSIONS } from '../src/nature.mjs';

const sum=xs=>xs.reduce((a,b)=>a+b,0);
const corr=(rows,i,j)=>{
  const mi=rows.reduce((s,row)=>s+row[i],0)/rows.length;
  const mj=rows.reduce((s,row)=>s+row[j],0)/rows.length;
  const cov=rows.reduce((s,row)=>s+(row[i]-mi)*(row[j]-mj),0);
  const vi=rows.reduce((s,row)=>s+(row[i]-mi)**2,0);
  const vj=rows.reduce((s,row)=>s+(row[j]-mj)**2,0);
  return cov/Math.sqrt(vi*vj);
};

test('shared semantic meanings cannot drift between base stats and Nature',()=>{
  assert.deepEqual(Object.keys(STAT_MEANINGS),STAT_KEYS);
  assert.deepEqual(Object.values(STAT_MEANINGS).map(x=>x.label),
    ['Resilience','Assertion','Fortitude','Ingenuity','Composure','Responsiveness']);
  for(const key of STAT_KEYS.filter(k=>k!=='hp'))
    assert.equal(NATURE_DIMENSIONS[key],STAT_MEANINGS[key].priority);
});

test('calibration retains six valid stat prototypes and distinguishes signals',()=>{
  assert.deepEqual(Object.keys(BASE_STAT_WEIGHTS),['functions','percentages','typeOnly']);
  for(const [mode,weights] of Object.entries(BASE_STAT_WEIGHTS)){
    assert.deepEqual(Object.keys(weights),STAT_KEYS,mode+' omits a stat');
    for(const [key,row] of Object.entries(weights)){
      assert.deepEqual(Object.keys(row),['bigFive','enneagram','cognition']);
      assert.ok(Math.abs(sum(Object.values(row))-1)<1e-10,mode+'/'+key+' weights do not sum to 1');
      assert.ok(Object.values(row).every(x=>x>=0&&x<=1));
    }
  }
  assert.equal(BASE_STAT_WEIGHTS.functions.spa.cognition,.4);
  assert.equal(BASE_STAT_WEIGHTS.functions.def.enneagram,.45);
  assert.ok(BASE_STAT_WEIGHTS.functions.spa.cognition>
    BASE_STAT_WEIGHTS.percentages.spa.cognition);
  assert.ok(BASE_STAT_WEIGHTS.percentages.spa.cognition>
    BASE_STAT_WEIGHTS.typeOnly.spa.cognition);
  assert.equal(Object.keys(ENNEAGRAM_AFFINITIES).length,9);
  for(const row of Object.values(ENNEAGRAM_AFFINITIES)){
    assert.equal(row.length,6);
    assert.ok(row.every(v=>v>=0&&v<=100));
  }
  const baseline=[50,50,50,50,50];
  assert.equal(oceanAffinity(baseline).length,6);
  // Stress sensitivity may affect vigilance, but no longer awards Speed.
  assert.equal(oceanAffinity([50,50,50,50,0])[5],oceanAffinity([50,50,50,50,100])[5]);
  // Follow-through permits a quiet, deliberate person to show high assertion.
  assert.ok(oceanAffinity([50,100,10,20,50])[1]>oceanAffinity([50,10,70,20,50])[1]);
  // Emotional stability influences composure more than low antagonism / niceness.
  const stability=oceanAffinity([50,50,50,50,0])[4]-oceanAffinity([50,50,50,50,100])[4];
  const agreeableness=oceanAffinity([50,50,50,100,50])[4]-oceanAffinity([50,50,50,0,50])[4];
  assert.ok(stability>2*agreeableness);
});

test('A/T cannot leak into cognition-based capacity; normalization preserves 600',()=>{
  const input=[75,90,20,20,0];
  assert.deepEqual(mbtiAffinity(input),mbtiAffinity([...input.slice(0,4),100]));
  assert.ok(mbtiAffinity(input).every(n=>n>=0&&n<=100));
  const o=oceanAffinity([93,70,18,37,25]);
  const e=enneagramAffinity([65,65,65,65,100,65,65,65,65]);
  const m=mbtiAffinity(input);
  const blended=STAT_KEYS.map((key,i)=>{
    const w=BASE_STAT_WEIGHTS.percentages[key];
    return w.bigFive*o[i]+w.enneagram*e[i]+w.cognition*m[i];
  });
  const stats=normalizeStats(blended);
  assert.equal(sum(Object.values(stats)),600);
  assert.ok(Object.values(stats).every(n=>n>=50&&n<=157));
});

test('seeded defensive correlations are not near-duplicates; each stat can lead',()=>{
  let seed=1002003;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const rows=[],tops=Array(6).fill(0);
  for(let i=0;i<2500;i++){
    const bigFive=Array.from({length:5},()=>Math.floor(random()*101));
    const ennea=Array.from({length:9},()=>Math.floor(random()*101));
    const mbti=Array.from({length:5},()=>Math.floor(random()*101));
    const o=oceanAffinity(bigFive),e=enneagramAffinity(ennea),m=mbtiAffinity(mbti);
    const stats=normalizeStats(STAT_KEYS.map((key,k)=>{
      const w=BASE_STAT_WEIGHTS.percentages[key];
      return w.bigFive*o[k]+w.enneagram*e[k]+w.cognition*m[k];
    }));
    const row=STAT_KEYS.map(k=>stats[k]);
    rows.push(row);tops[row.indexOf(Math.max(...row))]++;
  }
  assert.ok(corr(rows,0,4)<.75,'HP and SpD duplicate each other');
  assert.ok(corr(rows,0,2)<.85,'HP and Def duplicate each other');
  assert.ok(corr(rows,2,4)<.70,'Def and SpD duplicate each other');
  assert.ok(tops.every(n=>n>75),'one stat systematically cannot lead: '+tops.join(','));
});

test('build uses audited source blend and propagates it through the results',()=>{
  const input={mbtiScores:[76,93,14,21,36],enneagramScores:[96,48,62,84,95,52,31,70,40],bigFive:[91,87,20,44,26]};
  const build=generateBuild(input);
  const o=semanticBigFiveAffinities(input.bigFive,null).affinities,e=enneagramAffinity(input.enneagramScores),m=semanticPercentageAffinities(input.mbtiScores);
  assert.equal(build.statWeightMode,'percentages');
  assert.deepEqual(build.statWeights,BASE_STAT_WEIGHTS.percentages);
  for(let i=0;i<STAT_KEYS.length;i++){
    const w=BASE_STAT_WEIGHTS.percentages[STAT_KEYS[i]];
    assert.equal(build.affinities[STAT_KEYS[i]],
      Math.round(w.bigFive*o[i]+w.enneagram*e[i]+w.cognition*m[i]));
  }
  assert.equal(sum(Object.values(build.baseStats)),600);
  assert.equal(build.effectiveStats.hp,build.baseStats.hp);
  assert.ok(build.report&&build.archetype&&build.moves.length===4);
});

test('user-facing score explanations match the weights',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(app,/Each stat blends Big Five/);
  assert.match(app,/build\.statWeights\[key\]/);
  assert.match(index,/10% to 50%/);
  assert.match(index,/four-letter-only/);
});
