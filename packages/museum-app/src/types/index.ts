/**
 * Input: 无
 * Output: 前端使用的类型定义
 * 地位: museum-app的类型基础，与build-tools的类型保持一致
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

/**
 * Demo类型
 */
export type DemoType = 'web-app' | 'code-snippet' | 'markdown' | 'chat' | 'research';

/**
 * Demo元数据（前端使用）
 */
export interface DemoMetadata {
  slug: string;
  title: string;
  description: string;
  type: DemoType;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  author?: string;
  thumbnail?: string;
  featured?: boolean;
  techStack?: string[];
}

/**
 * Demo索引（从index.json加载）
 */
export interface DemoIndex {
  demos: DemoMetadata[];
  typeStats: Record<DemoType, number>;
  allTags: string[];
  lastUpdated: string;
  totalCount: number;
}

/**
 * 视图模式
 */
export type ViewMode = 'grid' | 'list';

/**
 * 应用状态
 */
export interface AppState {
  demos: DemoMetadata[];
  filteredDemos: DemoMetadata[];
  searchQuery: string;
  activeType: DemoType | null;
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
}

/**
 * Demo类型配置（图标、标签等）
 */
export const DEMO_TYPE_CONFIG: Record<DemoType, { label: string; icon: string }> = {
  'web-app': { label: 'Web应用', icon: '🌐' },
  'code-snippet': { label: '代码片段', icon: '💻' },
  'markdown': { label: '文档', icon: '📄' },
  'chat': { label: '对话', icon: '💬' },
  'research': { label: '研究', icon: '🔬' },
};
