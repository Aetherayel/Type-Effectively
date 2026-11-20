// Lightweight, local SVG artwork for the first two Pokémon type motifs.
// Designed for the exported 960 × 1700 card; no remote images or pre-rendered
// type combinations are required. Other types intentionally remain unadorned.

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
    </mask>`;
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
  return '';
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

export function renderRoleWatermark(role) {
  // The Tank prototype uses a fortress shield. Other roles get no emblem
  // until their silhouettes have been designed and reviewed.
  if(role!=='Tank')return '';
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
