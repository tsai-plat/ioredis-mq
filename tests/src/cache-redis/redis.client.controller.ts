import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Body,
} from '@nestjs/common';
import { RedisCliTestService } from './redis.client.service';

@Controller('e2e/rediscli')
export class RedisClientController {
  constructor(private readonly clientService: RedisCliTestService) {}

  @Post('set')
  @HttpCode(HttpStatus.OK)
  async set(@Body() body: { key: string; value: string }): Promise<any> {
    const { key, value } = body;
    return this.clientService.setCache(key, value);
  }

  @Get('get/spec_key')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query()
    querys: {
      key: string;
    },
  ) {
    const { key } = querys;
    return this.clientService.getCache(key);
  }
}
