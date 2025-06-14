// Core exports
export { OpenAIAgent } from './agent/openai-agent';
export { createServer } from './server/app';
export { getAgentConfig } from './config';

// Types
export type { AgentConfig } from './config/index';
export type { OpenAIAgentOptions } from './agent/openai-agent';

// Server (optional)
export { createApp } from './server/app'; 