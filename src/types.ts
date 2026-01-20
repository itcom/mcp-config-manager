import * as os from 'os';
import * as path from 'path';

/**
 * プロジェクト用のMCP設定
 */
export interface ProjectMcpConfig {
  name: string;
  config: {
    command: string;
    args: string[];
    env?: Record<string, string>;
  };
}

/**
 * Claude Desktopの設定ファイル構造
 */
export interface ClaudeDesktopConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

/**
 * mcp-managerのグローバル設定
 */
export interface McpManagerConfig {
  mcpServerPath: string;
}

/**
 * Claude Desktop設定ファイルのパス
 */
export function getClaudeConfigPath(): string {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    // macOS
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    // Windows
    return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux
    return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

/**
 * バックアップファイルのパス
 */
export function getBackupPath(): string {
  const configPath = getClaudeConfigPath();
  const dir = path.dirname(configPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(dir, `claude_desktop_config.backup.${timestamp}.json`);
}

/**
 * mcp-managerの設定ディレクトリパス
 */
export function getManagerConfigDir(): string {
  return path.join(os.homedir(), '.mcp-manager');
}

/**
 * mcp-managerの設定ファイルパス
 */
export function getManagerConfigPath(): string {
  return path.join(getManagerConfigDir(), 'config.json');
}
