import { TYPE_COLORS } from './data.mjs';

// Modern main-series Pokémon type chart (Gen VI onward), attacking -> defending.
// Entries not listed deal neutral (1×) damage. This is typing only: abilities,
// held items, weather, Terastallization and battle effects are not modeled.
export const TYPE_EFFECTIVENESS = Object.freeze({
  Normal: {Rock:.5,Ghost:0,Steel:.5},
  Fire: {Fire:.5,Water:.5,Grass:2,Ice:2,Bug:2,Rock:.5,Dragon:.5,Steel:2},
  Water: {Fire:2,Water:.5,Grass:.5,Ground:2,Rock:2,Dragon:.5},
  Electric: {Water:2,Electric:.5,Grass:.5,Ground:0,Flying:2,Dragon:.5},
  Grass: {Fire:.5,Water:2,Grass:.5,Poison:.5,Ground:2,Flying:.5,Bug:.5,Rock:2,Dragon:.5,Steel:.5},
  Ice: {Fire:.5,Water:.5,Grass:2,Ice:.5,Ground:2,Flying:2,Dragon:2,Steel:.5},
  Fighting: {Normal:2,Ice:2,Poison:.5,Flying:.5,Psychic:.5,Bug:.5,Rock:2,Ghost:0,Dark:2,Steel:2,Fairy:.5},
  Poison: {Grass:2,Poison:.5,Ground:.5,Rock:.5,Ghost:.5,Steel:0,Fairy:2},
  Ground: {Fire:2,Electric:2,Grass:.5,Poison:2,Flying:0,Bug:.5,Rock:2,Steel:2},
  Flying: {Electric:.5,Grass:2,Fighting:2,Bug:2,Rock:.5,Steel:.5},
  Psychic: {Fighting:2,Poison:2,Psychic:.5,Dark:0,Steel:.5},
  Bug: {Fire:.5,Grass:2,Fighting:.5,Poison:.5,Flying:.5,Psychic:2,Ghost:.5,Dark:2,Steel:.5,Fairy:.5},
  Rock: {Fire:2,Ice:2,Fighting:.5,Ground:.5,Flying:2,Bug:2,Steel:.5},
  Ghost: {Normal:0,Psychic:2,Ghost:2,Dark:.5},
  Dragon: {Dragon:2,Steel:.5,Fairy:0},
  Dark: {Fighting:.5,Psychic:2,Ghost:2,Dark:.5,Fairy:.5},
  Steel: {Fire:.5,Water:.5,Electric:.5,Ice:2,Rock:2,Steel:.5,Fairy:2},
  Fairy: {Fire:.5,Fighting:2,Poison:.5,Dragon:2,Dark:2,Steel:.5}
});

export const ALL_TYPES = Object.freeze(Object.keys(TYPE_COLORS));

export function getDefensiveMatchups(defenderTypes) {
  if (!Array.isArray(defenderTypes) || defenderTypes.length<1 || defenderTypes.length>2 ||
      new Set(defenderTypes).size!==defenderTypes.length ||
      defenderTypes.some(type=>!ALL_TYPES.includes(type))) {
    throw new Error('Defensive typing must have one or two distinct Pokémon types.');
  }
  const entries = ALL_TYPES.map(type=>({
    type,
    multiplier:defenderTypes.reduce((value,defender)=>value*(TYPE_EFFECTIVENESS[type][defender] ?? 1),1)
  }));
  const match = multiplier=>entries.filter(item=>item.multiplier===multiplier);
  return {
    quadWeak:match(4),
    weak:match(2),
    resist:match(.5),
    strongResist:match(.25),
    immune:match(0),
    neutral:match(1)
  };
}
