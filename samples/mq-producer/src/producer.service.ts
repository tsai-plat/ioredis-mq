import { Injectable, Logger } from '@nestjs/common';
import { RedisMQService, RedisService } from '@tsailab/ioredis-mq';

interface DemoMqData {
  name: string;
  value: string;
}

@Injectable()
export class ProducerAService {
  protected logger = new Logger(ProducerAService.name);
  constructor(
    private readonly redis: RedisService,
    private readonly mq: RedisMQService,
  ) {
    this.logger.warn(`${ProducerAService.name}->>>${this.mq.mqid}`);
  }

  async getHello(): Promise<string> {
    const demoKey = 'redis-test-demo';
    const val = new Date().toISOString();
    const ret = await this.redis.setValueEx(demoKey, val, 120);
    return `Set key: ${demoKey} value [${val}] into redis. result [${ret}]`;
  }

  async publishData(value: string) {
    const d: DemoMqData = {
      name: `@tsailab-${ProducerAService.name}`,
      value,
    };
    this.logger.log(
      `Producer send data into mq service.\n${JSON.stringify(d, null, 2)}`,
    );
    await this.mq.publishMessage(d, 'chat-bot');

    return JSON.stringify(d);
  }
}
