import { ToolRenderer, ToolCall, ToolResult } from '@agent-labs/agent-chat'
import { useTodo } from './hooks/use-todo'
import { Checkbox } from '@/components/ui/checkbox'

export const todoToolRenderers: Record<string, ToolRenderer> = {
  addTodo: {
    render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
      const { addTodo } = useTodo()
      const { title } = JSON.parse(toolCall.function.arguments) as { title: string }

      return (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">添加待办事项</h3>
          <p className="mb-4">标题: {title}</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={async () => {
                await addTodo(title)
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
    definition: {
      name: 'addTodo',
      description: '添加一个新的待办事项',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '待办事项的标题',
          },
        },
        required: ['title'],
      },
    },
  },

  toggleTodo: {
    render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
      const { toggleTodo } = useTodo()
      const { id } = JSON.parse(toolCall.function.arguments) as { id: string }

      return (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">切换待办事项状态</h3>
          <p className="mb-4">ID: {id}</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={async () => {
                await toggleTodo(id)
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
    definition: {
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
    },
  },

  deleteTodo: {
    render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
      const { deleteTodo } = useTodo()
      const { id } = JSON.parse(toolCall.function.arguments) as { id: string }

      return (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">删除待办事项</h3>
          <p className="mb-4">ID: {id}</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={async () => {
                await deleteTodo(id)
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
    definition: {
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
    },
  },

  updateTodo: {
    render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
      const { updateTodo } = useTodo()
      const { id, title } = JSON.parse(toolCall.function.arguments) as {
        id: string
        title: string
      }

      return (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">更新待办事项</h3>
          <p className="mb-4">ID: {id}</p>
          <p className="mb-4">新标题: {title}</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={async () => {
                await updateTodo(id, title)
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
    definition: {
      name: 'updateTodo',
      description: '更新待办事项的标题',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '待办事项的ID',
          },
          title: {
            type: 'string',
            description: '新的标题',
          },
        },
        required: ['id', 'title'],
      },
    },
  },

  listTodos: {
    render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => {
      const { state } = useTodo()

      return (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold mb-2">待办事项列表</h3>
          <div className="space-y-2">
            {state.todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <Checkbox
                  checked={todo.completed}
                  readOnly
                />
                <span
                  className={`flex-1 ${
                    todo.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={() => {
                onResult({
                  toolCallId: toolCall.id,
                  result: { todos: state.todos },
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
    definition: {
      name: 'listTodos',
      description: '获取所有待办事项列表',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
} 