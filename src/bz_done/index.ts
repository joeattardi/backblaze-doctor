
import { Command } from "commander";

import fileHandler from './file';

const command = new Command('bz_done')
  .description('query bz_done data files');

command.command('file <filename>')
  .description('show the timeline for a specific file')
  .action(fileHandler);

export default command;
