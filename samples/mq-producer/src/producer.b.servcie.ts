import { Injectable, Logger } from '@nestjs/common';
import { MQMessageType, RedisMQService } from '@tsailab/ioredis-mq';

interface DemoMqData {
  name: string;
  value: string;
}

@Injectable()
export class ProducerBService {
  protected logger = new Logger(ProducerBService.name);
  constructor(private readonly mq: RedisMQService) {
    this.mq.registHandler('chat-bot', this.receivedHandler.bind(this));
    this.logger.warn(`${ProducerBService.name}->>${this.mq.mqid}`);
  }

  async publishData(value: string) {
    const d: DemoMqData = {
      name: `@tsailab-${ProducerBService.name}`,
      value,
    };
    this.logger.log(
      `Producer send data into mq service.\n${JSON.stringify(d, null, 2)}`,
    );
    await this.mq.publishMessage(d, 'chat-bot');

    return JSON.stringify(d);
  }

  receivedHandler(message: MQMessageType, channel: string) {
    this.logger.log(
      `Consumer received channel[${channel}] \n ${JSON.stringify(message, null, 2)}`,
    );
  }
}
