import { Controller, Get } from '@nestjs/common';

@Controller('e2e')
export class AppController {
  @Get('health')
  testHealth() {
    return { value: 'e2e OK' };
  }
}
