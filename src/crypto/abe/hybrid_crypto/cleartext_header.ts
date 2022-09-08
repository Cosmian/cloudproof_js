import { logger } from "../../../utils/logger"
import { Metadata } from "./metadata"
import { deserializeList, fromBeBytes } from "../../../utils/utils"
import { SYMMETRIC_KEY_SIZE } from "./encryption_parameters"

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
  public static parseLEB128(cleartextHeader: Uint8Array): ClearTextHeader {
    const symmetricKey = cleartextHeader.slice(0, SYMMETRIC_KEY_SIZE);
    const leftover = cleartextHeader.slice(SYMMETRIC_KEY_SIZE);
    const cleartextHeaderVec = deserializeList(leftover);
    if (cleartextHeaderVec.length !== 1) {
      throw new Error("Incorrect deserialized cleartext header")
    }

    const serializedMetadata = cleartextHeaderVec[0];
    if (serializedMetadata.length < 4) {
      throw new Error("Deserialize metadata failed. Length must be at least 4 bytes")
    }
    const metadataSize = fromBeBytes(serializedMetadata.slice(0, 4))
    if (metadataSize === 0) {
      throw new Error("Deserialize metadata failed. Length must be strictly positive")
    }
    const uid = serializedMetadata.slice(4, 4 + metadataSize)
    const additionalData = serializedMetadata.slice(4 + metadataSize)

    return new ClearTextHeader(symmetricKey, new Metadata(uid, additionalData))
  }

  public static parseRaw(cleartextHeader: Uint8Array): ClearTextHeader {
    if (cleartextHeader.length < 4) {
      throw new Error("Parse cleartextHeader failed. Length must be at least 4 bytes")
    }
    const headerSize = fromBeBytes(cleartextHeader.slice(0, 4))
    if (headerSize === 0) {
      throw new Error("Parse cleartextHeader failed. Header size must be strictly positive")
    }
    const symmetricKey = cleartextHeader.slice(4, 4 + headerSize)
    const metadata = cleartextHeader.slice(4 + headerSize)
    logger.log(() => "metadata: " + metadata)
    if (metadata.length < 4) {
      throw new Error("Parse metadata failed. Length must be at least 4 bytes")
    }
    const metadataSize = fromBeBytes(metadata.slice(0, 4))
    if (metadataSize === 0) {
      throw new Error("Metadata length cannot be 0")
    }
    const uid = metadata.slice(4, 4 + metadataSize)
    const additionalData = metadata.slice(4 + metadataSize)
    logger.log(() => "uid: " + uid)
    logger.log(() => "additionalData: " + additionalData)

    return new ClearTextHeader(symmetricKey, new Metadata(uid, additionalData))
  }
}
