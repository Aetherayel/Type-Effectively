import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HELD_ITEMS, ITEM_FAMILIES } from '../src/held-items-data.mjs';
import { chooseHeldItem, isHeldItemCompatible } from '../src/held-items.mjs';
import { DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { buildCardSvg } from '../src/export-card.mjs';

const architectInput={
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive,
  typeOverride:'INTJ',tritypeOverride:'593'
};

test('72 balanced general-purpose held items and two gated specialist orbs are unique',()=>{
  const names=HELD_ITEMS.map(item=>item.name);
  assert.equal(names.length,74);
  assert.equal(new Set(names).size,74);
  assert.deepEqual(HELD_ITEMS.filter(x=>x.strategyOnly).map(x=>x.name).sort(),
    ['Flame Orb','Toxic Orb']);
  const general=HELD_ITEMS.filter(x=>!x.strategyOnly);
  assert.equal(general.length,72);
  assert.equal(Object.keys(ITEM_FAMILIES).length,9);
  for(const [key,family] of Object.entries(ITEM_FAMILIES)) {
    const members=general.filter(item=>item.family===key);
    assert.equal(members.length,8,key+' must have eight distinct items');
    assert.equal(family.ennea.length,9);
    assert.equal(family.target.length,5);
    assert.ok(family.insight.length>12);
    assert.ok(members.every(item=>item.effect.length>10 && item.quip.length>15));
    for(const item of members) {
      assert.equal(item.targets.length,5,item.name);
      assert.ok(item.targets.every(value=>Number.isInteger(value)&&value>=0&&value<=100),item.name);
      assert.ok(item.roles.length>0&&item.roles.length<=2,item.name);
      assert.ok(item.roles.every(role=>['Sweeper','Tank','Wall','Pivot','Support','Controller'].includes(role)),item.name);
    }
  }
});

test('same inputs produce the same held item without altering Pokémon battle numbers',()=>{
  const first=generateBuild(architectInput),second=generateBuild(architectInput);
  assert.deepEqual(first.heldItem,second.heldItem);
  assert.ok(HELD_ITEMS.some(item=>item.name===first.heldItem.name));
  assert.equal(first.heldItem.name.length>0,true);
  assert.ok(first.heldItem.effect.length>0);
  assert.ok(first.heldItem.quip.length>0);
  assert.match(first.heldItem.why,/Type 5 core/);
  assert.match(first.heldItem.why,/role point toward/);
  assert.equal(Object.values(first.baseStats).reduce((a,b)=>a+b,0),535);
  assert.deepEqual(first.effectiveStats,second.effectiveStats);
  assert.equal(first.effectiveStats.hp,first.baseStats.hp);
  assert.equal(first.moves.length,4);
});

test('different Big Five patterns diversify items even for a shared 593 tritype',()=>{
  const choices=new Set();
  for(let i=0;i<36;i++) {
    const bigFive=[
      (i*19)%101,(i*33+17)%101,(i*47+29)%101,
      (i*59+31)%101,(i*71+43)%101
    ];
    const build=generateBuild({...architectInput,bigFive});
    assert.equal(build.tritype,'593');
    choices.add(build.heldItem.name);
  }
  assert.ok(choices.size>=10,'only '+choices.size+' items for 36 distinct Big Five profiles');
});

test('seeded varied builds explore many held items and every family',()=>{
  let seed=56789;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const names=new Set(),families=new Set();
  for(let i=0;i<1200;i++){
    const input={
      mbtiScores:Array.from({length:5},()=>Math.floor(random()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(random()*101)),
      bigFive:Array.from({length:5},()=>Math.floor(random()*101))
    };
    const build=generateBuild(input);
    names.add(build.heldItem.name);
    families.add(build.heldItem.family);
    assert.equal(generateBuild(input).heldItem.name,build.heldItem.name);
  }
  assert.ok(names.size>=40,'only '+names.size+' unique items in varied builds');
  assert.equal(families.size,9,'all behavioral families should be reachable');
});

test('held-item selection uses meaningful fit, never a raw-score hash',()=>{
  const module=readFileSync(new URL('../src/held-items.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(module,/FNV-1a|const hash\s*=|hash\(seed|const seed=|const tie=/,
    'item selection must not invent score-dependent pseudo-random offsets');
  assert.match(module,/\.47\*familyScore\+\.38\*traits\+\.15\*roleScore/,
    'equipment preference should remain traceable to family, trait, and role fits');
  let seed=20261124;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  let changed=0,changedAlone=0;
  for(let i=0;i<260;i++){
    const sample={
      bigFive:Array.from({length:5},()=>Math.floor(rand()*101)),
      mbtiScores:Array.from({length:5},()=>Math.floor(rand()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(rand()*101))
    };
    const revised={...sample,bigFive:sample.bigFive.map((v,j)=>
      j===2?Math.min(100,v+1):v)};
    const a=generateBuild(sample),b=generateBuild(revised);
    if(a.heldItem.name!==b.heldItem.name){
      changed++;
      if(a.types.join()===b.types.join()&&a.nature===b.nature&&
        a.role.primary.name===b.role.primary.name&&
        Object.values(a.baseStats).every((value,k)=>value===Object.values(b.baseStats)[k]))
        changedAlone++;
    }
  }
  assert.ok(changed<=26,'one-point trait changes repeatedly reshuffle equipment: '+changed+'/260');
  assert.ok(changedAlone<=13,'equipment-only instability returned: '+changedAlone+'/260');
});

test('estimated Big Five scores never masquerade as measured trait findings',()=>{
  const build=generateBuild({typeOverride:'INTJ',tritypeOverride:'593'});
  assert.ok(build.heldItem.why.includes('Type 5 core'));
  assert.doesNotMatch(build.heldItem.why,/higher |lower /);
});

test('a held item is selected from the complete build and can be independently calculated',()=>{
  const b=generateBuild(architectInput);
  const candidate=chooseHeldItem({
    tritype:b.tritype,core:b.core,second:b.second,third:b.third,wing:b.wing,
    enneagramScores:architectInput.enneagramScores,
    bigFive:architectInput.bigFive,
    mbtiScores:architectInput.mbtiScores,
    role:b.role,types:b.types,moves:b.moves,ability:b.ability
  });
  if(b.signatureStrategy){
    assert.equal(b.heldItem.name,b.signatureStrategy.item,
      'signature equipment must be the mechanically required item');
    assert.ok(isHeldItemCompatible(b.heldItem,{types:b.types,moves:b.moves,ability:b.ability}));
  }else{
    assert.deepEqual(candidate,b.heldItem);
  }
  assert.throws(()=>chooseHeldItem({}),/complete personality build/);
});

test('hard item eligibility rules prevent incompatible equipment',()=>{
  const kit={types:['Water','Ice'],
    moves:['Surf','Ice Beam','Recover','Calm Mind']};
  for(const name of ['Assault Vest','Black Sludge','Big Root','Light Clay',
    'Choice Band','Choice Specs','Choice Scarf','Grip Claw','Binding Band',
    'Loaded Dice','Heat Rock','Damp Rock','Icy Rock','Smooth Rock',
    'Flame Orb','Toxic Orb',
    'Terrain Extender','Misty Seed','Electric Seed','Psychic Seed',
    'Eviolite','Everstone','Room Service']){
    assert.equal(isHeldItemCompatible(name,kit),false,name);
  }
  assert.equal(isHeldItemCompatible('Black Sludge',
    {...kit,types:['Water','Poison']}),true);
  assert.equal(isHeldItemCompatible('Big Root',
    {...kit,moves:['Surf','Ice Beam','Aqua Ring','Protect']}),true);
  assert.equal(isHeldItemCompatible('Light Clay',
    {...kit,moves:['Surf','Ice Beam','Reflect','Rest']}),true);
  assert.equal(isHeldItemCompatible('Room Service',
    {...kit,moves:['Surf','Ice Beam','Trick Room','Endure']}),true);
  assert.equal(isHeldItemCompatible('Grassy Seed',
    {...kit,moves:['Surf','Ice Beam','Grassy Terrain','Rest']}),true);
  assert.equal(isHeldItemCompatible('Flame Orb',{
    types:['Fighting','Steel'],moves:['Close Combat','Facade','Bulk Up','Protect'],
    ability:'Guts'
  }),true);
  assert.equal(isHeldItemCompatible('Flame Orb',{
    types:['Fire','Fighting'],moves:['Close Combat','Facade','Bulk Up','Protect'],
    ability:'Guts'
  }),false);
  assert.equal(isHeldItemCompatible('Toxic Orb',{
    types:['Grass','Ground'],moves:['Energy Ball','Earth Power','Protect','Helping Hand'],
    ability:'Poison Heal'
  }),true);
  assert.equal(isHeldItemCompatible('Toxic Orb',{
    types:['Grass','Poison'],moves:['Energy Ball','Sludge Bomb','Protect','Helping Hand'],
    ability:'Poison Heal'
  }),false);
  assert.equal(isHeldItemCompatible('Smooth Rock',{
    types:['Rock','Ground'],moves:['Stone Edge','Earthquake','Shore Up','Endure'],
    ability:'Sand Stream'
  }),true);
  assert.equal(isHeldItemCompatible('Misty Seed',{
    types:['Fairy'],moves:['Moonblast','Psychic','Heal Bell','Wish'],
    ability:'Misty Surge'
  }),true);
  assert.equal(isHeldItemCompatible('Terrain Extender',{
    types:['Electric'],moves:['Thunderbolt','Psychic','Charge','Rest'],
    ability:'Electric Surge'
  }),true);
});

test('actual generated builds never equip items that contradict their moves or typing',()=>{
  let seed=90411;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const eligible=new Set();
  for(let i=0;i<1800;i++){
    const b=generateBuild({
      mbtiScores:Array.from({length:5},()=>Math.floor(rand()*101)),
      enneagramScores:Array.from({length:9},()=>Math.floor(rand()*101)),
      bigFive:Array.from({length:5},()=>Math.floor(rand()*101))
    });
    assert.ok(isHeldItemCompatible(b.heldItem,{types:b.types,moves:b.moves,ability:b.ability}),
      b.tritype+' / '+b.heldItem.name);
    eligible.add(b.heldItem.name);
  }
  assert.ok(eligible.size>=40,'item compatibility should preserve thematic variety');
});

test('compact exported card includes item name and dry joke, not the long explanation',()=>{
  const build=generateBuild(architectInput);
  const svg=buildCardSvg(build);
  assert.match(svg,/HELD ITEM/);
  assert.ok(svg.includes(build.heldItem.name));
  assert.ok(svg.includes(build.heldItem.quip));
  assert.doesNotMatch(svg,/WHY:|WHY YOU GOT THIS/);
  assert.ok(!svg.includes(build.heldItem.why));
  assert.ok(!svg.includes(build.heldItem.effect));
  assert.match(svg,/STANDARD/);
  assert.match(svg,/HIDDEN/);
  assert.ok(svg.includes(build.ability.name));
  assert.ok(svg.includes(build.hiddenAbility));
  assert.match(svg,/SIGNATURE MOVES/);
  for(const move of build.moves) assert.ok(svg.includes(move.name),move.name);
  assert.match(svg,/OCEAN shown only as high \/ low/);
  assert.doesNotMatch(svg,/mbtiScores|enneagramScores|bigFive|#build=/);
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('build.heldItem.effect'));
  assert.ok(source.includes('build.heldItem.quip'));
  assert.ok(source.includes('build.heldItem.why'));
  assert.ok(source.includes('id="held-item-sprite"'));
  assert.ok(source.includes('itemSpriteUrl(build.heldItem.name)'));
});

test('export escapes held item jokes, ability names and move text',()=>{
  const b=generateBuild(architectInput);
  const svg=buildCardSvg({...b,
    heldItem:{...b.heldItem,name:'<script>bad()</script>',quip:'A & B',why:'private rationale'},
    hiddenAbility:'Power & Peace',
    moves:b.moves.map((move,i)=>i===0?{...move,name:'<malicious> & fade'}:move)
  });
  assert.doesNotMatch(svg,/<script>|<malicious>/);
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(svg.includes('A &amp; B'));
  assert.ok(svg.includes('Power &amp; Peace'));
  assert.ok(svg.includes('&lt;malicious&gt; &amp; fade'));
  assert.ok(!svg.includes('private rationale'));
});
