import * as React from 'react'

import type { ChatInputExtension, ChatInterfaceProps, ComposerDraft } from '@/core/types/component-types'
import clsx from 'clsx'
import { useChatAutoScroll } from '../../core/hooks/use-chat-auto-scroll'
import { useEnhancedInput } from '../../core/hooks/use-enhanced-input'
import { MessageInput } from './message-input'
import { MessageItem } from './message-item'
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

  // Enhanced input state (UI-agnostic): files, voice, emoji
  const [enhancedState] = useEnhancedInput({
    onAppendText: (t) => onInputChange(input + t),
  })

  // local meta when external control is not provided
  const [internalMeta, setInternalMeta] = React.useState<Record<string, unknown>>({})
  const effectiveMeta = meta ?? internalMeta

  const setDraft = React.useCallback(
    (next: ComposerDraft | ((d: ComposerDraft) => ComposerDraft)) => {
      const current: ComposerDraft = {
        text: input,
        meta: effectiveMeta,
      }
      const value = typeof next === 'function' ? (next as (d: ComposerDraft) => ComposerDraft)(current) : next
      if (value.text !== undefined && value.text !== input) {
        onInputChange(value.text)
      }
      if (value.meta !== undefined) {
        if (onMetaChange) onMetaChange(value.meta)
        else setInternalMeta(value.meta)
      }
      // Note: attachments update is ignored because external draft may not carry File objects
    },
    [input, effectiveMeta, onInputChange, onMetaChange, enhancedState.attachments],
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
    let draft: ComposerDraft = { text: input, meta: effectiveMeta }
    const isAbort = (v: unknown): v is { abort: true } => typeof v === 'object' && v !== null && 'abort' in v
    if (onBeforeSend) {
      const res = await onBeforeSend(draft)
      if (isAbort(res)) return { aborted: true as const }
      draft = res
    }
    for (const ext of inputExtensions) {
      if (!ext.beforeSend) continue
      const res = await ext.beforeSend(draft)
      if (isAbort(res)) return { aborted: true as const }
      draft = res
    }
    return { aborted: false as const, draft }
  }, [input, effectiveMeta, onBeforeSend, inputExtensions])

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

      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 py-4 flex-shrink-0">
        <MessageInput
          input={input}
          {...senderProps}
          onInputChange={(value) => {
            onInputChange(value)
          }}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={onAbort}

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
