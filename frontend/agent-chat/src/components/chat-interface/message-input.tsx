import * as React from 'react'

import type { MessageInputProps } from '@/core/types/component-types'
import { EnhancedMessageInput } from './enhanced-message-input'

// A modern, high-UX chat input: multiline with autosize, IME-safe Enter-to-send,
// Shift+Enter for newline, and quick abort while streaming.
export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
  placeholder,
  insideLeftSlot,
  insideRightSlot,
  headerLeftSlot,
  headerRightSlot,
  footerLeftSlot,
  footerRightSlot,
}) => {
  // 使用增强的输入组件
  return (
    <EnhancedMessageInput
      input={input}
      onInputChange={onInputChange}
      onSend={onSend}
      isAgentResponding={isAgentResponding}
      onAbort={onAbort}
      placeholder={placeholder}
      insideLeftSlot={insideLeftSlot}
      insideRightSlot={insideRightSlot}
      headerLeftSlot={headerLeftSlot}
      headerRightSlot={headerRightSlot}
      footerLeftSlot={footerLeftSlot}
      footerRightSlot={footerRightSlot}
      variant="default"
      size="md"
    />
  )
}
