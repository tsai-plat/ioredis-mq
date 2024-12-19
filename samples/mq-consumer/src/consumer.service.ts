import { Injectable, Logger } from '@nestjs/common';

import {
  MQMessageType,
  RedisMQService,
  RedisService,
} from '@tsailab/ioredis-mq';

interface DemoMqData {
  name: string;
  value: string;
}

@Injectable()
export class ConsumerAppService {
  private logger = new Logger(ConsumerAppService.name);
  constructor(
    private readonly redis: RedisService,
    private readonly mq: RedisMQService,
  ) {
    // this.logger.log(this.mq.getSupportChannels());
    this.mq.registHandler('chat-bot', this.receivedHandler.bind(this));
  }
  async getHello(): Promise<string | undefined> {
    const demoKey = 'redis-test-demo';
    const val = await this.redis.getValue(demoKey);
    return val as unknown as string;
  }

  async sendMessage() {
    const now = new Date();
    const d: DemoMqData = {
      name: `@tsailab-${ConsumerAppService.name}`,
      value: `Consumer push : ${now.toISOString()}`,
    };
    this.logger.log(
      `Producer send data into mq service.\n${JSON.stringify(d, null, 2)}`,
    );

    const message = await this.mq.publishMessage(d, 'chat-bot');

    return `Producer send data into mq service.<br><code>${message ? JSON.stringify(message, null, 2) : JSON.stringify(d, null, 2)}</code>`;
  }

  receivedHandler(message: MQMessageType, channel: string) {
    this.logger.log(
      `Consumer received channel[${channel}] \n ${JSON.stringify(message, null, 2)}`,
    );
  }
}
