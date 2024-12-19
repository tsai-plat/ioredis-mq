import { NestFactory } from '@nestjs/core';
import { ConsumerAppModule } from './comsumer.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ConsumerAppModule);
  const port = 18965;
  await app.listen(process.env.PORT ?? port, '0.0.0.0');

  const svrUrl = await app.getUrl();
  const urls: string[] = [`Will get value to redis:${svrUrl}/`];
  return urls;
}
bootstrap().then((urls: string[]) => {
  const logger = new Logger(`Consumer APP`);
  urls.forEach((v) => logger.warn(v));
});
