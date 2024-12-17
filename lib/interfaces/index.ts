import { ModuleMetadata, Type } from '@nestjs/common';
import type {
  Cluster,
  ClusterNode,
  ClusterOptions,
  Redis,
  RedisOptions,
} from 'ioredis';

export type Namespace = string | symbol;
export type IoRedisOptionsType = 'single' | 'cluster';

export type ClientExtraOptions = {
  closeClient?: boolean;
  readyLog?: boolean;
  errorLog?: boolean;
  channels?:string[];//
  onClientCreated?: (client: Redis | Cluster) => void;
};

export interface SingleRedisOptions extends RedisOptions {
  url?: string;
  path?: string;
}

export interface ClusterRedisOptions extends ClusterOptions {
  nodes: ClusterNode[];
}

export interface MQOptions {
  verbose?:boolean
  ttl?:number
  maxListeners?:number
  skipSelf?:boolean
}

export type IoRedisModuleOptions = {
  type?: IoRedisOptionsType;
  redisOptions?: SingleRedisOptions | ClusterRedisOptions;
  mqOptions?: MQOptions
} & ClientExtraOptions;

export interface RedisModuleOptionsFactory {
  createRedisModuleOptions():
    | Promise<IoRedisModuleOptions>
    | IoRedisModuleOptions;
}


export interface IoRedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject: any[];
  useClass?: Type<RedisModuleOptionsFactory>;
  useExisting?: Type<RedisModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IoRedisModuleOptions> | IoRedisModuleOptions;
}

/** MQ Message */
export type MQChannelType = ''|'sys-log'|'biz-log'|'common'|'chat-bot'|string

export type MQMessageType<P=any> = {
  id:string;
  ct?:string;
  sender?:string;
  payload:P
}

export type MQHandlerFn<T=MQMessageType> = (message:T,channel?:string)=>Promise<void>|void

export type MQMessageHandle = {
  channel:MQChannelType
  handler:MQHandlerFn
}