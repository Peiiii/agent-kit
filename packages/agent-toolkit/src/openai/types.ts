import type OpenAI from 'openai'

export type OpenAIToolCall = OpenAI.Chat.ChatCompletionMessageToolCall
export type OpenAIChatMessage = OpenAI.Chat.ChatCompletionMessageParam
export type OpenAIToolDefinition = OpenAI.Chat.ChatCompletionTool

export type ToolDefinitionLike = {
  name: string
  description?: string
  parameters?: unknown
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
