import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { CacheRedisModule } from "./cache-redis/redis.client.module";

@Module({
    imports:[CacheRedisModule],
    providers:[],
    controllers:[AppController]
})
export class ApplicationModule{}