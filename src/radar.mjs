import { STAT_KEYS, STAT_NAMES } from './data.mjs';

// Six evenly spaced axes. Chart positions can differ from the stat table order.
// The reference scale is 140 because the generator caps individual base stats at 140.
export const RADAR_MAX = 140;
export const RADAR_CENTER = Object.freeze({ x: 180, y: 164 });
export const RADAR_RADIUS = 108;
// Clockwise from the top: HP, Attack, Defense, Speed, Sp. Def, Sp. Atk.
export const RADAR_ORDER = [0, 1, 2, 5, 4, 3];

const round = value => Math.round(value * 100) / 100;

export function radarPoint(index, value, radius = RADAR_RADIUS) {
  if (!Number.isInteger(index) || index < 0 || index >= 6) throw new Error('Radar axis must be 0–5.');
  if (!Number.isFinite(value) || value < 0 || value > RADAR_MAX) throw new Error('Radar value must be between 0 and 140.');
  const angle = (-90 + index * 60) * Math.PI / 180;
  const length = radius * value / RADAR_MAX;
  return {
    x: round(RADAR_CENTER.x + Math.cos(angle) * length),
    y: round(RADAR_CENTER.y + Math.sin(angle) * length)
  };
}

export function radarPolygon(values) {
  if (!Array.isArray(values) || values.length !== 6) throw new Error('A radar chart needs six stats.');
  return values.map((value, i) => {
    const { x, y } = radarPoint(i, value);
    return x + ',' + y;
  }).join(' ');
}

const AXIS_LABELS = [
  { x: 180, y: 15 },
  { x: 313, y: 87 },
  { x: 313, y: 230 },
  { x: 180, y: 305 },
  { x: 47, y: 230 },
  { x: 47, y: 87 }
];

export function renderStatRadar(baseStats, effectiveStats = baseStats) {
  const values = RADAR_ORDER.map(index => baseStats?.[STAT_KEYS[index]]);
  if (values.some(value => !Number.isFinite(value) || value < 0 || value > RADAR_MAX)) {
    throw new Error('The radar chart requires six valid base stats.');
  }
  const afterNature = RADAR_ORDER.map(index => effectiveStats?.[STAT_KEYS[index]]);
  // A Nature boost can exceed the 140-point base cap (up to 154); the radar
  // polygon intentionally stays on the fixed 140-point BASE stat scale.
  if (afterNature.some(value => !Number.isInteger(value) || value < 0 || value > 160)) {
    throw new Error('The radar chart requires six valid post-Nature stats.');
  }

  const grid = [35, 70, 105, 140].map((level, i) =>
    '<polygon class="stat-radar-ring'+(i === 3 ? ' stat-radar-outer' : '')+'" points="'+
      radarPolygon(Array(6).fill(level))+'"/>'
  ).join('');

  const axes = values.map((_, i) => {
    const { x, y } = radarPoint(i, RADAR_MAX);
    return '<line class="stat-radar-axis" x1="'+RADAR_CENTER.x+'" y1="'+RADAR_CENTER.y+
      '" x2="'+x+'" y2="'+y+'"/>';
  }).join('');

  const vertices = values.map((value, i) => {
    const { x, y } = radarPoint(i, value);
    return '<circle class="stat-radar-point" cx="'+x+'" cy="'+y+'" r="3.6"/>';
  }).join('');

  const labels = values.map((value, i) => {
    const adjusted = afterNature[i];
    const direction = adjusted > value ? ' stat-boost' : adjusted < value ? ' stat-drop' : '';
    const arrow = adjusted > value ? '↑' : adjusted < value ? '↓' : '';
    return '<g class="stat-radar-label" transform="translate('+AXIS_LABELS[i].x+' '+AXIS_LABELS[i].y+')">'+
      '<text class="stat-radar-label-name" y="-4">'+STAT_NAMES[RADAR_ORDER[i]]+'</text>'+
      '<text class="stat-radar-label-effective'+direction+'" y="11">'+arrow+adjusted+'</text>'+
      '<text class="stat-radar-label-base" y="25">'+value+'</text>'+
    '</g>';
  }).join('');

  const description = RADAR_ORDER.map((index, i) =>
    STAT_NAMES[index] + ': after Nature ' + afterNature[i] + ', base ' + values[i]
  ).join('; ');
  return '<svg class="stat-radar" viewBox="0 0 360 337" xmlns="http://www.w3.org/2000/svg" role="img" '+
    'aria-labelledby="stat-radar-title stat-radar-description">'+
    '<title id="stat-radar-title">Six-stat radar, post-Nature values above base values</title>'+
    '<desc id="stat-radar-description">'+description+'. Base stat polygon scale: zero to 140 on each axis.</desc>'+
    '<g class="stat-radar-grid">'+grid+axes+'</g>'+
    '<polygon class="stat-radar-shape" points="'+radarPolygon(values)+'"/>'+
    '<g class="stat-radar-vertices">'+vertices+'</g>'+
    '<g class="stat-radar-labels">'+labels+'</g>'+
    '</svg>';
}
