import { HELD_ITEMS, ITEM_FAMILIES } from './held-items-data.mjs';

const TRAIT_LABELS = ['Openness','Conscientiousness','Extraversion','Agreeableness','Emotional sensitivity'];
const average = values => values.reduce((sum,value)=>sum+value,0)/values.length;
const traitFit = (scores,target) => 100-average(scores.map((score,i)=>Math.abs(score-target[i])));
const hash = value => {
  // FNV-1a; browser-independent deterministic tie-breaker, not true randomness.
  let out=2166136261;
  for(let i=0;i<value.length;i++)out=Math.imul(out^value.charCodeAt(i),16777619);
  return out>>>0;
};

export function chooseHeldItem({
  tritype,core,second,third,wing,enneagramScores,bigFive,mbtiScores,
  role,hasBigFive=true
}) {
  if(!Array.isArray(enneagramScores)||enneagramScores.length!==9 ||
      !Array.isArray(bigFive)||bigFive.length!==5 ||
      !Array.isArray(mbtiScores)||mbtiScores.length!==5 ||
      !Number.isInteger(core)||core<1||core>9 || !role?.primary?.name) {
    throw new Error('Held item selection requires a complete personality build.');
  }
  const familyScores=Object.fromEntries(Object.entries(ITEM_FAMILIES).map(([key,family])=>{
    const ennea=family.ennea;
    const weighted=enneagramScores.reduce((sum,value,i)=>sum+value*ennea[i],0) /
      Math.max(1,enneagramScores.reduce((sum,value)=>sum+value,0));
    const coreSignal=.54*ennea[core-1]+.23*ennea[second-1]+.13*ennea[third-1]+.10*weighted;
    const traits=traitFit(bigFive,family.target);
    return [key,.68*coreSignal+.32*traits];
  }));
  const seed=[tritype,wing,...mbtiScores,...enneagramScores,...bigFive,role.primary.name].join('|');
  const sorted=HELD_ITEMS.map(item=>{
    const familyScore=familyScores[item.family];
    const traits=traitFit(bigFive,item.targets);
    const roleScore=item.roles.includes(role.primary.name) ? 100 :
      role.secondary && item.roles.includes(role.secondary.name) ? 75 : 35;
    const tie=(hash(seed+'|'+item.name)/4294967295-.5)*8;
    return {item,score:.47*familyScore+.38*traits+.15*roleScore+tie};
  }).sort((a,b)=>b.score-a.score || a.item.name.localeCompare(b.item.name));
  const selected=sorted[0].item;
  const family=ITEM_FAMILIES[selected.family];
  const signal=bigFive.map((value,i)=>({i,value,distance:Math.abs(value-50)}))
    .sort((a,b)=>b.distance-a.distance||a.i-b.i)[0];
  const traitPhrase=hasBigFive && signal.distance>=13
    ? (signal.value>50?'higher ':'lower ')+TRAIT_LABELS[signal.i]
    : null;
  const explanation='Your Type '+core+' core'+
    (traitPhrase?', '+traitPhrase:'')+
    ', and '+role.primary.name+' role point toward '+family.insight+'.';

  return {
    name:selected.name,
    family:selected.family,
    familyLabel:family.label,
    effect:selected.effect,
    quip:selected.quip,
    why:explanation
  };
}
