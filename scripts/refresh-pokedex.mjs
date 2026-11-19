/**
 * Regenerate the local Pokémon comparison index from PokéAPI's public CSVs.
 * Usage: npm run refresh:pokedex
 *
 * No dependency installation, images, or runtime API calls are required.
 */
import { writeFile } from 'node:fs/promises';

const source = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
const filenames = [
  'pokemon.csv','pokemon_types.csv','pokemon_stats.csv','pokemon_abilities.csv',
  'abilities.csv','types.csv','pokemon_species_names.csv','pokemon_species.csv'
];

function parseCsv(csv) {
  // Source files are standard CSV. Handles double-quoted commas and quotes.
  const lines=csv.replace(/\r/g,'').split('\n').filter(Boolean);
  const headers=lines.shift().split(',');
  return lines.map(line=>{
    const values=[];let field='';let quoted=false;
    for(let i=0;i<line.length;i++){
      const char=line[i];
      if(char==='"'&&quoted&&line[i+1]==='"'){field+='"';i++;}
      else if(char==='"'){quoted=!quoted;}
      else if(char===','&&!quoted){values.push(field);field='';}
      else field+=char;
    }
    values.push(field);
    return Object.fromEntries(headers.map((key,i)=>[key,values[i]??'']));
  });
}

function accumulate(map,id,value) {
  if(!map.has(id))map.set(id,[]);
  map.get(id).push(value);
}

const title = text => text.replace(/(^|-)([a-z])/g,(_,dash,letter)=>(dash?' ':'')+letter.toUpperCase());
const formLabels={alola:'Alolan',galar:'Galarian',hisui:'Hisuian',paldea:'Paldean',mega:'Mega',gmax:'Gigantamax',origin:'Origin',therian:'Therian',incarnate:'Incarnate'};
const formatForm=slug=>slug.split('-').map(word=>formLabels[word]||title(word)).join(' ');
const validTypes=new Set(['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy']);

async function main() {
  const all=await Promise.all(filenames.map(async file=>{
    const url=source+file;
    const response=await fetch(url);
    if(!response.ok)throw new Error(`Could not download ${file}: HTTP ${response.status}`);
    return [file,parseCsv(await response.text())];
  }));
  const csv=Object.fromEntries(all);
  const typeNames=new Map(csv['types.csv'].map(row=>[Number(row.id),title(row.identifier)]));
  const abilityNames=new Map(csv['abilities.csv'].map(row=>[Number(row.id),row.identifier]));
  const speciesNames=new Map(csv['pokemon_species_names.csv'].filter(row=>row.local_language_id==='9').map(row=>[Number(row.pokemon_species_id),row.name]));
  const speciesSlugs=new Map(csv['pokemon_species.csv'].map(row=>[Number(row.id),row.identifier]));
  const types=new Map(),stats=new Map(),abilities=new Map();
  for(const row of csv['pokemon_types.csv']) accumulate(types,Number(row.pokemon_id),{slot:+row.slot,name:typeNames.get(+row.type_id)});
  for(const row of csv['pokemon_stats.csv']) accumulate(stats,Number(row.pokemon_id),{id:+row.stat_id,value:+row.base_stat});
  for(const row of csv['pokemon_abilities.csv']) accumulate(abilities,Number(row.pokemon_id),{slot:+row.slot,slug:abilityNames.get(+row.ability_id),hidden:row.is_hidden==='1'});

  const pokemon=[];
  for(const row of csv['pokemon.csv']) {
    const id=Number(row.id),species=Number(row.species_id);
    const typed=(types.get(id)||[]).sort((a,b)=>a.slot-b.slot).map(x=>x.name);
    if(!typed.length || typed.some(type=>!validTypes.has(type)))continue;
    const values=(stats.get(id)||[]).sort((a,b)=>a.id-b.id);
    if(values.length!==6 || values.some((v,i)=>v.id!==i+1||!Number.isFinite(v.value)))continue;
    const allAbilities=(abilities.get(id)||[]).sort((a,b)=>a.slot-b.slot).filter(a=>a.slug)
      .map(a=>(a.hidden?'!':'')+a.slug);
    const speciesSlug=speciesSlugs.get(species)||row.identifier;
    const base=speciesNames.get(species)||title(speciesSlug);
    const suffix=row.identifier.startsWith(speciesSlug+'-') ? row.identifier.slice(speciesSlug.length+1):row.identifier;
    const displayName=row.is_default==='1'?base:base+' ('+formatForm(suffix)+')';
    pokemon.push([id,displayName,species,typed,values.map(v=>v.value),allAbilities]);
  }

  if(pokemon.length<1000)throw new Error('Pokédex unusually small; refusing to replace the snapshot.');
  const payload={
    schema:'[id,displayName,speciesId,types,[HP,Attack,Defense,SpAttack,SpDefense,Speed],abilitySlugs]',
    source:'https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv',
    imageSource:'https://github.com/PokeAPI/sprites',
    retrieved:new Date().toISOString().slice(0,10),
    pokemon
  };
  await writeFile(new URL('../data/pokedex.json',import.meta.url),JSON.stringify(payload));
  process.stdout.write(`Refreshed ${pokemon.length} Pokémon/form records. Review the diff before committing.\n`);
}

main().catch(error=>{console.error(error);process.exitCode=1;});
