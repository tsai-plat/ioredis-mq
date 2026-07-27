import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cluster, Redis } from 'ioredis';
import {
  IOREDIS_CONSUMER_CLIENT,
  IOREDIS_MOULE_OPTIONS_TOKEN,
} from '../ioredis.constants';
import { CacheDataType, IORedisModuleOptions } from '../interfaces';
import { IORedisModuleError } from '../errors';
import {
  createConsumerRedisCluster,
  createConsumerSingleRedis,
  deserialize,
} from '../helper';

@Injectable()
export class RedisConsumer {
  protected logger = new Logger(RedisConsumer.name);

  private client?: Redis | Cluster;

  constructor(
    @Inject(IOREDIS_MOULE_OPTIONS_TOKEN)
    private readonly options: IORedisModuleOptions,
  ) {
    const { type = 'single', producer, consumer } = options || {};
    if (producer || consumer) {
      this.client =
        type === 'cluster'
          ? createConsumerRedisCluster(options, IOREDIS_CONSUMER_CLIENT)
          : createConsumerSingleRedis(options, IOREDIS_CONSUMER_CLIENT);
    }
  }

  validClient() {
    if (!this.client)
      throw new IORedisModuleError(`Consumer configuration not found!`);
  }

  ping(): Promise<string> {
    return this.client?.ping();
  }

  get redisCli(): Redis | Cluster | undefined {
    return this.client;
  }

  get modOptions(): IORedisModuleOptions {
    return this.options;
  }

  /**
   *
   * @param key
   * @param timeout
   * @returns  [key,value] string[]
   */
  blpop(key: string, timeout: number): Promise<[string, string] | null> {
    this.validClient();
    return this.client.blpop(this.buildKey(key), timeout) as Promise<
      [string, string] | null
    >;
  }

  /**
   *
   * @param key
   * @param timeout
   * @returns T |null
   */
  async blpopData<T extends CacheDataType>(
    key: string,
    timeout: number,
  ): Promise<T | null> {
    const ret = await this.blpop(key, timeout);
    if (!ret) return null;
    const [_, value] = ret;
    return deserialize<T>(value, 'object');
  }

  /**
   *
   * @param key
   * @param timeout
   * @returns [key,value] string[]
   */
  brpop(key: string, timeout: number): Promise<[string, string] | null> {
    this.validClient();
    return this.client.brpop(this.buildKey(key), timeout) as Promise<
      [string, string] | null
    >;
  }

  /**
   *
   * @param key
   * @param timeout
   * @returns T
   */
  async brpopData<T extends CacheDataType>(
    key: string,
    timeout: number,
  ): Promise<T | null> {
    const ret = await this.brpop(key, timeout);
    if (!ret) return null;
    const [_, value] = ret;
    return deserialize<T>(value, 'object');
  }

  llen(key: string): Promise<number> {
    this.validClient();
    return this.client.llen(this.buildKey(key));
  }

  /**
   *
   * @param key
   * @param start
   * @param stop
   * @returns string[]
   */
  lrange(key: string, start: number, stop: number): Promise<string[]> {
    this.validClient();
    return this.client.lrange(this.buildKey(key), start, stop);
  }

  private buildKey(key: string): string {
    this.validClient();
    const prefix = this.options?.queueOptions?.prefix ?? '';

    return prefix && !key.startsWith(prefix) ? `${prefix}${key}` : key;
  }
}
