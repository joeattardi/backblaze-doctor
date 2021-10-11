import chalk from 'chalk';
import { format } from 'date-fns';

import { BzDoneRecord, BzDoneInstruction } from './data';

const dateFormat = 'Pp';

const colorFns = new Map([
  [BzDoneInstruction.SENT, chalk.greenBright],
  [BzDoneInstruction.EXPUNGED, chalk.redBright],
  [BzDoneInstruction.NOT_EXPUNGED_UNLIMITED_ROLLBACK, chalk.yellowBright],
  [BzDoneInstruction.LOCALLY_REMOVED, chalk.yellowBright],
  [BzDoneInstruction.DEDUP, chalk.blueBright],
  [BzDoneInstruction.META, chalk.cyanBright],
  [BzDoneInstruction.UNKNOWN, chalk.gray]
]);

export function printEntries(filename: string, entries: Array<BzDoneRecord> = []) {
  console.log(`Timeline for ${chalk.bold(filename)}:`);
  entries.forEach(printEntry);
}

function printEntry(entry: BzDoneRecord) {
  const { instruction, timestamp } = entry;
  const instructionColor = colorFns.get(instruction) || chalk.gray;
  console.log(` - ${chalk.bold(format(timestamp, dateFormat))}: ${instructionColor(instruction)}`);
}
