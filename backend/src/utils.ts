import * as mkdirp from 'mkdirp';
import { rename, unlink, stat, Stats, createReadStream } from 'fs';
import { createHash } from 'crypto';

export default {
  mkdirp: async (path: string) => {
    return new Promise((resolve, reject) => mkdirp(path, (err) => !err ? resolve() : reject(err)));
  },
  rename: async (oldPath: string, newPath: string) => {
    return new Promise((resolve, reject) => rename(oldPath, newPath, (err) => !err ? resolve() : reject(err)));
  },
  unlink: async (path: string) => {
    return new Promise((resolve, reject) => unlink(path, (err) => !err ? resolve() : reject(err)));
  },
  stat: async (path: string): Promise<Stats> => {
    return new Promise<Stats>((resolve, reject) => stat(path, (err, stat) => !err ? resolve(stat) : reject(err)));
  },
  fileHash: async (path: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const hash = createHash('md5');
      const stream = createReadStream(path);

      stream.on('data', (data) => {
        hash.update(data, 'utf8');
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });
  }
};
