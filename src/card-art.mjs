// Lightweight, local SVG artwork for all 18 Pokémon types.
// Ice and Steel are defined below; the other 16 live in type-motifs.mjs.
// The exact same vector illustrations serve the PNG and the live results card.
import { additionalTypeDefinitions, renderAdditionalTypeMotif } from './type-motifs.mjs';

export function cardArtDefinitions() {
  return `
    <linearGradient id="ice-crystal" x1="0%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#e4ffff" stop-opacity=".94"/>
      <stop offset="33%" stop-color="#81d8f4" stop-opacity=".7"/>
      <stop offset="100%" stop-color="#2b7799" stop-opacity=".11"/>
    </linearGradient>
    <linearGradient id="ice-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a1e9ff" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#195577" stop-opacity=".05"/>
    </linearGradient>
    <linearGradient id="steel-face" x1="0%" y1="0%" x2="100%" y2="88%">
      <stop offset="0%" stop-color="#d3e7ed" stop-opacity=".82"/>
      <stop offset="27%" stop-color="#7a98a9" stop-opacity=".58"/>
      <stop offset="68%" stop-color="#344f65" stop-opacity=".62"/>
      <stop offset="100%" stop-color="#142f42" stop-opacity=".19"/>
    </linearGradient>
    <linearGradient id="steel-edge" x1="0%" y1="0%" x2="88%" y2="100%">
      <stop offset="0%" stop-color="#f5ffff" stop-opacity=".67"/>
      <stop offset="100%" stop-color="#50677b" stop-opacity=".17"/>
    </linearGradient>
    <linearGradient id="type-corner-fade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="53%" stop-color="#ffffff" stop-opacity=".72"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="type-corner-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="430" height="430">
      <rect x="0" y="0" width="430" height="430" fill="url(#type-corner-fade)"/>
    </mask>${additionalTypeDefinitions()}`;
}

// Coordinates are corner-relative so the same asset works in either position.
// Higher contrast lives on the outer border, not beneath the central numbers.
const ICE = `
  <g class="type-art-ice">
    <path d="M-12 -10 L175 -10 L58 151 L-12 235 Z" fill="url(#ice-crystal)" opacity=".74"/>
    <path d="M13 -10 L114 -10 L31 229 L-12 282 L-12 165 Z" fill="url(#ice-shadow)" opacity=".75"/>
    <path d="M68 -10 L293 -10 L178 76 L116 190 Z" fill="url(#ice-crystal)" opacity=".63"/>
    <path d="M-12 125 L64 45 L85 184 L-12 369 Z" fill="url(#ice-crystal)" opacity=".7"/>
    <path d="M-12 274 L83 171 L52 330 L-12 419 Z" fill="url(#ice-shadow)" opacity=".48"/>
    <path d="M153 -10 L368 -10 L223 74 Z" fill="url(#ice-shadow)" opacity=".46"/>
    <path d="M90 34 L175 -10 L125 141 L88 188 Z" fill="#c1effd" fill-opacity=".2"/>
    <path d="M68 -10 L293 -10 L178 76 L116 190" stroke="#d9f9ff" stroke-width="2.5" stroke-opacity=".43" fill="none"/>
    <path d="M-12 125 L64 45 L85 184 L-12 369" stroke="#e1fbff" stroke-width="2.4" stroke-opacity=".46" fill="none"/>
    <path d="M17 72 L76 12 M38 123 L59 59 M6 299 L56 216" stroke="#edffff" stroke-width="2" stroke-opacity=".58" fill="none"/>
    <path d="M216 54 L234 50 L229 69 L215 74 Z M120 189 L132 177 L140 193 L126 202 Z M49 362 L64 350 L70 370 L52 379 Z" fill="#bff5ff" fill-opacity=".41"/>
    <path d="M313 18 L319 32 M311 31 L326 22 M195 128 L204 144 M196 141 L212 133" stroke="#c5f8ff" stroke-width="1.5" stroke-opacity=".5"/>
  </g>`;

const STEEL = `
  <g class="type-art-steel">
    <path d="M-18 -12 L145 -12 L75 351 L-18 411 Z" fill="url(#steel-face)" opacity=".84"/>
    <path d="M145 -12 L187 -12 L98 315 L75 351 Z" fill="#b8d1da" fill-opacity=".32"/>
    <path d="M-12 138 L199 -12 L295 -12 L-12 231 Z" fill="url(#steel-face)" opacity=".75"/>
    <path d="M-12 215 L299 -12 L345 -12 L-12 274 Z" fill="#1a3449" fill-opacity=".53"/>
    <path d="M-12 13 L218 -12 L242 22 L-12 97 Z" fill="url(#steel-edge)" opacity=".72"/>
    <path d="M-12 87 L221 11 L245 34 L-12 124 Z" fill="#183346" fill-opacity=".62"/>
    <path d="M35 -12 L83 -12 L-12 330 L-12 230 Z" fill="url(#steel-edge)" opacity=".45"/>
    <path d="M-12 138 L199 -12 M-12 215 L299 -12 M-12 13 L218 -12" stroke="#d6e7ec" stroke-opacity=".36" stroke-width="3" fill="none"/>
    <path d="M145 -12 L75 351 M187 -12 L98 315" stroke="#2e4a5e" stroke-opacity=".62" stroke-width="3" fill="none"/>
    <path d="M-12 231 L295 -12 L345 -12" stroke="#c5d8df" stroke-opacity=".25" stroke-width="2.5" fill="none"/>
    <g fill="#c8d9de" fill-opacity=".64" stroke="#233b49" stroke-width="1.2">
      <circle cx="36" cy="64" r="4"/><circle cx="89" cy="47" r="4"/><circle cx="142" cy="30" r="4"/>
      <circle cx="17" cy="163" r="4"/><circle cx="74" cy="119" r="4"/><circle cx="132" cy="74" r="4"/>
      <circle cx="59" cy="236" r="4"/><circle cx="88" cy="132" r="4"/>
    </g>
  </g>`;

function motif(type) {
  if(type==='Ice')return ICE;
  if(type==='Steel')return STEEL;
  return renderAdditionalTypeMotif(type);
}

export function renderTypeCornerArtwork(types) {
  if(!Array.isArray(types)||types.length<1||types.length>2) return '';
  const first=motif(types[0]);
  const second=motif(types[1]||types[0]);
  // A type can be used in either corner; monotypes use it twice. The
  // bottom-right composition is rotated rather than stored as another asset.
  const primary=first?`<g class="type-corner type-corner-primary" transform="translate(28 25)" mask="url(#type-corner-mask)">${first}</g>`:'';
  const secondary=second?`<g class="type-corner type-corner-secondary" transform="translate(932 1674) rotate(180)" mask="url(#type-corner-mask)">${second}</g>`:'';
  return primary+secondary;
}

// Broad, monochrome silhouettes share Tank's scale, opacity and position.
// Hybrid builds use the primary role, so exactly one emblem is displayed.
export const BATTLE_ROLE_NAMES=Object.freeze([
  'Sweeper','Tank','Wall','Pivot','Support','Controller'
]);

const OTHER_ROLE_MARKS=Object.freeze({
  Sweeper: `
    <path d="M-154 -163 L-115 -178 L25 -21 L159 133 L128 162 L-24 29 Z"
      fill="#bdd6cf" fill-opacity=".24" stroke-width="7" stroke-linejoin="round"/>
    <path d="M154 -163 L115 -178 L-25 -21 L-159 133 L-128 162 L24 29 Z"
      fill="#bdd6cf" fill-opacity=".24" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-153 -169 L-105 -192 L-92 -132 L-126 -109 Z M153 -169 L105 -192 L92 -132 L126 -109 Z"
      fill="#cfe5db" fill-opacity=".27" stroke-width="6"/>
    <path d="M-161 131 L-103 190 M-125 143 L-89 178 M161 131 L103 190 M125 143 L89 178"
      stroke-width="11" stroke-linecap="round"/>
    <path d="M-191 -36 L-113 -36 M113 -36 L191 -36 M-166 5 L-125 5 M125 5 L166 5"
      stroke-width="8" stroke-linecap="round" stroke-opacity=".68"/>
    <path d="M-35 -25 L0 -59 L35 -25 L0 9 Z"
      fill="#cee9df" fill-opacity=".23" stroke-width="7"/>
  `,
  Wall: `
    <path d="M-190 -120 H-137 V-176 H-78 V-120 H-29 V-176 H29 V-120 H78 V-176 H137 V-120 H190 V158 H-190 Z"
      fill="#b1d0ca" fill-opacity=".24" stroke-width="15" stroke-linejoin="round"/>
    <path d="M-170 -85 H170 M-170 8 H170 M-170 95 H170"
      stroke-width="9" stroke-opacity=".69"/>
    <path d="M-115 -85 V8 M-25 -85 V8 M75 -85 V8 M125 8 V95 M30 8 V95 M-72 8 V95"
      stroke-width="7" stroke-opacity=".55"/>
    <path d="M-59 158 V73 Q-59 18 0 18 Q59 18 59 73 V158"
      fill="#0f2630" fill-opacity=".56" stroke-width="12"/>
    <path d="M-178 178 H178" stroke-width="15" stroke-linecap="square"/>
  `,
  Pivot: `
    <path d="M-135 -78 A156 156 0 0 1 134 -94" stroke-width="22" stroke-linecap="round"/>
    <path d="M131 -146 L168 -82 L101 -70" stroke-width="20" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M135 80 A156 156 0 0 1 -134 94" stroke-width="22" stroke-linecap="round"/>
    <path d="M-131 146 L-168 82 L-101 70" stroke-width="20" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="82" stroke-width="5" stroke-opacity=".52"/>
    <path d="M-45 0 H45 M20 -25 L45 0 L20 25 M-20 25 L-45 0 L-20 -25"
      stroke-width="11" stroke-linejoin="round" stroke-linecap="round" stroke-opacity=".77"/>
  `,
  Support: `
    <circle cx="0" cy="0" r="160" stroke-width="12" stroke-opacity=".62"/>
    <circle cx="0" cy="0" r="119" stroke-width="5" stroke-opacity=".55"/>
    <path d="M0 -126 L35 -36 L126 0 L35 36 L0 126 L-35 36 L-126 0 L-35 -36 Z"
      fill="#cfe9dd" fill-opacity=".22" stroke-width="11" stroke-linejoin="round"/>
    <path d="M0 -209 V-178 M0 178 V209 M-209 0 H-178 M178 0 H209"
      stroke-width="13" stroke-linecap="round"/>
    <path d="M-139 -139 L-158 -158 M139 139 L158 158 M139 -139 L158 -158 M-139 139 L-158 158"
      stroke-width="10" stroke-linecap="round" stroke-opacity=".74"/>
    <circle cx="0" cy="0" r="24" fill="#d8eee4" fill-opacity=".35" stroke-width="8"/>
  `,
  Controller: `
    <circle cx="0" cy="0" r="170" stroke-width="10" stroke-opacity=".61"/>
    <circle cx="0" cy="0" r="120" stroke-width="9"/>
    <circle cx="0" cy="0" r="67" stroke-width="8" stroke-opacity=".76"/>
    <path d="M0 -211 V-117 M0 117 V211 M-211 0 H-117 M117 0 H211"
      stroke-width="9" stroke-linecap="round"/>
    <path d="M-125 -125 L-72 -72 M125 125 L72 72 M125 -125 L72 -72 M-125 125 L-72 72"
      stroke-width="7" stroke-opacity=".67"/>
    <path d="M0 -27 L27 0 L0 27 L-27 0 Z"
      fill="#cfe9df" fill-opacity=".31" stroke-width="7"/>
    <path d="M-44 -173 A179 179 0 0 1 44 -173 M-44 173 A179 179 0 0 0 44 173"
      stroke-width="16" stroke-linecap="round" stroke-opacity=".73"/>
  `
});

export function renderRoleWatermark(role) {
  if(role!=='Tank') {
    if(!Object.hasOwn(OTHER_ROLE_MARKS,role))return '';
    return '<g class="role-watermark role-watermark-'+role.toLowerCase()+
      '" transform="translate(480 706)" opacity=".072" fill="none" stroke="#cee9df">'+
      OTHER_ROLE_MARKS[role]+'</g>';
  }
  // Retain the original Tank fortress-shield design unchanged.
  return `<g class="role-watermark role-watermark-tank" transform="translate(480 706)" opacity=".072" fill="none" stroke="#cee9df">
    <path d="M0 -244 L196 -177 L191 31 Q170 168 0 248 Q-170 168 -191 31 L-196 -177 Z"
      stroke-width="17" stroke-linejoin="round" fill="#9dbdb8" fill-opacity=".35"/>
    <path d="M0 -203 L149 -151 L146 21 Q131 132 0 196 Q-131 132 -146 21 L-149 -151 Z"
      stroke-width="6"/>
    <path d="M-87 -65 L-87 -110 L-44 -110 L-44 -89 L-17 -89 L-17 -120 L17 -120 L17 -89 L44 -89 L44 -110 L87 -110 L87 -65"
      stroke-width="13" stroke-linejoin="miter"/>
    <path d="M-76 -45 H76 V72 H-76 Z" fill="#b1d0ca" fill-opacity=".22" stroke-width="10"/>
    <path d="M-10 72 V-4 Q0 -23 10 -4 V72" stroke-width="10" stroke-linejoin="round"/>
  </g>`;
}


/**
 * The results page uses the same 18 type motifs as the PNG, positioned
 * independently at the corners of a responsive HTML card. Both SVG roots get
 * unique paint IDs so gradients and masks never collide in the DOM.
 */
function scopedArt(markup,namespace) {
  return markup
    .replace(/id="([a-z][a-z0-9-]+)"/g,(_,id)=>'id="'+namespace+id+'"')
    .replace(/url\(#([a-z][a-z0-9-]+)\)/g,(_,id)=>'url(#'+namespace+id+')');
}

export function renderLiveCornerArtwork(types) {
  if(!Array.isArray(types)||types.length<1||types.length>2)return '';
  const elements=[
    ['primary',types[0]],
    ['secondary',types[1]||types[0]]
  ];
  return elements.map(([corner,type])=>{
    const artwork=motif(type);
    if(!artwork)return '';
    const prefix='live-'+corner+'-';
    const defs=scopedArt(cardArtDefinitions(),prefix);
    const content=scopedArt(artwork,prefix);
    return '<svg xmlns="http://www.w3.org/2000/svg" class="result-art-corner result-art-'+corner+
      '" viewBox="0 0 430 430" aria-hidden="true" focusable="false">'+
      '<defs>'+defs+'</defs><g mask="url(#'+prefix+'type-corner-mask)">'+content+'</g></svg>';
  }).join('');
}

export function renderLiveRoleWatermark(role) {
  const artwork=renderRoleWatermark(role);
  if(!artwork)return '';
  // Crop and center the exact same silhouette used by the PNG exporter.
  return '<svg xmlns="http://www.w3.org/2000/svg" class="stat-role-watermark" '+
    'viewBox="250 440 460 530" aria-hidden="true" focusable="false">'+
    artwork+'</svg>';
}
