# 🚀 Marketplace 公開 - クイックスタート

## 1️⃣ Azure DevOps で PAT を作成

https://dev.azure.com → Personal access tokens → New Token
- Scope: `Marketplace (manage)`
- コピーして保存

## 2️⃣ Publisher を登録（初回のみ）

https://marketplace.visualstudio.com/manage/createpublisher
- Publisher ID: `nagiharu` ✅ (package.json に既に設定)

## 3️⃣ 公開コマンド

```bash
cd /home/nagiharu/Documents/Vscode_dev

# PAT でログイン
npx vsce login nagiharu
# → PAT をペースト

# 公開実行
npx vsce publish
```

## 4️⃣ 完了！
- URL: https://marketplace.visualstudio.com/items?itemName=nagiharu.imouto-run
- VS Code 内で「Imouto Run」で検索してインストール可能

## 📝 バージョン更新時
```bash
# 1. package.json の version を更新（例: 0.0.2）
# 2. CHANGELOG.md に記載
# 3. npx vsce publish
```

## ✅ パッケージング完了
- `imouto-run-0.0.1.vsix` が生成されています
- すぐに公開できます！
