/**
 * Input: DemoMetadata数组和搜索查询
 * Output: 搜索结果
 * 地位: 搜索功能核心，使用Fuse.js实现模糊搜索
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { DemoMetadata } from '../types';

/**
 * Fuse.js搜索选项
 */
const fuseOptions: IFuseOptions<DemoMetadata> = {
  // 搜索的字段及权重
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'author', weight: 0.1 },
  ],
  // 模糊匹配阈值 (0 = 精确匹配, 1 = 匹配所有)
  threshold: 0.3,
  // 忽略位置
  ignoreLocation: true,
  // 包含匹配信息
  includeScore: true,
  // 最小匹配字符
  minMatchCharLength: 2,
};

/**
 * 创建搜索实例
 */
export function createSearchIndex(demos: DemoMetadata[]): Fuse<DemoMetadata> {
  return new Fuse(demos, fuseOptions);
}

/**
 * 执行搜索
 */
export function searchDemos(
  fuse: Fuse<DemoMetadata>,
  query: string
): DemoMetadata[] {
  if (!query.trim()) {
    return [];
  }

  const results = fuse.search(query);
  return results.map((result) => result.item);
}

/**
 * 搜索Hook的结果类型
 */
export interface SearchResult {
  demos: DemoMetadata[];
  isSearching: boolean;
}
