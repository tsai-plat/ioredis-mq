import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import * as yaml from 'js-yaml';

export type StageEnvType = 'prod' | 'dev' | 'test' | 'stage';
export const APP_CONFIG_FILE = 'app.yml';

const STAGE_MAP: { [k: string]: StageEnvType } = {
  development: 'dev',
  develop: 'dev',
  dev: 'dev',
  test: 'test',
  stage: 'stage',
  production: 'prod',
  prod: 'prod',
};

/**
 * valid app.yml exist
 * return kvs as Record<string,any>
 */
export default (confBaseDir: string = '.conf') => {
  const stage = process.env.STAGE || 'prod';

  const appBaseDir = process.cwd();

  const confBasename = STAGE_MAP[stage] ?? STAGE_MAP['prod'];

  const confDir = join(appBaseDir, confBaseDir, confBasename);

  if (!existsSync(resolve(confDir, APP_CONFIG_FILE))) {
    throw new Error(`App miss config file ${APP_CONFIG_FILE} in ${confDir}`);
  }

  const files =
    readdirSync(confDir, { recursive: false, encoding: 'utf-8' }) ?? [];

  const configs = files
    .filter((f) => f.toLowerCase() !== APP_CONFIG_FILE)
    .filter((f) => f.endsWith('.yml'))
    .filter((f) => statSync(resolve(confDir, f)).isFile());

  console.log(
      `Stage Mode [${stage}]:load app config [${APP_CONFIG_FILE}]`,
  );
  const appConfigKvs = yaml.load(
    readFileSync(resolve(confDir, APP_CONFIG_FILE), 'utf-8'),
  ) as Record<string, any>;

  let kvs: Record<string, any> = {};

  configs.forEach((f) => {
    const someKvs = yaml.load(
      readFileSync(resolve(confDir, f), 'utf-8'),
    ) as Record<string, any>;
    kvs = {
      ...kvs,
      ...someKvs,
    };
  });

  if(confBasename === 'dev'){
    console.warn(`Application load configuration ${files.join(',')}`)
  }

  return {
    ...kvs,
    ...appConfigKvs,
  };
};
