import {
  AgentChatWindow,
  useAgentChatController,
  useParseTools,
  type AgentChatRef,
} from '@agent-labs/agent-chat'
import { useMemo, useRef } from 'react'
import './App.css'
import { OpenAIBrowserAgent } from './lib/openai-browser-agent'
import { useDemoTools } from './tools'

const DEFAULT_CONTEXTS = [
  {
    description: '当前用户信息',
    value: JSON.stringify({
      name: '张三',
      role: 'developer',
    }),
  },
  {
    description: '系统环境',
    value: JSON.stringify({
      os: 'macOS',
      version: '12.0',
    }),
  },
]

const SYSTEM_PROMPT = 'You are a helpful assistant that runs entirely in the browser. Use the provided context to answer user questions in Chinese when appropriate.'

function MissingApiKeyNotice({ model }: { model: string }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-xl rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          需要配置 OpenAI API Key
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
          请在项目根目录创建 <code>.env</code> 文件，并设置 <code>VITE_OPENAI_API_KEY</code>{' '}
          环境变量。你也可以通过 <code>VITE_OPENAI_MODEL</code> 覆盖默认模型（当前：{model}）。
        </p>
        <div className="mt-4 rounded-md bg-gray-50 dark:bg-gray-900 px-4 py-3 text-xs text-gray-700 dark:text-gray-200 font-mono">
          VITE_OPENAI_API_KEY=sk-xxxx<br />
          VITE_OPENAI_MODEL=gpt-4o-mini
        </div>
      </div>
    </div>
  )
}

function ChatApp({ apiKey, model }: { apiKey: string; model: string }) {
  const contexts = useMemo(() => DEFAULT_CONTEXTS, [])
  const chatRef = useRef<AgentChatRef | null>(null)

  const tools = useDemoTools()
  const { toolDefs, toolExecutors, toolRenderers } = useParseTools(tools)

  const agent = useMemo(
    () =>
      new OpenAIBrowserAgent({
        apiKey,
        model,
        systemPrompt: SYSTEM_PROMPT,
        baseUrl: import.meta.env.VITE_OPENAI_BASE_URL?.toString() || undefined,
      }),
    [apiKey, model],
  )

  const agentChatController = useAgentChatController({
    agent,
    getToolDefs: () => toolDefs,
    getContexts: () => contexts,
    initialMessages: [],
    getToolExecutor: (name: string) => toolExecutors?.[name],
  })

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Chat 示例（纯前端）</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              使用工作区内的 @agent-labs/agent-chat 组件和浏览器版 OpenAI 代理，无需后端。
            </p>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div>
              当前模型：<span className="font-mono">{model}</span>
            </div>
            {import.meta.env.VITE_OPENAI_BASE_URL ? (
              <div>
                API Base URL：
                <span className="font-mono">{import.meta.env.VITE_OPENAI_BASE_URL}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AgentChatWindow
            ref={chatRef}
            agentChatController={agentChatController}
            toolRenderers={toolRenderers}
            className="z-10"
            promptsProps={{
              items: [
                { id: 'hello', prompt: '请用一句话介绍一下你自己。' },
                { id: 'context', prompt: '根据上下文，告诉我当前用户信息。' },
                { id: 'code', prompt: '用 JavaScript 写一个求和函数。' },
              ],
              onItemClick: (item: { id: string; prompt: string }) => {
                chatRef.current?.addMessages(
                  [
                    {
                      id: crypto.randomUUID(),
                      role: 'user',
                      parts: [
                        {
                          type: 'text',
                          text: item.prompt,
                        },
                      ],
                    },
                  ],
                  { triggerAgent: true },
                )
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

function App() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const model = import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini'

  if (!apiKey) {
    return <MissingApiKeyNotice model={model} />
  }

  return <ChatApp apiKey={apiKey} model={model} />
}

export default App
