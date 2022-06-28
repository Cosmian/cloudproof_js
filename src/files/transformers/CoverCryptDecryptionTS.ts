/**
 * Copyright Cosmian 2021 -
 */

import { TransformStream, Transformer } from "web-streams-polyfill"
import { logger } from "../../utils/logger"

class CoverCryptDecryptionTransformer implements Transformer<Uint8Array, Uint8Array> {

    private private_key: string

    constructor(private_key: string) {
        this.private_key = private_key
    }

    /**
    * A function that is called immediately during creation of the {@link TransformStream}.
    */
    start(controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        console.log("decryption transformer start")
        return Promise.resolve()
    }

    /**
    * A function called when a new chunk originally written to the writable side is ready to be transformed.
    */
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {

            console.log("decryption transformer transform " + chunk.length + " bytes")
            resolve()

            // if (this.header == null) {
            //     // this should be the first chunk containing the header
            //     if (chunk.length != HybridCrypto.header_len()) {
            //         return reject(`Invalid encrypted chunk of length ${chunk.length}. The header length should be: ${HybridCrypto.header_len()} `)
            //     }
            //     try {
            //         this.header = this.hybrid_crypto.header_from_bytes(chunk, this.private_key)
            //         return resolve()
            //     } catch (error) {
            //         console.error("header parsing error: ", error)
            //         controller.error(error)
            //         return reject(error)
            //     }
            // }

            // // check data does not exceed block clear text length
            // if (chunk.length > HybridCrypto.block_max_encrypted_len()) {
            //     return reject(`Invalid encrypted chunk of length ${chunk.length}. Max length: ${HybridCrypto.block_max_encrypted_len()} `)
            // }
            // try {
            //     // decrypt block
            //     let bytes = this.hybrid_crypto.decrypt_block(chunk, this.header, this.block_number)
            //     controller.enqueue(bytes)
            //     // console.log(`decrypted block of size: ${chunk.length} -> ${bytes.length}`)
            //     this.block_number += 1
            //     resolve()
            // } catch (error) {
            //     console.error("encrypted block parsing error: ", error)
            //     controller.error(error)
            //     reject(error)
            // }
        })
    }

    flush(controller: TransformStreamDefaultController<Uint8Array>): void | PromiseLike<void> {
        logger.log(() => "decryption transformer flush")
    }

}

export class CoverCryptDecryptionTS extends TransformStream {


    constructor(private_key: string) {
        super(new CoverCryptDecryptionTransformer(private_key))
    }

    // static max_encrypted_length(): number {
    //     return HybridCrypto.block_max_encrypted_len()
    // }

    // static header_length(): number {
    //     return HybridCrypto.header_len()
    // }

}