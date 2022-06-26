/**
 * Copyright Cosmian 2021 -
 */

import { TransformStream, Transformer } from "web-streams-polyfill"

class EncryptionTransformer implements Transformer<Uint8Array, Uint8Array> {

    private public_key: string
    private block_number: number

    constructor(public_key: string) {
        this.public_key = public_key
        this.block_number = 0
    }

    /**
     * A function that is called immediately during creation of the {@link TransformStream}.
     */
    start(controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("encryption transformer start")
            resolve()
            // try {
            //     // write/enqueue the header 
            //     let bytes = this.hybrid_crypto.header_to_bytes(this.header, this.public_key)
            //     controller.enqueue(bytes)
            //     resolve()
            // } catch (error) {
            //     controller.error(error)
            //     reject(error)
            // }
        })
    }

    /**
     * A function called when a new chunk originally written to the writable side is ready to be transformed.
     */
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("encryption transformer: enqueue " + chunk.length + " bytes")
            controller.enqueue(chunk)
            resolve()
            // // check data does not exceed block clear text length
            // if (chunk.length > HybridCrypto.block_max_clear_text_len()) {
            //     return reject(`Invalid chunk of length ${chunk.length}. Max length: ${HybridCrypto.block_max_clear_text_len()} `)
            // }
            // try {
            //     // Generate a block
            //     let bytes = this.hybrid_crypto.encrypt_block(chunk, this.header, this.block_number)
            //     controller.enqueue(bytes)
            //     // console.log(`encrypting block of size: ${chunk.length} -> ${bytes.length}`)
            //     this.block_number += 1
            //     resolve()
            // } catch (error) {
            //     controller.error(error)
            //     reject(error)
            // }
        })
    }

    /**
     * A function called after all chunks written to the writable side have been transformed by successfully passing
     * through {@link Transformer.transform | transform()}, and the writable side is about to be closed.
     */
    flush(controller: TransformStreamDefaultController<Uint8Array>): void | PromiseLike<void> {
        console.log("encryption transformer flush")
    }

}

export class EncryptionTransformStream extends TransformStream {


    constructor(public_key: string) {
        super(new EncryptionTransformer(public_key))
    }

    // static max_clear_text_length(): number {
    //     return HybridCrypto.block_max_clear_text_len()
    // }

}