import { metadata } from "../decorators/function"
import { KmipStruct } from "../json/KmipStruct"
import { TtlvType } from "../serialize/TtlvType"
import { CryptographicParameters } from "../types/CryptographicParameters"

export class Encrypt implements KmipStruct {
  /// The Unique Identifier of the Managed
  /// Cryptographic Object that is the key to
  /// use for the encryption operation. If
  /// omitted, then the ID Placeholder value
  /// SHALL be used by the server as the
  /// Unique Identifier
  @metadata({
    name: "UniqueIdentifier",
    type: TtlvType.TextString,
  })
  private _unique_identifier?: string

  /// The Cryptographic Parameters (Block
  /// Cipher Mode, Padding Method,
  /// RandomIV) corresponding to the
  /// particular encryption method
  /// requested.
  /// If there are no Cryptographic
  /// Parameters associated with the
  /// Managed Cryptographic Object and
  /// the algorithm requires parameters then
  /// the operation SHALL return with a
  /// Result Status of Operation Failed.
  @metadata({
    name: "CryptographicParameters",
    type: TtlvType.Structure,
  })
  private _cryptographic_parameters?: CryptographicParameters

  /// The data to be encrypted
  @metadata({
    name: "Data",
    type: TtlvType.ByteString,
  })
  private _data?: Uint8Array

  /// The initialization vector, counter or
  /// nonce to be used (where appropriate).
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

  /// Initial operation as Boolean
  @metadata({
    name: "InitIndicator",
    type: TtlvType.Boolean,
  })
  private _init_indicator?: boolean

  /// Final operation as Boolean
  @metadata({
    name: "FinalIndicator",
    type: TtlvType.Boolean,
  })
  private _final_indicator?: boolean

  /// Any additional data to be authenticated via the Authenticated Encryption
  /// Tag. If supplied in multi-part encryption,
  /// this data MUST be supplied on the initial Encrypt request
  @metadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _authenticated_encryption_additional_data?: Uint8Array

  constructor(
    unique_identifier?: string,
    cryptographic_parameters?: CryptographicParameters,
    data?: Uint8Array,
    iv_counter_nonce?: Uint8Array,
    correlation_value?: Uint8Array,
    init_indicator?: boolean,
    final_indicator?: boolean,
    authenticated_encryption_additional_data?: Uint8Array
  ) {
    this._unique_identifier = unique_identifier
    this._cryptographic_parameters = cryptographic_parameters
    this._data = data
    this._iv_counter_nonce = iv_counter_nonce
    this._correlation_value = correlation_value
    this._init_indicator = init_indicator
    this._final_indicator = final_indicator
    this._authenticated_encryption_additional_data =
      authenticated_encryption_additional_data
  }

  public get unique_identifier(): string | undefined {
    return this._unique_identifier
  }

  public set unique_identifier(value: string | undefined) {
    this._unique_identifier = value
  }

  public get cryptographic_parameters(): CryptographicParameters | undefined {
    return this._cryptographic_parameters
  }

  public set cryptographic_parameters(
    value: CryptographicParameters | undefined
  ) {
    this._cryptographic_parameters = value
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

  public get init_indicator(): boolean | undefined {
    return this._init_indicator
  }

  public set init_indicator(value: boolean | undefined) {
    this._init_indicator = value
  }

  public get final_indicator(): boolean | undefined {
    return this._final_indicator
  }

  public set final_indicator(value: boolean | undefined) {
    this._final_indicator = value
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
    if (o == this) return true
    if (!(o instanceof Encrypt)) {
      return false
    }
    const encrypt = o
    return (
      this._unique_identifier === encrypt.unique_identifier &&
      this._cryptographic_parameters === encrypt.cryptographic_parameters &&
      this._data === encrypt.data &&
      this._iv_counter_nonce === encrypt.iv_counter_nonce &&
      this._correlation_value === encrypt.correlation_value &&
      this._init_indicator === encrypt.init_indicator &&
      this._final_indicator === encrypt.final_indicator &&
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
      ", cryptographic_parameters='" +
      this._cryptographic_parameters +
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
      ", init_indicator='" +
      this._init_indicator +
      "'" +
      ", final_indicator='" +
      this._final_indicator +
      "'" +
      ", authenticated_encryption_additional_data='" +
      this._authenticated_encryption_additional_data +
      "'" +
      "}"
    )
  }
}
