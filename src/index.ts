import { Command } from 'commander';

import bzDoneCommand from './bz_done';

const program = new Command();

program
  .addCommand(bzDoneCommand)
  .parse(process.argv);
