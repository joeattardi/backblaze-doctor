import chalk from 'chalk';
import ora from 'ora';

import { findRecords } from './data';
import { printEntries } from './output';

export default async function handler(filename: string) {
  console.log('');
  const spinner = ora('Finding file records').start();
  const records = await findRecords('.', filename);
  spinner.succeed(chalk.greenBright(`Found ${chalk.bold(records.length)} records.`));
  printEntries(filename, records);
  console.log('');
}
