import { depth, norm, project } from './geometry.mjs';

export const fmt = n => (Math.round(n * 100) / 100);

export function arrowhead(tip, dir, size, color) {
  const d = norm([dir[0], dir[1], 0]), px = -d[1], py = d[0];
  const length = size * 1.22, half = size * 0.38;
  const a = [tip[0] - d[0] * length + px * half, tip[1] - d[1] * length + py * half];
  const b = [tip[0] - d[0] * length - px * half, tip[1] - d[1] * length - py * half];
  return `<path d="M${fmt(tip[0])},${fmt(tip[1])} L${fmt(a[0])},${fmt(a[1])} L${fmt(b[0])},${fmt(b[1])} Z" fill="${color}"/>`;
}

export function insetFromTip(tip, dir, amount) {
  const d = norm([dir[0], dir[1], 0]);
  return [tip[0] - d[0] * amount, tip[1] - d[1] * amount];
}

export function arcSegments(fn, cx, cy, R, steps = 64) {
  const pts = [];
  for (let i = 0; i <= steps; i++) { const p = fn(i / steps); pts.push({ s: project(p, cx, cy, R), back: depth(p) < 0 }); }
  const segs = []; let cur = null;
  for (const pt of pts) { if (!cur || cur.back !== pt.back) { cur = { back: pt.back, pts: [] }; segs.push(cur); } cur.pts.push(pt.s); }
  return segs;
}

export const polyline = (pts, attrs) => `<polyline points="${pts.map(p => `${fmt(p[0])},${fmt(p[1])}`).join(' ')}" fill="none" ${attrs}/>`;
