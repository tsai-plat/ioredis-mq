
import { Cluster, ClusterNode, ClusterOptions, Redis, RedisOptions } from "ioredis"


export type Namespace = string | symbol;
export type IORedisOptionsType = 'single' | 'cluster';
export type IORedisClient = Redis|Cluster

/** IORedis Module Options */
export interface SingleRedisOptions extends RedisOptions {
  url?: string;
  path?: string;
}

export interface ClusterRedisOptions extends ClusterOptions {
  nodes: ClusterNode[];
}

export type ClientExtraOptions = {
    type?: IORedisOptionsType;
    closeClient?: boolean;
    readyLog?: boolean;
    errorLog?: boolean;
    onClientCreated?: (client: IORedisClient) => void;
}

/** IORedis MQ Module Options */
export type MQChannelType =
  | 'sys-log'
  | 'biz-log'
  | 'common'
  | 'chat-bot'
  | string;

export interface MQOptions {
    verbose?: boolean;
    ttl?: number;
    maxListeners?: number;
    micro?: boolean;
}

export type IORedisModuleOptions = ClientExtraOptions & {
    channels?:MQChannelType[]
    redisOptions?: SingleRedisOptions | ClusterRedisOptions;
    mqOptions?: MQOptions
}


/** MQ */
export type MQMessageType<P = any> = {
    id: string;
    ct?: string;
    sender?: string;
    payload: P;
};

export type MQHandleFn<T = MQMessageType> = (
  message: T,
  channel?: MQChannelType,
) => Promise<void> | void;

export type MQMessageHandler = {
  channel: MQChannelType;
  handler: MQHandleFn;
};

/**
 * @description
 *  unused
 */
export type IORedisClientFactory = (options?:IORedisModuleOptions)=>Promise<IORedisClient>