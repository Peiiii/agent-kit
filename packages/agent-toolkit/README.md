# @agent-labs/agent-toolkit

A growing set of agent utilities. Today it ships a single utility to convert OpenAI ChatCompletion chunk streams into AgentEvent streams; more agent-focused helpers will join here over time.

Scope (now and next)
- Now (v0.1.x)
  - `openAIChunksToAgentEvents$`: AsyncIterable<chunk> → Observable<AgentEvent>
    - Text: `TEXT_START` → many `TEXT_DELTA` → `TEXT_END`
    - Tools: per tool_call `TOOL_CALL_START` → `TOOL_CALL_ARGS_DELTA` → `TOOL_CALL_END`
    - Supports parallel tool_calls (tracked by `index`), handles id-late by backfilling the first delta
- Next (roadmap)
  - Provider-agnostic chunk normalizers (OpenAI-compatible and others)
  - JSON argument streaming helpers (accumulate/validate partial args)
  - Tool orchestration helpers (scheduling, dedupe, retries)
  - Message/thread utilities for multi-step agent runs

Install

```bash
pnpm add @agent-labs/agent-toolkit
```

Quick Start

```ts
import { openAIChunksToAgentEvents$ } from '@agent-labs/agent-toolkit'

const events$ = openAIChunksToAgentEvents$(openAIAsyncIterable, { messageId: 'msg-1' })
const sub = events$.subscribe(evt => console.log('[AgentEvent]', evt))
```

Run Example

```bash
pnpm -F @agent-labs/agent-toolkit run examples:streams:fake
```

API

```ts
openAIChunksToAgentEvents$(
  stream: AsyncIterable<OpenAIChatChunk>,
  options: { messageId: string }
): Observable<AgentEvent>
```

Behavior & Guarantees
- Realtime: reducer-only pipeline; no buffering on the main path.
- Id-late: if tool_call id arrives after args, we emit a backfilled first ARGS_DELTA so the UI can reconstruct valid JSON by END.
- Finish: TOOL_CALL_END only when `finish_reason === 'tool_calls'`.
- Parallelism: tool_calls are tracked independently by their `index`.

Contributing New Utilities
- Place code under `src/` with a clear folder (e.g. `src/streams/`, `src/tools/`)
- Export from `src/index.ts`
- Add a runnable example in `examples/` and a short section in this README
- Keep APIs small and transport-agnostic; prefer typed helpers over framework bindings

Develop & Publish
- Build locally: `pnpm -F @agent-labs/agent-toolkit build`
- Run example: `pnpm -F @agent-labs/agent-toolkit run examples:streams:fake`
- Release (maintainers):
  1) Bump version in `package.json`
  2) `pnpm -F @agent-labs/agent-toolkit build`
  3) `pnpm -F @agent-labs/agent-toolkit publish --access public`

Notes
- UI/server agnostic; works in Node and modern bundlers.
- Implemented in TypeScript + RxJS; no DOM/Express dependencies.
