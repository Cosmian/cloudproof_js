/* tslint:disable:max-classes-per-file */
import {
    webassembly_create_decryption_cache,
    webassembly_destroy_decryption_cache,
    webassembly_decrypt_hybrid_header_using_cache,
    webassembly_decrypt_hybrid_header,
    webassembly_decrypt_hybrid_block,
    webassembly_get_encrypted_header_size
} from "../../../../../wasm_lib/abe/abe_gpsw"
import { logger } from "../../../../utils/logger"
import { fromBeBytes } from "../../../../utils/utils"


const SYMMETRIC_KEY_SIZE = 32

export class ClearTextHeader {
    private _symmetricKey: Uint8Array
    private _uid: Uint8Array

    /* Getter / Setters */
    public get uid(): Uint8Array {
        return this._uid
    }
    public set uid(value: Uint8Array) {
        this._uid = value
    }

    public get symmetricKey(): Uint8Array {
        return this._symmetricKey
    }
    public set symmetricKey(value: Uint8Array) {
        this._symmetricKey = value
    }

    constructor(symmetricKey: Uint8Array, uid: Uint8Array) {
        this._symmetricKey = symmetricKey
        this._uid = uid;
    }
}

export abstract class HybridDecryption {
    private _asymmetricDecryptionKey: Uint8Array

    public set asymmetricDecryptionKey(value: Uint8Array) {
        this._asymmetricDecryptionKey = value
    }
    public get asymmetricDecryptionKey(): Uint8Array {
        return this._asymmetricDecryptionKey
    }

    constructor(asymmetricDecryptionKey: Uint8Array) {
        this._asymmetricDecryptionKey = asymmetricDecryptionKey
    }

    public abstract destroyInstance(): void

    /**
     *
     * @param asymmetricHeader asymmetric encrypted data
     */
    public abstract decryptHybridHeader(asymmetricHeader: Uint8Array): ClearTextHeader

    /**
     * Decrypts a hybrid block
     *
     * @param symmetricKey symmetric key
     * @param encryptedBytes encrypted data
     * @param uid uid used as additional data
     * @param blockNumber
     * @returns the cleartext if everything succeeded
     */
    public abstract decryptHybridBlock(symmetricKey: Uint8Array, encryptedBytes: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array

    /**
     * Return the size of the header
     * @param encryptedBytes the hybrid encrypted bytes
     */
    public abstract getHeaderSize(encryptedBytes: Uint8Array): number
}

/**
 * This class exposes the ABE primitives.
 *
 */
export class AbeHybridDecryption extends HybridDecryption {

    private _cache: number


    constructor(userDecryptionKey: Uint8Array) {
        super(userDecryptionKey)
        // Create decryption cache. This number is linked to the user decryption key
        this._cache = webassembly_create_decryption_cache(userDecryptionKey)
    }

    /**
     * Destroy decryption cache
     */
    public destroyInstance() {
        logger.log(() => "DestroyInstance Abe")
        webassembly_destroy_decryption_cache(this._cache)
    }

    parseCleartextHeader(cleartextHeader: Uint8Array): ClearTextHeader {
        if (cleartextHeader.length < SYMMETRIC_KEY_SIZE + 4 + 4) {
            throw new Error("Invalid cleartext");
        }
        const symmetricKeySize = fromBeBytes(cleartextHeader.slice(0, 4))
        const symmetricKey = cleartextHeader.slice(4, 4 + symmetricKeySize)
        const uidSize = fromBeBytes(cleartextHeader.slice(4 + symmetricKeySize, 4 + symmetricKeySize + 4))
        const uid = cleartextHeader.slice(4 + symmetricKeySize + 4, 4 + symmetricKeySize + 4 + uidSize)
        return new ClearTextHeader(symmetricKey, uid)

    }
    /**
     * Decrypts an ABE ciphertext using the given user decryption key in cache. Must return cleartext value if correct user key (meaning, the correct access policy) has been given.
     * This function is using a cache to store the user decryption key.
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public decryptHybridHeader(abeHeader: Uint8Array): ClearTextHeader {
        // logger.log(() => "cache: " + this._cache)
        const cleartextHeader = webassembly_decrypt_hybrid_header_using_cache(this._cache, abeHeader)
        return this.parseCleartextHeader(cleartextHeader)
    }

    /**
     * Decrypts an ABE ciphertext using the given user decryption key. Must return cleartext value if correct user key (meaning, the correct access policy) has been given
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public decryptHybridHeaderNoCache(abeHeader: Uint8Array): ClearTextHeader {
        const cleartextHeader = webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
        return this.parseCleartextHeader(cleartextHeader)
    }

    /**
     * Decrypts a AES256-GCM block
     *
     * @param symmetricKey AES key
     * @param encryptedBytes encrypted data
     * @param uid uid used as additional data
     * @param blockNumber
     * @returns the cleartext if everything succeeded
     */
    public decryptHybridBlock(symmetricKey: Uint8Array, encryptedBytes: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array {
        return webassembly_decrypt_hybrid_block(
            symmetricKey,
            uid,
            blockNumber,
            encryptedBytes)
    }

    /**
     * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
     *
     * @param uid integrity parameter used when encrypting
     * @param encryptedData
     * @returns a list of cleartext values
     */
    public decrypt(encryptedData: Uint8Array): Uint8Array {
        logger.log(() => "decrypt for encryptedData: " + encryptedData)

        // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
        const headerSize = webassembly_get_encrypted_header_size(encryptedData)
        const asymmetricHeader = encryptedData.slice(4, 4 + headerSize)
        const encryptedSymmetricBytes = encryptedData.slice(4 + headerSize, encryptedData.length)

        //
        logger.log(() => "decrypt for headerSize: " + headerSize)
        logger.log(() => "decrypt for asymmetricHeader: " + asymmetricHeader)

        // HEADER decryption: asymmetric decryption
        const cleartextHeader = this.decryptHybridHeader(asymmetricHeader)

        // AES_DATA: AES Symmetric part decryption
        const cleartext = this.decryptHybridBlock(cleartextHeader.symmetricKey, encryptedSymmetricBytes, cleartextHeader.uid, 0)
        logger.log(() => "cleartext: " + new TextDecoder().decode(cleartext))
        return cleartext
    }

    /**
     * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
     *
     * @param databaseEntries a map of database entries (uid, encrypted_data) to decrypt
     * @returns a list of cleartext values
     */
    public decryptBatch(databaseEntries: Uint8Array[]): Uint8Array[] {
        const cleartextValues: Uint8Array[] = []
        databaseEntries.forEach((encryptedValue: Uint8Array) => {
            const cleartext = this.decrypt(encryptedValue)
            logger.log(() => "cleartext: " + new TextDecoder().decode(cleartext))
            cleartextValues.push(cleartext)
        })

        return cleartextValues
    }

    /**
     * Bench ABE decryption using a cache and without cache
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public benchDecryptHybridHeader(abeHeader: Uint8Array): number[] {
        logger.log(() => "benchDecryptHybridHeader for abeHeader: " + abeHeader)

        const loops = 100
        let startDate = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
        }
        let endDate = new Date().getTime()
        const msNoCache = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time (no cache): " + msNoCache + "ms")

        // With cache
        const cache = webassembly_create_decryption_cache(this.asymmetricDecryptionKey)
        startDate = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_decrypt_hybrid_header_using_cache(cache, abeHeader)
        }
        endDate = new Date().getTime()
        const msCache = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time (with cache): " + msCache + "ms")
        webassembly_destroy_decryption_cache(cache)

        return [msNoCache, msCache]
    }

    public getHeaderSize(encryptedBytes: Uint8Array): number {
        return webassembly_get_encrypted_header_size(encryptedBytes)
    }
}

export type DecryptionWorkerMessage = {
    name:
    'INIT' |
    'DESTROY' |
    'DECRYPT' |
    'SUCCESS' |
    'ERROR',
    error?: string
    value?: any
}
