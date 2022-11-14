import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class EncryptResponse implements KmipStruct {
  tag = "EncryptResponse";
  
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that was the key
  /// used for the encryption operation.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _uniqueIdentifier?: string

  /// The encrypted data (as a Byte String).
  @metadata({
    name: "Data",
    type: TtlvType.ByteString,
  })
  private _data?: Uint8Array

  /// The value used if the Cryptographic
  /// Parameters specified Random IV and
  /// the IV/Counter/Nonce value was not
  /// provided in the request and the
  /// algorithm requires the provision of an
  /// IV/Counter/Nonce.
  @metadata({
    name: "IvCounterNonce",
    type: TtlvType.ByteString,
  })
  private _ivCounterNonce?: Uint8Array

  /// Specifies the existing stream or by-
  /// parts cryptographic operation (as
  /// returned from a previous call to this
  /// operation)
  @metadata({
    name: "CorrelationValue",
    type: TtlvType.ByteString,
  })
  private _correlationValue?: Uint8Array

  /// Specifies the tag that will be needed to
  /// authenticate the decrypted data (and
  /// any “additional data”). Only returned on
  /// completion of the encryption of the last
  /// of the plaintext by an authenticated
  /// encryption cipher.
  @metadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _authenticatedEncryptionAdditionalData?: Uint8Array

  constructor(
    uniqueIdentifier?: string,
    data?: Uint8Array,
    ivCounterNonce?: Uint8Array,
    correlationValue?: Uint8Array,
    authenticatedEncryptionAdditionalData?: Uint8Array,
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._data = data
    this._ivCounterNonce = ivCounterNonce
    this._correlationValue = correlationValue
    this._authenticatedEncryptionAdditionalData =
      authenticatedEncryptionAdditionalData
  }

  public get unique_identifier(): string | undefined {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string | undefined) {
    this._uniqueIdentifier = value
  }

  public get data(): Uint8Array | undefined {
    return this._data
  }

  public set data(value: Uint8Array | undefined) {
    this._data = value
  }

  public get iv_counter_nonce(): Uint8Array | undefined {
    return this._ivCounterNonce
  }

  public set iv_counter_nonce(value: Uint8Array | undefined) {
    this._ivCounterNonce = value
  }

  public get correlation_value(): Uint8Array | undefined {
    return this._correlationValue
  }

  public set correlation_value(value: Uint8Array | undefined) {
    this._correlationValue = value
  }

  public get authenticated_encryption_additional_data():
    | Uint8Array
    | undefined {
    return this._authenticatedEncryptionAdditionalData
  }

  public set authenticated_encryption_additional_data(
    value: Uint8Array | undefined,
  ) {
    this._authenticatedEncryptionAdditionalData = value
  }

  public equals(o: any): boolean {
    if (o === this) {
      return true
    }
    if (!(o instanceof EncryptResponse)) {
      return false
    }
    const encrypt = o
    return (
      this._uniqueIdentifier === encrypt.unique_identifier &&
      this._data === encrypt.data &&
      this._ivCounterNonce === encrypt.iv_counter_nonce &&
      this._correlationValue === encrypt.correlation_value &&
      this._authenticatedEncryptionAdditionalData ===
        encrypt.authenticated_encryption_additional_data
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this._uniqueIdentifier?.toString() as string
    }', Data='${this._data?.toString() as string}', IvCounterNonce='${
      this._ivCounterNonce?.toString() as string
    }', CorrelationValue='${
      this._correlationValue?.toString() as string
    }', AuthenticatedEncryptionAdditionalData='${
      this._authenticatedEncryptionAdditionalData?.toString() as string
    }'}`
  }
}
