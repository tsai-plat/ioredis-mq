import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { IORedisClient, IORedisModuleOptions } from './core.interface';

/** IORedis Module Async Options */

export type IORedisClientFactoryReturn = [IORedisClient, IORedisClient];

export interface IORedisModuleOptionsFactory {
  createRedisModuleOptions():
    | Promise<IORedisModuleOptions>
    | IORedisModuleOptions;
}

export interface IORedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<IORedisModuleOptionsFactory>;
  useExisting?: Type<IORedisModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IORedisModuleOptions> | IORedisModuleOptions;
  clientsFactory?: IORedisMQClientFactory;
  inject: any[];
  extraProviders?: Provider[];
}

export type IORedisMQClientFactory = (
  options: IORedisModuleAsyncOptions,
) => Promise<IORedisClientFactoryReturn>;
