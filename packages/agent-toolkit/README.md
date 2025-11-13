# @agent-labs/agent-toolkit

Pure logic toolkit for agent streaming, tool orchestration, and argument accumulation.

What it provides
- JSON args accumulator: tolerant to partial/incomplete chunks
- Tool registry/executor: define tools, register, execute with timeout/abort
- Streaming adapters: convert provider chunk streams to core agent events via RxJS

Install

```bash
pnpm add @agent-labs/agent-toolkit
```

Basic usage

```ts
import { ArgsAccumulator, ToolRegistry, defineTool, runTool } from '@agent-labs/agent-toolkit'

// Define tool
const reg = new ToolRegistry()
reg.register(defineTool<{ x: number, y: number }, number>({
  name: 'add',
  execute: ({ x, y }) => x + y
}))

// Execute
const result = await runTool(name => reg.get(name), { id: '1', name: 'add', args: { x: 1, y: 2 } })
```

Streaming (OpenAI adapter)

```ts
import { toCoreEvents$ } from '@agent-labs/agent-toolkit'

const events$ = toCoreEvents$(openAIAsyncIterable, { messageId: 'msg-1' })
const sub = events$.subscribe(evt => console.log(evt))
```

Notes
- This package is UI/server agnostic. Adapt events to your runtime easily.
- Built with TypeScript + RxJS, no DOM/Express dependencies.

