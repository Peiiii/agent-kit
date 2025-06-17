# UIMessage 类型文档

UIMessage 是一个用于在 UI 中展示消息的类型，它继承自 Message 类型并添加了一些额外的属性。

## 基本结构

```typescript
interface UIMessage extends Message {
  parts: Array<TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
}
```

## 消息部分类型

### TextUIPart
用于显示纯文本内容：
```typescript
type TextUIPart = {
  type: 'text';
  text: string;
};
```

### ReasoningUIPart
用于显示 AI 的推理过程：
```typescript
type ReasoningUIPart = {
  type: 'reasoning';
  reasoning: string;
  details: Array<{
    type: 'text';
    text: string;
    signature?: string;
  } | {
    type: 'redacted';
    data: string;
  }>;
};
```

### ToolInvocationUIPart
用于显示工具调用：
```typescript
type ToolInvocationUIPart = {
  type: 'tool-invocation';
  toolInvocation: ToolInvocation;
};
```

### SourceUIPart
用于显示来源信息：
```typescript
type SourceUIPart = {
  type: 'source';
  source: LanguageModelV1Source;
};
```

### FileUIPart
用于显示文件内容：
```typescript
type FileUIPart = {
  type: 'file';
  mimeType: string;
  data: string;
};
```

### StepStartUIPart
用于标记步骤的开始：
```typescript
type StepStartUIPart = {
  type: 'step-start';
};
```

## 使用场景

UIMessage 主要用于以下场景：
1. 在聊天界面中展示消息
2. 处理 AI 助手的响应
3. 展示工具调用的结果
4. 显示文件和其他附件

## 转换函数

使用 `convertMessagesToUIMessages` 函数可以将 Message 数组转换为 UIMessage 数组。这个函数会：
1. 保留原始消息的所有属性
2. 添加必要的 parts 数组
3. 确保消息格式符合 UI 展示需求 