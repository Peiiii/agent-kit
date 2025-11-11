import type { UIMessage } from '../types/ui-message'

/**
 * 从UIMessage中提取纯文本内容
 * 只提取text类型的parts，忽略工具调用等其他类型
 */
export function extractTextFromMessage(message: UIMessage): string {
  const textParts: string[] = []
  
  for (const part of message.parts) {
    if (part.type === 'text') {
      textParts.push(part.text)
    }
  }
  
  return textParts.join('\n\n')
}

/**
 * 检查消息是否包含可复制的文本内容
 */
export function hasCopyableText(message: UIMessage): boolean {
  return message.parts.some(part => part.type === 'text' && part.text.trim().length > 0)
}

/**
 * 获取消息的预览文本（用于工具提示等）
 */
export function getMessagePreview(message: UIMessage, maxLength: number = 100): string {
  const text = extractTextFromMessage(message)
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
