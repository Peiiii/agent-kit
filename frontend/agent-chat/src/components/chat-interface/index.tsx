import type { Message } from '@ag-ui/client'
import * as React from 'react'

import type { ToolRenderer, ToolResult } from '../../types'
import { MessageInput } from './message-input'
import { MessageItem } from './message-item'

export interface ChatInterfaceProps {
  messages: Message[]
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  isLoading: boolean
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  toolRenderers,
  onToolResult,
  input,
  onInputChange,
  onSend,
  isLoading,
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            toolRenderers={toolRenderers}
            onToolResult={onToolResult}
          />
        ))}
      </div>
      <div className="border-t p-4">
        <MessageInput
          input={input}
          onInputChange={onInputChange}
          onSend={onSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
