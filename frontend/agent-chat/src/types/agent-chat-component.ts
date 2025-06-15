import type { ToolDefinition, ToolRenderer } from "@/types/agent";
import type { HttpAgent } from "@ag-ui/client";

export interface AgentChatProps {
    agent: HttpAgent
    toolRenderers?: Record<string, ToolRenderer>
    tools?: ToolDefinition[]
    staticContext?: Array<{ description: string; value: string }>
    className?: string
  }
  
  export interface AgentChatRef {
    reset: () => void
  }
  