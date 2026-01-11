/**
 * Input: DemoMetadata和源目录路径
 * Output: 构建后的文件到dist/demos/{slug}/
 * 地位: 根据demo类型执行不同构建策略（Web应用构建、文件复制等）
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { spawn } from 'node:child_process';
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import type { DemoMetadata, BuildResult, ScannedDemo } from './types.js';
import { hasFile } from './scanner.js';

/**
 * 执行shell命令
 */
function execCommand(
  command: string,
  args: string[],
  options: { cwd: string; env?: Record<string, string> }
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });

    proc.on('error', (error) => {
      resolve({ code: 1, stdout, stderr: error.message });
    });
  });
}

/**
 * 构建Web应用类型的Demo
 * 运行 pnpm install && pnpm build，设置正确的base路径
 */
async function buildWebApp(
  demo: ScannedDemo,
  metadata: DemoMetadata,
  outputDir: string
): Promise<BuildResult> {
  const startTime = Date.now();
  const outputPath = `demos/${metadata.slug}`;

  console.log(`[builder] 构建Web应用: ${metadata.slug}`);

  try {
    // 检查是否有package.json
    if (!hasFile(demo, 'package.json')) {
      // 没有package.json，直接复制文件
      await copyFiles(demo, outputDir);
      return {
        slug: metadata.slug,
        success: true,
        outputPath,
        duration: Date.now() - startTime,
      };
    }

    // 安装依赖
    console.log(`[builder] ${metadata.slug}: 安装依赖...`);
    const installResult = await execCommand('pnpm', ['install'], {
      cwd: demo.path,
    });

    if (installResult.code !== 0) {
      console.warn(`[builder] ${metadata.slug}: 依赖安装警告`, installResult.stderr);
    }

    // 构建
    console.log(`[builder] ${metadata.slug}: 执行构建...`);
    const buildResult = await execCommand('pnpm', ['build'], {
      cwd: demo.path,
      env: {
        VITE_BASE_PATH: `/demos/${metadata.slug}/`,
      },
    });

    if (buildResult.code !== 0) {
      throw new Error(`构建失败: ${buildResult.stderr}`);
    }

    // 查找构建输出目录（通常是dist）
    const possibleOutputDirs = ['dist', 'build', 'out'];
    let sourceDir: string | null = null;

    for (const dir of possibleOutputDirs) {
      const dirPath = join(demo.path, dir);
      try {
        await readdir(dirPath);
        sourceDir = dirPath;
        break;
      } catch {
        // 目录不存在，继续尝试
      }
    }

    if (!sourceDir) {
      throw new Error('找不到构建输出目录 (dist/build/out)');
    }

    // 复制构建产物到目标目录
    await mkdir(outputDir, { recursive: true });
    await cp(sourceDir, outputDir, { recursive: true });

    console.log(`[builder] ${metadata.slug}: 构建完成`);

    return {
      slug: metadata.slug,
      success: true,
      outputPath,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[builder] ${metadata.slug}: 构建失败 - ${errorMessage}`);

    return {
      slug: metadata.slug,
      success: false,
      outputPath,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 复制文件到输出目录
 */
async function copyFiles(demo: ScannedDemo, outputDir: string): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await cp(demo.path, outputDir, { recursive: true });
}

/**
 * 构建代码片段类型的Demo
 * 复制源码文件，生成预览HTML
 */
async function buildCodeSnippet(
  demo: ScannedDemo,
  metadata: DemoMetadata,
  outputDir: string
): Promise<BuildResult> {
  const startTime = Date.now();
  const outputPath = `demos/${metadata.slug}`;

  console.log(`[builder] 构建代码片段: ${metadata.slug}`);

  try {
    await mkdir(outputDir, { recursive: true });

    // 复制所有文件
    await cp(demo.path, outputDir, { recursive: true });

    // 生成简单的index.html预览页面
    const codeFiles = demo.files.filter((f) => {
      const ext = extname(f);
      return ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'].includes(ext);
    });

    if (codeFiles.length > 0) {
      const mainFile = codeFiles[0];
      const content = await readFile(join(demo.path, mainFile), 'utf-8');
      const escapedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    body { font-family: system-ui; background: #1e1e1e; color: #d4d4d4; padding: 20px; margin: 0; }
    h1 { color: #fff; font-size: 1.5rem; margin-bottom: 1rem; }
    pre { background: #2d2d2d; padding: 20px; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.5; }
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 1rem; }
    a { color: #4fc3f7; }
  </style>
</head>
<body>
  <h1>${metadata.title}</h1>
  <p class="meta">${metadata.description}</p>
  <p class="meta">文件: ${mainFile}</p>
  <pre><code>${escapedContent}</code></pre>
  <p><a href="/">← 返回首页</a></p>
</body>
</html>`;

      await writeFile(join(outputDir, 'index.html'), html, 'utf-8');
    }

    return {
      slug: metadata.slug,
      success: true,
      outputPath,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      slug: metadata.slug,
      success: false,
      outputPath,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 构建Markdown类型的Demo
 * 复制文件，生成简单的HTML预览
 */
async function buildMarkdown(
  demo: ScannedDemo,
  metadata: DemoMetadata,
  outputDir: string
): Promise<BuildResult> {
  const startTime = Date.now();
  const outputPath = `demos/${metadata.slug}`;

  console.log(`[builder] 构建Markdown: ${metadata.slug}`);

  try {
    await mkdir(outputDir, { recursive: true });
    await cp(demo.path, outputDir, { recursive: true });

    // 找到主markdown文件
    const mdFiles = demo.files.filter(
      (f) => f.endsWith('.md') && !f.toLowerCase().includes('readme')
    );
    const mainMd = mdFiles[0] || demo.files.find((f) => f.endsWith('.md'));

    if (mainMd) {
      const content = await readFile(join(demo.path, mainMd), 'utf-8');

      // 简单的markdown转HTML（后续可用更好的库）
      const htmlContent = content
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/g, '<p>')
        .replace(/$/g, '</p>');

      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; color: #333; }
    h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; color: #3E2723; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    a { color: #D4AF37; }
    .meta { color: #888; font-size: 0.9rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="meta">
    <a href="/">← 返回首页</a> | ${metadata.createdAt}
  </div>
  ${htmlContent}
</body>
</html>`;

      await writeFile(join(outputDir, 'index.html'), html, 'utf-8');
    }

    return {
      slug: metadata.slug,
      success: true,
      outputPath,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      slug: metadata.slug,
      success: false,
      outputPath,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 构建单个Demo
 * 根据类型选择不同的构建策略
 */
export async function buildDemo(
  demo: ScannedDemo,
  metadata: DemoMetadata,
  baseOutputDir: string
): Promise<BuildResult> {
  const outputDir = join(baseOutputDir, 'demos', metadata.slug);

  switch (metadata.type) {
    case 'web-app':
      return buildWebApp(demo, metadata, outputDir);

    case 'code-snippet':
      return buildCodeSnippet(demo, metadata, outputDir);

    case 'markdown':
    case 'qa':
    case 'research':
      return buildMarkdown(demo, metadata, outputDir);

    default:
      // 默认直接复制
      await copyFiles(demo, outputDir);
      return {
        slug: metadata.slug,
        success: true,
        outputPath: `demos/${metadata.slug}`,
        duration: 0,
      };
  }
}

/**
 * 构建所有Demo
 */
export async function buildAllDemos(
  demos: ScannedDemo[],
  metadataList: DemoMetadata[],
  baseOutputDir: string
): Promise<BuildResult[]> {
  const results: BuildResult[] = [];

  // 创建metadata映射
  const metadataMap = new Map<string, DemoMetadata>();
  for (const m of metadataList) {
    metadataMap.set(m.slug, m);
  }

  // 逐个构建（避免并发问题）
  for (const demo of demos) {
    const metadata = metadataMap.get(demo.name);
    if (!metadata) {
      console.warn(`[builder] 跳过: ${demo.name} (无元数据)`);
      continue;
    }

    const result = await buildDemo(demo, metadata, baseOutputDir);
    results.push(result);
  }

  // 统计结果
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  console.log(`[builder] 构建完成: ${successCount}成功, ${failCount}失败`);

  return results;
}
