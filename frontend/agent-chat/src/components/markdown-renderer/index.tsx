import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const components: Components = React.useMemo(() => ({
    pre({ children }) {
      const child = Array.isArray(children) ? children[0] : children

      if (React.isValidElement(child) && child.type === 'code') {
        const codeElement = child as React.ReactElement<{ className?: string; children?: React.ReactNode }>
        const className = codeElement.props.className
        const match = /language-(\w+)/.exec(className || '')
        const raw = React.Children.toArray(codeElement.props.children)
          .map((chunk) => (typeof chunk === 'string' ? chunk : ''))
          .join('')
          .replace(/\n$/, '')

        if (match) {
          return (
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
              }}
            >
              {raw}
            </SyntaxHighlighter>
          )
        }

        return (
          <pre className="rounded-lg my-2 overflow-x-auto overflow-y-auto w-full max-w-full min-w-0 bg-muted p-2" style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <code className="text-sm whitespace-pre break-normal" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{raw}</code>
          </pre>
        )
      }

      return (
        <pre className="rounded-lg my-2 overflow-x-auto overflow-y-auto w-full max-w-full min-w-0 bg-muted p-2" style={{ maxWidth: '100%', overflowX: 'auto' }}>
          {children}
        </pre>
      )
    },
    code(props) {
      const { inline, className, children } = props as {
        inline?: boolean
        className?: string
        children?: React.ReactNode
      }
      const classNameValue = className || ''
      const raw = React.Children.toArray(children)
        .map((chunk) => (typeof chunk === 'string' ? chunk : ''))
        .join('')
        .replace(/\n$/, '')

      if (inline || !/language-/.test(classNameValue)) {
        return (
          <code
            className="bg-muted px-1.5 py-0.5 rounded text-sm break-words align-baseline"
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', display: 'inline', whiteSpace: 'normal' }}
          >
            {children}
          </code>
        )
      }

      const match = /language-(\w+)/.exec(classNameValue)

      if (match) {
        return (
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
            }}
          >
            {raw}
          </SyntaxHighlighter>
        )
      }

        return (
          <pre className="rounded-lg my-2 overflow-x-auto overflow-y-auto w-full max-w-full min-w-0 bg-muted p-2" style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <code className="text-sm whitespace-pre break-normal" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{raw}</code>
          </pre>
        )
    },
    p({ children, ...props }) {
      return <p className="mb-2 leading-relaxed break-words" {...props}>{children}</p>
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold mt-6 mb-4">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-lg font-bold mt-6 mb-4">{children}</h3>
    },
    ul({ children }) {
      return <ul className="list-disc pl-6 mb-4">{children}</ul>
    },
    ol({ children }) {
      return <ol className="list-decimal pl-6 mb-4">{children}</ol>
    },
    li({ children }) {
      return <li className="mb-1 leading-relaxed break-words">{children}</li>
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      )
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-border pl-4 my-4 py-1 bg-muted rounded-r">
          {children}
        </blockquote>
      )
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4 mb-2 rounded-lg border border-border shadow-sm">
          <table className="w-full border-collapse">
            {children}
          </table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-muted/50">{children}</thead>
    },
    tbody({ children }) {
      return <tbody className="divide-y divide-border">{children}</tbody>
    },
    tr({ children }) {
      return <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
    },
    th({ children }) {
      return (
        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
          {children}
        </td>
      )
    },
  }), [])

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none w-full max-w-full min-w-0 overflow-hidden" style={{ overflowX: 'hidden' }}>
      <style>{`
        .prose p:last-of-type { margin-bottom: 0 !important; }
        .prose pre { overflow-x: auto !important; max-width: 100% !important; }
        .prose code { overflow-wrap: anywhere !important; word-break: break-word !important; }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
