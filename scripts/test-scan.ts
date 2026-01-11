/**
 * Input: 无
 * Output: 测试scanner和metadata功能
 * 地位: 临时测试脚本
 */

import { resolve } from 'node:path';
import { scanDemos } from '../packages/build-tools/src/scanner.js';
import { extractAllMetadata } from '../packages/build-tools/src/metadata.js';

async function main() {
  const demosDir = resolve(import.meta.dirname, '../demos');

  console.log('=== 测试Scanner ===');
  const demos = await scanDemos(demosDir);
  console.log('扫描结果:', JSON.stringify(demos, null, 2));

  console.log('\n=== 测试Metadata ===');
  const metadata = await extractAllMetadata(demos);
  console.log('元数据结果:', JSON.stringify(metadata, null, 2));
}

main().catch(console.error);
