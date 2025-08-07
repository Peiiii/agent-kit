import type { HttpAgent, Message } from "@ag-ui/client";
import type { Tool } from "./agent";

export interface AgentChatProps {
    agent: HttpAgent
    tools?: Tool[]
    contexts?: Array<{ description: string; value: string }>
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
  