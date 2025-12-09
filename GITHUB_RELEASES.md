# GitHub Releases で拡張機能を公開する

このワークフローを使えば、タグを push するだけで自動的に VSIX が生成されて GitHub Releases にアップロードされます。

## 使い方（3ステップ）

### 1. ローカルで version を更新

```bash
# package.json のバージョンを更新（現在: 0.1.0）
# 例: 0.2.0 に上げたい場合
vim package.json
# または
npm version minor
```

### 2. GitHub にプッシュ

```bash
git add .
git commit -m "v0.2.0: Add new features"
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

### 3. 自動で Release が作成される

GitHub Actions が自動実行され、以下が行われます:
- TypeScript をコンパイル
- VSIX ファイルを生成
- GitHub Release を作成（VSIX を添付）

Release は以下から確認できます:
```
https://github.com/nagiharu/imouto-run/releases
```

## ユーザー向けインストール方法

Release ページから VSIX をダウンロード後:

```bash
code --install-extension imouto-run-0.2.0.vsix
```

## トラブルシューティング

**エラー: "git tag が見つからない"**
- タグを正しく push したか確認:
  ```bash
  git push origin v0.2.0
  ```

**エラー: "VSIX が生成されない"**
- ローカルで `npm run compile` が成功するか確認:
  ```bash
  npm install
  npm run compile
  npx vsce package
  ```

**GitHub Actions のログを見たい**
- Repository の Actions タブ から確認可能

## GitHub Repository を持っていない場合

1. 新規リポジトリを作成: https://github.com/new
2. ローカルで初期化:
   ```bash
   cd /home/nagiharu/Documents/Vscode_dev
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/imouto-run.git
   git push -u origin main
   ```

3. その後、タグを push すれば自動化が動きます
