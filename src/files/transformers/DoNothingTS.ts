/**
 * Copyright Cosmian 2021 -
 */

import { TransformStream, Transformer } from "web-streams-polyfill"
import { CoverCryptHybridEncryption } from "../../crypto/abe/hybrid_crypto/cover_crypt/encryption"
import { AbeEncryptionParameters } from "../../crypto/abe/hybrid_crypto/encryption_parameters"
import { Metadata } from "../../crypto/abe/hybrid_crypto/metadata"
import { hexDecode } from "../../lib"
import { logger } from "../../utils/logger"
import { toBeBytes } from "../../utils/utils"

class DoNothingTransformer implements Transformer<Uint8Array, Uint8Array> {


    constructor() {
    }

    /**
     * A function that is called immediately during creation of the {@link TransformStream}.
     */
    start(controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.log(() => "do nothing transformer start")
            return resolve()
        })
    }

    /**
     * A function called when a new chunk originally written to the writable side is ready to be transformed.
     */
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {


        return new Promise((resolve, reject) => {
            logger.log(() => "do nothing transformer: enqueue " + chunk.length + " bytes")
            controller.enqueue(chunk)
            resolve()
        })
    }

    /**
     * A function called after all chunks written to the writable side have been transformed by successfully passing
     * through {Transformer.transform | transform()}, and the writable side is about to be closed.
     */
    flush(controller: TransformStreamDefaultController<Uint8Array>): void | PromiseLike<void> {
        logger.log(() => "do nothing transformer flush")
    }

}

export class DoNothingTS extends TransformStream {
    constructor() {
        super(new DoNothingTransformer())
    }
}