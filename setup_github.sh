#!/bin/bash
# GitHub Releases への公開を自動化するセットアップスクリプト
# 使い方: bash ./setup_github.sh

set -e

echo "=== Imouto Run - GitHub Release セットアップ ==="
echo ""

# GitHub ユーザー名を入力
read -p "GitHub ユーザー名を入力してください: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
  echo "エラー: ユーザー名が入力されていません"
  exit 1
fi

REPO_URL="https://github.com/$GITHUB_USER/imouto-run.git"

echo ""
echo "✓ 設定内容:"
echo "  Repository: $REPO_URL"
echo ""

# Git 初期化（まだ済んでいなければ）
if [ ! -d ".git" ]; then
  echo "▶ Git リポジトリを初期化中..."
  git init
  git add .
  git commit -m "Initial commit: Imouto Run v0.1.0"
  git branch -M main
  echo "✓ 初期化完了"
else
  echo "✓ Git リポジトリは既に初期化済み"
fi

# リモート URL を設定
if ! git remote get-url origin &>/dev/null; then
  echo "▶ リモートリポジトリを追加中..."
  git remote add origin "$REPO_URL"
  echo "✓ リモート追加完了"
else
  CURRENT_URL=$(git remote get-url origin)
  if [ "$CURRENT_URL" != "$REPO_URL" ]; then
    echo "▶ リモートリポジトリを更新中..."
    git remote set-url origin "$REPO_URL"
    echo "✓ リモート更新完了"
  else
    echo "✓ リモートリポジトリは既に設定済み"
  fi
fi

echo ""
echo "=== セットアップ完了！次のステップ ==="
echo ""
echo "1. GitHub で新規リポジトリを作成（パブリック推奨）:"
echo "   https://github.com/new"
echo "   - Repository name: imouto-run"
echo "   - 他はデフォルトでOK"
echo ""
echo "2. 以下を実行して GitHub にプッシュ:"
echo "   git push -u origin main"
echo ""
echo "3. バージョンタグを作成・プッシュ（自動リリース開始）:"
echo "   git tag v0.1.0"
echo "   git push origin v0.1.0"
echo ""
echo "4. Release が自動作成される:"
echo "   https://github.com/$GITHUB_USER/imouto-run/releases"
echo ""
echo "✅ すべてセットアップできました！"
