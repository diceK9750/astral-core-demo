# ASTRAL CORE / REMOTE GHOST DUEL
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
node tests/challenge.cjs
node tests/ghost.cjs
python3 -m http.server 8000
```
ゲームのルール検査は出荷するモデルを直接抽出して実行します。操作検査はDOM・Canvas・Web Audioのモックで、タイマー、操作、音声開始制限、中断復帰、再挑戦、保存失敗を確認します。
ブラウザQA: `/tests/preview.html`。320×568、375×812、390×844、430×932、390×660、844×390、1920×1080の実CSS領域で、ボタン・文字・重なり・オーバーフローを検査。「上級操作を60秒検証」は実ブラウザ内の合成PointerEventで実時間のゲームを操作します。画面寸法の検査・合成入力は端末実機のタッチ、Safari、音質、振動、safe-area、FPSの保証を代替しません。

## REMOTE CHALLENGE / R1
起動時のNORMAL TEST / CHALLENGEで切替。Challenge URLでは自動でCHALLENGEを選択します。コアに触れて60秒開始。結果から同じSeedを共有し、友人とSCOREを比較できます。通常結果の「CREATE A CHALLENGE」は、新しい共通条件での60秒プレイを開始します（通常の結果をChallenge結果として扱いません）。
例: https://dicek9750.github.io/astral-core-demo/?challenge=A7F291C8&rules=R1

Seedは8桁のASCII英数字、大文字へ正規化。重複・不正Seed、2,048文字を超えるqueryは通常モードに安全に戻します。crypto.getRandomValues優先、非対応時だけMath.randomで新規Seedを生成。個人・端末情報は使いません。FNV-1a + Mulberry32でイベント順とPULSEの位相を決定し、演出粒子の乱数とゲーム条件を分離。共有URLは余計なquery/hashを除きます。R1はこのルール版の識別子です。
全Seedは8秒から5種×2回、1イベント3.2秒、同じスロット時刻・最大+1000点です。順序は前半／後半でそれぞれシャッフル。警告・赤紫の軌道／異常波形・短い操作指示が出現し、排除するとシアンに押し返します。

| UNKNOWN SIGNAL | 対応 |
| --- | --- |
| PULSE | 光る合図の±0.24秒以内にタップ。1.1秒周期 |
| JAM | 0.48秒以上離してタップ2回。連打は減点 |
| PHASE SHIFT | 0.9〜1.55秒の成功チャージ |
| OVERLOAD | NOVA。通常の3.2秒クールダウンを維持 |
| VOID | 3.2秒触れずに待つ。無入力ならコンボ待機時間を保護。跨いだ長押しも接触扱い |

対応成功は各+100点。誤入力は-10点（VOID接触は-30）、未達成終了時は合計-30点まで。各イベントの損失上限-30。排除後は通常入力に戻れます。SCORE = max(0, round(通常得点 + 干渉対応点))。SYNC・ランク・SINGULARITYは通常得点だけで判定し、干渉ボーナスでランクを水増ししません。SCOREは同一Seed・同一ルール版で比較してください。各Seedのボーナス上限とイベント数は等しいですが、順序と個人の操作習熟によって実得点は異なります。

結果: NEURAL CLASS、SYNC、SCORE、MAX COMBO、NOVA、OVERDRIVE、SINGULARITY、Challenge ID、CORE ID、同一Seedの自己ベストとの差、排除数。Challengeのベストは通常BESTと独立し、localStorageに直近24Seedまで保存。保存不可でも動作します。認証やサーバー検証がないため競技用の不正防止・ランキングはありません。
共有: Web Share → Clipboard API → 選択可能なURL欄。ネイティブ共有のキャンセルは何も送らず終了。ブラウザ制限で共有／コピーが失敗しても手動コピー可能です。
Daily: CHALLENGEを選ぶと小さなDAILY / JSTボタンが表示されます。JSTの暦日（0時切替）から決定したSeedで、そのプレイ中は日付が変わっても固定。共有先も同じSeedです。端末時計が誤っている場合はDaily選択日もずれます。
テスト: `tests/challenge.cjs` は200Seedの公平な配分、決定性、各干渉の応答・タイムスタンプ境界、URL安全性、Daily境界、結果・共有フォールバック・保存例外を検査。`tests/preview.html` のモード切替で公開Challengeも実時間60秒の操作シナリオと全寸法検査が可能です。

## REMOTE GHOST DUEL / G1
非同期のゴースト対戦です。サーバー通信、オンライン相手の現在地・接続状態、実際のAI解析を表すものではありません。Challenge／Dailyを60秒プレイ → GHOST CHALLENGE → URLを友人へ送る → 同じSeedの記録と対戦 → SEND REMATCHで自分の新しい記録を送り返す、という往復ができます。通常モード・SeedだけのChallenge共有は維持しています。結果のSEED ONLYから従来のURLを共有できます。

### 記録・URL形式
`?challenge=8桁Seed&rules=R1&gver=1&ghost=Base64URL`
0秒の初期値＋1〜60秒の61サンプルを記録し、0秒は省略してバイナリ化。全入力イベントやJSONは格納しません。
- ヘッダー23 bytes: magic・format version、Seedの8 ASCII bytes（完全一致検証）、最終SCORE uint32、最終SYNC 0.1%単位uint16、CLASS uint8、MAX COMBO uint8、NOVA COUNT uint8、CORE ID 4 bytes。多バイト整数はbig endian。
- 各秒: SCOREを10点単位へ量子化し、前秒との差をZigZag＋7bit可変長整数に変換。SYNCは整数%、COMBOは0〜255、flagsはOVERDRIVE継続／SINGULARITY／その秒のNOVA／OVERDRIVE開始。それぞれ1 byte。
- 末尾4 bytes: FNV-1aチェックサム。破損検出であり、認証・不正防止ではありません。
- 途中の得点誤差は最大5点、SYNCは最大0.5%。最後の得点・SYNC・CLASSは丸める前の値を別保存。最終勝敗に量子化誤差は入りません。
- 名前、個人情報、端末ID、IP、ブラウザ情報、暦時刻は含みません。CORE IDは成績だけから生成する既存IDです。
- デコード前にquery・payload長を制限し、文字種、余剰ビット、バイト長、version、Seed、checksum、整数上限、各サンプル・最終値・イベント数の整合を確認。未知形式・壊れた記録はGhostなしのChallengeへ戻し、query全体が過大・Challenge Seedも無効ならNORMALへ戻します。
- 有効スコアは0〜60000、サンプル間の変動は2500点以下を許容。これはデータ破損への防御であり、改ざんした成績の真正性を保証しません。

### 再生・対戦
時刻から配列のindexを直接計算し、隣り合う1秒サンプルを補間。相手の途中スコアは再現用の近似値で、入力そのものの再現ではありません。NOVA・OVERDRIVE・SINGULARITYは1秒単位の残響として各1回再生。非表示／ポーズ中は自分と相手の時間が一緒に止まり、再挑戦で両方0秒へ戻ります。
HUDをTIME／YOU／RIVAL／DELTAへ置換し、中央COREの面積を維持。相手はアンバー色の点線リング、UNKNOWN SIGNALは赤紫として区別します。差が25点未満はNECK AND NECK、相手先行から自分先行へ変わるとOVERTAKE。追い抜き演出のcooldownは4秒。相手の重要イベントは短い文字とリング残響で表示します。
60秒後は厳密な最終得点の大小からVICTORY／DEFEAT／DRAWを決定。両者のSCORE・CLASS、DELTA、相手のSYNC／MAX COMBO、元の自分の各結果を表示。採点ロジックはR1のままで、Ghostが採点やSeedイベントを変更することはありません。
SEND REMATCHは古いGhostをURLへ継ぎ足さず、自分の最新記録1本へ置換。同じSeedで何往復してもURLが伸び続けません。Web Share→Clipboard→選択可能URLの順にフォールバックし、共有シートのキャンセルは静かに終了します。
Daily自体は維持し、その結果もGhost化できます。自動保存のDaily自己ベストGhost再戦は未追加です。

### Ghost検証
`tests/ghost.cjs` はバイナリ往復、量子化、最終得点の完全保存、URL長、破損・未知version・Seed不一致・巨大値、時計と重要イベント、追い抜きcooldown、3種類の勝敗、Rematch、共有フォールバック、既存モードを検証します。
ブラウザQAには「タップ中心の記録」「結果のGhost URLを取得」「記録を別ページで対戦」を追加。実時間60秒のChallengeから実際の共有URLを生成し、そのURLだけでページを作り直して混合操作で対戦できます。3秒の出遅れを入れ、相手先行→追い抜きを観測します。合成ポインターの検証であり、実機タッチ・音質・振動・ネイティブ共有シートの確認は別です。
配列は各記録61サンプル、再生の通常更新はO(1)、低頻度フレームで飛ばした重要イベントの処理も最大60回。相手の描画は固定数の円弧のみ。既存のDPR上限・描画キャッシュ・軽量化・エフェクト数制限を維持しています。
