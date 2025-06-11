Tool Structure
Tools follow a consistent structure that defines their name, purpose, and expected parameters:


Copy
interface Tool {
  name: string // Unique identifier for the tool
  description: string // Human-readable explanation of what the tool does
  parameters: {
    // JSON Schema defining the tool's parameters
    type: "object"
    properties: {
      // Tool-specific parameters
    }
    required: string[] // Array of required parameter names
  }
}
The parameters field uses JSON Schema to define the structure of arguments that the tool accepts. This schema is used by both the agent (to generate valid tool calls) and the frontend (to validate and parse tool arguments).

​
Frontend-Defined Tools
A key aspect of AG-UI’s tool system is that tools are defined in the frontend and passed to the agent during execution:


Copy
// Define tools in the frontend
const userConfirmationTool = {
  name: "confirmAction",
  description: "Ask the user to confirm a specific action before proceeding",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "The action that needs user confirmation",
      },
      importance: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        description: "The importance level of the action",
      },
    },
    required: ["action"],
  },
}

// Pass tools to the agent during execution
agent.runAgent({
  tools: [userConfirmationTool],
  // Other parameters...
})
This approach has several advantages:

Frontend control: The frontend determines what capabilities are available to the agent
Dynamic capabilities: Tools can be added or removed based on user permissions, context, or application state
Separation of concerns: Agents focus on reasoning while frontends handle tool implementation
Security: Sensitive operations are controlled by the application, not the agent
​
Tool Call Lifecycle
When an agent needs to use a tool, it follows a standardized sequence of events:

ToolCallStart: Indicates the beginning of a tool call with a unique ID and tool name


Copy
{
  type: EventType.TOOL_CALL_START,
  toolCallId: "tool-123",
  toolCallName: "confirmAction",
  parentMessageId: "msg-456" // Optional reference to a message
}
ToolCallArgs: Streams the tool arguments as they’re generated


Copy
{
  type: EventType.TOOL_CALL_ARGS,
  toolCallId: "tool-123",
  delta: '{"act' // Partial JSON being streamed
}

Copy
{
  type: EventType.TOOL_CALL_ARGS,
  toolCallId: "tool-123",
  delta: 'ion":"Depl' // More JSON being streamed
}

Copy
{
  type: EventType.TOOL_CALL_ARGS,
  toolCallId: "tool-123",
  delta: 'oy the application to production"}' // Final JSON fragment
}
ToolCallEnd: Marks the completion of the tool call


Copy
{
  type: EventType.TOOL_CALL_END,
  toolCallId: "tool-123"
}
The frontend accumulates these deltas to construct the complete tool call arguments. Once the tool call is complete, the frontend can execute the tool and provide results back to the agent.

​
Tool Results
After a tool has been executed, the result is sent back to the agent as a “tool message”:


Copy
{
  id: "result-789",
  role: "tool",
  content: "true", // Tool result as a string
  toolCallId: "tool-123" // References the original tool call
}
This message becomes part of the conversation history, allowing the agent to reference and incorporate the tool’s result in subsequent responses.

​
Human-in-the-Loop Workflows
The AG-UI tool system is especially powerful for implementing human-in-the-loop workflows. By defining tools that request human input or confirmation, developers can create AI experiences that seamlessly blend autonomous operation with human judgment.

For example:

Agent needs to make an important decision
Agent calls the confirmAction tool with details about the decision
Frontend displays a confirmation dialog to the user
User provides their input
Frontend sends the user’s decision back to the agent
Agent continues processing with awareness of the user’s choice
This pattern enables use cases like:

Approval workflows: AI suggests actions that require human approval
Data verification: Humans verify or correct AI-generated data
Collaborative decision-making: AI and humans jointly solve complex problems
Supervised learning: Human feedback improves future AI decisions
​
