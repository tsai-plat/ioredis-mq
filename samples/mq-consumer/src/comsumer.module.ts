import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerAppService } from './consumer.service';
import {
  IORedisModuleAsyncOptions,
  IORedisMQModule,
  yamlConfigLoader,
} from '@tsailab/ioredis-mq';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        ()=>{
          return yamlConfigLoader('.conf')
        }
      ],
    }),
    IORedisMQModule.forRootAsync(
      {
        useFactory(config: ConfigService) {
          const cfg = config.get('ioredis');
          globalThis.console.log('Load local yaml config>>>', cfg);
          return (
            cfg || {
              redisOptions: {
                host: '172.20.0.1',
                port: 6379,
                db: 7,
                password: '123',
              },
              channels: ['chat-bot'],
              mqOptions: {
                verbose: true,
              },
            }
          );
        },
        inject: [ConfigService],
      } as IORedisModuleAsyncOptions,
      true,
    ),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerAppService],
})
export class ConsumerAppModule {}
