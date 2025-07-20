import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // @ts-expect-error - ReactMarkdown components type issue
          code({ inline, className, children }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg my-2"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                {children}
              </code>
            )
          },
          p({ children }) {
            return <p className="mb-2 leading-relaxed">{children}</p>
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
            return <li className="mb-1 leading-relaxed">{children}</li>
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
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-border p-2 bg-muted text-left">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-border p-2">{children}</td>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
