// Nature describes a preferred tradeoff, not competence or the strongest stat.
// This independent, deterministic classifier runs before Nature-adjusted stats,
// role classification, and specialty selection. All numbers are authored game
// affinities, not psychological probabilities or validated personality measures.
import { NATURE_EFFECTS, STAT_MEANINGS } from './data.mjs?v=nature-scoring-1';

export const NATURE_STATS=Object.freeze(['atk','def','spa','spd','spe']);
export const NATURE_DIMENSIONS=Object.freeze(Object.fromEntries(
  NATURE_STATS.map(key=>[key,STAT_MEANINGS[key].priority])
));

// Enneagram motivational priorities in NATURE_STATS order, not base-stat
// aptitudes. Each row has a distinct preferred emphasis and corresponding cost.
export const NATURE_MOTIVATIONS=Object.freeze({
  1:[46,94,75,83,27], // integrity, standards, controlled responsiveness
  2:[38,53,48,96,64], // care and attentiveness before confrontation
  3:[94,68,54,41,88], // achievement and momentum
  4:[41,32,91,63,64], // meaning and creative exploration
  5:[22,77,99,74,21], // comprehension and conserving energy
  6:[40,89,76,94,32], // verification, steadiness, and preparation
  7:[79,22,70,28,99], // options, improvisation, forward movement
  8:[99,72,38,34,77], // agency and direct resistance
  9:[22,64,45,96,36]  // harmony and continuity
});
const ENNEA_BASELINE=NATURE_STATS.map((_,k)=>
  Object.values(NATURE_MOTIVATIONS).reduce((sum,row)=>sum+row[k],0)/9);
const round1=value=>Math.round(value*10)/10;
const validScores=(xs,length)=>Array.isArray(xs)&&xs.length===length&&
  xs.every(value=>Number.isFinite(value)&&value>=0&&value<=100);

// Cognition: [I/E, N/S, F/T, P/J]. The last 16Personalities A/T axis is
// excluded: it is not a cognitive preference and would overlap Big Five N.
// These weights encode a *chosen approach*, not raw stat capacity.
function cognitivePriorities(mbtiScores,mbti) {
  const letters=['I','N','F','P'];
  const [i,n,f,p]=mbtiScores.slice(0,4).map((value,k)=>
    50+(mbti[k]===letters[k]?1:-1)*Math.abs(value-50));
  const e=100-i,s=100-n,t=100-f,j=100-p;
  return [
    .30*e+.55*t+.15*j,                      // decisive assertion
    .20*i+.15*s+.15*t+.50*j,                // protective structure
    .20*i+.55*n+.25*t,                      // reflective exploration
    .35*i+.30*j+.35*50,                  // considered response (weak proxy)
    .30*e+.25*s+.45*p                       // responsive flexibility
  ];
}

// Big Five calibrates preferred *style*, using different associations from
// the 70%-Big-Five base-stat model. It is deliberately a minority source.
function temperamentPriorities([o,c,e,a,n]) {
  const stability=100-n;
  return [
    .30*e+.30*(100-a)+.40*c,               // assertion / follow-through
    .55*c+.25*stability+.20*(100-e),       // protective fortitude
    .55*o+.25*(100-e)+.20*c,               // inventive exploration
    .65*stability+.15*a+.20*c,             // steady composure
    .40*e+.25*(100-c)+.35*o                // responsive adaptation
  ];
}

function motivationPriorities(scores,core,second,third) {
  const strengths=scores.map(value=>Math.max(0,value-20)**2+16);
  const sum=strengths.reduce((a,b)=>a+b,0);
  return NATURE_STATS.map((_,k)=> {
    const distributed=strengths.reduce((total,w,i)=>
      total+w*NATURE_MOTIVATIONS[i+1][k],0)/sum;
    // Center against the uniform nine-type baseline. Otherwise a category's
    // authored default scale could systematically win even with no evidence.
    return 50 + .55*NATURE_MOTIVATIONS[core][k]+
      .25*NATURE_MOTIVATIONS[second][k]+
      .10*NATURE_MOTIVATIONS[third][k]+
      .10*distributed-ENNEA_BASELINE[k];
  });
}

// Per-source candidate fit is 50 + (boost priority - sacrifice priority)/2.
// The total is a weighted average of those contrasts. There is no reference to
// base stats, typing, roles, abilities, or offensive strength.
export function classifyNature({
  enneagramScores,core,second,third,mbtiScores,mbti,bigFive=null,
  hasMeasuredCognition=true
}) {
  if(!validScores(enneagramScores,9)||!validScores(mbtiScores,5)||
    (bigFive!=null&&!validScores(bigFive,5))||
    ![core,second,third].every(n=>Number.isInteger(n)&&n>=1&&n<=9)||
    !/^[IE][NS][FT][PJ]$/.test(mbti))
    throw new Error('Nature selection requires valid personality inputs.');
  const motivation=motivationPriorities(enneagramScores,core,second,third);
  const cognition=cognitivePriorities(mbtiScores,mbti);
  const temperament=bigFive==null?null:temperamentPriorities(bigFive);
  const originalWeights={
    motivation:45,cognition:hasMeasuredCognition?30:15,
    temperament:temperament?25:0
  };
  const denominator=Object.values(originalWeights).reduce((a,b)=>a+b,0);
  const weights=Object.fromEntries(Object.entries(originalWeights).map(([key,value])=>
    [key,value/denominator]));
  const bySource={motivation,cognition,temperament};
  const priorities=Object.fromEntries(NATURE_STATS.map((key,i)=>[key,
    Object.entries(bySource).reduce((sum,[source,values])=>
      sum+(values?weights[source]*values[i]:0),0)]));
  const candidates=Object.entries(NATURE_EFFECTS).map(([name,[boost,drop]])=>{
    const boostIndex=NATURE_STATS.indexOf(boost),dropIndex=NATURE_STATS.indexOf(drop);
    if(boostIndex<0||dropIndex<0||boostIndex===dropIndex)
      throw new Error('Nature must boost and reduce distinct non-HP stats: '+name);
    const componentRaw=Object.fromEntries(Object.entries(bySource).filter(([,values])=>values)
      .map(([source,values])=>[source,
        50+(values[boostIndex]-values[dropIndex])/2]));
    // Rank on unrounded evidence; round only for human-readable reporting.
    const raw=Object.entries(componentRaw).reduce((sum,[source,score])=>
      sum+weights[source]*score,0);
    const components=Object.fromEntries(Object.entries(componentRaw)
      .map(([source,score])=>[source,round1(score)]));
    return {name,boost,drop,raw,score:round1(raw),components};
  }).sort((a,b)=>b.raw-a.raw || a.name.localeCompare(b.name));
  const winner=candidates[0];
  return {
    name:winner.name,boost:winner.boost,drop:winner.drop,
    score:winner.score,components:winner.components,
    weights:Object.fromEntries(Object.entries(weights)
      .filter(([,value])=>value>0).map(([key,value])=>[key,round1(value*100)])),
    priorities:Object.fromEntries(Object.entries(priorities)
      .map(([key,value])=>[key,round1(value)])),
    alternatives:candidates.slice(1,3).map(({name,score})=>({name,score})),
    cognitionEstimated:!hasMeasuredCognition,
    temperamentMeasured:!!temperament
  };
}
