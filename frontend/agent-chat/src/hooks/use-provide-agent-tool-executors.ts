import { createContext, useContext, useEffect } from 'react'
import type { ToolCall, ToolResult } from '../types/agent'

// ToolExecutor: (toolCall, context) => ToolResult | Promise<ToolResult>
export type ToolExecutor = (
  toolCall: ToolCall,
  context?: Record<string, unknown>
) => ToolResult | Promise<ToolResult>

export class AgentToolExecutorManager {
  private executors: Record<string, ToolExecutor> = {}

  addToolExecutors(toolExecutors: Record<string, ToolExecutor>): () => void {
    Object.assign(this.executors, toolExecutors)
    // 返回移除函数
    return () => {
      for (const key of Object.keys(toolExecutors)) {
        delete this.executors[key]
      }
    }
  }

  getToolExecutor(name: string): ToolExecutor | undefined {
    return this.executors[name]
  }

  getAllExecutors(): Record<string, ToolExecutor> {
    return { ...this.executors }
  }

  clear(): void {
    this.executors = {}
  }
}

export const AgentToolExecutorManagerContext = createContext<AgentToolExecutorManager>(
  new AgentToolExecutorManager(),
)

export function useProvideAgentToolExecutors(
  toolExecutors: Record<string, ToolExecutor>,
): void {
  const manager = useContext(AgentToolExecutorManagerContext)

  useEffect(() => {
    const removeExecutors = manager.addToolExecutors(toolExecutors)
    return () => {
      removeExecutors()
    }
  }, [manager, toolExecutors])
} 