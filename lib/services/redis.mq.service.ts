import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  DEFAUL_PUB_CHANNEL,
  IOREDIS_MERGED_OPTIONS_TOKEN,
  IOREDIS_MQ_TOKEN,
  MQ_HANDLER_PROPS_SUBCHANNEL,
  MQ_MESSAGE_CHANNEL,
} from '../ioredis.constants';

import {
  IORedisClient,
  IORedisModuleOptions,
  MQChannelType,
  MQHandleFn,
  MQMessageType,
} from '../interfaces';
import {
  buildRedisKey,
  createMessageId,
  genMQClientId,
  LOCK_KEY_ROOT_SCOPE,
  validMQChannelNames,
} from '../utils';
import { promisify } from 'util';
import { IORedisModuleError } from '../errors';

const DEFAULT_LOCK_TTL = 2000;
const defaultChannels: MQChannelType[] = [DEFAUL_PUB_CHANNEL];
const defaultMaxListeners = 5;
export class RedisMQService implements OnModuleInit {
  private readonly logger = new Logger(RedisMQService.name);
  private readonly channelMap = new Map<
    MQChannelType | string,
    Array<MQHandleFn>
  >();
  private maxListeners = 3;
  private debug = true;
  private ttl: number = DEFAULT_LOCK_TTL;
  private readonly micro: boolean;
  public readonly mqid = genMQClientId();

  constructor(
    @Inject(IOREDIS_MERGED_OPTIONS_TOKEN)
    private readonly options: IORedisModuleOptions,
    @Inject(IOREDIS_MQ_TOKEN)
    private readonly redis: IORedisClient,
  ) {
    const { mqOptions } = this.options;
    const {
      verbose = false,
      ttl = DEFAULT_LOCK_TTL,
      maxListeners = defaultMaxListeners,
      micro = false,
    } = mqOptions || {};
    this.debug = verbose;
    this.ttl = ttl;
    this.maxListeners = maxListeners;
    this.micro = micro;
    this.getSupportChannels().forEach((v) => {
      this.channelMap.set(v, []);
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.getSupportChannels()?.length) {
      this.subscribeToChannel(this.getSupportChannels());
    } else {
      throw new IORedisModuleError(`Please check configuration of channels.`);
    }
  }

  /**
   * pub message to channel
   * @param data
   * @param channel
   */
  async publishMessage<T = any>(
    data: T,
    channel: MQChannelType = DEFAUL_PUB_CHANNEL,
  ): Promise<MQMessageType<T> | null> {
    const msgid: string = await createMessageId();
    const messageObj: MQMessageType<T> = {
      id: msgid,
      sender: this.mqid,
      ct: new Date().toISOString(),
      payload: data,
    };

    this.logged(
      'log',
      `Publish msg ${channel}\n${JSON.stringify(messageObj, null, 2)}`,
    );

    await this.redis.publish(channel, JSON.stringify(messageObj));

    return messageObj;
  }

  /**
   * subscribe messages
   * @param channels with global configuration
   */
  private async subscribeToChannel(channels: string[]) {
    const subscriber = this.redis.duplicate();

    subscriber.on(MQ_MESSAGE_CHANNEL, async (channel, message) => {
      if (!channels.includes(channel)) {
        return;
      }
      // messages are only locked by the registered handler
      await this.handleMessage(channel, message);
    });

    await subscriber.subscribe(...channels);
  }

  private async handleMessage(channel: string, message: string) {
    this.logged(
      'log',
      `\n---------------\nReceived message from MQID:Channel [${this.mqid} : ${channel}] :\n\n ${message}\n\n----------------\n`,
    );
    const msgJson = this.paserMQJsonMessage(message);
    if (!msgJson) return;
    const { id, sender, ...others } = msgJson;

    // exclude self locked, fix pub is app,sub is an other app sence.
    if (this.micro && sender === this.mqid) {
      this.logged('warn', `Unsolicited messages id[${id}] are ignored.`);
      return;
    }

    const handlers: Array<MQHandleFn<MQMessageType>> =
      this.channelMap.get(channel) ?? [];

    const lockedKey = this.buildLockKey(channel, id);

    if (await this.acquireLock(lockedKey)) {
      try {
        if (!handlers.length) {
          this.logged(
            'warn',
            `Recived Message ID ${id},but no registered handler\n\n ${JSON.stringify({ ...others, channel }, null, 2)}`,
          );
          return;
        }

        await this.processByRegistered(channel, msgJson, handlers);
      } catch (e: any) {
        this.logger.error(`Handler channel [${channel}-${id}] error.`, e);
      } finally {
        await this.releaseLock(lockedKey);
      }
    } else {
      this.logger.warn(`Skipping duplicate message: ${id}`);
    }
  }

  private async processByRegistered(
    channel: string,
    json: MQMessageType,
    handlers: Array<MQHandleFn<MQMessageType>>,
  ) {
    for (let i = 0; i < handlers.length; i++) {
      try {
        if (channel) await handlers[i](json ?? undefined, channel);
      } catch (_e) {
        this.logged('error', `Handle ${channel} failed.`);
      }
    }
  }

  registHandler(channel: MQChannelType, handler: MQHandleFn) {
    if (!this.channelMap.has(channel)) {
      throw new IORedisModuleError(
        `Registered channel name [${channel}] not in your module configurations channels:
                ${this.getSupportChannels().join(',')} `,
      );
    }

    const handlers = this.channelMap.get(channel) as Array<MQHandleFn>;
    if (handlers.length >= this.maxListeners) {
      throw new IORedisModuleError(
        `MQ handlers required max ${this.maxListeners},can not registered.`,
      );
    }
    if (handlers.findIndex((v) => v === handler) === -1) {
      this.logged(
        'log',
        `Will registered ${handler.name} for channel [${channel}]`,
      );
      Reflect.defineProperty(handler, MQ_HANDLER_PROPS_SUBCHANNEL, {
        value: channel,
        writable: false,
        enumerable: false,
        configurable: true,
      });
      handlers.push(handler);
    } else {
      this.logged('warn', `${channel} handler ${handler.name} has registered.`);
    }
  }

  private logged(
    level: 'log' | 'warn' | 'error' = 'log',
    message: string,
    ex?: any,
  ) {
    if (!this.debug) return;
    const msg = message?.length ? message : (ex?.message ?? '');

    if (ex) {
      this.logger[level](msg, ex);
    } else {
      this.logger[level](msg);
    }
  }

  /**
   * remove channel listeners
   *  if handler passed will only remove the handler
   *  otherwise will remove all of channel listeners
   * @todo
   *  handle locked message
   * @param channel string
   * @param handler functions
   * @returns boolean
   */
  async removeHandlers(
    channel: MQChannelType,
    handler?: MQHandleFn,
  ): Promise<boolean> {
    if (!this.channelMap.has(channel)) return true;
    const listeners = this.channelMap.get(channel) as Array<MQHandleFn>;
    if (!listeners.length) return true;

    if (!handler) {
      this.channelMap.get(channel)?.splice(0, listeners.length);
      return true;
    }

    const idx = listeners.findIndex((v) => v === handler);
    if (idx === -1) return true;

    listeners.splice(idx, 1);

    return true;
  }

  private paserMQJsonMessage(message: string): MQMessageType<any> | null {
    // let m: MQMessage<SysLogCacheType> | null;
    try {
      const m = JSON.parse(message);
      if (!m) throw new Error('Null message');
      if (!m?.id?.length) throw new Error('MQ message required id.');
      return m as unknown as MQMessageType<any>;
    } catch (e: any) {
      this.logger.warn(
        `Received message can not parsed JSON MQ message.`,
        e?.message,
      );
      return null;
    }
  }

  private async acquireLock(key: string, ttl = this.ttl): Promise<boolean> {
    const setAsync = promisify(this.redis.set).bind(this.redis);
    const result = await setAsync(key, 'locked', 'NX', 'PX', ttl);
    return result === 'OK';
  }

  private async releaseLock(key: string) {
    this.logged('log', `Releasing lock: ${key}`);
    await this.redis.del(key);
  }

  private buildLockKey(subchannel: string = '', id: string): string {
    return buildRedisKey(LOCK_KEY_ROOT_SCOPE, subchannel, id);
  }

  public getSupportChannels(): string[] {
    return validMQChannelNames(this.options?.channels ?? defaultChannels);
  }
}
