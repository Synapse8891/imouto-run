# 🚀 Imouto Run - GitHub Release 公開 (最速ガイド)

## ステップ 1: GitHub でリポジトリ作成

1. https://github.com/new にアクセス
2. Repository name: `imouto-run`（任意でOK）
3. Public を選択（推奨）
4. "Create repository" をクリック

## ステップ 2: ローカルから GitHub にプッシュ

```bash
cd /home/nagiharu/Documents/Vscode_dev

# YOUR_USERNAME をあなたの GitHub ユーザー名に変更して実行
git init
git add .
git commit -m "Initial commit: Imouto Run"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/imouto-run.git
git push -u origin main
```

## ステップ 3: タグを作成・プッシュ（自動リリース開始！）

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 完了！

GitHub Actions が自動実行され、以下が行われます：
- ✅ VSIX ファイルが自動生成
- ✅ GitHub Release が自動作成
- ✅ VSIX が Release に添付される

Release は以下で確認：
```
https://github.com/YOUR_USERNAME/imouto-run/releases
```

## ユーザーが拡張をインストール

```bash
# Release から imouto-run-*.vsix をダウンロード
code --install-extension imouto-run-0.1.0.vsix
```

---

**次にバージョンを更新したい場合:**

```bash
npm version minor  # 0.1.0 → 0.2.0（自動更新）
git push origin main
git push origin v0.2.0  # 自動タグ
```

タグをプッシュすれば自動で新しい Release が作成されます！
