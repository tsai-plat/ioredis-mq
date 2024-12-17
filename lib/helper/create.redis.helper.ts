import { Redis } from 'ioredis';
import { IoRedisModuleError } from '../errors/ioredis.module.error';
import {
  IoRedisModuleOptions,
  Namespace,
  SingleRedisOptions,
} from '../interfaces';
import { ERROR_LOG, logger, READY_LOG } from '../log';
import { NAMESPACE_KEY_TOKEN } from '../ioredis.constants';
import { get, parseNamespace } from '../utils/ioredis.utils';

export function createSingleRedis(
  moduleOpts: IoRedisModuleOptions,
  key: string | symbol,
) {
  const { readyLog, errorLog, onClientCreated, redisOptions } = moduleOpts;
  const { url, path, ...commonOpitons } = redisOptions as SingleRedisOptions;

  if (!url?.length && !path?.length && !commonOpitons?.host?.length)
    throw new IoRedisModuleError(`ioredis module options invalid.`);
  let client: Redis;
  if (url?.length) {
    client = new Redis(url, commonOpitons);
  } else if (path?.length) {
    client = new Redis(path, commonOpitons);
  } else {
    client = new Redis(commonOpitons);
  }

  Reflect.defineProperty(client, NAMESPACE_KEY_TOKEN, {
    value: key,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  if (readyLog) {
    client.on('ready', () => {
      logger.log(
        READY_LOG(parseNamespace(get<Namespace>(client, NAMESPACE_KEY_TOKEN))),
      );
    });
  }

  if (errorLog) {
    client.on('error', (error: Error) => {
      logger.error(
        ERROR_LOG(
          parseNamespace(get<Namespace>(client, NAMESPACE_KEY_TOKEN)),
          error.message,
        ),
        error.stack,
      );
    });
  }

  if (typeof onClientCreated === 'function') {
    onClientCreated(client);
  }

  return client;
}
