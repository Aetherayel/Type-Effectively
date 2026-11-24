import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cardVersionFooter, cardVersionLabels, normalizeBuildVersion } from '../src/build-version.mjs';
import { buildCardSvg, CARD_HEIGHT, CARD_WIDTH } from '../src/export-card.mjs';
import { generateBuild } from '../src/engine.mjs';
import { DEMOS } from '../src/data.mjs';

const build=()=>generateBuild({
  mbtiScores:DEMOS.architect.mbti,
  enneagramScores:DEMOS.architect.enneagram,
  bigFive:DEMOS.architect.bigfive
});

test('card provenance identifies creation and current recalculation separately',()=>{
  assert.equal(normalizeBuildVersion('v1.2.0'),'v1.2.0');
  assert.equal(normalizeBuildVersion('v1.4.0'),'v1.4.0');
  assert.equal(normalizeBuildVersion('v2.0.0'),'v2.0.0');
  assert.equal(cardVersionFooter({createdVersion:'v1.4.0',renderVersion:'v2.0.0'}),
    'CREATED v1.4.0 · RECALCULATED v2.0.0');
  assert.equal(normalizeBuildVersion('v1.2.17'),'v1.2.17');
  assert.equal(normalizeBuildVersion('1.2.0'),null);
  assert.equal(normalizeBuildVersion('v1.2.0<img>'),null);
  assert.equal(normalizeBuildVersion('v1.2'),null);
  assert.equal(cardVersionFooter({createdVersion:'v1.2.0',renderVersion:'v1.2.0'}),'CREATED v1.2.0');
  assert.deepEqual(cardVersionLabels({createdVersion:'v1.1.2',renderVersion:'v1.2.4'}),{
    created:'CREATED v1.1.2',recalculated:'RECALCULATED v1.2.4'
  });
  assert.equal(cardVersionFooter({createdVersion:'v1.3.8',renderVersion:'v1.4.0'}),
    'CREATED v1.3.8 · RECALCULATED v1.4.0');
  assert.equal(cardVersionFooter({createdVersion:null,renderVersion:'v1.2.4'}),
    'CREATED VERSION UNRECORDED · RECALCULATED v1.2.4');
});

test('exported SVG card permanently prints the build version in its bottom footer',()=>{
  const b={...build(),createdVersion:'v1.2.0',renderVersion:'v1.2.0'};
  const svg=buildCardSvg(b);
  assert.equal(CARD_WIDTH,960);
  assert.equal(CARD_HEIGHT,1700);
  assert.match(svg,/<text x="884" y="1640"[^>]*>CREATED v1\.2\.0<\/text>/);
  assert.ok(!svg.includes('RECALCULATED'));
  assert.ok(svg.includes('aetherayel.github.io/Type-Effectively/'));
  assert.ok(svg.includes('Unofficial fan project'));
  const restored=buildCardSvg({...b,renderVersion:'v1.2.5'});
  assert.ok(restored.includes('CREATED v1.2.0'));
  assert.ok(restored.includes('RECALCULATED v1.2.5'));
});

test('the live card and shared links both carry original creation version, not the latest release',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const stylesheet=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  const release=readFileSync(new URL('../src/release-version.mjs',import.meta.url),'utf8');
  assert.ok(app.includes('id="build-version-footer"'));
  assert.ok(stylesheet.includes('.build-version-footer'));
  assert.ok(app.includes('buildVersion:state.lastBuild?.createdVersion||null'));
  assert.ok(app.includes('runBuild(false,payload.sample===true,payload.buildVersion??null)'));
  assert.ok(app.includes("build.restoredFromShare=sharedVersion!==undefined"));
  assert.ok(app.includes('if(!build.restoredFromShare)build.createdVersion=version'));
  assert.ok(app.includes("'Version: '+cardVersionFooter(b)"));
  assert.ok(release.includes("new CustomEvent('type-effectively:release-version'"));
});
