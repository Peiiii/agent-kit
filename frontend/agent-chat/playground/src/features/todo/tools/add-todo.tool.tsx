import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";

export const createAddTodoTool = ({
    addTodo,
}: {
    addTodo: (params: { title: string; startTime?: string; endTime?: string }) => Promise<void>
}): Tool => {
    return {
        name: 'addTodo',
        description: '添加一个新的待办事项',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: '待办事项的标题',
                },
                startTime: {
                    type: 'string',
                    description: '开始时间（可选），ISO字符串格式，例如: "2024-01-15T09:00:00Z"',
                },
                endTime: {
                    type: 'string',
                    description: '结束时间（可选），ISO字符串格式，例如: "2024-01-15T17:00:00Z"',
                },
            },
            required: ['title'],
        },
        execute: async (toolCall) => {
            const args = JSON.parse(toolCall.function.arguments) as {
                title: string
                startTime?: string
                endTime?: string
            }
            const { title, startTime, endTime } = args
            await addTodo({ title, startTime, endTime })
            return {
                toolCallId: toolCall.id,
                result: '待办事项已添加',
                status: 'success',
            }
        },
        render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
            const params = JSON.parse(toolCall.function.arguments) as {
                title: string
                startTime?: string
                endTime?: string
            }

            const formatDateTime = (dateTimeString?: string) => {
                if (!dateTimeString) return ''
                return new Date(dateTimeString).toLocaleString('zh-CN')
            }

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">添加待办事项</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>标题:</strong> {params.title}</p>
                        {params.startTime && (
                            <p><strong>开始时间:</strong> {formatDateTime(params.startTime)}</p>
                        )}
                        {params.endTime && (
                            <p><strong>结束时间:</strong> {formatDateTime(params.endTime)}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-primary text-primary-foreground rounded"
                            onClick={async () => {
                                await addTodo(params)
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