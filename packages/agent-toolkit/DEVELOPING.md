# Developing @agent-labs/agent-toolkit

This package provides a single tool that converts OpenAI ChatCompletion chunk streams into AgentEvent streams.

Contents
- Dev setup
- Project layout
- Run example
- Making changes
- Testing ideas
- Versioning & Release
- Integration notes

## Dev setup

```bash
pnpm i
pnpm -F @agent-labs/agent-toolkit build
```

## Project layout

```
packages/agent-toolkit/
  src/
    index.ts                      # exports openAIChunksToAgentEvents$
    streams/openai-to-agent-event.ts
  examples/
    streams/openai-to-agent-event.example.ts
  tsdown.config.ts
  tsconfig.json
  package.json
  README.md
  DEVELOPING.md   ← you are here
```

## Run example

```bash
pnpm -F @agent-labs/agent-toolkit run examples:streams:fake
```

Expected event order
- TEXT_START → TEXT_DELTA* → TEXT_END
- For each tool_call: TOOL_CALL_START → TOOL_CALL_ARGS_DELTA* → TOOL_CALL_END
- Id-late: first delta after id is a backfilled snapshot so JSON stays parseable

## Making changes

Edit `src/streams/openai-to-agent-event.ts`.

Guidelines
- Keep the main path buffer-free to preserve realtime behavior (avoid toArray/buffer on the main path)
- Preserve id-late backfill logic
- Emit TOOL_CALL_END only when `finish_reason === 'tool_calls'`
- Avoid `any`; add minimal local types for provider chunks

Rebuild
```bash
pnpm -F @agent-labs/agent-toolkit build
```

## Testing ideas (TBD)
- Unit test the reducer with synthetic chunk sequences (text only, single tool_call, multiple concurrent tool_calls, id-late)
- Golden tests: expected AgentEvent sequences for known inputs
- Optional: fuzz partial JSON args to ensure UI can reconstruct valid JSON at END

## Versioning & Release (maintainers)
1) Bump version in `packages/agent-toolkit/package.json`
2) Build: `pnpm -F @agent-labs/agent-toolkit build`
3) Publish: `pnpm -F @agent-labs/agent-toolkit publish --access public`
4) Tag and changelog on the host repo if applicable

## Integration notes

Server
- Convert provider stream → AgentEvent stream
- Encode and forward events to clients as you already do

Client
- Map AgentEvent to your UI state. If you consume `argsDelta`, you will reconstruct complete JSON by the time you receive TOOL_CALL_END

