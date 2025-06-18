import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Todo, TodoState, TodoContextType } from '../types'
import { useLocalStorage } from '@/hooks/use-local-storage'

const STORAGE_KEY = 'todoList'

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
}

type TodoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: { id: string; title: string } }

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_TODOS':
      return { ...state, todos: action.payload }
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      }
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      }
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, title: action.payload.title }
            : todo
        ),
      }
    default:
      return state
  }
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState)

  // 使用 useLocalStorage Hook 管理待办事项列表
  const { data: todos, setData: setTodos } = useLocalStorage<Todo[]>({
    key: STORAGE_KEY,
    initialValue: [],
    onLoad: (loadedTodos) => {
      dispatch({ type: 'SET_TODOS', payload: loadedTodos })
    },
    onSave: (savedTodos) => {
      dispatch({ type: 'SET_TODOS', payload: savedTodos })
    },
  })

  // 获取 TodoList 上下文数据
  const getTodoListContext = () => {
    return {
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      }))
    }
  }

  const addTodo = async (title: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updatedTodos = [...todos, newTodo]
      setTodos(updatedTodos)
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '添加待办事项失败',
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const toggleTodo = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
      setTodos(updatedTodos)
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '更新待办事项失败',
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedTodos = todos.filter((todo) => todo.id !== id)
      setTodos(updatedTodos)
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '删除待办事项失败',
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateTodo = async (id: string, title: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, title } : todo
      )
      setTodos(updatedTodos)
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '更新待办事项失败',
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <TodoContext.Provider
      value={{
        state: { ...state, todos },
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
        getTodoListContext,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export function useTodo() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
} 