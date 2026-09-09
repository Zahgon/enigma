import { readFileSync } from 'node:fs';

const DATA_ROOT = new URL('../../../resources/data/', import.meta.url);

/**
 * Reads one of the n-gram data files and returns its `KEY,score` lines split
 * into pairs. Returns null if the file cannot be read, mirroring the Java
 * behaviour of nulling the table on IOException.
 */
export function readNgramFile(name) {
  let contents;
  try {
    contents = readFileSync(new URL(name, DATA_ROOT), 'utf8');
  } catch {
    return null;
  }

  const rows = [];
  for (const line of contents.split('\n')) {
    if (line === '' || line === '\r') continue;
    rows.push(line.replace(/\r$/, '').split(','));
  }
  return rows;
}
