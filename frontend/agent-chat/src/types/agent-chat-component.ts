import type { ToolDefinition, ToolRenderer } from "@/types/agent";
import type { HttpAgent, Message } from "@ag-ui/client";

export interface AgentChatProps {
    agent: HttpAgent
    toolRenderers?: Record<string, ToolRenderer>
    tools?: ToolDefinition[]
    contexts?: Array<{ description: string; value: string }>
    initialMessages?: Message[]
    className?: string
  }
  
  export interface AgentChatRef {
    reset: () => void
  }
  