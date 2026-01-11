/**
 * Input: 无
 * Output: Demo元数据、索引等核心类型定义
 * 地位: 整个build-tools包的类型基础，被所有模块依赖
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

/**
 * Demo类型枚举
 * - web-app: Vite Web应用，可独立运行
 * - code-snippet: 代码片段，支持语法高亮
 * - markdown: Markdown文档
 * - chat: 聊天对话记录
 * - research: 深度研究文档
 */
export type DemoType = 'web-app' | 'code-snippet' | 'markdown' | 'chat' | 'research';

/**
 * Demo元数据配置
 * 可通过demo.json、markdown frontmatter或自动推断获得
 */
export interface DemoMetadata {
  /** 唯一标识符，通常为目录名 */
  slug: string;

  /** 展示标题 */
  title: string;

  /** 简短描述 */
  description: string;

  /** Demo类型 */
  type: DemoType;

  /** 标签数组，用于分类和搜索 */
  tags: string[];

  /** 创建日期，ISO 8601格式 */
  createdAt: string;

  /** 更新日期，ISO 8601格式 */
  updatedAt?: string;

  /** 作者 */
  author?: string;

  /** 缩略图路径（相对于demo目录） */
  thumbnail?: string;

  /** 是否精选 */
  featured?: boolean;

  /** 技术栈标签 */
  techStack?: string[];

  /** 类型特定配置 */
  config?: DemoTypeConfig;

  /** 外部链接 */
  externalLinks?: {
    github?: string;
    demo?: string;
    article?: string;
  };
}

/**
 * 类型特定配置
 */
export interface DemoTypeConfig {
  /** Web应用入口文件，默认index.html */
  entryPoint?: string;

  /** 自定义构建命令 */
  buildCommand?: string;

  /** 代码片段的编程语言 */
  language?: string;

  /** 主文件路径 */
  mainFile?: string;

  /** Markdown主文档路径 */
  mainDoc?: string;
}

/**
 * demo.json配置文件格式
 * 用户可选创建此文件来定义元数据
 */
export interface DemoConfigFile {
  title?: string;
  description?: string;
  type?: DemoType;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  thumbnail?: string;
  featured?: boolean;
  techStack?: string[];
  config?: DemoTypeConfig;
  externalLinks?: {
    github?: string;
    demo?: string;
    article?: string;
  };
}

/**
 * 扫描发现的Demo目录信息
 */
export interface ScannedDemo {
  /** 目录名称（用作slug） */
  name: string;

  /** 绝对路径 */
  path: string;

  /** 目录内的文件列表（相对路径） */
  files: string[];
}

/**
 * 全局索引结构
 * 生成为index.json供主应用使用
 */
export interface DemoIndex {
  /** 所有Demo的元数据 */
  demos: DemoMetadata[];

  /** 每种类型的数量统计 */
  typeStats: Record<DemoType, number>;

  /** 所有标签列表 */
  allTags: string[];

  /** 索引最后更新时间 */
  lastUpdated: string;

  /** 总Demo数量 */
  totalCount: number;
}

/**
 * 构建结果
 */
export interface BuildResult {
  /** Demo slug */
  slug: string;

  /** 是否构建成功 */
  success: boolean;

  /** 输出路径（相对于dist） */
  outputPath: string;

  /** 错误信息（如果失败） */
  error?: string;

  /** 构建耗时（毫秒） */
  duration: number;
}

/**
 * 构建选项
 */
export interface BuildOptions {
  /** demos源目录 */
  demosDir: string;

  /** 输出目录 */
  outputDir: string;

  /** 是否清理输出目录 */
  clean?: boolean;

  /** 是否启用详细日志 */
  verbose?: boolean;
}
