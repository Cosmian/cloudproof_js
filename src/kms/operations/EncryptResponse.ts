import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"

export class EncryptResponse implements KmipStruct {
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that was the key
  /// used for the encryption operation.
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _unique_identifier?: string

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
  private _iv_counter_nonce?: Uint8Array

  /// Specifies the existing stream or by-
  /// parts cryptographic operation (as
  /// returned from a previous call to this
  /// operation)
  @metadata({
    name: "CorrelationValue",
    type: TtlvType.ByteString,
  })
  private _correlation_value?: Uint8Array

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
  private _authenticated_encryption_additional_data?: Uint8Array

  constructor(
    unique_identifier?: string,
    data?: Uint8Array,
    iv_counter_nonce?: Uint8Array,
    correlation_value?: Uint8Array,
    authenticated_encryption_additional_data?: Uint8Array
  ) {
    this._unique_identifier = unique_identifier
    this._data = data
    this._iv_counter_nonce = iv_counter_nonce
    this._correlation_value = correlation_value
    this._authenticated_encryption_additional_data =
      authenticated_encryption_additional_data
  }

  public get unique_identifier(): string | undefined {
    return this._unique_identifier
  }

  public set unique_identifier(value: string | undefined) {
    this._unique_identifier = value
  }

  public get data(): Uint8Array | undefined {
    return this._data
  }

  public set data(value: Uint8Array | undefined) {
    this._data = value
  }

  public get iv_counter_nonce(): Uint8Array | undefined {
    return this._iv_counter_nonce
  }

  public set iv_counter_nonce(value: Uint8Array | undefined) {
    this._iv_counter_nonce = value
  }

  public get correlation_value(): Uint8Array | undefined {
    return this._correlation_value
  }

  public set correlation_value(value: Uint8Array | undefined) {
    this._correlation_value = value
  }

  public get authenticated_encryption_additional_data():
    | Uint8Array
    | undefined {
    return this._authenticated_encryption_additional_data
  }

  public set authenticated_encryption_additional_data(
    value: Uint8Array | undefined
  ) {
    this._authenticated_encryption_additional_data = value
  }

  public equals(o: any): boolean {
    if (o == this) {
      return true
    }
    if (!(o instanceof EncryptResponse)) {
      return false
    }
    const encrypt = o
    return (
      this._unique_identifier === encrypt.unique_identifier &&
      this._data === encrypt.data &&
      this._iv_counter_nonce === encrypt.iv_counter_nonce &&
      this._correlation_value === encrypt.correlation_value &&
      this._authenticated_encryption_additional_data ===
      encrypt.authenticated_encryption_additional_data
    )
  }

  public toString(): string {
    return (
      "{" +
      " unique_identifier='" +
      this._unique_identifier +
      "'" +
      ", data='" +
      this._data +
      "'" +
      ", iv_counter_nonce='" +
      this._iv_counter_nonce +
      "'" +
      ", correlation_value='" +
      this._correlation_value +
      "'" +
      ", authenticated_encryption_additional_data='" +
      this._authenticated_encryption_additional_data +
      "'" +
      "}"
    )
  }
}
