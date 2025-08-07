import { createAddTodoTool } from './add-todo.tool'
import { createToggleTodoTool } from './toggle-todo.tool'
import { createDeleteTodoTool } from './delete-todo.tool'
import { createUpdateTodoTool } from './update-todo.tool'
import { createListTodosTool } from './list-todos.tool'
import { useTodo } from '../hooks/use-todo'

export const createTodoTools = () => {
  const { addTodo, toggleTodo, deleteTodo, updateTodo, state } = useTodo()
  
  return [
    createAddTodoTool({ addTodo }),
    createToggleTodoTool({ toggleTodo }),
    createDeleteTodoTool({ deleteTodo }),
    createUpdateTodoTool({ updateTodo }),
    createListTodosTool({ state }),
  ]
}

export {
  createAddTodoTool,
  createToggleTodoTool,
  createDeleteTodoTool,
  createUpdateTodoTool,
  createListTodosTool,
}
