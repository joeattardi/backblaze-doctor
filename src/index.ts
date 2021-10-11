import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

import { findRecords } from './bzDone';
import { printEntries } from './output';

const program = new Command();

program
  .requiredOption('-d, --bzdata <path>', 'path to Backblaze bzdata directory')
  .parse(process.argv);

const options = program.opts();

const [filename] = program.args;
const bzData = options.bzdata;

async function start() {
  console.log('');
  const spinner = ora('Finding file records').start();
  const records = await findRecords(bzData, filename);
  spinner.succeed(chalk.greenBright(`Found ${chalk.bold(records.length)} records.`));
  printEntries(filename, records);
  console.log('');
}

start();
