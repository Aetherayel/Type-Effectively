import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateBuild } from '../src/engine.mjs';
import { matchPokemon, pokemonArtworkUrl, pokemonSpriteUrl, statComparison, unpackPokemon } from '../src/relatives.mjs';

const index=JSON.parse(readFileSync(new URL('../data/pokedex.json',import.meta.url),'utf8'));
const build=tritype=>generateBuild({typeOverride:'INTJ',tritypeOverride:tritype,bigFive:[80,90,20,60,15]});

test('PokéAPI data snapshot provides complete six-stat records and ability lists',()=>{
  assert.ok(index.pokemon.length>=1000);
  assert.equal(new Set(index.pokemon.map(p=>p[0])).size,index.pokemon.length);
  for(const record of index.pokemon){
    const p=unpackPokemon(record);
    assert.ok(p,JSON.stringify(record));
    assert.ok(p.types.length===1||p.types.length===2);
    assert.ok(p.stats.every(s=>s>0));
  }
});

test('593 Ice / Steel finds Alolan Sandshrew and Sandslash despite form-only typing',()=>{
  const matches=matchPokemon(build('593'),index.pokemon);
  assert.equal(matches.typeKind,'exact');
  const names=matches.typeTwins.map(p=>p.name);
  assert.ok(names.includes('Sandshrew (Alolan)'));
  assert.ok(names.includes('Sandslash (Alolan)'));
});

test('714 Electric / Ghost finds Rotom',()=>{
  const matches=matchPokemon(build('714'),index.pokemon);
  assert.equal(matches.typeKind,'exact');
  assert.ok(matches.typeTwins.some(p=>p.name==='Rotom'));
});

test('matching ability includes Pokémon with the ability in any slot',()=>{
  const a=matchPokemon(build('593'),index.pokemon);
  assert.ok(a.standardAbility.length);
  assert.ok(a.hiddenAbility.length);
  assert.ok(a.standardAbility.every(p=>p.abilities.some(x=>x.name==='analytic')));
  assert.ok(a.hiddenAbility.every(p=>p.abilities.some(x=>x.name==='adaptability')));
  const b=matchPokemon(build('714'),index.pokemon);
  assert.ok(b.hiddenAbility.some(p=>p.name==='Frosmoth'));
});

test('stat siblings use a reproducible, transparent 535-normalized comparison',()=>{
  const b=build('593');
  const matches=matchPokemon(b,index.pokemon);
  assert.equal(matches.statSiblings.length,4);
  assert.ok(matches.statSiblings.every(p=>p.match.spreadGap>=0));
  assert.ok(matches.statSiblings.every((p,i,a)=>i===0||p.match.score>=a[i-1].match.score));
  assert.equal(new Set(matches.statSiblings.map(p=>p.speciesId)).size,4);
  const identity=unpackPokemon(index.pokemon.find(p=>p[1]==='Skeledirge'));
  assert.equal(statComparison(identity,b).bst,530);
});

test('builds without exact typing fall back to clearly labeled shared types',()=>{
  const b=build('593');
  const custom={...b,types:['Electric','Fighting']};
  const matches=matchPokemon(custom,index.pokemon);
  if(matches.typeKind==='overlap'){
    assert.ok(matches.typeTwins.every(p=>p.types.some(t=>custom.types.includes(t))));
  }else if(matches.typeKind==='exact'){
    assert.ok(matches.typeTwins.every(p=>p.types.length===2&&p.types.includes('Electric')&&p.types.includes('Fighting')));
  }
});

test('image URL builders point at the PokéAPI sprite repository',()=>{
  assert.match(pokemonArtworkUrl(25),/PokeAPI\/sprites\/master\/sprites\/pokemon\/other\/official-artwork\/25\.png$/);
  assert.match(pokemonSpriteUrl(25),/PokeAPI\/sprites\/master\/sprites\/pokemon\/25\.png$/);
});
