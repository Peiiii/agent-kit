import { Send, Square } from 'lucide-react'
import * as React from 'react'

import type { MessageInputProps } from '@/core/types/agent-chat-component'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isAgentResponding) {
        onSend()
      }
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={false}
        className="flex-1"
      />
      {!isAgentResponding ? (
        <Button
          variant="default"
          size="icon"
          onClick={onSend}
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="icon"
          onClick={onAbort}
          title="终止AI响应"
        >
          <Square className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
