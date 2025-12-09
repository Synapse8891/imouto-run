#!/bin/bash
# サンプルシェルスクリプト：構文エラーあり

echo "Hello, World!"

# わざと構文エラーを入れる（if文が閉じていない）
if [ 1 -eq 1 ]
then
  echo "True"
