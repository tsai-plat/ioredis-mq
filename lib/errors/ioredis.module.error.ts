export const IOREDIS_ERROR_CODE = 508964;
export class IoRedisModuleError extends Error {
  public readonly code = IOREDIS_ERROR_CODE;
  constructor(message: string = 'options invalid.') {
    super(message);
  }
}
