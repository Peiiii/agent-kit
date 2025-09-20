import type { Tool } from "@agent-labs/agent-chat"
import * as React from "react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

type Args = {
  language?: string
  lineLength?: number
  lines?: number
  contentChar?: string
  simulateDelayMs?: number
}

const makeLongLine = (len: number, ch: string) => new Array(len).fill(ch[0] || 'A').join('')

export const createCodeBlockTesterTool = (): Tool => ({
  name: 'code_block_tester',
  description: '渲染超长代码块（仅渲染，无执行），用于验证代码块在气泡内的换行与滚动表现',
  parameters: {
    type: 'object' as const,
    properties: {
      language: { type: 'string' as const, description: '代码语言，如 ts、js、json' },
      lineLength: { type: 'number' as const, description: '单行长度，默认 2048' },
      lines: { type: 'number' as const, description: '行数，默认 4' },
      contentChar: { type: 'string' as const, description: '填充字符，默认 X' },
      simulateDelayMs: { type: 'number' as const, description: '渲染前等待（毫秒），默认 0' },
    },
  },
  // 仅渲染，不执行
  render: (toolInvocation) => {
    const args = (toolInvocation.args || {}) as Args | string
    const isObj = typeof args === 'object' && args !== null
    const lang = (isObj && (args as Args).language) || 'ts'
    const lineLength = (isObj && (args as Args).lineLength) || 2048
    const lines = (isObj && (args as Args).lines) || 4
    const ch = (isObj && (args as Args).contentChar) || 'X'
    const wait = (isObj && (args as Args).simulateDelayMs) || 0

    const contentLines = new Array(lines).fill(0).map((_, i) => `${i + 1}: ${makeLongLine(lineLength, ch)}`)
    const md = `\n\n\u0060\u0060\u0060${lang}\n${contentLines.join('\n')}\n\u0060\u0060\u0060\n\n`

    const [ready, setReady] = React.useState(wait === 0)
    React.useEffect(() => {
      if (wait > 0) {
        const t = setTimeout(() => setReady(true), wait)
        return () => clearTimeout(t)
      }
    }, [wait])

    if (!ready) {
      return (
        <div className="text-xs text-muted-foreground">等待渲染代码块（{wait}ms）…</div>
      )
    }

    return (
      <div className="w-full max-w-full min-w-0 overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // @ts-expect-error - react-markdown components typing
            code({ inline, className, children }) {
              const match = /language-(\\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg my-2 overflow-auto w-full max-w-full min-w-0"
                  wrapLongLines
                  customStyle={{
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxWidth: '100%',
                    maxHeight: '28rem',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm break-all">{children}</code>
              )
            },
          }}
        >
          {md}
        </ReactMarkdown>
      </div>
    )
  },
})

