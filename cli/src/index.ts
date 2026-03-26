#!/usr/bin/env node
import { Command } from 'commander';
import { devCommand } from './commands/dev.js';

const program = new Command();

program
  .name('flowcanvas')
  .description('Visual development tool for navigating React application flows')
  .version('0.1.0');

program
  .command('dev')
  .description('Start FlowCanvas dev server for the current project')
  .option('-p, --port <port>', 'Canvas server port', '3569')
  .option('-t, --target-port <port>', 'Target app dev server port (auto-detected if omitted)')
  .option('-d, --dir <path>', 'Project directory', '.')
  .action(devCommand);

program.parse();
