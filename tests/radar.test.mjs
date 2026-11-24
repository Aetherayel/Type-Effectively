import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TYPE_COLORS, DEMOS } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { RADAR_MAX, RADAR_RADIUS, RADAR_CENTER, RADAR_ORDER, radarPoint, radarPolygon, renderStatRadar } from '../src/radar.mjs';

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
  assert.equal(RADAR_MAX, 160);
  assert.equal(RADAR_RADIUS, 108);
  assert.deepEqual(radarPoint(0, 160), {x:180, y:56});
  assert.deepEqual(radarPoint(3, 160), {x:180, y:272});
  for(let i=0;i<6;i++) assert.deepEqual(radarPoint(i, 0), RADAR_CENTER);
  assert.throws(()=>radarPoint(6,120), /0–5/);
  assert.throws(()=>radarPoint(0,161), /between 0 and 160/);
});

test('radar shows post-Nature values above the original base numbers', () => {
  const build=generateBuild({
    mbtiScores:DEMOS.architect.mbti,
    enneagramScores:DEMOS.architect.enneagram,
    bigFive:DEMOS.architect.bigfive,
    tritypeOverride:'593',
    typeOverride:'INTJ'
  });
  const svg=renderStatRadar(build.baseStats,build.effectiveStats);
  assert.match(svg,/role="img"/);
  assert.match(svg,/aria-labelledby="stat-radar-title stat-radar-description"/);
  assert.equal((svg.match(/class="stat-radar-ring/g)||[]).length,4);
  assert.equal((svg.match(/class="stat-radar-axis"/g)||[]).length,6);
  assert.equal((svg.match(/class="stat-radar-point"/g)||[]).length,6);
  assert.equal((svg.match(/class="stat-radar-label"/g)||[]).length,6);
  const statLabels=[...svg.matchAll(/<g class="stat-radar-label" transform="translate\(([^)]+)\)">([\s\S]*?)<\/g>/g)].map(m=>m[2]);
  assert.equal(statLabels.length,6);
  for(const [name,key] of [['HP','hp'],['Attack','atk'],['Defense','def'],
    ['Sp. Atk','spa'],['Sp. Def','spd'],['Speed','spe']]) {
    const label=statLabels.find(s=>s.includes('>'+name+'</text>'));
    assert.ok(label,'Missing '+name);
    const numberCount=(label.match(/stat-radar-label-(?:effective|base|single)/g)||[]).length;
    if(build.effectiveStats[key]===build.baseStats[key]) {
      assert.equal(numberCount,1,name+' should show only one number');
      assert.match(label,new RegExp('class="stat-radar-label-single" y="15">'+build.baseStats[key]+'<'));
      assert.ok(svg.includes(name+': base '+build.baseStats[key]));
    } else {
      assert.equal(numberCount,2,name+' should show two numbers');
      const adjustedLabel=label.match(/class="stat-radar-label-effective[^"]*" y="11">([^<]+)<\/text>/)?.[1];
      const baseLabel=label.match(/class="stat-radar-label-base" y="25">([^<]+)<\/text>/)?.[1];
      assert.equal(adjustedLabel?.replace(/[↑↓]/g,''),String(build.effectiveStats[key]),name+' adjusted value');
      assert.equal(baseLabel,String(build.baseStats[key]),name+' base value beneath it');
      assert.ok(svg.includes(name+': after Nature '+build.effectiveStats[key]+', base '+build.baseStats[key]));
    }
  }
  const boost=build.natureBoost,drop=build.natureDrop;
  assert.equal(build.effectiveStats[boost],Math.floor(build.baseStats[boost]*1.1));
  assert.equal(build.effectiveStats[drop],Math.floor(build.baseStats[drop]*.9));
  assert.ok(statLabels.some(s=>s.includes('>↑'+build.effectiveStats[boost]+'</text>')&&
    s.includes('>'+build.baseStats[boost]+'</text>')));
  assert.ok(statLabels.some(s=>s.includes('>↓'+build.effectiveStats[drop]+'</text>')&&
    s.includes('>'+build.baseStats[drop]+'</text>')));
});

test('without Nature changes every radar axis has a single base value', () => {
  const base={hp:95,atk:100,def:85,spa:90,spd:80,spe:85};
  const svg=renderStatRadar(base);
  assert.equal((svg.match(/class="stat-radar-label-single"/g)||[]).length,6);
  assert.doesNotMatch(svg,/class="stat-radar-label-effective/);
  assert.doesNotMatch(svg,/class="stat-radar-label-base"/);
  assert.match(svg,/Sp\. Atk: base 90/);
});

test('radar preserves Speed at bottom and Sp. Attack at upper-left', () => {
  assert.deepEqual(RADAR_ORDER, [0,1,2,5,4,3]);
  const svg=renderStatRadar(
    {hp:100,atk:90,def:80,spa:70,spd:60,spe:50},
    {hp:100,atk:90,def:80,spa:77,spd:60,spe:45}
  );
  const labels=[...svg.matchAll(/<g class="stat-radar-label" transform="translate\(([^)]+)\)">([\s\S]*?)<\/g>/g)]
    .map(match=>({position:match[1], content:match[2]}));
  const bottom=labels.find(label=>label.position==='180 305');
  const upperLeft=labels.find(label=>label.position==='47 87');
  assert.ok(bottom?.content.includes('>Speed</text>'));
  assert.ok(bottom?.content.includes('>↓45</text>'));
  assert.ok(bottom?.content.includes('>50</text>'));
  assert.ok(upperLeft?.content.includes('>Sp. Atk</text>'));
  assert.ok(upperLeft?.content.includes('>↑77</text>'));
  assert.ok(upperLeft?.content.includes('>70</text>'));
});

test('157 base stats permit boosted Nature values above the base cap',()=>{
  const base={hp:100,atk:157,def:80,spa:70,spd:70,spe:75};
  const after={...base,atk:172,spe:67};
  const svg=renderStatRadar(base,after);
  assert.match(svg,/Attack: after Nature 172, base 157/);
  assert.match(svg,/>↑172<\/text>/);
  assert.throws(()=>renderStatRadar(base,{...after,atk:173}),/valid post-Nature stats/);
});

test('result markup keeps compact Nature, Battle Role and standard Ability line with no detailed stat block',()=>{
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const card=source.slice(source.indexOf('function renderCard('),source.indexOf('function buildSummary('));
  assert.ok(card.includes('pokemon-type-accent'));
  assert.ok(card.indexOf('result-body')<card.indexOf('stat-visual'));
  assert.ok(card.includes('renderStatRadar(build.baseStats,build.effectiveStats)'));
  assert.match(card,/pokemon-subtitle.*?build\.nature.*?build\.role\.primary\.name.*?build\.ability\.name/);
  assert.doesNotMatch(card,/stat-details|statRows\(|Detailed stats|elemental-stage|creature-glyph|identity-strip/);
});

test('radar polygons reject missing or out-of-range base stats', () => {
  assert.throws(()=>radarPolygon([50,50]),/six stats/);
  assert.throws(()=>renderStatRadar({hp:100}),/six valid base stats/);
  assert.throws(()=>renderStatRadar({hp:100,atk:100,def:100,spa:100,spd:100,spe:158}),/six valid base stats/);
  assert.equal(radarPolygon(Array(6).fill(0)).split(' ').length,6);
});
