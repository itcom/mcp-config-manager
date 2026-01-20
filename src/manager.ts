import * as path from 'path';
import { readClaudeConfig, writeClaudeConfig, backupClaudeConfig, readProjectConfig, normalizePath } from './config';
import { ClaudeDesktopConfig } from './types';

/**
 * プロジェクトのMCP設定を追加
 */
export function addProjectConfig(projectPath: string): void {
  const normalizedPath = normalizePath(projectPath);
  
  console.log(`📂 プロジェクトパス: ${normalizedPath}`);
  
  // プロジェクトの設定を読み込む
  const projectConfig = readProjectConfig(normalizedPath);
  console.log(`✅ プロジェクト設定を読み込みました: ${projectConfig.name}`);
  
  // Claude Desktop設定を読み込む
  const claudeConfig = readClaudeConfig();
  
  // 既に同じ名前の設定が存在するかチェック
  if (claudeConfig.mcpServers[projectConfig.name]) {
    console.log(`⚠️  "${projectConfig.name}" は既に登録されています`);
    return;
  }
  
  // バックアップを作成
  try {
    const backupPath = backupClaudeConfig();
    console.log(`💾 バックアップを作成しました: ${path.basename(backupPath)}`);
  } catch (error) {
    // バックアップできなくても続行（初回の場合など）
    console.log(`ℹ️  バックアップをスキップしました`);
  }
  
  // 設定を追加
  claudeConfig.mcpServers[projectConfig.name] = projectConfig.config;
  
  // 書き込み
  writeClaudeConfig(claudeConfig);
  
  console.log(`✨ "${projectConfig.name}" を追加しました`);
  console.log(`🔄 Claude Desktop を再起動してください`);
}

/**
 * プロジェクトのMCP設定を削除
 */
export function removeProjectConfig(projectPath: string): void {
  const normalizedPath = normalizePath(projectPath);
  
  console.log(`📂 プロジェクトパス: ${normalizedPath}`);
  
  // プロジェクトの設定を読み込む（名前を取得するため）
  const projectConfig = readProjectConfig(normalizedPath);
  
  // Claude Desktop設定を読み込む
  const claudeConfig = readClaudeConfig();
  
  // 設定が存在するかチェック
  if (!claudeConfig.mcpServers[projectConfig.name]) {
    console.log(`⚠️  "${projectConfig.name}" は登録されていません`);
    return;
  }
  
  // バックアップを作成
  const backupPath = backupClaudeConfig();
  console.log(`💾 バックアップを作成しました: ${path.basename(backupPath)}`);
  
  // 設定を削除
  delete claudeConfig.mcpServers[projectConfig.name];
  
  // 書き込み
  writeClaudeConfig(claudeConfig);
  
  console.log(`✨ "${projectConfig.name}" を削除しました`);
  console.log(`🔄 Claude Desktop を再起動してください`);
}

/**
 * 現在登録されているMCP設定を一覧表示
 */
export function listConfigs(): void {
  const claudeConfig = readClaudeConfig();
  const servers = Object.keys(claudeConfig.mcpServers);
  
  if (servers.length === 0) {
    console.log('📋 登録されているMCPサーバーはありません');
    return;
  }
  
  console.log('📋 登録されているMCPサーバー:');
  servers.forEach((name, index) => {
    const config = claudeConfig.mcpServers[name];
    console.log(`\n${index + 1}. ${name}`);
    console.log(`   コマンド: ${config.command}`);
    console.log(`   引数: ${config.args.join(' ')}`);
    if (config.env) {
      console.log(`   環境変数: ${Object.keys(config.env).length}個`);
    }
  });
}

/**
 * すべてのMCP設定をクリア
 */
export function clearConfigs(): void {
  const claudeConfig = readClaudeConfig();
  const serverCount = Object.keys(claudeConfig.mcpServers).length;
  
  if (serverCount === 0) {
    console.log('📋 削除するMCPサーバーはありません');
    return;
  }
  
  // バックアップを作成
  const backupPath = backupClaudeConfig();
  console.log(`💾 バックアップを作成しました: ${path.basename(backupPath)}`);
  
  // すべて削除
  claudeConfig.mcpServers = {};
  
  // 書き込み
  writeClaudeConfig(claudeConfig);
  
  console.log(`✨ ${serverCount}個のMCPサーバーをすべて削除しました`);
  console.log(`🔄 Claude Desktop を再起動してください`);
}

/**
 * 設定状況を表示
 */
export function showStatus(): void {
  const claudeConfig = readClaudeConfig();
  const serverCount = Object.keys(claudeConfig.mcpServers).length;
  
  console.log('📊 MCP設定状況\n');
  console.log(`登録数: ${serverCount}個`);
  
  if (serverCount > 0) {
    console.log('\n登録されているサーバー:');
    Object.keys(claudeConfig.mcpServers).forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }
}
