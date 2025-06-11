// Core exports
export { OpenAIAgent } from './agent/openaiAgent';
export { createServer } from './server/app';
export { getAgentConfig } from './config';

// Types
export type { AgentConfig } from './config/index';
export type { OpenAIAgentOptions } from './agent/openaiAgent';

// Server (optional)
export { createApp } from './server/app'; 