import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class ReKeyKeyPairResponse implements KmipStruct {
  @metadata({
    name: "PrivateKeyUniqueIdentifier",
    type: TtlvType.TextString,
  })

  /// The Unique Identifier of the newly created private key object.
  private _privateKeyUniqueIdentifier: string

  @metadata({
    name: "PublicKeyUniqueIdentifier",
    type: TtlvType.TextString,
  })
  /// The Unique Identifier of the newly created public key object.
  private _publicKeyUniqueIdentifier: string

  constructor(
    privateKeyUniqueIdentifier: string,
    publicKeyUniqueIdentifier: string,
  ) {
    this._privateKeyUniqueIdentifier = privateKeyUniqueIdentifier
    this._publicKeyUniqueIdentifier = publicKeyUniqueIdentifier
  }

  public get privateKeyUniqueIdentifier(): string {
    return this._privateKeyUniqueIdentifier
  }

  public set privateKeyUniqueIdentifier(value: string) {
    this._privateKeyUniqueIdentifier = value
  }

  public get publicKeyUniqueIdentifier(): string {
    return this._publicKeyUniqueIdentifier
  }

  public set publicKeyUniqueIdentifier(value: string) {
    this._publicKeyUniqueIdentifier = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof ReKeyKeyPairResponse)) {
      return false
    }
    const reKeyKeyPairResponse = o
    return (
      this._privateKeyUniqueIdentifier ===
        reKeyKeyPairResponse.privateKeyUniqueIdentifier &&
      this._publicKeyUniqueIdentifier ===
        reKeyKeyPairResponse.publicKeyUniqueIdentifier
    )
  }

  public toString(): string {
    return `{ privateKeyUniqueIdentifier='${this._privateKeyUniqueIdentifier}', publicKeyUniqueIdentifier='${this._publicKeyUniqueIdentifier}'}`
  }
}
