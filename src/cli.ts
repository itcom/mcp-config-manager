#!/usr/bin/env node

import { Command } from 'commander';
import { addProjectConfig, removeProjectConfig, listConfigs, clearConfigs, showStatus, initProjectConfig, restartClaudeDesktop, setMcpServerPath, showConfig, listBackups, cleanBackups } from './manager';

const program = new Command();

program
  .name('mcp-manager')
  .description('Claude Desktop の MCP サーバー設定をプロジェクトごとに管理')
  .version('1.0.0')
  .addHelpText('after', '\n使用例:\n' +
    '  $ mcp-manager config set-mcp-server /path/to/mcp-server/dist/index.js\n' +
    '  $ mcp-manager init\n' +
    '  $ mcp-manager add . -r\n' +
    '  $ mcp-manager remove . -r\n' +
    '\nオプション詳細は各コマンドで --help を実行してください (例: mcp-manager add --help)'
  );

// config コマンドグループ
const configCmd = program
  .command('config')
  .description('mcp-manager の設定を管理');

configCmd
  .command('set-mcp-server <path>')
  .description('MCPサーバーのパスを設定')
  .action((serverPath: string) => {
    try {
      setMcpServerPath(serverPath);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

configCmd
  .command('show')
  .description('現在の設定を表示')
  .action(() => {
    try {
      showConfig();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('現在のディレクトリに .mcp-config.json を作成')
  .action(() => {
    try {
      initProjectConfig();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('add <project-path>')
  .description('プロジェクトのMCP設定を追加 (オプション: -r で自動再起動)')
  .option('-r, --restart', 'Claude Desktop を自動的に再起動')
  .action((projectPath: string, options: { restart?: boolean }) => {
    try {
      addProjectConfig(projectPath, options);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('remove <project-path>')
  .description('プロジェクトのMCP設定を削除 (オプション: -r で自動再起動)')
  .option('-r, --restart', 'Claude Desktop を自動的に再起動')
  .action((projectPath: string, options: { restart?: boolean }) => {
    try {
      removeProjectConfig(projectPath, options);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('登録されているMCP設定を一覧表示')
  .action(() => {
    try {
      listConfigs();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('clear')
  .description('すべてのMCP設定を削除 (オプション: -r で自動再起動)')
  .option('-r, --restart', 'Claude Desktop を自動的に再起動')
  .action((options: { restart?: boolean }) => {
    try {
      clearConfigs(options);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('現在の設定状況を表示')
  .action(() => {
    try {
      showStatus();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('restart')
  .description('Claude Desktop を再起動')
  .action(() => {
    try {
      restartClaudeDesktop();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// backup コマンドグループ
const backupCmd = program
  .command('backup')
  .description('バックアップファイルを管理');

backupCmd
  .command('list')
  .description('バックアップファイルの一覧を表示')
  .action(() => {
    try {
      listBackups();
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

backupCmd
  .command('clean')
  .description('古いバックアップを削除（最新5個だけ残す）')
  .option('-k, --keep <count>', '残すバックアップの数', '5')
  .action((options: { keep?: string }) => {
    try {
      const keepCount = parseInt(options.keep || '5', 10);
      cleanBackups(keepCount);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program.parse();
