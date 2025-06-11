import dotenv from 'dotenv';

dotenv.config();

export interface AgentConfig {
  openaiApiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface ServerConfig {
  port: number;
}

export const getAgentConfig = (): AgentConfig => ({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS) || 1000,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const getServerConfig = (): ServerConfig => ({
  port: Number(process.env.PORT) || 3000,
});

export default {
  getAgentConfig,
  getServerConfig
};