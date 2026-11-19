import { TYPE_COLORS } from './data.mjs';
import { renderStatRadar } from './radar.mjs';

// Independent vector artwork; this never serializes the questionnaire, share
// URL fragment, raw test scores or the current browser DOM.
export const CARD_WIDTH = 960;
export const CARD_HEIGHT = 1320;

const esc = value => String(value).replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
}[char]));

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

export function buildCardSvg(build) {
  if (!build || !Array.isArray(build.types) || !build.types.length ||
      build.types.length>2 || build.types.some(t=>!TYPE_COLORS[t])) {
    throw new Error('Cannot export a build without valid Pokémon typing.');
  }
  // The stat renderer validates each numerical value and gives all six
  // axes the same arrangement as the onscreen card.
  const embeddedRadar=renderStatRadar(build.baseStats,build.effectiveStats)
    .replace('<svg class="stat-radar"','<svg x="90" y="426" width="780" height="730" class="stat-radar"');

  const p=TYPE_COLORS[build.types[0]],s=TYPE_COLORS[build.types[1]||build.types[0]];
  const role=build.role.primary.name+(build.role.secondary?' / '+build.role.secondary.name:'');
  const identity=build.identity+' · #'+build.tritype;
  const footer='Unofficial fan project · No questionnaire scores included';
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
    <clipPath id="rounded-card"><rect x="28" y="25" width="904" height="1270" rx="30"/></clipPath>
  </defs>
  <style>
    text{font-family:Arial,Helvetica,sans-serif}
    .overline{font-size:18px;font-weight:700;letter-spacing:2px;fill:#a6beb8}
    .title{font-size:58px;font-weight:800;letter-spacing:-2px;fill:#f3fbf7}
    .subline{font-size:23px;font-weight:500;fill:#c6d9d3}
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
  <rect x="28" y="25" width="904" height="1270" rx="30" fill="url(#base-card)" stroke="#41605a" stroke-width="2"/>
  <g clip-path="url(#rounded-card)">
    <rect x="28" y="25" width="904" height="16" fill="url(#type-gradient)"/>
  </g>
  <text x="76" y="105" class="overline">TYPE EFFECTIVELY</text>
  <text x="878" y="105" text-anchor="end" class="overline">${esc(identity)}</text>
  <text x="76" y="192" class="title">${esc(build.title)}</text>
  ${typeBadges(build.types)}
  <text x="76" y="333" class="subline">${esc(build.nature)} · ${esc(role)} · ${esc(build.ability.name)}</text>
  <line x1="76" x2="884" y1="364" y2="364" stroke="#4b6964"/>
  <text x="76" y="412" class="overline">BASE STATS</text>
  <text x="882" y="412" text-anchor="end" class="overline">535 BST</text>
  ${embeddedRadar}
  <text x="480" y="1203" text-anchor="middle" font-size="18" fill="#a9c2ba">${esc(build.nature)} Nature · +10% ${esc(build.natureBoost.toUpperCase())} / −10% ${esc(build.natureDrop.toUpperCase())}</text>
  <line x1="76" x2="884" y1="1230" y2="1230" stroke="#4b6964"/>
  <text x="76" y="1267" font-size="17" font-weight="700" fill="#d2e5dd">aetherayel.github.io/Type-Effectively/</text>
  <text x="884" y="1267" text-anchor="end" font-size="11" fill="#8da69e">${esc(footer)}</text>
</svg>`;
}

// Native browser Canvas export avoids DOM screenshot libraries or remote assets.
// Returns only after a real PNG blob was produced; callers report failures.
export async function downloadCardPng(build) {
  const svg=buildCardSvg(build);
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
    const png=await new Promise((resolve,reject)=>
      canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed.')),'image/png')
    );
    const pngUrl=URL.createObjectURL(png);
    try {
      const anchor=document.createElement('a');
      anchor.href=pngUrl;
      anchor.download='type-effectively-'+build.types.join('-').toLowerCase()+'-'+build.tritype+'.png';
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
