import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IORedisMQModule } from '../../lib';
import { RedisConsumer } from '../../lib/services/redis.consumer';
import { RedisProducer } from '../../lib/services/redis.producer';

describe('IORedisMQModule RedisLogMQ', () => {
  let app: INestApplication;
  let producer: RedisProducer;
  let consumer: RedisConsumer;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        IORedisMQModule.forRootAsync({
          useFactory() {
            return {
              redisOptions: {
                host: '127.0.0.1',
                port: 6379,
                db: 3,
                password: 'admin123',
              },
              producer: {
                host: '127.0.0.1',
                port: 6379,
                db: 3,
                password: 'admin123',
              },
              consumer: {
                host: '127.0.0.1',
                port: 6379,
                db: 3,
                password: 'admin123',
              },
              queueOptions: {
                prefix: 'redislogmq:test:',
                blockTimeout: 1,
              },
            };
          },
          inject: [],
        }),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    producer = app.get(RedisProducer);
    consumer = app.get(RedisConsumer);
  });
  it('should push and pop messages through separate Redis clients', async () => {
    const key = `queue:demo:${Date.now()}`;
    await producer.rpush(key, 'create');
    await producer.lpush(key, 'update');
    const length = await producer.llen(key);
    expect(length).toBe(2);
    const first = await consumer.blpop(key, 1);
    expect(first).not.toBeNull();
    expect(first?.[0]).toBeDefined();
    expect(first?.[1]).toBe('update');
    const second = await consumer.brpop(key, 1);
    expect(second).not.toBeNull();
    expect(second?.[0]).toBeDefined();
    expect(second?.[1]).toBe('create');
  });
  afterAll(async () => {
    await app.close();
    producer.redisCli?.disconnect();
    consumer.redisCli?.disconnect();
  });
});
