import { HttpAgent } from '@ag-ui/client'
import { AgentChat } from '@agent-labs/agent-chat'
import { ThemeSwitcher } from 'composite-kit'
import { TodoProvider } from './features/todo/hooks/use-todo'
import { todoTools } from './features/todo/tools'
import { todoToolRenderers } from './features/todo/tool-renderers'
import { TodoList } from './features/todo/components/todo-list'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

export function App() {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              Todo App with AI Assistant
            </h1>
            <ThemeSwitcher
              themes={[
                'light',
                'dark',
                'material',
                'nord',
                'dracula',
                'one-dark',
                'tokyo-night',
                'catppuccin',
                'wechat',
                'telegram',
                'github',
                'twitter',
                'discord',
                'notion',
                'monokai-pro',
                'gruvbox',
                'solarized',
                'aurora',
                'forest',
                'ocean',
                'starlight',
                'desert',
                'neon',
                'ink-wash',
                'sakura',
                'moonlight',
                'bamboo',
                'landscape',
                'autumn',
              ]}
            >
              <ThemeSwitcher.Dropdown />
            </ThemeSwitcher>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Todo List Section */}
            <div className="bg-card rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                待办事项列表
              </h2>
              <TodoList />
            </div>

            {/* AI Assistant Section */}
            <div className="bg-card rounded-lg shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-foreground">
                  AI 助手
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  你可以通过自然语言与 AI 助手交互，让它帮你管理待办事项
                </p>
              </div>
              <AgentChat
                agent={agent}
                tools={todoTools}
                toolRenderers={todoToolRenderers}
                staticContext={[
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
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}
