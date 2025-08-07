import type { ToolDefinition, ToolRenderer } from "@/core/types/agent";
import type { HttpAgent, Message } from "@ag-ui/client";
import type { ToolExecutor } from "../hooks/use-provide-agent-tool-executors";

export interface AgentChatProps {
    agent: HttpAgent
    defaultToolRenderers?: Record<string, ToolRenderer>
    defaultToolDefs?: ToolDefinition[]
    defaultToolExecutors?: Record<string, ToolExecutor>
    defaultContexts?: Array<{ description: string; value: string }>
    initialMessages?: Message[]
    className?: string
  }
  
  export interface AgentChatRef {
    reset: () => void
    addMessages: (
      messages: Message[],
      options?: { triggerAgent?: boolean },
    ) => Promise<void>
  }
  