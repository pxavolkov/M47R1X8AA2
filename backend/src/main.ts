import paths from './paths';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(paths.public);
  await app.listen(3000);
}
bootstrap();
