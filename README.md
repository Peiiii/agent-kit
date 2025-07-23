# agent-kit

> A monorepo for building AI agent applications: React chat UI, OpenAI agent server, and developer tools.
> 
> 用于构建 AI 智能体应用的 monorepo，包含 React 聊天 UI、OpenAI 智能体服务端与开发工具。

---

## 项目简介 | Introduction

**agent-kit** 是一个面向 AI 智能体开发的全栈工具集，采用 monorepo 管理，集成了前端聊天组件库、后端智能体服务、以及开发者工具和示例。适用于构建现代化、可扩展的 AI 应用。

## 主要特性 | Features

- 🧩 多包一体，前后端全栈支持
- 💬 美观易用的 React 聊天 UI 组件
- 🤖 开箱即用的 OpenAI 智能体服务端
- 🛠️ 组件开发脚手架与丰富示例
- ⚡ TypeScript 全面类型安全
- 📦 易于扩展和二次开发

## 目录结构 | Directory Structure

```
agent-kit/
├── frontend/
│   ├── agent-chat/         # 智能体聊天 UI 组件库
│   └── my-package/         # 组件开发脚手架
├── packages/
│   └── agent-server/       # OpenAI 智能体服务端
├── examples/
│   └── agentic-app-demo/   # 示例应用
├── package.json            # 主项目配置
└── README.md               # 项目说明
```

## 快速开始 | Quick Start

### 1. 安装依赖 Install dependencies

```bash
pnpm install
```

### 2. 启动前端开发环境 Start frontend dev server

```bash
pnpm --filter @agent-labs/agent-chat playground
```

### 3. 启动后端服务 Start backend server

```bash
pnpm --filter @agent-labs/agent-server dev
```

### 4. 运行示例应用 Run demo app

```bash
pnpm --filter agentic-app-demo dev
```

## 子包说明 | Packages

- **frontend/agent-chat**：React 智能体聊天组件库，支持多工具渲染、上下文管理、主题切换等。

  **文档与教程**
  - [使用教程（中文）](./frontend/agent-chat/docs/agent-chat-tutorial.md)：详细介绍了安装、集成、进阶用法和常见问题，适合开发者快速上手和深入定制。

  **快速开始示例**
  ```tsx
  import { HttpAgent } from '@ag-ui/client'
  import { AgentChatWindow } from '@agent-labs/agent-chat'

  const agent = new HttpAgent({ url: 'http://localhost:8000/openai-agent' })

  function App() {
    return <AgentChatWindow agent={agent} />
  }
  ```
  更多高级用法请见 [agent-chat-tutorial.md](./frontend/agent-chat/docs/agent-chat-tutorial.md)。

- **packages/agent-server**：Node.js + Express 的 OpenAI 智能体服务端，支持 API 调用与环境配置。
- **frontend/my-package**：React 组件开发脚手架，便于扩展 UI 能力。
- **examples/agentic-app-demo**：最小化示例，演示如何集成和使用本工具集。

## 贡献指南 | Contributing

欢迎任何形式的贡献，包括新功能、Bug 修复、文档完善等。请先阅读各子包下的 CONTRIBUTING.md，并遵循 Conventional Commits 规范提交。

## 许可证 | License

MIT 