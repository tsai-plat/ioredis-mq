import { Controller, Get, Param } from '@nestjs/common';
import { ProducerAService } from './producer.service';

@Controller()
export class ProducerController {
  constructor(private readonly appService: ProducerAService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('mqput/:value')
  async testpush(@Param('value') val: string) {
    return await this.appService.publishData(val);
  }
}
