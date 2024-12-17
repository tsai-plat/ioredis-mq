import {
  IOREDIS_DEFAULT_NS,
  IOREDIS_MODLUE_SUFFIX,
} from '../ioredis.constants';

export function getRedisOptionsToken(key: string = IOREDIS_DEFAULT_NS): string {
  return `${key}@${IOREDIS_MODLUE_SUFFIX}_OPTS`;
}

export function getRedisConnentToken(key: string = IOREDIS_DEFAULT_NS): string {
  return `${key}@${IOREDIS_MODLUE_SUFFIX}`;
}
