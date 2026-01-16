# Repository Guidelines

## 项目结构与模块组织
- `demos/`：用户内容目录，每个 demo 单独文件夹，可选 `demo.json`。
- `packages/museum-app/`：主 React/Vite 应用（`src/` 为业务代码，`public/` 为静态资源）。
- `packages/build-tools/`：扫描、元数据与索引生成等构建工具。
- `scripts/`：项目级脚本（开发、全量构建、扫描测试）。
- `dist/`：构建产物，部署到 Cloudflare Pages。
- `docs/`：项目文档。

## 构建、测试与开发命令
- `pnpm dev`：运行 `scripts/dev.ts`，启动主应用开发服务器。
- `pnpm build`：运行 `scripts/build-all.ts`，生成索引并构建应用与 demos 到 `dist/`。
- `pnpm preview`：基于 `dist/` 预览生产构建。
- `pnpm --filter museum-app run typecheck`：主应用 TypeScript 类型检查。
- `pnpm --filter build-tools run typecheck`：构建工具 TypeScript 类型检查。
- `pnpm tsx scripts/test-scan.ts`：手动验证扫描与元数据功能。

## 编码风格与命名规范
- 语言：TypeScript + ES modules，优先沿用 `packages/**/src` 中的既有模式。
- 缩进：2 空格；保留分号（与现有文件一致）。
- 命名：React 组件用 `PascalCase`，函数/变量用 `camelCase`。
- 未配置专用格式化或 lint 工具，保持改动小且一致。

## 测试指南
- 当前无自动化测试框架。
- 建议使用类型检查与 `pnpm build` 作为主要验证手段。
- demo 命名：目录名即 slug，保持 URL 友好，如 `my-demo`。

## 提交与 PR 指南
- 近期提交信息简短明确（常见中文，如 `修复...`）。
- 建议使用动词开头的简洁标题，必要时补充范围说明。
- PR 需包含：清晰描述、影响范围（如 `demos/...`）、涉及 UI 的截图/动图。

## 配置与部署提示
- 需 Node.js >= 20，使用 `pnpm@9`（见 `package.json`）。
- Cloudflare Pages 从 `dist/` 部署，确保构建产物可重复。
