import {
  INTRO_BLOCKS,
  LABELS,
  N,
  PAGE_COPY,
  PAIRS,
  TRIPLES_H,
  TRIPLES_ST,
} from '../../content/worksheet-content.mjs';
import { CAMERA_FRONT, rotate } from './geometry.mjs';
import { axisStyle, GATES, hsv, turnWords } from './gates.mjs';
import { furi, wrapJa } from './ruby.mjs';
import { arrowhead } from './svg-primitives.mjs';
import {
  afterGateCaption,
  arrowR,
  fillBox,
  gateBlock,
  globe,
  inlineGatePair,
  mat,
  mix,
  renderContentMarkup,
  sakuraStamp,
  stateFigure,
  stepAction,
  storyAction,
  swapIcon,
  vec,
} from './artwork.mjs';

const copy = PAGE_COPY;
const markup = s => renderContentMarkup(s);
const cfuri = s => furi(markup(s));

export const headTitle = sub => `<div class="head"><div class="title">${furi(copy.headTitle)}</div><div class="sub">${furi(sub)}</div></div>`;
export const footer = n => `<div class="foot"><span>${copy.footer}</span><span>${n} / 8</span></div>`;

function pairRow(p) {
  // 右側には答え（結論）を書かない。球は状態、間のカードは操作として分けて見せる。
  const g = GATES[p.g], s0 = p.start, s1 = rotate(s0, g.axis, g.angle), s2 = rotate(s1, g.axis, g.angle);
  const box = p.example ? fillBox(68, LABELS.vanish) : fillBox(68);
  const exlabel = p.example ? `<div class="exlabel">${furi(LABELS.exampleWriting)}</div>` : '';
  const why = p.hint ? `<div class="why">${cfuri(p.hint)}</div>` : '';
  const tagBg = mix(g.color, '#ffffff', 0.72), tagTx = mix(g.color, '#000000', 0.38);
  const afterCaption = afterGateCaption([p.g]);
  const afterPairCaption = afterGateCaption([p.g, p.g]);
  return `<div class="prow"><div class="pleft"><div class="tagline"><div class="tag" style="background:${tagBg};color:${tagTx}">${p.tag}</div><div class="taghint">${p.g}${LABELS.twoBlocksSuffix}</div></div>
    <div class="seq"><div class="col">${gateBlock(p.g, 38)}${gateBlock(p.g, 38)}</div>${arrowR()}<div class="boxwrap"><div class="answerhint">${furi(LABELS.writeHere)}</div>${box}${exlabel}</div></div></div>
    <div class="pright"><div class="spheres flowline">
      ${stateFigure(74, s0, LABELS.firstState)}
      ${stepAction(p.g)}
      ${stateFigure(74, s1, afterCaption, s0, g.axis, g.angle)}
      ${stepAction(p.g)}
      ${stateFigure(74, s2, afterPairCaption, s1, g.axis, g.angle)}
    </div>${why}</div></div>`;
}

function triRow(p) {
  const gs = p.blocks.map(t => GATES[t]);
  const states = [p.start];
  for (const g of gs) states.push(rotate(states[states.length - 1], g.axis, g.angle));
  let spheres = stateFigure(66, states[0], LABELS.firstState);
  p.blocks.forEach((block, i) => {
    const caption = afterGateCaption(p.blocks.slice(0, i + 1));
    spheres += stepAction(block) + stateFigure(66, states[i + 1], caption, states[i], gs[i].axis, gs[i].angle);
  });
  const box = p.example
    ? (p.result === 'vanish' ? fillBox(64, LABELS.vanish) : `<div class="exfill">${gateBlock(p.result.block, 42)}</div>`)
    : fillBox(64);
  const exlabel = p.example ? `<div class="exlabel">${furi(LABELS.exampleWriting)}</div>` : '';
  const why = p.hint ? `<div class="why">${cfuri(p.hint)}</div>` : '';
  const tagBg = mix(gs[0].color, '#ffffff', 0.72), tagTx = mix(gs[0].color, '#000000', 0.38);
  const divider = p.divider ? `<div class="rowdivider">${cfuri(p.divider)}</div>` : '';
  return `${divider}<div class="prow"><div class="pleft tleft"><div class="tagline"><div class="tag" style="background:${tagBg};color:${tagTx}">${p.tag}</div><div class="taghint">${p.blocks.join('・')}</div></div>
    <div class="seq"><div class="col">${p.blocks.map(t => gateBlock(t, 34)).join('')}</div>${arrowR()}<div class="boxwrap"><div class="answerhint">${furi(LABELS.writeHere)}</div>${box}${exlabel}</div></div></div>
    <div class="pright"><div class="spheres flowline">${spheres}</div>${why}</div></div>`;
}

function introRow(b) {
  const g = GATES[b.g], st = axisStyle(g.axis);
  const axisName = st.name === LABELS.diagonalAxisBase ? LABELS.diagonalAxisName : st.name + LABELS.axisSuffix;
  const cap = `<b style="color:${st.color}">${axisName}</b>${LABELS.axisAround}<b>${turnWords(g.angle)}</b>`;
  return `<div class="brow">
    <div class="bg">${gateBlock(b.g, 44)}<div class="bname">${furi(b.name)}</div></div>
    <figure>${globe({ size: 80, skin: 'bloch', state: b.start, spin: { axis: g.axis, angle: g.angle } })}<figcaption>${furi(cap)}</figcaption></figure>
    <div class="bfact">${cfuri(b.fact)}</div>
  </div>`;
}

export const introPage = () => `<div class="page">
  ${headTitle(copy.intro.sub)}
  <h2><span class="dot"></span>${furi(copy.intro.heading)}</h2>
  <div class="howto">${furi(copy.intro.howto)}</div>
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
  s += `<text x="${(ax+bx)/2}" y="${ySwap-9}" font-size="9" fill="#b45309" text-anchor="middle">${copy.swap.swapLabel}</text>`;
  s += `<g transform="translate(${ax-blk/2},${yTop-blk/2})">${gateBlock('H', blk)}</g><g transform="translate(${bx-blk/2},${yBot-blk/2})">${gateBlock('H', blk)}</g>`;
  s += `<text x="${bx + blk / 2 + 8}" y="${yBot+3}" font-size="11" fill="#dc2626" font-weight="700">${copy.swap.alignedLabel}</text>`;
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
  s += `<text x="${(a + b) / 2}" y="${s1 - 9}" font-size="9" fill="#b45309" text-anchor="middle">${copy.swap.swapLabel}</text>`;
  s += `<text x="${(b + c) / 2}" y="${s2 - 9}" font-size="9" fill="#b45309" text-anchor="middle">${copy.swap.swapLabel}</text>`;
  s += `<g transform="translate(${a - blk / 2},${yTop - blk / 2})">${gateBlock('H', blk)}</g>`;
  s += `<g transform="translate(${c - blk / 2},${yBot - blk / 2})">${gateBlock('H', blk)}</g>`;
  s += `<text x="${c + blk / 2 + 8}" y="${yBot + 3}" font-size="11.5" fill="#dc2626" font-weight="700">${copy.swap.alignedLabel}</text>`;
  s += `</svg>`;
  return s;
}

export const coverPage = () => `<div class="page cover">
  <div class="kicker">${furi(copy.cover.kicker)}</div>
  <h1>${furi(copy.cover.titleLine1)}${furi(copy.cover.titleLine1Suffix)}<br>${furi(copy.cover.titleLine2)}${furi(copy.cover.titleLine2Suffix)}</h1>
  <div class="subtitle">${furi(copy.cover.subtitle)}</div>
  <div class="goal">${furi(copy.cover.goal)}</div>
  <div class="hero">${globe({ size: 220, skin: 'earth', state: N, face: true, poleLabels: false, camera: CAMERA_FRONT })}<div class="heroname">キュービット${furi(copy.cover.heroNameSuffix)}</div></div>
  <div class="intro">
    <h3>📚 ${furi(copy.cover.introHeading)}</h3>
    <ul>
      ${copy.cover.introItems.map(item => `<li>${furi(item)}</li>`).join('')}
    </ul>
  </div>
  <div class="materials"><b>${LABELS.materialsHeading}</b>${copy.cover.materials.map(item => `<span>${item}</span>`).join('')}</div>
  <div class="namebox">
    <div class="nbrow"><span>${LABELS.name}</span><div class="line"></div></div>
    <div class="nbrow"><span>${furi(copy.cover.gradeLabel)}・${furi(copy.cover.classLabel)}</span><div class="line"></div></div>
  </div>
  ${footer(1)}
</div>`;

export const storyPage = () => `<div class="page">
  ${headTitle(copy.story.sub)}
  <h2><span class="dot"></span>${furi(copy.story.heading)}</h2>
  <div class="step"><div class="num">1</div>
    <div class="stepbody"><p>${furi(copy.story.step1)}</p></div>
    <figure class="stepfig">${globe({ size: 100, skin: 'earth', state: N, face: true, poleLabels: false })}<figcaption>${furi(copy.story.figureQubit)}</figcaption></figure>
  </div>
  <div class="step"><div class="num">2</div>
    <div class="stepbody"><p>${furi(copy.story.step2)}</p></div>
  </div>
  <div class="step"><div class="num">3</div>
    <div class="stepbody"><p>${furi(copy.story.step3)}</p></div>
    <figure class="stepfig">${gateBlock('X', 48)}</figure>
  </div>
  <div class="step"><div class="num">4</div>
    <div class="stepbody">
      <p>${cfuri(copy.story.step4)}</p>
      <div class="strip">
        <figure><div class="figlabel">${furi(copy.story.northLabel)}</div>${globe({ size: 124, skin: 'earth', state: N, face: true, poleLabels: false })}<figcaption>${furi(copy.story.northCaption)}</figcaption></figure>
        ${storyAction('X')}
        <figure><div class="figlabel">${furi(copy.story.southLabel)}</div>${globe({ size: 124, skin: 'earth', state: [0,0,-1], face: true, poleLabels: false, ghostState: N, axisHighlight: GATES.X.axis, pathAxis: GATES.X.axis, pathAngle: 180 })}<figcaption>${furi(copy.story.southCaption)}</figcaption></figure>
        ${storyAction('X')}
        <figure><div class="figlabel">${furi(copy.story.returnLabel)}</div>${globe({ size: 124, skin: 'earth', state: N, face: true, poleLabels: false, ghostState: [0,0,-1], axisHighlight: GATES.X.axis, pathAxis: GATES.X.axis, pathAngle: 180 })}<figcaption>${furi(copy.story.returnCaption)}</figcaption></figure>
      </div>
    </div>
  </div>
  <div class="step"><div class="num">5</div>
    <div class="stepbody"><p>${cfuri(copy.story.step5)} ${inlineGatePair('X')} ＝ <span class="red">${furi(copy.story.match)}</span></p></div>
  </div>
  <div class="trythis">${cfuri(copy.story.tryThis)}</div>
  <div class="observebox"><b>${furi(copy.story.memoHeading)}</b><div class="obsline">${furi(copy.story.expected)}：${copy.story.expectedOptions.map(option => `□ ${furi(option)}`).join('　')}</div><div class="obsline">${furi(copy.story.result)}：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div><div class="obsfree"><span class="freelabel">${furi(copy.story.noticed)}：</span></div></div>
  ${footer(2)}
</div>`;

export const pairsPage = () => `<div class="page pairs">
  ${headTitle(copy.pairs.sub)}
  <h2><span class="dot"></span>${furi(copy.pairs.heading)}</h2>
  <div class="howto">${furi(copy.pairs.howto)}</div>
  ${PAIRS.map(pairRow).join('')}
  ${footer(4)}
</div>`;

export const triplesPage = (sub, heading, lead, rows, n, memo) => `<div class="page triples ${n === 6 ? 'tallrows' : ''}">
  ${headTitle(sub)}
  <h2><span class="dot"></span>${cfuri(heading)}</h2>
  <div class="howto">${cfuri(lead + copy.triples.howtoSuffix)}</div>
  ${rows.map(triRow).join('')}
  ${memo ? `<div class="freewrite guided triplememo" style="height:${memo}px"><div class="fwh">${LABELS.memoIcon} ${furi(copy.triples.memoHeading)}</div><div class="promptlines">${copy.triples.hPrompts.map(prompt => `<span>${markup(prompt)}</span>`).join('')}<span class="freeprompt">${copy.triples.freePrompt}</span></div></div>` : ''}
  ${footer(n)}
</div>`;

export const swapPage = () => `<div class="page">
  ${headTitle(copy.swap.sub)}
  <h2><span class="dot"></span>${furi(copy.swap.heading)}</h2>
  <p class="lead">${furi(copy.swap.lead)}</p>
  <div class="amidarow">
    <div class="amida">${amidakujiDemo()}<div class="amidacap">${cfuri(copy.swap.cap1)}</div></div>
    <div class="amida">${amidakujiDemo2()}<div class="amidacap">${cfuri(copy.swap.cap2)}</div></div>
  </div>
  <div class="trythis">${furi(copy.swap.tryThis)}</div>
  <div class="freewrite guided" style="height:300px"><div class="fwh">${LABELS.memoIcon} ${furi(copy.swap.memoHeading)}</div><div class="promptlines"><span>${furi(copy.swap.matchedBlocks)}：＿＿＿＿＿＿</span><span>${furi(copy.swap.usedSwap)}：＿＿こ</span><span class="freeprompt">${furi(copy.swap.noticed)}：</span></div></div>
  <div class="finish">${sakuraStamp()}<div class="namebox2"><span>${LABELS.name}</span><div class="line"></div><span>${furi(LABELS.date)}</span><div class="line short"></div></div></div>
  ${footer(7)}
</div>`;

export const aboutPage = () => `<div class="page about">
  ${headTitle(copy.about.sub)}
  <h2><span class="dot"></span>${copy.about.heading}</h2>
  <div class="sect">
    <h3>${copy.about.qubitTitle}</h3>
    <div class="miniglobe">${globe({ size: 122, skin: 'bloch', state: [0.5, 0, 0.866] })}<figcaption>${copy.about.miniCaption}</figcaption></div>
    <p>${wrapJa(copy.about.qubitText)}</p>
  </div>
  <div class="sect">
    <h3>${copy.about.gateTitle}</h3>
    <div class="gaterow">${['H', 'X', 'Y', 'Z', 'S', 'T'].map(g => gateBlock(g, 30)).join('')}</div>
    <p>${wrapJa(copy.about.gateText)}</p>
  </div>
  <div class="sect">
    <h3>${copy.about.mathTitle}</h3>
    <p>${wrapJa(copy.about.stateVectorText)}</p>
    <div class="eq">|0⟩ = ${vec('1', '0')}　|1⟩ = ${vec('0', '1')}　|+⟩ = <span class="frac">1/√2</span> ${vec('1', '1')}</div>
    <p>${wrapJa(copy.about.unitaryText)}</p>
    <div class="eq">X = ${mat('0', '1', '1', '0')}<span class="ann">x軸 180°</span> 　Z = ${mat('1', '0', '0', '-1')}<span class="ann">z軸 180°</span> 　S = ${mat('1', '0', '0', 'i')}<span class="ann">z軸 90°</span> 　H = <span class="frac">1/√2</span>${mat('1', '1', '1', '-1')}</div>
    <p>${wrapJa(copy.about.applyText)}</p>
    <div class="eq">例1：X|0⟩ = ${mat('0', '1', '1', '0')}${vec('1', '0')} = ${vec('0', '1')} = |1⟩</div>
    <div class="eqnote">${wrapJa(copy.about.eqNote1)}</div>
    <div class="eq">例2：X·X|0⟩ = X|1⟩ = |0⟩</div>
    <div class="eqnote">${wrapJa(copy.about.eqNote2)}</div>
    <div class="eq">例3：S·S = ${mat('1', '0', '0', 'i')}<span class="sup">2</span> = ${mat('1', '0', '0', '-1')} = Z</div>
    <div class="eqnote">${wrapJa(copy.about.eqNote3)}</div>
  </div>
  <div class="sect">
    <h3>${copy.about.aimTitle}</h3>
    <p>${wrapJa(copy.about.aimText)}</p>
  </div>
  ${footer(8)}
</div>`;

export function worksheetPages() {
  return [
    coverPage(),
    storyPage(),
    introPage(),
    pairsPage(),
    triplesPage(copy.triplesH.sub, copy.triplesH.heading, copy.triplesH.lead, TRIPLES_H, 5, copy.triplesH.memoHeight),
    triplesPage(copy.triplesST.sub, copy.triplesST.heading, copy.triplesST.lead, TRIPLES_ST, 6),
    swapPage(),
    aboutPage(),
  ];
}
