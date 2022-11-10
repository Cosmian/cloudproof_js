import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class DecryptResponse implements KmipStruct {
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that was the key
  /// used for the decryption operation.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier: string

  /// The decrypted data (as a Byte String).
  @metadata({
    name: "Data",
    type: TtlvType.ByteString,
  })
  private _data?: Uint8Array

  /// Specifies the stream or by-parts value
  /// to be provided in subsequent calls to
  /// this operation for performing
  /// cryptographic operations.
  @metadata({
    name: "CorrelationValue",
    type: TtlvType.ByteString,
  })
  private _correlationValue?: Uint8Array

  constructor(
    uniqueIdentifier: string,
    data?: Uint8Array,
    correlationValue?: Uint8Array
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._data = data
    this._correlationValue = correlationValue
  }

  public get unique_identifier(): string {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string) {
    this._uniqueIdentifier = value
  }

  public get data(): Uint8Array | undefined {
    return this._data
  }

  public set data(value: Uint8Array | undefined) {
    this._data = value
  }

  public get correlation_value(): Uint8Array | undefined {
    return this._correlationValue
  }

  public set correlation_value(value: Uint8Array | undefined) {
    this._correlationValue = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof DecryptResponse)) {
      return false
    }
    const decryptResponse = o
    return (
      this._uniqueIdentifier === decryptResponse.unique_identifier &&
      this._data === decryptResponse.data &&
      this._correlationValue === decryptResponse.correlation_value
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${this._uniqueIdentifier}', Data='${
      this._data?.toString() as string
    }', CorrelationValue='${this._correlationValue?.toString() as string}'}`
  }
}
