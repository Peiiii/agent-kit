import * as React from 'react'
import type { ToolRenderer, ToolResult } from '../../core/types/agent'
import type { ToolInvocation } from '../../core/types/ui-message'

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
      toolInvocation,
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
          <pre className="text-sm whitespace-pre-wrap break-words" style={{ maxHeight: '12rem', overflowY: 'auto' }}>
            {JSON.stringify(toolInvocation.result, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // 工具信息，参数（包含流式参数和执行中状态）
  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          工具调用
          {toolInvocation.state === 'partial-call' && (
            <span className="ml-2 text-xs text-muted-foreground">准备参数中…</span>
          )}
          {toolInvocation.state === 'call' && (
            <span className="ml-2 text-xs text-muted-foreground">执行中…</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{toolInvocation.toolName}</span>
      </div>
        <div className="rounded-md bg-muted p-2">
          <pre className="text-sm whitespace-pre-wrap break-words" style={{ maxHeight: '12rem', overflowY: 'auto' }}>
            {typeof toolInvocation.args === 'string'
              ? toolInvocation.args
              : JSON.stringify(toolInvocation.args, null, 2)}
          </pre>
        </div>
    </div>
  )
}
