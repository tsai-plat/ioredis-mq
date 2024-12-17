import { IoRedisModuleOptions, MQChannelType } from './interfaces';

/** Global Token*/
export const IOREDIS_MODULE_ID = 'IoRedisModule';
export const IOREDIS_DEFAULT_TOKEN = Symbol('IOREDIS_CLIENT_TOKEN');
export const IOREDIS_MQ_TOKEN = Symbol('IOREDIS_MQ_TOKEN');
export const IOREDIS_MOULE_OPTIONS_TOKEN = Symbol(
  'IOREDIS_MOULE_OPTIONS_TOKEN',
);
export const IOREDIS_MERGED_OPTIONS_TOKEN = Symbol('IOREDIS_MERGED_OPTIONS');

export const IOREDIS_DEFAULT_NS = 'IOREDIS_DEFAULT';
export const IOREDIS_MODLUE_SUFFIX = 'TSAI';

export const MQ_HANDLER_PROPS_SUBCHANNEL ='IOREDIS_MQ_SUB_CHANNEL'
/** Service */
export const NAMESPACE_KEY_TOKEN = Symbol('IOREDIS_CLIENT_NS_KEY');
export const REDIS_SERVICE_TOKEN = Symbol('IOREDIS_SERVICE');
export const MQREDIS_SERVICE_TOKEN = Symbol('MQ_IOREDIS_SERVICE');

export const MQ_MESSAGE_CHANNEL = 'message'
export const DEFAUL_PUB_CHANNEL:MQChannelType = 'comm'

export const defaultModuleOptions: IoRedisModuleOptions = {
  type: 'single',
  readyLog: true,
  errorLog: true,
  closeClient: true,
  redisOptions: undefined,
  channels:undefined,
  mqOptions:undefined
};

