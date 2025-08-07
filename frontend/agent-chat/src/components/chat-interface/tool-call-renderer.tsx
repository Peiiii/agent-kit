import type { ToolInvocation } from '@ai-sdk/ui-utils'
import * as React from 'react'
import type { ToolRenderer, ToolResult } from '../../core/types/agent'
import { toolInvocationToToolCall } from '../../core/utils/tool'

interface ToolCallRendererProps {
  toolInvocation: ToolInvocation
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}

export const ToolCallRenderer: React.FC<ToolCallRendererProps> = ({
  toolInvocation,
  toolRenderers,
  onToolResult,
}) => {
  const renderer = toolRenderers[toolInvocation.toolName]

  if (renderer) {
    return renderer.render(
      toolInvocationToToolCall(toolInvocation),
      (result) => {
        if (onToolResult) {
          onToolResult(result)
        }
      },
    )
  }

  // 如果工具调用已经有结果，展示结果
  if (toolInvocation.state === 'result') {
    return (
      <div className="rounded-lg border bg-background p-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">工具调用结果</span>
          <span className="text-xs text-muted-foreground">{toolInvocation.toolName}</span>
        </div>
        <div className="rounded-md bg-muted p-2">
          <pre className="text-sm">
            {JSON.stringify(toolInvocation.result, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // 工具信息，参数
  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">工具调用</span>
        <span className="text-xs text-muted-foreground">{toolInvocation.toolName}</span>
      </div>
      <div className="rounded-md bg-muted p-2">
        <pre className="text-sm">{JSON.stringify(toolInvocation.args, null, 2)}</pre>
      </div>
    </div>
  )
}
