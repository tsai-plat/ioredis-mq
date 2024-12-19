import { DynamicModule, Module,  } from '@nestjs/common';
import { IORedisModuleAsyncOptions, IORedisModuleOptions } from './interfaces';
import { IORedisCoreModule } from './ioredis.core.module';

@Module({})
export class IORedisMQModule {
  /**
   * Registers the module synchronously.
   * @param options
   * @returns IORedisMqModule
   */
  static forRoot(
    options: IORedisModuleOptions,
    isGlobal: boolean = true,
  ): DynamicModule {

    return {
      global: isGlobal,
      module: IORedisMQModule,
      imports:[IORedisCoreModule.forRoot(options)]
    };
  }

  static async forRootAsync(
    options: IORedisModuleAsyncOptions,
    isGlobal: boolean = true,
  ) {
   
    return {
      global: isGlobal,
      module: IORedisMQModule,
      imports:[IORedisCoreModule.forRootAsync(options)]
    };
  }
}
