/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  DynamicModule,
  Global,
  Logger,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import {
  IOREDIS_DEFAULT_TOKEN,
  IOREDIS_MERGED_OPTIONS_TOKEN,
  IOREDIS_MODULE_ID,
  IOREDIS_MOULE_OPTIONS_TOKEN,
  IOREDIS_MQ_TOKEN,
} from './ioredis.constants';
import {
  IORedisModuleAsyncOptions,
  IORedisModuleOptions,
  IORedisModuleOptionsFactory,
} from './interfaces';
import {
  generateModuleId,
  validateOptionsType,
  validMQChannelNames,
} from './utils';
import {
  createOptionsProvider,
  createRedisClient,
  createRedisMQClient,
  mergedOptionsProvider,
} from './helper/core.provider.helper';
import { IORedisModuleError } from './errors';
import { RedisMQService, RedisService } from './services';
import { NextnoCacheService } from './services/nextno.service';

@Global()
@Module({})
export class IORedisCoreModule {
  private readonly logger = new Logger(IOREDIS_MODULE_ID);

  constructor() {}

  /**
   *
   * @param options
   * @returns IORedisCoreModule
   */
  static forRoot(options: IORedisModuleOptions): DynamicModule {
    const { type, channels } = options;

    validateOptionsType(type);
    if (channels) {
      options.channels = validMQChannelNames(channels);
    }

    const optionProvider: Provider = createOptionsProvider(options);
    const providers: Provider[] = [
      optionProvider,
      mergedOptionsProvider,
      createRedisClient,
      createRedisMQClient,
      RedisService,
      RedisMQService,
      NextnoCacheService,
    ];

    const exports: Array<symbol | string | Function> = [
      IOREDIS_MERGED_OPTIONS_TOKEN,
      IOREDIS_DEFAULT_TOKEN,
      IOREDIS_MQ_TOKEN,
      RedisService,
      RedisMQService,
      NextnoCacheService,
    ];

    return {
      module: IORedisCoreModule,
      providers,
      exports: exports,
    };
  }

  /**
   *
   * @param options
   * @returns IoRedisCoreModule
   */
  static forRootAsync(options: IORedisModuleAsyncOptions): DynamicModule {
    const { useClass, useExisting, useFactory } = options;
    if (!(useClass || useExisting || useFactory)) {
      throw new IORedisModuleError(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    /**
     * 1. merged providers
     * 2. clients
     */
    const asyncProviders = this.createAsyncProviders(options);

    const providers: Provider[] = [
      //put options providers
      ...asyncProviders,
      // put module clients
      createRedisClient,
      createRedisMQClient,
      // pust module services
      RedisService,
      RedisMQService,
      {
        provide: IOREDIS_MODULE_ID,
        useValue: generateModuleId(),
      },
      ...(options.extraProviders || []),
    ];
    const exports: Array<Provider | Function | symbol | string> = [
      IOREDIS_MERGED_OPTIONS_TOKEN,
      createRedisClient,
      createRedisMQClient,
      RedisService,
      RedisMQService,
      NextnoCacheService,
    ];

    return {
      module: IORedisCoreModule,
      imports: options.imports,
      providers,
      exports,
    };
  }

  /**
   * @description
   *  create module options providers from async providers
   *  it contains options & merged options
   */
  private static createAsyncProviders(
    options: IORedisModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options), mergedOptionsProvider];
    }

    const useClass = options.useClass as Type<IORedisModuleOptionsFactory>;

    const providers = [
      this.createAsyncOptionsProvider(options),
      mergedOptionsProvider,
      {
        provide: useClass,
        useClass,
      },
    ];

    return providers;
  }

  /**
   * create Module options provider
   * @param options IORedisModuleAsyncOptions
   */
  private static createAsyncOptionsProvider(
    options: IORedisModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: IOREDIS_MOULE_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<IORedisModuleOptionsFactory>,
    ];

    return {
      provide: IOREDIS_MOULE_OPTIONS_TOKEN,
      useFactory: async (factory: IORedisModuleOptionsFactory) => {
        return await factory.createRedisModuleOptions();
      },
      inject,
    };
  }
}
