import { logger } from "../../../utils/logger"
import { deserializeList, fromBeBytes } from "../../../utils/utils"
import { Metadata, SYMMETRIC_KEY_SIZE } from "./encryption_parameters"

export class ClearTextHeader {
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
   * @param cleartextHeader a raw header
   * @returns the object deserialized
   */
  public static parse(cleartextHeader: Uint8Array): ClearTextHeader {
    logger.log(() => `parse: cleartextHeader: ${cleartextHeader.toString()}`)
    logger.log(() => `parse: cleartextHeader length: ${cleartextHeader.length}`)
    const symmetricKey = cleartextHeader.slice(0, SYMMETRIC_KEY_SIZE)
    if (cleartextHeader.length === SYMMETRIC_KEY_SIZE + 1) {
      return new ClearTextHeader(symmetricKey)
    }

    const leftover = cleartextHeader.slice(SYMMETRIC_KEY_SIZE)
    const cleartextHeaderVec = deserializeList(leftover)
    if (cleartextHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized cleartext header")
    }

    const serializedMetadata = cleartextHeaderVec[0]
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

    return new ClearTextHeader(symmetricKey, new Metadata(uid, additionalData))
  }
}
