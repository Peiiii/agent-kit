import { Send, Square } from 'lucide-react'
import * as React from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
}

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
        placeholder="输入消息或拍一拍唤醒 AI..."
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
