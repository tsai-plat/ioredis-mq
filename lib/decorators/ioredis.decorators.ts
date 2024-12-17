import { Inject } from '@nestjs/common';
import { getRedisConnentToken } from '../helper/get.instance.token';

export const InjectRedis = (connection?: string) => {
  return Inject(getRedisConnentToken(connection));
};
