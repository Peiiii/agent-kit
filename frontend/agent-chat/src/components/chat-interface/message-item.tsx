import { Bot, User } from 'lucide-react'
import * as React from 'react'
import { useContext, useMemo } from 'react'
import { AgentToolRendererManagerContext } from '../../core/hooks/use-provide-agent-tool-renderers'

import type { UIMessage } from '@ai-sdk/ui-utils'
import clsx from 'clsx'
import type { ToolRenderer, ToolResult } from '../../core/types/agent'
import { MarkdownRenderer } from '../markdown-renderer'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ToolCallRenderer } from './tool-call-renderer'

interface MessageItemProps {
  uiMessage: UIMessage
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}

export const MessageItem: React.FC<MessageItemProps> = ({
  uiMessage,
  toolRenderers,
  onToolResult,
}) => {
  const isUser = uiMessage.role === 'user'

  const toolRendererManager = useContext(AgentToolRendererManagerContext)
  const allToolRenderers = useMemo(() => {
    return {
      ...Object.fromEntries(
        toolRendererManager
          .getToolRenderers()
          .map((renderer) => [renderer.definition.name, renderer]),
      ),
      ...toolRenderers,
    }
  }, [toolRenderers, toolRendererManager])

  return (
    <div
      className={clsx(
        `flex w-full  p-2`,
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={clsx(
          'flex max-w-[80%] w-fit items-start gap-2',
          isUser ? 'flex-row-reverse' : 'flex-row',
        )}
      >
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
        <div
          className={`min-w-0 flex-1 max-w-full overflow-hidden rounded-lg p-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
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
                    toolRenderers={allToolRenderers}
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
