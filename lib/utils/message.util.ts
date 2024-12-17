

import {randomUUID} from 'crypto'

/**
 * 
 * @returns msgid
 */
export  function  createMessageId():string{
    const uuid = randomUUID().replace(/\-/g,'')
    const msgid = BigInt(`0x${uuid}`).toString(36)
    return msgid
}

export function genMQClientId():string {
    const uuid = randomUUID().replace(/\-/g,'')
    const id = BigInt(`0x${uuid}`).toString(36)
    return `@@${id}@@`
}