import { HttpAgent } from '@ag-ui/client'
import { AgentChat, toolRenderers, tools } from '@agent-labs/agent-chat'
import { ThemeSwitcher } from 'composite-kit'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          Agent Chat 示例
        </h1>
        <div>
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
            <ThemeSwitcher.Grid />
          </ThemeSwitcher>
        </div>
        <div className="bg-card rounded-lg shadow-lg">
          <AgentChat
            agent={agent}
            tools={tools}
            toolRenderers={toolRenderers}
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
  )
}
