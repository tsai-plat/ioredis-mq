import { DynamicModule, Module, Provider } from '@nestjs/common';

import { IoRedisModuleAsyncOptions, IoRedisModuleOptions } from './interfaces';
import { IoRedisModuleError } from './errors';
import {
  clientProvider,
  createAsyncProviders,
  createOptionsProvider,
  mergedOptionsProvider,
  mqClientProvider,
} from './helper';
import { RedisMQService, RedisService } from './services';
import { validMQChannelNames } from './utils';

@Module({})
export class IORedisMqModule {
  /**
   * Registers the module synchronously.
   * @param options
   * @returns IORedisMqModule
   */
  static forRoot(
    options: IoRedisModuleOptions,
    isGlobal: boolean = true,
  ): DynamicModule {
    const { type = 'single',channels,...others } = options;
    if (!['single', 'cluster'].includes(type))
      throw new IoRedisModuleError(
        `ioredis type required values of single or cluster.`,
      );

    const opts:IoRedisModuleOptions = {...others,type}

    if(channels){
      opts.channels = validMQChannelNames(channels)
    }

    const redisOptionsProvider: Provider = createOptionsProvider(opts);

    const providers: Provider[] = [
      redisOptionsProvider,
      mergedOptionsProvider,
      clientProvider,
    ];

    const exports:Provider[] = [
      clientProvider,
      RedisService, 
    ]

    if(opts.channels){
      providers.push(mqClientProvider)
      providers.push(RedisMQService)

      exports.push(mqClientProvider)
      exports.push(RedisMQService)
    }



    return {
      global: isGlobal,
      module: IORedisMqModule,
      providers:[
        ...providers,
        RedisService,
      ],
      exports: exports,
    };
  }

  static async forRootAsync(
    options: IoRedisModuleAsyncOptions,
    isGlobal: boolean = true,
  ) {
    const { useClass, useExisting, useFactory } = options;
    if (!(useClass || useExisting || useFactory)) {
      throw new IoRedisModuleError(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    const mqProviders:Provider[] = [
      mqClientProvider,
      RedisMQService
    ]

    const providers: Provider[] = [
      ...createAsyncProviders(options),
      clientProvider,
      mergedOptionsProvider,
      RedisService,
    ];

    const exports:Provider[] = [RedisService]

    if(mqProviders.length){
      providers.push(...mqProviders)
      exports.push(...mqProviders)
    }

    return {
      global: isGlobal,
      module: IORedisMqModule,
      imports: options.imports,
      providers,
      exports: exports,
    };
  }
}
