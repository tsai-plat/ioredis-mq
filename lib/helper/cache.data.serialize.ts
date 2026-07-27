import { CacheDataType } from '../interfaces';

/**
 *
 * @param data
 * @returns string | number
 */
export function serialize(data: CacheDataType): string | number {
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean'
  ) {
    return data;
  }
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data) as string;
  }
  throw new Error(
    `Data only support string,number,boolean or Record Object! ${typeof data}`,
  );
}
export type RuntimeType = 'string' | 'number' | 'boolean' | 'object';

/**
 *
 * @param value
 * @param runtimeType
 * @returns
 */
export function deserialize<
  T extends string | number | boolean | Record<string, any>,
>(value: string, runtimeType: RuntimeType = 'string'): T | null {
  if (value === null || value === undefined) return null;
  let ret;
  switch (runtimeType) {
    case 'number':
      ret = Number(value);
      break;
    case 'boolean':
      ret = Boolean(value);
      break;
    case 'object':
      try {
        ret = JSON.parse(value);
      } catch (ex: any) {
        globalThis.console.warn(`Value cast fail ${ex?.message}`);
        return null;
      }
      break;
    case 'string':
    default:
      ret = value;
      break;
  }

  return ret as T;
}
