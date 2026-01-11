# .github/workflows 目录

一旦我所属的目录有所变化，请更新我（文档）。

| 文件 | 地位 | 功能 |
|------|------|------|
| deploy.yml | CI/CD配置 | Git push到main分支后自动构建并部署到Cloudflare Pages |

## 配置说明

需要在GitHub仓库的Settings → Secrets中添加以下secrets：

1. `CLOUDFLARE_API_TOKEN` - Cloudflare API Token（需要Pages权限）
2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare账户ID

### 获取Cloudflare配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 账户ID在右侧边栏可见
3. API Token: 进入 My Profile → API Tokens → Create Token → 使用 "Edit Cloudflare Workers" 模板
