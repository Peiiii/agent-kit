import React, { useCallback, useState } from 'react'
import type { UIMessage } from '../types/ui-message'
import { extractTextFromMessage, hasCopyableText } from '../utils/message-utils'
import type { MessageAction } from '../../components/chat-interface/message-actions'
import { MessageActionIcons } from '../../components/chat-interface/message-actions'

export interface UseMessageActionsOptions {
  onCopy?: (text: string) => void
  onRegenerate?: (messageId: string) => void
  onLike?: (messageId: string) => void
  onDislike?: (messageId: string) => void
  onShare?: (messageId: string) => void
}

export interface UseMessageActionsReturn {
  actions: MessageAction[]
  isCopying: boolean
  copySuccess: boolean
}

export const useMessageActions = (
  message: UIMessage,
  options: UseMessageActionsOptions = {}
): UseMessageActionsReturn => {
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const {
    onCopy,
    onRegenerate,
    onLike,
    onDislike,
    onShare,
  } = options

  const handleCopy = useCallback(async () => {
    if (!hasCopyableText(message) || isCopying) return

    const text = extractTextFromMessage(message)
    setIsCopying(true)
    
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      onCopy?.(text)
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setCopySuccess(true)
        onCopy?.(text)
        setTimeout(() => {
          setCopySuccess(false)
        }, 2000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
      }
    } finally {
      setIsCopying(false)
    }
  }, [message, isCopying, onCopy])

  const handleRegenerate = useCallback(() => {
    onRegenerate?.(message.id)
  }, [message.id, onRegenerate])

  const handleLike = useCallback(() => {
    onLike?.(message.id)
  }, [message.id, onLike])

  const handleDislike = useCallback(() => {
    onDislike?.(message.id)
  }, [message.id, onDislike])

  const handleShare = useCallback(() => {
    onShare?.(message.id)
  }, [message.id, onShare])

  // 构建动作列表
  const actions: MessageAction[] = []

  // 只对AI消息显示操作按钮
  if (message.role === 'assistant') {
    // 复制按钮 - 如果有可复制的文本
    if (hasCopyableText(message)) {
      actions.push({
        id: 'copy',
        label: copySuccess ? '已复制' : '复制',
        icon: copySuccess ? (
          React.createElement('svg', {
            className: 'h-4 w-4 text-green-600',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
          }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M5 13l4 4L19 7'
          }))
        ) : MessageActionIcons.copy,
        onClick: handleCopy,
        disabled: isCopying,
      })
    }

    // 重新生成按钮
    if (onRegenerate) {
      actions.push({
        id: 'regenerate',
        label: '重新生成',
        icon: MessageActionIcons.regenerate,
        onClick: handleRegenerate,
      })
    }

    // 点赞按钮
    if (onLike) {
      actions.push({
        id: 'like',
        label: '点赞',
        icon: MessageActionIcons.like,
        onClick: handleLike,
      })
    }

    // 点踩按钮
    if (onDislike) {
      actions.push({
        id: 'dislike',
        label: '点踩',
        icon: MessageActionIcons.dislike,
        onClick: handleDislike,
      })
    }

    // 分享按钮
    if (onShare) {
      actions.push({
        id: 'share',
        label: '分享',
        icon: MessageActionIcons.share,
        onClick: handleShare,
      })
    }
  }

  return {
    actions,
    isCopying,
    copySuccess,
  }
}
