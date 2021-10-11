import chalk from 'chalk';
import ora from 'ora';

import { findRecords } from './data';
import { printEntries } from './output';

export default async function handler(filename: string) {
  console.log('');
  const spinner = ora('Finding file records').start();
  const records = await findRecords('.', filename);

  if (records.length) {
    spinner.succeed(chalk.greenBright(`Found ${chalk.bold(records.length)} records for file: ${chalk.bold(filename)}`));
    printEntries(filename, records);
  } else {
    spinner.fail(`No records found for file: ${chalk.bold(filename)}`);
  }

  console.log('');
}
