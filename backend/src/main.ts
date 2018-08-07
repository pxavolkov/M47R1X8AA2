// tslint:disable-next-line
const moduleAlias = require('module-alias')
moduleAlias.addAlias('@shared', __dirname + '../../../shared/src');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(join(__dirname + '/../public'));
  await app.listen(3000);
}
bootstrap();
