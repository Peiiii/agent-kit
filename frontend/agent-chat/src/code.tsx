import * as React from 'react'
import { Badge } from './components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import type { ToolCall, ToolDefinition, ToolRenderer } from './types/agent'

export const codeTool: ToolDefinition = {
  name: 'generate_code',
  description: '生成代码',
  parameters: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        description: '编程语言',
      },
      task: {
        type: 'string',
        description: '代码任务描述',
      },
      code: {
        type: 'string',
        description: '生成的代码',
      },
    },
    required: ['language', 'task', 'code'],
  },
}

export const codeRenderer: ToolRenderer = {
  definition: codeTool,
  render: ({ function: { arguments: argsStr } }: ToolCall) => {
    try {
      const args = JSON.parse(argsStr)
      return (
        <div className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">生成的代码</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{args.language}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {args.task}
                  </span>
                </div>
                <pre className="rounded-md bg-muted p-4 text-sm">
                  <code>{args.code}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    } catch (error) {
      console.error('Error rendering code:', error)
      return null
    }
  },
}
