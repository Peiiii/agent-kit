import { createContext } from "react"
import type { AgentSessionManager } from "../core/services"

export const AgentSessionManagerContext = createContext<AgentSessionManager | null>(null)

