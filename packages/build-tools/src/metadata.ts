/**
 * Input: ScannedDemo对象
 * Output: DemoMetadata对象
 * 地位: 元数据处理核心，实现demo.json → frontmatter → 自动推断三种策略
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { readFile, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import type {
  DemoMetadata,
  DemoType,
  DemoConfigFile,
  ScannedDemo,
} from './types.js';
import { hasFile, hasFileWithExtension, getFilePath } from './scanner.js';

/**
 * 代码文件扩展名映射到语言
 */
const CODE_EXTENSIONS: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
};

/**
 * 从demo.json读取配置
 */
async function readDemoJson(demo: ScannedDemo): Promise<DemoConfigFile | null> {
  const configPath = getFilePath(demo, 'demo.json');
  if (!configPath) {
    return null;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as DemoConfigFile;
  } catch (error) {
    console.warn(`[metadata] 读取demo.json失败: ${demo.name}`, error);
    return null;
  }
}

/**
 * 从Markdown文件读取frontmatter
 */
async function readMarkdownFrontmatter(
  demo: ScannedDemo
): Promise<DemoConfigFile | null> {
  // 查找markdown文件
  const mdFiles = demo.files.filter(
    (f) => f.endsWith('.md') && !f.toLowerCase().includes('readme')
  );

  if (mdFiles.length === 0) {
    return null;
  }

  // 优先使用index.md或content.md
  const priorityFiles = ['index.md', 'content.md', 'main.md'];
  let targetFile = mdFiles[0];
  for (const pf of priorityFiles) {
    if (mdFiles.includes(pf)) {
      targetFile = pf;
      break;
    }
  }

  const filePath = join(demo.path, targetFile);

  try {
    const content = await readFile(filePath, 'utf-8');
    const { data } = matter(content);

    if (Object.keys(data).length === 0) {
      return null;
    }

    return data as DemoConfigFile;
  } catch (error) {
    console.warn(`[metadata] 读取frontmatter失败: ${demo.name}`, error);
    return null;
  }
}

/**
 * 自动推断Demo类型
 */
function inferDemoType(demo: ScannedDemo): DemoType {
  // 检测Vite项目（web-app）
  if (hasFile(demo, 'vite.config.ts') || hasFile(demo, 'vite.config.js')) {
    return 'web-app';
  }

  // 检测package.json（可能是web-app）
  if (hasFile(demo, 'package.json') && hasFile(demo, 'index.html')) {
    return 'web-app';
  }

  // 检测对话类型（目录名包含chat或对话）
  const lowerName = demo.name.toLowerCase();
  if (lowerName.includes('chat') || lowerName.includes('对话')) {
    return 'chat';
  }

  // 检测研究文档（目录名包含research或研究）
  if (lowerName.includes('research') || lowerName.includes('研究')) {
    return 'research';
  }

  // 检测markdown文档
  const mdFiles = demo.files.filter(
    (f) => f.endsWith('.md') && !f.toLowerCase().includes('readme')
  );
  if (mdFiles.length > 0) {
    return 'markdown';
  }

  // 检测代码文件
  const codeExtensions = Object.keys(CODE_EXTENSIONS);
  if (demo.files.some((f) => codeExtensions.includes(extname(f)))) {
    return 'code-snippet';
  }

  // 默认为markdown
  return 'markdown';
}

/**
 * 自动推断代码语言
 */
function inferCodeLanguage(demo: ScannedDemo): string | undefined {
  const codeExtensions = Object.keys(CODE_EXTENSIONS);

  for (const file of demo.files) {
    const ext = extname(file);
    if (CODE_EXTENSIONS[ext]) {
      return CODE_EXTENSIONS[ext];
    }
  }

  return undefined;
}

/**
 * 从目录名生成标题
 * 例如: "my-cool-demo" -> "My Cool Demo"
 */
function generateTitle(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * 获取目录创建时间
 */
async function getDirCreatedTime(dirPath: string): Promise<string> {
  try {
    const stats = await stat(dirPath);
    return stats.birthtime.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * 提取Demo元数据
 * 优先级: demo.json > markdown frontmatter > 自动推断
 *
 * @param demo - 扫描得到的demo目录信息
 * @returns 完整的DemoMetadata对象
 */
export async function extractMetadata(demo: ScannedDemo): Promise<DemoMetadata> {
  // 1. 尝试读取demo.json
  const jsonConfig = await readDemoJson(demo);

  // 2. 尝试读取markdown frontmatter
  const frontmatterConfig = await readMarkdownFrontmatter(demo);

  // 3. 合并配置（demo.json优先）
  const config: DemoConfigFile = {
    ...frontmatterConfig,
    ...jsonConfig,
  };

  // 4. 推断缺失字段
  const inferredType = inferDemoType(demo);
  const createdAt = await getDirCreatedTime(demo.path);

  // 5. 构建最终元数据
  const metadata: DemoMetadata = {
    slug: demo.name,
    title: config.title || generateTitle(demo.name),
    description: config.description || `${generateTitle(demo.name)} Demo`,
    type: config.type || inferredType,
    tags: config.tags || [],
    createdAt: config.createdAt || createdAt,
    updatedAt: config.updatedAt,
    author: config.author,
    thumbnail: config.thumbnail,
    featured: config.featured || false,
    techStack: config.techStack,
    config: config.config,
    externalLinks: config.externalLinks,
  };

  // 6. 补充类型特定配置
  if (metadata.type === 'code-snippet' && !metadata.config?.language) {
    const language = inferCodeLanguage(demo);
    if (language) {
      metadata.config = {
        ...metadata.config,
        language,
      };
    }
  }

  console.log(
    `[metadata] ${demo.name}: type=${metadata.type}, ` +
      `source=${jsonConfig ? 'demo.json' : frontmatterConfig ? 'frontmatter' : 'inferred'}`
  );

  return metadata;
}

/**
 * 批量提取元数据
 */
export async function extractAllMetadata(
  demos: ScannedDemo[]
): Promise<DemoMetadata[]> {
  const results = await Promise.all(demos.map(extractMetadata));
  return results;
}
