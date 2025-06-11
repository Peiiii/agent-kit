import { HttpAgent } from '@ag-ui/client'
import { AgentChat, toolRenderers, tools } from '@agent-labs/agent-chat'
import './App.css'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Agent Chat 示例
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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

export default App
