// client provider

import { ValueProvider } from '@nestjs/common';
import {
  DEFAULT_CONNECT_NAME,
  defaultModuleOptions,
  IOREDIS_DEFAULT_TOKEN,
  IOREDIS_MERGED_OPTIONS_TOKEN,
  IOREDIS_MOULE_OPTIONS_TOKEN,
  IOREDIS_MQ_TOKEN,
} from '../ioredis.constants';
import { IORedisModuleOptions, Namespace } from '../interfaces/core.interface';
import { IORedisModuleError } from '../errors';
import { createRedisCluster } from './create.cluster.helper';
import { createSingleRedis } from './create.redis.helper';

/**
 * options value provider
 * @param options
 * @returns ValueProvider with token IOREDIS_MOULE_OPTIONS_TOKEN symbol
 */
export const createOptionsProvider = (
  options: IORedisModuleOptions,
): ValueProvider => {
  return {
    provide: IOREDIS_MOULE_OPTIONS_TOKEN,
    useValue: options,
  };
};

export const mergedOptionsProvider = {
  provide: IOREDIS_MERGED_OPTIONS_TOKEN,
  useFactory: (options: IORedisModuleOptions) => ({
    ...defaultModuleOptions,
    ...options,
  }),
  inject: [IOREDIS_MOULE_OPTIONS_TOKEN],
};

/**
 * inject main client
 */
export const createRedisClient = {
  provide: IOREDIS_DEFAULT_TOKEN,
  useFactory: (options: IORedisModuleOptions) => {
    if (!options)
      throw new IORedisModuleError(
        `Please checked ${IOREDIS_MERGED_OPTIONS_TOKEN} injected.`,
      );
    const { type = 'single' } = options;

    return type === 'cluster'
      ? createRedisCluster(options, IOREDIS_DEFAULT_TOKEN)
      : createSingleRedis(options, IOREDIS_DEFAULT_TOKEN);
  },
  inject: [IOREDIS_MERGED_OPTIONS_TOKEN],
};

/**
 * inject mq client
 */
export const createRedisMQClient = {
  provide: IOREDIS_MQ_TOKEN,
  useFactory: (options: IORedisModuleOptions) => {
    if (!options)
      throw new IORedisModuleError(
        `Please checked ${IOREDIS_MERGED_OPTIONS_TOKEN} injected.`,
      );
    const { type = 'single' } = options;

    return type === 'cluster'
      ? createRedisCluster(options, IOREDIS_MQ_TOKEN)
      : createSingleRedis(options, IOREDIS_MQ_TOKEN);
  },
  inject: [IOREDIS_MERGED_OPTIONS_TOKEN],
};

/**
 *
 * @param namespace symbol | string
 * @returns symbol token
 */
export const getClientToken = (
  namespace: Namespace = DEFAULT_CONNECT_NAME,
): symbol => {
  return typeof namespace === 'symbol'
    ? namespace
    : Symbol(`@Tsailab-${namespace as string}`);
};
