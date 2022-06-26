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

class CoverCryptEncryptionTransformer implements Transformer<Uint8Array, Uint8Array> {


    private hybridCrypto: CoverCryptHybridEncryption

    private attributes: string[]

    private uid: Uint8Array

    private symmetricKey: Uint8Array | undefined

    private blockNumber: number

    private totalBytes: number

    constructor(publicKey: Uint8Array, policy: Uint8Array, attributes: string[], uid: Uint8Array) {
        this.hybridCrypto = new CoverCryptHybridEncryption(policy, publicKey)
        this.attributes = attributes
        this.uid = uid
        this.symmetricKey = undefined
        this.blockNumber = 0
        this.totalBytes = 0
    }

    /**
     * A function that is called immediately during creation of the {@link TransformStream}.
     */
    start(controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {

            try {
                // // write/enqueue the header 
                const encryptionParameters = new AbeEncryptionParameters(this.attributes, new Metadata(this.uid))
                const encryptedHeader = this.hybridCrypto.encryptHybridHeader(encryptionParameters)
                this.symmetricKey = encryptedHeader.symmetricKey
                // the size of the header as a U32 big endian (4 bytes)
                // let sizeBytes = new Uint8Array(encryptedHeader.encryptedSymmetricKeySizeAsArray)
                let sizeBytes = toBeBytes(encryptedHeader.encryptedSymmetricKey.length)
                controller.enqueue(sizeBytes)
                // BGR: had to wrap into a new Uint8Array to avoid strange enqueuing issues
                let bytes = new Uint8Array(encryptedHeader.encryptedSymmetricKey)
                controller.enqueue(bytes)
                this.totalBytes += sizeBytes.length + bytes.length
                logger.log(() => "CoverCrypt encryption transformer: enc. header size: " + bytes.length + (" (key size: " + this.symmetricKey?.length + ")"))
                return resolve()
            } catch (error) {
                let err = "CoverCrypt encryption transformer ERROR: " + error
                logger.log(() => err)
                controller.error(err)
                return reject(err)
            }
        })
    }

    /**
     * A function called when a new chunk originally written to the writable side is ready to be transformed.
     */
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof this.symmetricKey === 'undefined') {
                return reject("CoverCrypt decryption error: the symmetric key was not decrypted from the header")
            }
            let ct = this.hybridCrypto.encryptHybridBlock(this.symmetricKey, chunk, this.uid, this.blockNumber)
            // the size of the symmetrically encrypted content as a U32 big endian (4 bytes)
            let ctSizeAsArray = toBeBytes(ct.length)
            controller.enqueue(ctSizeAsArray)
            controller.enqueue(ct)
            this.totalBytes += ctSizeAsArray.length + ct.length
            logger.log(() => "CoverCrypt symmetrically encrypted " + chunk.length + " bytes -> CT: " + ct.length + " bytes, block number: " + this.blockNumber)
            this.blockNumber += 1
            resolve()
        })
    }

    /**
     * A function called after all chunks written to the writable side have been transformed by successfully passing
     * through {Transformer.transform | transform()}, and the writable side is about to be closed.
     */
    flush(controller: TransformStreamDefaultController<Uint8Array>): void | PromiseLike<void> {
        logger.log(() => "CoverCrypt encryption transformer flush; total bytes: " + this.totalBytes)
        controller.terminate()
    }

}

export class CoverCryptEncryptionTS extends TransformStream {
    constructor(publicKey: Uint8Array, policy: Uint8Array, attributes: string[], uid: Uint8Array) {
        super(new CoverCryptEncryptionTransformer(publicKey, policy, attributes, uid))
    }
}