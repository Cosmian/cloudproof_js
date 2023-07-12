export const SYMMETRIC_KEY_SIZE = 32

export class Metadata {
  /// The `uid` is a security parameter:
  ///  - when using a stream cipher such as AES or `ChaCha20`, it uniquely
  ///    identifies a resource, such as a file, and is part of the AEAD of every
  ///    block when symmetrically encrypting data. It prevents an attacker from
  ///    moving blocks between resources.
  ///  - when using FPE, it is the "tweak"
  private _uid: Uint8Array | undefined

  /// The `additional_data` is not used as a security parameter. It is optional
  /// data (such as index tags) symmetrically encrypted as part of the header.

  private _headerMetadata?: Uint8Array | undefined

  // Getters and setters
  public get uid(): Uint8Array | undefined {
    return this._uid
  }

  public set uid(value: Uint8Array | undefined) {
    this._uid = value
  }

  public get headerMetadata(): Uint8Array | undefined {
    return this._headerMetadata
  }

  public set headerMetadata(value: Uint8Array | undefined) {
    this._headerMetadata = value
  }

  constructor(uid?: Uint8Array, headerMetadata?: Uint8Array) {
    this._uid = uid
    this._headerMetadata = headerMetadata
  }

  /**
   * This function convert Metadata to JSON Metadata and returns the corresponding bytes
   * @returns {Uint8Array} a byte array of the JSON encoding Metadata
   */
  public toJsonEncoded(): Uint8Array {
    const metadata: any = {}
    if (this._uid !== undefined) {
      metadata.uid = Array.from(this._uid)
    } else {
      metadata.uid = []
    }
    if (this._headerMetadata !== undefined) {
      metadata.headerMetadata = Array.from(this._headerMetadata)
    }
    return new TextEncoder().encode(JSON.stringify(metadata))
  }
}
