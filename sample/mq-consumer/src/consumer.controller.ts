import { Controller, Get } from '@nestjs/common';
import { ConsumerAppService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly appService: ConsumerAppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
