import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, TYPE_COLORS } from '../src/data.mjs';
import { EXTRA_ELEMENT_TYPES, additionalTypeDefinitions, renderAdditionalTypeMotif } from '../src/type-motifs.mjs';
import { generateBuild } from '../src/engine.mjs';
import { buildCardSvg } from '../src/export-card.mjs';
import { cardArtDefinitions, renderTypeCornerArtwork, renderRoleWatermark, BATTLE_ROLE_NAMES } from '../src/card-art.mjs';

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

test('all six roles produce distinct, restrained, locally drawn SVG emblems',()=>{
  assert.deepEqual(BATTLE_ROLE_NAMES,['Sweeper','Tank','Wall','Pivot','Support','Controller']);
  const artworks=new Set();
  for(const role of BATTLE_ROLE_NAMES) {
    const markup=renderRoleWatermark(role);
    assert.ok(markup.includes('class="role-watermark role-watermark-'+role.toLowerCase()+'"'),role);
    assert.ok(markup.includes('transform="translate(480 706)"'),role);
    assert.ok(markup.includes('opacity=".072"'),role);
    assert.ok(markup.includes('fill="none" stroke="#cee9df"'),role);
    assert.match(markup,/<path d="/,role+' must draw a recognizable shape');
    assert.ok(!markup.includes('<image')&&!markup.includes('<foreignObject'),role);
    assert.ok(!markup.includes('http'),role+' needs no remote graphics');
    artworks.add(markup);
  }
  assert.equal(artworks.size,6,'each role needs its own emblem');
  assert.equal(renderRoleWatermark(''), '');
  assert.equal(renderRoleWatermark('Unknown'), '');
  assert.equal(renderRoleWatermark('__proto__'), '');
  assert.match(renderRoleWatermark('Tank'),/role-watermark-tank/);
  assert.match(renderRoleWatermark('Tank'),/M0 -244 L196 -177/,'the original Tank shield must be preserved');
});

test('all six roles export their primary emblem under the radar, never a hybrid overlay',()=>{
  for(const role of BATTLE_ROLE_NAMES) {
    const b={...example,role:{...example.role,
      primary:{...example.role.primary,name:role},
      secondary:{name:'Sweeper'}}};
    const svg=buildCardSvg(b);
    const className='class="role-watermark role-watermark-'+role.toLowerCase()+'"';
    assert.ok(svg.includes(className),role);
    assert.ok(svg.indexOf(className)<svg.indexOf('class="stat-radar"'),role+' should stay behind stats');
    assert.equal((svg.match(/class="role-watermark role-watermark-/g)||[]).length,1,role+' must have one emblem');
    assert.match(svg,/535 BST/);
    assert.match(svg,/>BATTLE ROLE<\/text>/);
  }
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

test('new elemental motifs and Support emblem export together',()=>{
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
  assert.ok(svg.includes('class="role-watermark role-watermark-support"'));
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
