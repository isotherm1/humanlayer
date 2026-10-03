# HumanLayer

AI can create. Humans still need to understand.

HumanLayer 帮助人阅读 AI 辅助创作的代码与论文：从可观察的结构和原文证据理解作品，再审阅更易维护的建议版本。它不是 AI 检测器，不声称恢复模型的私有思维过程。

## 当前版本：0.2.1

- 中文阅读工作台，浅色与深色主题。
- 真正读取粘贴文本、源码、ZIP 与可提取文字的 PDF。最多 20 个文件、合计 48,000 字符；超出范围明确拒绝，不静默截断。扫描 PDF 暂不支持 OCR。
- 无需密钥的本地规则检查：Babel 解析 JS / TS / JSX / TSX，检测显式 any、空 catch、eval 等；其他语言只做文本检查。Prettier 提供排版版本与逐行对照。
- 服务端模型接口 `/api/analyze` 与 `/api/ask`：调用 OpenAI Responses，返回意图推断、问题证据和完整建议版本。证据必须逐字匹配原文，否则拒绝报告。
- **当前私密部署未配置模型密钥，AI 深度分析和问答未启用，尚未验证真实模型调用。** 自动化接口测试使用明确标注的模拟上游响应。
- 不运行上传代码，不自动覆盖文件，不声称项目测试已执行或重构语义等价。没有数据库，不持久保存材料。

## 技术栈

单个 Next.js + TypeScript 仓库；Tailwind CSS、Radix / shadcn 风格组件、Lucide、Motion、React Flow。生产构建将 Next.js 静态导出与同仓库的最小 Worker 模型接口一起部署到 Sites，不需要独立后端服务。

## 本地运行

```sh
npm ci
npm run dev
```

打开 http://localhost:4173 。Next.js 开发预览提供浏览器本地检查；生产 Worker 的模型接口需按下面说明配置，不在纯 Next 静态开发预览中运行。

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`out/` 为静态导出，`dist/server/index.js` 为部署 Worker 入口。`scripts/build-worker.mjs` 将压缩静态资源嵌入部署包，保持同源访问。

## 模型配置与数据边界

由维护者通过托管平台的服务端密钥流程设置 `OPENAI_API_KEY`，可选设置 `OPENAI_MODEL`（默认 `gpt-4.1-mini`）。不要提交密钥到 Git，也不要放进 `NEXT_PUBLIC_*` 或客户端。模型请求需要用户确认后发送当前材料，使用 `store: false`；这不等于承诺供应商零保留，具体处理遵循模型供应商政策。

本地规则结果不是大模型分析。AI 的意图推断是基于可见证据的解释，置信度是模型主观评估，并非经校准的概率。所有重构均需人工审查和项目级测试。

部署访问权限保持所有者私密；公开源码不等于公开网站。旧产品壳组件暂留作历史示例，当前入口不使用固定模拟报告。

## 0.2.1 部署修复

修复 gzip 字节直接进入响应导致的乱码：压缩仅用于包内存储，返回浏览器前解压。静态资源改用版本路径避免复用错误缓存。新增 Worker 响应回归测试，验证中文 HTML、JS、二进制资源、HEAD 和路径边界；这与模型功能启用无关。
