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
