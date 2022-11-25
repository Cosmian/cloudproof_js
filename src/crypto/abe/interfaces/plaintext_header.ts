import { logger } from "../../../utils/logger"
import { deserializeList, fromBeBytes } from "../../../utils/utils"
import { Metadata, SYMMETRIC_KEY_SIZE } from "./encryption_parameters"

export class PlaintextHeader {
  private _symmetricKey: Uint8Array
  private _metadata: Metadata | undefined

  /* Getter / Setters */
  public get symmetricKey(): Uint8Array {
    return this._symmetricKey
  }

  public set symmetricKey(value: Uint8Array) {
    this._symmetricKey = value
  }

  public get metadata(): Metadata | undefined {
    return this._metadata
  }

  public set metadata(value: Metadata | undefined) {
    this._metadata = value
  }

  constructor(symmetricKey: Uint8Array, metadata?: Metadata) {
    this._symmetricKey = symmetricKey
    this._metadata = metadata
  }

  /**
   * Deserialize a clear text header.
   *
   * @param plaintextHeader a raw header
   * @returns the object deserialized
   */
  public static parse(plaintextHeader: Uint8Array): PlaintextHeader {
    logger.log(() => `parse: plaintextHeader: ${plaintextHeader.toString()}`)
    logger.log(() => `parse: plaintextHeader length: ${plaintextHeader.length}`)
    const symmetricKey = plaintextHeader.slice(0, SYMMETRIC_KEY_SIZE)
    if (plaintextHeader.length === SYMMETRIC_KEY_SIZE + 1) {
      return new PlaintextHeader(symmetricKey)
    }

    const leftover = plaintextHeader.slice(SYMMETRIC_KEY_SIZE)
    const plaintextHeaderVec = deserializeList(leftover)
    if (plaintextHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized plaintext header")
    }

    const serializedMetadata = plaintextHeaderVec[0]
    if (serializedMetadata.length < 4) {
      throw new Error(
        "Deserialize metadata failed. Length must be at least 4 bytes",
      )
    }
    const metadataSize = fromBeBytes(serializedMetadata.slice(0, 4))
    if (metadataSize === 0) {
      throw new Error(
        "Deserialize metadata failed. Length must be strictly positive",
      )
    }
    const uid = serializedMetadata.slice(4, 4 + metadataSize)
    const additionalData = serializedMetadata.slice(4 + metadataSize)

    return new PlaintextHeader(symmetricKey, new Metadata(uid, additionalData))
  }
}
