// Pure demo-input generator. It makes complete, valid, synthetic scores using
// the same schema as manually entered data; the real calculator stays untouched.
// Supplying a PRNG allows deterministic testing. No data is sent anywhere.

const CENTERS=[[8,9,1],[2,3,4],[5,6,7]];
const randInt=(random,min,max)=>Math.floor(random()*(max-min+1))+min;

export function generateRandomBuildInput(random=Math.random) {
  // Sample the 16 MBTI letter combinations and A/T dimension via bipolar inputs.
  const mbtiScores=Array.from({length:5},()=>{
    const preference=randInt(random,56,94);
    return random()<.5?preference:100-preference;
  });

  // Pick one digit from each Enneagram center, then shuffle their priority.
  // All remaining digits stay below the third fix; inferred tritype is valid.
  const chosen=CENTERS.map(center=>center[randInt(random,0,2)]);
  for(let i=chosen.length-1;i>0;i--){
    const j=randInt(random,0,i);
    [chosen[i],chosen[j]]=[chosen[j],chosen[i]];
  }
  const enneagramScores=Array.from({length:9},()=>randInt(random,12,62));
  const topBands=[[94,99],[82,88],[70,76]];
  chosen.forEach((digit,rank)=>{
    const [min,max]=topBands[rank];
    enneagramScores[digit-1]=randInt(random,min,max);
  });

  // Broad OCEAN coverage gives visible variety in the six-stat radar and roles.
  const bigFive=Array.from({length:5},()=>randInt(random,7,93));
  return {
    mbtiScores,
    typeOverride:'',
    enneagramScores,
    enneagramRanking:null,
    tritypeOverride:'',
    wingOverride:'',
    bigFive
  };
}
