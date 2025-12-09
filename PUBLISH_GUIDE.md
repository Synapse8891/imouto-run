# Imouto Run - VS Code Extension を Marketplace に公開する手順

## 生成されたファイル
- ✅ `imouto-run-0.0.1.vsix` - 拡張機能パッケージ

## 公開前にやること

### 1. Personal Access Token (PAT) を取得する
1. Azure DevOps にアクセス: https://dev.azure.com/
2. アカウント設定 → Personal access tokens
3. "New Token" を作成
   - Name: `vsce-publish`
   - Scope: `Marketplace (manage)` を選択
   - Expiration: 1年以上
4. トークンをコピーして安全に保存

### 2. Publisher を登録する
1. VS Code Marketplace: https://marketplace.visualstudio.com/
2. "Publish extensions" リンクをクリック
3. "Create publisher" で新しい Publisher を作成
   - 例: `nagiharu`
4. `package.json` の `publisher` フィールドに同じ名前を設定（既に設定済み）

### 3. Marketplace に公開する

```bash
# PAT でログイン（ターミナルで実行）
npx vsce login nagiharu
# → PAT を入力

# 拡張機能を公開
npx vsce publish

# または、PAT を直接指定して公開
npx vsce publish --pat <YOUR_PAT>
```

### 4. 公開後
- https://marketplace.visualstudio.com/items?itemName=nagiharu.imouto-run
- でアクセス可能になります

## ローカルでのテスト方法

### VSIX をローカルでインストール
```bash
# VS Code で拡張機能をインストール
code --install-extension imouto-run-0.0.1.vsix
```

### アンインストール
```bash
code --uninstall-extension nagiharu.imouto-run
```

## トラブルシューティング

**エラー: "The PAT needs to have 'All accessible organizations' selected"**
- Azure DevOps で PAT を再作成し、scope を確認してください

**エラー: "publisher not found"**
- Publisher を Marketplace で登録しているか確認してください

**エラー: "400 Invalid request"**
- `package.json` の `publisher` と実際の Publisher ID が一致しているか確認してください

## バージョンアップデート手順

```bash
# 1. package.json のバージョンを変更 (例: 0.0.2)
# 2. CHANGELOG.md に新しいバージョン情報を追加
# 3. コミット
git add .
git commit -m "v0.0.2: Add new features"

# 4. 公開
npx vsce publish
```

## 参考リンク
- VS Code Extension Publishing: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- vsce Documentation: https://github.com/microsoft/vscode-vsce
