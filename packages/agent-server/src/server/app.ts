import type { Request, Response } from 'express';
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { OpenAIAgent } from '../agent/openai-agent';

export const createApp = (agent: OpenAIAgent): Express => {
  const app = express();
  
  // 日志中间件
  app.use(morgan('dev')); // 开发环境使用 dev 格式
  app.use(cors());
  app.use(express.json());

  app.post('/openai-agent', async (req: Request, res: Response) => {
    const acceptHeader = req.headers.accept || 'application/json';
    const inputData = req.body;
    res.setHeader('Content-Type', acceptHeader);

    try {
      for await (const chunk of agent.run(inputData, acceptHeader)) {
        // console.log('[createApp] chunk', chunk)
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error('Error in OpenAI agent handler:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  return app;
};

// 为了向后兼容，保留 createServer 作为 createApp 的别名
export const createServer = createApp;
