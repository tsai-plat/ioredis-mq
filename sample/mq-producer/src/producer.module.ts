import { forwardRef, Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerAService } from './producer.service';
import { IORedisMqModule } from '@tsailab/ioredis-mq';
import { ProducerBService } from './producer.b.servcie';

@Module({
  imports: [
    forwardRef(() =>
      IORedisMqModule.forRoot({
        redisOptions: {
          host: '172.20.0.1',
          port: 6379,
          db: 7,
          password: 'admin123',
        },
        channels: ['chat-bot'],
        mqOptions: {
          verbose: true,
        },
      }),
    ),
  ],
  controllers: [ProducerController],
  providers: [ProducerAService, ProducerBService],
})
export class ProducerAppModule {}
