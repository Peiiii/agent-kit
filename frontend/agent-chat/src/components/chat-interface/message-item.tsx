import { Bot, User } from 'lucide-react'
import * as React from 'react'

import clsx from 'clsx'
import { MarkdownRenderer } from '../markdown-renderer'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { CopyButton } from '../ui/copy-button'
import { AIGeneratingIndicator } from './ai-generating-indicator'
import { ToolCallRenderer } from './tool-call-renderer'
import type { MessageItemProps } from '../../core/types/component-types'
import { extractTextFromMessage, hasCopyableText } from '../../core/utils/message-utils'

export const MessageItem: React.FC<MessageItemProps> = ({
  uiMessage,
  toolRenderers,
  onToolResult,
  className,
  showAvatar = true,
  isPending = false
}) => {
  const isUser = uiMessage.role === 'user'
  const [showCopyButton, setShowCopyButton] = React.useState(false)
  const canCopy = !isUser && !isPending && hasCopyableText(uiMessage)
  const messageText = extractTextFromMessage(uiMessage)

  return (
    <div
      className={clsx(
        `flex w-full p-2 min-w-0`,
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
      style={{ overflowX: 'hidden', maxWidth: '100%' }}
    >
      <div
        className={clsx(
          'flex flex-col gap-2 min-w-0',
          isUser ? 'items-end w-auto' : 'items-start w-auto',
        )}
        style={{ maxWidth: '100%', overflowX: 'hidden' }}
      >
        {showAvatar && (
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="" alt={isUser ? 'User' : 'Assistant'} />
            <AvatarFallback
              className={`${
                isUser ? 'bg-primary' : 'bg-primary'
              } text-primary-foreground`}
            >
              {isUser ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`relative min-w-0 overflow-hidden rounded-lg px-3 py-4 ${
            isUser
              ? 'bg-primary text-primary-foreground w-auto'
              : 'bg-muted text-foreground w-auto'
          }`}
          style={{ overflowX: 'hidden', maxWidth: '100%' }}
          onMouseEnter={() => canCopy && setShowCopyButton(true)}
          onMouseLeave={() => setShowCopyButton(false)}
        >
          {/* 复制按钮 - 只在AI消息且悬停时显示 */}
          {canCopy && showCopyButton && (
            <div className="absolute top-2 right-2 z-10">
              <CopyButton
                text={messageText}
                size="sm"
                variant="ghost"
                className="opacity-70 hover:opacity-100 bg-background/80 backdrop-blur-sm"
              />
            </div>
          )}
          
          <div className="[&>*:last-child]:mb-0">
            {isPending ? (
              <AIGeneratingIndicator />
            ) : (
              uiMessage.parts.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <div key={index} className="break-words min-w-0" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
                      <MarkdownRenderer content={part.text} />
                    </div>
                  )
                }
                if (part.type === 'tool-invocation') {
                  return (
                    <div key={index} className="mt-1">
                      <ToolCallRenderer
                        toolInvocation={part.toolInvocation}
                        toolRenderers={toolRenderers}
                        onToolResult={onToolResult}
                      />
                    </div>
                  )
                }
                return null
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
