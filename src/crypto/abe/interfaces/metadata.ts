export class Metadata {
  /// The `uid` is a security parameter:
  ///  - when using a stream cipher such as AES or `ChaCha20`, it uniquely
  ///    identifies a resource, such as a file, and is part of the AEAD of every
  ///    block when symmetrically encrypting data. It prevents an attacker from
  ///    moving blocks between resources.
  ///  - when using FPE, it is the "tweak"
  private _uid: Uint8Array

  /// The `additional_data` is not used as a security parameter. It is optional
  /// data (such as index tags) symmetrically encrypted as part of the header.

  private _additionalData?: Uint8Array | undefined

  // Getters and setters
  public get uid (): Uint8Array {
    return this._uid
  }

  public set uid (value: Uint8Array) {
    this._uid = value
  }

  public get additionalData (): Uint8Array | undefined {
    return this._additionalData
  }

  public set additionalData (value: Uint8Array | undefined) {
    this._additionalData = value
  }

  constructor (uid: Uint8Array, additionalData?: Uint8Array) {
    this._uid = uid
    this._additionalData = additionalData
  }

  public toJsonEncoded (): Uint8Array {
    const metadata: any = {}
    metadata.uid = Array.from(this._uid)
    if (this._additionalData !== undefined) {
      metadata.additionalData = Array.from(this._additionalData)
    }
    return new TextEncoder().encode(JSON.stringify(metadata))
  }
}
