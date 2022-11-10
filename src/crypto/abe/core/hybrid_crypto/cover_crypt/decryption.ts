/* tslint:disable:max-classes-per-file */
import {
  webassembly_decrypt_symmetric_block,
  webassembly_decrypt_hybrid_header,
  webassembly_hybrid_decrypt
} from "cosmian_cover_crypt"
import { PrivateKey } from "../../../../../kms/objects/PrivateKey"
import { ClearTextHeader } from "../../../interfaces/cleartext_header"

/**
 * This class exposes the ABE primitives.
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
   * Decrypts an ABE ciphertext header using the given user decryption key
   *
   * @param {Uint8Array} encryptedHeader ABE encrypted header
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} cleartext decrypted ABE header
   */
  public decryptHybridHeader(
    encryptedHeader: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {}
  ): ClearTextHeader {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    const cleartextHeader = webassembly_decrypt_hybrid_header(
      this.asymmetricDecryptionKey,
      encryptedHeader,
      authenticatedData
    )

    return ClearTextHeader.parseLEB128(cleartextHeader)
  }

  /**
   * Decrypts a AES256-GCM block
   *
   * @param {Uint8Array} symmetricKey AES key
   * @param {Uint8Array} encryptedBytes Encrypted block
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} cleartext decrypted block
   */
  public decryptBlock(
    symmetricKey: Uint8Array,
    encryptedBytes: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {}
  ): Uint8Array {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    return webassembly_decrypt_symmetric_block(
      symmetricKey,
      encryptedBytes,
      authenticatedData
    )
  }

  /**
   * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
   *
   * @param  {Uint8Array} ciphertext the encrypted data
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} the cleartext value
   */
  public decrypt(
    ciphertext: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {}
  ): Uint8Array {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    return webassembly_hybrid_decrypt(
      this.asymmetricDecryptionKey,
      ciphertext,
      authenticatedData
    )
  }
}
