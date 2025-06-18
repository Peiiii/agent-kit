import * as React from 'react'
import type { ToolRenderer, ToolResult } from '../../types/agent'

import { MessageInput } from './message-input'
import { MessageItem } from './message-item'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { useChatAutoScroll } from '../../hooks/use-chat-auto-scroll'
import clsx from 'clsx'

export interface ChatInterfaceProps {
  uiMessages: UIMessage[]
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  uiMessages,
  toolRenderers,
  onToolResult,
  input,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
}) => {
  const { containerRef, isSticky, scrollToBottom, setSticky } = useChatAutoScroll({
    deps: [uiMessages],
  })

  // 包装 onSend，发送后自动滚动到底部并 sticky
  const handleSend = React.useCallback(() => {
    onSend()
    setTimeout(() => {
      setSticky(true)
      scrollToBottom()
    }, 0)
  }, [onSend, setSticky, scrollToBottom])

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        className={
          clsx(
            'flex-1 overflow-y-auto px-4 py-2',
            isSticky ? ' sticky-bottom' : '',
          )
        }
      >
        {uiMessages.map((uiMessage, index) => (
          <MessageItem
            key={index}
            uiMessage={uiMessage}
            toolRenderers={toolRenderers}
            onToolResult={onToolResult}
          />
        ))}
      </div>
      <div className="border-t p-4">
        <MessageInput
          input={input}
          onInputChange={onInputChange}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={onAbort}
        />
      </div>
    </div>
  )
}
