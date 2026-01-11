/**
 * Input: 无
 * Output: 启动开发服务器
 * 地位: 开发环境脚本，启动museum-app的Vite开发服务器
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const museumAppDir = resolve(import.meta.dirname, '../packages/museum-app');

console.log('🏛️  启动AI Museum开发服务器...');
console.log(`📂 项目目录: ${museumAppDir}`);

const devProcess = spawn('pnpm', ['dev'], {
  cwd: museumAppDir,
  stdio: 'inherit',
  shell: true,
});

devProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error.message);
  process.exit(1);
});

devProcess.on('close', (code) => {
  process.exit(code ?? 0);
});
