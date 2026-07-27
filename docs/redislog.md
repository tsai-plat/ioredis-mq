# 需求描述

> 使用场景：通过 redis list 的 RPush 和 BlPop 实现业务系统的日志 生产者 和消费者解耦 

1. 新增两个Redis 实例service 
  - RedisProducer : 提供 redis instance/ LPush RPush  LLEN 等操作封装
  - RedisConsumer: 提供redis instance / Blpop Brpop  LLEN 等操作封装

2. RedisProducer 和 RedisConsumer 实例redis instance 独立线程隔离

3. Redis 配置与项目原有配置独立

希望Module注册方式
```typescript
@Module({
  IORedisMQModule.forMQRootAsync({
    useFactory(){
        ...
    },
  })

})
export class AppModule {}
``
## 给出合理的架构设计方案
