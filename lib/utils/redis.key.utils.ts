/** Lock  */
export const LOCK_KEY_ROOT_SCOPE = 'mqlock';
const Splitor = ':';

export function buildRedisKey(...args: Array<string | number>): string {
  return args.filter((v) => v !== undefined && ('' + v).length).join(Splitor);
}
