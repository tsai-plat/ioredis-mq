
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from '../src/app.module';

describe('IORedisMQModule-> RedisService',()=>{
    let server :Server
    let app:INestApplication

    beforeEach(async ()=>{
        const module = await Test.createTestingModule({
            imports:[ApplicationModule]
        }).compile()

        app = module.createNestApplication()
        server = app.getHttpServer()
        await app.init()
    })
    const key = 'tsai-rds-key'
    const val = '@tsailab/ioredis-mq'
    const returnOk = 'OK'

    it(`should return set redis value success`, async ()=>{
        return request(server).post('/e2e/rediscli/set').send({key,value:val}).expect(200);
    })


    // it(`should return get redis value expect`, ()=>{
    //     const url = `/e2e/rediscli/get/spec_key`
    //     return request(server).post(url).expect(200);
    // })

    afterEach(async ()=>{
        await app.close()
    })
})