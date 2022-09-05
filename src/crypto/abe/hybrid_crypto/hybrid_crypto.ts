/* tslint:disable:max-classes-per-file */
import { logger } from "../../../utils/logger"
import { deserializeList, fromBeBytes, toBeBytes } from "../../../utils/utils"
import { Metadata } from "./metadata"

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


  /**
   * Deserialize a encrypted header.
   *
   * @param encryptedHeaderBytes an encrypted header
   * @returns the object deserialized
   */
  public static parseLEB128(encryptedHeaderBytes: Uint8Array): EncryptedHeader {
    logger.log(() => "parseLEB128: encryptedHeaderBytes: " + encryptedHeaderBytes)

    const symmetricKey = encryptedHeaderBytes.slice(0, SYMMETRIC_KEY_SIZE);
    const headerBytes = encryptedHeaderBytes.slice(SYMMETRIC_KEY_SIZE, encryptedHeaderBytes.length);

    const encryptedHeaderVec = deserializeList(headerBytes);
    if (encryptedHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized asymmetric encrypted header")
    }

    logger.log(() => "parseLEB128: encryptedHeaderVec: " + encryptedHeaderVec)

    const encryptedHeader = new EncryptedHeader(symmetricKey, encryptedHeaderVec[0])
    logger.log(() => "parseLEB128: encryptedHeader.encryptedSymmetricKey: " + encryptedHeader.encryptedSymmetricKey)
    logger.log(() => "parseLEB128: encryptedHeader.symmetricKey: " + encryptedHeader.symmetricKey)

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
  public abstract renew_key(policy: Uint8Array, publicKey: Uint8Array): void

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

  /**
   * Hybrid encrypt wrapper: ABE encrypt then AES encrypt
   *
   * @param attributes
   * @param uid
   * @param plaintext
   * @returns
   */
  public abstract encrypt(attributes: string[], uid: Uint8Array, plaintext: Uint8Array): Uint8Array
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
  public static parseJson(cleartextHeader: Uint8Array): ClearTextHeader {
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

  /**
   * Deserialize a clear text header.
   *
   * @param cleartextHeader a raw header
   * @returns the object deserialized
   */
  public static parseLEB128(cleartextHeader: Uint8Array): ClearTextHeader {
    const symmetricKey = cleartextHeader.slice(0, SYMMETRIC_KEY_SIZE);
    const leftover = cleartextHeader.slice(SYMMETRIC_KEY_SIZE, cleartextHeader.length);
    const cleartextHeaderVec = deserializeList(leftover);
    if (cleartextHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized cleartext header")
    }

    const metadata = cleartextHeaderVec[0];
    const metadataSize = fromBeBytes(metadata.slice(0, 4))
    const uid = metadata.slice(4, 4 + metadataSize)
    const additionalData = metadata.slice(4 + metadataSize, metadata.length)

    return new ClearTextHeader(symmetricKey, new Metadata(uid, additionalData))
  }

  public static parseRaw(cleartextHeader: Uint8Array): ClearTextHeader {
    const headerSize = fromBeBytes(cleartextHeader.slice(0, 4))
    const symmetricKey = cleartextHeader.slice(4, 4 + headerSize)
    const metadata = cleartextHeader.slice(4 + headerSize, cleartextHeader.length)
    logger.log(() => "symmetric_key: " + symmetricKey)
    logger.log(() => "metadata: " + metadata)

    const metadataSize = fromBeBytes(metadata.slice(0, 4))
    const uid = metadata.slice(4, 4 + metadataSize)
    const additionalData = metadata.slice(4 + metadataSize, metadata.length)
    logger.log(() => "uid: " + uid)
    logger.log(() => "additionalData: " + additionalData)

    return new ClearTextHeader(symmetricKey, new Metadata(uid, additionalData))
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

  public abstract renew_key(userDecryptionKey: Uint8Array): void

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

  /**
   * Hybrid decrypt wrapper: ABE decrypt then AES decrypt
   *
   * @param uid integrity parameter used when encrypting
   * @param encryptedData
   * @returns a list of cleartext values
   */
  public abstract decrypt(encryptedData: Uint8Array): Uint8Array
}


export type EncryptionWorkerMessage = {
  name:
  'INIT' |
  'DESTROY' |
  'ENCRYPT' |
  'SUCCESS' |
  'ERROR',
  error?: string
  value?: any
}

export type DecryptionWorkerMessage = {
  name:
  'INIT' |
  'DESTROY' |
  'DECRYPT' |
  'SUCCESS' |
  'ERROR',
  isGpswImplementation: boolean
  error?: string
  value?: any
}
