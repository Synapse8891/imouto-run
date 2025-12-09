// VS Code 拡張機能のメインエントリポイント
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

// 拡張機能が有効化されたときに呼ばれる関数
export function activate(context: vscode.ExtensionContext) {
  // 出力チャンネルを作成（妹のセリフをここに表示する）
  const output = vscode.window.createOutputChannel('Imouto Run');

  // ドキュメントが対応しているかチェックするユーティリティ
  function isSupportedDocument(doc: vscode.TextDocument | undefined): boolean {
    if (!doc) return false;
    const lower = doc.fileName.toLowerCase();
    const langId = doc.languageId;
    // Python, C, Shell/Bash/Zsh をサポート
    return (
      lower.endsWith('.py') || langId === 'python' ||
      lower.endsWith('.c') || langId === 'c' ||
      lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh') ||
      langId === 'shellscript' || langId === 'bash' || langId === 'sh' || langId === 'zsh'
    );
  }

  // 言語ショートカット -> 実行コマンドのマップ（{path} がワークスペース/ファイルパスに置換される）
  const DEFAULT_LANGUAGE_COMMANDS: Record<string, string> = {
    py: 'python "{path}"',
    c: 'gcc -fsyntax-only "{path}"',
    cpp: 'g++ -fsyntax-only "{path}"',
    js: 'node "{path}"',
    ts: 'tsc --noEmit "{path}"',
    java: 'javac "{path}"',
    go: 'go vet "{path}"',
    php: 'php -l "{path}"',
    ruby: 'ruby -c "{path}"',
    sh: 'bash -n "{path}"',
  };

  // 設定から言語コマンドを読み込む（デフォルトにマージ）
  function getLanguageCommands(): Record<string, string> {
    const cfg = vscode.workspace.getConfiguration('imoutoRun');
    const customCommands = cfg.get<Record<string, string>>('languageCommands', {});
    return { ...DEFAULT_LANGUAGE_COMMANDS, ...customCommands };
  }

  // 指定された言語ショートカットと言語パスでコマンドを実行する
  async function runLanguageShortcut(lang: string, target?: string) {
    const LANGUAGE_COMMANDS = getLanguageCommands();
    const cmdTemplate = LANGUAGE_COMMANDS[lang];
    if (!cmdTemplate) {
      vscode.window.showErrorMessage(`${lang} はまだ対応してないよ〜（configを見てね）。`);
      return;
    }

    // ターゲットパスがなければアクティブエディタのファイルを使う
    let filePath = target;
    if (!filePath) {
      const editor = vscode.window.activeTextEditor;
      if (editor) filePath = editor.document.fileName;
    }

    if (!filePath) {
      // ユーザーに入力を促す
      const input = await vscode.window.showInputBox({ prompt: `実行するファイルパスを入力してください（例: src/main.${lang}）` });
      if (!input) return;
      filePath = input;
    }

    // workspace があれば相対パスから絶対パスへ
    if (!path.isAbsolute(filePath) && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      filePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
    }

    const command = cmdTemplate.replace('{path}', filePath);

    // 実行（既存の出力表示ロジックを再利用）
    output.show(true);
    output.clear();
    const cfg = vscode.workspace.getConfiguration('imoutoRun');
    const verbosity = cfg.get<string>('verbosity', 'simple');
    if (verbosity === 'verbose') {
      output.appendLine(`--- 実行コマンド: ${command}`);
    }

    exec(command, { maxBuffer: 1024 * 1024 }, (error: Error | null, stdout: string, stderr: string) => {
      if ((!stderr || stderr.trim() === '') && !error) {
        output.appendLine('お兄ちゃん、完璧！ちゃんと動いたよ！');
        return;
      }

      const rawErr = (stderr && stderr.toString()) || (error && String(error.message)) || '';
      const imoutoSpeech = translateToImouto(rawErr);
      displayError(rawErr, stdout, imoutoSpeech);
    });
  }

  // ドキュメントを受け取って実行（共通化）
  function runDocument(doc: vscode.TextDocument) {
    // ファイルパス
    const filePath = doc.fileName;

    // 実行コマンドを決定
    const lower = filePath.toLowerCase();
    const langId = doc.languageId;
    let command: string | null = null;

    if (lower.endsWith('.py') || langId === 'python') {
      command = `python "${filePath}"`;
    } else if (lower.endsWith('.c') || langId === 'c') {
      command = `gcc -fsyntax-only "${filePath}"`;
    } else if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh') || langId === 'shellscript' || langId === 'bash' || langId === 'sh' || langId === 'zsh') {
      // シェルスクリプトは bash で実行（-n で構文チェック）
      command = `bash -n "${filePath}"`;
    } else {
      // サポート外は無視
      return;
    }

    // 出力チャンネルをフォーカスしてクリア
    output.show(true);
    output.clear();
    const cfg = vscode.workspace.getConfiguration('imoutoRun');
    const verbosity = cfg.get<string>('verbosity', 'simple');
    if (verbosity === 'verbose') {
      output.appendLine(`--- 実行コマンド: ${command}`);
    }

    // child_process.exec でコマンドを実行
    exec(command, { maxBuffer: 1024 * 1024 }, (error: Error | null, stdout: string, stderr: string) => {
      // stderr が空で、エラーオブジェクトもない場合は成功扱い
      if ((!stderr || stderr.trim() === '') && !error) {
        output.appendLine('お兄ちゃん、完璧！ちゃんと動いたよ！');
        return;
      }

      // stderr を文字列として取得（なければ error.message を使う）
      const rawErr = (stderr && stderr.toString()) || (error && String(error.message)) || '';

      // 妹翻訳ロジック
      const imoutoSpeech = translateToImouto(rawErr);

      // 詳細度に応じた表示を行う
      displayError(rawErr, stdout, imoutoSpeech);
    });
  }

  // 出力詳細度に応じてエラー情報を表示する関数
  function displayError(rawErr: string, stdout: string, imoutoSpeech: string) {
    const cfg = vscode.workspace.getConfiguration('imoutoRun');
    // デフォルトは simple（妹の一言だけ）に統一
    const verbosity = cfg.get<string>('verbosity', 'simple');

    // stdout があれば表示（verbosity レベル関係なく）
    if (stdout && stdout.trim().length > 0) {
      output.appendLine('— 実行の出力だよ〜（stdout）');
      output.appendLine(stdout);
      output.appendLine('');
    }

    // 詳細度に応じた出力（すべて妹口調で表現）
    if (verbosity === 'verbose') {
      // すべて表示
      output.appendLine('— 本当のエラーだよ…（原文）');
      output.appendLine(rawErr);
      output.appendLine('');
      output.appendLine('— 妹のひとことだよ〜');
      output.appendLine(imoutoSpeech);
    } else if (verbosity === 'normal') {
      // エラーを要約して表示 + 妹の一言
      const summary = summarizeError(rawErr);
      if (summary) {
        output.appendLine('— エラーの要点だよ');
        output.appendLine(summary);
        output.appendLine('');
      }
      output.appendLine('— 妹のひとことだよ〜');
      output.appendLine(imoutoSpeech);
    } else {
      // simple: 妹の一言だけ
      output.appendLine(imoutoSpeech);
    }
  }

  // エラーメッセージを簡潔に要約する関数
  function summarizeError(rawErr: string): string {
    // 最初の行と最後のエラー行を抽出
    const lines = rawErr.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return '';

    // エラーキーワードを含む行を探す
    const errorLine = lines.find(l => /error|error:|SyntaxError|ImportError|NameError|IndentationError/i.test(l));
    if (errorLine) {
      return errorLine;
    }

    // なければ最後の行を返す
    return lines[lines.length - 1];
  }

  // コマンドを登録する（手動実行用）
  const disposable = vscode.commands.registerCommand('extension.imoutoRun', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('ファイルを開いてから実行してね、お兄ちゃん。');
      return;
    }

    const doc = editor.document;
    if (!isSupportedDocument(doc)) {
      vscode.window.showErrorMessage('ごめんね、お兄ちゃん。今対応しているのは Python, C, JS, TS, C++, Java, Go, PHP, Ruby, Shell だよ〜。');
      return;
    }

    runDocument(doc);
  });

  context.subscriptions.push(disposable);

  // CLI風入力を受け付ける単一コマンド（例: "py src/main.py" や "c test.c"）
  const cliDisposable = vscode.commands.registerCommand('extension.imoutoRunCli', async () => {
    const input = await vscode.window.showInputBox({ prompt: '言語とパスを入力してください（例: py src/main.py）' });
    if (!input) return;
    const parts = input.trim().split(/\s+/);
    const lang = parts[0];
    const target = parts.slice(1).join(' ') || undefined;
    await runLanguageShortcut(lang, target);
  });
  context.subscriptions.push(cliDisposable);

  // 設定に応じて自動実行の挙動を制御する
  // 設定項目: imoutoRun.autoRunOnStartup, imoutoRun.autoRunOnOpen, imoutoRun.autoRunOnSave, imoutoRun.verbosity
  let openListenerDisposable: vscode.Disposable | undefined;
  let saveListenerDisposable: vscode.Disposable | undefined;

  // 設定に応じてリスナーを登録/解除する関数
  function registerListenersFromConfig() {
    const cfg = vscode.workspace.getConfiguration('imoutoRun');
    const autoStartup = cfg.get<boolean>('autoRunOnStartup', true);
    const autoOpen = cfg.get<boolean>('autoRunOnOpen', false);
    const autoSave = cfg.get<boolean>('autoRunOnSave', false);

    // 起動時の実行
    if (autoStartup && isSupportedDocument(vscode.window.activeTextEditor?.document)) {
      runDocument(vscode.window.activeTextEditor!.document);
    }

    // 既存リスナーを解除
    if (openListenerDisposable) {
      openListenerDisposable.dispose();
      openListenerDisposable = undefined;
    }
    if (saveListenerDisposable) {
      saveListenerDisposable.dispose();
      saveListenerDisposable = undefined;
    }

    // ファイルが開かれたとき
    if (autoOpen) {
      openListenerDisposable = vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => {
        if (isSupportedDocument(doc)) {
          runDocument(doc);
        }
      });
      context.subscriptions.push(openListenerDisposable);
    }

    // ファイル保存時
    if (autoSave) {
      saveListenerDisposable = vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
        if (isSupportedDocument(doc)) {
          runDocument(doc);
        }
      });
      context.subscriptions.push(saveListenerDisposable);
    }
  }

  // 初回登録
  registerListenersFromConfig();

  // 設定が変わったらリスナーを再登録（動作はすぐ反映されます）
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
    if (e.affectsConfiguration('imoutoRun')) {
      registerListenersFromConfig();
    }
  });
  context.subscriptions.push(configWatcher);
}

// 翻訳用辞書データ（ここを編集すれば変換ルールを簡単に変更できます）
const TRANSLATION_RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /SyntaxError/i, message: 'お兄ちゃん、文法が間違ってるみたい！' },
  { pattern: /ImportError/i, message: 'そのファイル、私の部屋にはないよ？（見つからない）' },
  { pattern: /fatal error/i, message: 'そのファイル、私の部屋にはないよ？（見つからない）' },
  { pattern: /IndentationError/i, message: 'デコボコしてるよ！インデント揃えて！' },
  { pattern: /NameError/i, message: 'その変数の名前、間違えてない？' },
  { pattern: /error:/i, message: 'お兄ちゃん、どこかでエラーが出てるよ…' },
  { pattern: /bash:|syntax error|command not found/i, message: 'シェルのお勉強をもっとしようか！' },
];

// エラーメッセージを妹口調に変換する関数
function translateToImouto(rawErr: string): string {
  // 行番号の抽出を試みる（例: "line 10" や ":10:" など）
  let lineNumber: string | null = null;

  // パターン1: 'line 10' のような表現
  const m1 = rawErr.match(/line\s+(\d+)/i);
  if (m1 && m1[1]) {
    lineNumber = m1[1];
  }

  // パターン2: ファイル名:10: のような gcc / コンパイラ表現
  if (!lineNumber) {
    const m2 = rawErr.match(/:(\d+):/);
    if (m2 && m2[1]) {
      lineNumber = m2[1];
    }
  }

  // パターン3: 別の :10 の場合
  if (!lineNumber) {
    const m3 = rawErr.match(/:(\d+)\b/);
    if (m3 && m3[1]) {
      lineNumber = m3[1];
    }
  }

  // 辞書ルールにマッチする最初のメッセージを使う
  let matchedMessage: string | null = null;
  for (const rule of TRANSLATION_RULES) {
    if (rule.pattern.test(rawErr)) {
      matchedMessage = rule.message;
      break;
    }
  }

  // マッチしなければデフォルトメッセージを使う
  if (!matchedMessage) {
    matchedMessage = 'よくわかんないけどエラー出てる！直してー！';
  }

  // 行番号が分かれば行情報を付ける
  const lineInfo = lineNumber ? `${lineNumber}行目でミスってるみたいだよ` : '';

  // 少し妹っぽく語尾を付けて返す
  const tail = '〜';
  const combined = [matchedMessage, lineInfo].filter(Boolean).join(' ');
  return combined + (combined.endsWith(tail) ? '' : tail);
}

// 拡張機能が無効化されたときに呼ばれる関数
export function deactivate() {}
