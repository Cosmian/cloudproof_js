import { PrivateKey } from "kms/objects/PrivateKey"
import { ClearTextHeader } from "./cleartext_header"

export abstract class HybridDecryption {
  private _asymmetricDecryptionKey: Uint8Array

  public set asymmetricDecryptionKey(value: Uint8Array) {
    this._asymmetricDecryptionKey = value
  }

  public get asymmetricDecryptionKey(): Uint8Array {
    return this._asymmetricDecryptionKey
  }

  constructor(asymmetricDecryptionKey: PrivateKey | Uint8Array) {
    if (asymmetricDecryptionKey instanceof PrivateKey) {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey.bytes()
    } else {
      this._asymmetricDecryptionKey = asymmetricDecryptionKey
    }
  }

  public abstract renewKey(userDecryptionKey: Uint8Array): void

  public abstract destroyInstance(): void

  /**
   *
   * @param asymmetricHeader asymmetric encrypted data
   */
  public abstract decryptHybridHeader(
    asymmetricHeader: Uint8Array
  ): ClearTextHeader

  /**
   * Decrypts a hybrid block
   *
   * @param symmetricKey key used in symmetric cipher
   * @param encryptedBytes ciphertext
   * @param uid uid used as additional data
   * @param blockNumber
   * @returns the cleartext if everything succeeded
   */
  public abstract decryptHybridBlock(
    symmetricKey: Uint8Array,
    encryptedBytes: Uint8Array,
    uid: Uint8Array | undefined,
    blockNumber: number | undefined
  ): Uint8Array

  /**
   * Return the size of the header
   *
   * @param encryptedBytes the hybrid encrypted bytes
   */
  public abstract getHeaderSize(encryptedBytes: Uint8Array): number

  /**
   * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
   *
   * @param uid integrity parameter used when encrypting
   * @param encryptedData
   * @returns a list of cleartext values
   */
  public abstract decrypt(encryptedData: Uint8Array): Uint8Array
}

export interface DecryptionWorkerMessage {
  name: "INIT" | "DESTROY" | "DECRYPT" | "SUCCESS" | "ERROR"
  isGpswImplementation: boolean
  error?: string
  value?: any
}
