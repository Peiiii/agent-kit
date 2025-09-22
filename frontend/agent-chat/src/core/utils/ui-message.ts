import type { ToolCall } from '../types/agent'
import type {
  ToolInvocation
} from '../types/ui-message'


export const toolCallToToolInvocation = (toolCall: ToolCall): ToolInvocation => {
  return {
    toolCallId: toolCall.id,
    toolName: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
    state: "call",
  }
}



