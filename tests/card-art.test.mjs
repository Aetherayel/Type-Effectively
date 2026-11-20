import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { buildCardSvg } from '../src/export-card.mjs';
import { cardArtDefinitions, renderTypeCornerArtwork, renderRoleWatermark } from '../src/card-art.mjs';

const example=generateBuild({
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive,
  typeOverride:'INTJ',
  tritypeOverride:'593'
});

test('Ice and Steel corners compose by position, with monotypes filling both corners',()=>{
  const combos=[
    {types:['Ice','Steel'],primary:'ice',secondary:'steel'},
    {types:['Steel','Ice'],primary:'steel',secondary:'ice'},
    {types:['Ice'],primary:'ice',secondary:'ice'},
    {types:['Steel'],primary:'steel',secondary:'steel'},
    {types:['Grass','Steel'],primary:null,secondary:'steel'},
    {types:['Ice','Fire'],primary:'ice',secondary:null},
    {types:['Fire','Water'],primary:null,secondary:null}
  ];
  for(const {types,primary,secondary} of combos){
    const art=renderTypeCornerArtwork(types);
    const first=art.match(/<g class="type-corner type-corner-primary"[^>]*>([\s\S]*?)<\/g>/)?.[1]??'';
    const second=art.match(/<g class="type-corner type-corner-secondary"[^>]*>([\s\S]*?)<\/g>/)?.[1]??'';
    assert.equal(first.includes('type-art-'+primary),primary!==null,'primary '+types);
    assert.equal(second.includes('type-art-'+secondary),secondary!==null,'secondary '+types);
    assert.equal(art.includes('class="type-corner type-corner-primary"'),primary!==null);
    assert.equal(art.includes('class="type-corner type-corner-secondary"'),secondary!==null);
    assert.ok(!art.includes('<image')&&!art.includes('<foreignObject'));
  }
});

test('Tank role has an understated SVG shield behind the radar; other roles remain plain',()=>{
  const badge=renderRoleWatermark('Tank');
  assert.match(badge,/role-watermark-tank/);
  assert.match(badge,/opacity="\.072"/);
  assert.ok(badge.includes('translate(480 706)'));
  for(const role of ['Sweeper','Wall','Pivot','Controller','Support'])
    assert.equal(renderRoleWatermark(role),'','unimplemented role '+role+' should not receive a false emblem');
});

test('real Ice/Steel Tank card has clipped corner motifs and shield behind text and radar',()=>{
  assert.deepEqual(example.types,['Ice','Steel']);
  assert.equal(example.role.primary.name,'Tank');
  const svg=buildCardSvg(example);
  assert.match(svg,/id="type-corner-mask"/);
  assert.match(svg,/id="rounded-card"/);
  assert.ok(svg.includes('type-art-ice'));
  assert.ok(svg.includes('type-art-steel'));
  assert.ok(svg.includes('role-watermark-tank'));
  assert.ok(svg.indexOf('class="type-corner type-corner-primary"')<svg.indexOf('>BASE STATS<'));
  assert.ok(svg.indexOf('class="role-watermark role-watermark-tank"')<svg.indexOf('class="stat-radar"'));
  assert.match(svg,/>BATTLE ROLE<\/text>/);
  assert.match(svg,/535 BST/);
  assert.match(svg,/>O:H · C:H · E:L · A:H · N:L<\/text>/);
  assert.doesNotMatch(svg,/<image\b|<foreignObject\b|https:\/\//);
});

test('other typing and role exports preserve the original plain surface',()=>{
  const other=generateBuild({
    mbtiScores:DEMOS.catalyst.mbti,
    enneagramScores:DEMOS.catalyst.enneagram,
    bigFive:DEMOS.catalyst.bigfive,
    typeOverride:'ESFP',tritypeOverride:'714'
  });
  const plain=buildCardSvg({...other,role:{...other.role,primary:{...other.role.primary,name:'Support'}},types:['Water','Grass']});
  assert.ok(!plain.includes('class="type-corner type-corner-primary"'));
  assert.ok(!plain.includes('class="type-corner type-corner-secondary"'));
  assert.ok(!plain.includes('class="role-watermark role-watermark-tank"'));
});

test('artwork definitions use local SVG fills and transparent edge falloff',()=>{
  const defs=cardArtDefinitions();
  for(const id of ['ice-crystal','ice-shadow','steel-face','steel-edge','type-corner-mask'])
    assert.ok(defs.includes('id="'+id+'"'));
  assert.match(defs,/stop-opacity="0"/);
  assert.doesNotMatch(defs,/https?:|url\(https?:/);
});
