# ASTRAL CORE / REMOTE GHOST DUEL
60秒から始め、天体の爆発連鎖で時間を延ばし、小さなCOREを成長させるミニゲーム。
公開: https://dicek9750.github.io/astral-core-demo/
## LOCAL WORLD MODEL（Step 13）

COREを支えるローカル予測系を追加。MODELボタンなどから最大1.5秒先の連鎖を投影し、候補となる天体と光路を短く表示します。結果は既存の操作ヒント枠へ一時表示し、中央COREの面積を維持します。通常の投影枠は1プレイ3回までで、初回と昇格時の自動投影も含みます。OVER DRIVE中の再始動予測は別枠です。既存のR3の物理・採点・Seed・Ghost形式は変更していません。起爆やARMED選択はプレイヤーが行い、予測系が勝手に実行することはありません。

| 協調する処理 | 実際の役割 |
| --- | --- |
| SCOUT | 現在の天体配置から密度を観測し、候補を最大4個に絞る |
| SIMULATOR | 世界を複製し、既存の軌道・衝撃波ロジックで短い未来を再生する |
| ROUTER | 再生で実際に伝播した連鎖の光路を取り出す |
| OPTIMIZER | 連鎖数・吸収質量・成長・時間報酬から候補を比較する |

SEED／PULSEではCORE内で計算し、ORBIT到達でSCOUTとSIMULATOR、STELLARでROUTER、NOVAでOPTIMIZERも衛星的な協調ノードとして可視化します。処理役割そのものは初期段階から存在します。

CHAIN COMPILERは天体タップ、BURST SOLVERは既存CORE BURST、PHASE ANCHORはOVER DRIVE中のARMED候補と再始動をそれぞれ投影する専用処理です。新しい起爆能力や加点倍率を作るツールではありません。通常プレイでは直近24件までの操作傾向を候補比較に反映し、Challenge／Daily／Ghostでは固定の比較重みを使います。履歴はそのプレイだけのものです。

投影は「複製した時点の配置で、指定操作だけを行った場合」の条件付き予測です。1/30秒と1/60秒刻みで対象ID・連鎖数・吸収質量・成長・時間報酬が一致した候補はSTABLE、異なる候補はVOLATILEとして扱い、後の入力や連鎖結果を保証しません。有効な枝がなければNO BRANCH。VOID中は「触らない」の操作指示を優先し、通常の投影を開始しません。共有された連鎖グループとPRNG状態も複製し、本体の天体・スコア・生成順を変更せず、処理量を小さなステップへ分割します。OVER DRIVE中は現実の世界を静止させたまま、再始動を仮定した複製世界で評価します。

これはブラウザ内で動く決定的な協調サブルーチンです。LLM、学習済み生成モデル、外部API、SDK、オンライン通信は使用していません。設計上の参考は、OpenAI Agents SDKの[Tools](https://openai.github.io/openai-agents-python/tools/)・[Handoffs](https://openai.github.io/openai-agents-python/handoffs/)・[Tracing](https://openai.github.io/openai-agents-python/tracing/)にある役割分担と観測可能な実行経路、およびGoogle DeepMindの[Genie 3原典](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)にある行動に応じた環境変化のシミュレーションです。これらの製品やモデルを実行しているという意味ではありません。

`tests/agentic.cjs`の111検査で世界の非変更、PRNG再現、同じ刻みでの投影と実結果、ツールの使用条件、決定性、履歴上限、公平な固定重み、予測処理量、5Hz描画時の予測完了、長押し中の予測と解放操作の分離、MODEL操作・保存失敗・VOID指示・既存モードとの互換を検証します。従来の553検査も継続し、合計664検査です。実機の描画速度・音・触覚と、公開版の表示は別途確認します。

## 現行 R3 / OVER DRIVE & CORE GROWTH（Step 12）

通常・新規Challenge・Dailyの既定は`rules=R3`。流星→捕獲→衛星→起爆連鎖の仕組みを継続し、吸収によるCORE成長と最大30秒の時間延長を追加しました。旧R1/R2のURLは元のルールで読み込み、異なるRules同士の記録は比較しません。

**OVER DRIVE**は「時間を止め、星を選び、再始動で一斉起爆する」必殺技です。ENERGY 80以上・SYNC 35%以上・天体8個以上の吸収でREADY。選べる天体が3個未満なら、集まるまでボタンを待機表示にします。ボタンをタップすると実時間5秒だけ世界が止まり、画面に`SELECT STARS`／`RESTART IN`と選択数を表示します。選んだ星はARMEDとなり、終了時に同一フレームで起爆。1プレイ2回まで、発動開始から世界時間14秒の再充填が必要です。停止中は残り時間・天体・連鎖波・UNKNOWN SIGNAL・Ghostも進みません。CORE BURSTは従来どおり3回、0.9〜1.55秒で最適解放です。

| 連鎖・同時起爆 | 同じ連鎖グループの時間報酬 |
| --- | --- |
| 1〜2連鎖 | なし |
| 3連鎖 | 累計 +0.5秒 |
| 5連鎖 | 累計 +1.0秒 |
| 8連鎖以上 | 累計 +1.5秒 |
| 3個以上の同時起爆 | 上記へ一度だけ +1.0秒 |

閾値を越えた差分だけを加算し、1グループ最大+2.5秒、1プレイ合計最大+30秒。ゲーム時間は60〜90秒で有限、OVER DRIVEの実時間は別です。追加された時間にもSeedから決まる天体流入が続きます。

COREの描画サイズは基準の0.48倍から1倍へ滑らかに成長。吸収質量に連鎖倍率と同時起爆倍率が加わり、単発より大連鎖が効率的です。昇格しても既に存在する天体を置き換えず、新しい流入対象が変化します。

| CORE段階 | 累計成長量 | 新しく引き寄せる天体 |
| --- | --- | --- |
| SEED | 0 | dust／debris／gas |
| PULSE | 18 | fragment／mineral／ice |
| ORBIT | 45 | proto-star／star |
| STELLAR | 85 | star／proto-star |
| NOVA | 135 | named-star |

Named starsはSirius、Vega、Polaris、Rigel、Betelgeuse、Antares、Aldebaran、Procyon。捕獲後2.4秒間、英語名を控えめに表示します（選択中も表示）。連鎖段階に応じてMETEOR SHOWER／AURORA STREAM／SOLAR FLARE／MILKY WAY／SUPERNOVA／EVENT HORIZONを表示し、光流とCOREへの吸収を主役にします。結果には到達CORE段階・追加時間・最大宇宙現象・最大吸収天体を表示。SINGULARITYはR2の複数条件と演出順序を継続します。

R3 Ghostは`gver=3`、61点を1.5秒間隔で最大90秒まで記録。ヘッダーに終了時の世界時間（60〜90秒、0.1秒単位）を持ち、終了後のサンプルは最終状態を保持します。共有URLは1,000文字未満に制限し、JSONや全入力履歴は含みません。R1の`gver=1`、R2の`gver=2`の61点・1秒間隔はそのまま維持。再生・勝敗・Rematchは同じSeedとRules同士で扱います。

R3 Challenge例: https://dicek9750.github.io/astral-core-demo/?challenge=A7F291C8&rules=R3

`tests/galaxy.cjs`の新規134検査は、名称・READY・成長・時間報酬・対象進化・Named stars・1.5秒Ghost再生・旧R1/R2互換・Daily・Rematch・保存／共有フォールバックを確認します。活動天体18個・衝撃波24個の上限、DPR制限、非表示停止を維持しています。

## 旧R2 / ORBIT & TIME LOCK（Step 11）

以下はR2の仕様です。現在の操作画面での必殺技名はOVER DRIVEに統一しています。

星片は画面外からCOREへ引き寄せられ、捕獲後は軌道を回り続けます。時間経過だけでは消えず、画面内の活動星片は最大18個。星片をタップすると即起爆し、波が届いた周囲の星片へ連鎖します。

| 操作 | R2での動作 |
| --- | --- |
| 星片をタップ | 即起爆し、CHAINからSCORE／SYNC／COMBO／ENERGYを得る |
| COREを0.9秒以上長押しして離す | CORE BURSTを1回使い、中心から軌道を横切る起爆波を放つ。1プレイ3回まで。早すぎる解放は消費しない |
| 素早く2回タップ | NOVA。通常入力との使い分けと3.2秒のクールダウンは継続 |
| TIME LOCK | 既存のOVERDRIVE解放条件とENERGY消費で実時間5秒だけ世界を止める。1プレイ2回まで、使用開始から世界時間14秒の再充填。停止中に星片を選ぶとARMEDになり、終了時にすべて同時起爆する。ゲームの60秒時計・UNKNOWN SIGNAL・Ghost再生も停止 |

新規ChallengeとDailyは`rules=R2`、R2のGhostは`gver=2`を発行します。旧`rules=R1`と`gver=1`のURLは従来の星連鎖・9秒OVERDRIVEで読み込めます。異なるRules Versionの記録は同条件の対戦として混ぜません。共有にはSeedと結果の量子化した61点だけを用い、アカウント・サーバー・端末IDは不要です。

R2 Challenge例: https://dicek9750.github.io/astral-core-demo/?challenge=A7F291C8&rules=R2

R2のSINGULARITYは40秒以降、TIME RESTARTで3個以上を一斉起爆し、その連鎖が未選択の星片へ伝播して8連鎖以上になると発動候補。SYNC 88%以上、COMBO 18以上、良好TAP 10回、成功HOLD 5回、NOVA 5回も必要です。再始動・連鎖・CORE吸収の後に専用演出を表示。

## 遊び方（以下はR1の詳細。共通の操作・採点要素はR2にも継続）
画面の光る星をタップすると即座にはじけ、広がった光のリングに触れた星が次々と爆発します。星を直接タップするとそのままゲームが始まります。密集した星や大きい光輪の星を狙い、連鎖を伸ばしてください。中央COREのタップや「同期を始める」でも開始でき、ページ再読み込みなしで再挑戦できます。

| 操作 | 効果 |
| --- | --- |
| 星をタップ | 即時に爆発。0.3〜1.3秒程度の間隔で操作入力も高効率。衝撃波が届いた星は連鎖してSCORE／SYNC／COMBO／ENERGYが増える |
| 長押し → 離す | 0.9〜1.55秒でPERFECT CHARGE。星で放出すると爆発範囲が広がる |
| ダブルタップ | NOVA。周囲の星をまとめて起爆。クールダウン3.2秒中のタップも通常入力として受理 |
| TAP → TAP → HOLD → NOVA | 全操作成功時にSYNC CHAINボーナス |
| OVERDRIVE | ENERGY 80、SYNC 50%、タップ4回・成功チャージ2回・NOVA2回で解放可能。80 ENERGY消費、9秒間の加点倍率1.25倍 |
| 右上サウンド | ミュート切替。音声は操作後に開始 |

PCはクリックで同じ操作。コアにフォーカスしたSpaceは長押し。ボタン外にフォーカスがある場合、SpaceでOVERDRIVE、NでNOVA。非表示・ウィンドウ離脱時は自動停止し、「接続を再開する」で残り時間から再開します。
## スコアとランク
タップは120ms未満2点、120〜300ms未満4点、適切な間隔14点、遅い入力6点。チャージは12点／成功44点、NOVAは36点。連鎖星は1個目10点から1個ごとに3点増え、20個目以降は67点。各爆発でCOMBOとENERGYも上がります。コンボ倍率は通常操作に1 + min(COMBO,20) × 0.025、異なる操作をつなぐと1.12倍。従来のTAP→TAP→HOLD→NOVAボーナスは40点。無操作3.2秒または不完全なチャージ・リズムでコンボをリセットします。SYNCは得点÷13を上限100%にした値。成功した操作が1種類だけなら69.9%、2種類なら84.9%が上限です。

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
単一のindex.html、Vanilla JavaScript、Canvas 2D、Web Audio。API／CDN／追加ライブラリ／外部素材／広告／トラッキング／個人情報取得なし。AIとの接続や同期はゲーム演出です。星はChallenge Seedから決まる星座と出現順で描画し、通常モードのみ匿名の乱数Seedを使います。星18個・星の衝撃波24個を上限に管理。DPR上限1.65（小画面）／1.8（大画面）、負荷連動軽量化、背景と発光素材のキャッシュ、非表示時描画停止、safe-area、動的ビューポート、reduced-motionを維持。
## 検証
```sh
node tests/check-source.cjs
node tests/game.cjs
node tests/interaction.cjs
node tests/challenge.cjs
node tests/ghost.cjs
node tests/ux.cjs
node tests/input.cjs
node tests/stars.cjs
node tests/orbit.cjs
node tests/galaxy.cjs
node tests/agentic.cjs
python3 -m http.server 8000
```
ゲームのルール検査は出荷するモデルを直接抽出して実行します。操作検査はDOM・Canvas・Web Audioのモックで、タイマー、操作、音声開始制限、中断復帰、再挑戦、保存失敗を確認します。
ブラウザQA: `/tests/preview.html`。320×568、375×812、390×844、430×932、390×660、844×390、1920×1080の実CSS領域で、ボタン・文字・重なり・オーバーフローを検査。「成長プレイを検証」は実ブラウザ内の合成PointerEventで実時間のゲームを操作します。画面寸法の検査・合成入力は端末実機のタッチ、Safari、音質、振動、safe-area、FPSの保証を代替しません。

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
60秒後は厳密な最終得点の大小からVICTORY／DEFEAT／DRAWを決定。両者のSCORE・CLASS、DELTA、相手のSYNC／MAX COMBO、元の自分の各結果を表示。R1の信号順序とgver=1の記録形式は維持。今回の星連鎖と前回の高速タップ改善で採点が変化したため、過去の旧版Ghost URLも再生できますが、異なる公開版で記録されたスコアの厳密な公平性は保証しません。Ghost記録は自分の採点や星の出現順を変更しません。
SEND REMATCHは古いGhostをURLへ継ぎ足さず、自分の最新記録1本へ置換。同じSeedで何往復してもURLが伸び続けません。Web Share→Clipboard→選択可能URLの順にフォールバックし、共有シートのキャンセルは静かに終了します。
Daily自体は維持し、その結果もGhost化できます。自動保存のDaily自己ベストGhost再戦は未追加です。

### Ghost検証
`tests/ghost.cjs` はバイナリ往復、量子化、最終得点の完全保存、URL長、破損・未知version・Seed不一致・巨大値、時計と重要イベント、追い抜きcooldown、3種類の勝敗、Rematch、共有フォールバック、既存モードを検証します。
ブラウザQAには「タップ中心の記録」「結果のGhost URLを取得」「記録を別ページで対戦」を追加。実時間60秒のChallengeから実際の共有URLを生成し、そのURLだけでページを作り直して混合操作で対戦できます。3秒の出遅れを入れ、相手先行→追い抜きを観測します。合成ポインターの検証であり、実機タッチ・音質・振動・ネイティブ共有シートの確認は別です。
配列は各記録61サンプル、再生の通常更新はO(1)、低頻度フレームで飛ばした重要イベントの処理も最大60回。相手の描画は固定数の円弧のみ。既存のDPR上限・描画キャッシュ・軽量化・エフェクト数制限を維持しています。
