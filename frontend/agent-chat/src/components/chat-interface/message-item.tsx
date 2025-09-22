import { Bot, User } from 'lucide-react'
import * as React from 'react'

import clsx from 'clsx'
import { MarkdownRenderer } from '../markdown-renderer'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ToolCallRenderer } from './tool-call-renderer'
import type { MessageItemProps } from '../../core/types/component-types'

export const MessageItem: React.FC<MessageItemProps> = ({
  uiMessage,
  toolRenderers,
  onToolResult,
  className,
  showAvatar = true,
}) => {
  const isUser = uiMessage.role === 'user'

  return (
    <div
      className={clsx(
        `flex w-full p-2`,
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      <div
        className={clsx(
          'flex flex-col gap-2',
          isUser ? 'items-end w-auto max-w-[80%]' : 'items-start w-full',
        )}
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
          className={`min-w-0 overflow-hidden rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground w-auto'
              : 'bg-muted text-foreground w-full'
          }`}
        >
          {uiMessage.parts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <div key={index} className="break-words">
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
          })}
        </div>
      </div>
    </div>
  )
}
