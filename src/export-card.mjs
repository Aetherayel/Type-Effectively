import { STAT_KEYS, STAT_NAMES, TYPE_COLORS } from './data.mjs';
import { level100Stats, TRAINING_IV, USABLE_EV_BUDGET, validTrainingEvs } from './ev-training.mjs';
import { renderStatRadar } from './radar.mjs?v=semantic-v3-1';
import { loadItemSprite } from './item-sprites.mjs';
import { cardArtDefinitions, renderTypeCornerArtwork, renderRoleWatermark } from './card-art.mjs?v=role-emblems-1';
import { cardVersionLabels } from './build-version.mjs';

// Independent vector artwork; this never serializes the questionnaire, share
// URL fragment, raw test scores or the current browser DOM.
export const CARD_WIDTH = 960;
export const CARD_HEIGHT = 1700;

const esc = value => String(value).replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
}[char]));

// SVG has no automatic wrapping. Use line-broken tspans rather than a
// foreignObject, which would be unreliable in canvas exports on mobile.
function wrapText(value,maxCharacters=76) {
  const words=String(value).split(/\s+/);
  const lines=[];
  let line='';
  for(const word of words) {
    if(line && (line.length+1+word.length)>maxCharacters) {
      lines.push(line);
      line=word;
    } else line=line?line+' '+word:word;
  }
  if(line)lines.push(line);
  return lines;
}
function svgLines(value,{x=76,y,size=18,lineHeight=26,maxCharacters=76,fill='#c5dbd2',weight=400,italic=false}) {
  return '<text font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'"'+
    (italic?' font-style="italic"':'')+'>'+
    wrapText(value,maxCharacters).map((line,i)=>
      '<tspan x="'+x+'" y="'+(y+i*lineHeight)+'">'+esc(line)+'</tspan>'
    ).join('')+'</text>';
}

// Only high/low signals (not raw Big Five values) appear on exported cards.
// H = input score >= 50, L = below 50. Null means no measured OCEAN data.
export function oceanHeaderText(build) {
  const flags=build.oceanBinary;
  if(flags==null)return 'OCEAN · Estimated';
  if(!Array.isArray(flags)||flags.length!==5||flags.some(value=>value!==0&&value!==1)) {
    throw new Error('The OCEAN card header needs five binary flags.');
  }
  return ['O','C','E','A','N'].map((label,i)=>label+':'+(flags[i]===1?'H':'L')).join(' · ');
}

function typeBadges(types) {
  let x=76;
  return types.map(type=>{
    const width=42+type.length*15;
    const markup='<rect x="'+x+'" y="246" rx="8" width="'+width+'" height="42" fill="'+TYPE_COLORS[type]+'"/>'+
      '<text x="'+(x+width/2)+'" y="274" text-anchor="middle" class="type-text">'+esc(type.toUpperCase())+'</text>';
    x+=width+12;
    return markup;
  }).join('');
}

function moveTiles(moves) {
  if(!Array.isArray(moves)||moves.length!==4||moves.some(move=>!move?.name))
    throw new Error('The export needs four signature moves.');
  return moves.map((move,i)=>{
    const x=76+(i%2)*409, y=1251+Math.floor(i/2)*91;
    const category=String(move.category||'').toUpperCase();
    const label=category.length>28?category.slice(0,27)+'…':category;
    return '<rect x="'+x+'" y="'+y+'" width="399" height="80" rx="11" fill="#1b3034" stroke="#3b5854"/>'+
      '<text x="'+(x+18)+'" y="'+(y+24)+'" font-size="13" font-weight="700" letter-spacing="1" fill="#9eb9b0">'+esc(label)+'</text>'+
      svgLines(move.name,{x:x+18,y:y+54,maxCharacters:26,size:24,fill:'#f1faf4',weight:700});
  }).join('');
}


function trainedStatsPanel(build, evs) {
  // Use original base stats: effectiveStats already include Nature for personality roles.
  const trained=level100Stats(build.baseStats, build.natureBoost, build.natureDrop, evs);
  const spent=evs.reduce((total,value)=>total+value,0);
  const rows=STAT_KEYS.map((key,index)=>{
    const y=501+index*72;
    const base=build.baseStats[key];
    const ev=evs[index];
    const final=trained[key];
    const natureColor=key===build.natureBoost?'#cff39a':key===build.natureDrop?'#ffc5ad':'#f0f9f0';
    return '<rect x="76" y="'+y+'" width="808" height="62" rx="10" fill="#1b3034" stroke="#395653"/>'+
      '<text x="97" y="'+(y+38)+'" font-size="21" font-weight="700" fill="#e9f7f2">'+esc(STAT_NAMES[index])+'</text>'+
      '<rect x="285" y="'+(y+42)+'" width="123" height="6" rx="3" fill="#355055"/>'+
      '<rect x="285" y="'+(y+42)+'" width="'+(123*Math.min(150,base)/150).toFixed(1)+'" height="6" rx="3" fill="#8bc9c4"/>'+
      '<text x="477" y="'+(y+39)+'" text-anchor="end" font-size="27" font-weight="700" fill="#bde2d9">'+base+'</text>'+
      '<text x="646" y="'+(y+39)+'" text-anchor="end" font-size="23" font-weight="700" fill="#cbe8b3">'+ev+'</text>'+
      '<text x="860" y="'+(y+40)+'" text-anchor="end" font-size="32" font-weight="800" fill="'+natureColor+'">'+final+'</text>';
  }).join('');
  return '<text x="76" y="399" class="overline">TRAINED STATS</text>'+
    '<text x="882" y="399" text-anchor="end" class="overline">LEVEL 100 · 31 IVs</text>'+
    '<text x="76" y="440" font-size="19" fill="#bdd4ca">PERSONALITY SETS THE BASE. TRAINING SHAPES THE RESULT.</text>'+
    '<text x="97" y="486" font-size="15" font-weight="700" fill="#a4bbb1">STAT</text>'+
    '<text x="477" y="486" text-anchor="end" font-size="15" font-weight="700" fill="#a4bbb1">BASE</text>'+
    '<text x="646" y="486" text-anchor="end" font-size="15" font-weight="700" fill="#a4bbb1">EVs</text>'+
    '<text x="860" y="486" text-anchor="end" font-size="15" font-weight="700" fill="#a4bbb1">LV. 100</text>'+
    rows+
    '<rect x="76" y="955" width="808" height="93" rx="12" fill="#183330" stroke="#537968"/>'+
    '<text x="100" y="986" font-size="17" font-weight="700" fill="#c6e2bc">'+
      esc(build.nature)+' NATURE · +10% '+esc(build.natureBoost.toUpperCase())+
      ' / −10% '+esc(build.natureDrop.toUpperCase())+'</text>'+
    '<text x="100" y="1020" font-size="17" fill="#a2c1b3">IVs: '+TRAINING_IV+' EACH · EVs: '+spent+' / '+USABLE_EV_BUDGET+' USEFUL</text>';
}

export function buildCardSvg(build, trainingEvs = null) {
  if (!build || !Array.isArray(build.types) || !build.types.length ||
      build.types.length>2 || build.types.some(type=>!TYPE_COLORS[type])) {
    throw new Error('Cannot export a build without valid Pokémon typing.');
  }
  if(!build.heldItem?.name || !build.heldItem?.quip ||
      !build.ability?.name || !build.hiddenAbility) {
    throw new Error('Cannot export a build without its abilities and held item.');
  }
  if(trainingEvs!==null && !validTrainingEvs(trainingEvs))
    throw new Error('Cannot export an invalid trained EV spread.');
  // Personality cards retain their exact radar layout; trained cards replace it with a readable table.
  const radar=trainingEvs===null?renderStatRadar(build.baseStats,build.effectiveStats)
    .replace('<svg class="stat-radar"','<svg x="145" y="386" width="670" height="627" class="stat-radar"'):null;
  const statsPanel=trainingEvs===null?
    '<text x="76" y="399" class="overline">BASE STATS</text>'+
    '<text x="882" y="399" text-anchor="end" class="overline">600 BST</text>'+
    radar+
    '<text x="480" y="1052" text-anchor="middle" font-size="18" fill="#a9c2ba">'+
      esc(build.nature)+' Nature · +10% '+esc(build.natureBoost.toUpperCase())+
      ' / −10% '+esc(build.natureDrop.toUpperCase())+'</text>':
    trainedStatsPanel(build,trainingEvs);

  const p=TYPE_COLORS[build.types[0]],s=TYPE_COLORS[build.types[1]||build.types[0]];
  const role=build.role.primary.name+(build.role.secondary?' / '+build.role.secondary.name:'');
  const identity=build.identity+' · #'+build.tritype;
  const versionLabels=cardVersionLabels(build);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="type-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p}"/>
      <stop offset="100%" stop-color="${s}"/>
    </linearGradient>
    <linearGradient id="base-card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1b3035"/>
      <stop offset="100%" stop-color="#111e23"/>
    </linearGradient>
    <clipPath id="rounded-card"><rect x="28" y="25" width="904" height="1649" rx="30"/></clipPath>
    ${cardArtDefinitions()}
  </defs>
  <style>
    text{font-family:Arial,Helvetica,sans-serif}
    .overline{font-size:18px;font-weight:700;letter-spacing:2px;fill:#a6beb8}
    .title{font-size:58px;font-weight:800;letter-spacing:-2px;fill:#f3fbf7}
    .type-text{font-size:20px;font-weight:800;fill:#102126}
    .stat-radar-ring{fill:none;stroke:#accbcb;stroke-opacity:.24;stroke-width:1}
    .stat-radar-outer{stroke-opacity:.44}
    .stat-radar-axis{stroke:#accbcb;stroke-opacity:.3;stroke-width:1}
    .stat-radar-shape{fill:${p};fill-opacity:.26;stroke:#c6e9e4;stroke-width:2.4;stroke-linejoin:round}
    .stat-radar-point{fill:#e8fcf7;stroke:#163139;stroke-width:1.5}
    .stat-radar-label{text-anchor:middle}
    .stat-radar-label-name{font-size:12px;font-weight:700;fill:#d9eeea}
    .stat-radar-label-effective,.stat-radar-label-single{font-size:14px;font-weight:800;fill:#fff}
    .stat-radar-label-effective.stat-boost{fill:#c9f68a}
    .stat-radar-label-effective.stat-drop{fill:#ffb998}
    .stat-radar-label-base{font-size:11px;fill:#9db9b1}
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#0b161b"/>
  <rect x="28" y="25" width="904" height="1649" rx="30" fill="url(#base-card)" stroke="#41605a" stroke-width="2"/>
  <g clip-path="url(#rounded-card)">
    <rect x="28" y="25" width="904" height="16" fill="url(#type-gradient)"/>
    ${renderTypeCornerArtwork(build.types)}
    ${renderRoleWatermark(build.role.primary.name)}
  </g>
  <text x="76" y="105" class="overline">TYPE EFFECTIVELY</text>
  ${build.isSample===true?'<text x="76" y="140" font-size="16" font-weight="700" fill="#d9f375">RANDOM SAMPLE · SYNTHETIC SCORES</text>':''}
  <text x="878" y="105" text-anchor="end" class="overline">${esc(identity)}</text>
  <text x="878" y="140" text-anchor="end" font-size="19" font-family="monospace" font-weight="500" fill="#9fbcb4">${esc(oceanHeaderText(build))}</text>
  <text x="76" y="192" class="title">${esc(build.title)}</text>
  ${typeBadges(build.types)}
  <rect x="596" y="244" width="288" height="48" rx="9" fill="#20333a" stroke="#65877e" stroke-opacity=".7"/>
  <text x="611" y="261" font-size="11" font-weight="700" letter-spacing="1" fill="#9eb9b0">BATTLE ROLE</text>
  <text x="611" y="283" font-size="19" font-weight="700" fill="#edf9f2">${esc(role)}</text>
  <line x1="76" x2="884" y1="364" y2="364" stroke="#4b6964"/>
  ${statsPanel}
  <line x1="76" x2="884" y1="1073" y2="1073" stroke="#4b6964"/>
  <text x="76" y="1106" class="overline">ABILITIES</text>
  <rect x="76" y="1122" width="395" height="81" rx="11" fill="#1b3034" stroke="#3b5854"/>
  <rect x="487" y="1122" width="397" height="81" rx="11" fill="#1b3034" stroke="#3b5854"/>
  <text x="96" y="1149" font-size="13" letter-spacing="1" fill="#9eb9b0">STANDARD</text>
  <text x="507" y="1149" font-size="13" letter-spacing="1" fill="#9eb9b0">HIDDEN</text>
  <text x="96" y="1183" font-size="26" font-weight="700" fill="#f1faf4">${esc(build.ability.name)}</text>
  <text x="507" y="1183" font-size="26" font-weight="700" fill="#f1faf4">${esc(build.hiddenAbility)}</text>
  <text x="76" y="1238" class="overline">SIGNATURE MOVES</text>
  ${moveTiles(build.moves)}
  <text x="76" y="1459" class="overline">HELD ITEM</text>
  <rect x="76" y="1477" width="808" height="119" rx="13" fill="#1e322e" stroke="#4d7361"/>
  <rect x="89" y="1490" width="82" height="82" rx="11" fill="#12282b" stroke="#426859"/>
  <text x="130" y="1547" text-anchor="middle" font-size="45" fill="#93b89f">◇</text>
  <text x="192" y="1521" font-size="31" font-weight="700" fill="#f1faf1">${esc(build.heldItem.name)}</text>
  ${svgLines('“'+build.heldItem.quip+'”',{x:192,y:1557,maxCharacters:65,size:18,lineHeight:23,fill:'#d6edda',italic:true})}
  <line x1="76" x2="884" y1="1612" y2="1612" stroke="#4b6964"/>
  <text x="76" y="1640" font-size="17" font-weight="700" fill="#d2e5dd">aetherayel.github.io/Type-Effectively/</text>
  <text x="76" y="1661" font-size="12" fill="#8da69e">Unofficial fan project · OCEAN shown only as high / low</text>
  <text x="884" y="1640" text-anchor="end" font-family="monospace" font-size="16" font-weight="700" fill="#d2e5dd">${esc(versionLabels.created)}</text>
  ${versionLabels.recalculated?'<text x="884" y="1661" text-anchor="end" font-family="monospace" font-size="12" fill="#9fbcb4">'+esc(versionLabels.recalculated)+'</text>':''}
</svg>`;
}

// A trained card intentionally shares the exact same identity, artwork, abilities,
// moves, item and provenance as the personality card. Only its stats panel differs.
export function buildTrainedCardSvg(build, evs) {
  if(!validTrainingEvs(evs))throw new Error('Choose a valid EV spread before exporting.');
  return buildCardSvg(build, evs);
}

// Canvas export avoids screenshot libraries. Only the optional item icon is
// retrieved from the verified PokéAPI sprite library (no user scores sent).
// Returns only after a real PNG blob was produced; callers report failures.
export async function downloadCardPng(build, trainingEvs = null) {
  const spritePromise=loadItemSprite(build.heldItem.name);
  const svg=buildCardSvg(build,trainingEvs);
  const svgUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  const image=new Image();
  try {
    await new Promise((resolve,reject)=>{
      image.onload=resolve;
      image.onerror=()=>reject(new Error('Could not render the card artwork.'));
      image.src=svgUrl;
    });
    const canvas=document.createElement('canvas');
    canvas.width=CARD_WIDTH;
    canvas.height=CARD_HEIGHT;
    const context=canvas.getContext('2d');
    if (!context) throw new Error('Canvas export is unavailable in this browser.');
    context.drawImage(image,0,0,CARD_WIDTH,CARD_HEIGHT);
    // Pixel-art sprite is drawn separately. Remote <image> inside SVG would
    // taint Canvas or be rejected by mobile browsers.
    const sprite=await spritePromise;
    if(sprite) {
      context.imageSmoothingEnabled=false;
      context.drawImage(sprite,96,1497,68,68);
      context.imageSmoothingEnabled=true;
    }
    const png=await new Promise((resolve,reject)=>
      canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed.')),'image/png')
    );
    const pngUrl=URL.createObjectURL(png);
    try {
      const anchor=document.createElement('a');
      anchor.href=pngUrl;
      anchor.download='type-effectively-'+(trainingEvs===null?'':'trained-')+build.types.join('-').toLowerCase()+'-'+build.tritype+(trainingEvs===null?'':'-lv100')+'.png';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      // A delayed revoke permits mobile browsers to finish the download.
      setTimeout(()=>URL.revokeObjectURL(pngUrl),60000);
    }
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadTrainedCardPng(build, evs) {
  if(!validTrainingEvs(evs))throw new Error('Choose a valid EV spread before exporting.');
  return downloadCardPng(build, evs);
}
