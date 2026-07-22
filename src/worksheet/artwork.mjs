import qrcode from 'qrcode-generator';
import { DECORATION_COPY, LABELS } from '../../content/worksheet-content.mjs';
import { add, cross, dot, len, norm, project, rotate, scl, withCamera } from './geometry.mjs';
import { axisStyle, GATES, hsv, turnWords } from './gates.mjs';
import { furi } from './ruby.mjs';
import { arcSegments, arrowhead, fmt, insetFromTip, polyline } from './svg-primitives.mjs';

/* ===================== globe(): 地球/ブロッホ 共通部品 ===================== */
let UID = 0;
let BID = 0;

export function resetArtworkIds() {
  UID = 0;
  BID = 0;
}

export function globe(opts) {
  if (opts.camera) { const { camera, ...rest } = opts; return withCamera(camera, () => globe(rest)); }
  const { size = 150, skin = 'bloch', state = [0, 0, 1], face = false, spin = null, poleLabels = true, ghostState = null, axisHighlight = null, pathAxis = null, pathAngle = null } = opts;
  const activeAxis = spin?.axis ?? axisHighlight ?? null;
  const activeAxisName = activeAxis ? axisStyle(activeAxis).name : null;
  const W = size, H = size, cx = W / 2, cy = H / 2, R = size * 0.34;
  const id = `g${UID++}`, ink = '#334155', faint = '#94a3b8';
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif">`;
  s += `<defs><radialGradient id="${id}sph" cx="38%" cy="32%" r="75%">` +
       `<stop offset="0%" stop-color="${skin === 'earth' ? '#eaf7ff' : '#f8fafc'}"/>` +
       `<stop offset="100%" stop-color="${skin === 'earth' ? '#cfeaff' : '#e6ebf2'}"/></radialGradient></defs>`;
  const meridians = skin === 'earth' ? 6 : 4, parallels = skin === 'earth' ? 4 : 2;
  for (let m = 0; m < meridians; m++) {
    const ph = (m / meridians) * Math.PI;
    for (const seg of arcSegments(t => { const a = (t - 0.5) * Math.PI, r = Math.cos(a); return [r * Math.cos(ph), r * Math.sin(ph), Math.sin(a)]; }, cx, cy, R, 48))
      s += polyline(seg.pts, `stroke="${faint}" stroke-width="0.7" stroke-opacity="${seg.back ? 0.3 : 0.7}"`);
  }
  for (let pa = 1; pa <= parallels; pa++) {
    const lat = (pa / (parallels + 1) - 0.5) * Math.PI * 0.95;
    for (const seg of arcSegments(t => { const a = t * 2 * Math.PI, r = Math.cos(lat); return [r * Math.cos(a), r * Math.sin(a), Math.sin(lat)]; }, cx, cy, R, 64))
      s += polyline(seg.pts, `stroke="${faint}" stroke-width="0.7" stroke-opacity="${seg.back ? 0.3 : 0.7}"`);
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}sph)" stroke="${ink}" stroke-width="1.6" fill-opacity="0.55"/>`;
  for (const seg of arcSegments(t => { const a = t * 2 * Math.PI; return [Math.cos(a), Math.sin(a), 0]; }, cx, cy, R))
    s += polyline(seg.pts, `stroke="${ink}" stroke-width="1" stroke-opacity="0.5" ${seg.back ? 'stroke-dasharray="3 3"' : ''}`);
  const axisLabelPoint = (axis, gap = 9) => {
    const p = project(norm(axis), cx, cy, R), vx = p[0] - cx, vy = p[1] - cy, d = Math.hypot(vx, vy) || 1;
    const out = [cx + (vx / d) * (R + gap), cy + (vy / d) * (R + gap)], pad = 6;
    return [Math.max(pad, Math.min(W - pad, out[0])), Math.max(pad, Math.min(H - pad, out[1]))];
  };
  const axisEnd = (v, lbl, color, showLabel = true) => {
    const p0 = project(scl(v, -1), cx, cy, R), p1 = project(v, cx, cy, R), out = axisLabelPoint(v);
    return `<line x1="${fmt(p0[0])}" y1="${fmt(p0[1])}" x2="${fmt(p1[0])}" y2="${fmt(p1[1])}" stroke="${color}" stroke-width="1" stroke-opacity="0.6"/>` +
      (showLabel ? `<text x="${fmt(out[0])}" y="${fmt(out[1])}" font-size="10" fill="${color}" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="#fff" stroke-width="2">${lbl}</text>` : '');
  };
  const highlightAxis = (axis, showAxisLabel = true) => {
    const st = axisStyle(axis), an = norm(axis);
    const h0 = project(scl(an, -1.16), cx, cy, R), h1 = project(scl(an, 1.16), cx, cy, R);
    let out = `<line x1="${fmt(h0[0])}" y1="${fmt(h0[1])}" x2="${fmt(h1[0])}" y2="${fmt(h1[1])}" stroke="${st.color}" stroke-width="5.8" stroke-opacity="0.18" stroke-linecap="round"/>`;
    out += `<line x1="${fmt(h0[0])}" y1="${fmt(h0[1])}" x2="${fmt(h1[0])}" y2="${fmt(h1[1])}" stroke="${st.color}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (showAxisLabel) {
      const isDiagonal = st.name === LABELS.diagonalAxisBase, hl = axisLabelPoint(an, isDiagonal ? 7 : 9);
      out += `<text x="${fmt(hl[0])}" y="${fmt(hl[1])}" font-size="${isDiagonal ? 10 : 11}" font-weight="700" fill="${st.color}" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="#fff" stroke-width="2.8">${st.name}</text>`; }
    return out;
  };
  if (skin === 'bloch') { // |0⟩|1⟩ のケット記号は上級者向けなので出さない（地球の方位ばんとして見せる）
    const showDefaultAxisLabels = false;
    if (activeAxisName !== 'x') s += axisEnd([1, 0, 0], 'x', faint, showDefaultAxisLabels);
    if (activeAxisName !== 'y') s += axisEnd([0, 1, 0], 'y', faint, showDefaultAxisLabels);
    if (activeAxisName !== 'z') s += axisEnd([0, 0, 1], 'z', faint, false);
  } else if (poleLabels) {
    const np = project([0, 0, 1.3], cx, cy, R), sp = project([0, 0, -1.34], cx, cy, R);
    s += `<text x="${fmt(np[0])}" y="${fmt(np[1] - 3)}" font-size="9.5" fill="#0369a1" text-anchor="middle">${LABELS.northPole}</text>`;
    s += `<text x="${fmt(np[0])}" y="${fmt(np[1] + 6)}" font-size="6.5" fill="#0369a1" text-anchor="middle">${LABELS.northPoleRuby}</text>`;
    s += `<text x="${fmt(sp[0])}" y="${fmt(sp[1] - 3)}" font-size="9.5" fill="#0369a1" text-anchor="middle">${LABELS.southPole}</text>`;
    s += `<text x="${fmt(sp[0])}" y="${fmt(sp[1] + 6)}" font-size="6.5" fill="#0369a1" text-anchor="middle">${LABELS.southPoleRuby}</text>`;
  }
  if (axisHighlight && !spin) s += highlightAxis(axisHighlight);
  let trajectoryLayer = '';
  if (spin) { // 回転の中心じくを強調 → 軌跡＋矢印
    s += highlightAxis(spin.axis);
    const arrowGap = Math.min(6, Math.abs(spin.angle) * 0.45);
    const drawAngle = spin.angle - Math.sign(spin.angle) * arrowGap;
    const segs = arcSegments(t => rotate(state, spin.axis, drawAngle * t), cx, cy, R, 48);
    for (const seg of segs) trajectoryLayer += polyline(seg.pts, `stroke="#f59e0b" stroke-width="2.4" ${seg.back ? 'stroke-opacity="0.45"' : ''}`);
    const endV = rotate(state, spin.axis, spin.angle), endP = project(endV, cx, cy, R);
    const prevP = project(rotate(state, spin.axis, drawAngle), cx, cy, R);
    trajectoryLayer += arrowhead(endP, [endP[0] - prevP[0], endP[1] - prevP[1], 0], 7, '#f59e0b');
  }
  if (ghostState && len(add(state, scl(ghostState, -1))) > 0.05) {
    const gs = norm(ghostState), en = norm(state), gp = project(gs, cx, cy, R);
    const ghostDir = [gp[0] - cx, gp[1] - cy, 0], ghostLineEnd = insetFromTip(gp, ghostDir, 6);
    s += `<g opacity="0.35"><line x1="${cx}" y1="${cy}" x2="${fmt(ghostLineEnd[0])}" y2="${fmt(ghostLineEnd[1])}" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3"/>${arrowhead(gp, ghostDir, 6, '#64748b')}</g>`;
    let axis = pathAxis ? norm(pathAxis) : cross(gs, en);
    let angleDeg = pathAngle ?? (Math.acos(Math.max(-1, Math.min(1, dot(gs, en)))) * 180 / Math.PI);
    if (len(axis) < 0.01) axis = cross(gs, Math.abs(gs[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]);
    axis = norm(axis);
    const move = t => rotate(gs, axis, angleDeg * t);
    const pathGap = Math.min(6, Math.abs(angleDeg) * 0.45);
    const lineEndT = Math.max(0, (Math.abs(angleDeg) - pathGap) / Math.max(1, Math.abs(angleDeg)));
    for (const seg of arcSegments(t => move(t * lineEndT), cx, cy, R, 40))
      trajectoryLayer += polyline(seg.pts, `stroke="#f59e0b" stroke-width="2.1" stroke-linecap="round" ${seg.back ? 'stroke-opacity="0.35" stroke-dasharray="3 3"' : ''}`);
    const endP = project(en, cx, cy, R), prevP = project(move(lineEndT), cx, cy, R);
    trajectoryLayer += arrowhead(endP, [endP[0] - prevP[0], endP[1] - prevP[1], 0], 6.5, '#f59e0b');
  }
  const tip = project(state, cx, cy, R), stateDir = [tip[0] - cx, tip[1] - cy, 0], shaftTip = insetFromTip(tip, stateDir, 8.2);
  s += `<line x1="${cx}" y1="${cy}" x2="${fmt(shaftTip[0])}" y2="${fmt(shaftTip[1])}" stroke="#fff" stroke-width="5" stroke-opacity="0.75" stroke-linecap="round"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${fmt(shaftTip[0])}" y2="${fmt(shaftTip[1])}" stroke="#dc2626" stroke-width="2.6"/>`;
  s += arrowhead(tip, stateDir, 8, '#dc2626');
  s += trajectoryLayer;
  s += `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#dc2626"/>`;
  if (face) {
    const ex = R * 0.34, ey = cy - R * 0.18, eyeR = R * 0.085;
    s += `<circle cx="${fmt(cx - ex)}" cy="${fmt(ey)}" r="${fmt(eyeR)}" fill="#1f2937"/><circle cx="${fmt(cx + ex)}" cy="${fmt(ey)}" r="${fmt(eyeR)}" fill="#1f2937"/>`;
    s += `<circle cx="${fmt(cx - ex + eyeR*0.35)}" cy="${fmt(ey - eyeR*0.35)}" r="${fmt(eyeR*0.3)}" fill="#fff"/><circle cx="${fmt(cx + ex + eyeR*0.35)}" cy="${fmt(ey - eyeR*0.35)}" r="${fmt(eyeR*0.3)}" fill="#fff"/>`;
    s += `<path d="M${fmt(cx - R*0.2)},${fmt(cy + R*0.05)} Q${fmt(cx)},${fmt(cy + R*0.32)} ${fmt(cx + R*0.2)},${fmt(cy + R*0.05)}" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    s += `<circle cx="${fmt(cx - R*0.55)}" cy="${fmt(cy + R*0.12)}" r="${fmt(R*0.1)}" fill="#fb7185" fill-opacity="0.55"/><circle cx="${fmt(cx + R*0.55)}" cy="${fmt(cy + R*0.12)}" r="${fmt(R*0.1)}" fill="#fb7185" fill-opacity="0.55"/>`;
  }
  return s + `</svg>`;
}

/* ===================== ブロック & 穴埋め枠 ===================== */
export function mix(a, b, t) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ca = p(a), cb = p(b), h = n => Math.round(ca[n] + (cb[n] - ca[n]) * t).toString(16).padStart(2, '0');
  return '#' + h(0) + h(1) + h(2);
}
export function gateBlock(type, px = 56) { // ガラス質: 斜めグラデ＋上部スペキュラ＋濃い縁＋白文字
  const g = GATES[type], base = g.color;
  const light = mix(base, '#ffffff', 0.5), dark = mix(base, '#000000', 0.28), edge = mix(base, '#000000', 0.45), id = `b${BID++}`;
  const defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${light}"/><stop offset="48%" stop-color="${base}"/><stop offset="100%" stop-color="${dark}"/></linearGradient>` +
    `<radialGradient id="${id}s" cx="33%" cy="26%" r="55%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>`;
  const head = `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg" font-family="'Oxanium','Noto Sans CJK JP',sans-serif">` + defs;
  if (type === 'X') {
    const c = px / 2, R = px * 0.42, reach = R * 0.5;
    return head + `<circle cx="${c}" cy="${c}" r="${fmt(R)}" fill="url(#${id})" stroke="${edge}" stroke-width="2"/><circle cx="${c}" cy="${c}" r="${fmt(R)}" fill="url(#${id}s)"/>` +
      `<line x1="${fmt(c-reach)}" y1="${c}" x2="${fmt(c+reach)}" y2="${c}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="${c}" y1="${fmt(c-reach)}" x2="${c}" y2="${fmt(c+reach)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  const r = px * 0.22;
  return head + `<rect x="2" y="2" width="${px-4}" height="${px-4}" rx="${r}" fill="url(#${id})" stroke="${edge}" stroke-width="2"/>` +
    `<rect x="3.5" y="3.5" width="${px-7}" height="${fmt(px*0.5)}" rx="${fmt(r*0.8)}" fill="url(#${id}s)"/>` +
    `<text x="${px/2}" y="${px/2}" font-size="${px*0.52}" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central" paint-order="stroke" stroke="${edge}" stroke-width="${fmt(px*0.03)}">${g.label}</text></svg>`;
}
export const swapIcon = (px = 40) => `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><g stroke="${hsv(48,92,98)}" stroke-width="${px*0.13}" stroke-linecap="round"><line x1="${px*0.25}" y1="${px*0.25}" x2="${px*0.75}" y2="${px*0.75}"/><line x1="${px*0.75}" y1="${px*0.25}" x2="${px*0.25}" y2="${px*0.75}"/></g></svg>`;
// 小学校でおなじみの桜スタンプ
export function sakuraStamp() {
  // 5枚の花びらを「1本の外周パス」で描く（重なり線を出さず、輪郭だけにする）
  const W = 140, col = '#e0386a', Rt = 60, Rv = 19;
  const P = (deg, r) => { const a = deg * Math.PI / 180; return `${fmt(Math.cos(a) * r)},${fmt(Math.sin(a) * r)}`; };
  let d = '';
  for (let i = 0; i < 5; i++) {
    const c = -90 + i * 72;
    if (i === 0) d += `M${P(c - 36, Rv)}`;
    d += `C${P(c - 32, 34)} ${P(c - 19, 58)} ${P(c - 8, Rt)}` +   // 谷 → 左の花びら先
         `L${P(c, 50)} L${P(c + 8, Rt)}` +                          // 先端の切れこみ
         `C${P(c + 19, 58)} ${P(c + 32, 34)} ${P(c + 36, Rv)}`;     // 右の花びら先 → 次の谷
  }
  d += 'Z';
  const t = (y, s) => `<text x="0" y="${y}" font-size="12" font-weight="800" fill="${col}" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3.2" stroke-linejoin="round">${s}</text>`;
  return `<svg width="${W}" height="${W}" viewBox="${-W/2} ${-W/2} ${W} ${W}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif">` +
    `<path d="${d}" fill="${col}" fill-opacity="0.12" stroke="${col}" stroke-width="2.6" stroke-linejoin="round"/>` +
    DECORATION_COPY.sakuraStamp.map((line, i) => t(i === 0 ? -4 : 14, line)).join('') + `</svg>`;
}
export const fillBox = (px = 80, answer = null) => {
  const base = `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif"><rect x="3" y="3" width="${px-6}" height="${px-6}" rx="10" fill="#fffef7" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 5"/>`;
  if (!answer) return base + `<text x="${px/2}" y="${px/2}" font-size="13" fill="#cbd5e1" text-anchor="middle" dominant-baseline="central">${LABELS.questionMark}</text></svg>`;
  if (answer === LABELS.vanish) return base + `<text x="${px/2 - 13}" y="${px/2 - 6}" font-size="7" fill="#dc2626" text-anchor="middle">${LABELS.vanishRubyHint}</text><text x="${px/2}" y="${px/2 + 3}" font-size="14" font-weight="700" fill="#dc2626" text-anchor="middle" dominant-baseline="central">${answer}</text></svg>`;
  return base + `<text x="${px/2}" y="${px/2}" font-size="14" font-weight="700" fill="#dc2626" text-anchor="middle" dominant-baseline="central">${answer}</text></svg>`;
};
// URL から QR コードを SVG で描く。印刷しても輪郭が鈍らないようベクターのまま埋め込む。
export function qrCode(text, px = 96) {
  const qr = qrcode(0, 'M'); // 型番は自動、誤り訂正レベルは M（印刷物の汚れやしわに耐える）
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount(), quiet = 4, span = n + quiet * 2; // クワイエットゾーンは規格どおり4モジュール
  let d = '';
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!qr.isDark(row, col)) continue;
      let run = 1; // 横に続く黒モジュールは1つの矩形にまとめ、パスを短くする
      while (col + run < n && qr.isDark(row, col + run)) run++;
      d += `M${col + quiet},${row + quiet}h${run}v1h-${run}z`;
      col += run - 1;
    }
  }
  return `<svg width="${px}" height="${px}" viewBox="0 0 ${span} ${span}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">` +
    `<rect width="${span}" height="${span}" fill="#ffffff"/><path d="${d}" fill="#1f2937"/></svg>`;
}
export const arrowR = () => `<svg width="30" height="36" viewBox="0 0 30 36"><path d="M3,18 L22,18 M22,18 L15,11 M22,18 L15,25" stroke="#64748b" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;
export const flowArrow = () => `<svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true"><path d="M2,5 L29,5 M29,5 L24,1.5 M29,5 L24,8.5" stroke="#64748b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const inlineGate = (type, px = 18) => `<span class="inlinegate" aria-hidden="true">${gateBlock(type, px)}</span>`;
export const inlineGateSequence = types => `<span class="inlinegates">${types.map(type => inlineGate(type)).join('')}</span>`;
export const inlineGatePair = type => inlineGateSequence([type, type]);
export const afterGateCaption = types => `<span class="statecap">${inlineGateSequence(types)}${LABELS.afterGateSuffix}</span>`;

export function renderContentMarkup(html) {
  return html
    .replace(/<Gate name="([HXYZST])"\s*\/>/g, (_match, gate) => inlineGate(gate))
    .replace(/<GatePair name="([HXYZST])"\s*\/>/g, (_match, gate) => inlineGatePair(gate))
    .replace(/<GateSeq names="([HXYZST, ]+)"\s*\/>/g, (_match, names) => inlineGateSequence(names.split(',').map(name => name.trim()).filter(Boolean)));
}
// 状態と状態の間に置く「操作」カード。球は状態、カードはブロック操作として分けて見せる。
export function axisKidName(axis) {
  const name = axisStyle(axis).name;
  return name === LABELS.diagonalAxisBase ? LABELS.diagonalAxisName : `${name}${LABELS.axisSuffix}`;
}
export function turnKidMarkup(angle) {
  return `${furi(turnWords(angle))}<span class="actdeg">(${angle}°)</span>`;
}
export const stepAction = gType => {
  const g = GATES[gType], st = axisStyle(g.axis);
  return `<span class="actstep"><span class="actturn"><b style="color:${st.color}">${axisKidName(g.axis)}</b><span class="actsep">・</span><span class="actturn-main">${turnKidMarkup(g.angle)}</span></span><span class="actgive">${gateBlock(gType, 24)}</span><span class="actarrow">${flowArrow()}</span></span>`;
};
export const storyAction = gType => {
  const g = GATES[gType], st = axisStyle(g.axis);
  return `<span class="storyop"><span class="actturn"><b style="color:${st.color}">${axisKidName(g.axis)}</b><span class="actsep">・</span><span class="actturn-main">${turnKidMarkup(g.angle)}</span></span><span class="actgive">${gateBlock(gType, 34)}</span><span class="actarrow">${flowArrow()}</span></span>`;
};
export const stateFigure = (size, state, caption, ghostState = null, axisHighlight = null, pathAngle = null) =>
  `<figure>${globe({ size, skin: 'bloch', state, ghostState, axisHighlight, pathAxis: axisHighlight, pathAngle })}<figcaption>${furi(caption)}</figcaption></figure>`;
// 解説ページ用の 2×2 行列 / 2×1 ベクトル（列優先で並べる）
export const mat = (a, b, c, d) => `<span class="mat"><span>${a}</span><span>${c}</span><span>${b}</span><span>${d}</span></span>`;
export const vec = (a, b) => `<span class="mat vec"><span>${a}</span><span>${b}</span></span>`;
// ケット記号の右にそえる小さなブロッホ球。ページ右上の球と同じ描き方にして見え方をそろえる。
export const inlineBloch = (state, px = 56) => `<span class="ketglobe">${globe({ size: px, skin: 'bloch', state })}</span>`;
