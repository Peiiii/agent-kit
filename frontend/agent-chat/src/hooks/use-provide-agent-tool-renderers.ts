import { createContext, useContext, useEffect } from 'react'
import { AgentResourceManager } from '../services/agent-resource-manager'
import type { ToolRenderer } from '../types'

export class AgentToolRendererManager extends AgentResourceManager<ToolRenderer> {
  addToolRenderers(toolRenderers: ToolRenderer[]): () => void {
    return this.addResources(toolRenderers)
  }

  getToolRenderers(): ToolRenderer[] {
    return this.getResources()
  }

  clear(): void {
    return this.clear()
  }
}

export const AgentToolRendererManagerContext =
  createContext<AgentToolRendererManager>(new AgentToolRendererManager())

export function useProvideAgentToolRenderers(
  toolRenderers: ToolRenderer[],
): void {
  const manager = useContext(AgentToolRendererManagerContext)

  useEffect(() => {
    const removeToolRenderers = manager.addToolRenderers(toolRenderers)
    return () => {
      removeToolRenderers()
    }
  }, [manager, toolRenderers])
}
