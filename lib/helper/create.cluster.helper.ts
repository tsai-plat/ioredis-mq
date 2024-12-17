import { Cluster, Redis } from 'ioredis';
import {
  ClusterRedisOptions,
  IoRedisModuleOptions,
  Namespace,
} from '../interfaces';
import { IoRedisModuleError } from '../errors/ioredis.module.error';
import { NAMESPACE_KEY_TOKEN } from '../ioredis.constants';
import { ERROR_LOG, logger, READY_LOG } from '../log';
import { get, parseNamespace } from '../utils/ioredis.utils';

export function createRedisCluster(
  moduleOpts: IoRedisModuleOptions,
  key: string | symbol,
) {
  const { readyLog, errorLog, onClientCreated, redisOptions } = moduleOpts;
  const { nodes, ...commonOpitons } = redisOptions as ClusterRedisOptions;

  if (!nodes?.length)
    throw new IoRedisModuleError(
      `ioredis module options cluster required nodes.`,
    );

  const client: Cluster = new Redis.Cluster(nodes, commonOpitons);

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
