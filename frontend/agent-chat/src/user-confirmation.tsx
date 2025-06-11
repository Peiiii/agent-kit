import * as React from 'react'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import type {
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult,
} from './types'

export const userConfirmationTool: ToolDefinition = {
  name: 'user_confirmation',
  description: '请求用户确认某个操作',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: '需要用户确认的消息',
      },
      importance: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: '操作的重要程度',
      },
    },
    required: ['message'],
  },
}

export const userConfirmationRenderer: ToolRenderer = {
  definition: userConfirmationTool,
  render: (
    { id, function: { arguments: argsStr } }: ToolCall,
    onResult: (result: ToolResult) => void,
  ) => {
    try {
      const args = JSON.parse(argsStr)
      const getImportanceVariant = (importance?: string) => {
        switch (importance) {
          case 'critical':
            return 'destructive'
          case 'high':
            return 'secondary'
          case 'medium':
            return 'outline'
          default:
            return 'default'
        }
      }

      const handleConfirm = () => {
        onResult({
          toolCallId: id,
          result: true,
          status: 'success',
        })
      }

      const handleCancel = () => {
        onResult({
          toolCallId: id,
          result: false,
          status: 'cancelled',
        })
      }

      return (
        <div className="mt-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">需要确认</CardTitle>
              <Badge variant={getImportanceVariant(args.importance)}>
                {args.importance || 'low'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {args.message || '请确认是否继续？'}
                </p>
                <div className="flex space-x-2">
                  <Button variant="default" size="sm" onClick={handleConfirm}>
                    确认
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    } catch (error) {
      console.error('Error rendering user confirmation:', error)
      onResult({
        toolCallId: id,
        result: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  },
}
