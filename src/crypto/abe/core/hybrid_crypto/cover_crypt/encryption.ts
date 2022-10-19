import {
  webassembly_encrypt_hybrid_block,
  webassembly_encrypt_hybrid_header,
} from "cosmian_cover_crypt"
import { Policy } from "../../../../../crypto/abe/interfaces/policy"
import { PublicKey } from "../../../../../kms/objects/PublicKey"
import { logger } from "../../../../../utils/logger"
import { hexEncode } from "../../../../../utils/utils"
import { EncryptedHeader } from "../../../interfaces/encrypted_header"
import {
  AbeEncryptionParameters,
  Metadata,
} from "../../../interfaces/encryption_parameters"

/**
 * This class exposes the ABE primitives.
 *
 */
export class CoverCryptHybridEncryption {
  private _publicKey: Uint8Array
  private _policy: Uint8Array

  constructor(policy: Policy | Uint8Array, publicKey: PublicKey | Uint8Array) {
    if (policy instanceof Policy) {
      this._policy = policy.toJsonEncoded()
    } else {
      this._policy = policy
    }
    if (publicKey instanceof PublicKey) {
      this._publicKey = publicKey.bytes()
    } else {
      this._publicKey = publicKey
    }
  }

  public get policy(): Uint8Array {
    return this._policy
  }

  public set policy(value: Uint8Array) {
    this._policy = value
  }

  public set publicKey(value: Uint8Array) {
    this._publicKey = value
  }

  public get publicKey(): Uint8Array {
    return this._publicKey
  }

  public renewKey(policy: Uint8Array, publicKey: Uint8Array): void {
    this.policy = policy
    this.publicKey = publicKey
  }

  /**
   * Destroy encryption
   */
  public destroyInstance(): void {
    logger.log(() => "DestroyInstance Abe")
  }

  /**
   * Generate and encrypt a symmetric key using the public key and policy. Must return ciphertext value if everything went well
   *
   * @param parameters ABE encryption parameters
   * @returns an encrypted header witch contains the clear and encrypted symmetric key
   */
  public encryptHybridHeader(
    parameters: AbeEncryptionParameters
  ): EncryptedHeader {
    const encryptedHeaderBytes = webassembly_encrypt_hybrid_header(
      parameters.metadata.toJsonEncoded(),
      this.policy,
      new TextEncoder().encode(JSON.stringify(parameters.attributes)),
      this.publicKey
    )

    logger.log(() => `hybrid header succeeded: ${hexEncode(encryptedHeaderBytes)}`)

    return EncryptedHeader.parseLEB128(encryptedHeaderBytes)
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
  public encryptHybridBlock(
    symmetricKey: Uint8Array,
    plaintext: Uint8Array,
    uid: Uint8Array | undefined,
    blockNumber: number | undefined
  ): Uint8Array {
    return webassembly_encrypt_hybrid_block(
      symmetricKey,
      uid,
      blockNumber,
      plaintext
    )
  }

  /**
   * Hybrid encrypt wrapper: ABE encrypt then AES encrypt
   *
   * @param attributes
   * @param uid
   * @param plaintext
   * @returns
   */
  public encrypt(
    attributes: string[],
    uid: Uint8Array,
    plaintext: Uint8Array
  ): Uint8Array {
    logger.log(() => `encrypt for attributes: ${attributes.join(',' )}`)
    logger.log(() => `encrypt for uid: ${hexEncode(uid)}`)
    logger.log(() => `encrypt for plaintext: ${hexEncode(plaintext)}`)

    // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
    const encryptionParameters = new AbeEncryptionParameters(
      attributes,
      new Metadata(uid, new Uint8Array(1))
    )
    const hybridHeader = this.encryptHybridHeader(encryptionParameters)
    logger.log(
      () =>
        `encrypt: encryptedSymmetricKeySizeAsArray:${hexEncode(hybridHeader.encryptedSymmetricKeySizeAsArray)}`
    )
    const ciphertext = this.encryptHybridBlock(
      hybridHeader.symmetricKey,
      plaintext,
      uid,
      0
    )

    logger.log(
      () =>
        `encrypt: header size : ${hexEncode(hybridHeader.encryptedSymmetricKeySizeAsArray)}`
    )
    logger.log(
      () =>
        `encrypt: enc header size : ${hybridHeader.encryptedSymmetricKey.length}`
    )
    logger.log(
      () =>
        `encrypt: encrypted symmetric key : ${hexEncode(hybridHeader.encryptedSymmetricKey)}`
    )
    logger.log(() => `encrypt: ciphertext : ${hexEncode(ciphertext)}`)

    // Encrypted value is composed of: HEADER_LEN (4 bytes) | HEADER | AES_DATA
    const headerSize = hybridHeader.encryptedSymmetricKeySizeAsArray.length
    const encryptedData = new Uint8Array(
      headerSize + hybridHeader.encryptedSymmetricKey.length + ciphertext.length
    )
    encryptedData.set(hybridHeader.encryptedSymmetricKeySizeAsArray)
    encryptedData.set(hybridHeader.encryptedSymmetricKey, headerSize)
    encryptedData.set(
      ciphertext,
      headerSize + hybridHeader.encryptedSymmetricKey.length
    )
    logger.log(() => `encrypt: encryptedData: ${hexEncode(encryptedData)}`)

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
  public benchEncryptHybridHeader(
    attributes: string[],
    uid: Uint8Array
  ): number[] {
    const loops = 100
    const startDate = new Date().getTime()
    const metadata = new Metadata(uid)
    for (let i = 0; i < loops; i++) {
      webassembly_encrypt_hybrid_header(
        metadata.toJsonEncoded(),
        this.policy,
        new TextEncoder().encode(JSON.stringify(attributes)),
        this.publicKey
      )
    }
    const endDate = new Date().getTime()
    const ms = (endDate - startDate) / loops
    logger.log(() => `webassembly-JS avg time: ${ms}ms`)

    return [ms, -1]
  }
}
