import type { JSONSchema7 } from 'json-schema'
import type { ReactNode } from 'react'

export interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  toolCallId: string
  result: string | boolean | number | object
  status: 'success' | 'error' | 'cancelled'
  error?: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: JSONSchema7
}

export interface ToolRenderer {
  render: (tool: ToolCall, onResult: (result: ToolResult) => void) => ReactNode
  definition: ToolDefinition
}

export interface Tool extends ToolDefinition {
  execute?: (toolCall: ToolCall) => Promise<ToolResult>
  render?: (tool: ToolCall, onResult: (result: ToolResult) => void) => ReactNode
}

export interface Context {
  description: string
  value: string
}
