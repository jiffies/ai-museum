/**
 * Input: 无
 * Output: 导出所有公共API（类型、扫描器、元数据提取器、索引生成器、构建器）
 * 地位: build-tools包的统一入口，外部只通过此文件访问
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

// 类型导出
export type {
  DemoType,
  DemoMetadata,
  DemoTypeConfig,
  DemoConfigFile,
  ScannedDemo,
  DemoIndex,
  BuildResult,
  BuildOptions,
} from './types.js';

// 扫描器
export {
  scanDemos,
  hasFile,
  hasFileWithExtension,
  getFilePath,
} from './scanner.js';

// 元数据提取器
export {
  extractMetadata,
  extractAllMetadata,
} from './metadata.js';

// 索引生成器
export {
  generateIndex,
  generateIndexFile,
} from './indexer.js';

// Demo构建器
export {
  buildDemo,
  buildAllDemos,
} from './builder.js';
