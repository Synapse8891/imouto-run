# GitHub Releases 公開 - クイックガイド

## セットアップ（初回のみ）

### リポジトリを GitHub に作成・初期化

```bash
cd /home/nagiharu/Documents/Vscode_dev

# Git 初期化（未済の場合）
git init
git add .
git commit -m "Initial commit: Imouto Run v0.1.0"

# GitHub にプッシュ
# （USERNAME と REPO を自分のものに変更）
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/imouto-run.git
git push -u origin main
```

## リリース方法（毎回）

### 1. バージョンを更新

```bash
# package.json を編集（version フィールドを更新）
# または npm で自動更新
npm version minor
# または patch, major
```

### 2. タグをプッシュ

```bash
git tag v0.1.1
git push origin v0.1.1
```

### 3. 自動で Release が作成される

- GitHub Actions が自動実行
- VSIX が生成される
- Release が作成される（VSIX を添付）
- URL: `https://github.com/YOUR_USERNAME/imouto-run/releases`

## ユーザー側でのインストール

```bash
# Release から imouto-run-*.vsix をダウンロード後
code --install-extension imouto-run-0.1.1.vsix
```

## 更新確認

Actions タブから GitHub Actions の実行結果を確認:
```
https://github.com/YOUR_USERNAME/imouto-run/actions
```

---

✅ 完全自動化！GitHub のみで拡張公開できます。
