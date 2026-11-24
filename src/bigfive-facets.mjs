// Optional IPIP-NEO 30-facet interpretation for the existing Big Five source.
// The five reported domain percentiles remain authoritative input anchors.
// Facet percentiles describe within-domain profile *shape*; do not average
// percentiles into new domain scores or count 30 extra independent variables.
// This is a deterministic, authored game scoring system, not a psychometric
// or capability measure.
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

// Every selection is a *refinement of an existing domain contribution*.
// A chosen facet percentile is compared with its supplied parent domain.
// The parent remains unchanged; applying a bounded contrast shifts only
// the specific stat for which that facet provides recognizable information.
// Positive and negative coefficients follow the parent domain's direction
// in the existing oceanAffinity equations; never add this as a fourth source.
// No O6 Liberalism or A2 Morality influence is added to these corrections.
export const FACET_REFINEMENTS=Object.freeze({
  hp:Object.freeze([
    {domain:'C',coefficient:.55,focus:{C5:.65,C4:.35}},
    {domain:'N',coefficient:-.35,focus:{N6:.70,N1:.30}}
  ]),
  atk:Object.freeze([
    {domain:'E',coefficient:.45,focus:{E3:.80,E4:.20}},
    {domain:'C',coefficient:.35,focus:{C1:.65,C4:.35}}
  ]),
  def:Object.freeze([
    {domain:'C',coefficient:.45,focus:{C3:.40,C6:.35,C5:.25}},
    {domain:'N',coefficient:-.25,focus:{N6:1}}
  ]),
  spa:Object.freeze([
    {domain:'O',coefficient:.60,focus:{O5:.65,O1:.25,O2:.10}}
  ]),
  spd:Object.freeze([
    {domain:'N',coefficient:-.65,focus:{N6:.50,N2:.30,N1:.20}}
  ]),
  spe:Object.freeze([
    {domain:'E',coefficient:.45,focus:{E4:.70,E3:.20,E5:.10}},
    {domain:'O',coefficient:.35,focus:{O4:.75,O1:.25}}
  ])
});
export const FACET_CONTRAST_CAP=30;
export const FACET_CONTRAST_GAIN=.85;

export function validateFacetScores(values) {
  if(values==null)return null;
  if(!Array.isArray(values)||values.length!==FACET_KEYS.length)
    throw new Error('Enter 30 IPIP-NEO facet percentiles in O, C, E, A, N order.');
  if(values.some(x=>x!==null&&(!Number.isFinite(x)||x<0||x>100)))
    throw new Error('Facet percentiles must be numeric values between 0 and 100, or blank.');
  let count=0;
  for(let i=0;i<FACET_GROUPS.length;i++){
    const group=FACET_GROUPS[i],portion=values.slice(6*i,6*i+6);
    const completed=portion.filter(x=>x!==null).length;
    if(completed!==0&&completed!==6)
      throw new Error('Complete all six '+group.label+' facets, or leave that domain blank.');
    if(completed===6)count++;
  }
  if(!count)throw new Error('Enter at least one complete set of six IPIP-NEO facets.');
  return values;
}

export function refineBigFiveAffinities(domainScores,baseAffinities,facets) {
  const values=validateFacetScores(facets);
  if(!values)return {affinities:[...baseAffinities],activeDomains:[],corrections:[0,0,0,0,0,0]};
  if(!Array.isArray(domainScores)||domainScores.length!==5||
     domainScores.some(x=>!Number.isFinite(x)||x<0||x>100))
    throw new Error('Enter five Big Five domain percentiles alongside facets.');
  if(!Array.isArray(baseAffinities)||baseAffinities.length!==6||
     baseAffinities.some(x=>!Number.isFinite(x)))
    throw new Error('Enter the six existing Big Five stat affinities for refinement.');
  const activeDomains=FACET_GROUPS.filter((_,i)=>values[i*6]!==null).map(g=>g.code);
  const active=new Set(activeDomains);
  const corrections=Object.values(FACET_REFINEMENTS).map(rules=>{
    let shift=0;
    for(const rule of rules){
      if(!active.has(rule.domain))continue;
      const comparison=Object.entries(rule.focus).reduce((v,[facet,weight])=>
        v+values[INDEX[facet]]*weight,0);
      // Distances between *percentiles* are a game heuristic; cap them so a
      // facet contrast can refine, never wholly replace, its parent domain.
      const contrast=clamp(comparison-domainScores[DOMAIN[rule.domain]],
        -FACET_CONTRAST_CAP,FACET_CONTRAST_CAP);
      shift+=rule.coefficient*FACET_CONTRAST_GAIN*contrast;
    }
    return shift;
  });
  return {
    affinities:baseAffinities.map((v,i)=>clamp(v+corrections[i],0,100)),
    activeDomains,
    corrections
  };
}
