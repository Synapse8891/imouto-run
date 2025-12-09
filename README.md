# Imouto Run - VS Code Extension

妹キャラクターがプログラムのエラーを面白く翻訳して教えてくれる VS Code 拡張機能です。

## 機能

- **自動実行**: Python（`.py`）と C 言語（`.c`）ファイルを自動で実行・コンパイルチェック
- **妹翻訳**: エラーメッセージを妹キャラ口調に変換して表示
- **設定で制御**: 自動実行の挙動を設定で ON/OFF 可能

## 対応言語

- **Python** (`.py`): `python` コマンドで実行
- **C** (`.c`): `gcc -fsyntax-only` でコンパイルチェック

## 設定オプション

VS Code の設定（`settings.json`）で以下の項目を制御できます:

```json
{
  "imoutoRun.autoRunOnStartup": true,   // 起動時に自動実行（既定: true）
  "imoutoRun.autoRunOnOpen": false,     // ファイルオープン時に自動実行（既定: false）
  "imoutoRun.autoRunOnSave": false      // 保存時に自動実行（既定: false）
}
```

## 使い方

### 手動実行

コマンドパレット（`Ctrl+Shift+P`）で「Imouto: Run current file」を実行、または以下のキーボードショートカットで実行できます:

```
extension.imoutoRun
```

### 自動実行

設定で有効にした場合、ファイルを開いたり保存したりするだけで自動的に実行されます。

## セットアップ

```bash
# 依存をインストール
npm install

# TypeScript をコンパイル
npm run compile

# VS Code でデバッグ実行（Launch Extension 構成を使用）
# または vsce でパッケージ化
npm install -g vsce
vsce package
```

## エラー翻訳ルール例

- **SyntaxError**: 「お兄ちゃん、文法が間違ってるみたい！」
- **ImportError**: 「そのファイル、私の部屋にはないよ？（見つからない）」
- **IndentationError**: 「デコボコしてるよ！インデント揃えて！」
- **NameError**: 「その変数の名前、間違えてない？」
- **その他**: 「よくわかんないけどエラー出てる！直してー！」

行番号も抽出されて、「〇〇行目でミスってるみたいだよ」と表示されます。

## ビルド & 開発

```bash
# 常時コンパイル（ファイル変更を監視）
npm run watch

# 本公開用ビルド
npm run vscode:prepublish
```

## ライセンス

この拡張機能は Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) の下で配布されています。

要約: 著作者のクレジットを表示すれば、非商用での利用は自由に行えます。商用利用を希望する場合は著作者にお問い合わせください。

Suggested attribution:
"Imouto Run" by nagiharu (https://marketplace.visualstudio.com/items?itemName=nagiharu.imouto-run)
