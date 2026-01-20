# MCP Config Manager

Claude Desktop の MCP サーバー設定をプロジェクトごとに管理するツール

## 📝 概要

複数のプロジェクトで異なるMCPサーバー設定を使いたいときに便利なCLIツールです。
各プロジェクトに `.mcp-config.json` を配置し、作業時に必要な設定だけを `claude_desktop_config.json` に追加・削除できます。

## ✨ 主な機能

- ⚙️ **グローバル設定**: MCPサーバーのパスを設定ファイルで管理
- 🎯 **自動初期化**: `mcp-manager init` で `.mcp-config.json` を自動生成
- 🔄 **自動再起動**: `--restart` オプションで Claude Desktop を自動再起動
- 📦 **Node.js パス自動取得**: `which node` で最新の Node.js パスを使用
- 💾 **自動バックアップ**: 設定変更時に自動でバックアップを作成

## 🚀 インストール

```bash
# プロジェクトディレクトリで
cd /Volumes/ExtremeSSD/workspace/Herd/mcp-config-manager
npm install

# ビルド
npm run build

# グローバルインストール
npm link
```

## ⚙️ 初期設定

初回実行時に、MCPサーバーのパスを設定してください：

```bash
# MCPサーバーのパスを設定
mcp-manager config set-mcp-server /Volumes/ExtremeSSD/workspace/Herd/mcp-server/dist/index.js

# 設定を確認
mcp-manager config show
```

**設定ファイルの場所**: `~/.mcp-manager/config.json`

## 📖 使い方

### 1. グローバル設定の管理

```bash
# MCPサーバーのパスを設定
mcp-manager config set-mcp-server <path-to-mcp-server>

# 現在の設定を表示
mcp-manager config show
```

### 2. プロジェクトの初期化

プロジェクトディレクトリで実行すると、自動的に `.mcp-config.json` を作成します：

```bash
cd ~/workspace/Herd/my-laravel-project
mcp-manager init
```

自動的に以下の内容で生成されます：
- `name`: ディレクトリ名を使用
- `command`: `which node` で取得した Node.js のパス
- `args`: グローバル設定の MCPサーバーパス
- `SERVER_ROOT`: 現在のディレクトリ

### 3. 設定を追加

```bash
# 現在のディレクトリの設定を追加
mcp-manager add .

# 自動再起動付きで追加
mcp-manager add . --restart
mcp-manager add . -r

# 別のプロジェクトを追加
mcp-manager add ~/workspace/Herd/another-project --restart
```

### 4. 設定を削除

```bash
# 現在のディレクトリの設定を削除
mcp-manager remove .

# 自動再起動付きで削除
mcp-manager remove . --restart
mcp-manager remove . -r
```

### 5. 一覧表示

```bash
mcp-manager list
```

現在登録されているすべてのMCPサーバーを表示します。

### 6. すべてクリア

```bash
# すべての設定を削除
mcp-manager clear

# 自動再起動付きで削除
mcp-manager clear --restart
```

すべてのMCPサーバー設定を削除します（バックアップは自動作成されます）。

### 7. 状況確認

```bash
mcp-manager status
```

現在の設定状況（登録数など）を表示します。

### 8. Claude Desktop を再起動

```bash
mcp-manager restart
```

Claude Desktop を再起動します（macOSのみ対応）。

### 9. バックアップ管理

```bash
# バックアップ一覧を表示
mcp-manager backup list

# 古いバックアップを削除（最新5個だけ残す）
mcp-manager backup clean

# 残す数を指定
mcp-manager backup clean --keep 10
```

設定変更時に自動でバックアップが作成されます。古いバックアップは自動的に削除され（最新5個保持）、手動でクリーンアップすることもできます。

## 🔒 安全機能

- ✅ 設定変更時に自動でバックアップを作成
- ✅ 古いバックアップの自動削除（最新5個保持）
- ✅ バックアップの一覧表示と手動クリーンアップ
- ✅ 設定ファイルのバリデーション
- ✅ 重複チェック
- ✅ パスの存在確認
- ✅ Claude Desktop自動再起動（macOSのみ、オプション）

## 📁 設定ファイルの場所

### mcp-manager の設定
- **場所**: `~/.mcp-manager/config.json`
- **内容**: MCPサーバーのパス

### Claude Desktop の設定
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## 💡 ワークフロー例

### 初回セットアップ

```bash
# 1. MCPサーバーのパスを設定
mcp-manager config set-mcp-server /Volumes/ExtremeSSD/workspace/Herd/mcp-server/dist/index.js

# 2. 設定を確認
mcp-manager config show
```

### 新しいプロジェクトの場合

```bash
# プロジェクトディレクトリに移動
cd ~/workspace/Herd/new-project

# .mcp-config.json を作成
mcp-manager init

# 設定を有効化（自動再起動）
mcp-manager add . --restart

# ... 作業 ...

# 作業終了（自動再起動）
mcp-manager remove . --restart
```

### 既存プロジェクトの場合

```bash
# 作業開始
cd ~/workspace/Herd/laravel-project
mcp-manager add . --restart

# ... 作業 ...

# 作業終了
mcp-manager remove . --restart
```

### 複数プロジェクトの切り替え

```bash
# プロジェクトAの設定を削除してプロジェクトBを追加
mcp-manager remove ~/workspace/Herd/project-a
mcp-manager add ~/workspace/Herd/project-b --restart
```

## 🛠️ 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発モード（TypeScriptを直接実行）
npm run dev init

# ウォッチモード
npm run watch
```

## 📝 設定ファイルの例

### グローバル設定 (`~/.mcp-manager/config.json`)

```json
{
  "mcpServerPath": "/Volumes/ExtremeSSD/workspace/Herd/mcp-server/dist/index.js"
}
```

### プロジェクト設定 (`.mcp-config.json`)

```json
{
  "name": "my-laravel-project",
  "config": {
    "command": "/Users/username/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin/node",
    "args": [
      "/Volumes/ExtremeSSD/workspace/Herd/mcp-server/dist/index.js"
    ],
    "env": {
      "SERVER_ROOT": "/Volumes/ExtremeSSD/workspace/Herd/my-laravel-project",
      "MCP_MODE": "stdio",
      "PROJECT_ID": "my-laravel-project"
    }
  }
}
```

## ❓ トラブルシューティング

### MCPサーバーのパスが設定されていない

```bash
# エラーメッセージ
MCPサーバーのパスが設定されていません。

# 解決方法
mcp-manager config set-mcp-server /path/to/mcp-server/dist/index.js
```

### Node.js が見つからない

```bash
# Node.js のパスを確認
which node

# パスが表示されない場合は Node.js をインストール
```

### MCPサーバーが見つからない

```bash
# 設定を確認
mcp-manager config show

# 正しいパスを設定
mcp-manager config set-mcp-server /correct/path/to/mcp-server/dist/index.js
```

### Claude Desktop が自動再起動しない

自動再起動は macOS のみ対応しています。Windows/Linux では手動で再起動してください。

## 📄 ライセンス

MIT
