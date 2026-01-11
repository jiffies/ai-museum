# AI Museum

一旦我所属的目录有所变化，请更新我（文档）。

🏛️ AI Demo收集展示系统 - 博物馆风格的Web应用，用于收集和展示各种AI相关的demo。

## 功能特性

- 🎨 博物馆风格UI设计（浅米色背景、衬线标题、卡片布局）
- 🔍 实时模糊搜索（基于Fuse.js）
- 📂 类型筛选和分页浏览
- 📱 响应式卡片/列表双视图
- 🚀 Git push自动部署到Cloudflare Pages

## 目录结构

| 目录/文件 | 地位 | 功能 |
|-----------|------|------|
| `demos/` | 用户内容目录 | 存放用户添加的各种AI demo |
| `packages/build-tools/` | 构建工具包 | 扫描、索引、构建demo的工具 |
| `packages/museum-app/` | 主展示应用 | 博物馆风格的展示UI |
| `scripts/` | 构建脚本 | 总构建流程协调脚本 |
| `dist/` | 构建输出 | 最终部署到Cloudflare Pages的内容 |
| `.github/workflows/` | CI/CD配置 | GitHub Actions自动部署 |

## Demo类型

| 类型 | 图标 | 说明 |
|------|------|------|
| `web-app` | 🌐 | Vite Web应用，独立构建，点击跳转到独立页面 |
| `code-snippet` | 📝 | 代码片段，生成预览页面 |
| `markdown` | 📄 | Markdown文档，渲染为HTML |
| `chat` | 💬 | 对话记录 |
| `research` | 🔬 | 深度研究文档 |

## 技术栈

- TypeScript 5.7+ + React 19
- Vite 7.x + pnpm workspace
- TailwindCSS 4.x
- React Router 7.x
- Fuse.js 7.x（搜索）
- Cloudflare Pages（部署）

---

## 📖 完整使用教程

### 1. 初次部署（Step by Step）

#### 步骤1: 准备开发环境

```bash
# 确保已安装 Node.js 18+ 和 pnpm
node -v  # 应该 >= 18
pnpm -v  # 如果没有安装pnpm，运行: npm install -g pnpm

# 克隆或下载项目
git clone <你的仓库地址>
cd ai-museum

# 安装依赖
pnpm install
```

#### 步骤2: 本地开发和预览

```bash
# 开发模式（主应用）
pnpm dev
# 访问 http://localhost:5173

# 完整构建
pnpm build

# 预览构建结果
cd dist
npx serve
# 访问 http://localhost:3000
```

#### 步骤3: 创建GitHub仓库

1. 访问 https://github.com/new
2. 输入仓库名（例如：`ai-museum`）
3. 选择公开（Public）或私有（Private）
4. 不要勾选任何初始化选项
5. 点击 "Create repository"

```bash
# 在本地项目目录执行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/ai-museum.git
git push -u origin main
```

#### 步骤4: 获取Cloudflare配置

##### 4.1 注册/登录Cloudflare

访问 https://dash.cloudflare.com 并登录

##### 4.2 获取账户ID

1. 登录后，在右侧边栏可以看到 **Account ID**
2. 复制保存这个ID（格式类似：`1a2b3c4d5e6f7g8h9i0j`）

##### 4.3 创建API Token

1. 点击右上角头像 → **My Profile**
2. 左侧菜单选择 **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Workers** 模板
5. 或自定义权限：
   - Account - Cloudflare Pages - Edit
6. 点击 **Continue to summary** → **Create Token**
7. 复制生成的Token（只显示一次，务必保存）

#### 步骤5: 配置GitHub Secrets

1. 访问你的GitHub仓库页面
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**

添加两个secrets：

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: 粘贴步骤4.3获取的Token

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: 粘贴步骤4.2获取的账户ID

#### 步骤6: 创建Cloudflare Pages项目

##### 方式A: 通过GitHub Actions自动创建（推荐）

```bash
# 只需push代码，GitHub Actions会自动创建Pages项目
git push origin main

# 查看GitHub Actions运行状态
# 访问: https://github.com/你的用户名/ai-museum/actions
```

首次部署后，访问 https://dash.cloudflare.com/pages 查看项目

##### 方式B: 手动在Cloudflare创建

1. 访问 https://dash.cloudflare.com/pages
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 授权GitHub并选择仓库 `ai-museum`
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**

#### 步骤7: 访问部署的网站

部署成功后，你的网站会在：
- `https://ai-museum-xxx.pages.dev`（自动生成）
- 或配置自定义域名

---

### 2. 添加新Demo（详细教程）

#### 示例1: 添加Markdown文档

```bash
# 创建demo目录
mkdir demos/llm-intro

# 创建元数据文件（可选）
cat > demos/llm-intro/demo.json << 'EOF'
{
  "title": "大语言模型入门",
  "description": "介绍LLM的基本原理和应用",
  "type": "markdown",
  "tags": ["llm", "ai", "教程"],
  "createdAt": "2026-01-11",
  "author": "你的名字",
  "featured": false
}
EOF

# 创建markdown内容
cat > demos/llm-intro/index.md << 'EOF'
# 大语言模型入门

## 什么是LLM？

大语言模型（Large Language Model）是...

## 核心技术

- Transformer架构
- 预训练和微调
- 提示工程
EOF

# 提交并推送
git add demos/llm-intro
git commit -m "添加LLM入门文档"
git push origin main
```

等待几分钟，GitHub Actions自动构建部署，然后访问网站查看新demo。

#### 示例2: 添加代码片段

```bash
# 创建demo目录
mkdir demos/python-openai

# 创建demo.json
cat > demos/python-openai/demo.json << 'EOF'
{
  "title": "Python OpenAI示例",
  "description": "使用Python调用OpenAI API",
  "type": "code-snippet",
  "tags": ["python", "openai", "api"],
  "createdAt": "2026-01-11",
  "techStack": ["Python", "OpenAI SDK"],
  "config": {
    "language": "python"
  }
}
EOF

# 创建代码文件
cat > demos/python-openai/main.py << 'EOF'
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
EOF

# 提交并推送
git add demos/python-openai
git commit -m "添加Python OpenAI示例"
git push origin main
```

#### 示例3: 添加Web应用（从AI Studio）

假设你在AI Studio创建了一个Vite项目：

```bash
# 方式1: 复制整个项目
cp -r /path/to/your/vite-project demos/my-ai-app

# 方式2: 创建新目录并移动文件
mkdir demos/my-ai-app
cd demos/my-ai-app

# 确保包含这些文件:
# - package.json
# - vite.config.ts
# - index.html
# - src/

# 创建demo.json
cat > demo.json << 'EOF'
{
  "title": "我的AI应用",
  "description": "使用Gemini API的聊天应用",
  "type": "web-app",
  "tags": ["gemini", "chat", "react"],
  "createdAt": "2026-01-11",
  "featured": true,
  "techStack": ["React", "TypeScript", "Gemini API"]
}
EOF

# 返回项目根目录
cd ../..

# 提交并推送
git add demos/my-ai-app
git commit -m "添加我的AI应用"
git push origin main
```

#### 不使用demo.json（自动推断）

如果不创建`demo.json`，系统会自动推断：

```bash
# Markdown类型（检测到.md文件）
mkdir demos/auto-markdown
echo "# 标题" > demos/auto-markdown/README.md

# 代码片段（检测到代码文件）
mkdir demos/auto-code
cat > demos/auto-code/script.py << 'EOF'
print("Hello AI!")
EOF

# Web应用（检测到vite.config.ts + package.json）
mkdir demos/auto-webapp
# ... 复制vite项目文件 ...

git add demos/auto-*
git commit -m "添加自动推断类型的demos"
git push origin main
```

---

### 3. 本地开发和测试

#### 测试构建

```bash
# 完整构建
pnpm build

# 检查输出
ls dist/
ls dist/demos/

# 查看索引文件
cat dist/index.json

# 本地预览
cd dist
npx serve -l 3000
# 访问 http://localhost:3000
```

#### 只开发主应用

```bash
cd packages/museum-app
pnpm dev
# 访问 http://localhost:5173
```

#### 调试构建脚本

```bash
# 查看详细构建日志
pnpm build

# 检查TypeScript类型
pnpm --filter build-tools exec tsc --noEmit
pnpm --filter museum-app exec tsc --noEmit
```

---

### 4. 自定义配置

#### 修改主题颜色

编辑 `packages/museum-app/tailwind.config.ts`：

```typescript
export default {
  theme: {
    extend: {
      colors: {
        'museum-bg': '#FAF9F6',      // 背景色
        'museum-border': '#E8E4DF',  // 边框色
        'museum-gold': '#D4AF37',    // 金色强调
        'museum-brown': '#3E2723',   // 深棕色文字
      }
    }
  }
}
```

#### 修改每页显示数量

编辑 `packages/museum-app/src/App.tsx`：

```typescript
const PAGE_SIZE = 12; // 改为你想要的数量
```

#### 配置自定义域名

1. 访问 https://dash.cloudflare.com/pages
2. 选择你的项目 `ai-museum`
3. 点击 **Custom domains**
4. 点击 **Set up a custom domain**
5. 输入域名并按提示配置DNS

---

### 5. 常见问题

#### 构建失败怎么办？

```bash
# 清理并重新构建
rm -rf dist node_modules packages/*/node_modules
pnpm install
pnpm build
```

#### GitHub Actions失败？

1. 访问 https://github.com/你的用户名/ai-museum/actions
2. 点击失败的workflow查看日志
3. 检查Secrets是否配置正确
4. 确保CLOUDFLARE_API_TOKEN有足够权限

#### 修改demo后未更新？

```bash
# 推送代码会自动重新构建
git add .
git commit -m "更新demo"
git push origin main

# 等待GitHub Actions完成（约1-2分钟）
```

#### 如何删除demo？

```bash
# 删除demo目录
rm -rf demos/要删除的demo

# 提交并推送
git add .
git commit -m "删除demo"
git push origin main
```

---

### 6. 有用的链接

- **GitHub**: https://github.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Cloudflare Pages文档**: https://developers.cloudflare.com/pages
- **Vite文档**: https://vitejs.dev
- **React文档**: https://react.dev
- **TailwindCSS文档**: https://tailwindcss.com

---

## 构建流程

```
扫描demos/ → 提取元数据 → 生成索引 → 构建主应用 → 构建各demo → 输出到dist/
```

## 许可证

MIT
