import { Injectable, Logger } from '@nestjs/common';
// import {RedisService} from '../../../'

@Injectable()
export class RedisCliTestService {
  protected logger = new Logger(RedisCliTestService.name);
  private readonly mockRedis = new Map<string, any>();
  constructor() // private readonly redis:RedisService
  {}

  async setCache(key: string, value: any) {
    await this.mockRedis.set(key, value);
    this.logger.log(`Set redis cache kv [${key} - ${value}]. `);
    globalThis.console.log(`Set redis cache kv [${key} -${value}]. `);
    return 'OK';
  }

  async getCache(key: string): Promise<any> {
    const val = await this.mockRedis.get(key);
    this.logger.log(`Get redis ${key} cache value [${val}]. `);
    return val;
  }
}
