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