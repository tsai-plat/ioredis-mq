import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { IORedisClient } from '../interfaces';
import { IOREDIS_MQ_TOKEN } from '../ioredis.constants';
import { buildRedisKey } from '../utils';

@Injectable()
export class NextnoCacheService implements OnApplicationBootstrap {
  private logger = new Logger(NextnoCacheService.name);

  private readonly rootScope = 'nextno';
  private readonly hashKey = buildRedisKey('nohash', 'current');
  private readonly autoExtends = 50;

  // 标记 Redis 是否就绪（避免初始化前执行方法）
  private isRedisReady = false;

  constructor(
    @Inject(IOREDIS_MQ_TOKEN)
    private readonly redis: IORedisClient,
  ) {}

  async onApplicationBootstrap() {
    try {
      // 测试 Redis 连接（执行 ping 命令验证）
      await this.redis.ping();
      this.isRedisReady = true;
      this.logger.log('✅ NextnoCacheService 初始化完成：Redis 客户端已就绪');
    } catch (error: any) {
      this.logger.error(
        '❌ NextnoCacheService 初始化失败：Redis 客户端未就绪',
        error.stack,
      );
      throw new Error('Redis 连接失败，无法初始化 NextnoCacheService');
    }
  }

  // 前置检查：确保 Redis 就绪后再执行业务逻辑
  private checkRedisReady() {
    if (!this.isRedisReady) {
      throw new Error('Redis 客户端未就绪，无法执行 NextnoCacheService 方法');
    }
  }

  /**
   *
   * @param nexttyp your nextno bizkey
   * @default xuser
   */
  async getNextno(nexttyp: string = 'xuser'): Promise<number> {
    await this.precheck(nexttyp);
    const k = this.getNoListKey(nexttyp);
    const v = await this.redis.lpop(k);
    return Number(v);
  }

  public async precheck(biztype: string) {
    await this.checkRedisReady();

    const k = this.getNoListKey(biztype);
    const size = await this.redis.llen(k);
    if (size < 20) {
      await this.increaseUnos(biztype);
    }
  }

  private getNoListKey(biztype: string) {
    return buildRedisKey(this.rootScope, biztype.toString(), 'nos');
  }

  async setHash(biztype: string, val: number = 0) {
    const cli = this.redis;
    await cli.hset(this.hashKey, biztype.toString(), val);
  }

  /**
   * current nextno
   * @param biztype
   * @returns string
   */
  async getHash(biztype: string): Promise<string | null> {
    const cli = this.redis;
    return cli.hget(this.hashKey, biztype.toString());
  }

  /**
   *
   * @param biztype
   * @param batch
   * @returns string
   */
  public async increaseUnos(biztype: string, batch = 1000) {
    const cli = this.redis;
    const listKey = this.getNoListKey(biztype);
    const size = await cli.llen(listKey);
    if (size > this.autoExtends) {
      this.logger.warn(`has ${size} unos, no need create news.`);
      return `has ${size} unos, no need create news.`;
    }

    let start: number = 0;
    let len = batch;
    if (size) {
      const v = await cli.rpop(listKey);
      if (v && parseInt(v) > 0) {
        start = parseInt(v);
        len = len + 1;
      }
    } else if (await cli.hexists(this.hashKey, biztype.toString())) {
      const v = await cli.hget(this.hashKey, biztype.toString());
      if (v && parseInt(v) > 0) start = parseInt(v) + 1;
    }

    const nos: number[] = [];
    let nextno = start;
    for (let i = 0; i < len; i++) {
      nos.push(nextno);
      nextno++;
    }

    await cli.rpush(listKey, ...nos);

    return `Has been init ${nos.length} uno into cache`;
  }
}
