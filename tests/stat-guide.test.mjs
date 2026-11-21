import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const stylesheet=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const exportModule=readFileSync(new URL('../src/export-card.mjs',import.meta.url),'utf8');

test('interpretation guide is a static site section after results, before footer',()=>{
  const workspace=page.indexOf('<div class="workspace">');
  const endWorkspace=page.indexOf('    </div>\n    <section class="stat-guide"');
  const section=page.indexOf('<section class="stat-guide" id="understanding-stats"');
  const footer=page.indexOf('<footer class="footer">');
  assert.ok(workspace>=0);
  assert.ok(endWorkspace>workspace,'guide should be outside the workspace, not embedded in a generated result');
  assert.ok(section>workspace && section<footer,'guide should sit below results, above footer');
  assert.ok(page.includes('href="#understanding-stats"'),'result area should link to the explanation');
  assert.ok(page.includes('aria-labelledby="stat-guide-title"'));
  assert.ok(!page.includes('<details class="stat-guide"'),'reference should be accessible without expanding or generating a build');
});

test('all six Pokémon stats have clear human-facing interpretations',()=>{
  const guide=page.slice(page.indexOf('<section class="stat-guide"'),page.indexOf('<footer class="footer">'));
  for(const [code,interpretation] of [
    ['HP','Resilience'],
    ['ATK','Assertiveness'],
    ['DEF','Discipline'],
    ['SP. ATK','Creative analysis'],
    ['SP. DEF','Composure'],
    ['SPEED','Energy']
  ]) {
    assert.ok(guide.includes('>'+code+'</span>'),code+' label missing');
    assert.ok(guide.includes(interpretation),interpretation+' interpretation missing');
  }
  assert.equal((guide.match(/class="stat-guide-stat"/g)||[]).length,6);
  assert.ok(guide.includes('535 base stat points'));
  assert.ok(guide.includes('70% Big Five'));
  assert.ok(guide.includes('20% Enneagram'));
  assert.ok(guide.includes('10% cognitive-style'));
  assert.ok(guide.includes('raises one non-HP stat by 10%'));
  assert.ok(guide.includes('Neuroticism'));
  assert.ok(guide.includes('score of 50 or higher'));
  assert.ok(guide.includes('not validated measures'));
});

test('guide is responsive and not included in downloadable PNG',()=>{
  assert.ok(stylesheet.includes('.stat-guide-grid{display:grid'));
  assert.ok(stylesheet.includes('.stat-guide-notes{display:grid'));
  assert.ok(stylesheet.includes('@media(max-width:560px)'));
  assert.ok(!exportModule.includes('Understanding your stats'));
  assert.ok(!exportModule.includes('stat-guide'));
});
