/**
 * Input: demos目录路径
 * Output: ScannedDemo数组，包含每个demo的名称、路径和文件列表
 * 地位: 构建流程第一步，负责发现所有demo目录
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { ScannedDemo } from './types.js';

/**
 * 需要忽略的目录和文件
 */
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.DS_Store',
  'Thumbs.db',
  '.gitkeep',
  'README.md',
];

/**
 * 判断是否应该忽略该文件/目录
 */
function shouldIgnore(name: string): boolean {
  return IGNORE_PATTERNS.includes(name) || name.startsWith('.');
}

/**
 * 递归获取目录下的所有文件（相对路径）
 */
async function getFilesRecursive(
  dirPath: string,
  basePath: string = dirPath
): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) {
      continue;
    }

    const fullPath = join(dirPath, entry.name);
    const relativePath = relative(basePath, fullPath);

    if (entry.isDirectory()) {
      // 递归扫描子目录
      const subFiles = await getFilesRecursive(fullPath, basePath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * 扫描demos目录，发现所有demo子目录
 *
 * @param demosDir - demos目录的绝对路径
 * @returns 扫描结果数组，每个元素代表一个demo
 *
 * @example
 * ```ts
 * const demos = await scanDemos('/path/to/ai-museum/demos');
 * // 返回: [{ name: 'my-demo', path: '/path/to/demos/my-demo', files: [...] }]
 * ```
 */
export async function scanDemos(demosDir: string): Promise<ScannedDemo[]> {
  const results: ScannedDemo[] = [];

  // 检查demos目录是否存在
  try {
    const stats = await stat(demosDir);
    if (!stats.isDirectory()) {
      console.warn(`[scanner] ${demosDir} 不是一个目录`);
      return results;
    }
  } catch (error) {
    console.warn(`[scanner] demos目录不存在: ${demosDir}`);
    return results;
  }

  // 读取demos目录下的所有条目
  const entries = await readdir(demosDir, { withFileTypes: true });

  for (const entry of entries) {
    // 只处理目录，跳过文件和忽略项
    if (!entry.isDirectory() || shouldIgnore(entry.name)) {
      continue;
    }

    const demoPath = join(demosDir, entry.name);

    // 获取demo目录下的所有文件
    const files = await getFilesRecursive(demoPath);

    // 如果目录为空或只有忽略的文件，跳过
    if (files.length === 0) {
      console.log(`[scanner] 跳过空目录: ${entry.name}`);
      continue;
    }

    results.push({
      name: entry.name,
      path: demoPath,
      files: files.sort(), // 按文件名排序
    });

    console.log(`[scanner] 发现demo: ${entry.name} (${files.length}个文件)`);
  }

  console.log(`[scanner] 扫描完成，共发现 ${results.length} 个demo`);

  return results;
}

/**
 * 判断扫描结果是否为特定类型
 * 用于快速判断demo类型
 */
export function hasFile(demo: ScannedDemo, fileName: string): boolean {
  return demo.files.some(
    (f) => f === fileName || f.endsWith(`/${fileName}`)
  );
}

/**
 * 判断是否有特定扩展名的文件
 */
export function hasFileWithExtension(demo: ScannedDemo, ext: string): boolean {
  return demo.files.some((f) => f.endsWith(ext));
}

/**
 * 获取特定文件的完整路径
 */
export function getFilePath(demo: ScannedDemo, fileName: string): string | null {
  const file = demo.files.find(
    (f) => f === fileName || f.endsWith(`/${fileName}`)
  );
  return file ? join(demo.path, file) : null;
}
