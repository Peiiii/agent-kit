import { OpenAIAgent, createServer } from './index';

// 创建 OpenAI agent
const agent = new OpenAIAgent({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS) || 1000,
});

// 创建并启动服务器
const app = createServer(agent);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 