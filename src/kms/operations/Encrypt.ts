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
  private _uniqueIdentifier?: string

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
  private _cryptographicParameters?: CryptographicParameters

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

  /// Initial operation as Boolean
  @metadata({
    name: "InitIndicator",
    type: TtlvType.Boolean,
  })
  private _initIndicator?: boolean

  /// Final operation as Boolean
  @metadata({
    name: "FinalIndicator",
    type: TtlvType.Boolean,
  })
  private _finalIndicator?: boolean

  /// Any additional data to be authenticated via the Authenticated Encryption
  /// Tag. If supplied in multi-part encryption,
  /// this data MUST be supplied on the initial Encrypt request
  @metadata({
    name: "AuthenticatedEncryptionAdditionalData",
    type: TtlvType.ByteString,
  })
  private _authenticatedEncryptionAdditionalData?: Uint8Array

  constructor(
    uniqueIdentifier?: string,
    cryptographicParameters?: CryptographicParameters,
    data?: Uint8Array,
    ivCounterNonce?: Uint8Array,
    correlationValue?: Uint8Array,
    initIndicator?: boolean,
    finalIndicator?: boolean,
    authenticatedEncryptionAdditionalData?: Uint8Array,
  ) {
    this._uniqueIdentifier = uniqueIdentifier
    this._cryptographicParameters = cryptographicParameters
    this._data = data
    this._ivCounterNonce = ivCounterNonce
    this._correlationValue = correlationValue
    this._initIndicator = initIndicator
    this._finalIndicator = finalIndicator
    this._authenticatedEncryptionAdditionalData =
      authenticatedEncryptionAdditionalData
  }

  public get unique_identifier(): string | undefined {
    return this._uniqueIdentifier
  }

  public set unique_identifier(value: string | undefined) {
    this._uniqueIdentifier = value
  }

  public get cryptographic_parameters(): CryptographicParameters | undefined {
    return this._cryptographicParameters
  }

  public set cryptographic_parameters(
    value: CryptographicParameters | undefined,
  ) {
    this._cryptographicParameters = value
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

  public get init_indicator(): boolean | undefined {
    return this._initIndicator
  }

  public set init_indicator(value: boolean | undefined) {
    this._initIndicator = value
  }

  public get final_indicator(): boolean | undefined {
    return this._finalIndicator
  }

  public set final_indicator(value: boolean | undefined) {
    this._finalIndicator = value
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
    if (!(o instanceof Encrypt)) {
      return false
    }
    const encrypt = o
    return (
      this._uniqueIdentifier === encrypt.unique_identifier &&
      this._cryptographicParameters === encrypt.cryptographic_parameters &&
      this._data === encrypt.data &&
      this._ivCounterNonce === encrypt.iv_counter_nonce &&
      this._correlationValue === encrypt.correlation_value &&
      this._initIndicator === encrypt.init_indicator &&
      this._finalIndicator === encrypt.final_indicator &&
      this._authenticatedEncryptionAdditionalData ===
        encrypt.authenticated_encryption_additional_data
    )
  }

  public toString(): string {
    return `{ UniqueIdentifier='${
      this._uniqueIdentifier?.toString() as string
    }', CryptographicParameters='${
      this._cryptographicParameters?.toString() as string
    }', Data='${this._data?.toString() as string}', IvCounterNonce='${
      this._ivCounterNonce?.toString() as string
    }', CorrelationValue='${
      this._correlationValue?.toString() as string
    }', InitIndicator='${
      this._initIndicator?.toString() as string
    }', FinalIndicator='${
      this._finalIndicator?.toString() as string
    }', AuthenticatedEncryptionAdditionalData='${
      this._authenticatedEncryptionAdditionalData?.toString() as string
    }'}`
  }
}
