#!/usr/bin/env node

import { Command } from 'commander';
import { addProjectConfig, removeProjectConfig, listConfigs, clearConfigs, showStatus } from './manager';

const program = new Command();

program
  .name('mcp-manager')
  .description('Claude Desktop の MCP サーバー設定をプロジェクトごとに管理')
  .version('1.0.0');

program
  .command('add <project-path>')
  .description('プロジェクトのMCP設定を追加')
  .action((projectPath: string) => {
    try {
      addProjectConfig(projectPath);
    } catch (error) {
      console.error(`❌ エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command('remove <project-path>')
  .description('プロジェクトのMCP設定を削除')
  .action((projectPath: string) => {
    try {
      removeProjectConfig(projectPath);
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
  .description('すべてのMCP設定を削除')
  .action(() => {
    try {
      clearConfigs();
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

program.parse();
