import fs from 'fs';
import path from 'path';

const LOG_PATH = path.resolve(process.cwd(), 'debug-logs.txt');

export function appendDebug(msg: string) {
  try {
    const line = `${new Date().toISOString()} ${msg}\n`;
    fs.appendFileSync(LOG_PATH, line, { encoding: 'utf8' });
  } catch (e) {
    // Best-effort logging; ignore filesystem errors.
    try {
      console.log('[debug-log] failed to write log', e);
    } catch {}
  }
}

export function readDebug() {
  try {
    if (!fs.existsSync(LOG_PATH)) return '';
    return fs.readFileSync(LOG_PATH, { encoding: 'utf8' });
  } catch (e) {
    try {
      console.log('[debug-log] failed to read log', e);
    } catch {}
    return '';
  }
}
