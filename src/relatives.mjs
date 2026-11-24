import { STAT_KEYS } from './data.mjs';

// Compact index format: [id, displayName, speciesId, types[], sixStats[], abilitySlugs[]].
// Ability slugs beginning with ! are hidden abilities.
const typeSetKey = types => [...types].sort().join('/');
const abilitySlug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function unpackPokemon(record) {
  if (!Array.isArray(record) || record.length < 6) return null;
  const [id,name,speciesId,types,stats,abilities] = record;
  if (!Number.isInteger(id) || !Number.isInteger(speciesId) || typeof name !== 'string' ||
      !Array.isArray(types) || ![1,2].includes(types.length) ||
      !Array.isArray(stats) || stats.length !== 6 || stats.some(v => !Number.isFinite(v) || v <= 0) ||
      !Array.isArray(abilities)) return null;
  return {
    id,name,speciesId,types,stats,
    abilities:abilities.map(value => ({
      name:value.replace(/^!/,''),
      hidden:value.startsWith('!')
    }))
  };
}

export function statComparison(pokemon, build) {
  const target=STAT_KEYS.map(key=>build.baseStats[key]);
  const bst=pokemon.stats.reduce((a,b)=>a+b,0);
  const targetTotal=target.reduce((a,b)=>a+b,0);
  // Compare six-dimensional *shape* at the build's own total,
  // then use actual-BST difference as a mild, explicit tie-break penalty.
  const scaled=pokemon.stats.map(n=>n*targetTotal/bst);
  const spreadGap=Math.sqrt(target.reduce((sum,n,i)=>sum+(n-scaled[i])**2,0)/6);
  const bstGap=Math.abs(bst-targetTotal);
  return {
    bst,bstGap,
    spreadGap:Number(spreadGap.toFixed(1)),
    score:spreadGap+0.08*bstGap
  };
}

function diversify(entries,limit) {
  const selected=[],species=new Set();
  for(const p of entries){
    if(species.has(p.speciesId)) continue;
    selected.push(p);species.add(p.speciesId);
    if(selected.length>=limit) break;
  }
  return selected;
}
const compare=(a,b)=>a.match.score-b.match.score || a.id-b.id;

export function matchPokemon(build, records, limit=4) {
  if(!build || !Array.isArray(build.types) || !build.baseStats) throw new Error('A completed build is required.');
  if(!Array.isArray(records)) throw new Error('A Pokémon index is required.');
  const pokemon=records.map(unpackPokemon).filter(Boolean).map(p=>({...p,match:statComparison(p,build)}));
  if(!pokemon.length) return {typeTwins:[],typeKind:'none',statSiblings:[],standardAbility:[],hiddenAbility:[],sampleSize:0};
  const targetKey=typeSetKey(build.types);
  const exact=pokemon.filter(p=>typeSetKey(p.types)===targetKey).sort(compare);
  const overlapping=pokemon.filter(p=>p.types.some(t=>build.types.includes(t))).sort((a,b)=>
    b.types.filter(t=>build.types.includes(t)).length-a.types.filter(t=>build.types.includes(t)).length || compare(a,b));
  const typeTwins=diversify(exact.length?exact:overlapping,limit);
  const standard=abilitySlug(build.ability.name);
  const hidden=abilitySlug(build.hiddenAbility);
  const abilityMatches=slug=>diversify(pokemon.filter(p=>p.abilities.some(a=>a.name===slug))
    .sort((a,b)=>{
      const ae=typeSetKey(a.types)===targetKey?0:1;
      const be=typeSetKey(b.types)===targetKey?0:1;
      return ae-be||compare(a,b);
    }),limit);

  return {
    typeTwins,
    typeKind:exact.length?'exact':overlapping.length?'overlap':'none',
    typeTotal:exact.length,
    statSiblings:diversify([...pokemon].sort(compare),limit),
    standardAbility:abilityMatches(standard),
    hiddenAbility:abilityMatches(hidden),
    sampleSize:pokemon.length
  };
}

const pokemonImageBase='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
export const pokemonArtworkUrl=id=>pokemonImageBase+'other/official-artwork/'+Number(id)+'.png';
export const pokemonSpriteUrl=id=>pokemonImageBase+Number(id)+'.png';
