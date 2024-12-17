import { IoRedisModuleError } from "../errors";


export function validMQChannelNames(channels:string[]):string[]{
    const c = channels.reduce((prev,curr)=>{
        if(!prev.includes(curr)){
            prev.push(curr)
        }
        return prev
    },[])
    if(!c?.length)
        throw new IoRedisModuleError(`MQ configuration channels invalid.`)
    for(let i=0;i<c.length; i++){
        if(!/^[a-z]+(\-[a-z0-9\_]+)?$/.test(c[i])){
            throw new IoRedisModuleError(`MQ configuration channel name [${c[i]}] invalid.`)
        }
    }

    return c
}