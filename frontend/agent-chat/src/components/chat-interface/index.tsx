import * as React from 'react'

import { MessageInput } from './message-input'
import { MessageItem } from './message-item'
import { useChatAutoScroll } from '../../core/hooks/use-chat-auto-scroll'
import clsx from 'clsx'
import type { ChatInterfaceProps } from '@/core/types/component-types'
import { Prompts } from './prompts'

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  uiMessages,
  toolRenderers,
  onToolResult,
  input,
  senderProps,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
  promptsProps,
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

  console.log('[ChatInterface] uiMessages', {uiMessages})

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
      {promptsProps && uiMessages.length === 0 && (
        <div className="border-t p-4">
          <Prompts promptsProps={promptsProps} />
        </div>
      )}
      <div className="border-t p-4">
        <MessageInput
          input={input}
          {...senderProps}
          onInputChange={onInputChange}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={onAbort}
        />
      </div>
    </div>
  )
}
