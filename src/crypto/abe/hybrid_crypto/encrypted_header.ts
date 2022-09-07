import { logger } from "../../../utils/logger"
import { deserializeList, toBeBytes } from "../../../utils/utils"
import { SYMMETRIC_KEY_SIZE } from "./encryption_parameters"

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
