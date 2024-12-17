import { NestFactory } from '@nestjs/core';
import { ProducerAppModule } from './producer.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProducerAppModule);
  const port = 18964;
  await app.listen(process.env.PORT ?? port, '0.0.0.0');

  const svrUrl = await app.getUrl();
  const urls: string[] = [
    `Will set value to redis:${svrUrl}/`,
    `Will publish mq message: ${svrUrl}/mqput/testmq`,
  ];
  return urls;
}
bootstrap().then((urls: string[]) => {
  const logger = new Logger(`Producer APP`);
  urls.forEach((v) => logger.warn(v));
});
