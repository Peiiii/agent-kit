import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";

export const createUpdateTodoTool = ({
    updateTodo,
}: {
    updateTodo: (params: { id: string; title?: string; startTime?: string; endTime?: string }) => Promise<void>
}): Tool => {
    return {
        name: 'updateTodo',
        description: '更新待办事项的信息',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: '待办事项的ID',
                },
                title: {
                    type: 'string',
                    description: '新的标题（可选）',
                },
                startTime: {
                    type: 'string',
                    description: '新的开始时间（可选），ISO字符串格式，例如: "2024-01-15T09:00:00Z"。如果要清空开始时间，请传入空字符串 ""',
                },
                endTime: {
                    type: 'string',
                    description: '新的结束时间（可选），ISO字符串格式，例如: "2024-01-15T17:00:00Z"。如果要清空结束时间，请传入空字符串 ""',
                },
            },
            required: ['id'],
        },
        execute: async (toolCall) => {
            const args = JSON.parse(toolCall.function.arguments) as {
                id: string
                title?: string
                startTime?: string
                endTime?: string
            }
            const { id, title, startTime, endTime } = args
            await updateTodo({ id, title, startTime, endTime })
            return {
                toolCallId: toolCall.id,
                result: '待办事项已更新',
                status: 'success',
            }
        },
        render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
            const params = JSON.parse(toolCall.function.arguments) as {
                id: string
                title?: string
                startTime?: string
                endTime?: string
            }

            const formatDateTime = (dateTimeString?: string) => {
                if (!dateTimeString) return ''
                return new Date(dateTimeString).toLocaleString('zh-CN')
            }

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">更新待办事项</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>待办事项ID:</strong> {params.id}</p>
                        {params.title && (
                            <p><strong>新标题:</strong> {params.title}</p>
                        )}
                        {params.startTime !== undefined && (
                            <p><strong>新开始时间:</strong> {params.startTime === '' ? '清空' : formatDateTime(params.startTime)}</p>
                        )}
                        {params.endTime !== undefined && (
                            <p><strong>新结束时间:</strong> {params.endTime === '' ? '清空' : formatDateTime(params.endTime)}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-primary text-primary-foreground rounded"
                            onClick={async () => {
                                await updateTodo(params)
                                onResult({
                                    toolCallId: toolCall.id,
                                    result: { success: true },
                                    status: 'success',
                                })
                            }}
                        >
                            确认
                        </button>
                        <button
                            className="px-4 py-2 border rounded"
                            onClick={() => {
                                onResult({
                                    toolCallId: toolCall.id,
                                    result: { success: false },
                                    status: 'error',
                                })
                            }}
                        >
                            取消
                        </button>
                    </div>
                </div>
            )
        },
    }
}
