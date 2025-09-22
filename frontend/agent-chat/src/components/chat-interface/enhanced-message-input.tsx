import { Loader2, Send, Square } from 'lucide-react'
import * as React from 'react'
import type { ChatInputExtension, MessageInputProps } from '../../core/types/component-types'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'


interface EnhancedMessageInputProps extends MessageInputProps {


    isProcessing?: boolean
    processingMessage?: string

    variant?: 'default' | 'minimal' | 'glass'
    size?: 'sm' | 'md' | 'lg'
    inputExtensions?: ChatInputExtension[]

}


export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
    input,
    onInputChange,
    onSend,
    isAgentResponding,
    onAbort,
    placeholder = 'Type a message...',
    isProcessing = false,
    processingMessage = 'Processing...',
    variant = 'default',
    size = 'md',
    inputExtensions = [],
    insideLeftSlot,
    insideRightSlot,
    headerLeftSlot,
    headerRightSlot,
    footerLeftSlot,
    footerRightSlot,
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const isComposingRef = React.useRef(false)

    const autosize = React.useCallback(() => {
        const el = textareaRef.current
        if (!el) return

        el.style.height = 'auto'

        const maxHeightPx = size === 'sm' ? 120 : size === 'lg' ? 300 : 200

        const computedStyle = window.getComputedStyle(el)
        const lineHeight = parseInt(computedStyle.lineHeight) || 24
        const paddingTop = parseInt(computedStyle.paddingTop) || 8
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 8

        const minHeight = lineHeight + paddingTop + paddingBottom

        const contentHeight = el.scrollHeight

        const finalHeight = Math.max(minHeight, Math.min(contentHeight, maxHeightPx))
        el.style.height = `${finalHeight}px`

        el.style.overflowY = contentHeight > maxHeightPx ? 'auto' : 'hidden'
    }, [size])

    React.useLayoutEffect(() => {
        autosize()
    }, [input, autosize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onInputChange(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isEnter = e.key === 'Enter'
        const sendHotkey = (e.metaKey || e.ctrlKey) && isEnter
        const plainEnter = isEnter && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey

        if ((plainEnter || sendHotkey) && !isComposingRef.current) {
            e.preventDefault()
            if (!isAgentResponding && input.trim()) {
                onSend()
            }
        }

        if (e.key === 'Escape' && isAgentResponding && onAbort) {
            e.preventDefault()
            onAbort()
        }

    }

    const handleCompositionStart = () => {
        isComposingRef.current = true
    }

    const handleCompositionEnd = () => {
        isComposingRef.current = false
    }




    const canSend = input.trim().length > 0 && !isAgentResponding && !isProcessing

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
            <div
                className={cn(
                    'relative w-full rounded-xl border transition-all duration-200',
                    'max-h-[60vh] overflow-hidden flex flex-col',
                    getVariantStyles(),
                    getSizeStyles()
                )}
            >
                {(headerLeftSlot || headerRightSlot) && (
                    <div className="px-3 pt-3 pb-2">
                        <div className="flex items-center gap-2 gap-y-1 flex-wrap">
                            <div className="flex items-center gap-2">
                                {headerLeftSlot}
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                {headerRightSlot}
                                {isProcessing && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        {processingMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                <div className="relative pt-3 flex-1 min-h-0">
                    {insideLeftSlot && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            {insideLeftSlot}
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        placeholder={placeholder}
                        rows={1}
                        aria-label="Message input"  
                        aria-multiline="true"
                        aria-busy={isAgentResponding}
                        className={cn(
                            'w-full resize-none bg-transparent text-foreground',
                            'placeholder:text-muted-foreground outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            insideLeftSlot ? 'pl-10' : 'pl-3',
                            'py-2'
                        )}
                        style={{
                            minHeight: '40px',
                            height: '40px',
                        }}
                    />
                </div>

                <div className="flex items-center justify-between py-2 text-xs text-muted-foreground flex-shrink-0">
                    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap overflow-x-auto">
                        {footerLeftSlot}
                    </div>
                    <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap overflow-x-auto">
                        {inputExtensions.map((extension) => {
                            const context = {
                                draft: { text: input, meta: {} },
                                setDraft: (next: any) => {
                                    if (typeof next === 'function') {
                                        const result = next({ text: input, meta: {} })
                                        if (result.text !== undefined) {
                                            onInputChange(result.text)
                                        }
                                    } else {
                                        if (next.text !== undefined) {
                                            onInputChange(next.text)
                                        }
                                    }
                                },
                                isAgentResponding,
                                requestAbort: onAbort
                            }
                            return (
                                <React.Fragment key={extension.id}>
                                    {extension.render(context)}
                                </React.Fragment>
                            )
                        })}
                        {!isAgentResponding ? (
                            <Button
                                variant={canSend ? 'default' : 'ghost'}
                                size="icon"
                                onClick={onSend}
                                disabled={!canSend}
                                title="Send (Enter)"
                                className={cn(
                                    'h-8 w-8 rounded-full transition-all duration-150',
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
                                title="Stop (Esc)"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
                            >
                                <Square className="h-4 w-4" />
                            </Button>
                        )}
                        {insideRightSlot && (
                            <div className="ml-1 flex items-center">
                                {insideRightSlot}
                            </div>
                        )}
                        {footerRightSlot && (
                            <div className="flex items-center">
                                {footerRightSlot}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
