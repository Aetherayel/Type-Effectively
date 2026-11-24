import test from 'node:test';
import assert from 'node:assert/strict';
import {generateCompleteBuild} from '../src/engine.mjs';
import {buildCardSvg,buildTrainedCardSvg} from '../src/export-card.mjs';
import {DEMOS} from '../src/data.mjs';
const build=generateCompleteBuild({mbtiScores:DEMOS.architect.mbti,enneagramScores:DEMOS.architect.enneagram,bigFive:DEMOS.architect.bigfive});
test('both export formats preserve synthetic provenance without labeling personal builds',()=>{
  for(const render of [b=>buildCardSvg(b),b=>buildTrainedCardSvg(b,[0,0,0,0,0,0])]){
    assert.match(render({...build,isSample:true}),/RANDOM SAMPLE · SYNTHETIC SCORES/);
    assert.doesNotMatch(render(build),/RANDOM SAMPLE · SYNTHETIC SCORES/);
  }
});
