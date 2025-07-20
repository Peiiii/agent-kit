import * as React from 'react'
import { HttpAgent } from '@ag-ui/client'
import { AgentChatWindow } from '../components/agent-chat-window'
import type { ToolDefinition, ToolRenderer, ToolCall, ToolResult } from '../types/agent'
import type { ToolExecutor } from '../hooks/use-provide-agent-tool-executors'
// 不再导入默认工具，用户需要自己提供

export function AdvancedDemo() {
  const customTools: ToolDefinition[] = [
    {
      name: 'customTool',
      description: '这是一个自定义工具',
      parameters: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: '参数1',
          },
        },
        required: ['param1'],
      },
    },
  ]

  const customToolRenderers: Record<string, ToolRenderer> = {
    customTool: {
      render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">自定义工具</h3>
            <p>参数值: {args.param1}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                onResult({
                  toolCallId: toolCall.id,
                  result: {
                    message: `处理了参数: ${args.param1}`,
                  },
                  status: 'success',
                })
              }}
            >
              执行
            </button>
          </div>
        )
      },
      definition: customTools[0],
    },
  }

  // 添加自定义工具执行器
  const customToolExecutors: Record<string, ToolExecutor> = {
    customTool: async (toolCall: ToolCall) => {
      const args = JSON.parse(toolCall.function.arguments)
      // 模拟异步处理
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        toolCallId: toolCall.id,
        result: {
          message: `自动处理了参数: ${args.param1}`,
          timestamp: new Date().toISOString(),
        },
        status: 'success',
      }
    },
  }

  const customContext = [
    {
      description: '高级上下文',
      value: JSON.stringify({
        environment: 'production',
        features: ['custom-tools', 'advanced-ui', 'default-executors'],
      }),
    },
  ]

  return (
    <AgentChatWindow
      agent={new HttpAgent({
        url: 'http://localhost:8000/openai-agent',
      })}
      defaultToolRenderers={customToolRenderers}
      defaultToolDefs={customTools}
      defaultToolExecutors={customToolExecutors}
      defaultContexts={customContext}
    />
  )
} 