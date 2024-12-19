import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from '../src/app.module';

describe('IORedisMQModule', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });
  const healthValue = 'e2e OK';
  it(`should return set redis value: ${healthValue} `, () => {
    return request(server)
      .get(`/e2e/health`)
      .expect(200, { value: healthValue });
  });

  afterEach(async () => {
    await app.close();
  });
});
