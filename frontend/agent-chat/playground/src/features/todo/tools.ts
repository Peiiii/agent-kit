import { ToolDefinition } from '@agent-labs/agent-chat'

export const todoTools: ToolDefinition[] = [
  {
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
  {
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
  {
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
  {
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
  {
    name: 'listTodos',
    description: '列出所有待办事项',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
] 