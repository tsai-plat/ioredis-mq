import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerAppService } from './consumer.service';
import {
  IoRedisModuleAsyncOptions,
  IORedisMqModule,
  // RedisMQService,
} from '@tsailab/ioredis-mq';

@Module({
  imports: [
    IORedisMqModule.forRootAsync(
      {
        useFactory() {
          return {
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
          };
        },
        inject: [],
      } as IoRedisModuleAsyncOptions,
      true,
    ),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerAppService],
})
export class ConsumerAppModule {}
