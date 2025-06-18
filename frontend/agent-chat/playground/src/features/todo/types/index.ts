export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
  /** 可选，开始时间，ISO字符串格式，例如: "2024-01-15T09:00:00Z" */
  startTime?: string
  /** 可选，结束时间，ISO字符串格式，例如: "2024-01-15T17:00:00Z" */
  endTime?: string
}

export interface TodoState {
  todos: Todo[]
  loading: boolean
  error: string | null
}

export interface AddTodoParams {
  title: string
  startTime?: string
  endTime?: string
}

export interface UpdateTodoParams {
  id: string
  title?: string
  startTime?: string
  endTime?: string
}

export interface TodoContextType {
  state: TodoState
  addTodo: (params: AddTodoParams) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  updateTodo: (params: UpdateTodoParams) => Promise<void>
  getTodoListContext: () => { todos: Todo[] }
} 