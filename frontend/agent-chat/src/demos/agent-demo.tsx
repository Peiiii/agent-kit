import * as React from 'react'
import { useMemo } from 'react'

import { HttpAgent } from '@ag-ui/client'
import {
  toolRenderers as availableToolRenderers,
  tools as availableTools,
} from '..'
import { AgentChatWindow } from '../components/agent-chat-window'
import type { ToolDefinition, ToolRenderer } from '../types/agent'

export const demoAgent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})


export function AgentDemo(props: {
  customContext?: Array<{ description: string; value: string }>
  customTools?: ToolDefinition[]
  customToolRenderers?: Record<string, ToolRenderer>
}) {
  const { customContext = [], customTools, customToolRenderers } = props
  const defaultContext = useMemo(() => {
    return [
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
  }, [])

  const staticContext = useMemo(() => {
    return [...defaultContext, ...customContext]
  }, [defaultContext, customContext])

  const toolRenderers = useMemo(() => {
    return { ...availableToolRenderers, ...(customToolRenderers || {}) }
  }, [customToolRenderers])

  const tools = useMemo(() => {
    return [...availableTools, ...(customTools || [])]
  }, [customTools])

  return (
    <div className="min-h-full w-full flex items-center justify-center">
      <AgentChatWindow
        agent={demoAgent}
        toolRenderers={toolRenderers}
        tools={tools}
        contexts={staticContext}
      />
    </div>
  )
}
