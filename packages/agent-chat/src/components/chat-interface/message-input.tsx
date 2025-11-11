import * as React from 'react'

import type { MessageInputProps } from '@/core/types/component-types'
import { EnhancedMessageInput } from './enhanced-message-input'

// Thin wrapper: forward all props to the enhanced input for a rich, usable composer.
export const MessageInput: React.FC<MessageInputProps> = (props) => {
  return <EnhancedMessageInput {...props} />
}
