# Agent Chat 工具架构说明

本目录包含了三种不同模式的工具实现，展示了 Agent Chat 系统的灵活性和强大功能。

## 工具模式分类

### 1. 纯后端工具 (Backend-Only Tools)
- **特点**: 只需要 `render` 函数来展示工具信息
- **用途**: 工具执行完全由后端处理，前端只负责展示
- **示例**: 数据库查询、文件处理等

```typescript
export const createBackendOnlyTool = (): Tool => ({
    name: 'backendTool',
    description: '后端执行的工具',
    parameters: { /* ... */ },
    // 没有 execute 函数
    render: (toolInvocation, onResult) => {
        return <div>工具信息展示</div>
    }
})
```

### 2. 前端执行工具 (Frontend-Execution Tools)
- **特点**: 有 `execute` 函数执行工具，`render` 函数展示工具信息
- **用途**: 工具逻辑在前端执行，适合计算、数据处理等
- **示例**: 计算器、问候语生成、天气查询等

```typescript
export const createFrontendTool = (): Tool => ({
    name: 'frontendTool',
    description: '前端执行的工具',
    parameters: { /* ... */ },
    execute: async (toolCall) => {
        // 执行工具逻辑
        return { toolCallId: toolCall.id, result: '结果', status: 'success' }
    },
    render: (toolInvocation, onResult) => {
        return <div>工具已执行，结果已返回给AI助手</div>
    }
})
```

### 3. 用户介入工具 (User-Interaction Tools)
- **特点**: 只有 `render` 函数，但包含执行逻辑和用户交互
- **用途**: 需要用户确认、输入或决策的工具
- **示例**: 用户确认、文件上传、权限验证等

```typescript
export const createUserInteractionTool = (): Tool => ({
    name: 'userInteractionTool',
    description: '需要用户介入的工具',
    parameters: { /* ... */ },
    // 没有 execute 函数
    render: (toolInvocation, onResult) => {
        const [state, setState] = useState()
        
        const handleUserAction = async () => {
            // 执行逻辑
            onResult({ toolCallId: toolInvocation.toolCallId, result: '结果', status: 'success' })
        }
        
        return (
            <div>
                <button onClick={handleUserAction}>用户操作</button>
            </div>
        )
    }
})
```

## 当前实现的工具

### 前端执行工具
1. **计算器工具** (`calculator.tool.tsx`)
   - 执行数学表达式计算
   - 自动执行并返回结果

2. **问候工具** (`greeting.tool.tsx`)
   - 根据姓名和时间生成问候语
   - 自动执行并返回结果

3. **天气工具** (`weather.tool.tsx`)
   - 查询城市天气信息
   - 自动执行并返回结果

### 用户介入工具
4. **用户确认工具** (`user-confirmation.tool.tsx`)
   - 请求用户确认操作
   - 包含确认/拒绝按钮和状态管理

## 使用建议

- **选择工具模式**: 根据工具是否需要用户交互来选择
- **性能考虑**: 前端执行工具适合轻量级操作，后端工具适合重计算
- **用户体验**: 用户介入工具提供更好的交互体验
- **错误处理**: 所有工具都应包含适当的错误处理逻辑

## 扩展指南

添加新工具时：
1. 确定工具模式
2. 实现相应的函数（execute 和/或 render）
3. 在 `index.ts` 中导出
4. 在主演示文件中注册
5. 测试工具功能
