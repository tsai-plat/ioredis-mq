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
          host: '172.20.0.1',
          port: 6379,
          db: 7,
          password: 'admin123',
        },
        channels: ['chat-bot'],
        mqOptions: {
          micro: true,
          verbose: true,
        },
      }),
    ),
  ],
  controllers: [ProducerController],
  providers: [ProducerAService, ProducerBService],
})
export class ProducerAppModule {}
