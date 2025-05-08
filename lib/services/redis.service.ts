import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cluster, Redis } from 'ioredis';
import { IOREDIS_DEFAULT_TOKEN } from '../ioredis.constants';

@Injectable()
export class RedisService {
  protected logger = new Logger(RedisService.name);

  constructor(
    @Inject(IOREDIS_DEFAULT_TOKEN)
    private readonly client: Redis | Cluster,
  ) {}

  ping(): Promise<string> {
    return this.client?.ping();
  }

  get redisCli(): Redis | Cluster {
    return this.client;
  }

  setValue(key: string, value: string | number): Promise<string | number> {
    return this.client.set(key, value);
  }
  async getValue<T = string | number | undefined>(key: string): Promise<T> {
    const r = await this.client.get(key);
    return r as unknown as T;
  }
  async setValueEx(key: string, value: any, ex: number = -1) {
    return this.client.setex(key, ex, value);
  }
  async deleteKey(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
    } catch (ex: any) {
      this.logger.error(ex);
    } finally {
      return true;
    }
  }
  async findPattenKeys(pattern: string): Promise<Array<string>> {
    return await this.client.keys(pattern);
  }

  /**
   * 设置缓存
   * @param key string
   * @param data Object
   * @param ex number > 0 则设置有效期， <0 永久有效
   * @returns 序列化 string
   */
  async setData<T = Record<string, any>>(
    key: string,
    data: T,
    ex: number = -1,
  ): Promise<string> {
    if (
      typeof data !== 'object' ||
      !Object.keys(data as unknown as any)?.length
    )
      throw new Error(`Here only save Object,Record<string,any> volume.`);
    if (ex > 0) {
      return await this.client.setex(key, ex, JSON.stringify(data));
    } else {
      return await this.client.set(key, JSON.stringify(data));
    }
  }

  async getData<T = any>(key: string): Promise<T | undefined> {
    const data = await this.client.get(key);
    if (typeof data === 'undefined' || typeof data === 'symbol') return;

    try {
      const ret = JSON.parse(data as string);
      return ret as unknown as T;
    } catch (_) {
      return data as unknown as T;
    }
  }

  /**
   *
   * @param key
   * @param safity
   * @returns boolean
   */
  async hasKey(key: string, safity?: boolean): Promise<boolean> {
    const b = await this.client.exists(key);

    if (!safity) return !!b;
    const v = await this.client.get(key);
    return Boolean(v && !!b);
  }

  /**
   *
   * 获取剩余过期时间(秒)
   * -1 代表永不过期
   * -2 代表数据不存在
   * @param key
   */
  async getExpiredSeconds(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   *
   * @param key
   * @param ex
   * @returns
   */
  async setExpires(key: string, ex: number): Promise<number> {
    return await this.client.expire(key, ex);
  }

  /**
   * 在原ttl 基础上增加ex 时间
   * @param key string
   * @param data set object
   * @param ex >=-1
   */
  async delayUpdateData<T = Record<string, any>>(
    key: string,
    some: T,
    ex: number = 0,
  ): Promise<T> {
    if (ex < -1) throw new Error(`ex require >=-1`);
    const old = await this.client.get(key);
    let updData: Record<string, any> = {};

    if (old?.length) {
      try {
        updData = JSON.parse(old);
      } catch (_) {}
    }

    updData = Object.assign(updData, some);
    await this.client.set(key, JSON.stringify(updData));
    if (ex === -1) {
      return updData as T;
    } else {
      const ttl = await this.client.ttl(key);
      await this.client.expire(key, ttl + ex);
    }

    return updData as T;
  }

  /**
   * 更新缓存数据对象，不存在则创建
   * @param key
   * @param some
   * @returns Record<string, any> 更新后的数据
   */
  async updateSomeData<T = Record<string, any>>(
    key: string,
    some: T,
  ): Promise<Record<string, any>> {
    const old = await this.client.get(key);

    let upData = {};
    if (old) {
      try {
        upData = JSON.parse(old);
      } catch (_) {}
      upData = Object.assign(upData, some);
    } else {
      upData = Object.assign(upData, some);
    }

    await this.client.set(key, JSON.stringify(upData));

    return upData;
  }
}
