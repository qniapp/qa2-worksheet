// QA2 夏休み自由研究ワークシート生成: データ＋純粋関数で SVG を手続き生成し、A4×8ページの HTML を dist/ に書き出す。
// 設計の肝: すべての図は「1つの投影 project()」を共有する → 絶対にズレない。
// 地球スキンとブロッホスキンは同じ globe() の見た目違い。配列を増やせばパターンが増える。
// ふりがなは furi()（辞書＋BudouX）で本文のみに適用。PDF 化は build.sh（ヘッドレス Chrome）で行う。
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadDefaultJapaneseParser } from 'budoux';
const OUT = dirname(fileURLToPath(import.meta.url));

/* ===================== 3D ベクトル & 回転 ===================== */
const rad = d => (d * Math.PI) / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function rotate(v, axis, angle) { // ロドリゲス
  const n = norm(axis), th = rad(angle), c = Math.cos(th), s = Math.sin(th);
  return add(add(scl(v, c), scl(cross(n, v), s)), scl(n, dot(n, v) * (1 - c)));
}

/* ===================== 共有カメラ（正射影） ===================== */
const AZ = rad(-58), EL = rad(16);
const F = [Math.cos(EL) * Math.cos(AZ), Math.cos(EL) * Math.sin(AZ), Math.sin(EL)];
const RIGHT = norm(cross([0, 0, 1], F)), CAMUP = cross(F, RIGHT);
const project = (p, cx, cy, R) => [cx + R * dot(p, RIGHT), cy - R * dot(p, CAMUP)];
const depth = p => dot(p, F);

/* ===================== 色（BlockColors.cs の HSV を再現） ===================== */
function hsv(h, s, v) {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  const h2 = n => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return '#' + h2(r) + h2(g) + h2(b);
}
const GATES = {
  H: { label: 'H', color: hsv(199, 62, 98), axis: [1, 0, 1], angle: 180 },
  X: { label: '+', color: hsv(0, 44, 97),  axis: [1, 0, 0], angle: 180 },
  Y: { label: 'Y', color: hsv(163, 65, 76), axis: [0, 1, 0], angle: 180 },
  Z: { label: 'Z', color: hsv(331, 36, 97), axis: [0, 0, 1], angle: 180 },
  S: { label: 'S', color: hsv(267, 76, 71), axis: [0, 0, 1], angle: 90 },
  T: { label: 'T', color: hsv(268, 55, 42), axis: [0, 0, 1], angle: 45 },
};
function axisStyle(axis) { // 回転の中心軸の強調色
  const n = norm(axis);
  if (Math.abs(n[0]) > 0.99) return { name: 'x', color: '#f59e0b' };
  if (Math.abs(n[1]) > 0.99) return { name: 'y', color: '#16a34a' };
  if (Math.abs(n[2]) > 0.99) return { name: 'z', color: '#9333ea' };
  return { name: 'ななめ', color: '#0891b2' };
}
function turnWords(angle) { // 角度→地球の周回量
  if (angle === 45) return '8分の1周';
  if (angle === 90) return '4分の1周';
  if (angle === 180) return '半周';
  if (angle === 360) return 'ひとまわり';
  return `${angle}°`;
}

/* ===================== ふりがな（本文 prose にのみ適用。SVG には当てない） ===================== */
const FURI = [
  ['4分の1周', 'よんぶんのいっしゅう'], ['8分の1周', 'はちぶんのいっしゅう'],
  ['自由研究', 'じゆうけんきゅう'], ['夏休み', 'なつやすみ'], ['量子', 'りょうし'], ['不思議', 'ふしぎ'],
  ['観察', 'かんさつ'], ['完成', 'かんせい'], ['命令', 'めいれい'], ['自分', 'じぶん'], ['学年', 'がくねん'],
  ['予想', 'よそう'], ['結果', 'けっか'], ['法則', 'ほうそく'], ['今日', 'きょう'], ['場所', 'ばしょ'],
  ['点線', 'てんせん'], ['四角', 'しかく'], ['答', 'こた'], ['例', 'れい'], ['前', 'まえ'],
  ['計算', 'けいさん'], ['大切', 'たいせつ'], ['東京', 'とうきょう'], ['中心', 'ちゅうしん'], ['一回', 'いっかい'],
  ['意味', 'いみ'], ['移動', 'いどう'], ['書き方', 'かきかた'], ['気', 'き'], ['考', 'かんが'], ['長', 'なが'], ['高', 'たか'], ['使', 'つか'], ['段', 'だん'],
  ['小', 'ちい'], ['色', 'いろ'], ['回', 'かい'],
  ['真上', 'まうえ'], ['方位', 'ほうい'], ['赤道', 'せきどう'], ['北極', 'ほっきょく'], ['南極', 'なんきょく'],
  ['地球', 'ちきゅう'], ['半周', 'はんしゅう'], ['一点', 'いってん'], ['主役', 'しゅやく'], ['上下', 'じょうげ'],
  ['変身', 'へんしん'], ['注目', 'ちゅうもく'], ['位置', 'いち'], ['日づけ', 'ひづけ'], ['同じ', 'おなじ'],
  ['回転', 'かいてん'], ['記号', 'きごう'], ['名前', 'なまえ'], ['数学者', 'すうがくしゃ'],
  ['軸', 'じく'], ['量', 'りょう'], ['組', 'くみ'], ['君', 'くん'], ['絵', 'え'], ['外', 'そと'],
  ['上', 'うえ'], ['右', 'みぎ'], ['左', 'ひだり'], ['大', 'おお'], ['中', 'なか'], ['線', 'せん'], ['棒', 'ぼう'], ['後', 'あと'], ['回目', 'かいめ'],
  ['指', 'さ'], ['向', 'む'], ['元', 'もと'], ['戻', 'もど'], ['動', 'うご'], ['書', 'か'], ['見', 'み'], ['消', 'き'],
];
const FURI_MAP = Object.fromEntries(FURI);
const FURI_RE = new RegExp(FURI.map(e => e[0]).sort((a, b) => b.length - a.length)
  .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const addRuby = s => s.replace(FURI_RE, m => `<ruby>${m}<rt>${FURI_MAP[m]}</rt></ruby>`);
// BudouX: 日本語を自然な文節で改行。タグはそのまま、テキストノードだけ分割して <wbr> を挿入。
const bparser = loadDefaultJapaneseParser();
const wrapJa = html => html.replace(/[^<]+|<[^>]+>/g, m => (m[0] === '<' ? m : bparser.parse(m).join('<wbr>')));
const furi = s => wrapJa(addRuby(s));

/* ===================== SVG プリミティブ ===================== */
const fmt = n => (Math.round(n * 100) / 100);
function arrowhead(tip, dir, size, color) {
  const d = norm([dir[0], dir[1], 0]), px = -d[1], py = d[0];
  const a = [tip[0] - d[0] * size + px * size * 0.55, tip[1] - d[1] * size + py * size * 0.55];
  const b = [tip[0] - d[0] * size - px * size * 0.55, tip[1] - d[1] * size - py * size * 0.55];
  return `<path d="M${fmt(tip[0])},${fmt(tip[1])} L${fmt(a[0])},${fmt(a[1])} L${fmt(b[0])},${fmt(b[1])} Z" fill="${color}"/>`;
}
function arcSegments(fn, cx, cy, R, steps = 64) {
  const pts = [];
  for (let i = 0; i <= steps; i++) { const p = fn(i / steps); pts.push({ s: project(p, cx, cy, R), back: depth(p) < 0 }); }
  const segs = []; let cur = null;
  for (const pt of pts) { if (!cur || cur.back !== pt.back) { cur = { back: pt.back, pts: [] }; segs.push(cur); } cur.pts.push(pt.s); }
  return segs;
}
const polyline = (pts, attrs) => `<polyline points="${pts.map(p => `${fmt(p[0])},${fmt(p[1])}`).join(' ')}" fill="none" ${attrs}/>`;

/* ===================== globe(): 地球/ブロッホ 共通部品 ===================== */
let UID = 0;
function globe(opts) {
  const { size = 150, skin = 'bloch', state = [0, 0, 1], face = false, spin = null, poleLabels = true, ghostState = null, axisHighlight = null } = opts;
  const spinAxisName = spin ? axisStyle(spin.axis).name : null;
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
  const axisEnd = (v, lbl, color) => {
    const p0 = project(scl(v, -1), cx, cy, R), p1 = project(v, cx, cy, R), out = project(scl(v, 1.28), cx, cy, R);
    return `<line x1="${fmt(p0[0])}" y1="${fmt(p0[1])}" x2="${fmt(p1[0])}" y2="${fmt(p1[1])}" stroke="${color}" stroke-width="1" stroke-opacity="0.6"/>` +
      `<text x="${fmt(out[0])}" y="${fmt(out[1])}" font-size="10" fill="${color}" text-anchor="middle" dominant-baseline="middle">${lbl}</text>`;
  };
  const highlightAxis = (axis, showAxisLabel = true) => {
    const st = axisStyle(axis), an = norm(axis);
    const h0 = project(scl(an, -1.16), cx, cy, R), h1 = project(scl(an, 1.16), cx, cy, R);
    let out = `<line x1="${fmt(h0[0])}" y1="${fmt(h0[1])}" x2="${fmt(h1[0])}" y2="${fmt(h1[1])}" stroke="${st.color}" stroke-width="5.8" stroke-opacity="0.18" stroke-linecap="round"/>`;
    out += `<line x1="${fmt(h0[0])}" y1="${fmt(h0[1])}" x2="${fmt(h1[0])}" y2="${fmt(h1[1])}" stroke="${st.color}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (showAxisLabel && st.name !== 'z') { const hl = project(scl(an, 1.34), cx, cy, R);
      out += `<text x="${fmt(hl[0])}" y="${fmt(hl[1])}" font-size="11" font-weight="700" fill="${st.color}" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="#fff" stroke-width="2.6">${st.name}</text>`; }
    return out;
  };
  if (skin === 'bloch') { // |0⟩|1⟩ のケット記号は上級者向けなので出さない（地球の方位ばんとして見せる）
    if (spinAxisName !== 'x') s += axisEnd([1, 0, 0], 'x', faint);
    if (spinAxisName !== 'y') s += axisEnd([0, 1, 0], 'y', faint);
    s += `<line x1="${cx}" y1="${fmt(project([0,0,-1],cx,cy,R)[1])}" x2="${cx}" y2="${fmt(project([0,0,1],cx,cy,R)[1])}" stroke="${faint}" stroke-width="1" stroke-opacity="0.6"/>`;
  } else if (poleLabels) {
    const np = project([0, 0, 1.3], cx, cy, R), sp = project([0, 0, -1.34], cx, cy, R);
    s += `<text x="${fmt(np[0])}" y="${fmt(np[1] - 3)}" font-size="9.5" fill="#0369a1" text-anchor="middle">北極</text>`;
    s += `<text x="${fmt(np[0])}" y="${fmt(np[1] + 6)}" font-size="6.5" fill="#0369a1" text-anchor="middle">ほっきょく</text>`;
    s += `<text x="${fmt(sp[0])}" y="${fmt(sp[1] - 3)}" font-size="9.5" fill="#0369a1" text-anchor="middle">南極</text>`;
    s += `<text x="${fmt(sp[0])}" y="${fmt(sp[1] + 6)}" font-size="6.5" fill="#0369a1" text-anchor="middle">なんきょく</text>`;
  }
  if (axisHighlight && !spin) s += highlightAxis(axisHighlight, false);
  if (spin) { // 回転の中心軸を強調 → 軌跡＋矢印
    s += highlightAxis(spin.axis);
    const segs = arcSegments(t => rotate(state, spin.axis, spin.angle * t), cx, cy, R * 1.04, 48);
    for (const seg of segs) s += polyline(seg.pts, `stroke="#f59e0b" stroke-width="2.4" ${seg.back ? 'stroke-opacity="0.45"' : ''}`);
    const endV = rotate(state, spin.axis, spin.angle), endP = project(endV, cx, cy, R * 1.04);
    const prevP = project(rotate(state, spin.axis, spin.angle - 6), cx, cy, R * 1.04);
    s += arrowhead(endP, [endP[0] - prevP[0], endP[1] - prevP[1], 0], 7, '#f59e0b');
  }
  if (ghostState && len(add(state, scl(ghostState, -1))) > 0.05) {
    const gs = norm(ghostState), en = norm(state), gp = project(gs, cx, cy, R);
    s += `<g opacity="0.35"><line x1="${cx}" y1="${cy}" x2="${fmt(gp[0])}" y2="${fmt(gp[1])}" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3"/>${arrowhead(gp, [gp[0] - cx, gp[1] - cy, 0], 6, '#64748b')}</g>`;
    let axis = cross(gs, en), angleDeg = Math.acos(Math.max(-1, Math.min(1, dot(gs, en)))) * 180 / Math.PI;
    if (len(axis) < 0.01) axis = cross(gs, Math.abs(gs[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]);
    axis = norm(axis);
    const move = t => rotate(gs, axis, angleDeg * t);
    for (const seg of arcSegments(move, cx, cy, R * 1.08, 40))
      s += polyline(seg.pts, `stroke="#f59e0b" stroke-width="2.1" stroke-linecap="round" ${seg.back ? 'stroke-opacity="0.35" stroke-dasharray="3 3"' : ''}`);
    const endP = project(en, cx, cy, R * 1.08), prevP = project(move(0.92), cx, cy, R * 1.08);
    s += arrowhead(endP, [endP[0] - prevP[0], endP[1] - prevP[1], 0], 6.5, '#f59e0b');
  }
  const tip = project(state, cx, cy, R);
  s += `<line x1="${cx}" y1="${cy}" x2="${fmt(tip[0])}" y2="${fmt(tip[1])}" stroke="#fff" stroke-width="5" stroke-opacity="0.75" stroke-linecap="round"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${fmt(tip[0])}" y2="${fmt(tip[1])}" stroke="#dc2626" stroke-width="2.6"/>`;
  s += arrowhead(tip, [tip[0] - cx, tip[1] - cy, 0], 8, '#dc2626');
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
let BID = 0;
function mix(a, b, t) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ca = p(a), cb = p(b), h = n => Math.round(ca[n] + (cb[n] - ca[n]) * t).toString(16).padStart(2, '0');
  return '#' + h(0) + h(1) + h(2);
}
function gateBlock(type, px = 56) { // ガラス質: 斜めグラデ＋上部スペキュラ＋濃い縁＋白文字
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
const swapIcon = (px = 40) => `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><g stroke="${hsv(48,92,98)}" stroke-width="${px*0.13}" stroke-linecap="round"><line x1="${px*0.25}" y1="${px*0.25}" x2="${px*0.75}" y2="${px*0.75}"/><line x1="${px*0.75}" y1="${px*0.25}" x2="${px*0.25}" y2="${px*0.75}"/></g></svg>`;
// 小学校でおなじみの 桜「よくできました」スタンプ
function sakuraStamp() {
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
    t(-4, 'よく') + t(14, 'できました') + `</svg>`;
}
const fillBox = (px = 80, answer = null) => {
  const base = `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif"><rect x="3" y="3" width="${px-6}" height="${px-6}" rx="10" fill="#fffef7" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 5"/>`;
  if (!answer) return base + `<text x="${px/2}" y="${px/2}" font-size="13" fill="#cbd5e1" text-anchor="middle" dominant-baseline="central">？</text></svg>`;
  if (answer === '消える') return base + `<text x="${px/2 - 13}" y="${px/2 - 12}" font-size="7" fill="#dc2626" text-anchor="middle">き</text><text x="${px/2}" y="${px/2 + 3}" font-size="14" font-weight="700" fill="#dc2626" text-anchor="middle" dominant-baseline="central">${answer}</text></svg>`;
  return base + `<text x="${px/2}" y="${px/2}" font-size="14" font-weight="700" fill="#dc2626" text-anchor="middle" dominant-baseline="central">${answer}</text></svg>`;
};
const arrowR = () => `<svg width="30" height="36" viewBox="0 0 30 36"><path d="M3,18 L22,18 M22,18 L15,11 M22,18 L15,25" stroke="#64748b" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;
const flowArrow = () => `<svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true"><path d="M2,5 L29,5 M29,5 L24,1.5 M29,5 L24,8.5" stroke="#64748b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// 状態と状態の間に置く「操作」カード。球は状態、カードはブロック操作として分けて見せる。
function axisKidName(axis) {
  const name = axisStyle(axis).name;
  return name === 'ななめ' ? 'ななめじく' : `${name}じく`;
}
function turnKidMarkup(angle) {
  return `${furi(turnWords(angle))}<span class="actdeg">(${angle}°)</span>`;
}
const stepAction = gType => {
  const g = GATES[gType], st = axisStyle(g.axis);
  return `<span class="actstep"><span class="actturn"><b style="color:${st.color}">${axisKidName(g.axis)}</b><span class="actsep">・</span><span class="actturn-main">${turnKidMarkup(g.angle)}</span></span><span class="actgive">${gateBlock(gType, 24)}</span><span class="actarrow">${flowArrow()}</span></span>`;
};
const stateFigure = (size, state, caption, ghostState = null, axisHighlight = null) =>
  `<figure>${globe({ size, skin: 'bloch', state, ghostState, axisHighlight })}<figcaption>${furi(caption)}</figcaption></figure>`;
// 解説ページ用の 2×2 行列 / 2×1 ベクトル（列優先で並べる）
const mat = (a, b, c, d) => `<span class="mat"><span>${a}</span><span>${c}</span><span>${b}</span><span>${d}</span></span>`;
const vec = (a, b) => `<span class="mat vec"><span>${a}</span><span>${b}</span></span>`;

/* ===================== 観察ノートの行 ===================== */
const N = [0, 0, 1], EQ = [1, 0, 0]; // |0>北極 / |+>赤道(東京)

// ペア（2ブロック）
const PAIRS = [
  { tag: 'X²', g: 'X', start: N,  result: 'vanish', example: true, hint: 'やじるしが もとどおり だから 消える' },
  { tag: 'Y²', g: 'Y', start: N,  result: 'vanish' },
  { tag: 'Z²', g: 'Z', start: EQ, result: 'vanish', note: '赤道からスタート' },
  { tag: 'H²', g: 'H', start: N,  result: 'vanish' },
  { tag: 'S²', g: 'S', start: EQ, result: { block: 'Z' }, note: '赤道からスタート' },
  { tag: 'T²', g: 'T', start: EQ, result: { block: 'S' }, note: '赤道からスタート' },
];
function pairRow(p) {
  // 右側には答え（結論）を書かない。球は状態、間のカードは操作として分けて見せる。
  const g = GATES[p.g], s0 = p.start, s1 = rotate(s0, g.axis, g.angle), s2 = rotate(s1, g.axis, g.angle);
  const box = p.example ? fillBox(68, '消える') : fillBox(68);
  const exlabel = p.example ? `<div class="exlabel">${furi('↑ 書き方の例')}</div>` : '';
  const why = p.hint ? `<div class="why">${furi(p.hint)}</div>` : '';
  const tagBg = mix(g.color, '#ffffff', 0.72), tagTx = mix(g.color, '#000000', 0.38);
  const finalCaption = p.result === 'vanish' ? '2回目：元どおり' : '2回目のあと';
  return `<div class="prow"><div class="pleft"><div class="tagline"><div class="tag" style="background:${tagBg};color:${tagTx}">${p.tag}</div><div class="taghint">${p.g}が2こ</div></div>
    <div class="seq"><div class="col">${gateBlock(p.g, 38)}${gateBlock(p.g, 38)}</div>${arrowR()}<div class="boxwrap"><div class="answerhint">${furi('ここに書く')}</div>${box}${exlabel}</div></div></div>
    <div class="pright"><div class="spheres flowline">
      ${stateFigure(74, s0, 'まえの向き')}
      ${stepAction(p.g)}
      ${stateFigure(74, s1, '1回目のあと', s0, g.axis)}
      ${stepAction(p.g)}
      ${stateFigure(74, s2, finalCaption, s1, g.axis)}
    </div>${why}</div></div>`;
}

// トリプル（3ブロック）。外側2つが消え、まん中が変身（または全部消える）
const TRIPLES_H = [
  { tag: 'HXH', blocks: ['H', 'X', 'H'], start: EQ, result: { block: 'Z' }, note: '赤道からスタート', example: true, hint: 'z軸のまわりを 半周 ＝ Z と同じ' },
  { tag: 'HZH', blocks: ['H', 'Z', 'H'], start: N,  result: { block: 'X' } },
  { tag: 'HYH', blocks: ['H', 'Y', 'H'], start: N,  result: { block: 'Y' } },
];
const TRIPLES_ST = [
  { tag: 'SXS', blocks: ['S', 'X', 'S'], start: [0, 1, 0], result: { block: 'X' }, note: '赤道からスタート', example: true, hint: 'x軸のまわりを 半周 ＝ X と同じ' },
  { tag: 'SYS', blocks: ['S', 'Y', 'S'], start: [1, 0, 0], result: { block: 'Y' }, note: '赤道からスタート' },
  { tag: 'SZS', blocks: ['S', 'Z', 'S'], start: EQ, result: 'vanish', note: '赤道からスタート' },
  { tag: 'TST', blocks: ['T', 'S', 'T'], start: EQ, result: { block: 'Z' }, note: '赤道からスタート', divider: 'Tではさんでみよう' },
];
function triRow(p) {
  const gs = p.blocks.map(t => GATES[t]);
  const states = [p.start];
  for (const g of gs) states.push(rotate(states[states.length - 1], g.axis, g.angle));
  let spheres = stateFigure(66, states[0], 'まえの向き');
  p.blocks.forEach((block, i) => {
    const caption = i === p.blocks.length - 1 ? 'さいごの向き' : `${i + 1}こ目のあと`;
    spheres += stepAction(block) + stateFigure(66, states[i + 1], caption, states[i], gs[i].axis);
  });
  const box = p.example
    ? (p.result === 'vanish' ? fillBox(64, '消える') : `<div class="exfill">${gateBlock(p.result.block, 42)}</div>`)
    : fillBox(64);
  const exlabel = p.example ? `<div class="exlabel">${furi('↑ 書き方の例')}</div>` : '';
  const why = p.hint ? `<div class="why">${furi(p.hint)}</div>` : '';
  const tagBg = mix(gs[0].color, '#ffffff', 0.72), tagTx = mix(gs[0].color, '#000000', 0.38);
  const divider = p.divider ? `<div class="rowdivider">${furi(p.divider)}</div>` : '';
  return `${divider}<div class="prow"><div class="pleft tleft"><div class="tagline"><div class="tag" style="background:${tagBg};color:${tagTx}">${p.tag}</div><div class="taghint">${p.blocks.join('・')}</div></div>
    <div class="seq"><div class="col">${p.blocks.map(t => gateBlock(t, 34)).join('')}</div>${arrowR()}<div class="boxwrap"><div class="answerhint">${furi('ここに書く')}</div>${box}${exlabel}</div></div></div>
    <div class="pright"><div class="spheres flowline">${spheres}</div>${why}</div></div>`;
}

/* ===================== ページ ===================== */
const headTitle = sub => `<div class="head"><div class="title">QA<sup>2</sup> ${furi('観察')}ノート</div><div class="sub">${furi(sub)}</div></div>`;
const footer = n => `<div class="foot"><span>QA<sup>2</sup> なつやすみ じゆうけんきゅう ワークシート</span><span>${n} / 8</span></div>`;

// ブロック紹介（名前・回転軸・回転量）
const INTRO_BLOCKS = [
  { group: 'まずは半周のブロック', g: 'X', name: 'X ブロック', start: N, fact: 'Xブロックは <b>＋マーク</b>。x軸で半周するよ。' },
  { g: 'Y', name: 'Y ブロック', start: N, fact: 'Y軸で半周。X ブロックと、まわる向きがちがうんだ。' },
  { g: 'Z', name: 'Z ブロック', start: [1, 0, 0], fact: 'たての z軸で半周。北極・南極は動かないよ。' },
  { group: 'ななめに半周', g: 'H', name: 'H ブロック', start: N, fact: 'ななめ軸で半周。名前はフランスの数学者アダマール（Hadamard）さんから。' },
  { group: '小さい回転', g: 'S', name: 'S ブロック', start: [1, 0, 0], fact: 'z軸を4分の1周。2つあつまると Z ブロック に変身！' },
  { g: 'T', name: 'T ブロック', start: [1, 0, 0], fact: 'z軸を8分の1周。2つで S ブロック に変身！' },
];
function introRow(b) {
  const g = GATES[b.g], st = axisStyle(g.axis);
  const axisName = st.name === 'ななめ' ? 'ななめ' : st.name + '軸';
  const cap = `<b style="color:${st.color}">${axisName}</b>のまわりを<b>${turnWords(g.angle)}</b>`;
  return `<div class="brow">
    <div class="bg">${gateBlock(b.g, 44)}<div class="bname">${furi(b.name)}</div></div>
    <figure>${globe({ size: 80, skin: 'bloch', state: b.start, spin: { axis: g.axis, angle: g.angle } })}<figcaption>${furi(cap)}</figcaption></figure>
    <div class="bfact">${furi(b.fact)}</div>
  </div>`;
}
const introPage = () => `<div class="page">
  ${headTitle('② ブロックのなかまたち ・ p.3')}
  <h2><span class="dot"></span>${furi('ブロック（量子ゲート）には、6つのなかま')}</h2>
  <div class="howto">${furi('ブロックをキュービット君にわたすと、キュービット君の<b>やじるし</b>が<b>くるっと回転</b>するよ。<b>まわる軸</b>と<b>まわる量</b>を、色だけでなくラベルでも見よう。')}</div>
  ${INTRO_BLOCKS.map(b => `${b.group ? `<div class="grouphead">${furi(b.group)}</div>` : ''}${introRow(b)}`).join('')}
  ${footer(3)}
</div>`;

// SWAP を「あみだくじ」で説明する図
function amidakujiDemo() {
  const W = 300, H = 158, ax = 100, bx = 205, blk = 40, yTop = 32, ySwap = 82, yBot = 128, yc = hsv(48, 92, 98);
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif">`;
  s += `<line x1="${ax}" y1="14" x2="${ax}" y2="${H-12}" stroke="#cbd5e1" stroke-width="3"/><line x1="${bx}" y1="14" x2="${bx}" y2="${H-12}" stroke="#cbd5e1" stroke-width="3"/>`;
  s += `<line x1="${ax}" y1="${ySwap}" x2="${bx}" y2="${ySwap}" stroke="${yc}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<polyline points="${ax},${yTop} ${ax},${ySwap} ${bx},${ySwap} ${bx},${yBot}" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += arrowhead([bx, yBot], [0, 1, 0], 8, '#f59e0b');
  s += `<g transform="translate(${ax-13},${ySwap-13})">${swapIcon(26)}</g><g transform="translate(${bx-13},${ySwap-13})">${swapIcon(26)}</g>`;
  s += `<text x="${(ax+bx)/2}" y="${ySwap-9}" font-size="9" fill="#b45309" text-anchor="middle">SWAP</text>`;
  s += `<g transform="translate(${ax-blk/2},${yTop-blk/2})">${gateBlock('H', blk)}</g><g transform="translate(${bx-blk/2},${yBot-blk/2})">${gateBlock('H', blk)}</g>`;
  s += `<text x="${bx+16}" y="${yBot+3}" font-size="11" fill="#dc2626" font-weight="700">そろう！</text>`;
  s += `</svg>`;
  return s;
}
// 2段（3レーン・SWAP2つ）のあみだくじ：はなれた H どうしがそろう
function amidakujiDemo2() {
  const W = 330, H = 182, a = 78, b = 165, c = 252, blk = 38;
  const yTop = 30, s1 = 74, s2 = 120, yBot = 158, yc = hsv(48, 92, 98);
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans CJK JP',sans-serif">`;
  for (const x of [a, b, c]) s += `<line x1="${x}" y1="12" x2="${x}" y2="${H - 12}" stroke="#cbd5e1" stroke-width="3"/>`;
  s += `<line x1="${a}" y1="${s1}" x2="${b}" y2="${s1}" stroke="${yc}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<line x1="${b}" y1="${s2}" x2="${c}" y2="${s2}" stroke="${yc}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<polyline points="${a},${yTop} ${a},${s1} ${b},${s1} ${b},${s2} ${c},${s2} ${c},${yBot}" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += arrowhead([c, yBot], [0, 1, 0], 8, '#f59e0b');
  for (const [x, y] of [[a, s1], [b, s1], [b, s2], [c, s2]]) s += `<g transform="translate(${x - 13},${y - 13})">${swapIcon(26)}</g>`;
  s += `<text x="${(a + b) / 2}" y="${s1 - 9}" font-size="9" fill="#b45309" text-anchor="middle">SWAP</text>`;
  s += `<text x="${(b + c) / 2}" y="${s2 - 9}" font-size="9" fill="#b45309" text-anchor="middle">SWAP</text>`;
  s += `<g transform="translate(${a - blk / 2},${yTop - blk / 2})">${gateBlock('H', blk)}</g>`;
  s += `<g transform="translate(${c - blk / 2},${yBot - blk / 2})">${gateBlock('H', blk)}</g>`;
  s += `<text x="${c + 16}" y="${yBot + 3}" font-size="11.5" fill="#dc2626" font-weight="700">そろう！</text>`;
  s += `</svg>`;
  return s;
}

const coverPage = () => `<div class="page cover">
  <div class="kicker">${furi('夏休み 自由研究')}</div>
  <h1>${furi('量子')}コンピューターの<br>${furi('不思議')}を しらべよう</h1>
  <div class="subtitle">パズルゲーム <b>QA²</b> で あそびながら ${furi('完成')}させる ${furi('観察')}ノート</div>
  <div class="goal">${furi('今日のゴール：ブロックをならべると「消える／変身する」を見つけよう')}</div>
  <div class="hero">${globe({ size: 220, skin: 'earth', state: N, face: true, poleLabels: false })}<div class="heroname">キュービット${furi('君')}</div></div>
  <div class="intro">
    <h3>📚 ${furi('この自由研究について')}</h3>
    <ul>
      <li>${furi('<b>QA²であそぶ</b>')}</li>
      <li>${furi('<b>ブロック＝命令</b> の動きを観察する')}</li>
      <li>${furi('気づいた法則をこのプリントに書く')}</li>
    </ul>
  </div>
  <div class="materials"><b>つかうもの</b><span>□ QA²</span><span>□ このプリント</span><span>□ えんぴつ</span><span>□ いろえんぴつ</span></div>
  <div class="namebox">
    <div class="nbrow"><span>なまえ</span><div class="line"></div></div>
    <div class="nbrow"><span>${furi('学年')}・${furi('組')}</span><div class="line"></div></div>
  </div>
  ${footer(1)}
</div>`;

const storyPage = () => `<div class="page">
  ${headTitle('① キュービット君って？ ・ p.2')}
  <h2><span class="dot"></span>${furi('キュービット君と、ブロックのひみつ')}</h2>
  <div class="step"><div class="num">1</div>
    <div class="stepbody"><p>${furi('キュービット君は、ゲーム <b>QA²</b> には出てこないけれど <b>かげの主役</b>。量子コンピューターの中の「<b>データ</b>」＝計算のたんい として、とても大切なやくわりをしているよ。')}</p></div>
    <figure class="stepfig">${globe({ size: 100, skin: 'earth', state: N, face: true, poleLabels: false })}<figcaption>${furi('キュービット君')}</figcaption></figure>
  </div>
  <div class="step"><div class="num">2</div>
    <div class="stepbody"><p>${furi('キュービット君は、いつも <b>地球の一点</b> を指しているよ。東京を指したり、北極を指したり、南極を指したり……いろいろ！')}</p></div>
  </div>
  <div class="step"><div class="num">3</div>
    <div class="stepbody"><p>${furi('ここで <b>ブロック</b> のとうじょう！ ブロックをキュービット君にわたすと、指す <b>向きが変わる</b> よ。ブロックは量子コンピューターの「<b>命令</b>」。キュービット君といっしょに計算をすすめていくんだ。')}</p></div>
    <figure class="stepfig">${gateBlock('X', 48)}</figure>
  </div>
  <div class="step"><div class="num">4</div>
    <div class="stepbody">
      <p>${furi('北極のキュービット君に <b>X</b> をわたすと…… <b style="color:#2563eb">x軸</b>を中心に くるっと回転！（→ 南極） もう一回 <b>X</b> をわたすと…… また <b style="color:#2563eb">x軸</b>で回って <b>元に戻った！</b>')}</p>
      <div class="strip">
        <figure><div class="figlabel">${furi('① 北極')}</div>${globe({ size: 124, skin: 'earth', state: N, face: true, poleLabels: false, spin: { axis: GATES.X.axis, angle: 180 } })}<figcaption>${furi('北極を指している')}</figcaption></figure>
        <div class="opx">${gateBlock('X', 42)}<span>${furi('Xブロック')}</span></div>
        <figure><div class="figlabel">${furi('② X後：南極')}</div>${globe({ size: 124, skin: 'earth', state: [0,0,-1], face: true, poleLabels: false, spin: { axis: GATES.X.axis, angle: 180 } })}<figcaption>${furi('南極へ')}</figcaption></figure>
        <div class="opx">${gateBlock('X', 42)}<span>${furi('もう1回 X')}</span></div>
        <figure><div class="figlabel">${furi('③ 2回目：北極')}</div>${globe({ size: 124, skin: 'earth', state: N, face: true, poleLabels: false })}<figcaption>${furi('元に戻った！')}</figcaption></figure>
      </div>
    </div>
  </div>
  <div class="step"><div class="num">5</div>
    <div class="stepbody"><p>${furi('元に戻った＝ <b>X を2回わたす意味がない</b>。だから <b>X X</b> のならびがあったら <b>消してもいい</b>！ キュービット君には なんの えいきょうもないからね。')} ＝ <span class="red">${furi('マッチして消える！')}</span></p></div>
  </div>
  <div class="trythis">${furi('🎮 やってみよう：QA² で <b>X ブロックを2つ たてにそろえて</b>、ほんとうに消えるか たしかめてみよう！')}</div>
  <div class="observebox"><b>${furi('観察メモ')}</b><div class="obsline">${furi('予想')}：□ ${furi('消える')}　□ ${furi('消えない')}</div><div class="obsline">${furi('結果')}：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div><div class="obsfree"><span class="freelabel">${furi('気づいたこと')}：</span></div></div>
  ${footer(2)}
</div>`;

const pairsPage = () => `<div class="page pairs">
  ${headTitle('③ 2つのブロックでマッチ ・ p.4')}
  <h2><span class="dot"></span>${furi('2つのブロックを「上下にそろえる」とどうなる？')}</h2>
  <div class="howto">${furi('<b>かきかた：</b> 答えは<b>左の大きな点線の四角だけ</b>に書く。ぜんぶ消えるときは <span class="red">「消える」</span> とかこう。')}</div>
  ${PAIRS.map(pairRow).join('')}
  ${footer(4)}
</div>`;

const triplesPage = (sub, heading, lead, rows, n, memo) => `<div class="page ${n === 6 ? 'tallrows' : ''}">
  ${headTitle(sub)}
  <h2><span class="dot"></span>${furi(heading)}</h2>
  <div class="howto">${furi(lead + ' 前のページと同じように考えよう。')}</div>
  ${rows.map(triRow).join('')}
  ${memo ? `<div class="freewrite guided triplememo" style="height:${memo}px"><div class="fwh">✏️ ${furi('よそう・きづいたこと')}</div><div class="promptlines"><span>Hではさむと X は ＿＿ になる</span><span>Hではさむと Z は ＿＿ になる</span><span>Hではさむと Y は ＿＿ になる</span><span class="freeprompt">そのほか きづいたこと：</span></div></div>` : ''}
  ${footer(n)}
</div>`;

const swapPage = () => `<div class="page">
  ${headTitle('⑤ はってん：SWAP（スワップ）・ p.7')}
  <h2><span class="dot"></span>${furi('はってん：SWAP は「あみだくじ」みたいな命令')}</h2>
  <p class="lead">${furi('<b>SWAP（スワップ）</b>は、棒でつながった2つのレーンを<b>いれかえる</b>命令。あみだくじみたいに線をたどると、はなれた2つのブロックが <b>上下にそろう</b> ことがあるよ！')}</p>
  <div class="amidarow">
    <div class="amida">${amidakujiDemo()}<div class="amidacap">${furi('SWAP 1つ：H と H がそろって <span class="red">消える</span>')}</div></div>
    <div class="amida">${amidakujiDemo2()}<div class="amidacap">${furi('SWAP 2つ＝2段：もっと はなれた H もそろう！')}</div></div>
  </div>
  <div class="trythis">${furi('🎉 長い あみだくじを つくって マッチさせると、QA² では <b>高とくてん</b>！ いろんな つなぎかたを ためして、いままでの 消えるマッチを SWAP ごしに そろえてみよう。')}</div>
  <div class="freewrite guided" style="height:300px"><div class="fwh">✏️ ${furi('みつけたマッチ・きづいたこと')}</div><div class="promptlines"><span>${furi('そろったブロック')}：＿＿＿＿＿＿</span><span>${furi('使ったSWAP')}：＿＿こ</span><span class="freeprompt">${furi('気づいたこと')}：</span></div></div>
  <div class="finish">${sakuraStamp()}<div class="namebox2"><span>なまえ</span><div class="line"></div><span>${furi('日づけ')}</span><div class="line short"></div></div></div>
  ${footer(7)}
</div>`;

const aboutPage = () => `<div class="page about">
  ${headTitle('おうちの方・先生へ ・ p.8')}
  <h2><span class="dot"></span>この教材の背景（おとなの方へ）</h2>
  <div class="adultsummary"><b>3分でわかる要点</b><span>① キュービット君＝量子ビット</span><span>② ブロック＝量子ゲート</span><span>③ 図の回転＝行列計算の結果</span></div>
  <div class="sect">
    <h3>量子ビット（qubit）とキュービット君</h3>
    <div class="miniglobe">${globe({ size: 122, skin: 'bloch', state: [0.5, 0, 0.866] })}<figcaption>北極＝|0⟩ ・ 南極＝|1⟩<br>とちゅう＝重ね合わせ</figcaption></div>
    <p>${wrapJa('ふつうのコンピューターの最小単位「ビット」は 0 か 1 のどちらかしか表せません。量子コンピューターの「量子ビット（qubit）」は、本教材のキュービット君と同じく、球面（ブロッホ球）上の任意の向きを取れます。北極が |0⟩、南極が |1⟩ に対応し、ふつうのビットと同じ 0・1 はもちろん、その「重ね合わせ」＝球面上のあらゆる状態を表せます。これが、古典コンピューターには難しい計算や表現を可能にします。')}</p>
  </div>
  <div class="sect">
    <h3>量子ゲート＝ブロック</h3>
    <div class="gaterow">${['H', 'X', 'Y', 'Z', 'S', 'T'].map(g => gateBlock(g, 30)).join('')}</div>
    <p>${wrapJa('量子ビットを操作する命令が「量子ゲート」で、本教材のブロックそのものです。H・X・Y・Z・S・T という記号や見た目は、大学の教科書や研究論文で使われるものとまったく同じです。お子さんはゲームを通じて、本物の量子計算の記法に触れています。')}</p>
  </div>
  <div class="sect">
    <h3>数学的には</h3>
    <p>${wrapJa('キュービット君の状態は「状態ベクトル」で表されます。')}</p>
    <div class="eq">|0⟩ = ${vec('1', '0')}　|1⟩ = ${vec('0', '1')}　|+⟩ = <span class="frac">1/√2</span> ${vec('1', '1')}</div>
    <p>${wrapJa('各ゲートは「ユニタリ行列」＝ある軸を中心とする回転行列です。')}</p>
    <div class="eq">X = ${mat('0', '1', '1', '0')}<span class="ann">x軸 180°</span> 　Z = ${mat('1', '0', '0', '-1')}<span class="ann">z軸 180°</span> 　S = ${mat('1', '0', '0', 'i')}<span class="ann">z軸 90°</span> 　H = <span class="frac">1/√2</span>${mat('1', '1', '1', '-1')}</div>
    <p>${wrapJa('状態ベクトルにゲートを適用する＝行列とベクトルの掛け算です。プリントの図は、この計算の結果に対応します。')}</p>
    <div class="eq">例1：X|0⟩ = ${mat('0', '1', '1', '0')}${vec('1', '0')} = ${vec('0', '1')} = |1⟩</div>
    <div class="eqnote">${wrapJa('→ キュービット君が 北極→南極 に反転（p.2 の X）。')}</div>
    <div class="eq">例2：X·X|0⟩ = X|1⟩ = |0⟩</div>
    <div class="eqnote">${wrapJa('→ 2回で もとどおり＝マッチして消える（p.4 の X²）。')}</div>
    <div class="eq">例3：S·S = ${mat('1', '0', '0', 'i')}<span class="sup">2</span> = ${mat('1', '0', '0', '-1')} = Z</div>
    <div class="eqnote">${wrapJa('→ S を2回で Z と同じ（p.4 の S²→Z）。T は z軸 45°（位相 e^{iπ/4}）で、2回で S になります。')}</div>
  </div>
  <div class="sect">
    <h3>この教材のねらい</h3>
    <p>${wrapJa('遊びと観察を通じて、重ね合わせ・量子ゲート・ユニタリ性といった量子計算の中核概念を、専門記法のまま体験的に理解することを目指します。手を動かして法則（XX＝消える、S²＝Z など）を自分で見つける過程が、後の本格的な学習の土台になります。')}</p>
  </div>
  ${footer(8)}
</div>`;

/* ===================== HTML 全体 ===================== */
const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Noto Sans CJK JP', sans-serif; color: #1f2937; word-break: keep-all; overflow-wrap: anywhere; }
  .page { width: 210mm; min-height: 297mm; padding: 12mm 13mm; position: relative; break-after: page; }
  .page:last-child { break-after: auto; }
  .head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 3px solid #1f2937; padding-bottom: 6px; }
  .head .title { font-size: 27px; font-weight: 800; line-height: 1.7; } .head .title sup { font-size: 14px; }
  .head .sub { font-size: 12px; color: #64748b; }
  ruby rt { font-size: 0.5em; font-weight: 400; opacity: 0.85; }
  h2 { font-size: 16px; margin: 14px 0 6px; display: flex; align-items: center; gap: 8px; line-height: 1.5; }
  h2 .dot { width: 10px; height: 18px; background: #1f2937; display: inline-block; border-radius: 2px; }
  .lead { font-size: 13px; line-height: 1.8; }
  .red { color: #dc2626; font-weight: 700; }
  /* cover */
  .cover { text-align: center; }
  .cover .kicker { margin-top: 10mm; font-size: 15px; letter-spacing: 4px; color: #6366f1; font-weight: 700; }
  .cover h1 { font-size: 38px; line-height: 1.45; margin: 8px 0; font-weight: 800; }
  .cover .subtitle { font-size: 14px; color: #475569; }
  .goal { display: inline-block; margin-top: 10px; padding: 9px 18px; border-radius: 999px; background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; font-size: 15px; font-weight: 800; }
  .hero { margin: 2px 0 16px; } .heroname { font-size: 13px; font-weight: 700; color: #0369a1; margin-top: -24px; }
  .intro { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 18px 12px; margin: 4px 24px; text-align: left; }
  .intro h3 { font-size: 15px; margin: 0 0 4px; } .intro ul { margin: 0; padding-left: 1.2em; display: grid; gap: 2px; } .intro li { font-size: 13px; line-height: 1.7; }
  .materials { margin: 8px 24px 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; align-items: center; font-size: 12px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 8px 10px; }
  .materials span { border: 1px solid #cbd5e1; border-radius: 999px; padding: 3px 8px; background: #fff; }
  .namebox { margin: 10px 24px 0; }
  .nbrow { display: flex; align-items: flex-end; gap: 12px; font-size: 15px; margin-top: 10px; }
  .nbrow .line { flex: 1; border-bottom: 2px solid #94a3b8; height: 30px; }
  /* story */
  .strip { display: flex; align-items: center; justify-content: center; gap: 2px; margin: 8px 0; }
  .strip figure { margin: 0; text-align: center; } .strip figcaption { font-size: 11px; color: #475569; margin-top: -8px; }
  .figlabel { display: inline-block; font-size: 12px; font-weight: 800; background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 2px 9px; margin-bottom: -4px; }
  .opx { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px; } .opx span { font-size: 10px; color: #475569; font-weight: 700; white-space: nowrap; width: max-content; line-height: 1.25; }
  .step { display: flex; gap: 12px; align-items: flex-start; margin: 8px 0; }
  .num { flex: 0 0 26px; width: 26px; height: 26px; border-radius: 50%; background: #1f2937; color: #fff; font-weight: 800; text-align: center; line-height: 26px; font-size: 15px; }
  .stepbody { flex: 1; } .stepbody p { font-size: 13px; line-height: 1.85; margin: 0; }
  .stepfig { margin: 0; text-align: center; flex: 0 0 auto; } .stepfig figcaption { font-size: 10px; color: #475569; margin-top: -6px; }
  .punch { text-align: center; font-size: 15px; margin: 6px 0; line-height: 1.6; }
  .bridge { background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; line-height: 1.7; margin-top: 10px; }
  .trythis { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 13px 16px; font-size: 14px; line-height: 1.7; margin-top: 14px; text-align: center; }
  .observebox { margin-top: 10px; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 12px 14px; min-height: 280px; display: grid; grid-template-columns: auto 1fr 1fr; grid-template-rows: auto 1fr; gap: 12px 16px; font-size: 12.5px; line-height: 1.9; align-items: start; }
  .observebox b { color: #1f2937; font-size: 13px; }
  .observebox .obsfree { grid-column: 1 / 4; align-self: stretch; }
  .observebox .freelabel { display: block; }
  /* worksheet rows */
  .howto { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 7px 14px; font-size: 12px; line-height: 1.65; margin: 4px 0 8px; }
  .stlegend { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; margin: 0 0 7px; font-size: 11px; color: #475569; }
  .stlegend span { border: 1px solid #cbd5e1; background: #fff; border-radius: 999px; padding: 3px 9px; }
  .deg { font-size: 9px; color: #94a3b8; margin-left: 2px; }
  .prow { display: flex; gap: 12px; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 4px 12px; margin-bottom: 6px; }
  .pairs .prow { padding: 3px 10px; margin-bottom: 4px; gap: 10px; }
  .tallrows .prow { padding: 8px 12px; margin-bottom: 8px; }
  .pleft { width: 33%; border-right: 2px dashed #e2e8f0; padding-right: 10px; } .tleft { width: 30%; }
  .tagline { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .tag { display: inline-block; font-weight: 800; font-size: 15px; padding: 1px 11px; border-radius: 6px; }
  .taghint { color: #64748b; font-size: 10px; font-weight: 700; }
  .answerhint { color: #b91c1c; font-size: 10px; font-weight: 900; margin-bottom: 2px; }
  .seq { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
  .col { display: flex; flex-direction: column; gap: 3px; align-items: center; }
  .boxwrap { text-align: center; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 3px 5px 4px; }
  .pairs .boxwrap { background: transparent; border: 0; padding: 0; }
  .exfill { text-align: center; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 4px; background: #fffef7; display: inline-block; }
  .exlabel { font-size: 9px; color: #dc2626; margin-top: 1px; }
  .pright { flex: 1; }
  .spheres { display: flex; align-items: center; justify-content: center; gap: 5px; } .spheres figure { margin: 0; text-align: center; }
  .pright { text-align: center; }
  .flowline { gap: 4px; align-items: flex-start; }
  .spheres figcaption { font-size: 10px; color: #475569; margin-top: -5px; line-height: 1.15; font-weight: 700; }
  .pairs .spheres figcaption { font-size: 9.4px; }
  .tallrows .spheres figcaption { font-size: 9.2px; }
  .actstep { width: 72px; height: 74px; position: relative; display: inline-flex; flex-direction: column; align-items: center; align-self: flex-start; gap: 1px; padding-top: 0; }
  .tallrows .actstep { width: 64px; height: 66px; }
  .actgive { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); display: inline-flex; align-items: center; justify-content: center; }
  .tallrows .actgive { top: 3px; }
  .actgive svg { flex: 0 0 auto; }
  .actturn { position: absolute; left: 50%; top: -3px; transform: translateX(-50%); font-size: 7.4px; color: #475569; line-height: 1; text-align: center; font-weight: 800; white-space: nowrap; }
  .tallrows .actturn { top: -4px; }
  .pairs .actturn { font-size: 7.8px; }
  .actturn b, .actturn-main { display: inline; white-space: nowrap; }
  .actsep { color: #94a3b8; margin: 0 1px; }
  .actturn ruby rt { font-size: 5px; }
  .actdeg { display: inline; color: #94a3b8; font-size: 6.4px; font-weight: 700; margin-left: 1px; }
  .actarrow { position: absolute; left: 50%; top: 33px; transform: translateX(-50%); width: 34px; height: 10px; line-height: 0; }
  .tallrows .actarrow { top: 29px; }
  .foot { position: absolute; left: 13mm; right: 13mm; bottom: 8mm; border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
  .foot sup { font-size: 7px; }
  .concl { font-size: 11.5px; line-height: 1.45; } .concl b { font-size: 12.5px; }
  .note { font-size: 9.5px; color: #0369a1; margin-top: 3px; }
  .why { font-size: 11px; color: #dc2626; font-weight: 700; text-align: center; margin-top: 4px; }
  .rowdivider { text-align: center; margin: 4px 0 5px; color: #5b21b6; font-weight: 800; font-size: 12px; }
  /* swap page */
  .swapdemo { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 8px 0; }
  .swapdemo figure { margin: 0; text-align: center; } .swapdemo figcaption { font-size: 11px; color: #475569; margin-top: -6px; }
  .swapmid { text-align: center; display: flex; flex-direction: column; align-items: center; } .swapmid span { font-size: 10px; color: #b45309; }
  .freewrite { border: 2px dashed #cbd5e1; border-radius: 12px; height: 120px; margin-top: 8px; padding: 8px 12px; display: flex; flex-direction: column; }
  .freewrite .fwh { font-size: 12px; color: #64748b; }
  .promptlines { display: grid; gap: 12px; margin-top: 18px; color: #475569; font-size: 13px; flex: 1; grid-template-rows: auto auto 1fr; }
  .triplememo .promptlines { grid-template-rows: auto auto auto 1fr; }
  .guided .promptlines span:not(.freeprompt) { border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
  .freeprompt { min-height: 0; }
  .amida { text-align: center; } .amidacap { font-size: 11px; color: #475569; margin-top: -2px; line-height: 1.4; }
  .amidarow { display: flex; justify-content: center; align-items: flex-start; gap: 18px; margin: 6px 0; }
  .finish { display: flex; align-items: center; gap: 20px; margin-top: 12px; }
  .finish svg { transform: rotate(-7deg); }
  .namebox2 { display: flex; align-items: flex-end; gap: 10px; font-size: 13px; flex: 1; }
  .namebox2 .line { flex: 1; border-bottom: 1.5px solid #94a3b8; height: 26px; } .namebox2 .line.short { flex: 0 0 90px; }
  .spheres figcaption.last { color: #1f2937; font-weight: 700; }
  /* block intro */
  .grouphead { margin: 11px 0 3px; font-size: 10.5px; font-weight: 800; color: #334155; border-left: 4px solid #94a3b8; padding-left: 8px; }
  .brow { display: flex; align-items: center; gap: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 3px 12px; margin-bottom: 4px; }
  .bg { width: 112px; text-align: center; } .bname { font-size: 12px; font-weight: 800; margin-top: 1px; }
  .brow figure { margin: 0; text-align: center; } .brow figcaption { font-size: 10.4px; font-weight: 700; color: #334155; margin-top: -8px; }
  .bfact { flex: 1; font-size: 11.5px; line-height: 1.45; }
  .amida { text-align: center; margin: 8px 0; }
  /* 解説ページ（おとな向け） */
  .adultsummary { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 12px; font-size: 11.5px; margin: 4px 0 8px; }
  .adultsummary span { border: 1px solid #cbd5e1; border-radius: 999px; padding: 3px 8px; background: #fff; }
  .about h3 { font-size: 14px; margin: 10px 0 4px; color: #1f2937; }
  .sect { margin-bottom: 5px; }
  .sect p { font-size: 12.5px; line-height: 1.85; margin: 2px 0; }
  .mat { display: inline-grid; grid-template-rows: 1fr 1fr; grid-auto-flow: column; column-gap: 9px; padding: 2px 7px; margin: 0 2px; position: relative; vertical-align: middle; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; line-height: 1.35; }
  .mat.vec { column-gap: 0; }
  .mat::before, .mat::after { content: ''; position: absolute; top: 1px; bottom: 1px; width: 4px; border: 1.4px solid #334155; }
  .mat::before { left: 1px; border-right: 0; } .mat::after { right: 1px; border-left: 0; }
  .mat > span { text-align: center; min-width: 11px; }
  .eq { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; margin: 8px 0 2px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
  .eqnote { font-size: 12px; color: #475569; margin: 0 0 8px 14px; }
  .ann { font-size: 10px; color: #64748b; margin-left: 3px; } .frac { font-family: Georgia, serif; } .sup { font-size: 0.7em; vertical-align: super; }
  .miniglobe { float: right; text-align: center; margin: -4px 0 4px 14px; } .miniglobe figcaption { font-size: 10px; color: #475569; margin-top: -4px; line-height: 1.4; }
  .gaterow { display: flex; gap: 8px; justify-content: center; margin: 4px 0 8px; }
</style></head>
<body>
  ${coverPage()}
  ${storyPage()}
  ${introPage()}
  ${pairsPage()}
  ${triplesPage('④ 3つのブロックでマッチ（その1）・ p.5', 'H ではさむと、まん中が変身する', '外がわの <b>H</b> 2つが消えて、まん中のブロックが<b>べつのブロックに変身</b>するよ。', TRIPLES_H, 5, 360)}
  ${triplesPage('④ 3つのブロックでマッチ（その2）・ p.6', 'S・T ではさむと？', '同じように、外がわの2つではさんで観察しよう。ぜんぶ消えることもあるよ。', TRIPLES_ST, 6)}
  ${swapPage()}
  ${aboutPage()}
</body></html>`;

const landingHtml = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA² なつやすみ じゆうけんきゅう ワークシート</title>
<meta name="description" content="パズルゲーム QA² であそびながら量子コンピューターの不思議をしらべる、小学生向けA4・全8ページの印刷用PDFです。">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans CJK JP', sans-serif; color: #172033; background: linear-gradient(180deg, #f8fbff 0%, #ffffff 42%); }
  main { min-height: 100vh; display: grid; place-items: center; padding: 32px 18px; }
  .card { width: min(760px, 100%); background: rgba(255,255,255,0.92); border: 1px solid #dbe7f3; border-radius: 28px; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.10); padding: clamp(28px, 6vw, 56px); text-align: center; }
  .kicker { color: #4f46e5; font-weight: 800; letter-spacing: .14em; font-size: 14px; }
  h1 { margin: 12px 0 14px; font-size: clamp(30px, 6vw, 52px); line-height: 1.2; letter-spacing: -0.03em; }
  p { margin: 0 auto; max-width: 36em; color: #475569; font-size: 17px; line-height: 1.85; }
  .actions { margin-top: 30px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  a { color: inherit; }
  .button { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 24px; border-radius: 999px; font-weight: 800; text-decoration: none; }
  .primary { background: #172033; color: #fff; box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18); }
  .secondary { border: 1px solid #cbd5e1; color: #334155; background: #fff; }
  .note { margin-top: 18px; color: #64748b; font-size: 13px; }
</style></head><body><main>
  <section class="card">
    <div class="kicker">QA² 夏休み自由研究</div>
    <h1>量子コンピューターの<br>不思議をしらべよう</h1>
    <p>パズルゲーム <b>QA²</b> であそびながら完成させる、小学生向けの観察ノートです。A4・全8ページの印刷用PDFをダウンロードできます。</p>
    <div class="actions">
      <a class="button primary" href="./qa2-worksheet.pdf" download>PDFをダウンロード</a>
      <a class="button secondary" href="./qa2.html">HTML版を見る</a>
    </div>
    <div class="note">外部サイトから直接リンクする場合は <code>https://qniapp.github.io/qa2-worksheet/qa2-worksheet.pdf</code> を使えます。</div>
  </section>
</main></body></html>`;

const DIST = join(OUT, 'dist');
mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, 'qa2.html'), html);
writeFileSync(join(DIST, 'index.html'), landingHtml);
writeFileSync(join(DIST, '.nojekyll'), '');
console.log('wrote dist/qa2.html and dist/index.html');
