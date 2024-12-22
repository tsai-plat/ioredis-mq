import { IORedisModuleError } from '../errors';
import { IORedisOptionsType } from '../interfaces/core.interface';

export function validMQChannelNames(channels: string[]): string[] {
  const c = channels.reduce((prev:string[], curr) => {
    if (!prev.includes(curr)) {
      prev.push(curr);
    }
    return prev;
  }, []);
  if (!c?.length)
    throw new IORedisModuleError(`MQ configuration channels invalid.`);
  for (let i = 0; i < c.length; i++) {
    if (!/^[a-z]+(\-[a-z0-9\_]+)?$/.test(c[i])) {
      throw new IORedisModuleError(
        `MQ configuration channel name [${c[i]}] invalid.`,
      );
    }
  }

  return c;
}

export function validateOptionsType(type?: IORedisOptionsType) {
  if (type && !['single', 'cluster'].includes(type))
    throw new IORedisModuleError(
      `ioredis type required values of single or cluster.`,
    );
}
