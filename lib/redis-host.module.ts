import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  IoRedisModuleAsyncOptions,
  IoRedisModuleOptions,
  RedisModuleOptionsFactory,
} from './interfaces';
import { IoRedisModuleError } from './errors/ioredis.module.error';
import { createRedisCluster } from './helper/create.cluster.helper';
import { createSingleRedis } from './helper/create.redis.helper';
import {
  IOREDIS_DEFAULT_TOKEN,
  IOREDIS_MOULE_OPTIONS_TOKEN,
} from './ioredis.constants';
import {
  clientProvider,
  createOptionsProvider,
  mergedOptionsProvider,
} from './helper/create.provider.helper';
import { RedisService } from './services/redis.service';

@Global()
@Module({})
export class IORedisHostModule {
  static forRoot(options: IoRedisModuleOptions): DynamicModule {
    const { type = 'single' } = options;
    if (!['single', 'cluster'].includes(type))
      throw new IoRedisModuleError(
        `ioredis type required values of single or cluster.`,
      );

    const redisOptionsProvider: Provider = createOptionsProvider(options);

    const providers: Provider[] = [
      redisOptionsProvider,
      clientProvider,
      mergedOptionsProvider,
      RedisService,
    ];

    return {
      module: IORedisHostModule,
      providers,
      exports: [RedisService],
    };
  }

  /**
   *
   * @param options IoRedisModuleOptions
   */
  static forRootAsync(options: IoRedisModuleAsyncOptions): DynamicModule {
    const redisConnectionProvider: Provider = {
      provide: IOREDIS_DEFAULT_TOKEN,
      useFactory(opts: IoRedisModuleOptions) {
        const { type = 'single' } = opts;
        if (!['single', 'cluster'].includes(type))
          throw new IoRedisModuleError(
            `ioredis type required values of single or cluster.`,
          );

        return type === 'cluster'
          ? createRedisCluster(opts, IOREDIS_DEFAULT_TOKEN)
          : createSingleRedis(opts, IOREDIS_DEFAULT_TOKEN);
      },
      inject: [IOREDIS_MOULE_OPTIONS_TOKEN],
    };

    return {
      module: IORedisHostModule,
      imports: options?.imports,
      providers: [
        ...this.createAsyncProviders(options),
        redisConnectionProvider,
      ],
      exports: [redisConnectionProvider],
    };
  }

  public static createAsyncProviders(
    options: IoRedisModuleAsyncOptions,
  ): Provider[] {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass =
      options.useClass as unknown as Type<RedisModuleOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass: useClass,
      },
    ];
  }

  public static createAsyncOptionsProvider(
    options: IoRedisModuleAsyncOptions,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        provide: IOREDIS_MOULE_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const injects: any[] = [options.useClass || options.useExisting];

    return {
      provide: IOREDIS_MOULE_OPTIONS_TOKEN,
      async useFactory(
        optionsFactory: RedisModuleOptionsFactory,
      ): Promise<IoRedisModuleOptions> {
        return await optionsFactory.createRedisModuleOptions();
      },
      inject: injects,
    };
  }
}
