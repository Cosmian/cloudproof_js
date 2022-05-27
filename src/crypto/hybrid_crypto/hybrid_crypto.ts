/* tslint:disable:max-classes-per-file */
import { logger } from "../../utils/logger"
import { toBeBytes } from "../../utils/utils"
import { Metadata } from "./abe/cover_crypt/metadata"

const SYMMETRIC_KEY_SIZE = 32

export abstract class EncryptionParameters { }

export class EncryptedHeader {
  private _symmetricKey: Uint8Array
  private _encryptedSymmetricKey: Uint8Array
  private _encryptedSymmetricKeySizeAsArray: Uint8Array

  public get encryptedSymmetricKey(): Uint8Array {
    return this._encryptedSymmetricKey
  }
  public set encryptedSymmetricKey(value: Uint8Array) {
    this._encryptedSymmetricKey = value
  }

  public get symmetricKey(): Uint8Array {
    return this._symmetricKey
  }
  public set symmetricKey(value: Uint8Array) {
    this._symmetricKey = value
  }

  public get encryptedSymmetricKeySizeAsArray(): Uint8Array {
    return this._encryptedSymmetricKeySizeAsArray
  }
  public set encryptedSymmetricKeySizeAsArray(value: Uint8Array) {
    this._encryptedSymmetricKeySizeAsArray = value
  }

  constructor(symmetricKey: Uint8Array, encryptedSymmetricKey: Uint8Array) {
    this._symmetricKey = symmetricKey
    this._encryptedSymmetricKey = encryptedSymmetricKey

    // Convert symmetric key length to 4-bytes array
    this._encryptedSymmetricKeySizeAsArray = toBeBytes(this._encryptedSymmetricKey.length)
  }

  /**
   * Deserialize an ABE encrypted header
   *
   * @param headerBytes an ABE header
   * @returns the corresponding EncryptedHeader object
   */
  public static parse(headerBytes: Uint8Array): EncryptedHeader {
    if (headerBytes.length === 0) {
      throw new Error("Cannot deserialize an empty encrypted header")
    }
    const encryptedHeaderJson = JSON.parse(new TextDecoder().decode(headerBytes))
    logger.log(() => "encryptedHeaderJson: " + encryptedHeaderJson)

    const encryptedHeader = new EncryptedHeader(encryptedHeaderJson.symmetric_key, encryptedHeaderJson.header_bytes)
    logger.log(() => "encryptedHeader: " + encryptedHeader)

    return encryptedHeader;
  }
}

export abstract class HybridEncryption {
  private _publicKey: Uint8Array
  private _policy: Uint8Array

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

  constructor(policy: Uint8Array, publicKey: Uint8Array) {
    this._policy = policy
    this._publicKey = publicKey
  }

  public abstract destroyInstance(): void

  /**
   *
   * @param parameters Encryption parameters
   */
  public abstract encryptHybridHeader(parameters: EncryptionParameters): EncryptedHeader

  /**
   * Encrypts a hybrid block
   *
   * @param symmetricKey symmetric key
   * @param plaintext data to encrypt
   * @param uid uid used as additional data
   * @param blockNumber
   * @returns the ciphertext if everything succeeded
   */
  public abstract encryptHybridBlock(symmetricKey: Uint8Array, plaintext: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array
}

export class ClearTextHeader {
  private _symmetricKey: Uint8Array
  private _metadata: Metadata

  /* Getter / Setters */
  public get symmetricKey(): Uint8Array {
    return this._symmetricKey
  }
  public set symmetricKey(value: Uint8Array) {
    this._symmetricKey = value
  }
  public get metadata(): Metadata {
    return this._metadata
  }
  public set metadata(value: Metadata) {
    this._metadata = value
  }

  constructor(symmetricKey: Uint8Array, metadata: Metadata) {
    this._symmetricKey = symmetricKey
    this._metadata = metadata
  }

  /**
   * Deserialize a clear text header.
   *
   * @param cleartextHeader a raw header
   * @returns the object deserialized
   */
  public static parse(cleartextHeader: Uint8Array): ClearTextHeader {
    const clearTextHeaderString = new TextDecoder().decode(cleartextHeader.buffer)
    logger.log(() => "clearTextHeaderString: " + clearTextHeaderString)
    // parse JSON to object
    const clearTextHeaderJson = JSON.parse(clearTextHeaderString)
    logger.log(() => "clearTextHeader: " + clearTextHeaderJson)
    logger.log(() => "symmetric_key: " + clearTextHeaderJson.symmetric_key)
    logger.log(() => "uid: " + clearTextHeaderJson.meta_data.uid)
    logger.log(() => "additional_data: " + clearTextHeaderJson.meta_data.additional_data)

    return new ClearTextHeader(clearTextHeaderJson.symmetric_key, clearTextHeaderJson.meta_data)
  }
}

export abstract class HybridDecryption {
  private _asymmetricDecryptionKey: Uint8Array

  public set asymmetricDecryptionKey(value: Uint8Array) {
    this._asymmetricDecryptionKey = value
  }
  public get asymmetricDecryptionKey(): Uint8Array {
    return this._asymmetricDecryptionKey
  }

  constructor(asymmetricDecryptionKey: Uint8Array) {
    this._asymmetricDecryptionKey = asymmetricDecryptionKey
  }

  public abstract destroyInstance(): void

  /**
   *
   * @param asymmetricHeader asymmetric encrypted data
   */
  public abstract decryptHybridHeader(asymmetricHeader: Uint8Array): ClearTextHeader

  /**
   * Decrypts a hybrid block
   *
   * @param symmetricKey symmetric key
   * @param encryptedBytes encrypted data
   * @param uid uid used as additional data
   * @param blockNumber
   * @returns the cleartext if everything succeeded
   */
  public abstract decryptHybridBlock(symmetricKey: Uint8Array, encryptedBytes: Uint8Array, uid: Uint8Array | undefined, blockNumber: number | undefined): Uint8Array

  /**
   * Return the size of the header
   * @param encryptedBytes the hybrid encrypted bytes
   */
  public abstract getHeaderSize(encryptedBytes: Uint8Array): number
}
