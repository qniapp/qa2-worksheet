import { norm } from './geometry.mjs';

/* 色（BlockColors.cs の HSV を再現） */
export function hsv(h, s, v) {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  const h2 = n => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return '#' + h2(r) + h2(g) + h2(b);
}

export const GATES = {
  H: { label: 'H', color: hsv(199, 62, 98), axis: [1, 0, 1], angle: 180 },
  X: { label: '+', color: hsv(0, 44, 97),  axis: [1, 0, 0], angle: 180 },
  Y: { label: 'Y', color: hsv(163, 65, 76), axis: [0, 1, 0], angle: 180 },
  Z: { label: 'Z', color: hsv(331, 36, 97), axis: [0, 0, 1], angle: 180 },
  S: { label: 'S', color: hsv(267, 76, 71), axis: [0, 0, 1], angle: 90 },
  T: { label: 'T', color: hsv(268, 55, 42), axis: [0, 0, 1], angle: 45 },
};

export function axisStyle(axis) { // 回転の中心じくの強調色
  const n = norm(axis);
  if (Math.abs(n[0]) > 0.99) return { name: 'x', color: '#f59e0b' };
  if (Math.abs(n[1]) > 0.99) return { name: 'y', color: '#16a34a' };
  if (Math.abs(n[2]) > 0.99) return { name: 'z', color: '#9333ea' };
  return { name: 'ななめ', color: '#0891b2' };
}

export function turnWords(angle) { // 角度→地球の周回量
  if (angle === 45) return '8分の1周';
  if (angle === 90) return '4分の1周';
  if (angle === 180) return '半周';
  if (angle === 360) return 'ひとまわり';
  return `${angle}°`;
}
