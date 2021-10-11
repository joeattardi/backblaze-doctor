import { createReadStream } from 'fs';
import path from 'path';
import readline from 'readline';
import { promisify } from 'util';

import { parse } from 'date-fns';
import _glob from 'glob';

const glob = promisify(_glob);

const BZ_DONE_BASE_PATH = 'bzbackup/bzdatacenter'

export enum BzDoneInstruction {
  SENT = 'File was uploaded to Backblaze',
  EXPUNGED = 'File was deleted (expunged) from Backblaze',
  NOT_EXPUNGED_UNLIMITED_ROLLBACK = 'File would be expunged, but unlimited rollback is enabled',
  LOCALLY_REMOVED = 'File was deleted on the local system',
  DEDUP = 'Found existing file data (dedup)',
  META = 'Meta',
  GOVERNANCE = 'Governance',
  UNKNOWN = 'Unknown'
}

const instructionCodeMappings: { [index: string]: BzDoneInstruction } = {
  '+': BzDoneInstruction.SENT,
  'x': BzDoneInstruction.EXPUNGED,
  'z': BzDoneInstruction.NOT_EXPUNGED_UNLIMITED_ROLLBACK,
  '-': BzDoneInstruction.LOCALLY_REMOVED,
  '=': BzDoneInstruction.DEDUP,
  '!': BzDoneInstruction.META,
  'g': BzDoneInstruction.GOVERNANCE
};

const EntryColumn = {
  VERSION: 0,
  INSTRUCTION: 1,
  TIMESTAMP: 3,
  FILENAME: 13
};

interface BzDoneEntry {
  entry: string;
  source: string;
}

export interface BzDoneRecord {
  version: number;
  instruction: BzDoneInstruction;
  timestamp: Date;
  filename: string;
  source: string;
}

function parseEntry(entry: BzDoneEntry): BzDoneRecord {
  const fields = entry.entry.split('\t');

  return {
    version: parseInt(fields[EntryColumn.VERSION]),
    instruction: instructionCodeMappings[fields[EntryColumn.INSTRUCTION]] || BzDoneInstruction.UNKNOWN,
    timestamp: parse(fields[EntryColumn.TIMESTAMP], 'yyyyMMddHHmmss', new Date()),
    filename: fields[EntryColumn.FILENAME],
    source: entry.source
  };
}

export async function findRecords(bzDataPath: string, searchFilename: string): Promise<Array<BzDoneRecord>> {
  const bzDonePath = path.resolve(bzDataPath, BZ_DONE_BASE_PATH);

  const files = await glob('**/bz_done_*.dat', { cwd: bzDonePath });
  const entries: Array<BzDoneEntry> = (await Promise.all(files.map(file => findEntries(path.resolve(bzDonePath, file), searchFilename)))).flat();

  return entries.map((entry: BzDoneEntry) => parseEntry(entry));
}

function findEntries(dataFile: string, searchFilename: string): Promise<Array<BzDoneEntry>> {
  return new Promise(resolve => {
    const entries: Array<BzDoneEntry> = [];
    const rl = readline.createInterface({ input: createReadStream(dataFile) });

    rl.on('line', entry => {
      if (entry.includes(searchFilename)) {
        entries.push({
          entry,
          source: dataFile
        });
      }
    });

    rl.on('close', () => { resolve(entries); });
  });
}