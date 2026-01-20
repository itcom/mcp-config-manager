import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { readClaudeConfig, writeClaudeConfig, backupClaudeConfig, readProjectConfig, normalizePath, readManagerConfig, writeManagerConfig, ensureMcpServerPath } from './config';
import { ClaudeDesktopConfig, McpManagerConfig } from './types';

/**
 * nodeコマンドのパスを取得
 */
export function getNodePath(): string {
  try {
    const nodePath = execSync('which node', { encoding: 'utf-8' }).trim();
    return nodePath;
  } catch (error) {
    throw new Error('nodeコマンドが見つかりません。Node.jsがインストールされているか確認してください。');
  }
}

/**
 * プロセスが完全に終了するまで待つ
 */
function waitForProcessToExit(processName: string, maxWaitSeconds: number = 10): boolean {
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      // プロセスが存在するかチェック
      execSync(`pgrep -x "${processName}"`, { stdio: 'ignore' });
      // まだ存在する場合は少し待つ
      execSync('sleep 0.5');
    } catch (error) {
      // プロセスが見つからない = 終了した
      return true;
    }
  }
  
  return false;
}

/**
 * Claude Desktopを再起動
 */
export function restartClaudeDesktop(): void {
  try {
    // macOSの場合
    if (process.platform === 'darwin') {
      console.log('🔄 Claude Desktop を再起動中...');
      
      // 1. Claude Desktopが起動しているかチェック
      let wasRunning = false;
      try {
        execSync('pgrep -x "Claude"', { stdio: 'ignore' });
        wasRunning = true;
      } catch (error) {
        // プロセスが見つからない = 起動していない
        wasRunning = false;
      }
      
      if (wasRunning) {
        console.log('   📴 Claude Desktop を終了中...');
        
        // 2. 優しく終了を試みる（SIGTERM）
        try {
          execSync('pkill -TERM "Claude"', { stdio: 'ignore' });
        } catch (error) {
          // 既に終了している可能性があるので続行
        }
        
        // 3. プロセスが終了するまで待つ（最大10秒）
        console.log('   ⏳ 終了を待っています...');
        const exited = waitForProcessToExit('Claude', 10);
        
        if (!exited) {
          console.log('   ⚠️  正常終了しなかったため強制終了します...');
          // 4. 強制終了（SIGKILL）
          try {
            execSync('pkill -9 "Claude"', { stdio: 'ignore' });
          } catch (error) {
            // 無視
          }
          
          // 5. 再度待つ（最大5秒）
          waitForProcessToExit('Claude', 5);
        }
        
        // 6. 少し待機（設定ファイルの書き込みが完了するまで）
        execSync('sleep 1');
      }
      
      // 7. Claude Desktopを起動
      console.log('   🚀 Claude Desktop を起動中...');
      
      try {
        // アプリケーション名を確認
        const claudePath = '/Applications/Claude.app';
        if (fs.existsSync(claudePath)) {
          execSync(`open "${claudePath}"`, { stdio: 'ignore' });
        } else {
          // フルパスで見つからない場合は名前で起動
          execSync('open -a Claude', { stdio: 'ignore' });
        }
        
        console.log('✅ Claude Desktop を再起動しました');
      } catch (error) {
        console.error('❌ Claude Desktop の起動に失敗しました');
        console.log('💡 手動で Claude Desktop を起動してください');
        console.log('   /Applications/Claude.app');
      }
    } else {
      console.log('⚠️  自動再起動はmacOSのみサポートされています');
      console.log('💡 手動で Claude Desktop を再起動してください');
    }
  } catch (error) {
    console.error('❌ Claude Desktop の再起動に失敗しました');
    console.log('💡 手動で Claude Desktop を再起動してください');
  }
}

/**
 * MCPサーバーのパスを設定
 */
export function setMcpServerPath(serverPath: string): void {
  const normalizedPath = normalizePath(serverPath);
  
  // パスが存在するか確認
  if (!fs.existsSync(normalizedPath)) {
    throw new Error(`指定されたパスが存在しません: ${normalizedPath}`);
  }
  
  // 設定を読み込む（存在しない場合は新規作成）
  const config = readManagerConfig() || { mcpServerPath: '' };
  
  // パスを更新
  config.mcpServerPath = normalizedPath;
  
  // 保存
  writeManagerConfig(config);
  
  console.log('✅ MCPサーバーのパスを設定しました');
  console.log(`📄 ${normalizedPath}`);
}

/**
 * 現在の設定を表示
 */
export function showConfig(): void {
  const config = readManagerConfig();
  
  console.log('📋 mcp-manager の設定\n');
  
  if (!config) {
    console.log('⚠️  設定ファイルが存在しません');
    console.log('💡 次のコマンドでMCPサーバーのパスを設定してください:');
    console.log('   mcp-manager config set-mcp-server <path>');
    return;
  }
  
  console.log(`MCPサーバーパス: ${config.mcpServerPath}`);
  
  // パスの存在確認
  if (!fs.existsSync(config.mcpServerPath)) {
    console.log('⚠️  設定されたパスが存在しません');
  } else {
    console.log('✅ パスは有効です');
  }
}

/**
 * 現在のディレクトリに .mcp-config.json を初期化
 */
export function initProjectConfig(options: { restart?: boolean } = {}): void {
  const currentDir = process.cwd();
  const projectName = path.basename(currentDir);
  const configPath = path.join(currentDir, '.mcp-config.json');
  
  // 既に存在する場合は確認
  if (fs.existsSync(configPath)) {
    console.log('⚠️  .mcp-config.json は既に存在します');
    console.log(`📄 ${configPath}`);
    return;
  }
  
  // nodeのパスを取得
  const nodePath = getNodePath();
  console.log(`🔍 Node.js パス: ${nodePath}`);
  
  // MCPサーバーのパスを取得
  let mcpServerPath: string;
  try {
    mcpServerPath = ensureMcpServerPath();
    console.log(`🔍 MCPサーバー: ${mcpServerPath}`);
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    return;
  }
  
  // 設定を作成
  const config = {
    name: projectName,
    config: {
      command: nodePath,
      args: [mcpServerPath],
      env: {
        SERVER_ROOT: currentDir,
        MCP_MODE: 'stdio',
        PROJECT_ID: projectName
      }
    }
  };
  
  // ファイルに書き込み
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  
  console.log(`✅ .mcp-config.json を作成しました`);
  console.log(`📂 プロジェクト: ${projectName}`);
  console.log(`📄 ファイル: ${configPath}`);
  console.log('');
  console.log('💡 次のコマンドで設定を有効化できます:');
  console.log(`   mcp-manager add .${options.restart ? ' --restart' : ''}`);
}

/**
 * プロジェクトのMCP設定を追加
 */
export function addProjectConfig(projectPath: string, options: { restart?: boolean } = {}): void {
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
  
  // 再起動オプションが有効な場合
  if (options.restart) {
    console.log('');
    restartClaudeDesktop();
  } else {
    console.log(`🔄 Claude Desktop を再起動してください`);
    console.log(`💡 または --restart オプションで自動再起動: mcp-manager add . --restart`);
  }
}

/**
 * プロジェクトのMCP設定を削除
 */
export function removeProjectConfig(projectPath: string, options: { restart?: boolean } = {}): void {
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
  
  // 再起動オプションが有効な場合
  if (options.restart) {
    console.log('');
    restartClaudeDesktop();
  } else {
    console.log(`🔄 Claude Desktop を再起動してください`);
    console.log(`💡 または --restart オプションで自動再起動: mcp-manager remove . --restart`);
  }
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
export function clearConfigs(options: { restart?: boolean } = {}): void {
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
  
  // 再起動オプションが有効な場合
  if (options.restart) {
    console.log('');
    restartClaudeDesktop();
  } else {
    console.log(`🔄 Claude Desktop を再起動してください`);
    console.log(`💡 または --restart オプションで自動再起動: mcp-manager clear --restart`);
  }
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
