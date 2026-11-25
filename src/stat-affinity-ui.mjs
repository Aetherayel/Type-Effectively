import { STAT_KEYS, STAT_MEANINGS, STAT_NAMES } from './data.mjs';

// These values describe the model's affinity *before* the 600-BST budget
// allocates relative strengths. Neither score is a respondent percentile.
// Keep this alternate view separate from the canonical export/EV/radar data.
const one=n=>Number(n).toFixed(1);

export function affinityViewData(build) {
  const values=STAT_KEYS.map(key=>build?.rawStatAffinities?.[key]);
  if(values.some(n=>!Number.isFinite(n)))
    throw new Error('Six unnormalized affinities must be finite.');
  const mean=values.reduce((sum,n)=>sum+n,0)/values.length;
  if(STAT_KEYS.some(key=>!Number.isFinite(build?.baseStats?.[key]) ||
      !Number.isFinite(build?.sourceStatAffinities?.[key]?.bigFive) ||
      !Number.isFinite(build?.sourceStatAffinities?.[key]?.enneagram) ||
      !Number.isFinite(build?.sourceStatAffinities?.[key]?.cognition)))
    throw new Error('Affinity comparison requires a complete scored build.');
  return {
    mean,
    rows:STAT_KEYS.map((key,i)=>({
      key,label:STAT_NAMES[i],meaning:STAT_MEANINGS[key].label,
      affinity:values[i],distance:values[i]-mean,
      baseStat:build.baseStats[key],
      sources:build.sourceStatAffinities[key],
      weights:build.statWeights[key]
    }))
  };
}
export function renderAffinityComparison(build) {
  const {mean,rows}=affinityViewData(build);
  const min=Math.min(0,...rows.map(row=>row.affinity));
  const max=Math.max(100,...rows.map(row=>row.affinity));
  const position=n=>100*((n-min)/(max-min));
  const zero=position(0);
  const bars=rows.map(row=>{
    const sign=row.distance>=0?'+':'−';
    const relative=sign+one(Math.abs(row.distance));
    return '<div class="affinity-row" data-affinity-stat="'+row.key+'">'+
      '<div class="affinity-row-heading"><div><strong>'+row.label+'</strong>'+
        '<span>'+row.meaning+'</span></div>'+
        '<strong class="affinity-number">'+one(row.affinity)+' <small>affinity</small></strong></div>'+
      '<div class="affinity-meter" role="img" aria-label="'+row.label+' modeled affinity '+one(row.affinity)+
        ', '+relative+' from this profile’s affinity mean">'+
        '<span class="affinity-meter-fill" style="left:'+one(Math.min(zero,position(row.affinity)))+'%;width:'+one(Math.abs(position(row.affinity)-zero))+'%"></span>'+
        '<span class="affinity-meter-mean" style="left:'+one(position(mean))+'%" aria-hidden="true"></span></div>'+
      '<div class="affinity-row-foot"><span>'+relative+' versus your own affinity mean</span>'+
        '<span>Pokémon base stat: '+row.baseStat+'</span></div>'+
      '</div>';
  }).join('');
  const sourceRows=rows.map(row=>'<tr><th scope="row">'+row.label+'</th>'+
    '<td>'+one(row.sources.bigFive)+' <small>('+Math.round(row.weights.bigFive*100)+'%)</small></td>'+
    '<td>'+one(row.sources.enneagram)+' <small>('+Math.round(row.weights.enneagram*100)+'%)</small></td>'+
    '<td>'+one(row.sources.cognition)+' <small>('+Math.round(row.weights.cognition*100)+'%)</small></td>'+
    '</tr>').join('');
  return '<section class="affinity-panel" id="stat-view-affinity-panel" hidden aria-label="Unnormalized personality affinities">'+
    '<p class="affinity-intro">These are <strong>modeled personality affinities before stat normalization</strong>, '+
    'not Pokémon base stats, test percentiles, or estimates of ability.</p>'+
    '<p class="affinity-mean-note">Your six-affinity mean: <strong>'+one(mean)+'</strong> '+
      '<span>· markers show this mean; shared axis '+one(min)+' to '+one(max)+'</span></p>'+
    '<div class="affinity-bars">'+bars+'</div>'+
    '<p class="affinity-method">The game converts each affinity’s difference from your own average '+
      'into a share of the same <strong>fixed 600 BST</strong>. This is why a high affinity '+
      'can still produce a below-average Pokémon stat. Affinities can fall below 0 or above 100. This is an authored game score, '+
      'not a population ranking; 50 is a neutral model reference.</p>'+
    '<details class="affinity-source-detail"><summary>Show Big Five, Enneagram and cognition contributions</summary>'+
      '<div class="affinity-table-wrap"><table class="affinity-source-table">'+
        '<thead><tr><th scope="col">Stat</th><th scope="col">Big Five</th>'+
        '<th scope="col">Enneagram</th><th scope="col">Cognition</th></tr></thead>'+
        '<tbody>'+sourceRows+'</tbody></table></div>'+
      '<p>Each cell shows the source affinity and its weight for that stat. '+
      'The weighted blend gives the unnormalized affinity above. Any entered Big Five facets '+
      'are already included in the Big Five value.</p></details>'+
    '</section>';
}
