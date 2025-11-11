import { createContext } from "react"
import type { AgentChatController } from "../core/services"

export const AgentSessionManagerContext = createContext<AgentChatController | null>(null)

