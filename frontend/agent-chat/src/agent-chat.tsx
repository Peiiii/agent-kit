import { HttpAgent } from '@ag-ui/client'
import { MessageSquare, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { ChatInterface } from './components/chat-interface'

import { Button } from './components/ui/button'
import { Window } from './components/window'
import { useAgentChat } from './hooks/use-agent-chat'
import type { ToolDefinition, ToolRenderer } from './types'
import './styles/globals.css'

export const globalAgent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

interface AgentChatProps {
  agent: HttpAgent
  toolRenderers: Record<string, ToolRenderer>
  tools: ToolDefinition[]
  staticContext?: Array<{ description: string; value: string }>
}

export function AgentChat({
  agent,
  toolRenderers: renderers,
  tools: toolsList,
  staticContext = [],
}: AgentChatProps) {
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const { messages, isLoading, sendMessage, sendToolResult, reset } =
    useAgentChat({
      agent,
      tools: toolsList,
      staticContext,
    })

  const handleSend = async () => {
    await sendMessage(input)
    setInput('')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleClear = () => {
    reset()
  }

  const handleReopen = () => {
    setIsVisible(true)
  }

  if (!isVisible) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={handleReopen}
        className="fixed bottom-5 right-5 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Window
      title="AI Assistant"
      isMinimized={isMinimized}
      onMinimize={() => setIsMinimized(!isMinimized)}
      onClose={handleClose}
      actions={
        messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            title="清空消息"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      }
    >
      <ChatInterface
        messages={messages}
        toolRenderers={renderers}
        onToolResult={sendToolResult}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </Window>
  )
}
