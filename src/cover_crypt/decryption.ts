/* tslint:disable:max-classes-per-file */
import {
  webassembly_decrypt_hybrid_header,
  webassembly_decrypt_symmetric_block,
  webassembly_hybrid_decrypt,
} from "../pkg/cover_crypt/cosmian_cover_crypt"
import { PrivateKey } from "../kms/structs/objects"
import { PlaintextHeader } from "./interfaces/plaintext_header"
import { decode } from "../utils/leb128"

/**
 * This class exposes the CoverCrypt primitives.
 *
 */
export class CoverCryptHybridDecryption {
  private readonly _asymmetricDecryptionKey: Uint8Array

  constructor(asymmetricDecryptionKey: PrivateKey | Uint8Array) {
    if (asymmetricDecryptionKey instanceof PrivateKey) {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey.bytes()
    } else {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey
    }
  }

  public get asymmetricDecryptionKey(): Uint8Array {
    return this._asymmetricDecryptionKey
  }

  /**
   * Decrypts a CoverCrypt ciphertext header using the given user decryption key
   *
   * @param {Uint8Array} encryptedHeader CoverCrypt encrypted header
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} plaintext decrypted CoverCrypt header
   */
  public decryptHybridHeader(
    encryptedHeader: Uint8Array,
    options: {
      authenticationData?: Uint8Array
    } = {},
  ): PlaintextHeader {
    const authenticationData =
      typeof options.authenticationData === "undefined"
        ? new Uint8Array()
        : options.authenticationData

    const plaintextHeader = webassembly_decrypt_hybrid_header(
      this.asymmetricDecryptionKey,
      encryptedHeader,
      authenticationData,
    )

    return PlaintextHeader.parse(plaintextHeader)
  }

  /**
   * Decrypts a AES256-GCM block
   *
   * @param {Uint8Array} symmetricKey AES key
   * @param {Uint8Array} encryptedBytes Encrypted block
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} plaintext decrypted block
   */
  public decryptBlock(
    symmetricKey: Uint8Array,
    encryptedBytes: Uint8Array,
    options: {
      authenticationData?: Uint8Array
    } = {},
  ): Uint8Array {
    const authenticationData =
      typeof options.authenticationData === "undefined"
        ? new Uint8Array()
        : options.authenticationData

    return webassembly_decrypt_symmetric_block(
      symmetricKey,
      encryptedBytes,
      authenticationData,
    )
  }

  /**
   * Hybrid decrypt wrapper: CoverCrypt decrypt then AES decrypt
   *
   * @param  {Uint8Array} ciphertext the encrypted data
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns the decrypted header metadata and the the plaintext value
   */
  public decrypt(
    ciphertext: Uint8Array,
    options: {
      authenticationData?: Uint8Array
    } = {},
  ): { headerMetadata: Uint8Array; plaintext: Uint8Array } {
    return decrypt(this.asymmetricDecryptionKey, ciphertext, options)
  }
}

/**
 * Hybrid decrypt wrapper: CoverCrypt decrypt then AES decrypt
 *
 * @param decryptionKey the user key to decrypt
 * @param {Uint8Array} ciphertext the encrypted data
 * @param {object} options Additional optional options to the encryption
 * @param {Uint8Array} options.authenticationData Data use to authenticate the encrypted value when decrypting (if use, should be use during
 * @returns the decrypted header metadata and the the plaintext value
 */
export function decrypt(
  decryptionKey: PrivateKey | Uint8Array,
  ciphertext: Uint8Array,
  options: {
    authenticationData?: Uint8Array
  } = {},
): { headerMetadata: Uint8Array; plaintext: Uint8Array } {
  const authenticationData =
    typeof options.authenticationData === "undefined"
      ? new Uint8Array()
      : options.authenticationData

  const result = webassembly_hybrid_decrypt(
    decryptionKey instanceof PrivateKey ? decryptionKey.bytes() : decryptionKey,
    ciphertext,
    authenticationData,
  )

  const { result: headerMetadataLength, tail } = decode(result)
  const headerMetadata = tail.slice(0, headerMetadataLength)
  const plaintext = tail.slice(headerMetadataLength)

  return { headerMetadata, plaintext }
}
