# demos 目录

一旦我所属的目录有所变化，请更新我（文档）。

| 名称 | 类型 | 功能 |
|------|------|------|
| gemini-web-demo/ | web-app | Gemini AI创建的交互式Web应用演示 |
| ai-intro-guide/ | markdown | AI入门指南文档 |
| openai-chat-example/ | code-snippet | OpenAI Chat API示例代码 |

## 添加新Demo

1. 创建子目录：`mkdir my-demo`
2. 复制内容到目录
3. 可选添加`demo.json`配置元数据
4. Git push后自动构建部署

## demo.json示例

```json
{
  "title": "Demo标题",
  "description": "Demo描述",
  "type": "web-app | code-snippet | markdown | chat | research",
  "tags": ["ai", "react"],
  "createdAt": "2026-01-11",
  "author": "作者名",
  "featured": false,
  "techStack": ["React", "TypeScript"]
}
```

## 自动类型推断

如果不提供demo.json，系统会根据文件类型自动推断：

- `vite.config.ts` + `package.json` → web-app
- `.ts/.js/.py/.go`等代码文件 → code-snippet
- `.md`文件 → markdown
