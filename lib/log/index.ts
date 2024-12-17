import { Logger } from '@nestjs/common';
import { IOREDIS_MODULE_ID } from '../ioredis.constants';

export const logger = new Logger(IOREDIS_MODULE_ID, { timestamp: true });

export const READY_LOG = (namespace: string) =>
  `${namespace}: the connection was successfully established`;

export const ERROR_LOG = (namespace: string, message: string) =>
  `${namespace}: ${message}`;
