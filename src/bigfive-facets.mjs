// IPIP-NEO facet-first scoring. A complete six-facet group replaces its
// parent Big Five domain wherever that domain informs a derived outcome.
// Missing groups fall back to *reported* domains; no facet is counted twice.
// Percentile arithmetic below is an authored game heuristic, not psychometrics.
export const FACET_GROUPS=Object.freeze([
  Object.freeze({code:'O',label:'Openness',domainIndex:0,facets:Object.freeze([
    'Imagination','Artistic Interests','Emotionality','Adventurousness','Intellect','Liberalism'
  ])}),
  Object.freeze({code:'C',label:'Conscientiousness',domainIndex:1,facets:Object.freeze([
    'Self-Efficacy','Orderliness','Dutifulness','Achievement-Striving','Self-Discipline','Cautiousness'
  ])}),
  Object.freeze({code:'E',label:'Extraversion',domainIndex:2,facets:Object.freeze([
    'Friendliness','Gregariousness','Assertiveness','Activity Level','Excitement-Seeking','Cheerfulness'
  ])}),
  Object.freeze({code:'A',label:'Agreeableness',domainIndex:3,facets:Object.freeze([
    'Trust','Morality','Altruism','Cooperation','Modesty','Sympathy'
  ])}),
  Object.freeze({code:'N',label:'Neuroticism',domainIndex:4,facets:Object.freeze([
    'Anxiety','Anger','Depression','Self-Consciousness','Immoderation','Vulnerability'
  ])})
]);
export const FACET_KEYS=Object.freeze(FACET_GROUPS.flatMap(group=>
  group.facets.map((_,i)=>group.code+(i+1))
));
const INDEX=Object.freeze(Object.fromEntries(FACET_KEYS.map((key,i)=>[key,i])));
const DOMAIN=Object.freeze(Object.fromEntries(FACET_GROUPS.map(g=>[g.code,g.domainIndex])));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const validDomains=xs=>Array.isArray(xs)&&xs.length===5&&
  xs.every(n=>Number.isFinite(n)&&n>=0&&n<=100);

// Core game-stat mappings preserve original *domain coefficient budgets*.
// The six facet scores are NOT averaged into a substitute IPIP domain
// percentile. Instead, each stat selects the facets relevant to its meaning.
// Notably, O5 Intellect and O1 Imagination determine most of the SpA O-signal;
// overall Openness does not cap, shrink, or overrule them when O facets exist.
// 'reverse' retains original low-E/low-N or low-A associations.
export const FACET_STAT_COMPONENTS=Object.freeze({
  hp:[
    {domain:'C',coefficient:.55,focus:{C5:.65,C4:.35}},
    {domain:'N',coefficient:.35,reverse:true,focus:{N6:.70,N1:.30}},
    {domain:'A',coefficient:.10,focus:{A3:.55,A6:.45}}
  ],
  atk:[
    {domain:'E',coefficient:.45,focus:{E3:.80,E4:.20}},
    {domain:'A',coefficient:.20,reverse:true,focus:{A4:.60,A5:.40}},
    {domain:'C',coefficient:.35,focus:{C1:.65,C4:.35}}
  ],
  def:[
    {domain:'C',coefficient:.45,focus:{C3:.40,C6:.35,C5:.25}},
    {domain:'E',coefficient:.30,reverse:true,focus:{E5:.55,E4:.45}},
    {domain:'N',coefficient:.25,reverse:true,focus:{N6:1}}
  ],
  spa:[
    {domain:'O',coefficient:.60,focus:{O5:.65,O1:.25,O2:.10}},
    {domain:'C',coefficient:.20,focus:{C5:.55,C1:.45}},
    {domain:'E',coefficient:.20,reverse:true,focus:{E2:.70,E5:.30}}
  ],
  spd:[
    {domain:'N',coefficient:.65,reverse:true,focus:{N6:.50,N2:.30,N1:.20}},
    {domain:'A',coefficient:.20,focus:{A4:.50,A1:.50}},
    {domain:'C',coefficient:.15,focus:{C6:.50,C5:.50}}
  ],
  spe:[
    {domain:'E',coefficient:.45,focus:{E4:.70,E3:.20,E5:.10}},
    {domain:'O',coefficient:.35,focus:{O4:.75,O1:.25}},
    {domain:'C',coefficient:.20,reverse:true,focus:{C2:.60,C6:.40}}
  ]
});
export const FACET_REFINEMENTS=FACET_STAT_COMPONENTS; // Retained API identifier
export const FACET_CONTRAST_CAP=30;

// Context proxies are used only by older whole-build systems that still
// require an O/C/E/A/N-shaped temperament signal (specialist scoring, summary,
// generic item rationale). These are symbolic aggregates, NOT derived domain
// percentiles. All primary stat, Nature, archetype and held-item fits use
// specific facet selections instead; O6, A2 and N3 are omitted deliberately.
export const FACET_CONTEXT_FOCI=Object.freeze({
  O:{O5:.40,O1:.25,O4:.25,O2:.10},
  C:{C5:.30,C6:.20,C1:.20,C3:.20,C2:.10},
  E:{E3:.25,E4:.25,E1:.20,E2:.10,E5:.10,E6:.10},
  A:{A3:.30,A4:.30,A6:.20,A1:.20},
  N:{N6:.35,N1:.30,N2:.15,N4:.10,N5:.10}
});

export function validateFacetScores(values) {
  if(values==null)return null;
  if(!Array.isArray(values)||values.length!==30)
    throw new Error('Enter 30 IPIP-NEO facet percentiles in O, C, E, A, N order.');
  if(values.some(x=>x!==null&&(!Number.isFinite(x)||x<0||x>100)))
    throw new Error('Facet percentiles must be numeric values between 0 and 100, or blank.');
  let groups=0;
  for(let i=0;i<5;i++){
    const count=values.slice(i*6,i*6+6).filter(x=>x!==null).length;
    if(count!==0&&count!==6)
      throw new Error('Complete all six '+FACET_GROUPS[i].label+' facets, or leave that domain blank.');
    if(count===6)groups++;
  }
  if(!groups)throw new Error('Enter at least one complete set of six IPIP-NEO facets.');
  return values;
}
export function hasCompleteBigFiveEvidence(domains,facets) {
  if(domains!=null){
    if(!validDomains(domains))throw new Error('Big Five requires five valid domain scores from 0–100.');
    if(facets!=null)validateFacetScores(facets);
    return true;
  }
  const values=validateFacetScores(facets);
  return !!values&&values.every(n=>n!==null);
}
export function resolveBigFiveEvidence(domains,facets) {
  const values=validateFacetScores(facets);
  if(domains!=null&&!validDomains(domains))
    throw new Error('Big Five domains must contain five numbers from 0–100.');
  if(domains==null && (!values||values.some(v=>v===null)))
    throw new Error('Supply all 30 IPIP-NEO facets, or all five broad Big Five domains for missing facet groups.');
  if(domains==null&&!values)
    throw new Error('Supply five Big Five domains or all 30 IPIP-NEO facets.');
  const activeDomains=FACET_GROUPS.filter((_,i)=>values?.[i*6]!=null).map(g=>g.code);
  const active=new Set(activeDomains);
  const facetValue=(domain,focus)=>{
    const chosen=focus||FACET_CONTEXT_FOCI[domain];
    const entries=Object.entries(chosen);
    const total=entries.reduce((sum,[key,weight])=>{
      if(key[0]!==domain||!Number.isFinite(weight)||weight<=0)
        throw new Error('Invalid facet focus for domain '+domain+': '+key);
      return sum+weight;
    },0);
    return entries.reduce((sum,[key,w])=>sum+w*values[INDEX[key]],0)/total;
  };
  const forDomain=(domain,focus)=>{
    if(active.has(domain))return facetValue(domain,focus);
    return domains[DOMAIN[domain]];
  };
  // Context score: a *game signal* for legacy summary/package mechanics, not
  // an IPIP-NEO domain percentile, and never a second independent source.
  const context=FACET_GROUPS.map(g=>forDomain(g.code));
  return {facets:values,activeDomains,forDomain,context,reportedDomains:domains??null};
}

// Outcome-specific Big Five affinity. For each coefficient, a complete
// facet group replaces the corresponding broad-domain contribution fully.
export function refineBigFiveAffinities(domains,baseAffinities,facets) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  if(!Array.isArray(baseAffinities)||baseAffinities.length!==6||
     baseAffinities.some(n=>!Number.isFinite(n)))
    throw new Error('Six reference Big Five affinities are required.');
  const keys=['hp','atk','def','spa','spd','spe'];
  const affinities=keys.map(key=>clamp(FACET_STAT_COMPONENTS[key].reduce((sum,part)=>{
    let value=evidence.forDomain(part.domain,part.focus);
    if(part.reverse)value=100-value;
    return sum+part.coefficient*value;
  },0),0,100));
  const corrections=affinities.map((v,i)=>domains?v-baseAffinities[i]:null);
  return {affinities,activeDomains:evidence.activeDomains,corrections};
}

// Nature uses its *own* meaning-specific Big Five facet lens, not stat
// strengths. The coefficients mirror the old Nature temperament prototype.
export const FACET_NATURE_COMPONENTS=Object.freeze({
  atk:[
    {domain:'E',coefficient:.30,focus:{E3:.75,E4:.25}},
    {domain:'A',coefficient:.30,reverse:true,focus:{A4:.65,A5:.35}},
    {domain:'C',coefficient:.40,focus:{C4:.55,C1:.45}}
  ],
  def:[
    {domain:'C',coefficient:.55,focus:{C3:.40,C6:.35,C5:.25}},
    {domain:'N',coefficient:.25,reverse:true,focus:{N6:.70,N1:.30}},
    {domain:'E',coefficient:.20,reverse:true,focus:{E5:.70,E4:.30}}
  ],
  spa:[
    {domain:'O',coefficient:.55,focus:{O5:.65,O1:.25,O2:.10}},
    {domain:'E',coefficient:.25,reverse:true,focus:{E2:.70,E5:.30}},
    {domain:'C',coefficient:.20,focus:{C5:.60,C1:.40}}
  ],
  spd:[
    {domain:'N',coefficient:.65,reverse:true,focus:{N6:.50,N2:.30,N1:.20}},
    {domain:'A',coefficient:.15,focus:{A4:.50,A6:.50}},
    {domain:'C',coefficient:.20,focus:{C6:.55,C5:.45}}
  ],
  spe:[
    {domain:'E',coefficient:.40,focus:{E4:.65,E3:.25,E5:.10}},
    {domain:'C',coefficient:.25,reverse:true,focus:{C2:.60,C6:.40}},
    {domain:'O',coefficient:.35,focus:{O4:.75,O1:.25}}
  ]
});
export function bigFiveNaturePriorities(domains,facets) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  return ['atk','def','spa','spd','spe'].map(key=>
    FACET_NATURE_COMPONENTS[key].reduce((sum,part)=>{
      let value=evidence.forDomain(part.domain,part.focus);
      return sum+part.coefficient*(part.reverse?100-value:value);
    },0));
}

// Meaning-specific facet fit used by archetype/held-item personality
// comparisons. Complete group: targeted facets. Missing group: reported
// domain. If no custom focus, a deliberate generic context focus is used.
export function facetProfileFit(domains,facets,target,focus={}) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  if(!Array.isArray(target)||target.length!==5||target.some(v=>!Number.isFinite(v)))
    throw new Error('Big Five profile fit requires five target values.');
  const meanSquared=FACET_GROUPS.reduce((sum,g,i)=>{
    const specific=Object.fromEntries(Object.entries(focus).filter(([key])=>key[0]===g.code));
    const observed=evidence.forDomain(g.code,Object.keys(specific).length?specific:undefined);
    // Empty focus falls back to the deliberate context focus for this group.
    return sum+(observed-target[i])**2;
  },0)/5;
  return clamp(100-Math.sqrt(meanSquared),0,100);
}

// Held items historically use mean *absolute* target distance, not RMS.
// Preserve that metric when domains only are available.
export function facetAbsoluteFit(domains,facets,target,focus={}) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  if(!Array.isArray(target)||target.length!==5||target.some(v=>!Number.isFinite(v)))
    throw new Error('Big Five item fit requires five target values.');
  const distance=FACET_GROUPS.reduce((sum,g,i)=>{
    const specific=Object.fromEntries(Object.entries(focus).filter(([key])=>key[0]===g.code));
    return sum+Math.abs(evidence.forDomain(g.code,
      Object.keys(specific).length?specific:undefined)-target[i]);
  },0)/5;
  return clamp(100-distance,0,100);
}

// Describe standout self-reported facets against a neutral model reference;
// avoid claiming measured 'domain deviations' when domains were not supplied.
export function facetContrastMap(domains,facets) {
  const evidence=resolveBigFiveEvidence(domains,facets);
  if(!evidence.facets)return Object.freeze({});
  return Object.freeze(Object.fromEntries(FACET_KEYS.flatMap((key,i)=>
    evidence.facets[i]===null?[]:[[key,clamp(evidence.facets[i]-50,-30,30)]]
  )));
}
