import { Send, Square, Mic, MicOff, Paperclip, Smile, X, Loader2, Zap, Image, FileText, Code, Palette } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import type { MessageInputProps } from '@/core/types/component-types'


// 附件类型
interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  preview?: string
  size?: number
}

// 智能建议类型
interface SmartSuggestion {
  id: string
  text: string
  icon: React.ReactNode
  category: 'action' | 'question' | 'creative' | 'technical'
}

// 增强的输入组件属性
interface EnhancedMessageInputProps extends MessageInputProps {
  // 多模态支持
  onVoiceStart?: () => void
  onVoiceStop?: () => void
  onVoiceResult?: (text: string) => void
  isVoiceRecording?: boolean
  
  // 文件上传
  onFileUpload?: (files: File[]) => void
  maxFileSize?: number
  acceptedFileTypes?: string[]
  
  // 智能建议
  suggestions?: SmartSuggestion[]
  onSuggestionClick?: (suggestion: SmartSuggestion) => void
  
  // 附件管理
  attachments?: Attachment[]
  onAttachmentRemove?: (id: string) => void
  
  // 高级功能
  showAdvancedOptions?: boolean
  onAdvancedOptionClick?: (option: string) => void
  
  // 状态指示
  isProcessing?: boolean
  processingMessage?: string
  
  // 主题和样式
  variant?: 'default' | 'minimal' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

// 智能建议数据
const DEFAULT_SUGGESTIONS: SmartSuggestion[] = [
  {
    id: '1',
    text: '帮我写一个React组件',
    icon: <Code className="h-3 w-3" />,
    category: 'technical'
  },
  {
    id: '2',
    text: '解释一下这个概念',
    icon: <Zap className="h-3 w-3" />,
    category: 'question'
  },
  {
    id: '3',
    text: '创作一个故事',
    icon: <Palette className="h-3 w-3" />,
    category: 'creative'
  },
  {
    id: '4',
    text: '分析这个数据',
    icon: <FileText className="h-3 w-3" />,
    category: 'action'
  }
]

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
  placeholder = '发送消息...',
  onVoiceStart,
  onVoiceStop,
  onVoiceResult,
  isVoiceRecording = false,
  onFileUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', '.pdf', '.txt', '.md', '.json'],
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
  attachments = [],
  onAttachmentRemove,
  showAdvancedOptions = true,
  onAdvancedOptionClick,
  isProcessing = false,
  processingMessage = '处理中...',
  variant = 'default',
  size = 'md',
  insideLeftSlot,
  insideRightSlot,
  headerLeftSlot,
  headerRightSlot,
  footerLeftSlot,
  footerRightSlot,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const isComposingRef = React.useRef(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  // 自动调整高度
  const autosize = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    
    el.style.height = 'auto'
    const maxHeight = size === 'sm' ? 120 : size === 'lg' ? 240 : 200
    const next = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [size])

  React.useLayoutEffect(() => {
    autosize()
  }, [input, autosize])

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    setShowSuggestions(e.target.value.length === 0)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnter = e.key === 'Enter'
    const sendHotkey = (e.metaKey || e.ctrlKey) && isEnter
    const plainEnter = isEnter && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey

    if ((plainEnter || sendHotkey) && !isComposingRef.current) {
      e.preventDefault()
      if (!isAgentResponding && (input.trim() || attachments.length > 0)) {
        onSend()
      }
    }

    // ESC 停止响应
    if (e.key === 'Escape' && isAgentResponding && onAbort) {
      e.preventDefault()
      onAbort()
    }

    // 上下箭头选择建议
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      // TODO: 实现建议选择逻辑
    }
  }

  // 处理组合输入
  const handleCompositionStart = () => {
    isComposingRef.current = true
  }
  
  const handleCompositionEnd = () => {
    isComposingRef.current = false
  }

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 检查文件大小和类型
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        console.warn(`文件 ${file.name} 超过大小限制`)
        return false
      }
      return true
    })

    if (validFiles.length > 0 && onFileUpload) {
      onFileUpload(validFiles)
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理语音录制
  const handleVoiceToggle = () => {
    if (isVoiceRecording) {
      onVoiceStop?.()
    } else {
      onVoiceStart?.()
    }
  }

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    onSuggestionClick?.(suggestion)
    setShowSuggestions(false)
  }

  // 处理高级选项
  const handleAdvancedOption = (option: string) => {
    onAdvancedOptionClick?.(option)
  }

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isAgentResponding && !isProcessing

  // 样式变体
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'border-0 bg-transparent shadow-none focus-within:ring-0'
      case 'glass':
        return 'bg-background/80 backdrop-blur-md border-border/50 shadow-lg'
      default:
        return 'bg-background/95 backdrop-blur-sm border-border shadow-sm'
    }
  }

  // 尺寸样式
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-3 py-2.5 text-sm'
    }
  }

  return (
    <div className="w-full space-y-2">
      {/* 顶部工具栏 */}
      {(headerLeftSlot || headerRightSlot || showAdvancedOptions) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            {headerLeftSlot}
            {showAdvancedOptions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdvancedOption('format')}
                  className="h-7 px-2 text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  格式化
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdvancedOption('templates')}
                  className="h-7 px-2 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  模板
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerRightSlot}
            {isProcessing && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {processingMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 智能建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-7 px-3 text-xs hover:bg-accent/50"
              >
                {suggestion.icon}
                <span className="ml-1">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="px-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-xs"
              >
                {attachment.type === 'image' && <Image className="h-3 w-3" />}
                {attachment.type === 'file' && <FileText className="h-3 w-3" />}
                {attachment.type === 'code' && <Code className="h-3 w-3" />}
                <span className="truncate max-w-32">{attachment.name}</span>
                {attachment.size && (
                  <span className="text-muted-foreground">
                    {(attachment.size / 1024).toFixed(1)}KB
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAttachmentRemove?.(attachment.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主输入区域 */}
      <div
        className={cn(
          'relative w-full rounded-xl border transition-all duration-200',
          getVariantStyles(),
          isFocused && 'ring-2 ring-ring/20 ring-offset-2',
          getSizeStyles()
        )}
      >
        {/* 左侧插槽 */}
        {insideLeftSlot && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {insideLeftSlot}
          </div>
        )}

        {/* 文本输入区域 */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
          aria-label="消息输入"
          aria-multiline="true"
          aria-busy={isAgentResponding}
          className={cn(
            'min-h-[2.5rem] w-full resize-none bg-transparent text-foreground',
            'placeholder:text-muted-foreground outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            insideLeftSlot ? 'pl-10' : 'pl-3',
            insideRightSlot ? 'pr-20' : 'pr-12',
            'py-2'
          )}
        />

        {/* 右侧操作按钮 */}
        <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1">
          {/* 文件上传按钮 */}
          {onFileUpload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 hover:bg-accent/50"
              title="上传文件"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}

          {/* 语音录制按钮 */}
          {onVoiceStart && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(
                'h-8 w-8 transition-colors',
                isVoiceRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'hover:bg-accent/50'
              )}
              title={isVoiceRecording ? '停止录音' : '开始录音'}
            >
              {isVoiceRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* 表情按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAdvancedOption('emoji')}
            className="h-8 w-8 hover:bg-accent/50"
            title="表情符号"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* 发送/停止按钮 */}
          {!isAgentResponding ? (
            <Button
              variant={canSend ? 'default' : 'ghost'}
              size="icon"
              onClick={onSend}
              disabled={!canSend}
              title="发送 (Enter)"
              className={cn(
                'h-8 w-8 transition-all duration-150',
                canSend
                  ? 'shadow-sm hover:shadow-md active:scale-95'
                  : 'text-muted-foreground'
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAbort?.()
              }}
              title="停止响应 (Esc)"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}

          {/* 右侧插槽 */}
          {insideRightSlot && (
            <div className="ml-1">
              {insideRightSlot}
            </div>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        {onFileUpload && (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileUpload}
            className="hidden"
          />
        )}
      </div>

      {/* 底部工具栏 */}
      {(footerLeftSlot || footerRightSlot) && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {footerLeftSlot}
          </div>
          <div className="flex items-center gap-2">
            {footerRightSlot}
            <span>Enter 发送，Shift+Enter 换行</span>
          </div>
        </div>
      )}
    </div>
  )
}
