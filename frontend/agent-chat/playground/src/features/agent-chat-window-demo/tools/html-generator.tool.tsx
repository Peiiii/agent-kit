import type { Tool, ToolCall, ToolInvocation } from "@agent-labs/agent-chat"
import * as React from "react"

// A simple, high-quality HTML generator tool with preview support.
// - Frontend-execution with intentional delay to simulate long-running tools
// - Live preview once args are parseable or when result is ready
// - Safe-ish preview via iframe sandbox

type Args = {
  // Provide either full html or a spec to be templated
  html?: string
  title?: string
  spec?: string
  css?: string
  js?: string
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

const ensureDocument = (html: string, title?: string, css?: string, js?: string): string => {
  // If user already provided a full document, trust it as-is
  const lower = html.trim().toLowerCase()
  const isFullDoc = lower.includes('<html') && lower.includes('</html>')
  if (isFullDoc) return html

  const safeTitle = (title || 'Preview').replace(/[\n\r]/g, ' ').slice(0, 100)
  const styleTag = css ? `\n<style>\n${css}\n</style>` : ''
  const scriptTag = js ? `\n<script>\n${js}\n</script>` : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>${styleTag}
  </head>
  <body>
    ${html}
    ${scriptTag}
  </body>
</html>`
}

const buildFromSpec = (args: Required<Pick<Args, 'title'>> & Partial<Args>): string => {
  const { title, spec, css, js } = args
  const content = `
    <main style="max-width: 800px; margin: 2rem auto; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <h1 style="margin-bottom: 1rem;">${title}</h1>
      <p style="color: #555;">根据说明生成的页面：</p>
      ${spec ? `<section style="margin-top: 1rem; white-space: pre-wrap;">${spec}</section>` : ''}
    </main>
  `.trim()
  return ensureDocument(content, title, css, js)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const createHtmlGeneratorTool = (): Tool => ({
  name: 'generate_html',
  description: '生成 HTML 页面并支持预览（含可配置等待时间，便于测试工具执行中的流式反馈）',
  parameters: {
    type: 'object' as const,
    properties: {
      html: { type: 'string' as const, description: '完整 HTML 字符串（可选）' },
      title: { type: 'string' as const, description: '页面标题（可选，默认 Preview）' },
      spec: { type: 'string' as const, description: '页面结构或内容的文字说明（当未提供 html 时使用）' },
      css: { type: 'string' as const, description: '内联 CSS（可选）' },
      js: { type: 'string' as const, description: '内联 JS（可选）' },
      simulateDelayMs: { type: 'number' as const, description: '模拟执行耗时（毫秒，默认 5000）' },
    },
  },
  execute: async (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments) as Args
      const waitMs = Math.max(0, Math.min(120000, args.simulateDelayMs ?? 8000))

      let html = ''
      if (args.html && args.html.trim().length > 0) {
        // User/AI provided full or partial HTML
        html = ensureDocument(args.html, args.title, args.css, args.js)
      } else {
        // Build from spec
        html = buildFromSpec({ title: args.title || 'Preview', spec: args.spec, css: args.css, js: args.js })
      }

      // Simulate long-running tool
      await delay(waitMs)

      const result: Result = {
        html,
        meta: {
          title: args.title || 'Preview',
          length: html.length,
          hasScript: /<script[\s>]/i.test(html),
        },
        status: 'success',
      }

      return result as any
    } catch (e) {
      const err: Result = {
        html: '',
        meta: { title: 'Error', length: 0, hasScript: false },
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      }
      return err as any
    }
  },
  render: (toolInvocation: ToolInvocation) => {
    // Resolve preview content: prefer result.html; else try args.html when valid JSON
    const args = (toolInvocation.args || {}) as Args | string
    const isArgsObject = typeof args === 'object' && args !== null
    const liveArgsHtml = isArgsObject && typeof (args as Args).html === 'string' ? (args as Args).html : undefined

    const result = toolInvocation.result as Result | undefined
    const finalHtml = result?.html
    const previewHtml = finalHtml || (liveArgsHtml && liveArgsHtml.trim().length > 0 ? ensureDocument(liveArgsHtml) : undefined)

    const [tab, setTab] = React.useState<'preview' | 'source'>('preview')

    return (
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="text-sm font-medium">
            HTML 生成与预览
            {toolInvocation.state === 'partial-call' && (
              <span className="ml-2 text-xs text-muted-foreground">准备参数中…</span>
            )}
            {toolInvocation.state === 'call' && (
              <span className="ml-2 text-xs text-muted-foreground">执行中…</span>
            )}
            {toolInvocation.state === 'result' && (
              <span className="ml-2 text-xs text-muted-foreground">已完成</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">generate_html</div>
        </div>
        <div className="px-3 pt-3">
          {isArgsObject && (
            <div className="mb-3 text-xs text-muted-foreground">
              {((args as Args).title || (args as Args).spec) && (
                <div>
                  { (args as Args).title && <div>标题: <code className="bg-muted px-1 rounded">{(args as Args).title}</code></div> }
                  { (args as Args).spec && <div className="mt-1">说明: <span className="whitespace-pre-wrap">{(args as Args).spec}</span></div> }
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-3">
          <div className="flex gap-2 mb-2">
            <button
              className={`text-xs px-2 py-1 rounded border ${tab === 'preview' ? 'bg-muted' : 'bg-background'}`}
              onClick={() => setTab('preview')}
            >预览</button>
            <button
              className={`text-xs px-2 py-1 rounded border ${tab === 'source' ? 'bg-muted' : 'bg-background'}`}
              onClick={() => setTab('source')}
            >源码</button>
          </div>
          {tab === 'preview' ? (
            <div className="rounded-md border overflow-hidden" style={{ height: 360 }}>
              {previewHtml ? (
                <iframe
                  title="html-preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '100%', border: '0' }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  {toolInvocation.state === 'result' ? '无可预览内容' : '等待生成预览…'}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-muted p-2" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {finalHtml || liveArgsHtml || '（暂无源码）'}
              </pre>
            </div>
          )}
        </div>
        {result?.status === 'error' && (
          <div className="px-3 py-2 text-xs text-red-600">{result.error}</div>
        )}
        {result && result.status === 'success' && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            长度: {result.meta.length} 字符{result.meta.hasScript ? '，包含脚本' : ''}
          </div>
        )}
      </div>
    )
  },
})
