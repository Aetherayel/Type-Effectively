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
  const guide=page.slice(page.indexOf('<section class="stat-guide"'),page.indexOf('<details class="facet-panel" id="scoring-lab">'));
  const footnote=page.match(/<p class="stat-guide-footnote">[^<]*<\/p>/)?.[0] ?? '';
  for(const [code,interpretation] of [
    ['HP','Resilience'],
    ['ATK','Assertion'],
    ['DEF','Fortitude'],
    ['SP. ATK','Ingenuity'],
    ['SP. DEF','Composure'],
    ['SPEED','Responsiveness']
  ]) {
    assert.ok(guide.includes('>'+code+'</span>'),code+' label missing');
    assert.ok(guide.includes(interpretation),interpretation+' interpretation missing');
  }
  assert.equal((guide.match(/class="stat-guide-stat"/g)||[]).length,6);
  assert.ok(guide.includes('600 base stat points'));
  assert.ok(guide.includes('Big Five / Enneagram / cognition'));
  assert.ok(guide.includes('5% to 40%'));
  assert.ok(guide.includes('5% to 25%'));
  assert.ok(guide.includes('raises one non-HP stat by 10%'));
  assert.ok(guide.includes('Neuroticism'));
  assert.ok(guide.includes('score of 50 or higher'));
  assert.ok(footnote.includes('not validated measures'));
});

test('guide is responsive and not included in downloadable PNG',()=>{
  assert.ok(stylesheet.includes('.stat-guide-grid{display:grid'));
  assert.ok(stylesheet.includes('.stat-guide-notes{display:grid'));
  assert.ok(stylesheet.includes('@media(max-width:560px)'));
  assert.ok(!exportModule.includes('Understanding your stats'));
  assert.ok(!exportModule.includes('stat-guide'));
});

test('scoring lab is a closed-by-default disclosure within the field guide',()=>{
  const section=page.indexOf('<section class="stat-guide" id="understanding-stats"');
  const lab=page.match(/<details class="facet-panel" id="scoring-lab">([\s\S]*?)<\/details>/);
  assert.ok(lab,'expected a native details element without the open attribute');
  assert.ok(lab.index>section && lab.index<page.indexOf('<footer class="footer">'));
  assert.match(lab[1],/^\s*<summary>[^<]+<\/summary>/);
  assert.equal((lab[1].match(/<h3>0[1-6] \//g)||[]).length,6);
  assert.equal((page.match(/id="scoring-lab"/g)||[]).length,1);
});
