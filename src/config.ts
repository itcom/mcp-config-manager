import * as fs from 'fs';
import * as path from 'path';
import { ClaudeDesktopConfig, ProjectMcpConfig, McpManagerConfig, getClaudeConfigPath, getBackupPath, getManagerConfigDir, getManagerConfigPath } from './types';

/**
 * Claude Desktop設定ファイルを読み込む
 */
export function readClaudeConfig(): ClaudeDesktopConfig {
  const configPath = getClaudeConfigPath();
  
  if (!fs.existsSync(configPath)) {
    // 設定ファイルが存在しない場合は空の設定を返す
    return { mcpServers: {} };
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`設定ファイルの読み込みに失敗しました: ${error}`);
  }
}

/**
 * Claude Desktop設定ファイルに書き込む
 */
export function writeClaudeConfig(config: ClaudeDesktopConfig): void {
  const configPath = getClaudeConfigPath();
  const configDir = path.dirname(configPath);
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  try {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
  } catch (error) {
    throw new Error(`設定ファイルの書き込みに失敗しました: ${error}`);
  }
}

/**
 * バックアップファイルの一覧を取得（新しい順）
 */
export function listBackupFiles(): string[] {
  const configPath = getClaudeConfigPath();
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    return [];
  }
  
  const files = fs.readdirSync(configDir);
  const backupFiles = files
    .filter(f => f.startsWith('claude_desktop_config.backup.'))
    .map(f => path.join(configDir, f))
    .map(f => ({
      path: f,
      mtime: fs.statSync(f).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime) // 新しい順
    .map(f => f.path);
  
  return backupFiles;
}

/**
 * 古いバックアップファイルを削除（最新N個だけ残す）
 */
export function cleanOldBackups(keepCount: number = 5): number {
  const backups = listBackupFiles();
  
  if (backups.length <= keepCount) {
    return 0;
  }
  
  const toDelete = backups.slice(keepCount);
  
  toDelete.forEach(file => {
    try {
      fs.unlinkSync(file);
    } catch (error) {
      // 削除できなくても続行
    }
  });
  
  return toDelete.length;
}

/**
 * 設定ファイルのバックアップを作成
 */
export function backupClaudeConfig(): string {
  const configPath = getClaudeConfigPath();
  
  if (!fs.existsSync(configPath)) {
    throw new Error('バックアップする設定ファイルが存在しません');
  }
  
  const backupPath = getBackupPath();
  fs.copyFileSync(configPath, backupPath);
  
  // 古いバックアップを自動削除（最新5個だけ残す）
  cleanOldBackups(5);
  
  return backupPath;
}

/**
 * プロジェクトのMCP設定ファイルを読み込む
 */
export function readProjectConfig(projectPath: string): ProjectMcpConfig {
  const configPath = path.join(projectPath, '.mcp-config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`.mcp-config.json が見つかりません: ${projectPath}`);
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    
    // 必須フィールドの検証
    if (!config.name || !config.config || !config.config.command || !config.config.args) {
      throw new Error('設定ファイルの形式が正しくありません');
    }
    
    return config;
  } catch (error) {
    throw new Error(`プロジェクト設定の読み込みに失敗しました: ${error}`);
  }
}

/**
 * パスを正規化（絶対パスに変換）
 */
export function normalizePath(inputPath: string): string {
  // ~を展開
  if (inputPath.startsWith('~')) {
    inputPath = path.join(process.env.HOME || '', inputPath.slice(1));
  }
  
  // 絶対パスに変換
  return path.resolve(inputPath);
}

/**
 * mcp-managerのグローバル設定を読み込む
 */
export function readManagerConfig(): McpManagerConfig | null {
  const configPath = getManagerConfigPath();
  
  if (!fs.existsSync(configPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`mcp-manager設定の読み込みに失敗しました: ${error}`);
  }
}

/**
 * mcp-managerのグローバル設定を書き込む
 */
export function writeManagerConfig(config: McpManagerConfig): void {
  const configDir = getManagerConfigDir();
  const configPath = getManagerConfigPath();
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  try {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
  } catch (error) {
    throw new Error(`mcp-manager設定の書き込みに失敗しました: ${error}`);
  }
}

/**
 * MCPサーバーのパスが設定されているか確認
 */
export function ensureMcpServerPath(): string {
  const config = readManagerConfig();
  
  if (!config || !config.mcpServerPath) {
    throw new Error(
      'MCPサーバーのパスが設定されていません。\n' +
      '次のコマンドで設定してください:\n' +
      '  mcp-manager config set-mcp-server <path>'
    );
  }
  
  // パスが存在するか確認
  if (!fs.existsSync(config.mcpServerPath)) {
    throw new Error(
      `MCPサーバーが見つかりません: ${config.mcpServerPath}\n` +
      '次のコマンドで正しいパスを設定してください:\n' +
      '  mcp-manager config set-mcp-server <path>'
    );
  }
  
  return config.mcpServerPath;
}
