# MessageInput 上方组件支持

## 概述

现在 `AgentChatCore` 和 `AgentChatWindow` 组件支持在 MessageInput 上方添加自定义组件。这个功能允许开发者在聊天输入框上方添加快速操作按钮、状态指示器或其他交互元素。

## 使用方法

### 基本用法

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'

function MyChatApp() {
  return (
    <AgentChatCore
      agent={agent}
      tools={tools}
      aboveInputComponent={
        <div className="p-2 bg-blue-50 rounded-lg border">
          <p className="text-sm text-blue-600">快速操作区域</p>
        </div>
      }
    />
  )
}
```

### 高级用法 - 快速操作按钮

```tsx
import { AgentChatCore, AgentChatRef } from '@agent-labs/agent-chat'
import { useRef } from 'react'

function MyChatApp() {
  const agentChatRef = useRef<AgentChatRef>(null)

  const quickActions = (
    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">快速操作</span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => {
            agentChatRef.current?.addMessages([
              {
                id: uuidv4(),
                role: 'user',
                parts: [{ type: 'text', text: '帮我总结一下今天的待办事项' }],
              },
            ], { triggerAgent: true })
          }}
          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          总结待办
        </button>
        <button
          onClick={() => {
            agentChatRef.current?.addMessages([
              {
                id: uuidv4(),
                role: 'user',
                parts: [{ type: 'text', text: '帮我创建一个新的待办事项' }],
              },
            ], { triggerAgent: true })
          }}
          className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >
          新建待办
        </button>
      </div>
    </div>
  )

  return (
    <AgentChatCore
      ref={agentChatRef}
      agent={agent}
      tools={tools}
      aboveInputComponent={quickActions}
    />
  )
}
```

### 状态指示器示例

```tsx
function StatusIndicator({ isConnected, lastActivity }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isConnected ? '已连接' : '连接断开'}
        </span>
      </div>
      {lastActivity && (
        <span className="text-xs text-gray-500">
          最后活动: {lastActivity}
        </span>
      )}
    </div>
  )
}

// 使用
<AgentChatCore
  agent={agent}
  tools={tools}
  aboveInputComponent={<StatusIndicator isConnected={true} lastActivity="2分钟前" />}
/>
```

## API 参考

### AgentChatProps

```tsx
interface AgentChatProps {
  // ... 其他 props
  aboveInputComponent?: React.ReactNode
}
```

### ChatInterfaceProps

```tsx
interface ChatInterfaceProps {
  // ... 其他 props
  aboveInputComponent?: React.ReactNode
}
```

## 注意事项

1. **样式建议**: 建议使用与聊天界面一致的样式，包括深色模式支持
2. **响应式设计**: 确保组件在不同屏幕尺寸下都能正常显示
3. **性能考虑**: 避免在 `aboveInputComponent` 中使用过于复杂的组件或频繁更新的状态
4. **可访问性**: 确保添加的组件符合可访问性标准

## 示例项目

查看 `playground/src/App.tsx` 中的完整示例，了解如何在实际项目中使用这个功能。

