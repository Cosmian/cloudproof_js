import {
  webassembly_encrypt_symmetric_block,
  webassembly_encrypt_hybrid_header,
  webassembly_hybrid_encrypt,
} from "../../../../../pkg/cover_crypt/cosmian_cover_crypt"
import { Policy } from "../../../../../crypto/abe/interfaces/policy"
import { PublicKey } from "../../../../../kms/structs/objects"
import { logger } from "../../../../../utils/logger"
import { hexEncode } from "../../../../../utils/utils"
import { EncryptedHeader } from "../../../interfaces/encrypted_header"

/**
 * This class exposes the CoverCrypt primitives.
 *
 */
export class CoverCryptHybridEncryption {
  private readonly _publicKey: Uint8Array
  private readonly _policy: Uint8Array

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

  public get publicKey(): Uint8Array {
    return this._publicKey
  }

  /**
   * Generate and encrypt a symmetric key using the public key and policy.
   *
   * @param {string} accessPolicy Encrypt with this access policy
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.headerMetadata Data encrypted in the header
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} encrypted header
   */
  public encryptHybridHeader(
    accessPolicy: string,
    options: {
      headerMetadata?: Uint8Array
      authenticatedData?: Uint8Array
    } = {},
  ): EncryptedHeader {
    const headerMetadata =
      typeof options.headerMetadata === "undefined"
        ? new Uint8Array()
        : options.headerMetadata
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    const encryptedHeaderBytes = webassembly_encrypt_hybrid_header(
      this.policy,
      accessPolicy,
      this.publicKey,
      headerMetadata,
      authenticatedData,
    )

    logger.log(
      () => `hybrid header succeeded: ${hexEncode(encryptedHeaderBytes)}`,
    )

    return EncryptedHeader.parseLEB128(encryptedHeaderBytes)
  }

  /**
   * Encrypts a AES256-GCM block
   *
   * @param {Uint8Array} symmetricKey Symmetric key to use to encrypt
   * @param {Uint8Array} plaintext Stuff to encrypt
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during decryption)
   * @returns {Uint8Array} encrypted block
   */
  public encryptBlock(
    symmetricKey: Uint8Array,
    plaintext: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {},
  ): Uint8Array {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    return webassembly_encrypt_symmetric_block(
      symmetricKey,
      plaintext,
      authenticatedData,
    )
  }

  /**
   * Hybrid encrypt wrapper: CoverCrypt encrypt then AES encrypt
   *
   * @param {string} accessPolicy Encrypt with this access policy
   * @param {Uint8Array} plaintext Stuff to encrypt
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.headerMetadata Data encrypted in the header
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during decryption)
   * @returns {Uint8Array} encrypted
   */
  public encrypt(
    accessPolicy: string,
    plaintext: Uint8Array,
    options: {
      headerMetadata?: Uint8Array
      authenticatedData?: Uint8Array
    } = {},
  ): Uint8Array {
    const headerMetadata =
      typeof options.headerMetadata === "undefined"
        ? new Uint8Array()
        : options.headerMetadata
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    return webassembly_hybrid_encrypt(
      this._policy,
      accessPolicy,
      this._publicKey,
      plaintext,
      headerMetadata,
      authenticatedData,
    )
  }
}
