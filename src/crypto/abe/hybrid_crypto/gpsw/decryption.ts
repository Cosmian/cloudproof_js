/* tslint:disable:max-classes-per-file */
import {
    webassembly_create_decryption_cache, webassembly_decrypt_hybrid_block, webassembly_decrypt_hybrid_header, webassembly_decrypt_hybrid_header_using_cache, webassembly_destroy_decryption_cache, webassembly_get_encrypted_header_size
} from "../../../../../wasm_lib/abe/gpsw/abe_gpsw"
import { logger } from "../../../../utils/logger"
import { ClearTextHeader, HybridDecryption } from "../hybrid_crypto"


/**
 * This class exposes the ABE primitives.
 *
 */
export class GpswHybridDecryption extends HybridDecryption {

    private _cache: number


    constructor(userDecryptionKey: Uint8Array) {
        super(userDecryptionKey)
        // Create decryption cache. This number is linked to the user decryption key
        this._cache = webassembly_create_decryption_cache(userDecryptionKey)
    }

    public renew_key(userDecryptionKey: Uint8Array): void {
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

    /**
     * Decrypts an ABE ciphertext using the given user decryption key in cache. Must return cleartext value if correct user key (meaning, the correct access policy) has been given.
     * This function is using a cache to store the user decryption key.
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public decryptHybridHeader(abeHeader: Uint8Array): ClearTextHeader {
        // logger.log(() => "cache: " + this._cache)
        const clearTextHeader = webassembly_decrypt_hybrid_header_using_cache(this._cache, abeHeader)
        return ClearTextHeader.parseRaw(clearTextHeader)

    }

    /**
     * Decrypts an ABE ciphertext using the given user decryption key. Must return cleartext value if correct user key (meaning, the correct access policy) has been given
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public decryptHybridHeaderNoCache(abeHeader: Uint8Array): Uint8Array {
        return webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
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
        logger.log(() => "decrypt: encryptedData: " + encryptedData)

        // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
        const headerSize = webassembly_get_encrypted_header_size(encryptedData)
        const asymmetricHeader = encryptedData.slice(4, 4 + headerSize)
        const encryptedSymmetricBytes = encryptedData.slice(4 + headerSize, encryptedData.length)

        //
        logger.log(() => "decrypt: headerSize: " + headerSize)
        logger.log(() => "decrypt: asymmetricHeader: " + asymmetricHeader)
        logger.log(() => "decrypt for asymmetricHeader (size): " + asymmetricHeader.length)

        // HEADER decryption: asymmetric decryption
        const cleartextHeader = this.decryptHybridHeader(asymmetricHeader)
        logger.log(() => "decrypt: metadata: " + cleartextHeader.metadata)

        // AES_DATA: AES Symmetric part decryption
        const cleartext = this.decryptHybridBlock(cleartextHeader.symmetricKey, encryptedSymmetricBytes, cleartextHeader.metadata.uid, 0)
        logger.log(() => "cleartext: " + new TextDecoder().decode(cleartext))
        return cleartext
    }

    /**
     * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
     *
     * @param databaseEntries a list of encrypted database entries to decrypt
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
        const startDate = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
        }
        const endDate = new Date().getTime()
        const msNoCache = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time (no cache): " + msNoCache + "ms")

        // With cache
        const cache = webassembly_create_decryption_cache(this.asymmetricDecryptionKey)
        const start = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_decrypt_hybrid_header_using_cache(cache, abeHeader)
        }
        const end = new Date().getTime()
        const msCache = (end - start) / (loops)
        logger.log(() => "webassembly-JS avg time (with cache): " + msCache + "ms")
        webassembly_destroy_decryption_cache(cache)

        return [msNoCache, msCache]
    }

    public getHeaderSize(encryptedBytes: Uint8Array): number {
        return webassembly_get_encrypted_header_size(encryptedBytes)
    }
}
