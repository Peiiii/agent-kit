export type OpenAIToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export type OpenAIChatMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string; tool_calls?: OpenAIToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string }

export type ToolDefinitionLike = {
  name: string
  description?: string
  parameters?: unknown
}

export type OpenAIToolDefinition = {
  type: 'function'
  function: { name: string; description?: string; parameters: Record<string, unknown> }
}

export type ContextLike = { description: string; value: string }

export type ToolInvocationLike = {
  toolCallId: string
  toolName: string
  args: string
  status: 'call' | 'partial-call' | 'result' | 'error' | 'cancelled'
  result?: unknown
}

export type UIMessageLike = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'data'
  parts: unknown[]
}
