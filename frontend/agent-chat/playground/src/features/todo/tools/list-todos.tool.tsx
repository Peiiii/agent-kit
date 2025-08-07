import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";
import { Checkbox } from "@/components/ui/checkbox";

export const createListTodosTool = ({
    state,
}: {
    state: { todos: Array<{ id: string; title: string; completed: boolean; startTime?: string; endTime?: string }> }
}): Tool => {
    return {
        name: 'listTodos',
        description: '列出所有待办事项',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
        execute: async (toolCall) => {
            const todosList = state.todos.map(todo => ({
                id: todo.id,
                title: todo.title,
                completed: todo.completed,
                startTime: todo.startTime,
                endTime: todo.endTime
            }))
            return {
                toolCallId: toolCall.id,
                result: JSON.stringify(todosList, null, 2),
                status: 'success',
            }
        },
        render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
            const formatDateTime = (dateTimeString?: string) => {
                if (!dateTimeString) return ''
                return new Date(dateTimeString).toLocaleString('zh-CN')
            }

            return (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">待办事项列表</h3>
                    <div className="space-y-2">
                        {state.todos.length === 0 ? (
                            <p className="text-muted-foreground">暂无待办事项</p>
                        ) : (
                            state.todos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-center gap-2 p-2 border rounded"
                                >
                                    <Checkbox
                                        checked={todo.completed}
                                        readOnly
                                    />
                                    <div className="flex-1">
                                        <span
                                            className={`${
                                                todo.completed ? 'line-through text-muted-foreground' : ''
                                            }`}
                                        >
                                            {todo.title}
                                        </span>
                                        {(todo.startTime || todo.endTime) && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {todo.startTime && (
                                                    <span>开始: {formatDateTime(todo.startTime)}</span>
                                                )}
                                                {todo.startTime && todo.endTime && <span> | </span>}
                                                {todo.endTime && (
                                                    <span>结束: {formatDateTime(todo.endTime)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="px-4 py-2 bg-primary text-primary-foreground rounded"
                            onClick={() => {
                                onResult({
                                    toolCallId: toolCall.id,
                                    result: { success: true },
                                    status: 'success',
                                })
                            }}
                        >
                            确认
                        </button>
                    </div>
                </div>
            )
        },
    }
}
