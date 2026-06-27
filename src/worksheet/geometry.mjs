/* 3D ベクトル & 回転 / 共有カメラ（正射影） */
export const rad = d => (d * Math.PI) / 180;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

export function rotate(v, axis, angle) { // ロドリゲス
  const n = norm(axis), th = rad(angle), c = Math.cos(th), s = Math.sin(th);
  return add(add(scl(v, c), scl(cross(n, v), s)), scl(n, dot(n, v) * (1 - c)));
}

export function makeCamera(azDeg, elDeg = 16) {
  const az = rad(azDeg), el = rad(elDeg);
  const forward = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
  const right = norm(cross([0, 0, 1], forward)), up = cross(forward, right);
  return { forward, right, up };
}

export const CAMERA_FRONT = makeCamera(-90);      // 表紙だけ真正面：顔つきキュービット君をまっすぐ見せる
export const CAMERA_ANGLED = makeCamera(-58);    // 本文：xじくが右下に傾く、以前の見やすい角度
let ACTIVE_CAMERA = CAMERA_ANGLED;

export function withCamera(camera, render) {
  const prev = ACTIVE_CAMERA;
  ACTIVE_CAMERA = camera;
  try { return render(); } finally { ACTIVE_CAMERA = prev; }
}

export const project = (p, cx, cy, R) => [cx + R * dot(p, ACTIVE_CAMERA.right), cy - R * dot(p, ACTIVE_CAMERA.up)];
export const depth = p => dot(p, ACTIVE_CAMERA.forward);
