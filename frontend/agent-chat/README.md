# @agent-labs/agent-chat

[![npm version](https://img.shields.io/npm/v/@agent-labs/agent-chat.svg)](https://www.npmjs.com/package/@agent-labs/agent-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于构建 AI 智能体聊天界面的 React 组件库。提供美观、可定制的聊天界面，支持多种工具渲染和上下文管理。

## 特性

- 🎨 美观的 UI 设计，支持亮色/暗色主题
- 🛠️ 内置多种工具渲染器
- 📝 支持 Markdown 渲染
- 🔄 实时消息流
- 🎯 类型安全，完整的 TypeScript 支持
- 🎭 高度可定制

## 安装

```bash
# 使用 npm
npm install @agent-labs/agent-chat

# 使用 yarn
yarn add @agent-labs/agent-chat

# 使用 pnpm
pnpm add @agent-labs/agent-chat
```

## 快速开始

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat, toolRenderers, tools } from '@agent-labs/agent-chat'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

function App() {
  return (
    <AgentChat
      agent={agent}
      tools={tools}
      toolRenderers={toolRenderers}
      staticContext={[
        {
          description: '用户信息',
          value: JSON.stringify({
            name: '张三',
            role: 'developer',
          }),
        },
      ]}
    />
  )
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm playground

# 运行测试
pnpm test

# 构建库
pnpm build
```

## 贡献

我们欢迎所有形式的贡献，无论是新功能、bug 修复还是文档改进。请查看我们的[贡献指南](./CONTRIBUTING.md)了解更多信息。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。
