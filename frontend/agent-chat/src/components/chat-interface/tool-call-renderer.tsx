import * as React from 'react'

import type { ToolCall, ToolRenderer, ToolResult } from '../../types/agent'

interface ToolCallRendererProps {
  tool: ToolCall
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}

export const ToolCallRenderer: React.FC<ToolCallRendererProps> = ({
  tool,
  toolRenderers,
  onToolResult,
}) => {
  const renderer = toolRenderers[tool.function.name]
  if (!renderer) {
    return (
      <div className="rounded-lg border bg-background p-2">
        <p className="text-sm text-muted-foreground">
          Unknown tool: {tool.function.name}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-background p-2">
      {renderer.render(tool, (result) => {
        if (onToolResult) {
          onToolResult(result)
        }
      })}
    </div>
  )
}
