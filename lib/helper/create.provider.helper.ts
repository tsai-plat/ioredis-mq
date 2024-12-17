import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import {
  IoRedisModuleAsyncOptions,
  IoRedisModuleOptions,
  RedisModuleOptionsFactory,
} from '../interfaces';
import {
  defaultModuleOptions,
  IOREDIS_DEFAULT_TOKEN,
  IOREDIS_MERGED_OPTIONS_TOKEN,
  IOREDIS_MOULE_OPTIONS_TOKEN,
  IOREDIS_MQ_TOKEN,
} from '../ioredis.constants';
import { IoRedisModuleError } from '../errors/ioredis.module.error';
import { createRedisCluster } from './create.cluster.helper';
import { createSingleRedis } from './create.redis.helper';




export const createOptionsProvider = (
  options: IoRedisModuleOptions,
): ValueProvider => {
  let channels:string[]|undefined =undefined
  if(options.channels?.filter((v)=>v.length).length){
   channels = options.channels.filter((v)=>v.length)
  }
  return {
    provide: IOREDIS_MOULE_OPTIONS_TOKEN,
    useValue: {...options,channels: channels},
  };
};

// export const createAsyncOptionsProvider = {}

/**
 * 
 * @param optionFactory 
 * @returns IoRedisModuleOptions
 */
export const createAsyncOptions = async (
  optionFactory: RedisModuleOptionsFactory,
): Promise<IoRedisModuleOptions> => {
  const opts = await optionFactory.createRedisModuleOptions();
  return opts;
};

/**
 * 
 * @param options 
 * @returns 
 */
export const createAsyncOptionsProvider = (
  options: IoRedisModuleAsyncOptions
) => {
  const { useClass, useExisting, useFactory, inject } = options;

  // useFactory or useExisting will return options providers

  if (useFactory) {
    return {
      provide: IOREDIS_MOULE_OPTIONS_TOKEN,
      useFactory,
      inject: inject ?? [],
    };
  }

  if (useClass) {
    return {
      provide: IOREDIS_MOULE_OPTIONS_TOKEN,
      useFactory: createAsyncOptions,
      inject: [...inject, useClass],
    };
  }

  if (useExisting) {
    return {
      provide: IOREDIS_MOULE_OPTIONS_TOKEN,
      useFactory: createAsyncOptions,
      inject: [...inject, useExisting],
    };
  }

  throw new IoRedisModuleError(
    'Invalid configuration. Must provide useFactory, useClass or useExisting',
  );
};

/**
 * added
 * @param options 
 */
export const createAsyncProvidersFactoryOrExsiting = ( options: IoRedisModuleAsyncOptions,):Provider=>{
  const {useFactory,useExisting,inject,useClass} = options

  if(useFactory){
    return {
      provide:IOREDIS_MOULE_OPTIONS_TOKEN,
      useFactory,
      inject:inject||[]
    }
  }
  // useExsiting
  return {
    provide:IOREDIS_MOULE_OPTIONS_TOKEN,
    useFactory:async (factory:RedisModuleOptionsFactory)=>{
      const opts = await factory.createRedisModuleOptions()
      return opts
    },
    inject:[useExisting||useClass]
  }
}

export const createAsyncProviders = (
  options: IoRedisModuleAsyncOptions
): Provider[] => {
  if (options.useExisting || options.useFactory) {
    return [createAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }


  return [];
};

export const clientProvider = {
  provide: IOREDIS_DEFAULT_TOKEN,
  useFactory: (options: IoRedisModuleOptions) => {
    const { type = 'single' } = options;
    if (!['single', 'cluster'].includes(type))
      throw new IoRedisModuleError(
        `ioredis type required values of single or cluster.`,
      );

    return type === 'cluster'
      ? createRedisCluster(options, IOREDIS_DEFAULT_TOKEN)
      : createSingleRedis(options, IOREDIS_DEFAULT_TOKEN);
  },
  inject: [IOREDIS_MERGED_OPTIONS_TOKEN],
};

export const mqClientProvider = {
  provide:IOREDIS_MQ_TOKEN,
  useFactory: (options: IoRedisModuleOptions) => {
    const { type = 'single' } = options;
    if (!['single', 'cluster'].includes(type))
      throw new IoRedisModuleError(
        `ioredis type required values of single or cluster.`,
      );

    return type === 'cluster'
      ? createRedisCluster(options, IOREDIS_MQ_TOKEN)
      : createSingleRedis(options, IOREDIS_MQ_TOKEN);
  },
  inject: [IOREDIS_MERGED_OPTIONS_TOKEN],
}

export const mergedOptionsProvider: FactoryProvider<IoRedisModuleOptions> = {
  provide: IOREDIS_MERGED_OPTIONS_TOKEN,
  useFactory: (options: IoRedisModuleOptions) => ({
    ...defaultModuleOptions,
    ...options,
  }),
  inject: [IOREDIS_MOULE_OPTIONS_TOKEN],
};

// function handleMqOptionsProviders(opts:IoRedisModuleOptions,providers:Provider[]){
//   if(opts.channels){
//     opts.channels = validMQChannelNames(opts.channels)

//     if(!providers.includes(mqClientProvider)){
//       providers.push(mqClientProvider)
//     }
//     if(!providers.includes(RedisMQService)){
//       providers.push(RedisMQService)
//     }
//   }

// }