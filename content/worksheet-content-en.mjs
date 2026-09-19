// English worksheet manuscript and structured problem data.
// Framing: STEM club / science fair / classroom lab / weekend project.
// Character name: Qubit (no Japanese honorific).

export const N = [0, 0, 1];
export const SOUTH = [0, 0, -1];
export const EQ = [1, 0, 0];
const HELSINKI_LAT = Math.PI * 60 / 180, HELSINKI_LON = Math.PI * 25 / 180;
export const HELSINKI = [Math.cos(HELSINKI_LAT) * Math.cos(HELSINKI_LON), Math.cos(HELSINKI_LAT) * Math.sin(HELSINKI_LON), Math.sin(HELSINKI_LAT)];
export const FRONT_Y = [0, -1, 0];

export const LABELS = {
  firstState: 'start',
  writeHere: 'write here',
  exampleWriting: '↑ example',
  vanish: 'clears',
  nonVanish: 'stays',
  name: 'Name',
  date: 'Date',
  materialsHeading: 'What you need',
  coverDoIcon: '📚',
  coverMaterialsIcon: '✏️',
  coverAppIcon: '📱',
  twoBlocksSuffix: ' ×2',
  axisAround: ' · ',
  afterGateSuffix: ' after',
  questionMark: '?',
  vanishRubyHint: '',
  memoIcon: '✏️',
  diagonalAxisBase: 'diagonal',
  diagonalAxisName: 'diagonal',
  axisSuffix: '-axis',
  northPole: 'North',
  northPoleRuby: '',
  southPole: 'South',
  southPoleRuby: '',
  turnHalf: 'half turn',
  turnQuarter: 'quarter turn',
  turnEighth: 'eighth turn',
  turnFull: 'full turn',
};

export const DECORATION_COPY = {
  sakuraStamp: ['Well', 'done!'],
};

export const APP_LINKS = [
  { platform: 'iPhone / iPad', store: 'App Store', url: 'https://apps.apple.com/us/app/qa/id6747648497' },
  { platform: 'Android', store: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.TIS.QA2' },
];

export const PAIRS = [
  { tag: 'X²', g: 'X', start: N, result: 'vanish', example: true, hint: 'arrow back to start → clears' },
  { tag: 'Y²', g: 'Y', start: N, result: 'vanish' },
  { tag: 'Z²', g: 'Z', start: FRONT_Y, result: 'vanish', note: 'start from the equator' },
  { tag: 'H²', g: 'H', start: N, result: 'vanish' },
  { tag: 'S²', g: 'S', start: FRONT_Y, result: { block: 'Z' }, note: 'start from the equator' },
  { tag: 'T²', g: 'T', start: FRONT_Y, result: { block: 'S' }, note: 'start from the equator' },
];

export const TRIPLES_H = [
  { tag: 'HXH', blocks: ['H', 'X', 'H'], start: EQ, result: { block: 'Z' }, note: 'start from the equator', example: true, hint: 'half turn around z = same as <Gate name="Z" />' },
  { tag: 'HZH', blocks: ['H', 'Z', 'H'], start: N, result: { block: 'X' } },
  { tag: 'HYH', blocks: ['H', 'Y', 'H'], start: N, result: { block: 'Y' } },
];

export const TRIPLES_ST = [
  { tag: 'SXS', blocks: ['S', 'X', 'S'], start: FRONT_Y, result: { block: 'X' }, note: 'start from the equator', example: true, hint: 'half turn around x = same as <Gate name="X" />' },
  { tag: 'SYS', blocks: ['S', 'Y', 'S'], start: FRONT_Y, result: { block: 'Y' }, note: 'start from the equator' },
  { tag: 'SZS', blocks: ['S', 'Z', 'S'], start: FRONT_Y, result: 'vanish', note: 'start from the equator' },
  { tag: 'TST', blocks: ['T', 'S', 'T'], start: FRONT_Y, result: { block: 'Z' }, note: 'start from the equator', divider: 'Try sandwiching with <Gate name="T" />' },
];

export const INTRO_BLOCKS = [
  { group: 'Half-turn blocks', g: 'X', name: 'X block', start: N, fact: 'Half turn around the x-axis. The mark looks like <b>+</b>, not the letter X.' },
  { g: 'Y', name: 'Y block', start: N, fact: 'Half turn around the y-axis. It spins a different way than <Gate name="X" />.' },
  { g: 'Z', name: 'Z block', start: FRONT_Y, fact: 'Half turn around the upright z-axis. North and South Poles don’t move.' },
  { group: 'Diagonal half turn', g: 'H', name: 'H block', start: N, fact: 'Half turn around the diagonal axis between x and z.' },
  { group: 'Smaller turns', g: 'S', name: 'S block', start: FRONT_Y, fact: 'Quarter turn (90°) around z. Two S blocks transform into a <Gate name="Z" />!' },
  { g: 'T', name: 'T block', start: FRONT_Y, fact: 'Eighth turn (45°) around z. Two T blocks transform into an <Gate name="S" />!' },
];

export const PAGE_COPY = {
  headTitle: 'QA<sup>2</sup> observation notebook',
  footer: 'QA<sup>2</sup> observation notebook',
  cover: {
    kicker: 'STEM lab · Science fair · Weekend project',
    titleLine1: 'Explore the wonders of',
    titleLine1Suffix: '',
    titleLine2: 'quantum computers',
    titleLine2Suffix: '',
    subtitle: 'An observation notebook you finish while playing the puzzle game <b>QA²</b>',
    goalLabel: 'Today’s goal',
    goal: 'When you line up blocks, find the rules for when they clear or transform',
    heroName: 'Qubit',
    heroNameSuffix: '',
    introHeading: 'What you’ll do',
    introItems: ['Play <b>QA²</b>', 'Watch how blocks (= instructions) move', 'Write the rules you notice on this sheet'],
    materials: ['☐ QA²', '☐ This printout', '☐ Pencil', '☐ Colored pencils (optional)'],
    downloadHeading: 'Get QA²',
    downloadLead: 'Download free on the App Store or Google Play',
    downloadNote: 'Scan a QR code with a phone',
    gradeLabel: 'Grade',
    classLabel: 'School / club',
    identityFields: ['Name', 'Grade', 'School / club'],
  },
  story: {
    sub: '① Meet Qubit · p.2',
    heading: 'Qubit and the secrets of the blocks',
    step1: '<b>Qubit</b> doesn’t show up as a character inside the game, but he’s the star behind the scenes. In a quantum computer, a qubit is the basic unit of data, the thing you compute with.',
    figureQubit: 'Qubit',
    step2: 'Qubit’s <b>red arrow</b> always points to <b>one place on Earth</b>. Sometimes Tokyo, sometimes the North Pole, sometimes the South Pole… it can point anywhere!',
    step3: 'Now meet the <b>blocks</b>. When you give a block to Qubit, the direction he points <b>changes</b>. Blocks are the <b>instructions</b> of a quantum computer. Together with Qubit, they move the computation forward.',
    figureXBlock: 'X block',
    step4: '<Gate name="X" /> is one of six block types. No matter where the arrow points, X spins it halfway around the <b style="color:#f59e0b">x-axis</b> (180°). First try Qubit pointing at the <b>North Pole</b>:',
    step4b: 'Now try Qubit pointing at <b>Helsinki, Finland</b>:',
    step4bResult: 'Different starting points, same rule: half a turn around the <b style="color:#f59e0b">x-axis</b>. Two X blocks make a full turn, so the arrow <b>returns to where it started</b>.',
    flips: [
      { start: N, frames: [
        { label: '① North Pole', caption: 'pointing at the North Pole' },
        { label: '② after X: South Pole', caption: 'to the South Pole' },
        { label: '③ after X again: North', caption: 'back to the start!' },
      ] },
      { start: HELSINKI, frames: [
        { label: '① Helsinki', caption: 'pointing at Helsinki' },
        { label: '② after X: south', caption: 'to the southern hemisphere' },
        { label: '③ after X again: Helsinki', caption: 'back to the start!' },
      ] },
    ],
    step5: '“Back to start” means giving Qubit <b>two <Gate name="X" /> blocks in a row does nothing</b>. So if you see <b><GatePair name="X" /></b> stacked, you can erase them!',
    match: 'Match and clear!',
    tryThis: '🎮 Try it in QA²: Stack two <b><Gate name="X" /> blocks vertically</b> and check that they really disappear.',
  },
  intro: {
    sub: '② The block family · p.3',
    heading: 'The block family (quantum gates)',
    howto: 'When you give a block to Qubit, his <b>arrow</b> spins. Compare <b>which axis</b> it spins around and <b>how far</b>.',
  },
  pairs: {
    sub: '③ Matching two blocks · p.4',
    heading: 'What happens when you stack two of the same block?',
    howto: '<b>How to write:</b> Write only in the large dotted box on the left. If everything clears, write <span class="red">“clears”</span>.',
  },
  triplesH: {
    sub: '④ Matching three blocks (1) · p.5',
    heading: 'Sandwich with <Gate name="H" /> — the middle one transforms',
    lead: 'The outer two <Gate name="H" /> blocks clear, and the block in the middle <b>turns into a different block</b>.',
    memoHeight: 360,
  },
  triplesST: {
    sub: '④ Matching three blocks (2) · p.6',
    heading: 'Sandwich with <Gate name="S" /> or <Gate name="T" />?',
    lead: 'Same idea: put the same block on both outsides and watch. Sometimes everything clears.',
  },
  triples: {
    howtoSuffix: ' Think about it the same way as on the previous page.',
    memoHeading: 'Predict / notice',
    hPrompts: [
      'When you sandwich with <Gate name="H" />, <Gate name="X" /> becomes _____',
      'When you sandwich with <Gate name="H" />, <Gate name="Z" /> becomes _____',
      'When you sandwich with <Gate name="H" />, <Gate name="Y" /> becomes _____',
    ],
    freePrompt: 'Other things I noticed:',
  },
  swap: {
    sub: '⑤ Bonus: SWAP · p.7',
    heading: 'Bonus: SWAP is an instruction that swaps two lanes',
    lead: '<b>SWAP</b> swaps two paths (lanes) connected by a bar. Follow the wires like a zigzag maze. Blocks that looked far apart can end up <b>stacked</b>!',
    swapLabel: 'SWAP',
    alignedLabel: 'lined up!',
    cap1: 'One SWAP: two <Gate name="H" /> blocks line up and <span class="red">clear</span>',
    cap2: 'Two SWAPs (two rungs): even farther <Gate name="H" /> blocks can line up!',
    tryThis: '🎉 Challenge: Build a long SWAP “ladder,” match through it, and score big in QA². Try different wirings and line up the clearing matches you already know, across SWAP.',
    memoHeading: 'What I found',
    matchedBlocks: 'Blocks that lined up',
    usedSwap: 'Number of SWAPs I used',
    noticed: 'What I noticed',
    matchedBlocksPrompt: 'Blocks that lined up: __________',
    usedSwapPrompt: 'Number of SWAPs I used: _____',
    noticedPrompt: 'What I noticed:',
  },
  about: {
    sub: 'Background for adults · p.8',
    heading: 'Background for parents & teachers',
    qubitTitle: 'Qubits and our character “Qubit”',
    miniCaption: 'North Pole = |0⟩ · South Pole = |1⟩<br>in between = superposition',
    qubitText: 'In a normal computer, the smallest piece of information, a <b>bit</b>, is only <b>0</b> or <b>1</b>. A quantum computer’s <b>qubit</b> is like our character Qubit: it can point in <b>any direction on a sphere</b> (the Bloch sphere). North Pole ↔ |0⟩, South Pole ↔ |1⟩. In between are <b>superpositions</b>, states a classical bit can’t hold. That’s what unlocks new kinds of computation.',
    gateTitle: 'Quantum gates = the blocks',
    gateText: 'The instructions that change a qubit are <b>quantum gates</b>, exactly the blocks in this worksheet. The symbols <b>H, X, Y, Z, S, T</b> are the same ones used in university textbooks and research papers. Through the game, kids meet real quantum-computing notation.',
    mathTitle: 'In math terms (optional depth)',
    stateVectorText: 'A qubit state is a <b>state vector</b>.',
    unitaryText: 'Gates are <b>unitary matrices</b>, rotations around an axis.',
    axisNotes: { X: 'x-axis 180°', Z: 'z-axis 180°', S: 'z-axis 90°', H: 'x+z axis 180°' },
    applyText: '“Handing Qubit a block” so the red arrow moves (pp. 2–6) is what matrix × vector looks like as a picture.',
    eqNote1: '→ North Pole flips to South Pole (p.2).',
    eqWords: { soThen: 'so', identity: 'identity' },
    eqNote2: '→ Two X restore the start; “match and clear” means the stack equals the identity (p.4 X²).',
    eqNote3: '→ Two S act like Z (p.4); T is 45° on z (phase e<sup>iπ/4</sup>); two T make S.',
    aimTitle: 'Why this worksheet',
    aimText: 'Through play and careful watching, learners meet core ideas (superposition, quantum gates, unitarity) using the real symbols. Finding rules themselves (XX clears, S² = Z, and so on) builds a foundation for later study. Suggested uses: STEM club session, science-fair project log, classroom lab (1–2 periods), or a weekend project at home.',
  },
};

export const LANDING_COPY = {
  title: 'QA² observation notebook (English)',
  description: 'An A4, 8-page printable observation notebook for exploring quantum computers while playing the puzzle game QA².',
  kicker: 'QA² · STEM lab / science fair',
  heading: 'Explore the wonders of<br>quantum computers',
  body: 'An observation notebook you finish while playing <a class="gamelink" href="https://qniapp.github.io/qa2-website/">the puzzle game <b>QA²</b></a>. Download the A4, 8-page printable PDF.',
  pdfButton: 'Download PDF',
  htmlButton: 'View HTML',
  pdfHref: './qa2-worksheet-en.pdf',
  htmlHref: './qa2-en.html',
  altLangHref: './index.html',
  altLangLabel: '日本語版',
};
