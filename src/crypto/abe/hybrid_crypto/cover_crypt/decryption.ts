/* tslint:disable:max-classes-per-file */
import { webassembly_decrypt_symmetric_block, webassembly_decrypt_hybrid_header, webassembly_hybrid_decrypt } from "cover_crypt"
import { logger } from "../../../../utils/logger"
import { toBeBytes } from "../../../../utils/utils"
import { ClearTextHeader } from "../cleartext_header"
import { HybridDecryption } from "../interfaces/decryption"

/**
 * This class exposes the ABE primitives.
 *
 */
export class CoverCryptHybridDecryption extends HybridDecryption {

    constructor(userDecryptionKey: Uint8Array) {
        super(userDecryptionKey)
    }

    public renewKey(userDecryptionKey: Uint8Array): void {
        this.asymmetricDecryptionKey = userDecryptionKey
    }

    /**
     * Destroy ABE instance
     */
    public destroyInstance() {
        logger.log(() => "DestroyInstance Abe")
    }

    toAssociatedData(uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array {

        if (blockNumber == undefined) {
            blockNumber = 0
        }
        if (uid == undefined) {
            uid = new Uint8Array(0);
        }
        var bn = toBeBytes(blockNumber)
        var associated_data = new Uint8Array(uid?.length + toBeBytes(blockNumber).length)
        associated_data.set(uid)
        associated_data.set(bn, uid.length)
        return associated_data
    }


    /**
     * Decrypts an ABE ciphertext using the given user decryption key. Must return cleartext value if correct user key (meaning, the correct access policy) has been given.
     *
     * @param abeHeader ABE encrypted value
     * @returns cleartext decrypted ABE value
     */
    public decryptHybridHeader(abeHeader: Uint8Array): ClearTextHeader {
        const cleartextHeader = webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
        return ClearTextHeader.parseLEB128(cleartextHeader)
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
        return webassembly_decrypt_symmetric_block(
            symmetricKey,
            this.toAssociatedData(uid, blockNumber),
            encryptedBytes)
    }

    /**
     * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
     *
     * @param encryptedData
     * @returns a list of cleartext values
     */
    public decrypt(encryptedData: Uint8Array): Uint8Array {
        logger.log(() => "decrypt for encryptedData: " + encryptedData)

        // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
        return webassembly_hybrid_decrypt(
            this.asymmetricDecryptionKey,
            encryptedData,
        )
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
     * Bench ABE decryption
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
        const ms = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time: " + ms + "ms")

        return [ms, -1]
    }

    public getHeaderSize(_encryptedBytes: Uint8Array): number | undefined {
        return undefined
    }
}
