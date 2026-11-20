import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderLiveCornerArtwork,renderLiveTankWatermark} from '../src/card-art.mjs';
import {DEMOS} from '../src/data.mjs';
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

test('supported type in either corner and monotypes both work; others remain undecorated',()=>{
  assert.equal((renderLiveCornerArtwork(['Steel','Ice']).match(/<svg /g)||[]).length,2);
  assert.equal((renderLiveCornerArtwork(['Steel']).match(/<svg /g)||[]).length,2);
  assert.equal((renderLiveCornerArtwork(['Ice']).match(/<svg /g)||[]).length,2);
  assert.equal((renderLiveCornerArtwork(['Water','Steel']).match(/<svg /g)||[]).length,1);
  assert.equal(renderLiveCornerArtwork(['Fire','Water']),'');
  assert.equal(renderLiveCornerArtwork([]),'');
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
