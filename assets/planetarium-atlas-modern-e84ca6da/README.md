# Stellarium Modern：星座絵と位置登録データ

2026-11-01取得。ゲームの従来画像とは別に保持した28星座の研究・統合用データ。`manifest.json` はゲーム内の星座キーを使う。各 `anchors` の `pos` は画像内の基準ピクセル、`hip` はHipparcos番号、`raDeg` / `decDeg` はJ2000の赤経・赤緯（度）。

## 星座絵・登録点

- 著者：Johan Meuris / Stellarium Project。作品は [Stellarium constellation art](https://johanmeuris.eu/work/stellarium-constellation-art/)（2005）。
- 原典：[Stellarium modern、固定コミット e84ca6da77de85dd73093ca8fe98e37c849e6ad3](https://github.com/Stellarium/stellarium/tree/e84ca6da77de85dd73093ca8fe98e37c849e6ad3/skycultures/modern)。`sources/modern-index.json` および `sources/modern-description.md` は当該コミットから取得したもの。
- 画像：[Free Art License 1.3](https://artlibre.org/licence/lal/en/)。このディレクトリの `originals/` は原図と同じバイト列を保持しており。加工・配布の際は、著者、加工者、変更内容、ライセンス、原図・変更版へのアクセス先を示し、加工版にも同ライセンスまたは互換ライセンスの条件を適用する。原図の場所：[illustrations](https://github.com/Stellarium/stellarium/tree/e84ca6da77de85dd73093ca8fe98e37c849e6ad3/skycultures/modern/illustrations)。
- 加工者：Codex / OpenAI。原図の黒を透明度に変換し、青色に着色して可逆WebPとして保存。ゲーム内では星図との位置合わせと合成を行う。加工済み画像は `derived/` にあり、[FAL 1.3](https://artlibre.org/licence/lal/en/) で提供する。各ファイルのSHA-256、原図との対応とバイト数は `derived-manifest.json` を参照。これらはゲーム本体に埋め込まれた画像そのもので、`extract-derived.cjs` により新規抽出した。
- 公式のテキスト・登録点データ：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。当データセットは28件・各3点を抽出し、星番号に座標を加えた。

## 星の座標と精度

- 25星座75点は、[astronomy-glasses の25星座データ、固定コミット eb12621f6ce58a797b244c67b248240fefb4228a](https://github.com/alexgraz360/astronomy-glasses/blob/eb12621f6ce58a797b244c67b248240fefb4228a/phase1/data/constellation-art.json)を経由して [HYG Database v4.1](https://github.com/astronexus/HYG-Database) のJ2000座標を参照した。HYGは David Nash / Astronexus、[CC BY-SA 4.0](https://github.com/astronexus/HYG-Database/blob/main/LICENSE)。元データの赤経は0.0001時間単位、赤緯は0.0001度単位に丸められている。赤経を15倍して度に換算した。丸めによる最大の差は、赤経約0.00075度、赤緯約0.00005度（天球上の誤差とは異なる）。
- みなみじゅうじ座・ぎょしゃ座・りゅう座の9点は [CDS SIMBAD](https://simbad.cds.unistra.fr/simbad/) の明示的なICRS J2000値を参照。SIMBADはサービスの利用条件として [ODbL](https://opendatacommons.org/licenses/odbl/1-0/) を示している。`manifest.json` は各HIP番号のURLと元の時分秒・度分秒も保持し、時分秒を度へ換算した。引用は Wenger et al. 2000, A&AS 143, 9（https://doi.org/10.1051/aas:2000332）、CDS/SIMBAD, Strasbourg。
- 座標の時代はどちらもJ2000。別資料で見つかったJ2016値は使用していない。25星座由来JSONの原本は `sources/hyg25-original.json`。

## 内容一覧

| キー | IAU | 画像 | キー | IAU | 画像 |
| --- | --- | --- | --- | --- | --- |
| orion | Ori | Ori.png | lyra | Lyr | Lyr.png |
| canis | CMa | CMa.png | gemini | Gem | Gem.png |
| crux | Cru | Cru.png | cygnus | Cyg | Cyg.png |
| aquila | Aql | Aql.png | scorpius | Sco | Sco.png |
| ursaMajor | UMa | UMa.png | ursaMinor | UMi | UMi.png |
| cassiopeia | Cas | Cas.png | leo | Leo | Leo.png |
| canisMinor | CMi | CMi.png | bootes | Boo | Boo.png |
| virgo | Vir | Vir.png | sagittarius | Sgr | Sgr.png |
| pegasus | Peg | Peg.png | andromeda | And | And.png |
| aries | Ari | Ari.png | taurus | Tau | Tau.png |
| auriga | Aur | Aur.png | perseus | Per | Per.png |
| draco | Dra | Dra.png | cancer | Cnc | Cnc.png |
| libra | Lib | Lib.png | capricornus | Cap | Cap.png |
| aquarius | Aqr | Aqr.png | pisces | Psc | Psc.png |

画像パスはすべて `originals/` 内。原図のGit blob SHA-1と登録点は `manifest.json`、加工版のSHA-256は `derived-manifest.json` に記載。合致は登録点に関するもので、図全体の投影精度や実画面の見た目を保証するものではない。
