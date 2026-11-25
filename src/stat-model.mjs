// V3 semantic base-stat affinities. Authored game heuristics, not psychometrics.
import { FACET_KEYS, FACET_GROUPS, resolveBigFiveEvidence } from './bigfive-facets.mjs';
export const COGNITIVE_REFERENCE=64; // provisional engineering pivot, not population average
export const TRAIT_GAIN=.5, SPREAD_GAIN=1.5;
const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const mix=(xs,ws)=>xs.reduce((s,x,i)=>s+x*ws[i],0);
export function amplifyDeviation(d) {
  // Linear continuation past +/-50 avoids unbounded cubic extrapolation.
  const a=Math.abs(d),t=Math.min(a,50);
  return Math.sign(d)*(t*(1+TRAIT_GAIN*(t/50)**2)+(a-t)*(1+3*TRAIT_GAIN));
}
export function alternativeSignal(a,b,reference,weightA=.5) {
  const gate=.75*clamp((Math.max(a,b)-reference-10)/30,0,1);
  const x=amplifyDeviation(a-reference),y=amplifyDeviation(b-reference);
  return (1-gate)*(weightA*x+(1-weightA)*y)+gate*Math.max(x,y);
}
export function semanticFunctionAffinities(scores,reference=COGNITIVE_REFERENCE) {
  if(!Array.isArray(scores)||scores.length!==8||scores.some(x=>!Number.isFinite(x))||!Number.isFinite(reference))
    throw new Error('Eight comparable finite function totals and a finite reference are required.');
  // Subtract the uniform-profile response BEFORE unequal source weights.
  const common=amplifyDeviation(mean(scores)-reference);
  const [ne,ni,se,si,te,ti,fe,fi]=scores.map(x=>amplifyDeviation(x-reference)-common);
  const intuit=alternativeSignal(scores[1],scores[0],reference)-common;
  const perception=alternativeSignal(scores[2],scores[0],reference)-common;
  const continuity=alternativeSignal(scores[3],scores[7],reference)-common;
  return [
    50+.50*mix([si,ni,te,fi],[.35,.30,.20,.15]),
    50+mix([te,se],[.65,.35]),
    50+.70*continuity+.20*ni+.10*ti,
    50+.74*intuit+.26*ti,
    50+.45*mix([ti,fi,si],[.40,.35,.25]),
    50+.75*perception+.15*te+.10*fe
  ];
}
const signal=x=>amplifyDeviation(x-50);
// Preserve domain fallback and remove unrelated absence-based proxies.
// Keep signed, amplified source affinities intact until final BST allocation.
export const SEMANTIC_FACET_COMPONENTS=Object.freeze({
  hp:[{d:'C',w:.65,keys:['C5','C4'],mix:[.65,.35]},{d:'N',w:.35,keys:['N6','N1'],mix:[.70,.30],reverse:true}],
  atk:[{d:'E',w:.55,keys:['E3','E4'],mix:[.80,.20]},{d:'C',w:.45,keys:['C1','C4'],mix:[.65,.35]}],
  def:[{d:'C',w:.70,keys:['C3','C6','C5'],mix:[.40,.35,.25]},{d:'N',w:.30,keys:['N6'],mix:[1],reverse:true}],
  spa:[{d:'O',w:.80,keys:['O5','O1','O2'],mix:[.65,.25,.10],alternative:true},{d:'C',w:.20,keys:['C5','C1'],mix:[.55,.45]}],
  spd:[{d:'N',w:.80,keys:['N6','N2','N1'],mix:[.50,.30,.20],reverse:true},{d:'C',w:.20,keys:['C6','C5'],mix:[.50,.50]}],
  spe:[{d:'E',w:.55,keys:['E4','E3','E5'],mix:[.70,.20,.10]},{d:'O',w:.45,keys:['O4','O1'],mix:[.75,.25],alternative:true}]
});
export function semanticBigFiveAffinities(domains,facets) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  const active=new Set(evidence.activeDomains);
  function calculate(useFacets) {
    return Object.values(SEMANTIC_FACET_COMPONENTS).map(parts=>50+parts.reduce((sum,p)=>{
      let v;
      if(useFacets&&active.has(p.d)) {
        const vals=p.keys.map(key=>evidence.facets[FACET_KEYS.indexOf(key)]).map(x=>p.reverse?100-x:x);
        if(p.alternative) {
          const mass=p.mix[0]+p.mix[1];
          v=mass*alternativeSignal(vals[0],vals[1],50,p.mix[0]/mass);
          for(let i=2;i<vals.length;i++)v+=p.mix[i]*signal(vals[i]);
        } else v=mix(vals.map(signal),p.mix);
      } else {
        const raw=domains[FACET_GROUPS.find(g=>g.code===p.d).domainIndex];
        v=signal(p.reverse?100-raw:raw);
      }
      return sum+p.w*v;
    },0));
  }
  const affinities=calculate(true),baseline=domains?calculate(false):null;
  return {affinities,activeDomains:evidence.activeDomains,corrections:affinities.map((x,i)=>baseline?x-baseline[i]:null)};
}
// Bipolar input still represents preference contrasts, not eight separate
// pathways. Preserve the existing mappings, with symmetric amplification.
export function semanticPercentageAffinities(scores) {
  const [i,n,f,p]=scores.slice(0,4).map(signal);
  return [50-.35*p+.20*i,50-.45*i-.35*f-.20*p,50-.45*p+.30*i-.25*f,
    50+.60*n-.25*f+.15*i,50+.35*i-.30*p,50-.45*i+.35*p-.20*n];
}
