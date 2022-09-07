import {
    webassembly_create_encryption_cache, webassembly_destroy_encryption_cache, webassembly_encrypt_hybrid_block, webassembly_encrypt_hybrid_header, webassembly_encrypt_hybrid_header_using_cache
} from "abe_gpsw"
import { logger } from "../../../../utils/logger"
import { EncryptedHeader } from "../encrypted_header"
import { AbeEncryptionParameters } from "../encryption_parameters"
import { HybridEncryption } from "../interfaces/encryption"
import { Metadata } from "../metadata"


/**
 * This class exposes the ABE primitives.
 *
 */
export class GpswHybridEncryption extends HybridEncryption {

    private _cache: number


    constructor(policy: Uint8Array, publicKey: Uint8Array) {
        super(policy, publicKey)
        // Create encryption cache. This number is linked to the public key and policy
        this._cache = webassembly_create_encryption_cache(policy, publicKey)
    }

    public renew_key(policy: Uint8Array, publicKey: Uint8Array): void {
        // Create encryption cache. This number is linked to the public key and policy
        this._cache = webassembly_create_encryption_cache(policy, publicKey)
    }

    /**
     * Destroy encryption cache
     */
    public destroyInstance() {
        logger.log(() => "DestroyInstance Abe")
        webassembly_destroy_encryption_cache(this._cache)
    }

    attributes_array_to_attributes_string(attrs: string[]): string {
        let attributes = ""
        for (let i = 0; i < attrs.length; i++) {
            attributes += attrs[i]
            if (i !== attrs.length - 1) {
                attributes += ','
            }
        }
        logger.log(() => "attributes concat: " + attributes)
        return attributes;
    }

    /**
     * Generate and encrypt a symmetric key using the public key and policy in cache. Must return ciphertext value if everything went well
     * This function is using a cache to store the public key and ABE policy.
     *
     * @param parameters ABE encryption parameters
     * @returns an encrypted header witch contains the clear and encrypted symmetric key
     */
    public encryptHybridHeader(parameters: AbeEncryptionParameters): EncryptedHeader {
        // logger.log(() => "cache: " + this._cache)
        const attributes = this.attributes_array_to_attributes_string(parameters.attributes)
        const encryptedHeaderBytes = webassembly_encrypt_hybrid_header_using_cache(this._cache, attributes, parameters.metadata.uid)
        const encryptedHeaderSizeAsArray = encryptedHeaderBytes.slice(0, 4);

        // Create a buffer
        const buf = new ArrayBuffer(4);
        // Create a data view of it
        const view = new DataView(buf);
        // set bytes
        encryptedHeaderSizeAsArray.forEach((b: any, i: any) => {
            view.setUint8(i, b);
        });

        // Read the bits as a float; note that by doing this, we're implicitly
        // converting it from a 32-bit float into JavaScript's native 64-bit double
        const symmetricKeySize = view.getUint32(0);

        const encryptedHeader = new EncryptedHeader(
            encryptedHeaderBytes.slice(4, 4 + symmetricKeySize),
            encryptedHeaderBytes.slice(4 + symmetricKeySize, encryptedHeaderBytes.length));
        return encryptedHeader;
    }

    /**
     * Generate and encrypt a symmetric key using the public key and policy in cache. Must return ciphertext value if everything went well
     *
     * @param publicKey the master public key
     * @param policy the policy serialized
     * @param attributes ABE attributes used for encryption
     * @param uid header integrity param
     * @returns ciphertext ABE value
     */
    public encryptHybridHeaderNoCache(publicKey: Uint8Array, policy: Uint8Array, attributes: string, uid: Uint8Array): Uint8Array {
        return webassembly_encrypt_hybrid_header(policy, publicKey, attributes, uid)
    }

    /**
     * Encrypts a AES256-GCM block
     *
     * @param symmetricKey AES key
     * @param plaintext encrypted data
     * @param uid uid used as additional data
     * @param blockNumber
     * @returns the cleartext if everything succeeded
     */
    public encryptHybridBlock(symmetricKey: Uint8Array, plaintext: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array {
        return webassembly_encrypt_hybrid_block(
            symmetricKey,
            uid,
            blockNumber,
            plaintext)
    }

    /**
     * Hybrid encrypt wrapper: ABE encrypt then AES encrypt
     *
     * @param attributes
     * @param uid
     * @param plaintext
     * @returns
     */
    public encrypt(attributes: string[], uid: Uint8Array, plaintext: Uint8Array): Uint8Array {
        logger.log(() => "encrypt for attributes: " + attributes)
        logger.log(() => "encrypt for uid: " + uid)
        logger.log(() => "encrypt for plaintext: " + plaintext)

        // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
        const encryptionParameters = new AbeEncryptionParameters(attributes, new Metadata(uid))
        const hybridHeader = this.encryptHybridHeader(encryptionParameters)
        logger.log(() => "encrypt: symmetricKey:" + hybridHeader.symmetricKey)
        logger.log(() => "encrypt: encryptedSymmetricKeySizeAsArray:" + hybridHeader.encryptedSymmetricKeySizeAsArray)
        const ciphertext = this.encryptHybridBlock(hybridHeader.symmetricKey, plaintext, uid, 0)

        logger.log(() => "encrypt: header size : " + hybridHeader.encryptedSymmetricKeySizeAsArray)
        logger.log(() => "encrypt: encrypted symmetric key : " + hybridHeader.encryptedSymmetricKey)
        logger.log(() => "encrypt: symmetric key : " + hybridHeader.symmetricKey)
        logger.log(() => "encrypt: ciphertext : " + ciphertext)

        // Encrypted value is composed of: HEADER_LEN (4 bytes) | HEADER | AES_DATA
        const encryptedData = new Uint8Array(hybridHeader.encryptedSymmetricKeySizeAsArray.length + hybridHeader.encryptedSymmetricKey.length + ciphertext.length)
        encryptedData.set(hybridHeader.encryptedSymmetricKeySizeAsArray)
        encryptedData.set(hybridHeader.encryptedSymmetricKey, hybridHeader.encryptedSymmetricKeySizeAsArray.length)
        encryptedData.set(ciphertext, hybridHeader.encryptedSymmetricKeySizeAsArray.length + hybridHeader.encryptedSymmetricKey.length)
        return encryptedData
    }

    /**
     * Bench ABE encryption using a cache and without cache
     *
     * @param publicKey the master public key
     * @param policy the policy serialized
     * @param attributes ABE attributes used for encryption
     * @param uid header integrity param
     * @returns timings for encryption without cache and with cache
     */
    public benchEncryptHybridHeader(attributes: string[], uid: Uint8Array): number[] {
        const loops = 10
        const attributesString = this.attributes_array_to_attributes_string(attributes)
        let startDate = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_encrypt_hybrid_header(this.policy, this.publicKey, attributesString, uid)
        }
        let endDate = new Date().getTime()
        const msNoCache = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time (no cache): " + msNoCache + "ms")

        // With cache
        const cache = webassembly_create_encryption_cache(this.policy, this.publicKey)
        startDate = new Date().getTime()
        for (let i = 0; i < loops; i++) {
            webassembly_encrypt_hybrid_header_using_cache(cache, attributesString, uid)
        }
        endDate = new Date().getTime()
        const msCache = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time (with cache): " + msCache + "ms")
        webassembly_destroy_encryption_cache(cache)

        return [msNoCache, msCache]
    }
}
