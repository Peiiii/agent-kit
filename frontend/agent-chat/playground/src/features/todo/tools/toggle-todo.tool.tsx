import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";
import React from "react";

export const createToggleTodoTool = ({
    toggleTodo,
}: {
    toggleTodo: (id: string) => Promise<void>
}): Tool => {
    return {
        name: 'toggleTodo',
        description: '切换待办事项的完成状态',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: '待办事项的ID',
                },
            },
            required: ['id'],
        },
        execute: async (toolCall) => {
            const args = JSON.parse(toolCall.function.arguments) as {
                id: string
            }
            const { id } = args
            await toggleTodo(id)
            return {
                toolCallId: toolCall.id,
                result: '待办事项状态已切换',
                status: 'success',
            }
        },
        render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
            const params = JSON.parse(toolCall.function.arguments) as {
                id: string
            }

            // 自动执行并返回结果
            React.useEffect(() => {
                const executeTool = async () => {
                    try {
                        await toggleTodo(params.id)
                        onResult({
                            toolCallId: toolCall.id,
                            result: { success: true },
                            status: 'success',
                        })
                    } catch (error) {
                        onResult({
                            toolCallId: toolCall.id,
                            result: { success: false, error: error instanceof Error ? error.message : '未知错误' },
                            status: 'error',
                        })
                    }
                }
                executeTool()
            }, [])

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">切换待办事项状态</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>待办事项ID:</strong> {params.id}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        正在自动切换待办事项状态...
                    </div>
                </div>
            )
        },
    }
}
