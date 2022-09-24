
import { deserializeList, toBeBytes } from "utils/utils"
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
   * Deserialize a encrypted header.
   *
   * @param encryptedHeaderBytes an encrypted header
   * @returns the object deserialized
   */
  public static parseLEB128(encryptedHeaderBytes: Uint8Array): EncryptedHeader {
    if (encryptedHeaderBytes.length < SYMMETRIC_KEY_SIZE) {
      throw new Error("Serialized encrypted header must be at least " + SYMMETRIC_KEY_SIZE + " bytes")
    }
    const symmetricKey = encryptedHeaderBytes.slice(0, SYMMETRIC_KEY_SIZE);
    const headerBytes = encryptedHeaderBytes.slice(SYMMETRIC_KEY_SIZE);
    if (headerBytes.length === 0) {
      throw new Error("Encrypted header cannot be null")
    }

    const encryptedHeaderVec = deserializeList(headerBytes);
    if (encryptedHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized asymmetric encrypted header")
    }

    return new EncryptedHeader(symmetricKey, encryptedHeaderVec[0])
  }
}
