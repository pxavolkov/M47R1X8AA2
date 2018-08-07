#!/usr/bin/env node
import chalk, { Chalk } from 'chalk';
interface IStringObject {
  [key: string]: Chalk
}

const levelColors: IStringObject = {
  INFO: chalk.cyan,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

function formatDate(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:` +
    `${d.getMinutes().toString().padStart(2, '0')}:` +
    `${d.getSeconds().toString().padStart(2, '0')}.` +
    `${d.getMilliseconds().toString().padStart(3, '0')}`;
}

export default {
  _log(level: string, text: any) {
    console.log(`${formatDate(new Date())} [${levelColors[level](level)}] ${text instanceof Error ? text.stack : text.toString()}`);
  },
  info(text: string) {
    this._log('INFO', text);
  },
  warn(text: string) {
    this._log('WARN', text);
  },
  error(text: string) {
    this._log('ERROR', text);
  }
}