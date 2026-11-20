// Parse every browser module before running data-model tests. Importing only
// engine.mjs did not catch the app.mjs syntax error that removed all sliders.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const modules=readdirSync('src').filter(name=>name.endsWith('.mjs'));
for(const name of modules) {
  const file=join('src',name);
  execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
}
console.log('Syntax verified for '+modules.length+' browser modules.');
