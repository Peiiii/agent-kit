import type { Tool, ToolCall, ToolInvocation } from '@agent-labs/agent-chat'
import * as React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Args = {
  html?: string
  simulateDelayMs?: number
}

type Result = {
  html: string
  meta: {
    title: string
    length: number
    hasScript: boolean
  }
  status: 'success' | 'error'
  error?: string
}

const repairJsonStructure = (raw: string): string | undefined => {
  const start = raw.indexOf('{')
  if (start === -1) return undefined

  const snippet = raw.slice(start)
  const stack: string[] = []
  let output = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < snippet.length; i += 1) {
    const ch = snippet[i]
    output += ch

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
    } else if (ch === '{') {
      stack.push('}')
    } else if (ch === '[') {
      stack.push(']')
    } else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop()
      }
    }
  }

  if (inString) {
    output += '"'
  }

  while (stack.length > 0) {
    output += stack.pop()
  }

  try {
    JSON.parse(output)
    return output
  } catch {
    return undefined
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const createHtmlGeneratorTool = (): Tool => ({
  name: 'generate_html',
  description: '生成 HTML 页面并即时展示源码预览',
  parameters: {
    type: 'object' as const,
    properties: {
      html: {
        type: 'string' as const,
        description: '完整 HTML 字符串（可选）',
      },
      simulateDelayMs: {
        type: 'number' as const,
        description: '模拟执行耗时（毫秒，默认 5000）',
      },
    },
  },
  execute: async (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments) as Args
      const waitMs = Math.max(0, Math.min(120000, args.simulateDelayMs ?? 8000))

      const html = typeof args.html === 'string' ? args.html : ''

      await delay(waitMs)

      const result: Result = {
        html,
        meta: {
          title: 'Preview',
          length: html.length,
          hasScript: /<script[\s>]/i.test(html),
        },
        status: 'success',
      }

      return result as any
    } catch (error) {
      const err: Result = {
        html: '',
        meta: { title: 'Error', length: 0, hasScript: false },
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
      return err as any
    }
  },
  render: (toolInvocation: ToolInvocation) => {
    // Resolve preview content: prefer result.html; else try args.html when valid JSON
    const args = (toolInvocation.args || {}) as Args | string
    const isArgsObject = typeof args === 'object' && args !== null
    const result = toolInvocation.result as Result | undefined
    const finalHtml = result?.html
    let pendingHtml = finalHtml
    if (!pendingHtml && isArgsObject) {
      const candidate = (args as Args).html
      if (typeof candidate === 'string') {
        pendingHtml = candidate
      }
    }

    if (!pendingHtml && typeof args === 'string') {
      const cleaned = args.trim()
      if (cleaned) {
        let htmlCandidate: string | undefined
        try {
          const parsed = JSON.parse(cleaned)
          if (parsed && typeof parsed === 'object') {
            const candidate = (parsed as Args).html
            if (typeof candidate === 'string') {
              htmlCandidate = candidate
            }
          }
        } catch {
          const repaired = repairJsonStructure(cleaned)
          if (repaired) {
            try {
              const parsed = JSON.parse(repaired)
              if (parsed && typeof parsed === 'object') {
                const candidate = (parsed as Args).html
                if (typeof candidate === 'string') {
                  htmlCandidate = candidate
                }
              }
            } catch {
              // ignore
            }
          }
        }

        if (!htmlCandidate && cleaned.includes('<')) {
          htmlCandidate = cleaned.replace(/\\n/g, '\n').replace(/\\"/g, '"')
        }

        if (htmlCandidate) {
          pendingHtml = htmlCandidate
        }
      }
    }

    const previewHtml = toolInvocation.state === 'result' ? pendingHtml : undefined

    const [tab, setTab] = React.useState<'preview' | 'source'>('source')

    React.useEffect(() => {
      setTab(toolInvocation.state === 'result' ? 'preview' : 'source')
    }, [toolInvocation.toolCallId, toolInvocation.state])

    return (
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="text-sm font-medium">
            HTML 生成与预览
            {toolInvocation.state === 'partial-call' && (
              <span className="ml-2 text-xs text-muted-foreground">
                准备参数中…
              </span>
            )}
            {toolInvocation.state === 'call' && (
              <span className="ml-2 text-xs text-muted-foreground">
                执行中…
              </span>
            )}
            {toolInvocation.state === 'result' && (
              <span className="ml-2 text-xs text-muted-foreground">已完成</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">generate_html</div>
        </div>
        <div className="px-3 pt-3">
          {!result && pendingHtml && (
            <div className="mb-3 text-[10px] text-muted-foreground">
              预览基于当前参数实时生成，最终结果可能略有调整。
            </div>
          )}
        </div>
        <div className="px-3">
          <div className="flex gap-2 mb-2">
            <button
              className={`text-xs px-2 py-1 rounded border ${tab === 'preview' ? 'bg-muted' : 'bg-background'} ${toolInvocation.state !== 'result' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={toolInvocation.state !== 'result'}
              onClick={() => setTab('preview')}
            >
              预览
            </button>
            <button
              className={`text-xs px-2 py-1 rounded border ${tab === 'source' ? 'bg-muted' : 'bg-background'}`}
              onClick={() => setTab('source')}
            >
              源码
            </button>
          </div>
          {tab === 'preview' ? (
            <div
              className="rounded-md border overflow-hidden"
              style={{ height: 360 }}
            >
              {previewHtml ? (
                <iframe
                  title="html-preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '100%', border: '0' }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  {toolInvocation.state === 'result'
                    ? '无可预览内容'
                    : '等待生成预览…'}
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-md border"
              style={{ maxHeight: 360, overflow: 'hidden' }}
            >
              {pendingHtml ? (
                <SyntaxHighlighter
                  language="html"
                  style={vscDarkPlus}
                  PreTag="div"
                  wrapLongLines
                  customStyle={{
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: 360,
                    margin: 0,
                    padding: '0.75rem',
                  }}
                >
                  {pendingHtml}
                </SyntaxHighlighter>
              ) : (
                <div className="p-2 text-xs text-muted-foreground">
                  等待 HTML 生成…
                </div>
              )}
            </div>
          )}
        </div>
        {result?.status === 'error' && (
          <div className="px-3 py-2 text-xs text-red-600">{result.error}</div>
        )}
        {result && result.status === 'success' && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            长度: {result.meta.length} 字符
            {result.meta.hasScript ? '，包含脚本' : ''}
          </div>
        )}
      </div>
    )
  },
})
