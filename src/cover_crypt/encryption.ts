import {
  webassembly_encrypt_hybrid_header,
  webassembly_encrypt_symmetric_block,
  webassembly_hybrid_encrypt,
} from "../pkg/cover_crypt/cloudproof_cover_crypt"
import { logger } from "../utils/logger"
import { hexEncode } from "../utils/utils"
import { EncryptedHeader } from "./interfaces/encrypted_header"
import { Policy } from "./interfaces/policy"

/**
 * This class exposes the CoverCrypt primitives.
 *
 */
export class CoverCryptHybridEncryption {
  private readonly _publicKey: Uint8Array
  private readonly _policy: Policy

  constructor(policy: Policy, publicKey: Uint8Array) {
    this._policy = policy

    this._publicKey = publicKey
  }

  public get policy(): Policy {
    return this._policy
  }

  public get publicKey(): Uint8Array {
    return this._publicKey
  }

  /**
   * Generate and encrypt a symmetric key using the public key and policy.
   * @param {string} accessPolicy Encrypt with this access policy
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.headerMetadata Data encrypted in the header
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} encrypted header
   */
  public encryptHybridHeader(
    accessPolicy: string,
    options: {
      headerMetadata?: Uint8Array
      authenticationData?: Uint8Array
    } = {},
  ): EncryptedHeader {
    const headerMetadata =
      typeof options.headerMetadata === "undefined"
        ? new Uint8Array()
        : options.headerMetadata
    const authenticationData =
      typeof options.authenticationData === "undefined"
        ? new Uint8Array()
        : options.authenticationData

    const encryptedHeaderBytes = webassembly_encrypt_hybrid_header(
      this.policy.toBytes(),
      accessPolicy,
      this.publicKey,
      headerMetadata,
      authenticationData,
    )

    logger.log(
      () => `hybrid header succeeded: ${hexEncode(encryptedHeaderBytes)}`,
    )

    return EncryptedHeader.parseLEB128(encryptedHeaderBytes)
  }

  /**
   * Encrypts a AES256-GCM block
   * @param {Uint8Array} symmetricKey Symmetric key to use to encrypt
   * @param {Uint8Array} plaintext Stuff to encrypt
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during decryption)
   * @returns {Uint8Array} encrypted block
   */
  public encryptBlock(
    symmetricKey: Uint8Array,
    plaintext: Uint8Array,
    options: {
      authenticationData?: Uint8Array
    } = {},
  ): Uint8Array {
    const authenticationData =
      typeof options.authenticationData === "undefined"
        ? new Uint8Array()
        : options.authenticationData

    return webassembly_encrypt_symmetric_block(
      symmetricKey,
      plaintext,
      authenticationData,
    )
  }

  /**
   * Hybrid encrypt wrapper: CoverCrypt encrypt then AES encrypt
   * @param {string} accessPolicy Encrypt with this access policy
   * @param {Uint8Array} plaintext Stuff to encrypt
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.headerMetadata Data encrypted in the header
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during decryption)
   * @returns {Uint8Array} encrypted
   */
  public encrypt(
    accessPolicy: string,
    plaintext: Uint8Array,
    options: {
      headerMetadata?: Uint8Array
      authenticationData?: Uint8Array
    } = {},
  ): Uint8Array {
    return encrypt(
      this._policy,
      this._publicKey,
      accessPolicy,
      plaintext,
      options,
    )
  }
}

/**
 * Hybrid encrypt wrapper: CoverCrypt encrypt then AES encrypt
 * @param {Policy} policy CoverCrypt global policy
 * @param {Uint8Array} publicKey Master public key
 * @param {string} accessPolicy Encrypt with this access policy
 * @param {Uint8Array} plaintext Stuff to encrypt
 * @param {object} options Additional optional options to the encryption
 * @param {Uint8Array} options.headerMetadata Data encrypted in the header
 * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during decryption)
 * @returns {Uint8Array} encrypted
 */
export function encrypt(
  policy: Policy,
  publicKey: Uint8Array,
  accessPolicy: string,
  plaintext: Uint8Array,
  options: {
    headerMetadata?: Uint8Array
    authenticationData?: Uint8Array
  } = {},
): Uint8Array {
  const headerMetadata =
    typeof options.headerMetadata === "undefined"
      ? new Uint8Array()
      : options.headerMetadata
  const authenticationData =
    typeof options.authenticationData === "undefined"
      ? new Uint8Array()
      : options.authenticationData

  return webassembly_hybrid_encrypt(
    policy.toBytes(),
    accessPolicy,
    publicKey,
    plaintext,
    headerMetadata,
    authenticationData,
  )
}
