export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface TodoState {
  todos: Todo[]
  loading: boolean
  error: string | null
}

export interface TodoContextType {
  state: TodoState
  addTodo: (title: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  updateTodo: (id: string, title: string) => Promise<void>
} 