import { join } from 'path';

const production = process.env.NODE_ENV === 'production';
const base = join(__dirname + (production ? '/../../..' : '/..'));

if (production) {
  // tslint:disable-next-line
  const moduleAlias = require('module-alias')
  moduleAlias.addAlias('@shared', base + '/dist/shared/src');
}

export default {
  base,
  data: join(base + '/data'),
  upload: join(base + '/data/upload'),
  public: join(base + '/public'),
  photo: join(base + '/public/photo'),
  quenta: join(base + '/public/quenta'),
};
