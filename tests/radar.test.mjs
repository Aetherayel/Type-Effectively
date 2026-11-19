import test from 'node:test';
import assert from 'node:assert/strict';
import { TYPE_COLORS, DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { RADAR_MAX, RADAR_RADIUS, RADAR_CENTER, radarPoint, radarPolygon, renderStatRadar } from '../src/radar.mjs';

test('Scarlet and Violet type palette includes all 18 standard Pokémon types', () => {
  assert.equal(Object.keys(TYPE_COLORS).length, 18);
  assert.equal(TYPE_COLORS.Ice, '#3DCEF3');
  assert.equal(TYPE_COLORS.Steel, '#60A1B8');
  assert.equal(TYPE_COLORS.Electric, '#FAC000');
  assert.equal(TYPE_COLORS.Ghost, '#704170');
  for (const value of Object.values(TYPE_COLORS)) {
    assert.match(value, /^#[0-9A-F]{6}$/);
  }
});

test('six radar axes are evenly spaced and meet at zero', () => {
  assert.equal(RADAR_MAX, 140);
  assert.equal(RADAR_RADIUS, 108);
  assert.deepEqual(radarPoint(0, 140), {x:180, y:56});
  assert.deepEqual(radarPoint(3, 140), {x:180, y:272});
  for(let i=0;i<6;i++) assert.deepEqual(radarPoint(i, 0), RADAR_CENTER);
  assert.throws(()=>radarPoint(6,120), /0–5/);
  assert.throws(()=>radarPoint(0,150), /between 0 and 140/);
});

test('radar shows six actual base stats from the user build, not Nature-modified values', () => {
  const build=generateBuild({
    mbtiScores:DEMOS.architect.mbti,
    enneagramScores:DEMOS.architect.enneagram,
    bigFive:DEMOS.architect.bigfive,
    tritypeOverride:'593',
    typeOverride:'INTJ'
  });
  const svg=renderStatRadar(build.baseStats);
  assert.match(svg,/role="img"/);
  assert.match(svg,/aria-labelledby="stat-radar-title stat-radar-description"/);
  assert.equal((svg.match(/class="stat-radar-ring/g)||[]).length,4);
  assert.equal((svg.match(/class="stat-radar-axis"/g)||[]).length,6);
  assert.equal((svg.match(/class="stat-radar-point"/g)||[]).length,6);
  assert.equal((svg.match(/class="stat-radar-label"/g)||[]).length,6);
  assert.match(svg,/HP 103/);
  for(const [label,key] of [['HP','hp'],['Attack','atk'],['Defense','def'],
    ['Sp. Atk','spa'],['Sp. Def','spd'],['Speed','spe']]) {
    assert.ok(svg.includes(label+' '+build.baseStats[key]),label);
  }
  assert.equal(build.baseStats.spa,109);
  assert.ok(build.effectiveStats.spa>build.baseStats.spa);
  assert.match(svg,/Sp\. Atk 109/);
});

test('radar polygons reject missing or out-of-range base stats', () => {
  assert.throws(()=>radarPolygon([50,50]),/six stats/);
  assert.throws(()=>renderStatRadar({hp:100}),/six valid base stats/);
  assert.throws(()=>renderStatRadar({hp:100,atk:100,def:100,spa:100,spd:100,spe:141}),/six valid base stats/);
  assert.equal(radarPolygon(Array(6).fill(0)).split(' ').length,6);
});
