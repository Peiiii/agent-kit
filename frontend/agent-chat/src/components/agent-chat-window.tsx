import { HttpAgent } from '@ag-ui/client'
import { MessageSquare, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useRef, useState } from 'react'
import type {
  AgentChatProps,
  AgentChatRef,
} from '../types/agent-chat-component'

import clsx from 'clsx'
import { AgentChatCore } from './agent-chat-core'
import { Button } from './ui/button'
import { Window } from './window'

export const globalAgent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

export const AgentChatWindow = ({
  agent,
  toolRenderers: renderers,
  tools: toolsList,
  staticContext = [],
  className,
}: AgentChatProps) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isHeightMaximized, setIsHeightMaximized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const chatCoreRef = useRef<AgentChatRef>(null)
  const handleClose = () => {
    setIsVisible(false)
  }

  const handleReopen = () => {
    setIsVisible(true)
  }

  const handleHeightMaximize = () => {
    setIsHeightMaximized(!isHeightMaximized)
    if (isMaximized) {
      setIsMaximized(false)
    }
  }

  const handleClear = () => {
    chatCoreRef.current?.reset()
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
      isMaximized={isMaximized}
      isHeightMaximized={isHeightMaximized}
      onMaximize={() => {
        setIsMaximized(!isMaximized)
        if (isHeightMaximized) {
          setIsHeightMaximized(false)
        }
      }}
      onHeightMaximize={handleHeightMaximize}
      onClose={handleClose}
      actions={[
        <Button key="clear" variant="ghost" size="icon" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
        </Button>,
      ]}
    >
      <AgentChatCore
        ref={chatCoreRef}
        agent={agent}
        toolRenderers={renderers}
        tools={toolsList}
        staticContext={staticContext}
        className={clsx('h-full', className)}
      />
    </Window>
  )
}
