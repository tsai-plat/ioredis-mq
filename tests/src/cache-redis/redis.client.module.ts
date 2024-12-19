import { Module } from '@nestjs/common';
import { RedisCliTestService } from './redis.client.service';
import { RedisClientController } from './redis.client.controller';

@Module({
  imports: [],
  providers: [RedisCliTestService],
  controllers: [RedisClientController],
})
export class CacheRedisModule {}
