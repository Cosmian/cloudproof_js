/* tslint:disable:max-classes-per-file */
import {
    webassembly_encrypt_hybrid_block, webassembly_encrypt_hybrid_header
} from "../../../../../wasm_lib/abe/cover_crypt";
import { logger } from "../../../../utils/logger";
import { hexEncode } from "../../../../utils/utils";
import { EncryptedHeader, EncryptionParameters, HybridEncryption } from "../../hybrid_crypto";
import { Metadata } from "./metadata";


export class AbeEncryptionParameters extends EncryptionParameters {
    // ABE attributes as a string: for example: ["Department::FIN" , "Security Level::Confidential"]
    private _attributes: string[]
    // Metadata used to save integrity parameter and additional data
    private _metadata: Metadata;

    constructor(attributes: string[], metadata: Metadata) {
        super()
        this._attributes = attributes
        this._metadata = metadata
    }

    public get attributes(): string[] {
        return this._attributes
    }
    public set attributes(value: string[]) {
        this._attributes = value
    }
    public get metadata(): Metadata {
        return this._metadata;
    }
    public set metadata(value: Metadata) {
        this._metadata = value;
    }
}

/**
 * This class exposes the ABE primitives.
 *
 */
export class AbeHybridEncryption extends HybridEncryption {
    constructor(policy: Uint8Array, publicKey: Uint8Array,) {
        super(policy, publicKey)
    }

    /**
     * Destroy encryption
     */
    public destroyInstance() {
        logger.log(() => "DestroyInstance Abe")
    }

    /**
     * Generate and encrypt a symmetric key using the public key and policy. Must return ciphertext value if everything went well
     *
     * @param parameters ABE encryption parameters
     * @returns an encrypted header witch contains the clear and encrypted symmetric key
     */
    public encryptHybridHeader(parameters: AbeEncryptionParameters): EncryptedHeader {
        const encryptedHeaderBytes = webassembly_encrypt_hybrid_header(
            parameters.metadata.toJsonEncoded(),
            this.policy,
            new TextEncoder().encode(JSON.stringify(parameters.attributes)),
            this.publicKey)
        logger.log(() => "hybrid header succeeded");

        return EncryptedHeader.parse(encryptedHeaderBytes)
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
        const encryptionParameters = new AbeEncryptionParameters(attributes, new Metadata(uid, new Uint8Array(1)))
        const hybridHeader = this.encryptHybridHeader(encryptionParameters)
        logger.log(() => "encrypt: symmetricKey:" + hybridHeader.symmetricKey)
        logger.log(() => "encrypt: encryptedSymmetricKeySizeAsArray:" + hybridHeader.encryptedSymmetricKeySizeAsArray)
        const ciphertext = this.encryptHybridBlock(hybridHeader.symmetricKey, plaintext,
            uid,
            0)

        logger.log(() => "encrypt: header size : " + hexEncode(hybridHeader.encryptedSymmetricKeySizeAsArray))
        logger.log(() => "encrypt: enc header size : " + hybridHeader.encryptedSymmetricKey.length)
        logger.log(() => "encrypt: encrypted symmetric key : " + hybridHeader.encryptedSymmetricKey)
        logger.log(() => "encrypt: ciphertext : " + ciphertext)

        // Encrypted value is composed of: HEADER_LEN (4 bytes) | HEADER | AES_DATA
        const headerSize = hybridHeader.encryptedSymmetricKeySizeAsArray.length
        const encryptedData = new Uint8Array(headerSize + hybridHeader.encryptedSymmetricKey.length + ciphertext.length)
        encryptedData.set(hybridHeader.encryptedSymmetricKeySizeAsArray)
        encryptedData.set(hybridHeader.encryptedSymmetricKey, headerSize)
        encryptedData.set(ciphertext, headerSize + hybridHeader.encryptedSymmetricKey.length)
        return encryptedData
    }

    /**
     * Bench ABE encryption
     *
     * @param publicKey the master public key
     * @param policy the policy serialized
     * @param attributes ABE attributes used for encryption
     * @param uid header integrity param
     * @returns timings for encryption
     */
    public benchEncryptHybridHeader(attributes: string[], uid: Uint8Array): number {
        const loops = 1000
        const startDate = new Date().getTime()
        const metadata = new Metadata(uid)
        for (let i = 0; i < loops; i++) {
            webassembly_encrypt_hybrid_header(
                metadata.toJsonEncoded(),
                this.policy,
                new TextEncoder().encode(JSON.stringify(attributes)),
                this.publicKey)
        }
        const endDate = new Date().getTime()
        const ms = (endDate - startDate) / (loops)
        logger.log(() => "webassembly-JS avg time: " + ms + "ms")

        return ms
    }
}

export type EncryptionWorkerMessage = {
    name:
    'INIT' |
    'DESTROY' |
    'ENCRYPT' |
    'SUCCESS' |
    'ERROR',
    error?: string
    value?: any
}
