import { Send } from 'lucide-react'
import * as React from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  isLoading: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  isLoading,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        variant="default"
        size="icon"
        onClick={onSend}
        disabled={isLoading}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
