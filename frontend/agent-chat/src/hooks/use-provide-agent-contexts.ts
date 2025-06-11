import { createContext, useContext, useEffect } from 'react'
import { AgentResourceManager } from '../services/agent-resource-manager'
import type { Context } from '../types'

export class AgentContextManager extends AgentResourceManager<Context> {
  addContexts(contexts: Context[]): () => void {
    return this.addResources(contexts)
  }

  getContexts(): Context[] {
    return this.getResources()
  }

  clear(): void {
    return this.clear()
  }
}

export const AgentContextManagerContext = createContext<AgentContextManager>(
  new AgentContextManager(),
)

export function useProvideAgentContexts(contexts: Context[]): void {
  const manager = useContext(AgentContextManagerContext)

  useEffect(() => {
    const removeContext = manager.addContexts(contexts)
    return () => {
      removeContext()
    }
  }, [manager, contexts])
}
