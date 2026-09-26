# ASTRAL CORE / NEURAL SYNC TEST
60秒で未来のコアと同期する、光・音・タッチのミニゲーム。
公開: https://dicek9750.github.io/astral-core-demo/
## 遊び方
コアまたは「接続する」でスタート。中央をタップし、長押しとダブルタップを組み合わせます。ページ再読み込みなしで再挑戦できます。
| 操作 | 効果 |
| --- | --- |
| タップ | 0.38〜1.3秒程度の間隔で高効率。0.34秒未満の連打は加点なし |
| 長押し → 離す | 0.9〜1.55秒でPERFECT CHARGE。リングと短い文字で離す瞬間を案内 |
| ダブルタップ | NOVA。クールダウン3.2秒。通常タップとの二重加点なし |
| TAP → TAP → HOLD → NOVA | 全操作成功時にSYNC CHAINボーナス |
| OVERDRIVE | ENERGY 80、SYNC 50%、タップ4回・成功チャージ2回・NOVA2回で解放可能。80 ENERGY消費、9秒間の加点倍率1.25倍 |
| 右上サウンド | ミュート切替。音声は操作後に開始 |
PCはクリックで同じ操作。コアにフォーカスしたSpaceは長押し。ボタン外にフォーカスがある場合、SpaceでOVERDRIVE、NでNOVA。非表示・ウィンドウ離脱時は自動停止し、「接続を再開する」で残り時間から再開します。
## スコアとランク
タップは基本6点／適切な間隔14点、チャージは12点／成功44点、NOVAは36点。コンボ倍率は1 + min(COMBO,20) × 0.025、異なる種類の操作をつなぐと1.12倍。SYNC CHAINは40点。無操作3.2秒または不完全なチャージ・リズムでコンボをリセットします。SYNCは得点÷13を上限100%にした値。成功した操作が1種類だけなら69.9%、2種類なら84.9%が上限です。
| クラス | 条件 |
| --- | --- |
| C / LINKED | 基本クラス |
| B / SYNCHRONIZED | SYNC 35%以上 |
| A / RESONANT | SYNC 65%以上、タップ6回・成功チャージ2回・NOVA2回 |
| S / OVERDRIVE | SYNC 85%以上、OVERDRIVE経験、成功チャージ4回・NOVA4回 |
| SS / SINGULARITY | SYNC 95%以上、SINGULARITY到達 |
上位から順に判定。タップのみでは最高Bです。
SINGULARITYは40秒経過後、OVERDRIVE中にSYNC 88%以上・現在COMBO 18以上・適切なタップ10回・成功チャージ5回・NOVA5回を達成し、そのOVERDRIVE中に6回以上の成功入力と成功チャージ／NOVAの両方を行うと発動。専用の金色調・幾何学構造・和音・振動を使います。
結果にはクラス、SYNC、最大コンボ、NOVA数、OVERDRIVE状態、結果の数値だけから生成するCORE IDを表示。CORE IDは端末／個人の識別子ではありません。BEST SYNC／BEST CLASS／MAX COMBOのみlocalStorageに保存し、拒否・破損・容量不足でもプレイできます。
## 技術
単一のindex.html、Vanilla JavaScript、Canvas 2D、Web Audio。API／CDN／追加ライブラリ／外部素材／広告／トラッキング／個人情報取得なし。AIとの接続や同期はゲーム演出です。DPR上限1.65（小画面）／1.8（大画面）、負荷連動軽量化、背景と発光素材のキャッシュ、エフェクト数上限、非表示時描画停止、safe-area、動的ビューポート、reduced-motionを維持。
## 検証
```sh
node tests/check-source.cjs
node tests/game.cjs
node tests/interaction.cjs
python3 -m http.server 8000
```
ゲームのルール検査は出荷するモデルを直接抽出して実行します。操作検査はDOM・Canvas・Web Audioのモックで、タイマー、操作、音声開始制限、中断復帰、再挑戦、保存失敗を確認します。
ブラウザQA: `/tests/preview.html`。320×568、375×812、390×844、430×932、390×660、844×390、1920×1080の実CSS領域で、ボタン・文字・重なり・オーバーフローを検査。「上級操作を60秒検証」は実ブラウザ内の合成PointerEventで実時間のゲームを操作します。画面寸法の検査・合成入力は端末実機のタッチ、Safari、音質、振動、safe-area、FPSの保証を代替しません。
