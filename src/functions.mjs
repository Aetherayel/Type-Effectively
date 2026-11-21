// Cognitive-function scores are alternative inputs, not validated measurements or MBTI results.
// Each value must be from the same scoring scale. Contrasts preserve the source's
// absolute differences: we do not stretch narrow gaps into strong preferences.
export const FUNCTION_KEYS = Object.freeze(['Ne','Ni','Se','Si','Te','Ti','Fe','Fi']);

export function deriveFunctionPreferences(scores) {
  if(!Array.isArray(scores) || scores.length!==FUNCTION_KEYS.length ||
     scores.some(value=>typeof value!=='number' || !Number.isFinite(value))) {
    throw new Error('Enter all eight numeric cognitive-function scores (Ne, Ni, Se, Si, Te, Ti, Fe, Fi).');
  }
  const [ne,ni,se,si,te,ti,fe,fi]=scores;
  const avg=(...xs)=>xs.reduce((total,n)=>total+n,0)/xs.length;
  const pole=(positive,negative)=>Math.max(0,Math.min(100,50+(positive-negative)/2));
  // [I, N, F, P, T] matches the existing five-axis engine input.
  // P/J compares outward perceiving with outward judging; this is a
  // project-specific contrast, not a reproduction of Sakinorva's type formulas.
  // Turbulence/assertiveness has no cognitive-function counterpart: neutral 50.
  return [
    pole(avg(ni,si,ti,fi),avg(ne,se,te,fe)),
    pole(avg(ne,ni),avg(se,si)),
    pole(avg(fe,fi),avg(te,ti)),
    pole(avg(ne,se),avg(te,fe)),
    50
  ];
}
