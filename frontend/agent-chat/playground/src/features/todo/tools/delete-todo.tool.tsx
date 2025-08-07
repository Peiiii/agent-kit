import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";

export const createDeleteTodoTool = ({
    deleteTodo,
}: {
    deleteTodo: (id: string) => Promise<void>
}): Tool => {
    return {
        name: 'deleteTodo',
        description: '删除一个待办事项',
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
            await deleteTodo(id)
            return {
                toolCallId: toolCall.id,
                result: '待办事项已删除',
                status: 'success',
            }
        },
        render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
            const params = JSON.parse(toolCall.function.arguments) as {
                id: string
            }

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">删除待办事项</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>待办事项ID:</strong> {params.id}</p>
                        <p className="text-sm text-muted-foreground">
                            此操作不可撤销，请确认是否要删除此待办事项。
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded"
                            onClick={async () => {
                                await deleteTodo(params.id)
                                onResult({
                                    toolCallId: toolCall.id,
                                    result: { success: true },
                                    status: 'success',
                                })
                            }}
                        >
                            确认删除
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
