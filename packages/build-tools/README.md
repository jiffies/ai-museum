# build-tools 包

一旦我所属的目录有所变化，请更新我（文档）。

| 文件 | 地位 | 功能 |
|------|------|------|
| src/types.ts | 类型核心 | Demo元数据等核心类型定义 |
| src/scanner.ts | 扫描器 | 遍历demos目录发现所有demo |
| src/metadata.ts | 元数据提取器 | 读取demo.json/frontmatter/自动推断元数据 |
| src/indexer.ts | 索引生成器 | 生成全局index.json索引文件 |
| src/builder.ts | 构建器 | 根据demo类型执行不同构建策略 |
| src/index.ts | 入口 | 导出所有公共API |
