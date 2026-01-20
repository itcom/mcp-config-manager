import * as fs from 'fs';
import * as path from 'path';
import { ClaudeDesktopConfig, ProjectMcpConfig, getClaudeConfigPath, getBackupPath } from './types';

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
 * 設定ファイルのバックアップを作成
 */
export function backupClaudeConfig(): string {
  const configPath = getClaudeConfigPath();
  
  if (!fs.existsSync(configPath)) {
    throw new Error('バックアップする設定ファイルが存在しません');
  }
  
  const backupPath = getBackupPath();
  fs.copyFileSync(configPath, backupPath);
  
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
