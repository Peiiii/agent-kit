import * as React from 'react'

import { MessageInput } from './message-input'
import { MessageItem } from './message-item'
import { useChatAutoScroll } from '../../core/hooks/use-chat-auto-scroll'
import { useEnhancedInput } from '../../core/hooks/use-enhanced-input'
import { SmartSuggestions, DEFAULT_SUGGESTIONS } from './smart-suggestions'
import { EmojiPicker } from './emoji-picker'
import { FileUploadZone } from './file-upload-zone'
import clsx from 'clsx'
import type { ChatInterfaceProps, ChatInputExtension } from '@/core/types/component-types'
import { Prompts } from './prompts'

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  uiMessages,
  toolRenderers,
  onToolResult,
  input,
  senderProps,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
  promptsProps,
  messageItemProps,
  aboveInputComponent,
  inputExtensions = [],
  onBeforeSend,
  onSendDraft,
  meta,
  onMetaChange,
}) => {
  const { containerRef, isSticky, scrollToBottom, setSticky } = useChatAutoScroll({
    deps: [uiMessages],
  })

  // 增强输入功能状态管理
  const [enhancedState, enhancedActions] = useEnhancedInput({
    initialInput: input,
    enableVoiceRecording: true,
    enableFileUpload: true,
    enableSmartSuggestions: true,
    enableEmojiPicker: true,
    customSuggestions: DEFAULT_SUGGESTIONS
  })

  // local meta when external control is not provided
  const [internalMeta, setInternalMeta] = React.useState<Record<string, unknown>>({})
  const effectiveMeta = meta ?? internalMeta

  const setDraft = React.useCallback(
    (next: { text: string; meta?: Record<string, unknown>; attachments?: any[] } | ((d: { text: string; meta?: Record<string, unknown>; attachments?: any[] }) => any)) => {
      const current = { text: input, meta: effectiveMeta, attachments: enhancedState.attachments }
      const value = typeof next === 'function' ? (next as any)(current) : next
      if (value.text !== undefined && value.text !== input) {
        onInputChange(value.text)
        enhancedActions.setInput(value.text)
      }
      if (value.meta !== undefined) {
        if (onMetaChange) onMetaChange(value.meta)
        else setInternalMeta(value.meta)
      }
      if (value.attachments !== undefined) {
        // 处理附件更新
        enhancedActions.addAttachments(value.attachments.map((att: any) => att.file).filter(Boolean))
      }
    },
    [input, effectiveMeta, onInputChange, onMetaChange, enhancedState.attachments, enhancedActions],
  )

  // Group extensions by placement to render in appropriate slots
  const groupByPlacement = React.useMemo(() => {
    const map: Record<string, ChatInputExtension[]> = {}
    for (const ext of inputExtensions) {
      // Map legacy placements to new regions
      let p = ext.placement ?? 'inside-left'
      if (p === 'toolbar-left') p = 'top-left'
      if (p === 'toolbar-right') p = 'top-right'
      if (p === 'below') p = 'bottom-left'
      if (!map[p]) map[p] = []
      map[p].push(ext)
    }
    return map
  }, [inputExtensions])

  // Build context for extension renderers
  const extCtx = React.useMemo(() => ({
    draft: { text: input, meta: effectiveMeta },
    setDraft,
    isAgentResponding,
    requestAbort: onAbort,
  }), [input, effectiveMeta, setDraft, isAgentResponding, onAbort])

  const runBeforeSendPipeline = React.useCallback(async () => {
    let draft = { text: input, meta: effectiveMeta }
    if (onBeforeSend) {
      const res = await onBeforeSend(draft)
      if ((res as any)?.abort) return { aborted: true as const }
      draft = res as any
    }
    for (const ext of inputExtensions) {
      if (!ext.beforeSend) continue
      const res = await ext.beforeSend(draft)
      if ((res as any)?.abort) return { aborted: true as const }
      draft = res as any
    }
    return { aborted: false as const, draft }
  }, [input, effectiveMeta, onBeforeSend, inputExtensions])

  // 包装 onSend，发送后自动滚动到底部并 sticky
  const handleSend = React.useCallback(async () => {
    // If there are extensions/pipeline, honor them
    const hasPipeline = Boolean(onBeforeSend || (inputExtensions && inputExtensions.length > 0) || onSendDraft)
    if (hasPipeline) {
      const result = await runBeforeSendPipeline()
      if (result.aborted) return
      const draft = result.draft
      if (onSendDraft) {
        onSendDraft(draft)
      } else {
        // Fallback: call onSend() with original text, we cannot safely change it here
        onSend()
      }
    } else {
      onSend()
    }
    setTimeout(() => {
      setSticky(true)
      scrollToBottom()
    }, 0)
  }, [onBeforeSend, inputExtensions, onSendDraft, onSend, runBeforeSendPipeline, setSticky, scrollToBottom])

  console.log('[ChatInterface] uiMessages', {uiMessages})

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        className={
          clsx(
            'flex-1 overflow-y-auto px-4 py-2',
            isSticky ? ' sticky-bottom' : '',
          )
        }
      >
        {uiMessages.map((uiMessage, index) => (
          <MessageItem
            key={index}
            uiMessage={uiMessage}
            toolRenderers={toolRenderers}
            onToolResult={onToolResult}
            {...messageItemProps}
          />
        ))}
      </div>
      {promptsProps && uiMessages.length === 0 && (
        <div className="border-t border-border/50 bg-gradient-to-b from-muted/30 to-background/95 backdrop-blur-sm px-4 py-6">
          <Prompts promptsProps={promptsProps} />
        </div>
      )}
      {aboveInputComponent && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          {aboveInputComponent}
        </div>
      )}
      {/* 智能建议 */}
      {enhancedState.showSuggestions && enhancedState.suggestions.length > 0 && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <SmartSuggestions
            suggestions={enhancedState.suggestions}
            onSuggestionClick={enhancedActions.applySuggestion}
            maxSuggestions={6}
            showCategories={true}
          />
        </div>
      )}

      {/* 文件上传区域 */}
      {enhancedState.attachments.length > 0 && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <FileUploadZone
            files={enhancedState.attachments.map(att => att.file!).filter(Boolean)}
            onFilesChange={enhancedActions.addAttachments}
            onRemove={(index) => {
              const attachment = enhancedState.attachments[index]
              if (attachment) {
                enhancedActions.removeAttachment(attachment.id)
              }
            }}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
            acceptedTypes={['image/*', '.pdf', '.txt', '.md', '.json', '.csv']}
          />
        </div>
      )}

      {/* 表情选择器 */}
      {enhancedState.showEmojiPicker && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <div className="flex justify-center">
            <EmojiPicker
              onEmojiSelect={enhancedActions.insertEmoji}
              onClose={() => enhancedActions.setShowEmojiPicker(false)}
            />
          </div>
        </div>
      )}

      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 py-4">
        <MessageInput
          input={input}
          {...senderProps}
          onInputChange={(value) => {
            onInputChange(value)
            enhancedActions.setInput(value)
          }}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={onAbort}
          // 增强功能
          onVoiceStart={enhancedActions.startVoiceRecording}
          onVoiceStop={enhancedActions.stopVoiceRecording}
          isVoiceRecording={enhancedState.isVoiceRecording}
          onFileUpload={enhancedActions.addAttachments}
          suggestions={enhancedState.suggestions}
          onSuggestionClick={enhancedActions.applySuggestion}
          attachments={enhancedState.attachments}
          onAttachmentRemove={enhancedActions.removeAttachment}
          showAdvancedOptions={true}
          onAdvancedOptionClick={(option: string) => {
            if (option === 'emoji') {
              enhancedActions.setShowEmojiPicker(!enhancedState.showEmojiPicker)
            }
          }}
          isProcessing={enhancedState.isProcessing}
          insideLeftSlot={groupByPlacement['inside-left']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
          insideRightSlot={groupByPlacement['inside-right']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
          headerLeftSlot={groupByPlacement['top-left']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
          headerRightSlot={groupByPlacement['top-right']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
          footerLeftSlot={groupByPlacement['bottom-left']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
          footerRightSlot={groupByPlacement['bottom-right']?.map(ext => (
            <React.Fragment key={ext.id}>{ext.render(extCtx)}</React.Fragment>
          ))}
        />
      </div>
    </div>
  )
}
