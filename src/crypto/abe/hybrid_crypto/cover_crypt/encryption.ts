import { webassembly_encrypt_symmetric_block, webassembly_encrypt_hybrid_header, webassembly_hybrid_encrypt } from "cover_crypt";
import { logger } from "../../../../utils/logger";
import { toBeBytes } from "../../../../utils/utils";
import { EncryptedHeader } from "../encrypted_header";
import { AbeEncryptionParameters } from "../encryption_parameters";
import { HybridEncryption } from "../interfaces/encryption";
import { Metadata } from "../metadata";


/**
 * This class exposes the ABE primitives.
 *
 */
export class CoverCryptHybridEncryption extends HybridEncryption {
    constructor(policy: Uint8Array, publicKey: Uint8Array,) {
        super(policy, publicKey)
    }

    public renewKey(policy: Uint8Array, publicKey: Uint8Array): void {
        this.policy = policy
        this.publicKey = publicKey
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

        logger.log(() => "hybrid header succeeded: " + encryptedHeaderBytes);

        return EncryptedHeader.parseLEB128(encryptedHeaderBytes)
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
     * Encrypts a AES256-GCM block
     *
     * @param symmetricKey AES key
     * @param plaintext encrypted data
     * @param uid uid used as additional data
     * @param blockNumber
     * @returns the cleartext if everything succeeded
     */
    public encryptSymmetricBlock(symmetricKey: Uint8Array, plaintext: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array {
        return webassembly_encrypt_symmetric_block(
            symmetricKey,
            plaintext,
            this.toAssociatedData(uid, blockNumber))
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
        const encryptedData = webassembly_hybrid_encrypt(
            encryptionParameters.metadata.toJsonEncoded(),
            this.policy,
            new TextEncoder().encode(JSON.stringify(encryptionParameters.attributes)),
            this.publicKey,
            plaintext)

        return encryptedData
    }

    /**
     * Bench ABE encryption
     *
     * @param attributes ABE attributes used for encryption
     * @param uid header integrity param
     * @returns timings for encryption
     */
    public benchEncryptHybridHeader(attributes: string[], uid: Uint8Array): number[] {
        const loops = 100
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

        return [ms, -1]
    }
}
