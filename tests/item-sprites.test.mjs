import test from 'node:test';
import assert from 'node:assert/strict';
import { HELD_ITEMS } from '../src/held-items-data.mjs';
import { ITEM_SPRITE_ROOT, itemSpriteSlug, itemSpriteUrl, loadItemSprite } from '../src/item-sprites.mjs';
import { readFileSync } from 'node:fs';

test('all 74 held items, including the specialist orbs, map to distinct PokéAPI sprite filenames',()=>{
  const paths=HELD_ITEMS.map(item=>itemSpriteSlug(item.name)+'.png');
  assert.equal(paths.length,74);
  assert.equal(new Set(paths).size,74);
  assert.ok(paths.every(path=>/^[a-z0-9-]+\.png$/.test(path)));
  assert.equal(itemSpriteSlug("King's Rock"),'kings-rock');
  assert.equal(itemSpriteSlug('Flame Orb'),'flame-orb');
  assert.equal(itemSpriteSlug('Toxic Orb'),'toxic-orb');
  assert.equal(itemSpriteUrl('Heavy-Duty Boots'),ITEM_SPRITE_ROOT+'heavy-duty-boots.png');
  assert.equal(itemSpriteUrl('Absorb Bulb'),ITEM_SPRITE_ROOT+'absorb-bulb.png');
  assert.throws(()=>itemSpriteUrl('unsafe/../test'),/Invalid Pokémon held item/);
});

test('item sprite loader applies anonymous cross-origin mode for canvas safety',async()=>{
  const oldImage=globalThis.Image;
  let requested,mode;
  try {
    globalThis.Image=class {
      set src(url) {
        requested=url;mode=this.crossOrigin;
        queueMicrotask(()=>this.onload?.());
      }
    };
    const img=await loadItemSprite('Covert Cloak');
    assert.ok(img);
    assert.equal(requested,ITEM_SPRITE_ROOT+'covert-cloak.png');
    assert.equal(mode,'anonymous');
  } finally { globalThis.Image=oldImage; }
});

test('a missing sprite resolves to a safe placeholder instead of breaking PNG export',async()=>{
  const oldImage=globalThis.Image;
  try {
    globalThis.Image=class {set src(_url){queueMicrotask(()=>this.onerror?.());}};
    assert.equal(await loadItemSprite('Choice Specs'),null);
    assert.equal(await loadItemSprite('not/valid'),null);
  } finally {globalThis.Image=oldImage;}
});

test('export composition draws icon only after rasterizing the card',()=>{
  const code=readFileSync(new URL('../src/export-card.mjs',import.meta.url),'utf8');
  assert.ok(code.includes('const spritePromise=loadItemSprite(build.heldItem.name)'));
  assert.ok(code.includes('const sprite=await spritePromise'));
  assert.ok(code.includes('context.drawImage(sprite,96,1497,68,68)'));
  assert.ok(code.includes('if(sprite)'));
});
