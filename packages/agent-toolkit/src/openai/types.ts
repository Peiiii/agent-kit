import type OpenAI from 'openai'

// OpenAI SDK type aliases
export type OpenAIToolCall = OpenAI.Chat.ChatCompletionMessageToolCall
export type OpenAIChatMessage = OpenAI.Chat.ChatCompletionMessageParam
export type OpenAIToolDefinition = OpenAI.Chat.ChatCompletionTool

// Toolkit abstraction types
export type ToolDefinitionLike = {
  name: string
  description?: string
  parameters?: unknown
}

export type ContextLike = {
  description: string
  value: string
}

export type ToolInvocationStatus = 'call' | 'partial-call' | 'result' | 'error' | 'cancelled'

export type ToolInvocationLike = {
  toolCallId: string
  toolName: string
  args: string
  status: ToolInvocationStatus
  result?: unknown
}

export type UIMessageRole = 'system' | 'user' | 'assistant' | 'data'

export type UIMessageLike = {
  id: string
  role: UIMessageRole
  parts: unknown[]
}
