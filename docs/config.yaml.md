# yaml

## RedisLog

```yaml
ioredis:
  verbose: true
  type: single
  closeClient: true
  readyLog: true
  errorLog: true
  # RedisService
  redisOptions:
    url:
    path:
    host: localhost
    port: 6379
    db: 1
    ttl: 5
    password: xxx

  producer:
    host: localhost
    port: 6379
    db: 4
    # username: xxx
    password: xxx

  consumer:
    host: localhost
    port: 6379
    db: 4
    # username: xxx
    password: xxx

  # Queue
  queueOptions:
    prefix: 'syslog:'
    maxLen: 100
    blockTimeout: 280 # some cloud redis timeout is 300

  # RedisMQService
  channels:
    - chat-bot
    - sys-log
  mqOptions:
    verbose: true
    micro: true
    ttl: 200
```
