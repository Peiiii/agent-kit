#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { createApp } from './server/app';
import { OpenAIAgent } from './agent/openai-agent';
import { getAgentConfig } from './config';

const program = new Command();

program
  .name('ag-ui-server')
  .description('AG-UI Server')
  .version('1.0.0')
  .option('-p, --port <number>', 'Port to listen on', '8000')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (options) => {
    const spinner = ora('Starting server...').start();
    
    try {
      const agent = new OpenAIAgent(getAgentConfig());
      const app = createApp(agent);
      const server = app.listen(options.port, () => {
        spinner.succeed(chalk.green('Server started successfully!'));
        console.log(boxen(
          chalk.blue(`AG-UI Server listening on port ${options.port}`),
          { padding: 1, borderColor: 'blue' }
        ));
      });

      // 优雅关闭
      const shutdown = () => {
        spinner.info('Shutting down server...');
        server.close(() => {
          spinner.succeed('Server closed successfully');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);

    } catch (error) {
      spinner.fail(chalk.red('Failed to start server'));
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

program.parse(); 