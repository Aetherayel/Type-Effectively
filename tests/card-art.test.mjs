import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, TYPE_COLORS } from '../src/data.mjs';
import { EXTRA_ELEMENT_TYPES, additionalTypeDefinitions, renderAdditionalTypeMotif } from '../src/type-motifs.mjs';
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

test('all 18 types render distinct local SVG artwork in both corners and on monotypes',()=>{
  const types=Object.keys(TYPE_COLORS);
  assert.equal(types.length,18);
  assert.equal(EXTRA_ELEMENT_TYPES.length,16);
  assert.deepEqual(
    new Set([...EXTRA_ELEMENT_TYPES,'Ice','Steel']),
    new Set(types)
  );
  for(const type of types) {
    const typeClass='type-art-'+type.toLowerCase();
    const art=renderTypeCornerArtwork([type,type]);
    assert.ok(art.includes('class="'+typeClass+'"'),type+' motif missing');
    assert.equal((art.match(new RegExp('class="'+typeClass+'"','g'))||[]).length,2,type+' should appear twice');
    assert.ok(art.includes('class="type-corner type-corner-primary"'),type+' primary');
    assert.ok(art.includes('class="type-corner type-corner-secondary"'),type+' secondary');
    assert.ok(art.includes('translate(932 1674) rotate(180)'),type+' rotated secondary');
    assert.ok(!art.includes('<image')&&!art.includes('<foreignObject'));
    if(type!=='Ice'&&type!=='Steel') {
      assert.ok(renderAdditionalTypeMotif(type).includes('url(#elemental-'+type.toLowerCase()+')'),type+' gradient reference');
    }
  }
  assert.equal(renderAdditionalTypeMotif('Unknown'),'');
  assert.equal(renderTypeCornerArtwork([]),'');
});

test('every possible two-type pairing composes both independently positioned motifs',()=>{
  const types=Object.keys(TYPE_COLORS);
  const defs=cardArtDefinitions();
  for(const left of types) {
    for(const right of types) {
      const art=renderTypeCornerArtwork([left,right]);
      const pos=art.indexOf('class="type-corner type-corner-secondary"');
      assert.ok(pos>0,left+'/'+right+' needs both corners');
      assert.ok(art.slice(0,pos).includes('class="type-art-'+left.toLowerCase()+'"'),left+'/'+right+' primary motif');
      assert.ok(art.slice(pos).includes('class="type-art-'+right.toLowerCase()+'"'),left+'/'+right+' secondary motif');
      for(const type of [left,right]){
        if(type!=='Ice'&&type!=='Steel') assert.ok(defs.includes('id="elemental-'+type.toLowerCase()+'"'));
      }
    }
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

test('new elemental motifs export without adding unfinished role emblems',()=>{
  const other=generateBuild({
    mbtiScores:DEMOS.catalyst.mbti,
    enneagramScores:DEMOS.catalyst.enneagram,
    bigFive:DEMOS.catalyst.bigfive,
    typeOverride:'ESFP',tritypeOverride:'714'
  });
  const svg=buildCardSvg({...other,role:{...other.role,primary:{...other.role.primary,name:'Support'}},types:['Water','Grass']});
  assert.ok(svg.includes('class="type-corner type-corner-primary"'));
  assert.ok(svg.includes('class="type-corner type-corner-secondary"'));
  assert.ok(svg.includes('class="type-art-water"'));
  assert.ok(svg.includes('class="type-art-grass"'));
  assert.ok(!svg.includes('class="role-watermark role-watermark-tank"'));
  assert.match(svg,/535 BST/);
  assert.doesNotMatch(svg,/<image\b|<foreignObject\b|https:\/\//);
});

test('artwork definitions use local SVG fills and transparent edge falloff',()=>{
  const defs=cardArtDefinitions();
  for(const id of ['ice-crystal','ice-shadow','steel-face','steel-edge','type-corner-mask',...EXTRA_ELEMENT_TYPES.map(t=>'elemental-'+t.toLowerCase())])
    assert.ok(defs.includes('id="'+id+'"'));
  assert.match(defs,/stop-opacity="0"/);
  assert.doesNotMatch(defs,/https?:|url\(https?:/);
});

test('sixteen additional gradients are defined exactly once and retain a restrained fade',()=>{
  const defs=additionalTypeDefinitions();
  assert.equal((defs.match(/<linearGradient /g)||[]).length,16);
  assert.equal((defs.match(/stop-opacity=".09"/g)||[]).length,16);
  assert.ok(!defs.includes('http'));
});
