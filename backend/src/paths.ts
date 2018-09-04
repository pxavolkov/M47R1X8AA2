import { join, resolve } from 'path';
import { register } from 'tsconfig-paths';
import tsConfig from '../tsconfig.json';

const production = process.env.NODE_ENV === 'production';
const base = join(__dirname + (production ? '/../../..' : '/..'));

const baseUrl = resolve(__dirname, '..', tsConfig.compilerOptions.baseUrl);
register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths
});

export default {
  base,
  data: join(base + '/data'),
  upload: join(base + '/data/upload'),
  public: join(base + '/public'),
  photo: join(base + '/public/photo'),
  quenta: join(base + '/public/quenta'),
};
