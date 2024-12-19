import { IORedisModuleOptions, MQChannelType } from './interfaces';

/** defaults */

export const MQ_HANDLER_PROPS_SUBCHANNEL = 'IOREDIS_MQ_SUB_CHANNEL';
export const DEFAULT_CONNECT_NAME = '@tsailab-ioredis'

/** Global Token*/
export const IOREDIS_MODULE_ID = 'IORedisMQModule';
export const IOREDIS_MOULE_OPTIONS_TOKEN = 'TSAI@IOREDIS_MOULE_OPTIONS_TOKEN';
export const IOREDIS_MERGED_OPTIONS_TOKEN = 'TSAI@IOREDIS_MERGED_OPTIONS';

export const IOREDIS_DEFAULT_TOKEN = Symbol(DEFAULT_CONNECT_NAME);
export const IOREDIS_MQ_TOKEN = Symbol(`${DEFAULT_CONNECT_NAME}-pubsub`);




/** Service */
export const NAMESPACE_KEY_TOKEN = Symbol('IOREDIS_CLIENT_NS_KEY');
export const REDIS_SERVICE_TOKEN = Symbol('IOREDIS_SERVICE');
export const MQREDIS_SERVICE_TOKEN = Symbol('MQ_IOREDIS_SERVICE');

export const MQ_MESSAGE_CHANNEL = 'message';
export const DEFAUL_PUB_CHANNEL: MQChannelType = 'common';


export const defaultModuleOptions: IORedisModuleOptions = {
  type: 'single',
  readyLog: true,
  errorLog: true,
  closeClient: true,
  redisOptions: undefined,
  channels: undefined,
  mqOptions: undefined,
};
