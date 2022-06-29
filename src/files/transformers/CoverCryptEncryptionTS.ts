/**
 * Copyright Cosmian 2021 -
 */

import { TransformStream, Transformer } from "web-streams-polyfill"
import { CoverCryptHybridEncryption } from "../../crypto/hybrid_crypto/abe/cover_crypt/encryption"
import { AbeEncryptionParameters } from "../../crypto/hybrid_crypto/abe/encryption_parameters"
import { Metadata } from "../../crypto/hybrid_crypto/abe/metadata"
import { hexDecode } from "../../lib"
import { logger } from "../../utils/logger"
import { toBeBytes } from "../../utils/utils"

class CoverCryptEncryptionTransformer implements Transformer<Uint8Array, Uint8Array> {


    private hybridCrypto: CoverCryptHybridEncryption

    private attributes: string[]

    private uid: Uint8Array

    private symmetricKey: Uint8Array | undefined

    private blockNumber: number

    constructor(publicKey: Uint8Array, policy: Uint8Array, attributes: string[], uid: Uint8Array) {
        this.hybridCrypto = new CoverCryptHybridEncryption(policy, publicKey)
        this.attributes = attributes
        this.uid = uid
        this.symmetricKey = undefined
        this.blockNumber = 0
    }

    /**
     * A function that is called immediately during creation of the {@link TransformStream}.
     */
    start(controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.log(() => "CoverCrypt encryption transformer start")

            try {
                // // write/enqueue the header 
                const encryptionParameters = new AbeEncryptionParameters(this.attributes, new Metadata(this.uid, new Uint8Array(1)))
                const encryptedHeader = this.hybridCrypto.encryptHybridHeader(encryptionParameters)
                this.symmetricKey = encryptedHeader.symmetricKey
                // the size of the header as a U32 big endian (4 bytes)
                controller.enqueue(new Uint8Array(encryptedHeader.encryptedSymmetricKeySizeAsArray))
                // BGR: had to wrap into a new Uint8Array to avoid strange enqueuing issues
                controller.enqueue(new Uint8Array(encryptedHeader.encryptedSymmetricKey))
                return resolve()
            } catch (error) {
                logger.log(() => "CoverCrypt encryption transformer ERROR: " + error)
                controller.error(error)
                return reject(error)
            }
        })
    }

    /**
     * A function called when a new chunk originally written to the writable side is ready to be transformed.
     */
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {


        return new Promise((resolve, reject) => {
            logger.log(() => "CoverCrypt encryption transformer: enqueue " + chunk.length + " bytes")
            if (typeof this.symmetricKey === 'undefined') {
                return reject("CoverCrypt decryption error: the symmetric key was not decrypted from the header")
            }
            this.blockNumber += 1
            let ct = this.hybridCrypto.encryptHybridBlock(this.symmetricKey, chunk, this.uid, this.blockNumber)
            // the size of the symmetrically encrypted content as a U32 big endian (4 bytes)
            let ctSizeAsArray = toBeBytes(ct.length)
            controller.enqueue(ctSizeAsArray)
            controller.enqueue(ct)
            resolve()
        })
    }

    /**
     * A function called after all chunks written to the writable side have been transformed by successfully passing
     * through {Transformer.transform | transform()}, and the writable side is about to be closed.
     */
    flush(controller: TransformStreamDefaultController<Uint8Array>): void | PromiseLike<void> {
        logger.log(() => "CoverCrypt encryption transformer flush")
    }

}

export class CoverCryptEncryptionTS extends TransformStream {
    constructor(publicKey: Uint8Array, policy: Uint8Array, attributes: string[], uid: Uint8Array) {
        super(new CoverCryptEncryptionTransformer(publicKey, policy, attributes, uid))
    }
}