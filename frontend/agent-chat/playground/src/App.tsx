import { HttpAgent } from '@ag-ui/client'
import { AgentChatCore, useProvideAgentContexts, useProvideAgentToolExecutors } from '@agent-labs/agent-chat'
import type { Message } from '@ag-ui/client'
import { VSCodeLayout } from "composite-kit"
import { Bell, GitBranch as BranchIcon, CheckCircle, ChevronDown, Folder, GitBranch, LayoutGrid, Play, Search, Wifi, Zap } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { InstructionSettings } from './features/settings/components/instruction-settings'
import { TodoList } from './features/todo/components/todo-list'
import { TodoProvider, useTodo } from './features/todo/hooks/use-todo'
import { createTodoToolRenderers } from './features/todo/tool-renderers'
import { todoTools } from './features/todo/tools'

const { Activity,
  Controls,
  Editor,
  Layout,
  Panel,
  Status,
  Utils,
  Workspace,
} = VSCodeLayout

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

// 解决类型导入问题，直接声明 AgentChatRef
interface AgentChatRef {
  reset: () => void
  addMessages: (
    messages: Message[],
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
}

function AgentChatWithContext({ allInstructions, agentChatRef }: { allInstructions: Array<{ description: string; value: string }>, agentChatRef: React.RefObject<AgentChatRef | null> }) {
  const { state, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodo()
  const todoListContext = useMemo(() => ({
    todos: state.todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      startTime: todo.startTime,
      endTime: todo.endTime
    }))
  }), [state.todos])

  useProvideAgentContexts([
    {
      description: '待办事项列表',
      value: JSON.stringify(todoListContext),
    },
  ])

  // 注册 listTodos executor
  useProvideAgentToolExecutors({
    listTodos: (toolCall) => {
      return {
        toolCallId: toolCall.id,
        result: { todos: state.todos },
        status: 'success',
      }
    },
  })

  const todoToolRenderers = useMemo(() => createTodoToolRenderers({
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    state
  }), [addTodo, toggleTodo, deleteTodo, updateTodo, state])

  return (
    <AgentChatCore
      ref={agentChatRef}
      agent={agent}
      defaultToolDefs={todoTools}
      defaultToolRenderers={todoToolRenderers}
      defaultContexts={allInstructions}
      className='flex-1 overflow-y-auto'
    />
  )
}

export function App() {
  // 使用 Hook 管理面板状态
  const leftPanel = Utils.usePanelControls()
  const rightPanel = Utils.usePanelControls()
  const bottomPanel = Utils.usePanelControls()

  const [activeActivityItem, setActiveActivityItem] = useState("explorer")
  const [isActivityBarExpanded, setIsActivityBarExpanded] = useState(false)

  // 定义系统指令和用户偏好
  const defaultInstructions = useMemo(() => [
    {
      description: '系统设置',
      value: JSON.stringify({
        language: 'zh-CN',
        responseStyle: 'professional',
        maxResponseLength: 1000,
        enableCodeHighlight: true,
        enableMarkdown: true,
      }),
    },
    {
      description: '用户偏好',
      value: JSON.stringify({
        name: '张三',
        role: 'developer',
        preferences: {
          conciseResponses: true,
          technicalLevel: 'advanced',
          preferredTopics: ['编程', '技术', '效率工具'],
        },
      }),
    },
    {
      description: '系统环境',
      value: JSON.stringify({
        os: 'macOS',
        version: '12.0',
        environment: 'development',
      }),
    },
    {
      description: "当前时间",
      value: JSON.stringify({
        time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      }),
    },
    {
      description: 'AI 助手行为指南',
      value: JSON.stringify({
        personality: '专业、友好、高效',
        responseFormat: {
          codeBlocks: true,
          bulletPoints: true,
          examples: true,
        },
        constraints: [
          '保持回答简洁明了',
          '优先使用中文回答',
          '提供具体的代码示例',
          '解释关键概念',
        ],
      }),
    },
  ], [])

  const [customInstructions, setCustomInstructions] = useState<Array<{ description: string; value: string }>>([])

  const allInstructions = useMemo(() => {
    return [...defaultInstructions, ...customInstructions]
  }, [defaultInstructions, customInstructions])

  // 活动栏数据
  const activityItems = [
    {
      id: "explorer",
      icon: <Folder className="h-5 w-5" />,
      title: "资源管理器",
    },
    { id: "search", icon: <Search className="h-5 w-5" />, title: "搜索" },
    { id: "git", icon: <GitBranch className="h-5 w-5" />, title: "源代码管理" },
    { id: "debug", icon: <Play className="h-5 w-5" />, title: "运行和调试" },
    {
      id: "extensions",
      icon: <LayoutGrid className="h-5 w-5" />,
      title: "扩展",
    },
  ]

  const agentChatRef = useRef<AgentChatRef | null>(null)

  // 拍一拍业务逻辑
  const handlePoke = async () => {
    if (agentChatRef.current?.addMessages) {
      await agentChatRef.current.addMessages([
        {
          id: uuidv4(),
          role: 'system',
          content: `用户使用了"拍一拍"功能唤醒AI助手。这通常表示用户想要开始对话但不知道说什么，或者希望AI主动提供帮助。请以友好、热情的方式回应，可以：\n1. 简单打招呼并询问如何帮助\n2. 根据当前上下文（如待办事项、时间等）主动提供建议\n3. 介绍一些你能提供的功能\n\n请保持回答简洁、友好且有用。`,
        },
        {
          id: uuidv4(),
          role: 'user',
          content: '[action:poke]',
        },
      ], { triggerAgent: true })
    }
  }

  return (
    <TodoProvider>
      <Workspace.Layout>
        <Controls.Layout
          onToggleLeftSidebar={leftPanel.toggle}
          onToggleRightSidebar={rightPanel.toggle}
          onToggleBottomPanel={bottomPanel.toggle}
          isLeftSidebarCollapsed={leftPanel.isCollapsed}
          isRightSidebarCollapsed={rightPanel.isCollapsed}
          isBottomPanelCollapsed={bottomPanel.isCollapsed}
        />
        <Layout.Main>
          <Activity.Bar
            isExpanded={isActivityBarExpanded}
            onToggle={() => setIsActivityBarExpanded(!isActivityBarExpanded)}
            expandable={true}
          >
            {activityItems.map((item) => (
              <Activity.Item
                key={item.id}
                icon={item.icon}
                title={item.title}
                isActive={activeActivityItem === item.id}
                onClick={() => setActiveActivityItem(item.id)}
                isExpanded={isActivityBarExpanded}
                expandable={true}
              />
            ))}
          </Activity.Bar>

          <Layout.MainContent>
            <Layout.Horizontal>
              <Layout.Sidebar
                ref={leftPanel.ref}
                onCollapse={leftPanel.collapse}
                onExpand={leftPanel.expand}
              >
                <Workspace.Panel
                  title="待办事项"
                  isCollapsed={leftPanel.isCollapsed}
                  onCollapse={leftPanel.collapse}
                  onExpand={leftPanel.expand}
                >
                  <Panel.Content>
                    <TodoList />
                  </Panel.Content>
                </Workspace.Panel>
              </Layout.Sidebar>

              <Layout.ResizeHandle />

              <Panel.Resizable>
                <Layout.Vertical>
                  <Panel.Resizable>
                    <Workspace.Panel>
                      <Editor.Header>
                        <div className="flex items-center justify-between w-full">
                          <Editor.Tab
                            title="AI 助手"
                            isActive={true}
                          />
                          <button
                            onClick={handlePoke}
                            className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs border border-muted bg-muted hover:bg-accent transition-colors"
                            title="拍一拍唤醒 AI 助手"
                            style={{ lineHeight: 1 }}
                          >
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>拍一拍</span>
                          </button>
                        </div>
                      </Editor.Header>
                      <Editor.Content>
                        <div className="relative h-full flex flex-col">
                          <InstructionSettings
                            onInstructionsChange={setCustomInstructions}
                          />
                          <AgentChatWithContext allInstructions={allInstructions} agentChatRef={agentChatRef} />
                        </div>
                      </Editor.Content>
                    </Workspace.Panel>
                  </Panel.Resizable>

                  {/* <Layout.ResizeHandle orientation="horizontal" />

                  <Layout.Sidebar
                    ref={bottomPanel.ref}
                    defaultSize={25}
                    onCollapse={bottomPanel.collapse}
                    onExpand={bottomPanel.expand}
                  >
                    <Workspace.Panel
                      title="设置"
                      isCollapsed={bottomPanel.isCollapsed}
                      onCollapse={bottomPanel.collapse}
                      onExpand={bottomPanel.expand}
                    >
                      <Panel.Content>
                        <div className="p-4">
                          <ThemeSwitcher
                            themes={[
                              'light',
                              'dark',
                              'material',
                              'nord',
                              'dracula',
                              'one-dark',
                              'tokyo-night',
                              'catppuccin',
                              'wechat',
                              'telegram',
                              'github',
                              'twitter',
                              'discord',
                              'notion',
                              'monokai-pro',
                              'gruvbox',
                              'solarized',
                              'aurora',
                              'forest',
                              'ocean',
                              'starlight',
                              'desert',
                              'neon',
                              'ink-wash',
                              'sakura',
                              'moonlight',
                              'bamboo',
                              'landscape',
                              'autumn',
                            ]}
                          >
                            <ThemeSwitcher.Dropdown />
                          </ThemeSwitcher>
                        </div>
                      </Panel.Content>
                    </Workspace.Panel>
                  </Layout.Sidebar> */}
                </Layout.Vertical>
              </Panel.Resizable>

              <Layout.ResizeHandle />

              <Layout.Sidebar
                ref={rightPanel.ref}
                onCollapse={rightPanel.collapse}
                onExpand={rightPanel.expand}
              >
                <Workspace.Panel
                  title="指令设置"
                  isCollapsed={rightPanel.isCollapsed}
                  onCollapse={rightPanel.collapse}
                  onExpand={rightPanel.expand}
                >
                  <Panel.Content>
                    <div className="p-4">
                      <h3 className="text-sm font-medium mb-2">系统指令</h3>
                      {defaultInstructions.map((instruction, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex items-center mb-1">
                            <ChevronDown className="h-3 w-3 mr-1" />
                            <span className="text-sm font-medium">
                              {instruction.description}
                            </span>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {instruction.value}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </Panel.Content>
                </Workspace.Panel>
              </Layout.Sidebar>
            </Layout.Horizontal>
          </Layout.MainContent>
        </Layout.Main>

        <Status.Bar>
          <Status.Group>
            <Status.IconItem
              icon={<BranchIcon className="h-3.5 w-3.5" />}
              label="main"
            />
            <Status.IconItem
              icon={<CheckCircle className="h-3.5 w-3.5 text-green-500" />}
              label="就绪"
            />
          </Status.Group>
          <Status.Group>
            <Status.Item>UTF-8</Status.Item>
            <Status.Item>TSX</Status.Item>
            <Status.Item>
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            </Status.Item>
            <Status.Item>
              <Bell className="h-3.5 w-3.5" />
            </Status.Item>
          </Status.Group>
        </Status.Bar>
      </Workspace.Layout>
    </TodoProvider>
  )
}
