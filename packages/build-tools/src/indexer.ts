/**
 * Input: DemoMetadata数组
 * Output: DemoIndex对象，写入index.json文件
 * 地位: 连接构建工具和主应用的桥梁，生成前端所需的数据索引
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { DemoMetadata, DemoType, DemoIndex } from './types.js';

/**
 * 所有支持的Demo类型
 */
const ALL_DEMO_TYPES: DemoType[] = [
  'web-app',
  'code-snippet',
  'markdown',
  'chat',
  'research',
];

/**
 * 统计每种类型的Demo数量
 */
function calculateTypeStats(demos: DemoMetadata[]): Record<DemoType, number> {
  const stats: Record<DemoType, number> = {
    'web-app': 0,
    'code-snippet': 0,
    'markdown': 0,
    'chat': 0,
    'research': 0,
  };

  for (const demo of demos) {
    if (stats[demo.type] !== undefined) {
      stats[demo.type]++;
    }
  }

  return stats;
}

/**
 * 收集所有唯一标签
 */
function collectAllTags(demos: DemoMetadata[]): string[] {
  const tagSet = new Set<string>();

  for (const demo of demos) {
    for (const tag of demo.tags) {
      tagSet.add(tag.toLowerCase());
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * 按创建日期排序（最新的在前）
 */
function sortByDate(demos: DemoMetadata[]): DemoMetadata[] {
  return [...demos].sort((a, b) => {
    // 精选的放在最前面
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 然后按日期排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * 生成Demo索引
 *
 * @param demos - 所有Demo的元数据
 * @returns DemoIndex对象
 */
export function generateIndex(demos: DemoMetadata[]): DemoIndex {
  const sortedDemos = sortByDate(demos);
  const typeStats = calculateTypeStats(demos);
  const allTags = collectAllTags(demos);

  const index: DemoIndex = {
    demos: sortedDemos,
    typeStats,
    allTags,
    lastUpdated: new Date().toISOString(),
    totalCount: demos.length,
  };

  console.log(`[indexer] 生成索引: ${demos.length}个demo, ${allTags.length}个标签`);
  console.log(`[indexer] 类型统计:`, typeStats);

  return index;
}

/**
 * 生成索引并写入文件
 *
 * @param demos - 所有Demo的元数据
 * @param outputPath - 输出文件路径（如 dist/index.json）
 */
export async function generateIndexFile(
  demos: DemoMetadata[],
  outputPath: string
): Promise<DemoIndex> {
  const index = generateIndex(demos);

  // 确保输出目录存在
  await mkdir(dirname(outputPath), { recursive: true });

  // 写入JSON文件
  await writeFile(outputPath, JSON.stringify(index, null, 2), 'utf-8');

  console.log(`[indexer] 索引已写入: ${outputPath}`);

  return index;
}
