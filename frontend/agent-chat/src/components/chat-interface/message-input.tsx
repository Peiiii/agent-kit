import { Send, Zap } from 'lucide-react'
import * as React from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  onPoke?: () => void
  isLoading: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  onPoke,
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

  const handlePoke = () => {
    onPoke?.()
  }

  // 如果有输入内容，显示发送按钮；否则显示拍一拍按钮
  const showPokeButton = !input.trim() && !isLoading && onPoke

  return (
    <div className="flex w-full items-center gap-2">
      <Input
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="输入消息或拍一拍唤醒 AI..."
        disabled={isLoading}
        className="flex-1"
      />
      {showPokeButton ? (
        <Button
          variant="outline"
          size="icon"
          onClick={handlePoke}
          disabled={isLoading}
          className="relative group"
          title="拍一拍唤醒 AI"
        >
          <Zap className="h-4 w-4 group-hover:animate-pulse" />
        </Button>
      ) : (
        <Button
          variant="default"
          size="icon"
          onClick={onSend}
          disabled={isLoading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
