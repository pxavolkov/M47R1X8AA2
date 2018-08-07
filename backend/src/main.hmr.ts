// tslint:disable-next-line
require('module-alias/register')

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { getConnection } from 'typeorm';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    const connection = getConnection();
    if (connection.isConnected) {
        await connection.close();
    }
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
