import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderLiveCornerArtwork,renderLiveTankWatermark} from '../src/card-art.mjs';
import {DEMOS,TYPE_COLORS} from '../src/data.mjs';
import {generateBuild} from '../src/engine.mjs';

const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('site result card includes shared elemental art rather than limiting it to PNG export',()=>{
  const result=app.slice(app.indexOf('function renderCard('),app.indexOf('function buildSummary('));
  assert.ok(result.includes('renderLiveCornerArtwork(build.types)'));
  assert.ok(result.includes('renderLiveTankWatermark(build.role.primary.name)'));
  assert.ok(result.includes('class="result-artwork"'));
  assert.ok(result.includes("tankWatermark+renderStatRadar(build.baseStats,build.effectiveStats)"));
  assert.ok(result.includes('has-type-art'));
  assert.ok(styles.includes('.result-card.has-type-art>.pokemon-header{background:transparent}'));
  assert.ok(styles.includes('.result-art-corner{position:absolute'));
  assert.ok(styles.includes('.stat-role-watermark .role-watermark-tank{opacity:.13}'));
});

test('Ice/Steel corners display as two independently positioned, namespaced SVGs',()=>{
  const html=renderLiveCornerArtwork(['Ice','Steel']);
  assert.equal((html.match(/<svg /g)||[]).length,2);
  assert.match(html,/class="result-art-corner result-art-primary"/);
  assert.match(html,/class="result-art-corner result-art-secondary"/);
  assert.match(html,/class="type-art-ice"/);
  assert.match(html,/class="type-art-steel"/);
  assert.match(html,/id="live-primary-ice-crystal"/);
  assert.match(html,/id="live-secondary-steel-face"/);
  assert.match(html,/mask="url\(#live-primary-type-corner-mask\)"/);
  assert.match(html,/mask="url\(#live-secondary-type-corner-mask\)"/);
  assert.match(html,/fill="url\(#live-primary-ice-crystal\)"/);
  assert.match(html,/fill="url\(#live-secondary-steel-face\)"/);
  assert.ok(!html.includes('fill="url(#ice-crystal)"'));
});

test('all 18 types render in either live corner and repeat for monotypes',()=>{
  const types=Object.keys(TYPE_COLORS);
  assert.equal(types.length,18);
  for(const type of types) {
    const html=renderLiveCornerArtwork([type]);
    const shape='class="type-art-'+type.toLowerCase()+'"';
    assert.equal((html.match(/<svg /g)||[]).length,2,type+' must have both SVG corners');
    assert.equal(html.split(shape).length-1,2,type+' motif must appear twice');
    if(type!=='Ice'&&type!=='Steel') {
      assert.ok(html.includes('id="live-primary-elemental-'+type.toLowerCase()+'"'),type+' primary gradient');
      assert.ok(html.includes('id="live-secondary-elemental-'+type.toLowerCase()+'"'),type+' secondary gradient');
      assert.ok(html.includes('fill="url(#live-primary-elemental-'+type.toLowerCase()+')"'),type+' primary paint');
      assert.ok(html.includes('fill="url(#live-secondary-elemental-'+type.toLowerCase()+')"'),type+' secondary paint');
    }
  }
  for(const pair of [['Steel','Ice'],['Water','Steel'],['Fire','Water'],['Grass','Fairy'],['Ghost','Dark']]) {
    const html=renderLiveCornerArtwork(pair);
    assert.equal((html.match(/<svg /g)||[]).length,2,pair.join('/')+' must render both SVGs');
    assert.ok(html.includes('class="type-art-'+pair[0].toLowerCase()+'"'));
    assert.ok(html.includes('class="type-art-'+pair[1].toLowerCase()+'"'));
  }
  assert.equal(renderLiveCornerArtwork([]),'');
  assert.equal(renderLiveCornerArtwork(['Unknown','Other']),'');
});

test('Tank watermark appears in live stat panel; other roles do not invent emblems',()=>{
  const demo=generateBuild({
    mbtiScores:DEMOS.architect.mbti,
    enneagramScores:DEMOS.architect.enneagram,
    bigFive:DEMOS.architect.bigfive,
    typeOverride:'INTJ',tritypeOverride:'593'
  });
  assert.equal(demo.role.primary.name,'Tank');
  assert.deepEqual(demo.types,['Ice','Steel']);
  const svg=renderLiveTankWatermark(demo.role.primary.name);
  assert.match(svg,/class="stat-role-watermark"/);
  assert.match(svg,/role-watermark-tank/);
  assert.match(svg,/viewBox="250 440 460 530"/);
  assert.equal(renderLiveTankWatermark('Sweeper'),'');
});
