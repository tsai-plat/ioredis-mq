import { Injectable, Logger } from '@nestjs/common';
import {
  MQMessageType,
  RedisMQService,
  RedisService,
} from '@tsailab/ioredis-mq';

@Injectable()
export class ConsumerAppService {
  private logger = new Logger(ConsumerAppService.name);
  constructor(
    private readonly redis: RedisService,
    private readonly mq: RedisMQService,
  ) {
    this.mq.registHandler('chat-bot', this.receivedHandler.bind(this));
  }
  async getHello(): Promise<string | undefined> {
    const demoKey = 'redis-test-demo';
    const val = await this.redis.getValue(demoKey);
    return val as unknown as string;
  }

  receivedHandler(message: MQMessageType, channel: string) {
    this.logger.log(
      `Consumer received channel[${channel}] \n ${JSON.stringify(message, null, 2)}`,
    );
  }
}
