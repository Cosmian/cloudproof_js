/* tslint:disable:max-classes-per-file */
import {
  webassembly_decrypt_hybrid_block,
  webassembly_decrypt_hybrid_header,
  webassembly_get_encrypted_header_size,
} from "cosmian_cover_crypt"
import { PrivateKey } from "../../../../../kms/objects/PrivateKey"
import { logger } from "../../../../../utils/logger"
import { ClearTextHeader } from "../../../interfaces/cleartext_header"

/**
 * This class exposes the ABE primitives.
 *
 */
export class CoverCryptHybridDecryption {
  private _asymmetricDecryptionKey: Uint8Array

  constructor(asymmetricDecryptionKey: PrivateKey | Uint8Array) {
    if (asymmetricDecryptionKey instanceof PrivateKey) {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey.bytes()
    } else {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey
    }
  }

  public set asymmetricDecryptionKey(value: Uint8Array) {
    this._asymmetricDecryptionKey = value
  }

  public get asymmetricDecryptionKey(): Uint8Array {
    return this._asymmetricDecryptionKey
  }

  public renewKey(userDecryptionKey: Uint8Array): void {
    this.asymmetricDecryptionKey = userDecryptionKey
  }

  /**
   * Destroy ABE instance
   */
  public destroyInstance(): void {
    logger.log(() => "DestroyInstance Abe")
  }

  /**
   * Decrypts an ABE ciphertext using the given user decryption key. Must return cleartext value if correct user key (meaning, the correct access policy) has been given.
   *
   * @param abeHeader ABE encrypted value
   * @returns cleartext decrypted ABE value
   */
  public decryptHybridHeader(abeHeader: Uint8Array): ClearTextHeader {
    const cleartextHeader = webassembly_decrypt_hybrid_header(
      this.asymmetricDecryptionKey,
      abeHeader
    )
    logger.log(() => `decryptHybridHeader: ${cleartextHeader.toString()}`)
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
  public decryptHybridBlock(
    symmetricKey: Uint8Array,
    encryptedBytes: Uint8Array,
    uid: Uint8Array | undefined,
    blockNumber: number | undefined
  ): Uint8Array {
    return webassembly_decrypt_hybrid_block(
      symmetricKey,
      uid,
      blockNumber,
      encryptedBytes
    )
  }

  /**
   * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
   *
   * @param  {Uint8Array} ciphertext the encrypted data
   * @returns {Uint8Array} the cleartext value
   */
  public decrypt(ciphertext: Uint8Array): Uint8Array {
    logger.log(() => `decrypt for encryptedData: ${ciphertext.toString()}`)

    // Encrypted value is composed of: HEADER_LEN | HEADER | AES_DATA
    const headerSize = webassembly_get_encrypted_header_size(ciphertext)
    const asymmetricHeader = ciphertext.slice(4, 4 + headerSize)
    const encryptedSymmetricBytes = ciphertext.slice(
      4 + headerSize,
      ciphertext.length
    )

    //
    logger.log(() => `decrypt for headerSize: ${headerSize}`)
    logger.log(
      () => `decrypt for asymmetricHeader: ${asymmetricHeader.toString()}`
    )

    // HEADER decryption: asymmetric decryption
    const cleartextHeader = this.decryptHybridHeader(asymmetricHeader)
    logger.log(
      () => `decrypt for cleartextHeader: ${JSON.stringify(cleartextHeader)}`
    )

    // AES_DATA: AES Symmetric part decryption
    const cleartext = this.decryptHybridBlock(
      cleartextHeader.symmetricKey,
      encryptedSymmetricBytes,
      cleartextHeader.metadata.uid,
      0
    )
    logger.log(() => `cleartext: ${new TextDecoder().decode(cleartext)}`)
    return cleartext
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
    logger.log(
      () => `benchDecryptHybridHeader for abeHeader: ${abeHeader.toString()}`
    )

    const loops = 100
    const startDate = new Date().getTime()
    for (let i = 0; i < loops; i++) {
      webassembly_decrypt_hybrid_header(this.asymmetricDecryptionKey, abeHeader)
    }
    const endDate = new Date().getTime()
    const ms = (endDate - startDate) / loops
    logger.log(() => `webassembly-JS avg time: ${ms}ms`)

    return [ms, -1]
  }

  public getHeaderSize(encryptedBytes: Uint8Array): number {
    return webassembly_get_encrypted_header_size(encryptedBytes)
  }
}
