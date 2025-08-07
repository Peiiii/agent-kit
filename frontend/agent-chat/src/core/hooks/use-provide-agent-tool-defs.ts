import { createContext, useContext, useEffect } from 'react'
import { AgentResourceManager } from '../services/agent-resource-manager'
import type { ToolDefinition } from '../types/agent'

export class AgentToolDefManager extends AgentResourceManager<ToolDefinition> {
  addToolDefs(toolDefs: ToolDefinition[]): () => void {
    return this.addResources(toolDefs)
  }

  getToolDefs(): ToolDefinition[] {
    return this.getResources()
  }

  clear(): void {
    return this.clear()
  }
}

export const AgentToolDefManagerContext = createContext<AgentToolDefManager>(
  new AgentToolDefManager(),
)

export function useProvideAgentToolDefs(toolDefs: ToolDefinition[]): void {
  const manager = useContext(AgentToolDefManagerContext)

  useEffect(() => {
    const removeToolDefs = manager.addToolDefs(toolDefs)
    return () => {
      removeToolDefs()
    }
  }, [manager, toolDefs])
}
