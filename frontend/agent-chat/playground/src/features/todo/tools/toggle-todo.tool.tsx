import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";

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

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">切换待办事项状态</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>待办事项ID:</strong> {params.id}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-primary text-primary-foreground rounded"
                            onClick={async () => {
                                await toggleTodo(params.id)
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
