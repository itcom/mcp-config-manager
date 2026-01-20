# MCP Config Manager

Claude Desktop の MCP サーバー設定をプロジェクトごとに管理するツール

## 📝 概要

複数のプロジェクトで異なるMCPサーバー設定を使いたいときに便利なCLIツールです。
各プロジェクトに `.mcp-config.json` を配置し、作業時に必要な設定だけを `claude_desktop_config.json` に追加・削除できます。

## 🚀 インストール

```bash
# プロジェクトディレクトリで
npm install

# ビルド
npm run build

# グローバルインストール
npm link
```

## 📖 使い方

### プロジェクトに `.mcp-config.json` を作成

各プロジェクトのルートディレクトリに以下のような設定ファイルを作成します：

```json
{
  "name": "my-laravel-project-mcp",
  "config": {
    "command": "node",
    "args": ["/path/to/mcp-server/dist/index.js"],
    "env": {
      "ALLOWED_DIRECTORIES": "/path/to/my-laravel-project"
    }
  }
}
```

### コマンド

#### 設定を追加

```bash
mcp-manager add ~/projects/my-laravel-project
```

指定したプロジェクトの `.mcp-config.json` を読み込み、Claude Desktop の設定に追加します。

#### 設定を削除

```bash
mcp-manager remove ~/projects/my-laravel-project
```

指定したプロジェクトの設定を Claude Desktop の設定から削除します。

#### 一覧表示

```bash
mcp-manager list
```

現在登録されているすべてのMCPサーバーを表示します。

#### すべてクリア

```bash
mcp-manager clear
```

すべてのMCPサーバー設定を削除します。

#### 状況確認

```bash
mcp-manager status
```

現在の設定状況（登録数など）を表示します。

## 🔒 安全機能

- ✅ 設定変更時に自動でバックアップを作成
- ✅ 設定ファイルのバリデーション
- ✅ 重複チェック

## 📁 設定ファイルの場所

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## 💡 ワークフロー例

```bash
# 作業開始
cd ~/projects/laravel-project
mcp-manager add .

# Claude Desktop を再起動
# ... 作業 ...

# 作業終了
mcp-manager remove .

# Claude Desktop を再起動
```

## 🛠️ 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発モード（TypeScriptを直接実行）
npm run dev add ~/projects/test-project
```

## 📄 ライセンス

MIT
