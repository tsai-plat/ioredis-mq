import { forwardRef, Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerAService } from './producer.service';
import { IORedisMQModule } from '@tsailab/ioredis-mq';
import { ProducerBService } from './producer.b.servcie';

@Module({
  imports: [
    forwardRef(() =>
      IORedisMQModule.forRoot({
        redisOptions: {
          host: 'localhost',
          port: 6379,
          db: 5,
          password: 'admin123',
        },
        channels: ['chat-bot'],
        mqOptions: {
          micro: true,
          verbose: true,
        },
        producer: {
          host: 'localhost',
          port: 6379,
          db: 4,
          password: 'admin123',
        },
        queueOptions: {
          prefix: 'syslog:',
        },
      }),
    ),
  ],
  controllers: [ProducerController],
  providers: [ProducerAService, ProducerBService],
})
export class ProducerAppModule {}
