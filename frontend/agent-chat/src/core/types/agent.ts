/**
 * Agent Chat Core Types
 * 
 * This file defines the core interfaces and types for the Agent Chat system,
 * including the three tool execution patterns and their implementations.
 */

import type { ToolInvocation } from './ui-message'
import type { JSONSchema7 } from 'json-schema'
import type { ReactNode } from 'react'

export type ToolInvocationState = 'call' | 'result' | 'partial-call'

export interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  toolCallId: string
  result: string | boolean | number | object
  state: ToolInvocationState
  error?: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: JSONSchema7
}

/**
 * ToolRenderer interface for external tool renderers
 * Used when you want to provide custom rendering logic for tools
 * without modifying the original tool definition
 */
export interface ToolRenderer {
  render: ToolRenderFn
  definition: ToolDefinition
}

/**
 * ToolRenderFn type definition for rendering tool UI
 * 
 * @param tool - The tool invocation data containing parameters and state
 * @param onResult - Callback function to return tool execution results
 * @returns ReactNode - The rendered UI component
 * 
 * This function is called by the system to render the tool's UI.
 * For user-interaction tools, this is where you implement the execution logic
 * and call onResult() when the user completes the interaction.
 */
export type ToolRenderFn = (tool: ToolInvocation, onResult: (result: ToolResult) => void) => ReactNode

/**
 * Tool interface that supports three different execution patterns:
 * 
 * 1. Backend-Only Tools: Only implement render() function to display tool information
 *    - Used when tool execution is completely handled by backend
 *    - Frontend only displays tool status and information
 *    - Example: Database queries, file processing, etc.
 * 
 * 2. Frontend-Execution Tools: Implement both execute() and render() functions
 *    - execute() handles the actual tool logic and returns results
 *    - render() displays tool information and execution status
 *    - Suitable for lightweight operations like calculations, data processing
 *    - Example: Calculator, greeting generator, weather lookup, etc.
 * 
 * 3. User-Interaction Tools: Only implement render() function with execution logic
 *    - render() contains both UI and execution logic
 *    - Requires user input, confirmation, or decision
 *    - No execute() function needed as logic is embedded in render()
 *    - Example: User confirmation dialogs, file uploads, permission checks, etc.
 * 
 * Choose the appropriate pattern based on:
 * - Whether tool needs user interaction
 * - Where the execution should happen (frontend vs backend)
 * - Performance requirements and security considerations
 */
export interface Tool extends ToolDefinition {
  /**
   * Optional execute function for frontend-execution tools
   * Executes the tool logic and returns the result
   * Should not be implemented for backend-only or user-interaction tools
   */
  execute?: (toolCall: ToolCall) => Promise<ToolResult>
  
  /**
   * Optional render function for all tool types
   * - Backend-only tools: Display tool information
   * - Frontend-execution tools: Display execution status
   * - User-interaction tools: Display UI and handle user input
   */
  render?: ToolRenderFn
}

export interface Context {
  description: string
  value: string
}
