/**
 * Input: 无（读取demos/目录和packages/museum-app）
 * Output: 完整构建到dist/目录
 * 地位: 总构建脚本，协调扫描→元数据→索引→构建demos→构建主应用的完整流程
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { spawn } from 'node:child_process';
import { rm, cp, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

import {
  scanDemos,
  extractAllMetadata,
  generateIndexFile,
  buildAllDemos,
} from '../packages/build-tools/src/index.js';

// 项目根目录
const ROOT_DIR = resolve(import.meta.dirname, '..');
const DEMOS_DIR = join(ROOT_DIR, 'demos');
const DIST_DIR = join(ROOT_DIR, 'dist');
const MUSEUM_APP_DIR = join(ROOT_DIR, 'packages/museum-app');

/**
 * 执行命令并等待完成
 */
function execCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log(`[build] 执行: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      resolve(code ?? 1);
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 主构建流程
 */
async function main() {
  const startTime = Date.now();

  console.log('🏛️  AI Museum 构建开始');
  console.log('='.repeat(50));

  // 1. 清理dist目录
  console.log('\n📦 步骤1: 清理输出目录...');
  try {
    await rm(DIST_DIR, { recursive: true, force: true });
  } catch {
    // 目录可能不存在，忽略错误
  }
  await mkdir(DIST_DIR, { recursive: true });
  console.log('✓ 输出目录已清理');

  // 2. 扫描demos目录
  console.log('\n🔍 步骤2: 扫描demos目录...');
  const demos = await scanDemos(DEMOS_DIR);
  console.log(`✓ 发现 ${demos.length} 个demo`);

  // 3. 提取元数据
  console.log('\n📋 步骤3: 提取元数据...');
  const metadata = await extractAllMetadata(demos);
  console.log(`✓ 提取了 ${metadata.length} 个demo的元数据`);

  // 4. 生成索引
  console.log('\n📊 步骤4: 生成索引...');
  const indexPath = join(DIST_DIR, 'index.json');
  const index = await generateIndexFile(metadata, indexPath);
  console.log(`✓ 索引已生成: ${index.totalCount} 个demo, ${index.allTags.length} 个标签`);

  // 5. 构建主应用（先构建，因为会清空dist目录）
  console.log('\n🏗️  步骤5: 构建主应用...');

  // 复制index.json到museum-app的public目录供开发使用
  const museumPublicDir = join(MUSEUM_APP_DIR, 'public');
  await mkdir(museumPublicDir, { recursive: true });
  await cp(indexPath, join(museumPublicDir, 'index.json'));

  // 执行museum-app构建
  const buildCode = await execCommand('pnpm', ['build'], MUSEUM_APP_DIR);

  if (buildCode !== 0) {
    console.error('❌ 主应用构建失败');
    process.exit(1);
  }

  console.log('✓ 主应用构建完成');

  // 6. 构建所有demos（在主应用之后，因为主应用会清空dist）
  console.log('\n🔨 步骤6: 构建demos...');
  if (demos.length > 0) {
    const buildResults = await buildAllDemos(demos, metadata, DIST_DIR);
    const successCount = buildResults.filter((r) => r.success).length;
    const failCount = buildResults.filter((r) => !r.success).length;

    if (failCount > 0) {
      console.log(`⚠️  构建结果: ${successCount} 成功, ${failCount} 失败`);
      for (const r of buildResults.filter((r) => !r.success)) {
        console.log(`   ❌ ${r.slug}: ${r.error}`);
      }
    } else {
      console.log(`✓ 所有demo构建成功`);
    }
  } else {
    console.log('✓ 没有demo需要构建');
  }

  // 7. 重新写入index.json（可能被vite build覆盖）
  console.log('\n📁 步骤7: 写入索引文件...');
  await generateIndexFile(metadata, indexPath);
  console.log('✓ 索引文件已更新');

  // 8. 完成
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 构建完成! 耗时: ${duration}s`);
  console.log(`📂 输出目录: ${DIST_DIR}`);
  console.log('\n预览命令:');
  console.log('  cd dist && npx serve');
}

// 执行
main().catch((error) => {
  console.error('❌ 构建失败:', error);
  process.exit(1);
});
