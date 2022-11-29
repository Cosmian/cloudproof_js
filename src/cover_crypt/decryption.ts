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
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} plaintext decrypted CoverCrypt header
   */
  public decryptHybridHeader(
    encryptedHeader: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {},
  ): PlaintextHeader {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    const plaintextHeader = webassembly_decrypt_hybrid_header(
      this.asymmetricDecryptionKey,
      encryptedHeader,
      authenticatedData,
    )

    return PlaintextHeader.parse(plaintextHeader)
  }

  /**
   * Decrypts a AES256-GCM block
   *
   * @param {Uint8Array} symmetricKey AES key
   * @param {Uint8Array} encryptedBytes Encrypted block
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} plaintext decrypted block
   */
  public decryptBlock(
    symmetricKey: Uint8Array,
    encryptedBytes: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {},
  ): Uint8Array {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    return webassembly_decrypt_symmetric_block(
      symmetricKey,
      encryptedBytes,
      authenticatedData,
    )
  }

  /**
   * Hybrid decrypt wrapper: CoverCrypt decrypt then AES decrypt
   *
   * @param  {Uint8Array} ciphertext the encrypted data
   * @param {object} options Additional optional options to the encryption
   * @param {Uint8Array} options.authenticatedData Data use to authenticate the encrypted value when decrypting (if use, should be use during
   * @returns {Uint8Array} the plaintext value
   */
  public decrypt(
    ciphertext: Uint8Array,
    options: {
      authenticatedData?: Uint8Array
    } = {},
  ): { headerMetadata: Uint8Array; plaintext: Uint8Array } {
    const authenticatedData =
      typeof options.authenticatedData === "undefined"
        ? new Uint8Array()
        : options.authenticatedData

    const result = webassembly_hybrid_decrypt(
      this.asymmetricDecryptionKey,
      ciphertext,
      authenticatedData,
    )

    const { result: headerMetadataLength, tail } = decode(result)
    const headerMetadata = tail.slice(0, headerMetadataLength)
    const plaintext = tail.slice(headerMetadataLength)

    return { headerMetadata, plaintext }
  }
}
