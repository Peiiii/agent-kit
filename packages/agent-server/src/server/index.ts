import { getServerConfig } from '../config/index';
import { createApp } from './app';
import { OpenAIAgent } from '../agent/openai-agent';
import { getAgentConfig } from '../config';

const port = getServerConfig().port;
const agent = new OpenAIAgent(getAgentConfig());
createApp(agent).listen(port, () => {
  console.log(`AG-UI Server listening on port ${port}`);
}); 