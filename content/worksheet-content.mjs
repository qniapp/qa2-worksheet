// Worksheet manuscript and structured problem data.
// Rendering helpers such as Bloch spheres and gate SVGs live under src/worksheet/.

export const N = [0, 0, 1];
export const EQ = [1, 0, 0];
// ④2本目の出発点。北半球のななめを向いた状態＝ヘルシンキ（北緯60.2度）のあたり。
// この緯度は図の都合でもあり、(1) xじくの上を外して X でちゃんと向きが変わり、
// (2) 赤いやじるしが顔の目（中心から約28度）を横切らず、(3) 回転の軌跡が赤いやじるしと重ならない。
// 東京（北緯35.7度）だと (2)(3) がどちらも成り立たないので、緯度が図と合う都市名を選んでいる。
const HELSINKI_LAT = Math.PI * 60 / 180, HELSINKI_LON = Math.PI * 25 / 180;
export const HELSINKI = [Math.cos(HELSINKI_LAT) * Math.cos(HELSINKI_LON), Math.cos(HELSINKI_LAT) * Math.sin(HELSINKI_LON), Math.sin(HELSINKI_LAT)];
export const FRONT_Y = [0, -1, 0]; // |0>北極 / |+>赤道(東京) / 手前のYじく側

export const LABELS = {
  firstState: 'さいしょの向き',
  writeHere: 'ここに書く',
  exampleWriting: '↑ 書き方の例',
  vanish: '消える',
  nonVanish: '消えない',
  name: 'なまえ',
  date: '日づけ',
  materialsHeading: 'つかうもの',
  coverDoIcon: '📚',
  coverMaterialsIcon: '✏️',
  coverAppIcon: '📱',
  twoBlocksSuffix: 'が2こ',
  axisAround: 'のまわりを',
  afterGateSuffix: 'のあと',
  questionMark: '？',
  vanishRubyHint: 'き',
  memoIcon: '✏️',
  diagonalAxisBase: 'ななめ',
  diagonalAxisName: 'ななめじく',
  axisSuffix: 'じく',
  northPole: '北極',
  northPoleRuby: 'ほっきょく',
  southPole: '南極',
  southPoleRuby: 'なんきょく',
};

export const DECORATION_COPY = {
  sakuraStamp: ['よく', 'できました'],
};

// 表紙に載せる QA² アプリのダウンロード先。URL から QR コードを生成する。
export const APP_LINKS = [
  { platform: 'iPhone・iPad', store: 'App Store', url: 'https://apps.apple.com/jp/app/qa/id6747648497' },
  { platform: 'Android', store: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.TIS.QA2' },
];

// ペア（2ブロック）
export const PAIRS = [
  { tag: 'X²', g: 'X', start: N,  result: 'vanish', example: true, hint: 'やじるしが もとどおり だから 消える' },
  { tag: 'Y²', g: 'Y', start: N,  result: 'vanish' },
  { tag: 'Z²', g: 'Z', start: FRONT_Y, result: 'vanish', note: '赤道からスタート' },
  { tag: 'H²', g: 'H', start: N,  result: 'vanish' },
  { tag: 'S²', g: 'S', start: FRONT_Y, result: { block: 'Z' }, note: '赤道からスタート' },
  { tag: 'T²', g: 'T', start: FRONT_Y, result: { block: 'S' }, note: '赤道からスタート' },
];

// トリプル（3ブロック）。外側2つが消え、まん中が変身（または全部消える）
export const TRIPLES_H = [
  { tag: 'HXH', blocks: ['H', 'X', 'H'], start: EQ, result: { block: 'Z' }, note: '赤道からスタート', example: true, hint: 'zじくのまわりを 半周 ＝ <Gate name="Z" />と同じ' },
  { tag: 'HZH', blocks: ['H', 'Z', 'H'], start: N,  result: { block: 'X' } },
  { tag: 'HYH', blocks: ['H', 'Y', 'H'], start: N,  result: { block: 'Y' } },
];

export const TRIPLES_ST = [
  { tag: 'SXS', blocks: ['S', 'X', 'S'], start: FRONT_Y, result: { block: 'X' }, note: '赤道からスタート', example: true, hint: 'xじくのまわりを 半周 ＝ <Gate name="X" />と同じ' },
  { tag: 'SYS', blocks: ['S', 'Y', 'S'], start: FRONT_Y, result: { block: 'Y' }, note: '赤道からスタート' },
  { tag: 'SZS', blocks: ['S', 'Z', 'S'], start: FRONT_Y, result: 'vanish', note: '赤道からスタート' },
  { tag: 'TST', blocks: ['T', 'S', 'T'], start: FRONT_Y, result: { block: 'Z' }, note: '赤道からスタート', divider: '<Gate name="T" />ではさんでみよう' },
];

// ブロック紹介（名前・回転じく・回転量）
export const INTRO_BLOCKS = [
  // 他のブロックと同じく「じく・回転量」を先に言う。＋マークの話はそのあと（名前は X なのに絵は ＋）。
  { group: 'まずは半周のブロック', g: 'X', name: 'X ブロック', start: N, fact: 'xじくで半周。マークは X じゃなくて <b>＋</b>を使うよ。' },
  { g: 'Y', name: 'Y ブロック', start: N, fact: 'yじくで半周。<Gate name="X" />と、まわる向きがちがうんだ。' },
  { g: 'Z', name: 'Z ブロック', start: FRONT_Y, fact: 'たての zじくで半周。北極・南極は動かないよ。' },
  { group: 'ななめに半周', g: 'H', name: 'H ブロック', start: N, fact: 'xじくとzじくのまん中のななめじくで半周。' },
  { group: '小さい回転', g: 'S', name: 'S ブロック', start: FRONT_Y, fact: 'zじくを4分の1周。2つあつまると <Gate name="Z" />に変身！' },
  { g: 'T', name: 'T ブロック', start: FRONT_Y, fact: 'zじくを8分の1周。2つで <Gate name="S" />に変身！' },
];

export const PAGE_COPY = {
  headTitle: 'QA<sup>2</sup> 観察ノート',
  footer: 'QA<sup>2</sup> なつやすみ じゆうけんきゅう ワークシート',
  cover: {
    kicker: '夏休み 自由研究',
    titleLine1: '量子',
    titleLine1Suffix: 'コンピューターの',
    titleLine2: '不思議',
    titleLine2Suffix: 'を しらべよう',
    subtitle: 'パズルゲーム <b>QA²</b> で あそびながら 完成させる 観察ノート',
    goalLabel: '今日のゴール',
    goal: 'ブロックをならべると「消える／変身する」を見つけよう',
    heroName: 'キュービット',
    heroNameSuffix: '君',
    introHeading: 'この自由研究でやること',
    introItems: ['<b>QA²であそぶ</b>', '<b>ブロック＝命令</b> の動きを観察する', '気づいた法則をこのプリントに書く'],
    materials: ['□ QA²', '□ このプリント', '□ えんぴつ', '□ いろえんぴつ'],
    downloadHeading: 'QA² を ダウンロードしよう',
    downloadLead: 'おうちの人と いっしょに QRコードを よみとってね',
    downloadNote: 'むりょうで あそべるよ',
    gradeLabel: '学年',
    classLabel: '組',
  },
  story: {
    sub: '① キュービット君って？ ・ p.2',
    heading: 'キュービット君と、ブロックのひみつ',
    step1: 'キュービット君は、ゲーム <b>QA²</b> には出てこないけれど <b>かげの主役</b>。量子コンピューターの中の「<b>データ</b>」＝計算のたんい として、とても大切なやくわりをしているよ。',
    figureQubit: 'キュービット君',
    step2: 'キュービット君の <b>赤いやじるし</b> は、いつも <b>地球上の一点</b> を指しているよ。東京を指したり、北極を指したり、南極を指したり……いろいろ！',
    step3: 'ここで <b>ブロック</b> のとうじょう！ ブロックをキュービット君にわたすと、指す <b>向きが変わる</b> よ。ブロックは量子コンピューターの「<b>命令</b>」。キュービット君といっしょに計算をすすめていくんだ。',
    figureXBlock: 'Xブロック',
    step4: '<Gate name="X" /> は、やじるしが <b>どこを向いていても</b> <b style="color:#f59e0b">xじく</b>を中心に <b>半周</b> まわすブロック。まずは <b>北極</b> のキュービット君で見てみよう。',
    step4b: 'つぎは <b>ヘルシンキ（フィンランド）</b> を指しているキュービット君。出発点がちがっても、同じ <b style="color:#f59e0b">xじく</b>のまわりを 半周。<b>2回わたすと 半周＋半周＝1周</b>で、やじるしは <b>元に戻った！</b>',
    // 出発点をかえても「Xを2回で元に戻る」が同じように成り立つことを見せる2本のストリップ
    flips: [
      { start: N, frames: [
        { label: '① 北極', caption: '北極を指している' },
        { label: '② X後：南極', caption: '南極へ' },
        { label: '③ 2回目：北極', caption: '元に戻った！' },
      ] },
      { start: HELSINKI, frames: [
        { label: '① ヘルシンキ', caption: 'ヘルシンキを指している' },
        { label: '② X後：南半球', caption: '南半球へ' },
        { label: '③ 2回目：ヘルシンキ', caption: '元に戻った！' },
      ] },
    ],
    step5: '元に戻った＝ <b><Gate name="X" />を2回わたす意味がない</b>。だから <b><GatePair name="X" /></b> のならびがあったら <b>消してもいい</b>！ キュービット君には なんの えいきょうもないからね。',
    match: 'マッチして消える！',
    tryThis: '🎮 やってみよう：QA² で <b><Gate name="X" />を2つ たてにそろえて</b>、ほんとうに消えるか たしかめてみよう！',
    memoHeading: '観察メモ',
    expected: '予想',
    expectedOptions: ['消える', '消えない'],
    result: '結果',
    noticed: '気づいたこと',
  },
  intro: {
    sub: '② ブロックのなかまたち ・ p.3',
    heading: 'ブロック（量子ゲート）には、6つのなかま',
    howto: 'ブロックをキュービット君にわたすと、キュービット君の<b>やじるし</b>が<b>くるっと回転</b>するよ。<b>まわるじく</b>と<b>まわる量</b>のちがいを、よく観察しよう。',
  },
  pairs: {
    sub: '③ 2つのブロックでマッチ ・ p.4',
    heading: '2つのブロックを「上下にそろえる」とどうなる？',
    howto: '<b>かきかた：</b> 答えは<b>左の大きな点線の四角だけ</b>に書く。ぜんぶ消えるときは <span class="red">「消える」</span> とかこう。',
  },
  triplesH: {
    sub: '④ 3つのブロックでマッチ（その1）・ p.5',
    heading: '<Gate name="H" />ではさむと、まん中が変身する',
    lead: '外がわの <Gate name="H" /> 2つが消えて、まん中のブロックが<b>べつのブロックに変身</b>するよ。',
    memoHeight: 360,
  },
  triplesST: {
    sub: '④ 3つのブロックでマッチ（その2）・ p.6',
    heading: '<Gate name="S" />・<Gate name="T" /> ではさむと？',
    lead: '同じように、外がわの2つではさんで観察しよう。ぜんぶ消えることもあるよ。',
  },
  triples: {
    howtoSuffix: ' 前のページと同じように考えよう。',
    memoHeading: 'よそう・きづいたこと',
    hPrompts: [
      '<Gate name="H" />ではさむと <Gate name="X" /> は ＿＿ になる',
      '<Gate name="H" />ではさむと <Gate name="Z" /> は ＿＿ になる',
      '<Gate name="H" />ではさむと <Gate name="Y" /> は ＿＿ になる',
    ],
    freePrompt: 'そのほか きづいたこと：',
  },
  swap: {
    sub: '⑤ はってん：SWAP（スワップ）・ p.7',
    heading: 'はってん：SWAP は「あみだくじ」みたいな命令',
    lead: '<b>SWAP（スワップ）</b>は、棒でつながった2つの道（レーン）を<b>いれかえる</b>命令。あみだくじみたいに線をたどると、はなれた2つのブロックが <b>上下にそろう</b> ことがあるよ！',
    swapLabel: 'SWAP',
    alignedLabel: 'そろう！',
    cap1: 'SWAP 1つ：<Gate name="H" /> と <Gate name="H" /> がそろって <span class="red">消える</span>',
    cap2: 'SWAP 2つ＝2段：もっと はなれた <Gate name="H" /> もそろう！',
    tryThis: '🎉 長い あみだくじを つくって マッチさせると、QA² では <b>高とくてん</b>！ いろんな つなぎかたを ためして、いままでの 消えるマッチを SWAP ごしに そろえてみよう。',
    memoHeading: 'みつけたマッチ・きづいたこと',
    matchedBlocks: 'そろったブロック',
    usedSwap: '使ったSWAP',
    noticed: '気づいたこと',
  },
  about: {
    sub: 'おうちの方・先生へ ・ p.8',
    heading: 'この教材の背景（おとなの方へ）',
    qubitTitle: '量子ビット（qubit）とキュービット君',
    miniCaption: '北極＝|0⟩ ・ 南極＝|1⟩<br>とちゅう＝重ね合わせ',
    qubitText: 'ふつうのコンピューターの最小単位「ビット」は 0 か 1 のどちらかしか表せません。量子コンピューターの「量子ビット（qubit）」は、本教材のキュービット君と同じく、球面（ブロッホ球）上の任意の向きを取れます。北極が |0⟩、南極が |1⟩ に対応し、ふつうのビットと同じ 0・1 はもちろん、その「重ね合わせ」＝球面上のあらゆる状態を表せます。これが、古典コンピューターには難しい計算や表現を可能にします。',
    gateTitle: '量子ゲート＝ブロック',
    gateText: '量子ビットを操作する命令が「量子ゲート」で、本教材のブロックそのものです。H・X・Y・Z・S・T という記号や見た目は、大学の教科書や研究論文で使われるものとまったく同じです。お子さんはゲームを通じて、本物の量子計算の記法に触れています。',
    mathTitle: '数学的には',
    stateVectorText: 'キュービット君の状態は「状態ベクトル」で表されます。',
    unitaryText: '各ゲートは「ユニタリ行列」＝ある軸を中心とする回転行列です。',
    applyText: '状態ベクトルにゲートを適用する＝行列とベクトルの掛け算です。プリントの図は、この計算の結果に対応します。',
    eqNote1: '→ キュービット君が 北極→南極 に反転（p.2 の X）。',
    eqNote2: '→ 2回で もとどおり＝マッチして消える（p.4 の X²）。',
    eqNote3: '→ S を2回で Z と同じ（p.4 の S²→Z）。T は z軸 45°（位相 e^{iπ/4}）で、2回で S になります。',
    aimTitle: 'この教材のねらい',
    aimText: '遊びと観察を通じて、重ね合わせ・量子ゲート・ユニタリ性といった量子計算の中核概念を、専門記法のまま体験的に理解することを目指します。手を動かして法則（XX＝消える、S²＝Z など）を自分で見つける過程が、後の本格的な学習の土台になります。',
  },
};

export const LANDING_COPY = {
  title: 'QA² なつやすみ じゆうけんきゅう ワークシート',
  description: 'パズルゲーム QA² であそびながら量子コンピューターの不思議をしらべる、小学生向けA4・全8ページの印刷用PDFです。',
  kicker: 'QA² 夏休み自由研究',
  heading: '量子コンピューターの<br>不思議をしらべよう',
  body: 'パズルゲーム <b>QA²</b> であそびながら完成させる、小学生向けの観察ノートです。A4・全8ページの印刷用PDFをダウンロードできます。',
  pdfButton: 'PDFをダウンロード',
  htmlButton: 'HTML版を見る',
  note: '外部サイトから直接リンクする場合は <code>https://qniapp.github.io/qa2-worksheet/qa2-worksheet.pdf</code> を使えます。',
};
