import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cluster, Redis } from 'ioredis';
import {
  IOREDIS_MOULE_OPTIONS_TOKEN,
  IOREDIS_PRODUCER_CLIENT,
} from '../ioredis.constants';
import { CacheDataType, IORedisModuleOptions } from '../interfaces';
import {
  createProducerRedisCluster,
  createProducerSingleRedis,
  serialize,
} from '../helper';
import { IORedisModuleError } from '../errors';

@Injectable()
export class RedisProducer {
  protected readonly logger = new Logger(RedisProducer.name);

  private client?: Redis | Cluster;

  constructor(
    @Inject(IOREDIS_MOULE_OPTIONS_TOKEN)
    private readonly options: IORedisModuleOptions,
  ) {
    const { type = 'single', producer, consumer } = options || {};
    if (producer || consumer) {
      this.client =
        type === 'cluster'
          ? createProducerRedisCluster(options, IOREDIS_PRODUCER_CLIENT)
          : createProducerSingleRedis(options, IOREDIS_PRODUCER_CLIENT);
    }
  }

  validClient() {
    if (!this.client)
      throw new IORedisModuleError(`Producer configuration not found!`);
  }

  ping(): Promise<string> {
    this.validClient();
    return this.client?.ping();
  }

  get redisCli(): Redis | Cluster | undefined {
    return this.client;
  }

  get modOptions(): IORedisModuleOptions {
    return this.options;
  }

  rpush(key: string, data: CacheDataType): Promise<number> {
    this.validClient();
    const value = serialize(data);
    return this.client.rpush(this.buildKey(key), value);
  }

  lpush(key: string, data: CacheDataType): Promise<number> {
    this.validClient();
    const value = serialize(data);
    return this.client.lpush(this.buildKey(key), value);
  }

  llen(key: string): Promise<number> {
    this.validClient();
    return this.client.llen(this.buildKey(key));
  }

  lrange(key: string, start: number, stop: number): Promise<string[]> {
    this.validClient();
    return this.client.lrange(this.buildKey(key), start, stop);
  }

  trim(key: string, start: number, stop: number): Promise<string> {
    this.validClient();
    return this.client.ltrim(this.buildKey(key), start, stop);
  }

  private buildKey(key: string): string {
    this.validClient();
    const prefix = this.options?.queueOptions?.prefix ?? '$syslog:';
    return prefix && !key.startsWith(prefix) ? `${prefix}${key}` : key;
  }
}
